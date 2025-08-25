<?php

namespace App\Policies;

use App\Models\Leave;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LeavePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view leaves
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Leave $leave): bool
    {
        // Admins and HR can view all leaves
        if ($user->hasAnyRole(['Admin', 'HR', 'Manager'])) {
            return true;
        }
        
        // Employees can view their own leaves
        return $user->employee && $user->employee->id === $leave->employee_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->employee !== null; // User must have an employee record
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Leave $leave): bool
    {
        // Admins and HR can update any leave
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }
        
        // Employees can only update their own pending leaves
        if ($user->employee && $user->employee->id === $leave->employee_id) {
            return $leave->status === 'pending';
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Leave $leave): bool
    {
        // Admins can delete any leave
        if ($user->hasRole('Admin')) {
            return true;
        }
        
        // Employees can only delete their own pending leaves
        if ($user->employee && $user->employee->id === $leave->employee_id) {
            return $leave->status === 'pending';
        }
        
        return false;
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Leave $leave): bool
    {
        // Only Admins, HR, and Managers can approve leaves
        if (!$user->hasAnyRole(['Admin', 'HR', 'Manager'])) {
            return false;
        }
        
        // Can only approve pending leaves
        if ($leave->status !== 'pending') {
            return false;
        }
        
        // Users cannot approve their own leaves
        if ($user->employee && $user->employee->id === $leave->employee_id) {
            return false;
        }
        
        return true;
    }

    /**
     * Determine whether the user can reject the model.
     */
    public function reject(User $user, Leave $leave): bool
    {
        // Same logic as approve
        return $this->approve($user, $leave);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Leave $leave): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Leave $leave): bool
    {
        return $user->hasRole('Admin');
    }
}
