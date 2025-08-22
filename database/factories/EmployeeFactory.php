<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'department_id' => \App\Models\Department::inRandomOrder()->first()->id ?? \App\Models\Department::factory(),
            'employee_code' => function () {
                return 'EMP' . $this->faker->unique()->randomNumber(5, true);
            },
            'job_title' => $this->faker->jobTitle(),
            'join_date' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            'contract_type' => $this->faker->randomElement(['Full-time', 'Part-time', 'Contract']),
            'photo' => $this->faker->optional()->imageUrl(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'address' => $this->faker->optional()->address(),
            'status' => $this->faker->randomElement(['active', 'inactive']),
        ];
    }
}
