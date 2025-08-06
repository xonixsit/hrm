<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Leave>
 */
class LeaveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fromDate = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $days = $this->faker->numberBetween(1, 7);
        $toDate = (clone $fromDate)->modify("+$days days");
        return [
            'employee_id' => \App\Models\Employee::factory(),
            'leave_type_id' => \App\Models\LeaveType::factory(),
            'from_date' => $fromDate->format('Y-m-d'),
            'to_date' => $toDate->format('Y-m-d'),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'approved_by' => \App\Models\User::factory(),
            'reason' => $this->faker->sentence(),
        ];
    }
}
