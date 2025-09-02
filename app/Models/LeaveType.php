<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'quota',
        'description',
        'is_active',
        'requires_approval',
        'max_consecutive_days',
        'min_notice_days',
        'carry_forward',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'requires_approval' => 'boolean',
        'carry_forward' => 'boolean',
    ];

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    /**
     * Scope to get only active leave types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the total days used for this leave type by an employee
     */
    public function getTotalUsedDays($employeeId, $year = null)
    {
        $year = $year ?? now()->year;
        
        return $this->leaves()
            ->where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereYear('from_date', $year)
            ->get()
            ->sum(function ($leave) {
                return $leave->from_date->diffInDays($leave->to_date) + 1;
            });
    }

    /**
     * Get remaining quota for an employee
     */
    public function getRemainingQuota($employeeId, $year = null)
    {
        $usedDays = $this->getTotalUsedDays($employeeId, $year);
        return max(0, $this->quota - $usedDays);
    }
}
