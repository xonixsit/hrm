<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Objection Crusher Tables
        Schema::create('objection_cards', function (Blueprint $table) {
            $table->id();
            $table->text('objection_text');
            $table->string('category')->nullable(); // price, time, complexity, trust, value
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->text('tips')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            
            $table->index(['active', 'difficulty']);
        });

        Schema::create('response_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('objection_id')->constrained('objection_cards')->onDelete('cascade');
            $table->text('response_text');
            $table->boolean('is_correct')->default(true);
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            
            $table->index('objection_id');
        });

        Schema::create('objection_game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->integer('correct_matches')->default(0);
            $table->integer('total_attempts')->default(0);
            $table->integer('time_taken_seconds')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['employee_id', 'completed_at']);
        });

        Schema::create('objection_game_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('objection_game_sessions')->onDelete('cascade');
            $table->foreignId('objection_id')->constrained('objection_cards');
            $table->foreignId('response_id')->constrained('response_cards');
            $table->boolean('is_correct');
            $table->integer('time_taken_seconds')->nullable();
            $table->timestamps();
            
            $table->index('session_id');
        });

        // Tax Trivia Tower Tables
        Schema::create('trivia_questions', function (Blueprint $table) {
            $table->id();
            $table->text('question_text');
            $table->string('category')->nullable(); // deductions, credits, amendments, filing, etc.
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->text('explanation')->nullable();
            $table->string('source')->nullable(); // IRS publication reference
            $table->boolean('active')->default(true);
            $table->integer('usage_count')->default(0);
            $table->integer('correct_count')->default(0);
            $table->integer('incorrect_count')->default(0);
            $table->timestamps();
            
            $table->index(['active', 'difficulty', 'category']);
        });

        Schema::create('trivia_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('trivia_questions')->onDelete('cascade');
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->integer('selection_count')->default(0);
            $table->timestamps();
            
            $table->index('question_id');
        });

        Schema::create('trivia_game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->integer('floors_climbed')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('total_questions')->default(0);
            $table->integer('time_taken_seconds')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['employee_id', 'completed_at']);
        });

        Schema::create('trivia_game_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('trivia_game_sessions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('trivia_questions');
            $table->foreignId('selected_option_id')->nullable()->constrained('trivia_options');
            $table->boolean('is_correct');
            $table->integer('time_taken_seconds')->nullable();
            $table->timestamps();
            
            $table->index('session_id');
        });

        // Shared Tables
        Schema::create('game_leaderboards', function (Blueprint $table) {
            $table->id();
            $table->enum('game_type', ['objection_crusher', 'tax_trivia']);
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('total_score')->default(0);
            $table->integer('games_played')->default(0);
            $table->integer('rank')->nullable();
            $table->enum('period', ['daily', 'weekly', 'monthly', 'all_time'])->default('all_time');
            $table->date('period_date')->nullable();
            $table->timestamps();
            
            $table->index(['game_type', 'period', 'rank']);
            $table->unique(['game_type', 'employee_id', 'period', 'period_date'], 'game_leaderboard_unique');
        });

        Schema::create('game_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->enum('game_type', ['objection_crusher', 'tax_trivia', 'both']);
            $table->string('achievement_type'); // first_win, streak_3, perfect_score, etc.
            $table->string('achievement_name');
            $table->text('description')->nullable();
            $table->integer('points_awarded')->default(0);
            $table->timestamp('earned_at');
            $table->timestamps();
            
            $table->index(['employee_id', 'game_type']);
        });

        Schema::create('game_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('game_type', ['objection_crusher', 'tax_trivia', 'global']);
            $table->string('setting_key');
            $table->text('setting_value');
            $table->string('data_type')->default('string'); // string, integer, boolean, json
            $table->timestamps();
            
            $table->unique(['game_type', 'setting_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_achievements');
        Schema::dropIfExists('game_leaderboards');
        Schema::dropIfExists('game_settings');
        
        Schema::dropIfExists('trivia_game_answers');
        Schema::dropIfExists('trivia_game_sessions');
        Schema::dropIfExists('trivia_options');
        Schema::dropIfExists('trivia_questions');
        
        Schema::dropIfExists('objection_game_attempts');
        Schema::dropIfExists('objection_game_sessions');
        Schema::dropIfExists('response_cards');
        Schema::dropIfExists('objection_cards');
    }
};
