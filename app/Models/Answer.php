<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_response_id',
        'question_id',
        'answer_text',
        'selected_option_id',
        'is_correct',
        'score',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function testResponse()
    {
        return $this->belongsTo(TestResponse::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption()
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }

    public function textReview()
    {
        return $this->hasOne(TextAnswerReview::class);
    }

    // Scopes
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }

    public function scopeUnanswered($query)
    {
        return $query->whereNull('is_correct');
    }

    public function scopeScored($query)
    {
        return $query->whereNotNull('score');
    }

    public function scopeUnscored($query)
    {
        return $query->whereNull('score');
    }

    // Helper methods
    public function isCorrect()
    {
        return $this->is_correct === true;
    }

    public function isIncorrect()
    {
        return $this->is_correct === false;
    }

    public function isUnanswered()
    {
        return $this->is_correct === null;
    }

    public function isScored()
    {
        return $this->score !== null;
    }

    public function isTextAnswer()
    {
        return $this->question->isText();
    }

    public function hasReview()
    {
        return $this->textReview !== null;
    }
}
