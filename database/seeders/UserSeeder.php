<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            [
                'email' => 'victor@cantun.com',
            ],
            [
                'name' => 'Administrador',
                'password' => Hash::make('C4ntun26'),
            ]
        );

        $manager = User::updateOrCreate(
            [
                'email' => 'bernabe@cantun.com',
            ],
            [
                'name' => 'Gerente Sucursal',
                'password' => Hash::make('C4ntun26'),
            ]
        );
        $seller = User::updateOrCreate(
            [
                'email' => 'marcos@cantun.com',
            ],
            [
                'name' => 'Vendedor',
                'password' => Hash::make('C4ntun26'),
            ]
        );

        // Obtener roles
        $adminRole = Role::where('slug', 'administrator')->firstOrFail();
        $managerRole = Role::where('slug', 'manager')->firstOrFail();
        $sellerRole = Role::where('slug', 'seller')->firstOrFail();
        // $mechanicRole = Role::where('slug', 'mechanic')->firstOrFail();

        // Asignar roles
        $admin->roles()->sync([$adminRole->id]);
        $manager->roles()->sync([$managerRole->id]);
        $seller->roles()->sync([$sellerRole->id]);
        // $mechanic->roles()->sync([$mechanicRole->id]);

        // Obtener sucursales
        $centerBranch = Branch::where('code', '24350')->firstOrFail();
        $northBranch = Branch::where('code', '24300')->firstOrFail();

        // Asignar sucursales
        $admin->branches()->sync([
            $centerBranch->id => [
                'is_primary' => true,
            ],
            $northBranch->id => [
                'is_primary' => false,
            ],
        ]);

        $manager->branches()->sync([
            $centerBranch->id => [
                'is_primary' => true,
            ],
        ]);

        $seller->branches()->sync([
            $centerBranch->id => [
                'is_primary' => true,
            ],
        ]);

    }
}
