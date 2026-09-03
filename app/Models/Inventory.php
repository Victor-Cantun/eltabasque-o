<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'product_id',
        'stock',
        'minimum_stock',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
        ];
    }

    /**
     * Sucursal a la que pertenece este inventario.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Producto al que pertenece este inventario.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /* public function prices():belongsTo{
        return $this->belongsTo(ProductPrice::class);
    } */

}
