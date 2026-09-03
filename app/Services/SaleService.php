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
        foreach ($data['items'] as $index => $item) {
            if (empty($item['product_id'])) {
                continue; // Los servicios no requieren verificación de inventario
            }

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

            // Calcular totales de los ítems
            $subtotal = 0;
            $serviceTotal = 0;
            $productsTotal = 0;
            $itemsToCreate = [];

            foreach ($data['items'] as $item) {
                $isService = empty($item['product_id']) || (($item['item_type'] ?? '') === 'service');
                $itemType = $isService ? 'service' : 'product';
                $productId = ! $isService && ! empty($item['product_id']) ? $item['product_id'] : null;
                $mechanicId = $isService && ! empty($item['mechanic_id']) ? $item['mechanic_id'] : null;

                $product = $productId ? Product::find($productId) : null;
                $quantity = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $itemDiscount = (float) ($item['discount'] ?? 0);
                $itemSubtotal = $quantity * $unitPrice;
                $itemTotal = max(0, $itemSubtotal - $itemDiscount);

                $subtotal += $itemTotal;

                if ($isService) {
                    $serviceTotal += $itemTotal;
                } else {
                    $productsTotal += $itemTotal;
                }

                $itemsToCreate[] = [
                    'product_id' => $productId,
                    'item_type' => $itemType,
                    'mechanic_id' => $mechanicId,
                    'price_type_id' => $item['price_type_id'] ?? null,
                    'description' => $item['description'] ?? ($product ? $product->name : 'Servicio / Mano de Obra'),
                    'quantity' => $quantity,
                    'unit_cost' => $product ? (float) $product->cost : 0.0,
                    'unit_price' => $unitPrice,
                    'discount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                ];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $tax = (float) ($data['tax'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);

            $sale = Sale::create([
                'folio' => $folio,
                'branch_id' => $branchId,
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                'sale_type' => $data['sale_type'] ?? 'retail',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'service_total' => $serviceTotal,
                'products_total' => $productsTotal,
                'status' => 'completed',
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);

                // Descontar inventario de la sucursal únicamente para productos
                if ($itemData['item_type'] === 'product' && ! empty($itemData['product_id'])) {
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
