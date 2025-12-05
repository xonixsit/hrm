<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'skill_test_id',
        'type',
        'question_text',
        'order',
        'points',
    ];

    protected $casts = [
        'points' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function skillTest()
    {
        return $this->belongsTo(SkillTest::class);
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class)->orderBy('order');
    }

    public function textConfig()
    {
        return $this->hasOne(TextQuestionConfig::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeMCQ($query)
    {
        return $query->where('type', 'mcq');
    }

    public function scopeText($query)
    {
        return $query->where('type', 'text');
    }

    public function scopeSingleAnswer($query)
    {
        return $query->where('type', 'single_answer');
    }

    // Helper methods
    public function isMCQ()
    {
        return $this->type === 'mcq';
    }

    public function isText()
    {
        return $this->type === 'text';
    }

    public function isSingleAnswer()
    {
        return $this->type === 'single_answer';
    }

    public function getCorrectOptions()
    {
        return $this->options()->where('is_correct', true)->get();
    }

    public function getCorrectAnswerText()
    {
        $correctOptions = $this->getCorrectOptions();
        return $correctOptions->pluck('option_text')->join(', ');
    }
}
