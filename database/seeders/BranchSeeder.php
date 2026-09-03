<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            [
                'name' => 'Sucursal Escarcega',
                'code' => '24350',
                'address' => 'Hector perez Martinez',
                'phone' => '9810000001',
                'email' => 'centro@eltabasqueno.com',
                'active' => true,
            ],
            [
                'name' => 'Sucursal Sabancuy',
                'code' => '24300',
                'address' => 'Col. Playa',
                'phone' => '9810000002',
                'email' => 'sabancuy@eltabasqueno.com',
                'active' => true,
            ],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(
                [
                    'code' => $branch['code'],
                ],
                $branch
            );
        }
    }
}
