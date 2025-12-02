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

        // Send birthday wishes every day at 8:00 AM
        $schedule->command('birthday:send-wishes')
                 ->dailyAt('08:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send birthday reminders every Monday at 9:00 AM
        $schedule->command('birthday:send-reminders')
                 ->weeklyOn(1, '09:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send daily clock-in reminders at 6:00 AM
        $schedule->command('attendance:send-clock-in-reminders')
                 ->dailyAt('06:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send daily work reports summary at 7:00 AM
        $schedule->command('reports:send-daily-work-reports')
                 ->dailyAt('07:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send daily attendance summary at 7:30 AM
        $schedule->command('reports:send-daily-attendance')
                 ->dailyAt('07:30')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Send daily work reports summary at 8:00 AM
        $schedule->command('reports:send-daily-work-reports')
                 ->dailyAt('08:00')
                 ->withoutOverlapping()
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