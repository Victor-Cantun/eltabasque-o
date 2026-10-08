<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
// app/Models/SaleItemRemoval.php
class SaleItemRemoval extends Model
{
    protected $fillable = [
        'sale_id', 'product_id', 'removed_by',
        'quantity', 'unit_cost', 'unit_price', 'total', 'reason',
    ];
}