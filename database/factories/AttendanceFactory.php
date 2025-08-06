<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d');
        $clockInTime = $this->faker->time('H:i:s', '09:00:00');
        $clockOutTime = $this->faker->time('H:i:s', '18:00:00');
        $clockIn = $date . ' ' . $clockInTime;
        $clockOut = $date . ' ' . $clockOutTime;
        return [
            'employee_id' => \App\Models\Employee::factory(),
            'date' => $date,
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'ip_address' => $this->faker->ipv4(),
            'location' => $this->faker->address(),
            'edited_by' => $this->faker->optional()->passthrough(\App\Models\User::factory()->create()->id),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
