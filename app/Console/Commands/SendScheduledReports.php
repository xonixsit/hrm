<?php

namespace App\Console\Commands;

use App\Mail\ScheduledReportMail;
use App\Models\Attendance;
use App\Models\Feedback;
use App\Models\Leave;
use App\Models\ScheduledReport;
use App\Models\Timesheet;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;

class SendScheduledReports extends Command
{
    protected $signature   = 'reports:send-scheduled {--force : Send all active schedules regardless of next_run_at}';
    protected $description = 'Generate and email scheduled reports that are due';

    public function handle(): int
    {
        $now = Carbon::now();

        $query = ScheduledReport::where('is_active', true);

        if (! $this->option('force')) {
            $query->where(function ($q) use ($now) {
                $q->whereNull('next_run_at')
                  ->orWhere('next_run_at', '<=', $now);
            });
        }

        $due = $query->get();

        if ($due->isEmpty()) {
            $this->info('No scheduled reports due at this time.');
            return self::SUCCESS;
        }

        $this->info("Processing {$due->count()} scheduled report(s)…");

        foreach ($due as $schedule) {
            try {
                $this->processSchedule($schedule, $now);
                $this->line("  ✓ [{$schedule->id}] {$schedule->report_type_label} ({$schedule->frequency})");
            } catch (\Throwable $e) {
                $this->error("  ✗ [{$schedule->id}] Failed: {$e->getMessage()}");
                \Log::error("[ScheduledReport] Failed to send schedule #{$schedule->id}: " . $e->getMessage());
            }
        }

        $this->info('Done.');
        return self::SUCCESS;
    }

    private function processSchedule(ScheduledReport $schedule, Carbon $now): void
    {
        // Bump limits for large datasets
        @ini_set('memory_limit', '256M');
        @set_time_limit(120);

        // Generate the file to a temp path
        $tmpDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'xonixshr-reports';
        if (! is_dir($tmpDir)) mkdir($tmpDir, 0755, true);

        [$filePath, $fileName] = $this->generateFile($schedule, $tmpDir, $now, false);

        // Email to all recipients
        foreach ($schedule->recipients as $email) {
            Mail::to(trim($email))->send(new ScheduledReportMail($schedule, $filePath, $fileName));
        }

        // Clean up temp file
        if (file_exists($filePath)) unlink($filePath);

        // Update timestamps and next run
        $schedule->update([
            'last_sent_at' => $now,
            'next_run_at'  => $schedule->calculateNextRun($now),
        ]);
    }

    private function generateFile(ScheduledReport $schedule, string $tmpDir, Carbon $now, bool $forceExcel = false): array
    {
        $date   = $now->format('Y-m-d');
        $type   = $schedule->report_type;
        $name   = "{$type}-report-{$date}.xlsx";
        $path   = "{$tmpDir}/{$name}";

        // Calculate date range based on frequency
        $dateFrom = match ($schedule->frequency) {
            'daily'   => $now->toDateString(),
            'weekly'  => $now->copy()->subDays(6)->toDateString(),
            'monthly' => $now->copy()->startOfMonth()->toDateString(),
            default   => $now->toDateString(),
        };
        $dateTo = $now->toDateString();

        $export = match ($type) {
            'attendance'  => new \App\Exports\AttendancesExport(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            'leaves'      => new \App\Exports\LeavesExport(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            'timesheets'  => new \App\Exports\TimesheetsExport(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            'feedbacks'   => new \App\Exports\FeedbacksExport(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            default       => throw new \InvalidArgumentException("Unknown report type: {$type}"),
        };

        $contents = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
        file_put_contents($path, $contents);

        return [$path, $name];
    }
}
