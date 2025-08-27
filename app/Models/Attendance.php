<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use Exception;

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

        $breakDuration = $this->current_break_start->diffInMinutes(now());
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
            'total_break_minutes' => ($this->total_break_minutes ?? 0) + $breakDuration,
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

        try {
            $clockIn = \Carbon\Carbon::parse($this->clock_in);
            $endTime = $this->clock_out ? \Carbon\Carbon::parse($this->clock_out) : now();
            
            $totalMinutes = $clockIn->diffInMinutes($endTime);
            
            // Subtract break time (ensure it's not null)
            $breakMinutes = $this->total_break_minutes ?? 0;
            
            // Add current break if on break
            if ($this->on_break && $this->current_break_start) {
                $breakStart = \Carbon\Carbon::parse($this->current_break_start);
                $breakMinutes += $breakStart->diffInMinutes(now());
            }

            return max(0, $totalMinutes - $breakMinutes);
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Get formatted work duration
     */
    public function getWorkDurationAttribute()
    {
        // If no clock_in, return dash
        if (!$this->clock_in) {
            return '-';
        }
        
        // If no clock_out, return "Working" for active records
        if (!$this->clock_out) {
            return 'Working';
        }
        
        try {
            // Simple calculation using Carbon
            $clockIn = \Carbon\Carbon::parse($this->clock_in);
            $clockOut = \Carbon\Carbon::parse($this->clock_out);
            
            // Check if clock_out is before clock_in (invalid data)
            if ($clockOut->lt($clockIn)) {
                return '-';
            }
            
            $totalMinutes = $clockIn->diffInMinutes($clockOut);
            
            // Subtract break time if any
            $breakMinutes = $this->total_break_minutes ?? 0;
            $workMinutes = max(0, $totalMinutes - $breakMinutes);
            
            $hours = floor($workMinutes / 60);
            $mins = $workMinutes % 60;
            
            return $hours . 'h ' . $mins . 'm';
        } catch (Exception $e) {
            return '-';
        }
    }

    /**
     * Get formatted break duration
     */
    public function getBreakDurationAttribute()
    {
        $breakMinutes = $this->total_break_minutes ?? 0;
        
        // Add current break if on break
        if ($this->on_break && $this->current_break_start) {
            try {
                $breakMinutes += $this->current_break_start->diffInMinutes(now());
            } catch (Exception $e) {
                // Handle invalid date format
            }
        }
        
        // If no breaks, return dash
        if ($breakMinutes <= 0) {
            return '-';
        }
        
        $hours = floor($breakMinutes / 60);
        $mins = $breakMinutes % 60;
        
        return $hours . 'h ' . $mins . 'm';
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
