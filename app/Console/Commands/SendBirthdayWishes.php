<?php

namespace App\Console\Commands;

use App\Services\BirthdayService;
use Illuminate\Console\Command;

class SendBirthdayWishes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:send-wishes {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send birthday wishes to employees celebrating their birthday today';

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
        $this->info('🎂 Checking for birthdays today...');

        $birthdayEmployees = $this->birthdayService->getTodaysBirthdays();

        if ($birthdayEmployees->isEmpty()) {
            $this->info('No birthdays today. 😊');
            return Command::SUCCESS;
        }

        $this->info("Found {$birthdayEmployees->count()} birthday(s) today:");

        foreach ($birthdayEmployees as $employee) {
            $age = $employee->getAge();
            $ageText = $age ? " (turning {$age})" : '';
            $this->line("  🎉 {$employee->getFullName()}{$ageText} - {$employee->user->email}");
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN: No emails were actually sent.');
            return Command::SUCCESS;
        }

        $this->info('Sending birthday wishes...');

        $sentCount = $this->birthdayService->sendBirthdayWishes();

        if ($sentCount > 0) {
            $this->info("✅ Successfully sent {$sentCount} birthday wish email(s)!");
        } else {
            $this->warn('No birthday emails were sent (possibly due to preferences or errors).');
        }

        return Command::SUCCESS;
    }
}
