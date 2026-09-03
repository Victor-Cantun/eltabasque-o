<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'internal_code',
        'original_code',
        'name',
        'description',
        'category_id',
        'brand_id',
        'image',
        'cost',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(
            InventoryMovement::class
        );
    }

    public function compatibilities()
    {
        return $this->hasMany(ProductCompatibility::class);
    }

    public function branch(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
