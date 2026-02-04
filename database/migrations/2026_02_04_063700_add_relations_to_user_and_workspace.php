<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up()
    {
        // 1. User harus tau dia kerja di Company mana
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // 2. Workspace harus tau siapa Manajernya (Sesuai matriks: 1 Workspace = 1 Manager)
        Schema::table('workspaces', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('company_id')->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_and_workspace', function (Blueprint $table) {
            //
        });
    }
};
