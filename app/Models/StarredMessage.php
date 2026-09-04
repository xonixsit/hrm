<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Binkode\ChatSystem\Models\Message;
use Binkode\ChatSystem\Models\Conversation;

class StarredMessage extends Model
{
    protected $fillable = ['user_id', 'message_id', 'conversation_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
