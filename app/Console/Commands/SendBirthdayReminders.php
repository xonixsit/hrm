<?php

namespace App\Console\Commands;

use App\Services\BirthdayService;
use Illuminate\Console\Command;

class SendBirthdayReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:send-reminders {--days=3 : Days ahead to check for birthdays} {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send birthday reminders to employees about upcoming birthdays';

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
        $daysAhead = (int) $this->option('days');
        
        $this->info("🔔 Checking for birthdays in the next {$daysAhead} days...");

        $upcomingBirthdays = $this->birthdayService->getUpcomingBirthdays($daysAhead);

        if ($upcomingBirthdays->isEmpty()) {
            $this->info('No upcoming birthdays found. 😊');
            return Command::SUCCESS;
        }

        $this->info("Found {$upcomingBirthdays->count()} upcoming birthday(s):");

        foreach ($upcomingBirthdays as $birthday) {
            $employee = $birthday['employee'];
            $daysUntil = $birthday['days_until'];
            $dateStr = $birthday['birthday_date']->format('M j');
            
            $whenText = $daysUntil === 0 ? 'today' : 
                       ($daysUntil === 1 ? 'tomorrow' : "in {$daysUntil} days");

            $this->line("  🎂 {$employee->getFullName()} - {$dateStr} ({$whenText})");
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN: No reminder emails were actually sent.');
            return Command::SUCCESS;
        }

        $this->info('Sending birthday reminders...');

        $sentCount = $this->birthdayService->sendBirthdayReminders();

        if ($sentCount > 0) {
            $this->info("✅ Successfully sent {$sentCount} birthday reminder email(s)!");
        } else {
            $this->warn('No reminder emails were sent (possibly due to preferences or no recipients).');
        }

        return Command::SUCCESS;
    }
}
