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
        Schema::table('sale_items', function (Blueprint $table) {
            $table->string('item_type', 20)->default('product')->after('sale_id');
            $table->foreignId('mechanic_id')->nullable()->after('item_type')->constrained('mechanics')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['mechanic_id']);
            $table->dropColumn(['item_type', 'mechanic_id']);
        });
    }
};
