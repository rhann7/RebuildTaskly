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
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            // Bisa pilih Task utama atau Sub-Task
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('sub_task_id')->nullable()->constrained()->onDelete('cascade');

            $table->string('note'); // Apa yang dikerjakan
            $table->dateTime('start_at'); // Jam mulai
            $table->dateTime('end_at');   // Jam selesai
            $table->integer('duration_minutes')->nullable(); // Kalkulasi otomatis nanti
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
