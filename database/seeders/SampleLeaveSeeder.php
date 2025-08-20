<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\Leave;
use Carbon\Carbon;

class SampleLeaveSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $leaveTypes = LeaveType::all();
        $admins = User::whereHas('roles', function($query) {
            $query->where('name', 'admin');
        })->get();

        if ($employees->isEmpty() || $leaveTypes->isEmpty() || $admins->isEmpty()) {
            $this->command->info('Required models not found. Please seed employees, leave types, and users first.');
            return;
        }

        foreach ($employees as $employee) {
            for ($i = 0; $i < 5; $i++) { // 5 leaves per employee
                $status = fake()->randomElement(['pending', 'approved', 'rejected']);
                $fromDate = Carbon::now()->subDays(fake()->numberBetween(30, 365));
                $days = fake()->numberBetween(1, 14);
                $toDate = $fromDate->copy()->addDays($days);
                $leaveType = $leaveTypes->random();
                $approvedBy = ($status === 'pending') ? null : $admins->random()->id;

                Leave::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => $leaveType->id,
                    'from_date' => $fromDate->format('Y-m-d'),
                    'to_date' => $toDate->format('Y-m-d'),
                    'status' => $status,
                    'approved_by' => $approvedBy,
                    'reason' => fake()->sentence(),
                ]);
            }
        }

        $this->command->info('Sample leave data populated successfully.');
    }
}