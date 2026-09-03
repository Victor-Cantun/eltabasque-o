<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany; // Agregado para el modelo Inventario

class Branch extends Model
{
    protected $fillable = ['name', 'code', 'address', 'phone', 'email', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('is_primary')->withTimestamps();
        // return $this->hasMany(User::class);
    }

    /** @return BelongsToMany<Mechanic> */
    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(Mechanic::class)->withPivot('is_primary')->withTimestamps();
    }

    public function inventories(): HasMany
    {
        // return $this -> belongsToMany(Inventory::class);
        return $this->hasMany(Inventory::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(
            InventoryMovement::class
        );
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function serviceOrders(): HasMany
    {
        return $this->hasMany(ServiceOrder::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }
}
