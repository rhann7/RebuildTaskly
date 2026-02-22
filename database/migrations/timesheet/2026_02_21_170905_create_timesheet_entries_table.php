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
        Schema::create('timesheet_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timesheet_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('project_id')->constrained();
            $table->foreignId('task_id')->constrained();
            $table->foreignId('sub_task_id')->nullable()->constrained(); // Sub-task/Objective

            $table->date('date'); // Hari kerja (misal: 2026-02-04)
            $table->time('start_at'); // Jam mulai (09:00)
            $table->time('end_at');   // Jam selesai (11:30)
            $table->decimal('hours', 5, 2); // Durasi otomatis (2.5)

            $table->text('description'); // Note per task (Transmission log)
            $table->boolean('is_billable')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheet_entries');
    }
};
