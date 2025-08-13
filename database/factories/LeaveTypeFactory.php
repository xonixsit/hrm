<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveType>
 */
class LeaveTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $leaveTypes = [
            ['name' => 'Annual Leave', 'quota' => 21],
            ['name' => 'Sick Leave', 'quota' => 10],
            ['name' => 'Personal Leave', 'quota' => 5],
            ['name' => 'Maternity Leave', 'quota' => 90],
            ['name' => 'Paternity Leave', 'quota' => 14],
            ['name' => 'Study Leave', 'quota' => 10],
            ['name' => 'Emergency Leave', 'quota' => 3],
        ];
        
        static $index = 0;
        
        if ($index >= count($leaveTypes)) {
            $index = 0; // Reset if we've used all types
        }
        
        $leaveType = $leaveTypes[$index];
        $index++;
        
        return $leaveType;
    }
}
