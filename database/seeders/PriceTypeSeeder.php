<?php

namespace Database\Seeders;

use App\Models\PriceType;
use Illuminate\Database\Seeder;

class PriceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priceTypes = [
            [
                'name' => 'Público',
                'slug' => 'public',
                'description' => 'Precio de venta al público general',
                'active' => true,
            ],
            [
                'name' => 'Mayoreo',
                'slug' => 'wholesale',
                'description' => 'Precio para clientes mayoristas',
                'active' => true,
            ],
            [
                'name' => 'Mecánico',
                'slug' => 'mechanic',
                'description' => 'Precio especial para mecánicos',
                'active' => true,
            ],
        ];
        foreach ($priceTypes as $priceType) {
            PriceType::updateOrCreate(
                [
                    'slug' => $priceType['slug'],
                ],
                $priceType
            );
        }

    }
}
