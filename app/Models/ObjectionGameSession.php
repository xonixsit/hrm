<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ObjectionGameSession extends Model
{
    protected $fillable = [
        'employee_id',
        'score',
        'correct_matches',
        'total_attempts',
        'time_taken_seconds',
        'completed_at'
    ];

    protected $casts = [
        'score' => 'integer',
        'correct_matches' => 'integer',
        'total_attempts' => 'integer',
        'time_taken_seconds' => 'integer',
        'completed_at' => 'datetime'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ObjectionGameAttempt::class, 'session_id');
    }
}
