<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResponseCard extends Model
{
    protected $fillable = [
        'objection_id',
        'response_text',
        'is_correct',
        'usage_count'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'usage_count' => 'integer'
    ];

    public function objection(): BelongsTo
    {
        return $this->belongsTo(ObjectionCard::class, 'objection_id');
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
