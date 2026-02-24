<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_user', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke Workspace
            $table->foreignId('workspace_id')
                  ->constrained()
                  ->cascadeOnDelete(); 
            
            // Relasi ke User
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete(); 

            // Tambahan kolom role di level workspace (optional tapi berguna)
            // Misal: di workspace ini dia cuma 'viewer' atau 'editor'
            $table->string('workspace_role')->default('member');
            
            $table->timestamps();

            // UNIQUE CONSTRAINT (PENTING!)
            // Biar satu user nggak bisa di-invite dua kali ke workspace yang sama
            $table->unique(['workspace_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_user');
    }
};