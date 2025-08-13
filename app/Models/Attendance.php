<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'clock_in',
        'clock_out',
        'ip_address',
        'location',
        'break_sessions',
        'current_break_start',
        'on_break',
        'total_break_minutes',
        'latitude',
        'longitude',
        'location_verified',
        'work_minutes',
        'status',
        'edited_by',
        'notes',
    ];

    protected $casts = [
        'break_sessions' => 'array',
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
        'current_break_start' => 'datetime',
        'on_break' => 'boolean',
        'location_verified' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    /**
     * Start a break session
     */
    public function startBreak()
    {
        if ($this->on_break) {
            return false; // Already on break
        }

        $this->update([
            'on_break' => true,
            'current_break_start' => now(),
            'status' => 'on_break'
        ]);

        return true;
    }

    /**
     * End a break session
     */
    public function endBreak()
    {
        if (!$this->on_break || !$this->current_break_start) {
            return false; // Not on break
        }

        $breakDuration = now()->diffInMinutes($this->current_break_start);
        $breakSessions = $this->break_sessions ?? [];
        
        $breakSessions[] = [
            'start' => $this->current_break_start->toISOString(),
            'end' => now()->toISOString(),
            'duration_minutes' => $breakDuration
        ];

        $this->update([
            'on_break' => false,
            'current_break_start' => null,
            'break_sessions' => $breakSessions,
            'total_break_minutes' => $this->total_break_minutes + $breakDuration,
            'status' => 'clocked_in'
        ]);

        return true;
    }

    /**
     * Calculate total work minutes excluding breaks
     */
    public function calculateWorkMinutes()
    {
        if (!$this->clock_in) {
            return 0;
        }

        $endTime = $this->clock_out ?? now();
        $totalMinutes = $this->clock_in->diffInMinutes($endTime);
        
        // Subtract break time
        $breakMinutes = $this->total_break_minutes;
        
        // Add current break if on break
        if ($this->on_break && $this->current_break_start) {
            $breakMinutes += now()->diffInMinutes($this->current_break_start);
        }

        return max(0, $totalMinutes - $breakMinutes);
    }

    /**
     * Get formatted work duration
     */
    public function getWorkDurationAttribute()
    {
        $minutes = $this->calculateWorkMinutes();
        $hours = intval($minutes / 60);
        $mins = $minutes % 60;
        
        return sprintf('%dh %dm', $hours, $mins);
    }

    /**
     * Get formatted break duration
     */
    public function getBreakDurationAttribute()
    {
        $minutes = $this->total_break_minutes;
        
        // Add current break if on break
        if ($this->on_break && $this->current_break_start) {
            $minutes += now()->diffInMinutes($this->current_break_start);
        }
        
        $hours = intval($minutes / 60);
        $mins = $minutes % 60;
        
        return sprintf('%dh %dm', $hours, $mins);
    }

    /**
     * Check if employee is currently clocked in
     */
    public function isClockedIn()
    {
        return $this->status === 'clocked_in' || $this->status === 'on_break';
    }

    /**
     * Get current session duration in real-time
     */
    public function getCurrentSessionDuration()
    {
        if (!$this->clock_in || $this->clock_out) {
            return '0h 0m 0s';
        }

        $now = now();
        $totalSeconds = $this->clock_in->diffInSeconds($now);
        
        // Subtract break time in seconds
        $breakSeconds = $this->total_break_minutes * 60;
        
        // Add current break if on break
        if ($this->on_break && $this->current_break_start) {
            $breakSeconds += now()->diffInSeconds($this->current_break_start);
        }

        $workSeconds = max(0, $totalSeconds - $breakSeconds);
        
        $hours = intval($workSeconds / 3600);
        $minutes = intval(($workSeconds % 3600) / 60);
        $seconds = $workSeconds % 60;
        
        return sprintf('%dh %dm %ds', $hours, $minutes, $seconds);
    }

    /**
     * Scope for today's attendance
     */
    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    /**
     * Scope for current week
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope for current month
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year);
    }
}
