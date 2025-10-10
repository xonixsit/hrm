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
        Schema::create('competency_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('competency_id')->constrained()->onDelete('cascade');
            $table->foreignId('assessor_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('assessment_cycle_id')->nullable();
            $table->tinyInteger('rating')->unsigned()->comment('Rating from 1-5');
            $table->text('comments')->nullable();
            $table->enum('assessment_type', ['self', 'manager', 'peer', '360'])->default('manager');
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->text('evidence_files')->nullable();
            $table->text('development_notes')->nullable();
            $table->timestamps();
            
            // Add indexes for performance
            $table->index('employee_id');
            $table->index('competency_id');
            $table->index('assessor_id');
            $table->index('assessment_cycle_id');
            $table->index('assessment_type');
            $table->index('status');
            $table->index('submitted_at');
            $table->index('rating');
            
            // Unique constraint to prevent duplicate assessments
            $table->unique(['employee_id', 'competency_id', 'assessor_id', 'assessment_cycle_id'], 'unique_assessment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competency_assessments');
    }
};