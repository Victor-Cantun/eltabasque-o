<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class InventoryService
{
    /**
     * Registra un movimiento de inventario y actualiza el stock de forma atómica.
     */
    public function registerMovement(array $data): InventoryMovement
    {
        return DB::transaction(function () use ($data) {

            $inventory = Inventory::firstOrCreate(
                [
                    'branch_id' => $data['branch_id'],
                    'product_id' => $data['product_id'],
                ],
                [
                    'stock' => 0,
                    'minimum_stock' => 0,
                ]
            );

            // Bloqueamos la fila para evitar condiciones de carrera
            // si dos movimientos llegan casi al mismo tiempo.
            $inventory = Inventory::where('id', $inventory->id)
                ->lockForUpdate()
                ->first();

            $stockBefore = $inventory->stock;
            $quantity = $data['quantity'];

            $stockAfter = match ($data['type']) {
                InventoryMovement::TYPE_ENTRY,
                InventoryMovement::TYPE_TRANSFER_IN,
                InventoryMovement::TYPE_RETURN => $stockBefore + $quantity,

                InventoryMovement::TYPE_EXIT,
                InventoryMovement::TYPE_TRANSFER_OUT,
                InventoryMovement::TYPE_SALE => $stockBefore - $quantity,

                // En un ajuste, "quantity" representa el nuevo stock absoluto,
                // no una cantidad a sumar/restar.
                InventoryMovement::TYPE_ADJUSTMENT => $quantity,

                default => throw new InvalidArgumentException(
                    "Tipo de movimiento no soportado: {$data['type']}"
                ),
            };

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'El stock resultante no puede ser negativo. Stock actual: '.$stockBefore,
                ]);
            }

            $inventory->update(['stock' => $stockAfter]);

            return InventoryMovement::create([
                'branch_id' => $data['branch_id'],
                'product_id' => $data['product_id'],
                'type' => $data['type'],
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id' => $data['reference_id'] ?? null,
                'user_id' => $data['user_id'] ?? auth()->id(),
            ]);
        });
    }

    /**
     * Actualiza únicamente el umbral de stock mínimo.
     */
    public function updateMinimumStock(Inventory $inventory, array $data): Inventory
    {
        $inventory->update([
            'minimum_stock' => $data['minimum_stock'],
        ]);

        return $inventory->fresh();
    }
}
