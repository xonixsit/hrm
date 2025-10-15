<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendWeeklyDigests extends Command
{
    protected $signature = 'notifications:send-weekly-digests';
    protected $description = 'Send weekly digest emails to users who have opted in';

    public function handle(NotificationService $notificationService): int
    {
        $this->info('Sending weekly digests...');
        
        $notificationService->sendWeeklyDigests();
        
        $this->info('Weekly digests have been queued for sending.');
        
        return Command::SUCCESS;
    }
}