<?php

namespace App\Models;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Model;


class Payment extends Model
{

    protected $fillable = [
        'sale_id',
        'user_id',
        'method',
        'amount',
        'reference',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'method_label',
    ];

    public function getMethodLabelAttribute(): string
    {
        return PaymentMethod::from($this->method)->label();
    }
 
}



