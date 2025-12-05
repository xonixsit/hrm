<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class SkillTest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'category',
        'difficulty_level',
        'passing_score',
        'time_limit',
        'max_attempts',
        'randomize_questions',
        'randomize_answers',
        'show_correct_answers',
        'show_explanations',
        'feedback_timing',
        'status',
        'created_by',
    ];

    protected $casts = [
        'randomize_questions' => 'boolean',
        'randomize_answers' => 'boolean',
        'show_correct_answers' => 'boolean',
        'show_explanations' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function testAssignments()
    {
        return $this->hasMany(TestAssignment::class);
    }

    public function testResponses()
    {
        return $this->hasMany(TestResponse::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isPublished()
    {
        return $this->status === 'published';
    }

    public function isDraft()
    {
        return $this->status === 'draft';
    }

    public function isArchived()
    {
        return $this->status === 'archived';
    }

    public function getTotalPoints()
    {
        return $this->questions()->sum('points');
    }

    public function getQuestionCount()
    {
        return $this->questions()->count();
    }
}
