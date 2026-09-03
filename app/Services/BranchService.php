<?php

namespace App\Services;

use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class BranchService
{
    /**
     * Crear una nueva sucursal.
     */
    public function create(array $data): Branch
    {
        return DB::transaction(function () use ($data) {

            return Branch::create($data);

        });
    }

    /**
     * Actualizar una sucursal existente.
     */
    public function update(
        Branch $branch,
        array $data
    ): Branch {
        return DB::transaction(function () use ($branch, $data) {

            $branch->update($data);

            return $branch->fresh();
        });
    }

    /**
     * Activar o desactivar una sucursal.
     */
    public function toggleActive(Branch $branch): Branch
    {
        return DB::transaction(function () use ($branch) {

            $branch->update([
                'active' => ! $branch->active,
            ]);

            return $branch->fresh();
        });
    }
}
