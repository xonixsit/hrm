<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedUser extends Model
{
    protected $fillable = [
        'blocker_id',
        'blocked_id',
    ];

    /**
     * The user who blocked someone
     */
    public function blocker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }

    /**
     * The user who was blocked
     */
    public function blocked(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }

    /**
     * Check if a user has blocked another user
     */
    public static function isBlocked(int $blockerId, int $blockedId): bool
    {
        return self::where('blocker_id', $blockerId)
            ->where('blocked_id', $blockedId)
            ->exists();
    }

    /**
     * Check if either user has blocked the other
     */
    public static function isBlockedBetween(int $userId1, int $userId2): bool
    {
        return self::where(function ($query) use ($userId1, $userId2) {
            $query->where('blocker_id', $userId1)->where('blocked_id', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('blocker_id', $userId2)->where('blocked_id', $userId1);
        })->exists();
    }
}
