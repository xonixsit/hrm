<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\WorkReport;
use App\Models\Employee;

class WorkReportFactory extends Factory
{
    protected $model = WorkReport::class;

    public function definition(): array
    {
        $totalCalls = $this->faker->numberBetween(10, 80);
        $successfulCalls = $this->faker->numberBetween(5, $totalCalls);
        $notReceived = $this->faker->numberBetween(0, $totalCalls - $successfulCalls);
        $disconnected = $this->faker->numberBetween(0, $totalCalls - $successfulCalls - $notReceived);
        $followUp = $totalCalls - $successfulCalls - $notReceived - $disconnected;

        return [
            'employee_id' => Employee::factory(),
            'date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'calls' => $totalCalls,
            'successful_calls' => $successfulCalls,
            'calls_not_received' => $notReceived,
            'disconnected_calls' => $disconnected,
            'follow_up_calls' => max(0, $followUp),
            'emails' => $this->faker->numberBetween(5, 25),
            'whatsapp' => $this->faker->numberBetween(0, 15),
            'sms' => $this->faker->numberBetween(0, 10),
            'notes' => $this->faker->optional(0.7)->sentence(10),
        ];
    }
}