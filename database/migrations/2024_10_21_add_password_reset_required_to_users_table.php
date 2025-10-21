<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        try {
            $columnExists = DB::select("SHOW COLUMNS FROM users LIKE 'password_reset_required'");
            
            if (empty($columnExists)) {
                DB::statement("ALTER TABLE users ADD COLUMN password_reset_required TINYINT(1) NOT NULL DEFAULT 0 AFTER email_verified_at");
            }
        } catch (\Exception $e) {
            // Fallback for older MySQL versions
            if (!Schema::hasColumn('users', 'password_reset_required')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->boolean('password_reset_required')->default(false);
                });
            }
        }
    }

    public function down()
    {
        try {
            $columnExists = DB::select("SHOW COLUMNS FROM users LIKE 'password_reset_required'");
            
            if (!empty($columnExists)) {
                DB::statement("ALTER TABLE users DROP COLUMN password_reset_required");
            }
        } catch (\Exception $e) {
            if (Schema::hasColumn('users', 'password_reset_required')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropColumn('password_reset_required');
                });
            }
        }
    }
};