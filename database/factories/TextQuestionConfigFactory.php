<?php

namespace Database\Factories;

use App\Models\TextQuestionConfig;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TextQuestionConfig>
 */
class TextQuestionConfigFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question_id' => Question::factory()->text(),
            'min_characters' => $this->faker->optional(0.7)->numberBetween(50, 200),
            'max_characters' => $this->faker->optional(0.7)->numberBetween(500, 2000),
            'expected_answer_guidelines' => $this->faker->paragraph(),
        ];
    }
}
