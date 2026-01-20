<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();

            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspaces');
    }
};