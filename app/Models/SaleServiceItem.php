<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleServiceItem extends Model
{
    protected $table = 'sale_services';

    protected $fillable = [
        'sale_id', 'mechanic_id', 'description',
        'quantity', 'unit_price', 'discount', 'subtotal', 'total',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(Mechanic::class);
    }
}
