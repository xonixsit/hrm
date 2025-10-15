<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Traits\AuditLogTrait;
use App\Notifications\WelcomeEmployeeNotification;

class EmployeeController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {
        $query = Employee::with('department', 'user');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('job_title', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        // Department filter
        if ($request->filled('filter_department')) {
            $departments = is_array($request->filter_department) 
                ? $request->filter_department 
                : explode(',', $request->filter_department);
            $query->whereIn('department_id', $departments);
        }

        // Contract type filter
        if ($request->filled('filter_contract_type')) {
            $contractTypes = is_array($request->filter_contract_type) 
                ? $request->filter_contract_type 
                : explode(',', $request->filter_contract_type);
            $query->whereIn('contract_type', $contractTypes);
        }

        // Status filter
        if ($request->filled('filter_status')) {
            $statuses = is_array($request->filter_status) 
                ? $request->filter_status 
                : explode(',', $request->filter_status);
            $query->whereIn('status', $statuses);
        }

        // Join date range filter
        if ($request->filled('filter_join_date_from')) {
            $query->where('join_date', '>=', $request->filter_join_date_from);
        }
        if ($request->filled('filter_join_date_to')) {
            $query->where('join_date', '<=', $request->filter_join_date_to);
        }
        
        // Joined after filter (for the new date filter)
        if ($request->filled('filter_joined_after')) {
            $query->whereDate('join_date', '>=', $request->filter_joined_after);
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        
        if ($sortBy === 'name') {
            $query->join('users', 'employees.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortDirection)
                  ->select('employees.*');
        } elseif ($sortBy === 'email') {
            $query->join('users', 'employees.user_id', '=', 'users.id')
                  ->orderBy('users.email', $sortDirection)
                  ->select('employees.*');
        } elseif ($sortBy === 'department') {
            $query->join('departments', 'employees.department_id', '=', 'departments.id')
                  ->orderBy('departments.name', $sortDirection)
                  ->select('employees.*');
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = $request->get('per_page', 10);
        $employees = $query->paginate($perPage)->withQueryString();

        // Get filter options
        $departments = Department::select('id', 'name')->orderBy('name')->get();
        $contractTypes = Employee::select('contract_type')
            ->distinct()
            ->whereNotNull('contract_type')
            ->orderBy('contract_type')
            ->pluck('contract_type')->toArray();
        $statuses = Employee::select('status')
            ->distinct()
            ->whereNotNull('status')
            ->orderBy('status')
            ->pluck('status');

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'filters' => [
                'departments' => $departments,
                'contractTypes' => $contractTypes,
                'statuses' => $statuses,
            ],
            'queryParams' => $request->query()
        ]);
    }

    public function create()
    {
        $departments = Department::all();
        $managers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Manager', 'HR']);
        })->select('id', 'name')->get();
        
        return Inertia::render('Employees/Create', [
            'departments' => $departments,
            'managers' => $managers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // User Information
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            
            // Employee Basic Information
            'employee_code' => 'nullable|unique:employees',
            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:users,id',
            'job_title' => 'required|string|max:255',
            'join_date' => 'required|date',
            'contract_type' => 'required|string',
            
            // Personal Information
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'phone' => 'nullable|string|max:20',
            'personal_email' => 'nullable|email',
            'nationality' => 'nullable|string|max:100',
            
            // Address Information
            'current_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            
            // Emergency Contact
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_email' => 'nullable|email',
            
            // Employment Details
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern,consultant',
            'work_location' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|size:3',
        ]);

        // Generate employee code if not provided
        if (empty($validated['employee_code'])) {
            $validated['employee_code'] = $this->generateEmployeeCode($validated['name']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('Employee');

        $employee = Employee::create([
            'user_id' => $user->id,
            'department_id' => $validated['department_id'],
            'manager_id' => $validated['manager_id'],
            'employee_code' => $validated['employee_code'],
            'job_title' => $validated['job_title'],
            'join_date' => $validated['join_date'],
            'contract_type' => $validated['contract_type'],
            
            // Personal Information
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'phone' => $validated['phone'],
            'personal_email' => $validated['personal_email'],
            'nationality' => $validated['nationality'],
            
            // Address Information
            'current_address' => $validated['current_address'],
            'permanent_address' => $validated['permanent_address'],
            
            // Emergency Contact
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_relationship' => $validated['emergency_contact_relationship'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'emergency_contact_email' => $validated['emergency_contact_email'],
            
            // Employment Details
            'employment_type' => $validated['employment_type'] ?? 'full_time',
            'work_location' => $validated['work_location'],
            'salary' => $validated['salary'],
            'salary_currency' => $validated['salary_currency'] ?? 'USD',
        ]);

        // Send welcome email to the employee
        try {
            Log::info('Attempting to send WelcomeEmployeeNotification', ['user_id' => $user->id, 'email' => $user->email]);
            $user->notify(new WelcomeEmployeeNotification($employee));
            Log::info('WelcomeEmployeeNotification sent successfully', ['user_id' => $user->id, 'email' => $user->email]);
        } catch (\Throwable $e) {
            Log::error('Failed to send WelcomeEmployeeNotification', [
                'user_id' => $user->id,
                'email' => $user->email,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        $this->logAudit('Employee Created', 'Created employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    /**
     * Generate a unique employee code
     */
    private function generateEmployeeCode($name)
    {
        $initials = collect(explode(' ', $name))
            ->map(fn($word) => strtoupper(substr($word, 0, 1)))
            ->join('');
        
        $timestamp = now()->format('ymd');
        $baseCode = "EMP{$initials}{$timestamp}";
        
        // Ensure uniqueness
        $counter = 1;
        $code = $baseCode;
        while (Employee::where('employee_code', $code)->exists()) {
            $code = $baseCode . str_pad($counter, 2, '0', STR_PAD_LEFT);
            $counter++;
        }
        
        return $code;
    }

    public function show(Employee $employee)
    {
        $employee->load('department', 'user');
        return Inertia::render('Employees/Show', ['employee' => $employee]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::all();
        $managers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Manager', 'HR']);
        })->select('id', 'name')->get();
        
        $employee->load('department', 'user', 'manager');
        $contractTypes = Employee::select('contract_type')->distinct()->whereNotNull('contract_type')->pluck('contract_type');
        
        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'managers' => $managers,
            'contractTypes' => $contractTypes
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        // Check permissions based on user role
        $user = auth()->user();
        $canEditPersonalInfo = $user->hasAnyRole(['Admin', 'HR']) || $user->id === $employee->user_id;
        $canEditEmploymentInfo = $user->hasAnyRole(['Admin', 'HR', 'Manager']);
        $canEditSalaryInfo = $user->hasAnyRole(['Admin', 'HR']);

        $rules = [
            // Basic employment info (Admin, HR, Manager can edit)
            'department_id' => $canEditEmploymentInfo ? 'required|exists:departments,id' : 'sometimes',
            'manager_id' => $canEditEmploymentInfo ? 'nullable|exists:users,id' : 'sometimes',
            'job_title' => $canEditEmploymentInfo ? 'required|string|max:255' : 'sometimes',
            'employee_code' => $canEditEmploymentInfo ? 'required|unique:employees,employee_code,' . $employee->id : 'sometimes',
            'join_date' => $canEditEmploymentInfo ? 'required|date' : 'sometimes',
            'contract_type' => $canEditEmploymentInfo ? 'required|string' : 'sometimes',
            'employment_type' => $canEditEmploymentInfo ? 'nullable|in:full_time,part_time,contract,intern,consultant' : 'sometimes',
            'work_location' => $canEditEmploymentInfo ? 'nullable|string|max:255' : 'sometimes',
        ];

        // Personal info (Admin, HR, or self can edit)
        if ($canEditPersonalInfo) {
            $rules = array_merge($rules, [
                'name' => 'required|string|max:255',
                'date_of_birth' => 'nullable|date|before:today',
                'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
                'nationality' => 'nullable|string|max:100',
            ]);
        }

        // Contact info (Admin, HR, or self can edit)
        if ($canEditPersonalInfo) {
            $rules = array_merge($rules, [
                'phone' => 'nullable|string|max:20',
                'personal_email' => 'nullable|email',
                'current_address' => 'nullable|string|max:500',
                'permanent_address' => 'nullable|string|max:500',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_relationship' => 'nullable|string|max:100',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_email' => 'nullable|email',
            ]);
        }

        // Salary info (Admin, HR only)
        if ($canEditSalaryInfo) {
            $rules = array_merge($rules, [
                'salary' => 'nullable|numeric|min:0',
                'salary_currency' => 'nullable|string|size:3',
            ]);
        }

        $validated = $request->validate($rules);

        // Update employee record
        $employeeData = collect($validated)->except(['name'])->toArray();
        $employee->update($employeeData);

        // Update user name if provided and allowed
        if (isset($validated['name']) && $canEditPersonalInfo) {
            $employee->user->update(['name' => $validated['name']]);
        }

        $this->logAudit('Employee Updated', 'Updated employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function resetPassword(Request $request, Employee $employee)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can reset employee passwords.');
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Update the employee's user password
        $employee->user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        $this->logAudit('Password Reset', 'Reset password for employee: ' . $employee->employee_code);
        
        return back()->with('success', 'Employee password has been reset successfully.');
    }

    public function markAsExit(Request $request, Employee $employee)
    {
        // Check if user has admin/HR role
        if (!auth()->user()->hasAnyRole(['Admin', 'HR'])) {
            abort(403, 'Only administrators and HR can process employee exits.');
        }

        $validated = $request->validate([
            'exit_date' => 'required|date|before_or_equal:today',
            'exit_reason' => 'required|string|max:255',
            'exit_notes' => 'nullable|string|max:1000',
        ]);

        // Update employee with exit information
        $employee->update([
            'exit_date' => $validated['exit_date'],
            'exit_reason' => $validated['exit_reason'],
            'exit_notes' => $validated['exit_notes'],
            'exit_processed_at' => now(),
            'exit_processed_by' => auth()->id(),
            'status' => 'inactive'
        ]);

        // Optionally disable the user account
        $employee->user->update([
            'email_verified_at' => null, // This effectively disables login
        ]);

        $this->logAudit('Employee Exit', 'Processed exit for employee: ' . $employee->employee_code . ' - Reason: ' . $validated['exit_reason']);
        
        return back()->with('success', 'Employee has been marked as exited successfully.');
    }

    public function reactivate(Request $request, Employee $employee)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can reactivate employees.');
        }

        // Clear exit information and reactivate
        $employee->update([
            'exit_date' => null,
            'exit_reason' => null,
            'exit_notes' => null,
            'exit_processed_at' => null,
            'exit_processed_by' => null,
            'status' => 'active'
        ]);

        // Re-enable the user account
        $employee->user->update([
            'email_verified_at' => now(),
        ]);

        $this->logAudit('Employee Reactivated', 'Reactivated employee: ' . $employee->employee_code);
        
        return back()->with('success', 'Employee has been reactivated successfully.');
    }

    public function destroy(Employee $employee)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can delete employees.');
        }

        // Soft delete the employee (this will hide them from all normal queries)
        $employee->delete();
        
        // Also soft delete the associated user account
        $employee->user->delete();
        
        $this->logAudit('Employee Soft Deleted', 'Soft deleted employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee has been removed from the system successfully.');
    }

    public function restore($id)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can restore employees.');
        }

        // Find the soft deleted employee
        $employee = Employee::withTrashed()->findOrFail($id);
        
        // Restore the employee
        $employee->restore();
        
        // Also restore the associated user account
        $employee->user()->withTrashed()->restore();
        
        $this->logAudit('Employee Restored', 'Restored employee: ' . $employee->employee_code);
        return back()->with('success', 'Employee has been restored successfully.');
    }

    public function forceDelete($id)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can permanently delete employees.');
        }

        // Find the soft deleted employee
        $employee = Employee::withTrashed()->findOrFail($id);
        
        // Permanently delete the user first
        $employee->user()->withTrashed()->forceDelete();
        
        // Permanently delete the employee
        $employee->forceDelete();
        
        $this->logAudit('Employee Force Deleted', 'Permanently deleted employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee has been permanently deleted.');
    }

    public function trash(Request $request)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can view deleted employees.');
        }

        $query = Employee::onlyTrashed()->with('department', 'user');

        // Search functionality for trashed employees
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('job_title', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        // Department filter
        if ($request->filled('filter_department')) {
            $departments = is_array($request->filter_department) 
                ? $request->filter_department 
                : explode(',', $request->filter_department);
            $query->whereIn('department_id', $departments);
        }

        // Sorting
        $sortBy = $request->get('sort', 'deleted_at');
        $sortDirection = $request->get('direction', 'desc');
        
        if ($sortBy === 'name') {
            $query->join('users', 'employees.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortDirection)
                  ->select('employees.*');
        } elseif ($sortBy === 'department') {
            $query->join('departments', 'employees.department_id', '=', 'departments.id')
                  ->orderBy('departments.name', $sortDirection)
                  ->select('employees.*');
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = $request->get('per_page', 10);
        $employees = $query->paginate($perPage)->withQueryString();

        // Get filter options from all employees (including trashed)
        $departments = Department::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Employees/Trash', [
            'employees' => $employees,
            'filters' => [
                'departments' => $departments,
            ],
            'queryParams' => $request->query()
        ]);
    }
}
