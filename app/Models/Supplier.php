<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'business_name',
        'rfc',
        'contact_name',
        'phone',
        'email',
        'address',
        'active',
    ];

    protected $casts = ['active' => 'boolean',];
}
