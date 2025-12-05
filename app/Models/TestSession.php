<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_assignment_id',
        'started_at',
        'submitted_at',
        'time_spent',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function testAssignment()
    {
        return $this->belongsTo(TestAssignment::class);
    }

    public function testResponse()
    {
        return $this->hasOne(TestResponse::class);
    }

    // Scopes
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }

    public function isSubmitted()
    {
        return $this->status === 'submitted';
    }

    public function isExpired()
    {
        return $this->status === 'expired';
    }

    public function getTimeRemaining()
    {
        $skillTest = $this->testAssignment->skillTest;

        if (!$skillTest->time_limit) {
            return null;
        }

        $elapsedSeconds = $this->started_at->diffInSeconds(now());
        $totalSeconds = $skillTest->time_limit * 60;
        $remainingSeconds = max(0, $totalSeconds - $elapsedSeconds);

        return $remainingSeconds;
    }

    public function isTimeExpired()
    {
        $skillTest = $this->testAssignment->skillTest;

        if (!$skillTest->time_limit) {
            return false;
        }

        $elapsedSeconds = $this->started_at->diffInSeconds(now());
        $totalSeconds = $skillTest->time_limit * 60;

        return $elapsedSeconds >= $totalSeconds;
    }

    public function getFormattedTimeRemaining()
    {
        $remainingSeconds = $this->getTimeRemaining();

        if ($remainingSeconds === null) {
            return 'No limit';
        }

        $minutes = floor($remainingSeconds / 60);
        $seconds = $remainingSeconds % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
