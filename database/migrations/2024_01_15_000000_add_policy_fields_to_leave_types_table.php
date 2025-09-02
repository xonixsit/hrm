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
            $table->text('description')->nullable()->after('quota');
            $table->boolean('is_active')->default(true)->after('description');
            $table->boolean('requires_approval')->default(true)->after('is_active');
            $table->integer('max_consecutive_days')->nullable()->after('requires_approval');
            $table->integer('min_notice_days')->nullable()->after('max_consecutive_days');
            $table->boolean('carry_forward')->default(false)->after('min_notice_days');
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