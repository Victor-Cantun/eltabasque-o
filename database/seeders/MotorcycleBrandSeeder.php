<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MotorcycleBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            'Honda',
            'Yamaha',
            'Suzuki',
            'Italika',
            'Kawasaki',
            'Bajaj',
            'Vento',
            'TVS',
            'BMW',
            'KTM',
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
