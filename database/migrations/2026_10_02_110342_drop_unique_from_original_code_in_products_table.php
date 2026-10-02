<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['original_code']); // products_original_code_unique
            $table->index('original_code');        // índice normal para búsquedas
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['original_code']);
            // No se vuelve a agregar el unique: fallaría si ya hay códigos repetidos
        });
    }
};