<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Auth\Access\HandlesAuthorization;

class EmployeePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any employees.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can view the employee.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Employee $employee)
    {
        // Admin and HR can view all employees
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view employees in their department
        if ($user->hasRole('Manager') && $user->employee) {
            return $employee->department_id === $user->employee->department_id;
        }

        // Employees can view their own profile and colleagues in same department
        if ($user->employee) {
            return $employee->id === $user->employee->id || 
                   $employee->department_id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create employees.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can update the employee.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Employee $employee)
    {
        // Admin and HR can update all employees
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Employees can update their own profile (limited fields)
        return $user->employee && $employee->id === $user->employee->id;
    }

    /**
     * Determine whether the user can delete the employee.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Employee $employee)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can view employee competencies.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewCompetencies(User $user, Employee $employee)
    {
        // Admin and HR can view all employee competencies
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view competencies of employees in their department
        if ($user->hasRole('Manager') && $user->employee) {
            return $employee->department_id === $user->employee->department_id;
        }

        // Employees can view their own competencies
        return $user->employee && $employee->id === $user->employee->id;
    }

    /**
     * Determine whether the user can assess employee competencies.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function assessCompetencies(User $user, Employee $employee)
    {
        // Admin and HR can assess any employee
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can assess employees in their department
        if ($user->hasRole('Manager') && $user->employee) {
            return $employee->department_id === $user->employee->department_id;
        }

        // Employees can self-assess
        return $user->employee && $employee->id === $user->employee->id;
    }

    /**
     * Determine whether the user can view employee competency assessments.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewCompetencyAssessments(User $user, Employee $employee)
    {
        // Admin and HR can view all assessments
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view assessments for their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $employee->department_id === $user->employee->department_id;
        }

        // Employees can view their own assessments
        return $user->employee && $employee->id === $user->employee->id;
    }

    /**
     * Determine whether the user can create development plans for the employee.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function createDevelopmentPlan(User $user, Employee $employee)
    {
        // Admin and HR can create development plans for any employee
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can create development plans for their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $employee->department_id === $user->employee->department_id;
        }

        // Employees can create their own development plans
        return $user->employee && $employee->id === $user->employee->id;
    }

    /**
     * Determine whether the user can view employee development plans.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewDevelopmentPlans(User $user, Employee $employee)
    {
        return $this->viewCompetencyAssessments($user, $employee);
    }

    /**
     * Determine whether the user can manage employee competency framework access.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Employee  $employee
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function manageCompetencyFramework(User $user, Employee $employee)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }
}