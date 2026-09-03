<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {

            if (isset($data['image'])) {
                $data['image'] = $this->storeImage(
                    $data['image']
                );
            }

            $prices = $data['prices'];

            unset($data['prices']);

            $product = Product::create($data);

            foreach ($prices as $price) {
                $product->prices()->create([
                    'price_type_id' => $price['price_type_id'],
                    'price' => $price['price'],
                ]);
            }

            return $product;
        });
    }

    public function update(
        Product $product,
        array $data
    ): Product {
        return DB::transaction(function () use ($product, $data) {

            if (isset($data['image'])) {

                if ($product->image) {
                    Storage::disk('public')
                        ->delete($product->image);
                }

                $data['image'] = $this->storeImage(
                    $data['image']
                );
            }

            $prices = $data['prices'];

            unset($data['prices']);

            $product->update($data);

            foreach ($prices as $price) {

                $product->prices()->updateOrCreate(
                    [
                        'price_type_id' => $price['price_type_id'],
                    ],
                    [
                        'price' => $price['price'],
                    ]
                );
            }

            return $product->fresh(
                'prices.priceType'
            );
        });
    }

    private function storeImage(
        UploadedFile $image
    ): string {
        return $image->store(
            'products',
            'public'
        );
    }
}
