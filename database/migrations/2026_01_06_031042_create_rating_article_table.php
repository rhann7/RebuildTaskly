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
        Schema::create('rating_article', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->references('id')->on('article')->cascadeOnDelete();
            $table->float('total_rating');
            $table->string('rating_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('top_article');
    }
};
