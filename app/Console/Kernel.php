<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send daily digests at 9:00 AM every day
        $schedule->command('notifications:send-daily-digests')
                 ->dailyAt('09:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send weekly digests every Monday at 9:00 AM
        $schedule->command('notifications:send-weekly-digests')
                 ->weeklyOn(1, '09:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send pending reminders every 4 hours
        $schedule->command('notifications:send-pending-reminders')
                 ->everyFourHours()
                 ->withoutOverlapping()
                 ->runInBackground();

        // Process the queue every minute
        $schedule->command('queue:work --stop-when-empty')
                 ->everyMinute()
                 ->withoutOverlapping()
                 ->runInBackground();

        // Clean up old failed jobs weekly
        $schedule->command('queue:prune-failed --hours=168')
                 ->weekly()
                 ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}