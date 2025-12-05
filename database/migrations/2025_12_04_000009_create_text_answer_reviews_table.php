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
        Schema::create('text_answer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('answer_id')->constrained('answers')->onDelete('cascade');
            $table->foreignId('reviewed_by')->constrained('users')->onDelete('restrict');
            $table->decimal('score', 8, 2);
            $table->text('comment')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();

            // Indexes
            $table->unique('answer_id');
            $table->index('reviewed_by');
            $table->index('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('text_answer_reviews');
    }
};
