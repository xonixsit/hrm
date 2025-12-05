<?php

namespace Database\Factories;

use App\Models\SkillTest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SkillTest>
 */
class SkillTestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->words(3, true),
            'description' => $this->faker->paragraph(),
            'category' => $this->faker->randomElement(['Programming', 'Management', 'Communication', 'Technical']),
            'difficulty_level' => $this->faker->randomElement(['easy', 'medium', 'hard']),
            'passing_score' => $this->faker->numberBetween(60, 80),
            'time_limit' => $this->faker->optional(0.7)->numberBetween(30, 180),
            'max_attempts' => $this->faker->numberBetween(1, 5),
            'randomize_questions' => $this->faker->boolean(),
            'randomize_answers' => $this->faker->boolean(),
            'show_correct_answers' => $this->faker->boolean(),
            'show_explanations' => $this->faker->boolean(),
            'feedback_timing' => $this->faker->randomElement(['immediate', 'after_deadline', 'manual']),
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the test is in draft status.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Indicate that the test is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    /**
     * Indicate that the test is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }
}
