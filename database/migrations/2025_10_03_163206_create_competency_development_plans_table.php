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
        Schema::create('competency_development_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('competency_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('current_rating')->unsigned()->nullable()->comment('Current competency rating 1-5');
            $table->tinyInteger('target_rating')->unsigned()->comment('Target competency rating 1-5');
            $table->date('target_date')->nullable();
            $table->text('development_actions')->nullable()->comment('Array of development activities and resources');
            $table->text('progress_notes')->nullable();
            $table->enum('status', ['active', 'completed', 'paused', 'cancelled'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Add indexes for performance
            $table->index('employee_id');
            $table->index('competency_id');
            $table->index('status');
            $table->index('target_date');
            $table->index('created_by');
            $table->index(['current_rating', 'target_rating']);
            
            // Rating validation will be handled in the model
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competency_development_plans');
    }
};