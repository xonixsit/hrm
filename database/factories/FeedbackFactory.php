<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Feedback>
 */
class FeedbackFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reviewer_id' => \App\Models\User::factory(),
            'reviewee_id' => \App\Models\Employee::factory(),
            'period' => $this->faker->date('Y-m'),
            'comments' => $this->faker->paragraph(),
            'rating' => $this->faker->numberBetween(1, 5),
        ];
    }
}
