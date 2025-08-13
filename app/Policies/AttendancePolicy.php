<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AttendancePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and HR can view all attendance records
        // Employees can view their own records
        return $user->hasRole(['Admin', 'HR', 'Employee']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Attendance $attendance): bool
    {
        // Admin and HR can view any attendance record
        if ($user->hasRole(['Admin', 'HR'])) {
            return true;
        }
        
        // Employees can only view their own attendance records
        return $user->employee && $user->employee->id === $attendance->employee_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only employees can create attendance records (clock in/out)
        return $user->hasRole('Employee');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Attendance $attendance): bool
    {
        // Only Admin and HR can edit attendance records
        return $user->hasRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Attendance $attendance): bool
    {
        // Only Admin can delete attendance records
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can export attendance data.
     */
    public function export(User $user, Attendance $attendance): bool
    {
        // Admin and HR can export any attendance record
        if ($user->hasRole(['Admin', 'HR'])) {
            return true;
        }
        
        // Employees can export their own attendance records
        return $user->employee && $user->employee->id === $attendance->employee_id;
    }

    /**
     * Determine whether the user can bulk export attendance data.
     */
    public function bulkExport(User $user): bool
    {
        // Only Admin and HR can bulk export
        return $user->hasRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Attendance $attendance): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Attendance $attendance): bool
    {
        return $user->hasRole('Admin');
    }
}
