<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whistleblower_reports', function (Blueprint $table) {
            // Drop the SET NULL foreign key so we can make the column NOT NULL
            $table->dropForeign(['reporter_id']);

            // Drop the tracking token column
            $table->dropUnique(['tracking_token']);
            $table->dropColumn('tracking_token');
        });

        // Fill any NULLs with a fallback user (first admin, or user id=1)
        $fallback = DB::table('users')->value('id');
        if ($fallback) {
            DB::table('whistleblower_reports')
                ->whereNull('reporter_id')
                ->update(['reporter_id' => $fallback]);
        }

        Schema::table('whistleblower_reports', function (Blueprint $table) {
            // Make non-nullable and re-add FK with CASCADE (not SET NULL)
            $table->foreignId('reporter_id')->nullable(false)->change();
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('whistleblower_reports', function (Blueprint $table) {
            $table->dropForeign(['reporter_id']);
            $table->foreignId('reporter_id')->nullable()->change();
            $table->foreign('reporter_id')->references('id')->on('users')->nullOnDelete();
            $table->string('tracking_token', 64)->nullable()->unique();
        });
    }
};
