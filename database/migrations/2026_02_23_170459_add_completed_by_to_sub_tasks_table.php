<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
    {
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->foreignId('completed_by')
                ->nullable()
                ->after('is_completed')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->dropForeign(['completed_by']);
            $table->dropColumn('completed_by');
        });
    }
};
