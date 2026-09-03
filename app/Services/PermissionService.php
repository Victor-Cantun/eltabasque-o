<?php

namespace App\Services;

use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class PermissionService
{
    /**
     * Crear una nueva sucursal.
     */
    public function create(array $data): Permission
    {
        return DB::transaction(function () use ($data) {

            return Permission::create($data);

        });
    }

    /**
     * Actualizar una sucursal existente.
     */
    public function update(
        Permission $Permission,
        array $data
    ): Permission {
        return DB::transaction(function () use ($Permission, $data) {

            $Permission->update($data);

            return $Permission->fresh();
        });
    }
}
