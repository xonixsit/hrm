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
        Schema::create('test_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_test_id')->constrained('skill_tests')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->integer('max_attempts')->default(1);
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamps();

            // Indexes
            $table->index('skill_test_id');
            $table->index('employee_id');
            $table->index('assigned_by');
            $table->index('status');
            $table->index(['skill_test_id', 'employee_id']);
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_assignments');
    }
};
