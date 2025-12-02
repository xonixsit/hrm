<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Employee;
use App\Mail\DailyWorkReportSummary;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendDailyWorkReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:send-daily-work-reports {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily work reports summary to admin, HR, and managers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📊 Generating daily work reports summary...');

        try {
            // Get recipients (Admin, HR, Manager roles)
            $recipients = User::whereHas('roles', function($query) {
                $query->whereIn('name', ['Admin', 'HR', 'Manager']);
            })->get();

            if ($recipients->isEmpty()) {
                $this->warn('No admin, HR, or manager users found.');
                return Command::SUCCESS;
            }

            // Get work reports data for yesterday
            $yesterday = Carbon::yesterday();
            $workReportsData = $this->getWorkReportsData($yesterday);

            $this->info("Found {$recipients->count()} recipient(s):");
            foreach ($recipients as $recipient) {
                $roles = $recipient->getRoleNames()->toArray();
                $this->line("  📧 {$recipient->name} ({$recipient->email}) - " . implode(', ', $roles));
            }

            $this->info("\n📈 Work Reports Summary for {$yesterday->format('Y-m-d')}:");
            $this->line("  Total Reports: {$workReportsData['total_reports']}");
            $this->line("  Total Emails: {$workReportsData['total_emails']}");
            $this->line("  Total WhatsApp: {$workReportsData['total_whatsapp']}");
            $this->line("  Total Voice Mails: {$workReportsData['total_voice_mails']}");
            $this->line("  Total Interested: {$workReportsData['total_interested']}");
            $this->line("  Total Not Interested: {$workReportsData['total_not_interested']}");
            $this->line("  Active Employees: {$workReportsData['active_employees']}");
            $this->line("  Employees with Reports: {$workReportsData['employees_with_reports']}");

            if ($this->option('dry-run')) {
                $this->warn('DRY RUN: No emails were actually sent.');
                return Command::SUCCESS;
            }

            $sentCount = 0;
            $failedCount = 0;

            foreach ($recipients as $recipient) {
                try {
                    Mail::to($recipient->email)->send(new DailyWorkReportSummary($recipient, $workReportsData, $yesterday));
                    $sentCount++;
                    $this->info("✓ Sent work report summary to {$recipient->name}");
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send to {$recipient->name}: {$e->getMessage()}");
                    Log::error("Daily work report failed for user {$recipient->id}: {$e->getMessage()}");
                    $failedCount++;
                }
            }

            $this->info("\n📊 Summary:");
            $this->info("Emails sent: {$sentCount}");
            $this->info("Failed: {$failedCount}");

            Log::info("Daily work reports sent", [
                'date' => $yesterday->format('Y-m-d'),
                'total_reports' => $workReportsData['total_reports'],
                'sent' => $sentCount,
                'failed' => $failedCount
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to send daily work reports: {$e->getMessage()}");
            Log::error("Daily work reports command failed: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    /**
     * Get work reports data for the specified date
     */
    private function getWorkReportsData(Carbon $date): array
    {
        $dateString = $date->format('Y-m-d');

        // Get work reports for the date
        $workReports = DB::table('work_reports')
            ->whereDate('created_at', $dateString)
            ->get();

        // Get employee details with reports
        $employeesWithReports = DB::table('work_reports')
            ->join('employees', 'work_reports.employee_id', '=', 'employees.id')
            ->join('users', 'employees.user_id', '=', 'users.id')
            ->whereDate('work_reports.created_at', $dateString)
            ->select(
                'employees.id',
                'users.name',
                DB::raw('COUNT(work_reports.id) as report_count'),
                DB::raw('SUM(work_reports.calls) as total_calls'),
                DB::raw('SUM(work_reports.voice_mails) as total_voice_mails'),
                DB::raw('SUM(work_reports.interested_count) as total_interested'),
                DB::raw('SUM(work_reports.not_interested_count) as total_not_interested'),
                DB::raw('SUM(work_reports.emails) as total_emails'),
                DB::raw('SUM(work_reports.whatsapp) as total_whatsapp')
            )
            ->groupBy('employees.id', 'users.name')
            ->orderBy('total_interested', 'desc')
            ->get();

        // Get total active employees
        $activeEmployees = Employee::active()->count();

        return [
            'date' => $dateString,
            'total_reports' => $workReports->count(),
            'total_voice_mails' => $workReports->sum('voice_mails'),
            'total_emails' => $workReports->sum('emails'),
            'total_whatsapp' => $workReports->sum('whatsapp'),
            'total_interested' => $workReports->sum('interested_count'),
            'total_not_interested' => $workReports->sum('not_interested_count'),
            'active_employees' => $activeEmployees,
            'employees_with_reports' => $employeesWithReports->count(),
            'top_performers' => $employeesWithReports->take(5)->toArray(),
            'detailed_reports' => $employeesWithReports->toArray(),
        ];
    }
}