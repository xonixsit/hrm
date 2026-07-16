<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'is_read',
        'read_at',
        'pending_delivery',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'pending_delivery' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->is_read = true;
            $this->read_at = now();
            $this->save();
        }
    }
}
