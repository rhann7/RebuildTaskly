<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_owner_id')->constrained('company_owners')->cascadeOnDelete();
            $table->foreignId('company_category_id')->nullable()->constrained('company_categories')->nullOnDelete();

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->unique();

            $table->string('phone', 20)->nullable();
            $table->string('logo', 2048)->nullable();
            $table->text('address')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};