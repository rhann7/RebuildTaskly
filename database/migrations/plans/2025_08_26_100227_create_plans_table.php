<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 15, 2)->nullable();
            $table->decimal('price_yearly', 15, 2)->nullable();
            $table->integer('discount_monthly_percent')->default(0)->nullable();
            $table->integer('discount_yearly_percent')->default(0)->nullable();
            $table->boolean('is_free')->default(false);
            $table->boolean('is_yearly')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};