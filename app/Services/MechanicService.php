<?php

namespace App\Services;

use App\Models\Mechanic;
use Illuminate\Support\Facades\DB;

class MechanicService
{
    /**
     * Crear mecanico
     */
    public function create(array $data): Mechanic
    {
        return DB::transaction(function () use ($data) {
            $branches = $data['branches'] ?? [];
            $primaryBranchId = $data['primary_branch_id'] ?? null;

            unset($data['branches'], $data['primary_branch_id']);

            $mechanic = Mechanic::create($data);

            if (! empty($branches)) {
                $branchData = [];
                foreach ($branches as $branchId) {
                    $branchData[$branchId] = [
                        'is_primary' => (int) $branchId === (int) $primaryBranchId,
                    ];
                }
                $mechanic->branches()->sync($branchData);
            }

            return $mechanic->load('branches');
        });
    }

    /**
     * Actualizar un mecanico existente.
     */
    public function update(Mechanic $mechanic, array $data): Mechanic
    {
        return DB::transaction(function () use ($mechanic, $data) {
            $branches = $data['branches'] ?? null;
            $primaryBranchId = $data['primary_branch_id'] ?? null;

            unset($data['branches'], $data['primary_branch_id']);

            $mechanic->update($data);

            if ($branches !== null) {
                $branchData = [];
                foreach ($branches as $branchId) {
                    $branchData[$branchId] = [
                        'is_primary' => (int) $branchId === (int) $primaryBranchId,
                    ];
                }
                $mechanic->branches()->sync($branchData);
            }

            return $mechanic->fresh(['branches']);
        });
    }

    /**
     * Activar o desactivar una sucursal.
     */
    public function toggleActive(Mechanic $mechanic): Mechanic
    {
        return DB::transaction(function () use ($mechanic) {

            $mechanic->update([
                'active' => ! $mechanic->active,
            ]);

            return $mechanic->fresh();
        });
    }
}
