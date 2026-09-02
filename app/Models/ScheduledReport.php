<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledReport extends Model
{
    protected $fillable = [
        'created_by', 'report_type', 'report_format', 'label',
        'frequency', 'day_of_week', 'day_of_month', 'send_time',
        'recipients', 'is_active', 'last_sent_at', 'next_run_at',
    ];

    protected $casts = [
        'recipients'   => 'array',
        'is_active'    => 'boolean',
        'last_sent_at' => 'datetime',
        'next_run_at'  => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Static lookups ────────────────────────────────────────────────────────

    public static function reportTypes(): array
    {
        return [
            'attendance'  => 'Attendance Report',
            'leaves'      => 'Leave Report',
            'timesheets'  => 'Timesheet Report',
            'feedbacks'   => 'Feedback Report',
        ];
    }

    public static function frequencies(): array
    {
        return [
            'daily'   => 'Daily',
            'weekly'  => 'Weekly',
            'monthly' => 'Monthly',
        ];
    }

    public static function daysOfWeek(): array
    {
        return [
            0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday',
            3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday',
        ];
    }

    // ── Next run calculation ──────────────────────────────────────────────────

    public function calculateNextRun(?Carbon $from = null): Carbon
    {
        $from = $from ?? Carbon::now();
        [$hour, $minute] = explode(':', $this->send_time);

        return match ($this->frequency) {
            'daily' => $this->nextDaily($from, (int) $hour, (int) $minute),
            'weekly' => $this->nextWeekly($from, (int) $hour, (int) $minute),
            'monthly' => $this->nextMonthly($from, (int) $hour, (int) $minute),
            default => $from->addDay(),
        };
    }

    private function nextDaily(Carbon $from, int $h, int $m): Carbon
    {
        $candidate = $from->copy()->setTime($h, $m, 0);
        return $candidate->lte($from) ? $candidate->addDay() : $candidate;
    }

    private function nextWeekly(Carbon $from, int $h, int $m): Carbon
    {
        $dow = $this->day_of_week ?? 1; // Monday default
        $candidate = $from->copy()->next($dow)->setTime($h, $m, 0);
        // If today is the target day but time hasn't passed yet
        if ($from->dayOfWeek === $dow) {
            $today = $from->copy()->setTime($h, $m, 0);
            if ($today->gt($from)) return $today;
        }
        return $candidate;
    }

    private function nextMonthly(Carbon $from, int $h, int $m): Carbon
    {
        $dom = min($this->day_of_month ?? 1, 28);
        $candidate = $from->copy()->setDay($dom)->setTime($h, $m, 0);
        return $candidate->lte($from) ? $candidate->addMonth() : $candidate;
    }

    // ── Accessor ──────────────────────────────────────────────────────────────

    public function getFrequencyLabelAttribute(): string
    {
        return self::frequencies()[$this->frequency] ?? $this->frequency;
    }

    public function getReportTypeLabelAttribute(): string
    {
        return self::reportTypes()[$this->report_type] ?? $this->report_type;
    }
}
