<?php

namespace App\Policies;

use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TimesheetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'HR', 'Manager', 'Employee']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Timesheet $timesheet): bool
    {
        // Admin and HR can view all timesheets
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view their team's timesheets
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            return $teamEmployeeIds->contains($timesheet->employee_id);
        }

        // Employees can only view their own timesheets
        return $user->employee && $user->employee->id === $timesheet->employee_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'HR', 'Manager', 'Employee']) && $user->employee;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Timesheet $timesheet): bool
    {
        // Admin and HR can update any timesheet
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can update their team's timesheets
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            return $teamEmployeeIds->contains($timesheet->employee_id);
        }

        // Employees can only update their own pending timesheets
        return $user->employee && 
               $user->employee->id === $timesheet->employee_id && 
               $timesheet->status === 'pending';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Timesheet $timesheet): bool
    {
        // Admin and HR can delete any timesheet
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can delete their team's pending timesheets
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            return $teamEmployeeIds->contains($timesheet->employee_id) && $timesheet->status === 'pending';
        }

        // Employees can only delete their own pending timesheets
        return $user->employee && 
               $user->employee->id === $timesheet->employee_id && 
               $timesheet->status === 'pending';
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Timesheet $timesheet): bool
    {
        // Admin and HR can approve any timesheet
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can approve their team's timesheets
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            return $teamEmployeeIds->contains($timesheet->employee_id) && $timesheet->status === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Timesheet $timesheet): bool
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Timesheet $timesheet): bool
    {
        return $user->hasRole('Admin');
    }
}