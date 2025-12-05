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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_test_id')->constrained('skill_tests')->onDelete('cascade');
            $table->enum('type', ['mcq', 'text', 'single_answer']);
            $table->text('question_text');
            $table->integer('order')->default(0);
            $table->decimal('points', 8, 2)->default(1);
            $table->timestamps();

            // Indexes
            $table->index('skill_test_id');
            $table->index('type');
            $table->index(['skill_test_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
