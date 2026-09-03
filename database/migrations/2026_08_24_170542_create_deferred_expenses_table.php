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
        Schema::create('deferred_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('description');
            $table->decimal('total_amount', 12, 2);
            $table->decimal('recognized_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('monthly_amount', 12, 2);
            $table->string('status', 30)->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deferred_expenses');
    }
};
