<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('users', 'password_reset_required')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('password_reset_required')->default(false)->after('email_verified_at');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('users', 'password_reset_required')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('password_reset_required');
            });
        }
    }
};