<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TrainingUserStats extends Model
{
    protected $table = 'training_user_stats';
    protected $fillable = ['user_id','streak_days','last_active_date','total_reviews','correct_reviews','daily_goal_cards','reviews_today_count','last_review_date'];
    protected $casts = ['last_active_date' => 'date', 'last_review_date' => 'date'];
}
