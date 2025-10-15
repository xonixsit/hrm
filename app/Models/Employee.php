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
        'manager_id',
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
        // Personal Information
        'date_of_birth',
        'gender',
        'marital_status',
        'nationality',
        'national_id',
        'passport_number',
        // Contact Information
        'personal_email',
        'alternate_phone',
        'permanent_address',
        'current_address',
        // Emergency Contact
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'emergency_contact_email',
        // Employment Details
        'salary',
        'salary_currency',
        'employment_type',
        'work_location',
        'work_start_time',
        'work_end_time',
        // Banking Information
        'bank_name',
        'bank_account_number',
        'bank_routing_number',
        // Additional Information
        'skills',
        'certifications',
        'education',
        'notes',
    ];

    protected $casts = [
        'join_date' => 'date',
        'exit_date' => 'date',
        'exit_processed_at' => 'datetime',
        'date_of_birth' => 'date',
        'work_start_time' => 'datetime:H:i',
        'work_end_time' => 'datetime:H:i',
        'salary' => 'decimal:2',
        'skills' => 'array',
        'certifications' => 'array',
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

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function managedDepartments()
    {
        return $this->hasMany(Department::class, 'manager_id');
    }

    public function competencyAssessments()
    {
        return $this->hasMany(CompetencyAssessment::class);
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

    public function getAge()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function getFullName()
    {
        return $this->user ? $this->user->name : 'Unknown';
    }

    public function getFormattedSalary()
    {
        if (!$this->salary) return null;
        return number_format($this->salary, 2) . ' ' . $this->salary_currency;
    }

    public function getYearsOfService()
    {
        if (!$this->join_date) return 0;
        $endDate = $this->exit_date ?? now();
        return $this->join_date->diffInYears($endDate);
    }

    // Scope methods
    public function scopeActive($query)
    {
        return $query->where('status', 'active')->whereNull('exit_date');
    }

    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }
}
