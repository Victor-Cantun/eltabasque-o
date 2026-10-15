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

    
    public function scopeSearch($query, ?string $search)
    {
        $search = trim((string) $search);
        if ($search === '') {
            return $query;
        }

        $isPg = $query->getConnection()->getDriverName() === 'pgsql';
        $operator = $isPg ? 'ilike' : 'like';

        // Palabras vacías que casi nunca están en el nombre del producto
        $stopwords = ['de', 'del', 'la', 'el', 'los', 'las', 'para', 'por', 'con', 'y', 'en', 'a'];

        $words = preg_split('/\s+/u', $search, -1, PREG_SPLIT_NO_EMPTY);
        $words = array_values(array_filter(
            $words,
            fn ($w) => !in_array(mb_strtolower($w), $stopwords, true)
        ));

        // Si todo eran stopwords, usa las palabras originales
        if (empty($words)) {
            $words = preg_split('/\s+/u', $search, -1, PREG_SPLIT_NO_EMPTY);
        }

        foreach ($words as $word) {
            $term = '%' . addcslashes($word, '%_\\') . '%';

            $query->where(function ($q) use ($term, $operator, $isPg) {
                if ($isPg) {
                    // Requiere: CREATE EXTENSION IF NOT EXISTS unaccent;
                    $q->whereRaw('unaccent(name) ilike unaccent(?)', [$term])
                    ->orWhereRaw('unaccent(internal_code) ilike unaccent(?)', [$term])
                    ->orWhereRaw('unaccent(original_code) ilike unaccent(?)', [$term]);
                } else {
                    $q->where('name', $operator, $term)
                    ->orWhere('internal_code', $operator, $term)
                    ->orWhere('original_code', $operator, $term);
                }
            });
        }

        return $query;
    }
}
