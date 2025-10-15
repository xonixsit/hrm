<?php

namespace App\Console\Commands;

use App\Services\BirthdayService;
use App\Models\Employee;
use Illuminate\Console\Command;

class TestBirthdaySystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:test {--create-test-data : Create test employees with birthdays}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the birthday notification system';

    protected BirthdayService $birthdayService;

    public function __construct(BirthdayService $birthdayService)
    {
        parent::__construct();
        $this->birthdayService = $birthdayService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🎂 Testing Birthday System');
        $this->newLine();

        if ($this->option('create-test-data')) {
            $this->createTestData();
            $this->newLine();
        }

        // Test today's birthdays
        $this->info('📅 Today\'s Birthdays:');
        $todaysBirthdays = $this->birthdayService->getTodaysBirthdays();
        
        if ($todaysBirthdays->isEmpty()) {
            $this->line('  No birthdays today');
        } else {
            foreach ($todaysBirthdays as $employee) {
                $age = $employee->getAge();
                $ageText = $age ? " (age {$age})" : '';
                $this->line("  🎉 {$employee->getFullName()}{$ageText}");
            }
        }

        $this->newLine();

        // Test upcoming birthdays
        $this->info('🔮 Upcoming Birthdays (next 7 days):');
        $upcomingBirthdays = $this->birthdayService->getUpcomingBirthdays(7);
        
        if ($upcomingBirthdays->isEmpty()) {
            $this->line('  No upcoming birthdays');
        } else {
            foreach ($upcomingBirthdays as $birthday) {
                $employee = $birthday['employee'];
                $daysUntil = $birthday['days_until'];
                $date = $birthday['birthday_date']->format('M j');
                
                $whenText = $daysUntil === 0 ? 'today' : 
                           ($daysUntil === 1 ? 'tomorrow' : "in {$daysUntil} days");

                $this->line("  🎂 {$employee->getFullName()} - {$date} ({$whenText})");
            }
        }

        $this->newLine();

        // Test birthday stats
        $this->info('📊 Birthday Statistics:');
        $stats = $this->birthdayService->getBirthdayStats();
        $this->line("  Today: {$stats['today']}");
        $this->line("  This week: {$stats['this_week']}");
        $this->line("  This month: {$stats['this_month']}");
        
        if ($stats['next_birthday']) {
            $nextBirthday = $stats['next_birthday'];
            $employee = $nextBirthday['employee'];
            $daysUntil = $nextBirthday['days_until'];
            $this->line("  Next birthday: {$employee->getFullName()} in {$daysUntil} days");
        }

        $this->newLine();

        // Test sending (dry run)
        $this->info('📧 Testing Email Sending (dry run):');
        $this->call('birthday:send-wishes', ['--dry-run' => true]);
        $this->call('birthday:send-reminders', ['--dry-run' => true]);

        return Command::SUCCESS;
    }

    private function createTestData()
    {
        $this->info('Creating test birthday data...');
        
        // Create employees with birthdays today, tomorrow, and in a few days
        $testBirthdays = [
            ['name' => 'John Birthday', 'days_offset' => 0], // Today
            ['name' => 'Jane Tomorrow', 'days_offset' => 1], // Tomorrow
            ['name' => 'Bob NextWeek', 'days_offset' => 3], // In 3 days
            ['name' => 'Alice Future', 'days_offset' => 7], // In 7 days
        ];

        foreach ($testBirthdays as $testData) {
            $birthdayDate = now()->addDays($testData['days_offset']);
            
            // Set birthday to same month/day but different year (make them older)
            $dateOfBirth = $birthdayDate->copy()->subYears(rand(25, 45));
            
            $age = $birthdayDate->year - $dateOfBirth->year;
            $this->line("  Creating {$testData['name']} with birthday on " . $birthdayDate->format('M j') . " (age will be {$age})");
        }

        $this->warn('Note: This is a dry run. To actually create test data, implement the user/employee creation logic.');
    }
}
