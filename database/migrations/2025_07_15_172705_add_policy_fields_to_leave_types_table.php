<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            if (!Schema::hasColumn('leave_types', 'description')) {
                $table->text('description')->nullable()->after('quota');
            }
            if (!Schema::hasColumn('leave_types', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
            if (!Schema::hasColumn('leave_types', 'requires_approval')) {
                $table->boolean('requires_approval')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('leave_types', 'max_consecutive_days')) {
                $table->integer('max_consecutive_days')->nullable()->after('requires_approval');
            }
            if (!Schema::hasColumn('leave_types', 'min_notice_days')) {
                $table->integer('min_notice_days')->nullable()->after('max_consecutive_days');
            }
            if (!Schema::hasColumn('leave_types', 'carry_forward')) {
                $table->boolean('carry_forward')->default(false)->after('min_notice_days');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'is_active',
                'requires_approval',
                'max_consecutive_days',
                'min_notice_days',
                'carry_forward'
            ]);
        });
    }
};