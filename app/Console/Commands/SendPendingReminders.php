<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendPendingReminders extends Command
{
    protected $signature = 'notifications:send-pending-reminders';
    protected $description = 'Send reminder emails for pending actions';

    public function handle(NotificationService $notificationService): int
    {
        $this->info('Sending pending action reminders...');
        
        $notificationService->sendPendingReminders();
        
        $this->info('Pending reminders have been processed.');
        
        return Command::SUCCESS;
    }
}