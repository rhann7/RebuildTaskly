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
        // Cek dulu, kalau kolomnya BELUM ada, baru buat.
        if (!Schema::hasColumn('sub_tasks', 'completed_by')) {
            Schema::table('sub_tasks', function (Blueprint $table) {
                $table->bigInteger('completed_by')->unsigned()->nullable()->after('is_completed');
            });
        }
    }

    public function down()
    {
        Schema::table('sub_tasks', function (Blueprint $table) {
            $table->dropForeign(['completed_by']);
            $table->dropColumn('completed_by');
        });
    }
};
