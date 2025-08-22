<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\Leave;
use App\Models\Attendance;
use App\Models\Project;
use App\Models\Task;
use App\Models\Timesheet;
use App\Models\Feedback;
use App\Models\AuditLog;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Use dedicated seeder for departments to avoid duplicates

        
        // Use dedicated seeder for leave types to avoid duplicates
        $this->call(LeaveTypeSeeder::class);
        
        Project::factory(5)->create();
        Task::factory(10)->create();
        if (Employee::count() < 24) {
            Employee::factory(24 - Employee::count())->create();
        }
        $this->call(SampleLeaveSeeder::class);
        Attendance::factory(100)->create();
        Timesheet::factory(100)->create();
        Feedback::factory(50)->create();
        AuditLog::factory(100)->create();
    }
}
