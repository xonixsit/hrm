<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use App\Mail\DailyAttendanceSummary;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendDailyAttendanceReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:send-daily-attendance {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily attendance summary to admin, HR, and managers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📅 Generating daily attendance summary...');

        try {
            // Get recipients (Admin, HR, Manager roles)
            $recipients = User::whereHas('roles', function($query) {
                $query->whereIn('name', ['Admin', 'HR', 'Manager']);
            })->get();

            if ($recipients->isEmpty()) {
                $this->warn('No admin, HR, or manager users found.');
                return Command::SUCCESS;
            }

            // Get attendance data for yesterday
            $yesterday = Carbon::yesterday();
            $attendanceData = $this->getAttendanceData($yesterday);

            $this->info("Found {$recipients->count()} recipient(s):");
            foreach ($recipients as $recipient) {
                $roles = $recipient->getRoleNames()->toArray();
                $this->line("  📧 {$recipient->name} ({$recipient->email}) - " . implode(', ', $roles));
            }

            $this->info("\n📊 Attendance Summary for {$yesterday->format('Y-m-d')}:");
            $this->line("  Total Employees: {$attendanceData['total_employees']}");
            $this->line("  Present: {$attendanceData['present_count']}");
            $this->line("  Absent: {$attendanceData['absent_count']}");
            $this->line("  Attendance Rate: {$attendanceData['attendance_rate']}%");
            $this->line("  Late Arrivals: {$attendanceData['late_arrivals']}");

            if ($this->option('dry-run')) {
                $this->warn('DRY RUN: No emails were actually sent.');
                return Command::SUCCESS;
            }

            $sentCount = 0;
            $failedCount = 0;

            foreach ($recipients as $recipient) {
                try {
                    Mail::to($recipient->email)->send(new DailyAttendanceSummary($recipient, $attendanceData, $yesterday));
                    $sentCount++;
                    $this->info("✓ Sent attendance summary to {$recipient->name}");
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send to {$recipient->name}: {$e->getMessage()}");
                    Log::error("Daily attendance report failed for user {$recipient->id}: {$e->getMessage()}");
                    $failedCount++;
                }
            }

            $this->info("\n📊 Summary:");
            $this->info("Emails sent: {$sentCount}");
            $this->info("Failed: {$failedCount}");

            Log::info("Daily attendance reports sent", [
                'date' => $yesterday->format('Y-m-d'),
                'attendance_rate' => $attendanceData['attendance_rate'],
                'sent' => $sentCount,
                'failed' => $failedCount
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to send daily attendance reports: {$e->getMessage()}");
            Log::error("Daily attendance reports command failed: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    /**
     * Get attendance data for the specified date
     */
    private function getAttendanceData(Carbon $date): array
    {
        $dateString = $date->format('Y-m-d');

        // Get all active employees
        $totalEmployees = Employee::active()->count();

        // Get attendance records for the date
        $attendanceRecords = Attendance::whereDate('clock_in', $dateString)
            ->with(['employee.user'])
            ->get();

        $presentCount = $attendanceRecords->count();
        $absentCount = $totalEmployees - $presentCount;
        $attendanceRate = $totalEmployees > 0 ? round(($presentCount / $totalEmployees) * 100, 1) : 0;

        // Calculate late arrivals (assuming 9:00 AM is standard time)
        $standardTime = Carbon::parse($dateString . ' 09:00:00');
        $lateArrivals = $attendanceRecords->filter(function($attendance) use ($standardTime) {
            return Carbon::parse($attendance->clock_in)->gt($standardTime);
        })->count();

        // Get detailed attendance info
        $presentEmployees = $attendanceRecords->map(function($attendance) {
            $clockIn = Carbon::parse($attendance->clock_in);
            $clockOut = $attendance->clock_out ? Carbon::parse($attendance->clock_out) : null;
            $workDuration = $clockOut ? $clockIn->diff($clockOut)->format('%H:%I') : 'Still working';
            
            return [
                'name' => $attendance->employee->user->name ?? 'Unknown',
                'clock_in' => $clockIn->format('H:i'),
                'clock_out' => $clockOut ? $clockOut->format('H:i') : null,
                'work_duration' => $workDuration,
                'is_late' => $clockIn->gt(Carbon::parse($attendance->clock_in->format('Y-m-d') . ' 09:00:00')),
            ];
        })->toArray();

        // Get absent employees
        $presentEmployeeIds = $attendanceRecords->pluck('employee_id')->toArray();
        $absentEmployees = Employee::active()
            ->whereNotIn('id', $presentEmployeeIds)
            ->with('user')
            ->get()
            ->map(function($employee) {
                return [
                    'name' => $employee->user->name ?? 'Unknown',
                    'employee_id' => $employee->employee_id,
                ];
            })->toArray();

        // Get top performers by work hours
        $topPerformers = $attendanceRecords->filter(function($attendance) {
            return $attendance->clock_out !== null;
        })->map(function($attendance) {
            $clockIn = Carbon::parse($attendance->clock_in);
            $clockOut = Carbon::parse($attendance->clock_out);
            $workMinutes = $clockIn->diffInMinutes($clockOut);
            
            return [
                'name' => $attendance->employee->user->name ?? 'Unknown',
                'work_hours' => sprintf('%dh %dm', floor($workMinutes / 60), $workMinutes % 60),
                'work_minutes' => $workMinutes,
                'clock_in' => $clockIn->format('H:i'),
                'clock_out' => $clockOut->format('H:i'),
                'is_late' => $clockIn->gt(Carbon::parse($attendance->clock_in->format('Y-m-d') . ' 09:00:00')),
            ];
        })->sortByDesc('work_minutes')->take(5)->values()->toArray();

        return [
            'date' => $dateString,
            'total_employees' => $totalEmployees,
            'present_count' => $presentCount,
            'absent_count' => $absentCount,
            'attendance_rate' => $attendanceRate,
            'late_arrivals' => $lateArrivals,
            'present_employees' => $presentEmployees,
            'absent_employees' => $absentEmployees,
            'average_work_hours' => $this->calculateAverageWorkHours($attendanceRecords),
            'top_performers' => $topPerformers,
        ];
    }

    /**
     * Calculate average work hours for the day
     */
    private function calculateAverageWorkHours($attendanceRecords): string
    {
        $totalMinutes = 0;
        $completedShifts = 0;

        foreach ($attendanceRecords as $attendance) {
            if ($attendance->clock_out) {
                $clockIn = Carbon::parse($attendance->clock_in);
                $clockOut = Carbon::parse($attendance->clock_out);
                $totalMinutes += $clockIn->diffInMinutes($clockOut);
                $completedShifts++;
            }
        }

        if ($completedShifts === 0) {
            return '0h 0m';
        }

        $averageMinutes = $totalMinutes / $completedShifts;
        $hours = floor($averageMinutes / 60);
        $minutes = $averageMinutes % 60;

        return sprintf('%dh %dm', $hours, $minutes);
    }
}