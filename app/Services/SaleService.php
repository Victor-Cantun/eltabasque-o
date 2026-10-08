<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\SaleItem;
use App\Models\SaleItemRemoval;


class SaleService
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Crea una nueva venta, calcula totales, registra los ítems y descuenta del inventario de la sucursal.
     */
    public function createSale(array $data, User $user): Sale
    {
        // Pre-verificación de stock en la sucursal seleccionada para productos
        foreach ($data['items'] ?? [] as $index => $item) {

            $inventory = Inventory::where('branch_id', $data['branch_id'])
                ->where('product_id', $item['product_id'])
                ->first();

            $availableStock = $inventory ? (float) $inventory->stock : 0.0;

            if ($availableStock < (float) $item['quantity']) {
                $product = Product::find($item['product_id']);
                $name = $product ? $product->name : "ID {$item['product_id']}";
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" => "Stock insuficiente para '{$name}' en la sucursal seleccionada. Disponible: {$availableStock}.",
                ]);
            }
        }

        return DB::transaction(function () use ($data, $user) {
            $branchId = $data['branch_id'];
            $dateStr = now()->format('Ymd');
            $countToday = Sale::where('branch_id', $branchId)
                ->whereDate('created_at', now()->toDateString())
                ->count() + 1;

            $folio = sprintf('VEN-%02d-%s-%04d', $branchId, $dateStr, $countToday);

            $productsTotal = 0;
            $serviceTotal = 0;
            $productItemsToCreate = [];
            $serviceItemsToCreate = [];

            foreach ($data['items'] ?? [] as $item) {
                $product = Product::find($item['product_id']);
                $quantity = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $itemDiscount = (float) ($item['discount'] ?? 0);
                $itemSubtotal = $quantity * $unitPrice;
                $itemTotal = max(0, $itemSubtotal - $itemDiscount);
                $productsTotal += $itemTotal;

                $productItemsToCreate[] = [
                    'product_id' => $item['product_id'],
                    'price_type_id' => $item['price_type_id'] ?? null,
                    'description' => $item['description'] ?? $product?->name,
                    'quantity' => $quantity,
                    'unit_cost' => $product ? (float) $product->cost : 0.0,
                    'unit_price' => $unitPrice,
                    'discount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                ];
            }

            foreach ($data['services'] ?? [] as $service) {
                $quantity = (float) $service['quantity'];
                $unitPrice = (float) $service['unit_price'];
                $serviceDiscount = (float) ($service['discount'] ?? 0);
                $serviceSubtotal = $quantity * $unitPrice;
                $serviceTotalItem = max(0, $serviceSubtotal - $serviceDiscount);
                $serviceTotal += $serviceTotalItem;

                $serviceItemsToCreate[] = [
                    'mechanic_id' => $service['mechanic_id'],
                    'description' => $service['description'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $serviceDiscount,
                    'subtotal' => $serviceSubtotal,
                    'total' => $serviceTotalItem,
                ];
            }

            $subtotal = $productsTotal + $serviceTotal;
            $discount = (float) ($data['discount'] ?? 0);
            $tax = (float) ($data['tax'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);
            $receivedAmount = isset($data['received_amount']) ? (float) $data['received_amount'] : null;
            $changeAmount = $receivedAmount !== null ? max(0, $receivedAmount - $total) : 0.00;

            $isCash = $data['payment_method'] === 'cash';
            $received = $isCash ? (float) $data['received_amount'] : $total;

            $sale = Sale::create([
                'folio' => $folio,
                'branch_id' => $branchId,
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                // 'sale_type' => $data['sale_type'] ?? 'retail',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'service_total' => $serviceTotal,
                'products_total' => $productsTotal,
                //'received_amount' => $receivedAmount,
                //'change_amount' => $changeAmount,
                'received_amount' => $received,
                'change_amount'   => max(0, $received - $total),
                'status' => 'completed',
            ]);

            // Registrar pago en efectivo por defecto
            $sale->payments()->create([
                'user_id' => $user->id,
                //'method' => 'cash',
                'method'=> $data['payment_method'],
                'amount' => $total,
                'reference' => $data['payment_reference'] ?? null,
                'paid_at' => now(),
            ]);

            // foreach ($itemsToCreate as $itemData) {
            foreach ($productItemsToCreate as $itemData) {
                $sale->items()->create($itemData);
                $this->inventoryService->registerMovement([
                    'branch_id' => $branchId,
                    'product_id' => $itemData['product_id'],
                    'type' => InventoryMovement::TYPE_SALE,
                    'quantity' => $itemData['quantity'],
                    'reason' => "Venta Folio {$sale->folio}",
                    'notes' => 'Venta registrada en POS',
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'user_id' => $user->id,
                ]);
            }

            foreach ($serviceItemsToCreate as $serviceData) {
                $sale->serviceItems()->create($serviceData);
            }

            return $sale;
        });
    }

    public function removeItem(Sale $sale, SaleItem $item, User $user, string $reason): Sale
    {
        return DB::transaction(function () use ($sale, $item, $user, $reason) {
            // Bloqueamos la venta para evitar dos cambios simultáneos
            $sale = Sale::whereKey($sale->id)->lockForUpdate()->firstOrFail();
            $oldTotal = (float) $sale->total;
            if ($sale->status !== 'completed') {
                throw ValidationException::withMessages([
                    'reason' => 'Solo se pueden modificar ventas completadas.',
                ]);
            }

            if ($item->sale_id !== $sale->id) {
                abort(404);
            }

            // Si es el único concepto, lo correcto es cancelar la venta completa
            if ($sale->items()->count() + $sale->serviceItems()->count() <= 1) {
                throw ValidationException::withMessages([
                    'reason' => 'Es el único concepto de la venta. Cancela la venta completa.',
                ]);
            }

            $removedTotal = (float) $item->total;

            // 1) Regresar la pieza al inventario de la sucursal de la venta
            if (! empty($item->product_id)) {
                $this->inventoryService->registerMovement([
                    'branch_id' => $sale->branch_id,
                    'product_id' => $item->product_id,
                    'type' => InventoryMovement::TYPE_RETURN,
                    'quantity' => $item->quantity,
                    'reason' => "Producto quitado de la venta Folio {$sale->folio}",
                    'notes' => $reason,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'user_id' => $user->id,
                ]);
            }

            // 2) Bitácora (snapshot del item antes de borrarlo)
            SaleItemRemoval::create([
                'sale_id' => $sale->id,
                'product_id' => $item->product_id,
                'removed_by' => $user->id,
                'quantity' => $item->quantity,
                'unit_cost' => $item->unit_cost,
                'unit_price' => $item->unit_price,
                'total' => $removedTotal,
                'reason' => $reason,
            ]);

            $item->delete();

            // 3) Recalcular totales (descuento e impuesto de la venta se conservan)
            $productsTotal = (float) $sale->items()->sum('total');
            $serviceTotal = (float) $sale->serviceItems()->sum('total');
            //$subtotal = $productsTotal + $serviceTotal;
            //$newTotal = max(0, $subtotal - (float) $sale->discount + (float) $sale->tax);
            $subtotal = $productsTotal + $serviceTotal;
            $discount = min((float) $sale->discount, $subtotal);
            $newTotal = max(0, $subtotal - $discount + (float) $sale->tax);

            $difference = round($oldTotal - $newTotal, 2);

            $newReceived = $sale->received_amount !== null
                ? max(0, (float) $sale->received_amount - $difference)
                : null;

            

            $sale->update([
                'products_total' => $productsTotal,
                'service_total' => $serviceTotal,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $newTotal,
                'received_amount' => $newReceived,
                'change_amount' => $newReceived !== null
                    ? max(0, $newReceived - $newTotal)
                    : $sale->change_amount,
            ]);

            // 4) Descontar la diferencia de los pagos, empezando por el más reciente
            $remaining = $difference;

            foreach ($sale->payments()->orderByDesc('id')->lockForUpdate()->get() as $payment) {
                if ($remaining <= 0) {
                    break;
                }

                $deduct = min($remaining, (float) $payment->amount);

                $payment->update([
                    'amount' => round((float) $payment->amount - $deduct, 2),
                ]);

                $remaining = round($remaining - $deduct, 2);
            }

            return $sale;
        });
    }

    /**
     * Cancela una venta registrada y revierte los movimientos de inventario en la sucursal.
     */
    public function cancelSale(Sale $sale, User $user, string $reason): Sale
    {
        if ($sale->status === 'cancelled') {
            throw new Exception('La venta ya se encuentra cancelada.');
        }

        return DB::transaction(function () use ($sale, $user, $reason) {
            $sale->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $user->id,
                'cancellation_reason' => $reason,
            ]);

            $sale->loadMissing('items');

            foreach ($sale->items as $item) {
                // Registrar devolución de inventario únicamente para productos
                if (! empty($item->product_id)) {
                    $this->inventoryService->registerMovement([
                        'branch_id' => $sale->branch_id,
                        'product_id' => $item->product_id,
                        'type' => InventoryMovement::TYPE_RETURN,
                        'quantity' => $item->quantity,
                        'reason' => "Cancelación Venta Folio {$sale->folio}",
                        'notes' => $reason,
                        'reference_type' => 'sale',
                        'reference_id' => $sale->id,
                        'user_id' => $user->id,
                    ]);
                }
            }

            return $sale;
        });
    }
}
