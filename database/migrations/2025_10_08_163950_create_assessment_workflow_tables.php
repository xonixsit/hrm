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
        // Assessment status change audit log
        Schema::create('assessment_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('competency_assessments')->onDelete('cascade');
            $table->string('old_status');
            $table->string('new_status');
            $table->foreignId('changed_by')->constrained('users');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['assessment_id', 'created_at']);
        });

        // Assessment deadline extensions
        Schema::create('assessment_deadline_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('competency_assessments')->onDelete('cascade');
            $table->datetime('original_deadline');
            $table->datetime('new_deadline');
            $table->foreignId('extended_by')->constrained('users');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['assessment_id']);
        });

        // Assessment reassignments
        Schema::create('assessment_reassignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('competency_assessments')->onDelete('cascade');
            $table->foreignId('old_assessor_id')->constrained('users');
            $table->foreignId('new_assessor_id')->constrained('users');
            $table->foreignId('reassigned_by')->constrained('users');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['assessment_id']);
        });

        // Add workflow-related columns to competency_assessments table
        Schema::table('competency_assessments', function (Blueprint $table) {
            $table->datetime('extended_deadline')->nullable()->after('submitted_at');
            $table->datetime('approved_at')->nullable()->after('extended_deadline');
            $table->datetime('rejected_at')->nullable()->after('approved_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->after('rejected_at');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('rejected_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove columns from competency_assessments table
        Schema::table('competency_assessments', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropColumn([
                'extended_deadline',
                'approved_at',
                'rejected_at',
                'approved_by',
                'rejected_by',
                'rejection_reason'
            ]);
        });

        Schema::dropIfExists('assessment_reassignments');
        Schema::dropIfExists('assessment_deadline_extensions');
        Schema::dropIfExists('assessment_status_logs');
    }
};
