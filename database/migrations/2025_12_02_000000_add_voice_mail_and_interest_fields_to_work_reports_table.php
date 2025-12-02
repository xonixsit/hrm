<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_reports', function (Blueprint $table) {
            $table->integer('voice_mails')->default(0)->after('successful_calls');
            $table->integer('interested_count')->default(0)->after('voice_mails');
            $table->integer('not_interested_count')->default(0)->after('interested_count');
        });
    }

    public function down(): void
    {
        Schema::table('work_reports', function (Blueprint $table) {
            $table->dropColumn([
                'voice_mails',
                'interested_count',
                'not_interested_count'
            ]);
        });
    }
};