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
        Schema::create('test_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_session_id')->constrained('test_sessions')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('skill_test_id')->constrained('skill_tests')->onDelete('cascade');
            $table->decimal('total_score', 8, 2)->nullable();
            $table->decimal('percentage_score', 5, 2)->nullable();
            $table->boolean('passed')->nullable();
            $table->enum('review_status', ['auto_scored', 'pending_review', 'reviewed'])->default('auto_scored');
            $table->timestamp('submitted_at');
            $table->timestamps();

            // Indexes
            $table->index('test_session_id');
            $table->index('employee_id');
            $table->index('skill_test_id');
            $table->index('review_status');
            $table->index(['employee_id', 'skill_test_id']);
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_responses');
    }
};
