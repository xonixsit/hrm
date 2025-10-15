<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use App\Mail\BirthdayWish;
use App\Mail\BirthdayReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestBirthdayEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:test-emails {email : Email address to send test emails to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send test birthday emails to verify templates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("🎂 Sending test birthday emails to: {$email}");
        $this->newLine();

        // Create a mock employee for testing
        $mockEmployee = $this->createMockEmployee();
        
        try {
            // Test birthday wish email
            $this->info('📧 Sending birthday wish email...');
            Mail::to($email)->send(new BirthdayWish($mockEmployee));
            $this->info('✅ Birthday wish email sent successfully!');
            
            $this->newLine();
            
            // Test birthday reminder email
            $this->info('📧 Sending birthday reminder email...');
            $upcomingBirthdays = collect([
                [
                    'employee' => $mockEmployee,
                    'birthday_date' => now()->addDays(2),
                    'days_until' => 2,
                ],
                [
                    'employee' => $this->createMockEmployee('Jane Smith', 'Marketing Manager'),
                    'birthday_date' => now()->addDays(5),
                    'days_until' => 5,
                ]
            ]);
            
            Mail::to($email)->send(new BirthdayReminder($upcomingBirthdays, 7));
            $this->info('✅ Birthday reminder email sent successfully!');
            
            $this->newLine();
            $this->info('🎉 All test emails sent successfully!');
            $this->info('Check your email inbox to verify the templates.');
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test emails: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function createMockEmployee($name = 'John Doe', $jobTitle = 'Software Developer')
    {
        // Create a mock employee object for testing
        $mockUser = new User([
            'name' => $name,
            'email' => 'test@example.com',
        ]);
        $mockUser->id = 1;

        $mockEmployee = new Employee([
            'job_title' => $jobTitle,
            'date_of_birth' => now()->subYears(30),
        ]);
        $mockEmployee->id = 1;
        $mockEmployee->setRelation('user', $mockUser);
        
        // Mock department
        $mockDepartment = new Department(['name' => 'Engineering']);
        $mockEmployee->setRelation('department', $mockDepartment);

        return $mockEmployee;
    }
}
