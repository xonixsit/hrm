<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TextAnswerReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'answer_id',
        'reviewed_by',
        'score',
        'comment',
        'reviewed_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function answer()
    {
        return $this->belongsTo(Answer::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Helper methods
    public function getFormattedReviewedAt()
    {
        return $this->reviewed_at->format('F j, Y - g:i A');
    }
}
