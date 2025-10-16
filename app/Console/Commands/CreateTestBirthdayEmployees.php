<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestBirthdayEmployees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:create-test-employees {--count=5 : Number of test employees to create}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test employees with birthdays for testing the birthday system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->option('count');
        
        $this->info("Creating {$count} test employees with birthdays...");
        
        // Get or create a test department
        $department = Department::firstOrCreate(
            ['name' => 'Test Department'],
            ['description' => 'Test department for birthday testing']
        );
        
        $testEmployees = [
            [
                'name' => 'John Birthday',
                'email' => 'john.birthday@test.com',
                'job_title' => 'Software Developer',
                'days_offset' => 0, // Today
            ],
            [
                'name' => 'Jane Tomorrow',
                'email' => 'jane.tomorrow@test.com',
                'job_title' => 'Product Manager',
                'days_offset' => 1, // Tomorrow
            ],
            [
                'name' => 'Bob NextWeek',
                'email' => 'bob.nextweek@test.com',
                'job_title' => 'Designer',
                'days_offset' => 3, // In 3 days
            ],
            [
                'name' => 'Alice Future',
                'email' => 'alice.future@test.com',
                'job_title' => 'Marketing Specialist',
                'days_offset' => 7, // In 7 days
            ],
            [
                'name' => 'Charlie LastWeek',
                'email' => 'charlie.lastweek@test.com',
                'job_title' => 'HR Manager',
                'days_offset' => -7, // Last week (for testing past birthdays)
            ],
        ];
        
        $created = 0;
        
        foreach (array_slice($testEmployees, 0, $count) as $testData) {
            // Check if user already exists
            if (User::where('email', $testData['email'])->exists()) {
                $this->warn("User {$testData['email']} already exists, skipping...");
                continue;
            }
            
            // Calculate birthday date
            $birthdayDate = now()->addDays($testData['days_offset']);
            // Set birthday to same month/day but make them older (25-45 years old)
            $dateOfBirth = $birthdayDate->copy()->subYears(rand(25, 45));
            
            // Create user
            $user = User::create([
                'name' => $testData['name'],
                'email' => $testData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            
            // Assign employee role
            $user->assignRole('Employee');
            
            // Create employee profile
            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => 'TEST' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                'department_id' => $department->id,
                'job_title' => $testData['job_title'],
                'join_date' => now()->subMonths(rand(6, 24)),
                'date_of_birth' => $dateOfBirth,
                'status' => 'active',
                'phone' => '+1-555-' . rand(1000, 9999),
                'address' => '123 Test Street, Test City, TC 12345',
                'contract_type' => 'permanent',
                'employment_type' => 'full_time',
            ]);
            
            $age = $birthdayDate->year - $dateOfBirth->year;
            $whenText = match($testData['days_offset']) {
                0 => 'today',
                1 => 'tomorrow',
                -7 => 'last week',
                default => ($testData['days_offset'] > 0 ? "in {$testData['days_offset']} days" : abs($testData['days_offset']) . " days ago")
            };
            
            $this->line("✅ Created {$testData['name']} - Birthday {$whenText} (age will be {$age})");
            $created++;
        }
        
        $this->newLine();
        $this->info("Successfully created {$created} test employees!");
        $this->info("You can now test the birthday system with:");
        $this->line("  php artisan birthday:test");
        $this->line("  php artisan birthday:send-wishes --dry-run");
        $this->line("  php artisan birthday:send-reminders --dry-run");
        
        return Command::SUCCESS;
    }
}
