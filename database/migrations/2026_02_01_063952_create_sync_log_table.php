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
        Schema::create('article_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('pdf_file');
            $table->string('pdf_path');
            $table->integer('total_articles');
            $table->integer('text_length');
            $table->integer('vector_memories_count')->nullable();
            $table->string('status')->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_log');
    }
};
