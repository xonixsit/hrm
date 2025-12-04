<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BirthdayService;

class SendBirthdayReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send birthday reminders to all employees about upcoming birthdays';

    /**
     * Execute the console command.
     */
    public function handle(BirthdayService $birthdayService)
    {
        $this->info('Sending birthday reminders...');
        
        $sentCount = $birthdayService->sendBirthdayReminders();
        
        if ($sentCount > 0) {
            $this->info("Birthday reminders sent to {$sentCount} employees.");
        } else {
            $this->info('No birthday reminders to send.');
        }
        
        return Command::SUCCESS;
    }
}