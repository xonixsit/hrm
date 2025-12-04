<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BirthdayService;

class SendBirthdayWishes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'birthday:send-wishes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send birthday wishes to employees with birthdays today';

    /**
     * Execute the console command.
     */
    public function handle(BirthdayService $birthdayService)
    {
        $this->info('Sending birthday wishes...');
        
        $sentCount = $birthdayService->sendBirthdayWishes();
        
        if ($sentCount > 0) {
            $this->info("Birthday wishes sent to {$sentCount} employees.");
        } else {
            $this->info('No birthday wishes to send today.');
        }
        
        return Command::SUCCESS;
    }
}