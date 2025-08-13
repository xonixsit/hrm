<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Department;
use App\Models\Employee;

class CleanupDuplicateDepartments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'departments:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove duplicate departments and consolidate employee assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting department cleanup...');

        // Get all departments grouped by name
        $departmentGroups = Department::all()->groupBy('name');

        $duplicatesFound = 0;
        $duplicatesRemoved = 0;

        foreach ($departmentGroups as $name => $departments) {
            if ($departments->count() > 1) {
                $duplicatesFound += $departments->count() - 1;
                $this->warn("Found {$departments->count()} departments named '{$name}'");

                // Keep the first department (or the one with most employees)
                $keepDepartment = $departments->sortByDesc(function ($dept) {
                    return $dept->employees()->count();
                })->first();

                $this->info("Keeping department ID {$keepDepartment->id} (has {$keepDepartment->employees()->count()} employees)");

                // Move employees from duplicate departments to the kept one
                foreach ($departments as $department) {
                    if ($department->id !== $keepDepartment->id) {
                        $employeeCount = $department->employees()->count();
                        if ($employeeCount > 0) {
                            $this->info("Moving {$employeeCount} employees from department ID {$department->id} to ID {$keepDepartment->id}");
                            Employee::where('department_id', $department->id)
                                ->update(['department_id' => $keepDepartment->id]);
                        }

                        // Delete the duplicate department
                        $department->delete();
                        $duplicatesRemoved++;
                        $this->info("Deleted duplicate department ID {$department->id}");
                    }
                }
            }
        }

        if ($duplicatesFound > 0) {
            $this->info("Cleanup completed! Removed {$duplicatesRemoved} duplicate departments.");
        } else {
            $this->info('No duplicate departments found.');
        }

        // Now seed proper departments
        $this->info('Seeding proper departments...');
        $this->call('db:seed', ['--class' => 'DepartmentSeeder']);

        $this->info('Department cleanup and seeding completed successfully!');
    }
}