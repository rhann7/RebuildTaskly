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
    // USERS
    Schema::table('users', function (Blueprint $table) {
        if (Schema::hasColumn('users', 'company_id')) {
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');
        }
    });

    Schema::table('users', function (Blueprint $table) {
        $table->foreignId('company_id')
            ->nullable()
            ->after('id')
            ->constrained()
            ->onDelete('cascade');
    });

    // WORKSPACES
    Schema::table('workspaces', function (Blueprint $table) {
        if (Schema::hasColumn('workspaces', 'manager_id')) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn('manager_id');
        }
    });

    Schema::table('workspaces', function (Blueprint $table) {
        $table->foreignId('manager_id')
            ->nullable()
            ->after('company_id')
            ->constrained('users')
            ->onDelete('set null');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
