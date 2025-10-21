<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
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
}
