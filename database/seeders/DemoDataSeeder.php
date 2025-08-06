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
        Department::factory(5)->create();
        LeaveType::factory(5)->create();
        Project::factory(5)->create();
        Task::factory(10)->create();
        Employee::factory(20)->create();
        Leave::factory(50)->create();
        Attendance::factory(100)->create();
        Timesheet::factory(100)->create();
        Feedback::factory(50)->create();
        AuditLog::factory(100)->create();
    }
}
