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
        Schema::create('assessment_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['planned', 'active', 'completed', 'cancelled'])->default('planned');
            $table->text('assessment_types')->comment('Array of assessment types to include');
            $table->text('target_employees')->nullable()->comment('Array of employee IDs or criteria');
            $table->text('notification_settings')->nullable()->comment('Notification configuration');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Add indexes for performance
            $table->index('status');
            $table->index(['start_date', 'end_date']);
            $table->index('created_by');
            $table->index('name');
            
            // Date validation will be handled in the model
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_cycles');
    }
};