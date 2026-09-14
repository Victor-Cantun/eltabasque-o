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
                'received_amount' => $receivedAmount,
                'change_amount' => $changeAmount,
                'status' => 'completed',
            ]);

            // Registrar pago en efectivo por defecto
            $sale->payments()->create([
                'user_id' => $user->id,
                'method' => 'cash',
                'amount' => $total,
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
