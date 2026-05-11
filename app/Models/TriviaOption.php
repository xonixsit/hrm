<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TriviaOption extends Model
{
    protected $fillable = [
        'question_id',
        'option_text',
        'is_correct',
        'selection_count'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'selection_count' => 'integer'
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(TriviaQuestion::class, 'question_id');
    }

    public function incrementSelection(): void
    {
        $this->increment('selection_count');
    }
}
