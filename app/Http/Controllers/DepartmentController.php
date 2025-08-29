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

    public function index(Request $request)
    {
        // Build query with filters
        $query = Department::withCount('employees')
            ->with(['manager.user', 'parent']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('manager.user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Apply manager filter
        if ($request->filled('manager')) {
            $query->where('manager_id', $request->get('manager'));
        }

        // Apply parent department filter
        if ($request->filled('parent')) {
            if ($request->get('parent') === 'none') {
                $query->whereNull('parent_department_id');
            } else {
                $query->where('parent_department_id', $request->get('parent'));
            }
        }

        // Apply employee count filter
        if ($request->filled('employee_count')) {
            $range = $request->get('employee_count');
            switch ($range) {
                case 'none':
                    $query->having('employees_count', '=', 0);
                    break;
                case 'small':
                    $query->having('employees_count', '>', 0)
                          ->having('employees_count', '<=', 5);
                    break;
                case 'medium':
                    $query->having('employees_count', '>', 5)
                          ->having('employees_count', '<=', 15);
                    break;
                case 'large':
                    $query->having('employees_count', '>', 15);
                    break;
            }
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if ($sortBy === 'employees_count') {
            $query->orderBy('employees_count', $sortOrder);
        } elseif ($sortBy === 'manager') {
            $query->leftJoin('employees', 'departments.manager_id', '=', 'employees.id')
                  ->leftJoin('users', 'employees.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortOrder)
                  ->select('departments.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Get paginated results
        $perPage = $request->get('per_page', 10);
        $departments = $query->paginate($perPage)->withQueryString();
        
        // Get department IDs from current page
        $departmentIds = $departments->pluck('id');
        
        // Get top 3 employees per department using a subquery approach
        $employees = \App\Models\Employee::with('user')
            ->whereIn('department_id', $departmentIds)
            ->get()
            ->groupBy('department_id')
            ->map(function ($departmentEmployees) {
                return $departmentEmployees->take(3);
            });
        
        // Attach employees to departments
        $departments->getCollection()->transform(function ($department) use ($employees) {
            $department->setRelation('employees', $employees->get($department->id, collect()));
            return $department;
        });

        // Get filter options
        $filterOptions = [
            'managers' => \App\Models\Employee::with('user')
                ->whereHas('managedDepartments')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->user->name ?? 'Unknown'
                    ];
                }),
            'parents' => Department::whereNull('parent_department_id')
                ->orWhereHas('children')
                ->select('id', 'name')
                ->get(),
            'statuses' => ['Active', 'Inactive', 'Restructuring']
        ];
        
        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'filterOptions' => $filterOptions,
            'filters' => $request->only([
                'search', 'status', 'manager', 'parent', 'employee_count', 
                'date_from', 'date_to', 'sort_by', 'sort_order', 'per_page'
            ])
        ]);
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
        // Load department with relationships, employees, and employees count
        $department->load(['manager.user', 'parent', 'employees.user']);
        $department->loadCount('employees');
        
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

        if ($request->has('parent_department_id')) {
            $rules['parent_department_id'] = 'nullable|exists:departments,id';
        }

        $validated = $request->validate($rules);

        $updateData = $validated;

        if ($request->has('manager_id')) {
            $updateData['manager_id'] = $request->input('manager_id');
        }

        if ($request->has('parent_department_id')) {
            $updateData['parent_department_id'] = $request->input('parent_department_id');
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
