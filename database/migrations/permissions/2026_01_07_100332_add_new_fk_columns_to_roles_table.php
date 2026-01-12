<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('workspace_id')->nullable()->after('company_id')->constrained('workspaces')->cascadeOnDelete();

            $table->dropUnique(['name', 'guard_name']);
            $table->unique(['name', 'guard_name', 'company_id', 'workspace_id']);
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['workspace_id']);
            $table->dropColumn(['company_id', 'workspace_id']);

            $table->unique(['name', 'guard_name']);
        });
    }
};