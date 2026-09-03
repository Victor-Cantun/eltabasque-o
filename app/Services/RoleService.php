<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleService
{
    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {

            $permissions = $data['permissions'] ?? [];

            unset($data['permissions']);

            $role = Role::create($data);

            $role->permissions()->sync($permissions);

            return $role->load('permissions');
        });
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {

            $permissions = $data['permissions'] ?? [];

            unset($data['permissions']);

            $role->update($data);

            $role->permissions()->sync($permissions);

            return $role->fresh()->load('permissions');
        });
    }
}
