<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            /*
            |--------------------------------------------------------------------------
            | Sucursal
            |--------------------------------------------------------------------------
            */
            $table->foreignId('branch_id')->constrained()->restrictOnDelete();
            /*
            |--------------------------------------------------------------------------
            | Producto
            |--------------------------------------------------------------------------
            */
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            /*
            |--------------------------------------------------------------------------
            | Tipo de movimiento
            |--------------------------------------------------------------------------
            |
            | entry       = Entrada
            | exit        = Salida
            | adjustment  = Ajuste
            | transfer_in = Transferencia recibida
            | transfer_out = Transferencia enviada
            | sale        = Venta
            | return      = Devolución
            |
            */
            $table->string('type', 30);
            /*
            |--------------------------------------------------------------------------
            | Cantidad
            |--------------------------------------------------------------------------
            */
            $table->decimal('quantity', 12, 2);
            /*
            |--------------------------------------------------------------------------
            | Stock antes y después del movimiento
            |--------------------------------------------------------------------------
            */
            $table->decimal('stock_before', 12, 2);
            $table->decimal('stock_after', 12, 2);
            /*
            |--------------------------------------------------------------------------
            | Motivo / descripción
            |--------------------------------------------------------------------------
            */
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            /*
            |--------------------------------------------------------------------------
            | Referencia al documento que originó el movimiento
            |--------------------------------------------------------------------------
            |
            | purchase
            | sale
            | service
            | return
            | transfer
            | adjustment
            |
            */
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            /*
            |--------------------------------------------------------------------------
            | Usuario que realizó el movimiento
            |--------------------------------------------------------------------------
            */
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            /*
            |--------------------------------------------------------------------------
            | Índices
            |--------------------------------------------------------------------------
            */
            $table->index(['branch_id', 'product_id']);
            $table->index(['type']);
            $table->index(['reference_type', 'reference_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
