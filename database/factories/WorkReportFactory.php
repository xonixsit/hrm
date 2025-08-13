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
        return [
            'employee_id' => Employee::factory(),
            'date' => $this->faker->date(),
            'calls' => $this->faker->numberBetween(0, 50),
            'emails' => $this->faker->numberBetween(0, 50),
            'whatsapp' => $this->faker->numberBetween(0, 50),
            'sms' => $this->faker->numberBetween(0, 50),
        ];
    }
}