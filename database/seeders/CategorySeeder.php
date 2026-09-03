<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Motor',
            'Transmisión',
            'Sistema de Frenos',
            'Suspensión',
            'Sistema Eléctrico',
            'Sistema de Combustible',
            'Lubricantes',
            'Llantas',
            'Accesorios',
            'Carrocería',
            'Herramientas',
            'Consumibles',
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                [
                    'slug' => Str::slug($category),
                ],
                [
                    'name' => $category,
                    'active' => true,
                ]
            );
        }
    }
}
