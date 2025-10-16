<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class SetTodayBirthday extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:set-today {--employee-id= : Specific employee ID to update}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set an employee to have birthday today for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $employeeId = $this->option('employee-id');
        
        if ($employeeId) {
            $employee = Employee::with('user')->find($employeeId);
        } else {
            // Get the first active employee
            $employee = Employee::with('user')->active()->first();
        }
        
        if (!$employee) {
            $this->error('No employee found to update.');
            return Command::FAILURE;
        }
        
        // Set birthday to today but 30 years ago
        $newBirthday = now()->subYears(30);
        
        $employee->update([
            'date_of_birth' => $newBirthday
        ]);
        
        $this->info("Updated {$employee->user->name} (ID: {$employee->id}) to have birthday today!");
        $this->line("Birthday set to: {$newBirthday->format('Y-m-d')} (age 30)");
        
        return Command::SUCCESS;
    }
}
