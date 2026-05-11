<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TriviaGameSession extends Model
{
    protected $fillable = [
        'employee_id',
        'score',
        'floors_climbed',
        'correct_answers',
        'total_questions',
        'time_taken_seconds',
        'completed_at'
    ];

    protected $casts = [
        'score' => 'integer',
        'floors_climbed' => 'integer',
        'correct_answers' => 'integer',
        'total_questions' => 'integer',
        'time_taken_seconds' => 'integer',
        'completed_at' => 'datetime'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TriviaGameAnswer::class, 'session_id');
    }
}
