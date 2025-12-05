<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'skill_test_id',
        'employee_id',
        'assigned_by',
        'available_from',
        'available_until',
        'max_attempts',
        'status',
    ];

    protected $casts = [
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function skillTest()
    {
        return $this->belongsTo(SkillTest::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function testSessions()
    {
        return $this->hasMany(TestSession::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('available_from')
              ->orWhere('available_from', '<=', now());
        })->where(function ($q) {
            $q->whereNull('available_until')
              ->orWhere('available_until', '>=', now());
        });
    }

    // Helper methods
    public function isAvailable()
    {
        $now = now();

        if ($this->available_from && $now->lt($this->available_from)) {
            return false;
        }

        if ($this->available_until && $now->gt($this->available_until)) {
            return false;
        }

        return true;
    }

    public function isExpired()
    {
        return $this->available_until && now()->gt($this->available_until);
    }

    public function hasAttemptsRemaining()
    {
        $completedSessions = $this->testSessions()
            ->where('status', 'submitted')
            ->count();

        return $completedSessions < $this->max_attempts;
    }

    public function getAttemptsRemaining()
    {
        $completedSessions = $this->testSessions()
            ->where('status', 'submitted')
            ->count();

        return max(0, $this->max_attempts - $completedSessions);
    }
}
