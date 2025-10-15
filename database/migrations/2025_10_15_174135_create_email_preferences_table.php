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
        Schema::create('email_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Leave notification preferences
            $table->boolean('leave_request_submitted')->default(true);
            $table->boolean('leave_request_approved')->default(true);
            $table->boolean('leave_request_rejected')->default(true);
            
            // Assessment notification preferences
            $table->boolean('assessment_assigned')->default(true);
            $table->boolean('assessment_submitted')->default(true);
            $table->boolean('assessment_approved')->default(true);
            $table->boolean('assessment_rejected')->default(true);
            
            // Digest preferences
            $table->boolean('daily_digest')->default(false);
            $table->boolean('weekly_digest')->default(true);
            $table->string('digest_time')->default('09:00'); // Time for daily digest
            $table->string('digest_day')->default('monday'); // Day for weekly digest
            
            // Reminder preferences
            $table->boolean('pending_reminders')->default(true);
            $table->integer('reminder_frequency_hours')->default(24); // Hours between reminders
            
            // General preferences
            $table->boolean('system_notifications')->default(true);
            $table->boolean('marketing_emails')->default(false);
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_preferences');
    }
};
