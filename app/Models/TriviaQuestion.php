<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TriviaQuestion extends Model
{
    protected $fillable = [
        'question_text',
        'category',
        'difficulty',
        'explanation',
        'source',
        'active',
        'usage_count',
        'correct_count',
        'incorrect_count'
    ];

    protected $casts = [
        'active' => 'boolean',
        'usage_count' => 'integer',
        'correct_count' => 'integer',
        'incorrect_count' => 'integer'
    ];

    public function options(): HasMany
    {
        return $this->hasMany(TriviaOption::class, 'question_id');
    }

    public function correctOption(): HasMany
    {
        return $this->options()->where('is_correct', true);
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    public function recordAnswer(bool $isCorrect): void
    {
        if ($isCorrect) {
            $this->increment('correct_count');
        } else {
            $this->increment('incorrect_count');
        }
    }

    public function getAccuracyRateAttribute(): float
    {
        $total = $this->correct_count + $this->incorrect_count;
        return $total > 0 ? ($this->correct_count / $total) * 100 : 0;
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
