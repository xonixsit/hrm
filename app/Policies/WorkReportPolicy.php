<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkReport;
use Illuminate\Auth\Access\HandlesAuthorization;

class WorkReportPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\WorkReport  $workReport
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, WorkReport $workReport)
    {
        if ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR')) {
            return true;
        }

        // Employees can only view their own work reports
        return $user->employee && $workReport->employee_id === $user->employee->id;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']) && $user->employee;
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\WorkReport  $workReport
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, WorkReport $workReport)
    {
        if ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR')) {
            return true;
        }

        // Employees can only update their own work reports
        return $user->employee && $workReport->employee_id === $user->employee->id;
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\WorkReport  $workReport
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, WorkReport $workReport)
    {
        if ($user->hasRole('Admin') || $user->hasRole('HR')) {
            return true;
        }

        if ($user->hasRole('Manager')) {
            // Managers can delete reports of their team members
            return true;
        }

        // Employees can only delete their own work reports
        return $user->employee && $workReport->employee_id === $user->employee->id;
    }
}