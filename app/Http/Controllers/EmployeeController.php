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
        return Inertia::render('Employees/Create', ['departments' => $departments]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'department_id' => 'required|exists:departments,id',
            'job_title' => 'required|string|max:255',
            'employee_code' => 'required|unique:employees',
            'join_date' => 'required|date',
            'contract_type' => 'required|string',
            // Add other fields as needed
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('Employee');

        $employee = Employee::create([
            'user_id' => $user->id,
            'department_id' => $validated['department_id'],
            'employee_code' => $validated['employee_code'],
            'job_title' => $validated['job_title'],
            'join_date' => $validated['join_date'],
            'contract_type' => $validated['contract_type'],
            // Add other fields
        ]);

        $this->logAudit('Employee Created', 'Created employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee)
    {
        $employee->load('department', 'user');
        return Inertia::render('Employees/Show', ['employee' => $employee]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::all();
        $employee->load('department', 'user');
        $contractTypes = Employee::select('contract_type')->distinct()->pluck('contract_type');
        
        return Inertia::render('Employees/Edit', ['employee' => $employee, 'departments' => $departments, 'contractTypes' => $contractTypes]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'job_title' => 'required|string|max:255',
            'employee_code' => 'required|unique:employees,employee_code,' . $employee->id,
            'join_date' => 'required|date',
            'contract_type' => 'required|string',
            // Add other fields
        ]);

        $employee->update($validated);

        if ($request->has('name')) {
            $employee->user->update(['name' => $request->name]);
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
