<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendDailyDigests extends Command
{
    protected $signature = 'notifications:send-daily-digests';
    protected $description = 'Send daily digest emails to users who have opted in';

    public function handle(NotificationService $notificationService): int
    {
        $this->info('Sending daily digests...');
        
        $notificationService->sendDailyDigests();
        
        $this->info('Daily digests have been queued for sending.');
        
        return Command::SUCCESS;
    }
}