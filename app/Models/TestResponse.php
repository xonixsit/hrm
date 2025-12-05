<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_session_id',
        'employee_id',
        'skill_test_id',
        'total_score',
        'percentage_score',
        'passed',
        'review_status',
        'submitted_at',
    ];

    protected $casts = [
        'total_score' => 'decimal:2',
        'percentage_score' => 'decimal:2',
        'passed' => 'boolean',
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function testSession()
    {
        return $this->belongsTo(TestSession::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function skillTest()
    {
        return $this->belongsTo(SkillTest::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    // Scopes
    public function scopeAutoScored($query)
    {
        return $query->where('review_status', 'auto_scored');
    }

    public function scopePendingReview($query)
    {
        return $query->where('review_status', 'pending_review');
    }

    public function scopeReviewed($query)
    {
        return $query->where('review_status', 'reviewed');
    }

    public function scopePassed($query)
    {
        return $query->where('passed', true);
    }

    public function scopeFailed($query)
    {
        return $query->where('passed', false);
    }

    public function scopeByReviewStatus($query, $status)
    {
        return $query->where('review_status', $status);
    }

    // Helper methods
    public function isPassed()
    {
        return $this->passed === true;
    }

    public function isFailed()
    {
        return $this->passed === false;
    }

    public function isAutoScored()
    {
        return $this->review_status === 'auto_scored';
    }

    public function isPendingReview()
    {
        return $this->review_status === 'pending_review';
    }

    public function isReviewed()
    {
        return $this->review_status === 'reviewed';
    }

    public function getAnswerCount()
    {
        return $this->answers()->count();
    }

    public function getCorrectAnswerCount()
    {
        return $this->answers()->where('is_correct', true)->count();
    }

    public function getIncorrectAnswerCount()
    {
        return $this->answers()->where('is_correct', false)->count();
    }

    public function getUnansweredCount()
    {
        return $this->answers()->whereNull('is_correct')->count();
    }
}
