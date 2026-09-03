<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $permissions = [
            // Dashboard
            [
                'name' => 'Ver dashboard',
                'slug' => 'dashboard.view',
                'module' => 'dashboard',
            ],
            // Usuarios
            [
                'name' => 'Ver usuarios',
                'slug' => 'users.view',
                'module' => 'users',
            ],
            [
                'name' => 'Crear usuarios',
                'slug' => 'users.create',
                'module' => 'users',
            ],
            [
                'name' => 'Editar usuarios',
                'slug' => 'users.update',
                'module' => 'users',
            ],
            [
                'name' => 'Eliminar usuarios',
                'slug' => 'users.delete',
                'module' => 'users',
            ],
            // Sucursales
            [
                'name' => 'Ver sucursales',
                'slug' => 'branches.view',
                'module' => 'branches',
            ],
            [
                'name' => 'Crear sucursales',
                'slug' => 'branches.create',
                'module' => 'branches',
            ],
            [
                'name' => 'Editar sucursales',
                'slug' => 'branches.update',
                'module' => 'branches',
            ],
            [
                'name' => 'Eliminar sucursales',
                'slug' => 'branches.delete',
                'module' => 'branches',
            ],
            // Mecanicos
            [
                'name' => 'Ver mecanicos',
                'slug' => 'mechanics.view',
                'module' => 'mechanics',
            ],
            [
                'name' => 'Crear mecanicos',
                'slug' => 'mechanics.create',
                'module' => 'mechanics',
            ],
            [
                'name' => 'Editar mecanicos',
                'slug' => 'mechanics.update',
                'module' => 'mechanics',
            ],
            [
                'name' => 'Eliminar mecanicos',
                'slug' => 'mechanics.delete',
                'module' => 'mechanics',
            ],
            // Productos
            [
                'name' => 'Ver productos',
                'slug' => 'products.view',
                'module' => 'products',
            ],
            [
                'name' => 'Crear productos',
                'slug' => 'products.create',
                'module' => 'products',
            ],
            [
                'name' => 'Editar productos',
                'slug' => 'products.update',
                'module' => 'products',
            ],
            [
                'name' => 'Eliminar productos',
                'slug' => 'products.delete',
                'module' => 'products',
            ],
            // Inventario
            [
                'name' => 'Ver inventario',
                'slug' => 'inventory.view',
                'module' => 'inventory',
            ],
            [
                'name' => 'Ajustar inventario',
                'slug' => 'inventory.adjust',
                'module' => 'inventory',
            ],
            [
                'name' => 'Transferir inventario',
                'slug' => 'inventory.transfer',
                'module' => 'inventory',
            ],
            [
                'name' => 'Editar el minimo del stock',
                'slug' => 'inventory.edit-minimum-stock',
                'module' => 'inventory',
            ],
            [
                'name' => 'Ver movimientos de inventario',
                'slug' => 'inventory-movements.view',
                'module' => 'inventory',
            ],
            [
                'name' => 'Registrar movimiento de inventario',
                'slug' => 'inventory-movements.create',
                'module' => 'inventory',
            ],

            // Ventas
            [
                'name' => 'Ver ventas',
                'slug' => 'sales.view',
                'module' => 'sales',
            ],
            [
                'name' => 'Crear ventas',
                'slug' => 'sales.create',
                'module' => 'sales',
            ],
            [
                'name' => 'Cancelar ventas',
                'slug' => 'sales.cancel',
                'module' => 'sales',
            ],
            [
                'name' => 'Realizar devoluciones',
                'slug' => 'sales.return',
                'module' => 'sales',
            ],

            // Servicios
            [
                'name' => 'Ver servicios',
                'slug' => 'services.view',
                'module' => 'services',
            ],
            [
                'name' => 'Crear servicios',
                'slug' => 'services.create',
                'module' => 'services',
            ],
            [
                'name' => 'Editar servicios',
                'slug' => 'services.update',
                'module' => 'services',
            ],
            [
                'name' => 'Cobrar servicios',
                'slug' => 'services.charge',
                'module' => 'services',
            ],

            // Gastos
            [
                'name' => 'Ver gastos',
                'slug' => 'expenses.view',
                'module' => 'expenses',
            ],
            [
                'name' => 'Crear gastos',
                'slug' => 'expenses.create',
                'module' => 'expenses',
            ],
            [
                'name' => 'Editar gastos',
                'slug' => 'expenses.update',
                'module' => 'expenses',
            ],
            [
                'name' => 'Eliminar gastos',
                'slug' => 'expenses.delete',
                'module' => 'expenses',
            ],

            // Reportes
            [
                'name' => 'Ver reportes',
                'slug' => 'reports.view',
                'module' => 'reports',
            ],

            // Roles y permisos
            [
                'name' => 'Administrar roles',
                'slug' => 'roles.manage',
                'module' => 'roles',
            ],
            [
                'name' => 'Ver roles',
                'slug' => 'roles.view',
                'module' => 'roles',
            ],
            [
                'name' => 'Crear roles',
                'slug' => 'roles.crear',
                'module' => 'roles',
            ],
            [
                'name' => 'Editar roles',
                'slug' => 'roles.edit',
                'module' => 'roles',
            ],
            [
                'name' => 'Eliminar roles',
                'slug' => 'roles.delete',
                'module' => 'roles',
            ],
            [
                'name' => 'Administrar permisos',
                'slug' => 'permissions.manage',
                'module' => 'permissions',
            ],
            [
                'name' => 'Ver permisos',
                'slug' => 'permissions.view',
                'module' => 'permissions',
            ],
            [
                'name' => 'Crear permisos',
                'slug' => 'permissions.create',
                'module' => 'permissions',
            ],
            [
                'name' => 'Editar permisos',
                'slug' => 'permissions.edit',
                'module' => 'permissions',
            ],
            [
                'name' => 'Eliminar permisos',
                'slug' => 'permissions.delete',
                'module' => 'permissions',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                [
                    'slug' => $permission['slug'],
                ],
                $permission
            );
        }
    }
}
