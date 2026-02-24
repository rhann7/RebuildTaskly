<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_proposals', function (Blueprint $table) {
            // Link proposal ke invoice subscription saat ditagih
            $table->foreignId('invoice_id')
                  ->nullable()
                  ->after('ticket_id')
                  ->constrained('invoices')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ticket_proposals', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropColumn('invoice_id');
        });
    }
};
