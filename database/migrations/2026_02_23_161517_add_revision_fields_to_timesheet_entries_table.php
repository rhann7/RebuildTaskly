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
        Schema::table('timesheet_entries', function (Blueprint $table) {
            // Tambahkan 2 kolom baru setelah kolom 'hours'
            $table->string('status')->default('draft')->after('hours');
            $table->text('reject_reason')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheet_entries', function (Blueprint $table) {
            //
        });
    }
};
