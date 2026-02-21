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

            // Periode (misal: Senin - Minggu)
            $table->date('start_at');
            $table->date('end_at');

            // Status operasional
            // draft: masih diutak-atik user
            // submitted: sudah dikirim ke manager
            // approved: sudah diverifikasi (Verified Status di UI kamu)
            // rejected/revision: butuh perbaikan (Alert/Revision di UI kamu)
            $table->enum('status', ['draft', 'submitted', 'approved', 'revision'])->default('draft');

            $table->decimal('total_hours', 8, 2)->default(0);
            $table->text('notes')->nullable(); // Catatan mingguan jika ada

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

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
