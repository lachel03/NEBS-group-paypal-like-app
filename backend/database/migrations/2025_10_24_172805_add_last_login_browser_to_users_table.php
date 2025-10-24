<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add only if it doesn't exist (safe for re-runs)
            if (! Schema::hasColumn('users', 'last_login_browser')) {
                $table->string('last_login_browser')->nullable()->after('last_login_ip');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'last_login_browser')) {
                $table->dropColumn('last_login_browser');
            }
        });
    }
};
