<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->string('route_path')->after('scope')->nullable();
            $table->string('route_name')->after('route_path')->nullable();
            $table->string('controller_action')->after('route_name')->nullable();
            $table->string('icon')->after('controller_action')->nullable();
            $table->boolean('isMenu')->default(false)->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['route_path', 'route_name', 'controller_action', 'icon', 'isMenu']);
        });
    }
};