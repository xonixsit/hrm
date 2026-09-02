<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_reports', function (Blueprint $table) {
            $table->id();

            // Who created the schedule
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            // What to send
            $table->string('report_type');   // attendance | leaves | timesheets | feedbacks
            $table->string('report_format'); // pdf | excel
            $table->string('label')->nullable(); // friendly name

            // When to send
            $table->string('frequency');     // daily | weekly | monthly
            $table->tinyInteger('day_of_week')->nullable();  // 0=Sun … 6=Sat (weekly)
            $table->tinyInteger('day_of_month')->nullable(); // 1-28 (monthly)
            $table->string('send_time')->default('08:00');   // HH:MM

            // Recipients — JSON array of email addresses
            $table->json('recipients');

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_run_at')->nullable();

            $table->timestamps();

            $table->index(['is_active', 'next_run_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_reports');
    }
};
