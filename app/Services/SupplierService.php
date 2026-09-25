<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    /**
     * Crear nuevo proveedor.
     */
    public function create(array $data): Supplier
    {
        return DB::transaction(function () use ($data) {
            return Supplier::create($data);
        });
    }

    /**
     * Actualizar uun proveedor existente.
     */
    public function update(
        Supplier $supplier,
        array $data
    ): Supplier {
        return DB::transaction(function () use ($supplier, $data) {
            $supplier->update($data);
            return $supplier->fresh();
        });
    }
}
