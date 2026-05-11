<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ObjectionCard extends Model
{
    protected $fillable = [
        'objection_text',
        'category',
        'difficulty',
        'tips',
        'active',
        'usage_count'
    ];

    protected $casts = [
        'active' => 'boolean',
        'usage_count' => 'integer'
    ];

    public function responses(): HasMany
    {
        return $this->hasMany(ResponseCard::class, 'objection_id');
    }

    public function correctResponse(): HasMany
    {
        return $this->responses()->where('is_correct', true);
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
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
