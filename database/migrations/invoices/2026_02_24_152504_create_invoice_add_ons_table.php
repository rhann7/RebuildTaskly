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
        Schema::create('invoice_add_ons', function (Blueprint $table) {
            $table->id();

            $table->string('number')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->foreignId('module_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ticket_proposal_id')->nullable()->constrained()->nullOnDelete();

            $table->string('description');

            $table->decimal('amount', 15, 2);

            $table->string('status');

            $table->string('snap_token')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();

            $table->timestamp('due_date');
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_add_ons');
    }
};
