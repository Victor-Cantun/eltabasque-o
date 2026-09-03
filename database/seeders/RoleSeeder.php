<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::updateOrCreate(
            [
                'slug' => 'administrator',
            ],
            [
                'name' => 'Administrador',
                'description' => 'Acceso completo al sistema',
                'active' => true,
            ]
        );
        $manager = Role::updateOrCreate(
            [
                'slug' => 'manager',
            ],
            [
                'name' => 'Gerente',
                'description' => 'Administración de sucursal',
                'active' => true,
            ]
        );

        $seller = Role::updateOrCreate(
            [
                'slug' => 'seller',
            ],
            [
                'name' => 'Vendedor',
                'description' => 'Ventas y consulta de inventario',
                'active' => true,
            ]
        );

        // Administrador: todos los permisos
        $admin->permissions()->sync(
            Permission::pluck('id')->toArray()
        );

        // Gerente
        $managerPermissions = Permission::whereIn(
            'slug',
            [
                'dashboard.view',

                'products.view',
                'products.create',
                'products.update',

                'inventory.view',
                'inventory.adjust',
                'inventory.transfer',

                'sales.view',
                'sales.create',
                'sales.cancel',
                'sales.return',

                'services.view',
                'services.create',
                'services.update',
                'services.charge',

                'expenses.view',
                'expenses.create',
                'expenses.update',

                'reports.view',
            ]
        )->pluck('id');

        $manager->permissions()->sync(
            $managerPermissions
        );

        // Vendedor
        $sellerPermissions = Permission::whereIn(
            'slug',
            [
                'products.view',
                'products.create',
                'products.update',

                'inventory.view',
                'inventory.adjust',
                'inventory.transfer',
                'inventory.edit-minimum-stock',

                'inventory-movements.view',
                'inventory-movements.create',

                'sales.view',
                'sales.create',
            ]
        )->pluck('id');

        $seller->permissions()->sync(
            $sellerPermissions
        );

    }
}
