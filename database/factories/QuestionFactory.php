<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\SkillTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'skill_test_id' => SkillTest::factory(),
            'type' => $this->faker->randomElement(['mcq', 'text', 'single_answer']),
            'question_text' => $this->faker->sentence() . '?',
            'order' => $this->faker->numberBetween(1, 10),
            'points' => $this->faker->numberBetween(5, 20),
        ];
    }

    /**
     * Indicate that the question is MCQ type.
     */
    public function mcq(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'mcq',
        ]);
    }

    /**
     * Indicate that the question is text type.
     */
    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
        ]);
    }

    /**
     * Indicate that the question is single answer type.
     */
    public function singleAnswer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'single_answer',
        ]);
    }
}
