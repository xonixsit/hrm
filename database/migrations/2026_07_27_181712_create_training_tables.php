<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_modules', function (Blueprint $table) {
            $table->id();
            $table->string('module_key')->unique(); // mod-1, mod-2 etc
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('pages'); // [1,2,3]
            $table->string('icon_name')->default('BookOpen');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('manual_pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('module_id')->nullable();
            $table->integer('page_number')->unique();
            $table->string('title');
            $table->string('module_title')->nullable();
            $table->json('verbatim_text'); // array of paragraphs
            $table->timestamps();

            $table->foreign('module_id')->references('id')->on('training_modules')->onDelete('set null');
        });

        Schema::create('training_flashcards', function (Blueprint $table) {
            $table->id();
            $table->string('card_key')->unique(); // card-p1-1
            $table->string('module_key');
            $table->integer('page_number');
            $table->string('title');
            $table->text('prompt');
            $table->text('exact_answer_text');
            $table->text('exact_context_snippet')->nullable();
            $table->string('category')->nullable();
            $table->json('key_terms')->nullable();
            $table->timestamps();
        });

        Schema::create('training_card_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('card_key');
            $table->integer('interval')->default(1); // days
            $table->integer('repetition_count')->default(0);
            $table->decimal('ease_factor', 4, 2)->default(2.50);
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamp('next_review_at')->nullable();
            $table->integer('stability')->default(1);
            $table->enum('state', ['new','learning','review','mastered'])->default('new');
            $table->json('history')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'card_key']);
            $table->index(['user_id', 'next_review_at']);
        });

        Schema::create('training_user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();
            $table->integer('streak_days')->default(1);
            $table->date('last_active_date')->nullable();
            $table->integer('total_reviews')->default(0);
            $table->integer('correct_reviews')->default(0);
            $table->integer('daily_goal_cards')->default(10);
            $table->integer('reviews_today_count')->default(0);
            $table->date('last_review_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_user_stats');
        Schema::dropIfExists('training_card_progress');
        Schema::dropIfExists('training_flashcards');
        Schema::dropIfExists('manual_pages');
        Schema::dropIfExists('training_modules');
    }
};
