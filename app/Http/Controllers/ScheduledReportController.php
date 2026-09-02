<?php

namespace App\Http\Controllers;

use App\Models\ScheduledReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduledReportController extends Controller
{
    public function __construct()
    {
        // Only admins can manage scheduled reports
        $this->middleware(function ($request, $next) {
            abort_unless(Auth::user()?->hasRole('Admin'), 403);
            return $next($request);
        });
    }

    // ── List all schedules ────────────────────────────────────────────────────

    public function index()
    {
        $schedules = ScheduledReport::with('creator')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($s) => $this->format($s));

        return response()->json(['schedules' => $schedules]);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'report_type'    => 'required|in:attendance,leaves,timesheets,feedbacks',
            'report_format'  => 'required|in:pdf,excel',
            'label'          => 'nullable|string|max:100',
            'frequency'      => 'required|in:daily,weekly,monthly',
            'day_of_week'    => 'nullable|integer|between:0,6',
            'day_of_month'   => 'nullable|integer|between:1,28',
            'send_time'      => ['required', 'regex:/^\d{2}:\d{2}$/'],
            'recipients'     => 'required|array|min:1',
            'recipients.*'   => 'email',
        ]);

        $schedule = ScheduledReport::create([
            ...$validated,
            'created_by' => Auth::id(),
            'is_active'  => true,
        ]);

        // Calculate and store next run time
        $schedule->update(['next_run_at' => $schedule->calculateNextRun()]);

        return response()->json([
            'success'  => true,
            'schedule' => $this->format($schedule),
            'message'  => 'Schedule created successfully.',
        ]);
    }

    // ── Toggle active ─────────────────────────────────────────────────────────

    public function toggleActive(ScheduledReport $scheduledReport)
    {
        $scheduledReport->update(['is_active' => ! $scheduledReport->is_active]);

        // Recalculate next run when re-activating
        if ($scheduledReport->is_active) {
            $scheduledReport->update(['next_run_at' => $scheduledReport->calculateNextRun()]);
        }

        return response()->json([
            'success'   => true,
            'is_active' => $scheduledReport->is_active,
        ]);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function destroy(ScheduledReport $scheduledReport)
    {
        $scheduledReport->delete();
        return response()->json(['success' => true]);
    }

    // ── Manual send now ───────────────────────────────────────────────────────

    public function sendNow(ScheduledReport $scheduledReport)
    {
        try {
            $command = new \App\Console\Commands\SendScheduledReports();
            $ref     = new \ReflectionClass($command);

            $tmpDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'xonixshr-reports';
            if (! is_dir($tmpDir)) mkdir($tmpDir, 0755, true);

            $now = now();

            // Force Excel to avoid DomPDF memory exhaustion in web requests
            $genMethod = $ref->getMethod('generateFile');
            $genMethod->setAccessible(true);
            [$filePath, $fileName] = $genMethod->invoke($command, $scheduledReport, $tmpDir, $now, true);

            foreach ($scheduledReport->recipients as $email) {
                \Illuminate\Support\Facades\Mail::to(trim($email))
                    ->send(new \App\Mail\ScheduledReportMail($scheduledReport, $filePath, $fileName));
            }

            if (file_exists($filePath)) unlink($filePath);

            $scheduledReport->update([
                'last_sent_at' => $now,
                'next_run_at'  => $scheduledReport->calculateNextRun($now),
            ]);

            return response()->json(['success' => true, 'message' => 'Report sent successfully.']);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'file'    => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function format(ScheduledReport $s): array
    {
        return [
            'id'            => $s->id,
            'report_type'   => $s->report_type,
            'report_type_label' => $s->report_type_label,
            'report_format' => $s->report_format,
            'label'         => $s->label,
            'frequency'     => $s->frequency,
            'frequency_label' => $s->frequency_label,
            'day_of_week'   => $s->day_of_week,
            'day_of_week_label' => $s->day_of_week !== null
                ? ScheduledReport::daysOfWeek()[$s->day_of_week] : null,
            'day_of_month'  => $s->day_of_month,
            'send_time'     => $s->send_time,
            'recipients'    => $s->recipients,
            'is_active'     => $s->is_active,
            'last_sent_at'  => $s->last_sent_at?->format('d M Y H:i'),
            'next_run_at'   => $s->next_run_at?->format('d M Y H:i'),
            'created_by'    => $s->creator?->name,
            'created_at'    => $s->created_at->format('d M Y'),
        ];
    }
}
