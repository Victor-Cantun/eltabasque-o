<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'item_type',
        'mechanic_id',
        'price_type_id',
        'description',
        'quantity',
        'unit_cost',
        'unit_price',
        'discount',
        'subtotal',
        'total',
        'returned_quantity',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'returned_quantity' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(Mechanic::class);
    }

    public function priceType()
    {
        return $this->belongsTo(PriceType::class);
    }

    public function returns()
    {
        return $this->hasMany(SaleReturnItem::class);
    }
}
