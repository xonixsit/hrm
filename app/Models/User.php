<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Binkode\ChatSystem\Contracts\IChatEventMaker;

class User extends Authenticatable implements IChatEventMaker
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'password_reset_required',
        'coins',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function managedEmployees()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    public function assessments()
    {
        return $this->hasMany(CompetencyAssessment::class, 'assessor_id');
    }

    public function emailPreferences()
    {
        return $this->hasOne(EmailPreference::class);
    }

    /**
     * Get email preferences for this user (create if not exists)
     */
    public function getEmailPreferences(): EmailPreference
    {
        return EmailPreference::getForUser($this);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'user_one_id')
            ->orWhere('user_two_id', $this->id);
    }

    public function sentMessages()
    {
        return $this->hasMany(TeamMessage::class, 'sender_id');
    }

    public function getConversations()
    {
        return Conversation::where('user_one_id', $this->id)
            ->orWhere('user_two_id', $this->id)
            ->with(['userOne', 'userTwo', 'lastMessage'])
            ->orderBy('last_message_at', 'desc')
            ->get();
    }

    public function getConversationWithUser(int $otherUserId): ?Conversation
    {
        return Conversation::betweenUsers($this->id, $otherUserId)->first();
    }

    public function createConversationWithUser(int $otherUserId): Conversation
    {
        $conversation = Conversation::betweenUsers($this->id, $otherUserId)->first();
        
        if (!$conversation) {
            // Ensure user_one_id < user_two_id for uniqueness
            $userOneId = min($this->id, $otherUserId);
            $userTwoId = max($this->id, $otherUserId);
            
            $conversation = Conversation::create([
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId,
            ]);
        }
        
        return $conversation;
    }

    /**
     * Implement chatEventMakers method from IChatEventMaker interface
     * Returns the relationship for chat events created by this user
     */
    public function chatEventMakers(\Illuminate\Database\Eloquent\Model $model = null, $id = null, $type = null, $made_id = null, $made_type = null)
    {
        return $this->morphMany(\Binkode\ChatSystem\Models\ChatEvent::class, 'maker');
    }
}
