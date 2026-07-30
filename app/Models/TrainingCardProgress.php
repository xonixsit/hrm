<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TrainingCardProgress extends Model
{
    protected $table = 'training_card_progress';
    protected $fillable = ['user_id','card_key','interval','repetition_count','ease_factor','last_reviewed_at','next_review_at','stability','state','history'];
    protected $casts = ['history' => 'array', 'last_reviewed_at' => 'datetime', 'next_review_at' => 'datetime'];
}
