<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_reports', function (Blueprint $table) {
            $table->integer('calls_not_received')->default(0)->after('calls');
            $table->integer('disconnected_calls')->default(0)->after('calls_not_received');
            $table->integer('follow_up_calls')->default(0)->after('disconnected_calls');
            $table->integer('successful_calls')->default(0)->after('follow_up_calls');
            $table->text('notes')->nullable()->after('sms');
        });
    }

    public function down(): void
    {
        Schema::table('work_reports', function (Blueprint $table) {
            $table->dropColumn([
                'calls_not_received',
                'disconnected_calls',
                'follow_up_calls',
                'successful_calls',
                'notes'
            ]);
        });
    }
};