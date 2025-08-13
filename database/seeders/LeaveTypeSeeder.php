<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define standard leave types
        $leaveTypes = [
            ['name' => 'Annual Leave', 'quota' => 21],
            ['name' => 'Sick Leave', 'quota' => 10],
            ['name' => 'Personal Leave', 'quota' => 5],
            ['name' => 'Maternity Leave', 'quota' => 90],
            ['name' => 'Paternity Leave', 'quota' => 14],
            ['name' => 'Study Leave', 'quota' => 10],
            ['name' => 'Emergency Leave', 'quota' => 3],
        ];
        
        // Only create leave types that don't already exist
        foreach ($leaveTypes as $leaveType) {
            LeaveType::firstOrCreate(
                ['name' => $leaveType['name']],
                ['quota' => $leaveType['quota']]
            );
        }
    }
}