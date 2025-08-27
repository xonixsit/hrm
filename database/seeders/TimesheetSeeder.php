<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Timesheet;
use App\Models\WorkReport;
use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;

class TimesheetSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::with('user')->get();
        $projects = Project::all();
        $tasks = Task::all();

        if ($employees->isEmpty() || $projects->isEmpty()) {
            $this->command->info('No employees or projects found. Please seed them first.');
            return;
        }

        // Create timesheets for the last 10 days
        for ($i = 0; $i < 10; $i++) {
            $date = Carbon::now()->subDays($i);
            
            foreach ($employees->take(3) as $employee) {
                // Create a work report first
                $workReport = WorkReport::create([
                    'employee_id' => $employee->id,
                    'date' => $date->format('Y-m-d'),
                    'calls' => rand(20, 50),
                    'calls_not_received' => rand(5, 15),
                    'disconnected_calls' => rand(2, 8),
                    'follow_up_calls' => rand(3, 12),
                    'successful_calls' => rand(10, 25),
                    'emails' => rand(5, 20),
                    'whatsapp' => rand(3, 15),
                    'sms' => rand(2, 10),
                    'notes' => 'Daily work activities completed successfully.',
                ]);

                // Create corresponding timesheet (some with discrepancies)
                $shouldHaveDiscrepancy = rand(1, 3) === 1; // 33% chance of discrepancy
                
                if ($shouldHaveDiscrepancy) {
                    // Create timesheet with hours that don't match work report
                    $hours = rand(2, 4); // Low hours despite high activity
                } else {
                    // Create realistic timesheet hours based on activities
                    $productiveActivities = $workReport->successful_calls + $workReport->emails + $workReport->whatsapp;
                    $hours = min(8, max(4, $productiveActivities * 0.1 + rand(-1, 1)));
                }

                Timesheet::create([
                    'employee_id' => $employee->id,
                    'project_id' => $projects->random()->id,
                    'task_id' => $tasks->isNotEmpty() ? $tasks->random()->id : null,
                    'date' => $date->format('Y-m-d'),
                    'hours' => $hours,
                    'description' => 'Worked on project tasks and client communications.',
                    'status' => 'pending',
                ]);
            }
        }

        $this->command->info('Created timesheets with corresponding work reports for testing.');
    }
}