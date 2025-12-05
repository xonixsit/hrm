<?php

namespace Database\Factories;

use App\Models\QuestionOption;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuestionOption>
 */
class QuestionOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'option_text' => $this->faker->sentence(),
            'explanation' => $this->faker->optional(0.5)->paragraph(),
            'is_correct' => $this->faker->boolean(20),
            'order' => $this->faker->numberBetween(1, 5),
        ];
    }

    /**
     * Indicate that the option is correct.
     */
    public function correct(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => true,
        ]);
    }

    /**
     * Indicate that the option is incorrect.
     */
    public function incorrect(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => false,
        ]);
    }
}
