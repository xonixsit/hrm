<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class DepartmentController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $departments = Department::withCount('employees')
            ->with([
                'employees' => function($query) {
                    $query->with('user')->limit(3);
                },
                'manager.user'
            ])
            ->paginate(10);
        
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    public function create()
    {
        // Get all employees for manager selection
        $employees = \App\Models\Employee::with('user')->get();
        
        // Get all departments for parent selection
        $departments = Department::all();
        
        return Inertia::render('Departments/Create', [
            'employees' => $employees,
            'departments' => $departments
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
        ]);

        Department::create($validated);
        $this->logAudit('Department Created', 'Created department: ' . $validated['name']);
        return redirect()->route('departments.index')->with('success', 'Department created successfully.');
    }

    public function show(Department $department)
    {
        $department->load([
            'employees.user',
            'manager.user',
            'parent'
        ]);
        
        return Inertia::render('Departments/Show', ['department' => $department]);
    }

    public function edit(Department $department)
    {
        // Load department with relationships
        $department->load(['manager.user', 'parent']);
        
        // Get all employees for manager selection
        $employees = \App\Models\Employee::with('user')->get();
        
        // Get all departments for parent selection (excluding current department)
$departments = Department::where('id', '!=', $department->id)
    ->select('id', 'name')   // select only what you need
    ->distinct()
    ->get();
        
        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'employees' => $employees,
            'departments' => $departments
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $rules = [];
        Log::info($request->all());
        // Only validate fields that are being updated
        if ($request->has('name')) {
            $rules['name'] = 'required|string|max:255,' . $department->id;
        }
        
        if ($request->has('code')) {
            $rules['code'] = 'nullable|string|max:50,' . $department->id;
        }
        
        if ($request->has('description')) {
            $rules['description'] = 'nullable|string|max:1000';
        }
        
        if ($request->has('location')) {
            $rules['location'] = 'nullable|string|max:255';
        }
        
        if ($request->has('status')) {
            $rules['status'] = 'nullable|string|in:Active,Inactive,Restructuring';
        }
        
        if ($request->has('budget')) {
            $rules['budget'] = 'nullable|numeric|min:0';
        }
        
        if ($request->has('established_date')) {
            $rules['established_date'] = 'nullable|date';
        }

        if ($request->has('manager_id')) {
            $rules['manager_id'] = 'nullable|exists:employees,id';
        }

        if ($request->has('parent_id')) {
            $rules['parent_id'] = 'nullable|exists:departments,id';
        }

        $validated = $request->validate($rules);

        $updateData = $validated;

        if ($request->has('manager_id')) {
            $updateData['manager_id'] = $request->input('manager_id');
        }

        if ($request->has('parent_id')) {
            $updateData['parent_id'] = $request->input('parent_id');
        }

        if ($request->has('established_date')) {
            $updateData['established_date'] = $request->input('established_date');
        }

        $department->update($updateData);
        $this->logAudit('Department Updated', 'Updated department: ' . $department->name);
        
        // Return JSON response for AJAX requests (inline editing)
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Department updated successfully.',
                'department' => $department->fresh()
            ]);
        }
        
        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        $department->delete();
        $this->logAudit('Department Deleted', 'Deleted department: ' . $department->name);
        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }


}
