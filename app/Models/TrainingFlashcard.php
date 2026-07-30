<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TrainingFlashcard extends Model
{
    protected $table = 'training_flashcards';
    protected $fillable = ['card_key','module_key','page_number','title','prompt','exact_answer_text','exact_context_snippet','category','key_terms'];
    protected $casts = ['key_terms' => 'array'];
}
