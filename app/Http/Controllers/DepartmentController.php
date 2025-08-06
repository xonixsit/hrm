<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class DepartmentController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $departments = Department::paginate(10);
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    public function create()
    {
        return Inertia::render('Departments/Create');
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
        return Inertia::render('Departments/Show', ['department' => $department]);
    }

    public function edit(Department $department)
    {
        return Inertia::render('Departments/Edit', ['department' => $department]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
        ]);

        $department->update($validated);
        $this->logAudit('Department Updated', 'Updated department: ' . $department->name);
        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        $department->delete();
        $this->logAudit('Department Deleted', 'Deleted department: ' . $department->name);
        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }
}
