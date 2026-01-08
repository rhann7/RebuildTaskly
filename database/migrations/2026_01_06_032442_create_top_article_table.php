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
        Schema::create('top_article', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rating_article_id')->references('id')->on('rating_article')->cascadeOnDelete();
            $table->float('percentage_of_trending_search');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rating_article');
    }
};
