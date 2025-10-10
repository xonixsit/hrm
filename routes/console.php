<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule competency notification processing
Schedule::command('competency:process-notifications')
    ->dailyAt('09:00')
    ->name('competency-notifications-daily')
    ->description('Process daily competency assessment notifications');

// Schedule reminder notifications (run multiple times per day)
Schedule::command('competency:process-notifications --type=reminders')
    ->twiceDaily(9, 15)
    ->name('competency-reminders')
    ->description('Send assessment reminder notifications');

// Schedule overdue notifications (run daily)
Schedule::command('competency:process-notifications --type=overdue')
    ->dailyAt('10:00')
    ->name('competency-overdue')
    ->description('Send overdue assessment notifications');

// Schedule escalation notifications (run daily)
Schedule::command('competency:process-notifications --type=escalations')
    ->dailyAt('11:00')
    ->name('competency-escalations')
    ->description('Send assessment escalation notifications');
