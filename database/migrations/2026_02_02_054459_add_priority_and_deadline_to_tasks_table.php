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
            Schema::table('tasks', function (Blueprint $table) {
                // Gunakan change() jika ingin mengubah tipe data description (opsional)
                // $table->text('description')->nullable()->change(); 

                $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->after('status');
                $table->date('due_date')->nullable()->after('priority');

                // Tambah index biar filter kenceng
                $table->index(['project_id', 'priority']);
            });
        }

public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'priority']);
            $table->dropColumn(['priority', 'due_date']);
        });
    }
};
