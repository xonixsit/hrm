<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Support\Str;

class FixMissingEmployeeRecords extends Command
{
    protected $signature = 'fix:missing-employee-records';
    protected $description = 'Create employee records for users who don\'t have them';

    public function handle()
    {
        $this->info('Checking for users without employee records...');
        
        // Find users without employee records
        $usersWithoutEmployees = User::whereDoesntHave('employee')->get();
        
        if ($usersWithoutEmployees->isEmpty()) {
            $this->info('All users already have employee records.');
            return 0;
        }
        
        $this->info("Found {$usersWithoutEmployees->count()} users without employee records.");
        
        // Get or create default department
        $defaultDepartment = Department::firstOrCreate(
            ['name' => 'General'],
            [
                'code' => 'GEN',
                'description' => 'General Department',
                'status' => 'Active'
            ]
        );
        
        $created = 0;
        $failed = 0;
        
        foreach ($usersWithoutEmployees as $user) {
            try {
                $employeeCode = $this->generateEmployeeCode();
                
                Employee::create([
                    'user_id' => $user->id,
                    'employee_code' => $employeeCode,
                    'job_title' => 'Employee',
                    'department_id' => $defaultDepartment->id,
                    'join_date' => $user->created_at ?? now(),
                    'contract_type' => 'Full-time',
                    'employment_type' => 'full_time',
                    'status' => 'active'
                ]);
                
                $created++;
                $this->info("Created employee record for user: {$user->name} ({$user->email})");
                
            } catch (\Exception $e) {
                $failed++;
                $this->error("Failed to create employee record for user {$user->name}: " . $e->getMessage());
            }
        }
        
        $this->info("Summary:");
        $this->info("- Created: {$created} employee records");
        if ($failed > 0) {
            $this->error("- Failed: {$failed} employee records");
        }
        
        return 0;
    }
    
    private function generateEmployeeCode()
    {
        do {
            $code = 'EMP' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (Employee::where('employee_code', $code)->exists());

        return $code;
    }
}