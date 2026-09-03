<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    /**
     * Tipos de movimientos.
     */
    public const TYPE_ENTRY = 'entry';

    public const TYPE_EXIT = 'exit';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public const TYPE_TRANSFER_IN = 'transfer_in';

    public const TYPE_TRANSFER_OUT = 'transfer_out';

    public const TYPE_SALE = 'sale';

    public const TYPE_RETURN = 'return';

    /**
     * Campos asignables.
     */
    protected $fillable = [
        'branch_id',
        'product_id',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'reason',
        'notes',
        'reference_type',
        'reference_id',
        'user_id',
    ];

    /**
     * Conversiones de tipos.
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',

            'stock_before' => 'decimal:2',

            'stock_after' => 'decimal:2',
        ];
    }

    /**
     * Sucursal donde ocurrió el movimiento.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(
            Branch::class
        );
    }

    /**
     * Producto afectado.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class
        );
    }

    /**
     * Usuario que realizó el movimiento.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}
