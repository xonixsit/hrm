<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'last_message_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TeamMessage::class, 'conversation_id')->orderBy('created_at', 'asc');
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(TeamMessage::class, 'last_message_id');
    }

    public function getOtherUser(int $userId): ?User
    {
        if ($this->user_one_id === $userId) {
            return $this->userTwo;
        }
        if ($this->user_two_id === $userId) {
            return $this->userOne;
        }
        return null;
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId);
    }

    public function scopeBetweenUsers($query, $userOneId, $userTwoId)
    {
        return $query->where(function ($q) use ($userOneId, $userTwoId) {
            $q->where('user_one_id', $userOneId)
                ->where('user_two_id', $userTwoId);
        })->orWhere(function ($q) use ($userOneId, $userTwoId) {
            $q->where('user_one_id', $userTwoId)
                ->where('user_two_id', $userOneId);
        });
    }

    public function unreadCount(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }
}
