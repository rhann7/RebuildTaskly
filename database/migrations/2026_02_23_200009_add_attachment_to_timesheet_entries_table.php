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
        Schema::table('timesheet_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('timesheet_entries', 'attachment')) {
                $table->string('attachment')->nullable()->after('description');
            }
        });
    }

    public function down()
    {
        Schema::table('timesheet_entries', function (Blueprint $table) {
            $table->dropColumn('attachment');
        });
    }
};
