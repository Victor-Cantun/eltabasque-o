<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            'NGK',
            'DID',
            'Motul',
            'Castrol',
            'Michelin',
            'Pirelli',
            'Bridgestone',
            'Bosch',
            'RK',
            'Yuasa',
            'K&N',
            'Koso',
        ];
        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                [
                    'slug' => Str::slug($brand),
                ],
                [
                    'name' => $brand,
                    'active' => true,
                ]
            );
        }
    }
}
