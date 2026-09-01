<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whistleblower_reports', function (Blueprint $table) {
            $table->id();

            // Reporter identity — NULL means truly anonymous
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();

            // Report content
            $table->string('category');          // harassment, fraud, safety, discrimination, other
            $table->string('subject', 255);
            $table->text('description');
            $table->string('severity');          // low, medium, high, critical
            $table->boolean('is_anonymous')->default(true);

            // Involved parties (free text — no FK to protect anonymity)
            $table->string('accused_name')->nullable();
            $table->string('accused_department')->nullable();

            // Evidence files — stored as JSON array of paths
            $table->json('attachments')->nullable();

            // Admin workflow
            $table->string('status')->default('pending'); // pending, under_review, resolved, dismissed
            $table->text('admin_notes')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            // Privacy: one-way token so reporter can check status without logging in
            $table->string('tracking_token', 64)->unique();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('severity');
            $table->index('category');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whistleblower_reports');
    }
};
