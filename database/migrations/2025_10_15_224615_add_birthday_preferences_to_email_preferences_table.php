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
        Schema::table('email_preferences', function (Blueprint $table) {
            $table->boolean('birthday_notifications')->default(true)->after('marketing_emails');
            $table->boolean('birthday_reminders')->default(true)->after('birthday_notifications');
            $table->integer('birthday_reminder_days')->default(3)->after('birthday_reminders');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_preferences', function (Blueprint $table) {
            $table->dropColumn(['birthday_notifications', 'birthday_reminders', 'birthday_reminder_days']);
        });
    }
};
