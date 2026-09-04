<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Binkode\ChatSystem\Models\Message;
use Binkode\ChatSystem\Models\Conversation;

class PinnedMessage extends Model
{
    protected $fillable = ['conversation_id', 'message_id', 'pinned_by'];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function pinnedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pinned_by');
    }
}
