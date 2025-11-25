<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;
use App\Mail\ClockInReminder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendClockInReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:send-clock-in-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily clock-in reminder emails to all active employees';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to send clock-in reminder emails...');

        try {
            // Get all active employees with Employee role
            $employees = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    });
                })
                ->with(['user'])
                ->get();

            $sentCount = 0;
            $failedCount = 0;

            foreach ($employees as $employee) {
                try {
                    if ($employee->user && $employee->user->email) {
                        Mail::to($employee->user->email)->send(new ClockInReminder($employee));
                        $sentCount++;
                        $this->info("✓ Sent reminder to {$employee->user->name} ({$employee->user->email})");
                    } else {
                        $this->warn("⚠ Skipped employee ID {$employee->id} - no valid email");
                        $failedCount++;
                    }
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send to {$employee->user->name}: {$e->getMessage()}");
                    Log::error("Clock-in reminder failed for employee {$employee->id}: {$e->getMessage()}");
                    $failedCount++;
                }
            }

            $this->info("\n📊 Summary:");
            $this->info("Total employees: " . $employees->count());
            $this->info("Emails sent: {$sentCount}");
            $this->info("Failed: {$failedCount}");

            Log::info("Clock-in reminders sent", [
                'total_employees' => $employees->count(),
                'sent' => $sentCount,
                'failed' => $failedCount
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to send clock-in reminders: {$e->getMessage()}");
            Log::error("Clock-in reminder command failed: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}