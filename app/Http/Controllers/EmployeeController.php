<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class EmployeeController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $employees = Employee::with('department', 'user')->paginate(10);
        return Inertia::render('Employees/Index', ['employees' => $employees]);
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
        return Inertia::render('Employees/Edit', ['employee' => $employee, 'departments' => $departments]);
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

    public function destroy(Employee $employee)
    {
        $employee->user->delete();
        $employee->delete();
        $this->logAudit('Employee Deleted', 'Deleted employee: ' . $employee->employee_code);
        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
