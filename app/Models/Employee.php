<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_code',
        'department_id',
        'job_title',
        'join_date',
        'exit_date',
        'exit_reason',
        'exit_notes',
        'exit_processed_at',
        'exit_processed_by',
        'contract_type',
        'photo',
        'phone',
        'address',
        'status',
    ];

    protected $casts = [
        'join_date' => 'date',
        'exit_date' => 'date',
        'exit_processed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function exitProcessedBy()
    {
        return $this->belongsTo(User::class, 'exit_processed_by');
    }

    public function managedDepartments()
    {
        return $this->hasMany(Department::class, 'manager_id');
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active' && is_null($this->exit_date);
    }

    public function hasExited()
    {
        return !is_null($this->exit_date);
    }
}
