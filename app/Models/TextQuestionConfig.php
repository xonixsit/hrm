<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TextQuestionConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'min_characters',
        'max_characters',
        'expected_answer_guidelines',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // Helper methods
    public function hasCharacterLimits()
    {
        return $this->min_characters !== null || $this->max_characters !== null;
    }

    public function validateCharacterCount($text)
    {
        $length = strlen($text);

        if ($this->min_characters !== null && $length < $this->min_characters) {
            return false;
        }

        if ($this->max_characters !== null && $length > $this->max_characters) {
            return false;
        }

        return true;
    }
}
