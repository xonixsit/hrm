<?php

namespace App\Http\Controllers;

use App\Models\WorkReport;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class WorkReportController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {
        $this->authorize('viewAny', WorkReport::class);
        
        // Get per_page from request, default to 10, max 100 for performance
        $perPage = min((int) $request->get('per_page', 10), 100);
        
        $user = Auth::user();
        $query = WorkReport::with('employee.user');
        
        // Apply user-based access control
        if (!($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employee = $user->employee;
            if (!$employee) {
                return redirect()->route('dashboard')->with('error', 'You need an employee profile to access work reports.');
            }
            $query->where('employee_id', $employee->id);
        }
        
        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('employee_id', $request->user_id);
        }
        
        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        
        $workReports = $query->orderBy('date', 'desc')->paginate($perPage);
        
        // Get employees for filter dropdown (only for admins/managers/HR)
        $employees = [];
        if ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR')) {
            $employees = Employee::with('user')
                ->whereHas('user')
                ->get()
                ->map(function ($employee) {
                    return [
                        'value' => $employee->id,
                        'label' => $employee->user->name,
                        'employee_code' => $employee->employee_code
                    ];
                })
                ->sortBy('label')
                ->values();
        }
        
        return Inertia::render('WorkReports/Index', [
            'workReports' => $workReports,
            'employees' => $employees,
            'filters' => [
                'user_id' => $request->user_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ]
        ]);
    }

    public function create()
    {
        $this->authorize('create', WorkReport::class);
        return Inertia::render('WorkReports/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', WorkReport::class);
        
        $validated = $request->validate([
            'date' => 'required|date',
            'calls' => 'required|integer|min:0',
            'calls_not_received' => 'required|integer|min:0',
            'disconnected_calls' => 'required|integer|min:0',
            'follow_up_calls' => 'required|integer|min:0',
            'successful_calls' => 'required|integer|min:0',
            'emails' => 'required|integer|min:0',
            'whatsapp' => 'required|integer|min:0',
            'sms' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $employee = $user->employee;
        
        if (!$employee) {
            return redirect()->route('dashboard')->with('error', 'You need an employee profile to submit work reports.');
        }
        
        $validated['employee_id'] = $employee->id;

        WorkReport::create($validated);

        $this->logAudit('Work Report Created', 'Created work report for date: ' . $validated['date']);
        return redirect()->route('work-reports.index')->with('success', 'Work report submitted.');
    }

    public function show(WorkReport $workReport)
    {
        $workReport->load('employee.user');
        return Inertia::render('WorkReports/Show', ['workReport' => $workReport]);
    }

    public function edit(WorkReport $workReport)
    {
        return Inertia::render('WorkReports/Edit', ['workReport' => $workReport]);
    }

    public function update(Request $request, WorkReport $workReport)
    {
        $this->authorize('update', $workReport);

        $validated = $request->validate([
            'date' => 'required|date',
            'calls' => 'required|integer|min:0',
            'calls_not_received' => 'required|integer|min:0',
            'disconnected_calls' => 'required|integer|min:0',
            'follow_up_calls' => 'required|integer|min:0',
            'successful_calls' => 'required|integer|min:0',
            'emails' => 'required|integer|min:0',
            'whatsapp' => 'required|integer|min:0',
            'sms' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $workReport->update($validated);

        $this->logAudit('Work Report Updated', 'Updated work report ID: ' . $workReport->id);
        return redirect()->route('work-reports.index')->with('success', 'Work report updated.');
    }

    public function destroy(WorkReport $workReport)
    {
        $this->authorize('delete', $workReport);

        $workReport->delete();

        $this->logAudit('Work Report Deleted', 'Deleted work report ID: ' . $workReport->id);
        return redirect()->route('work-reports.index')->with('success', 'Work report deleted.');
    }
}