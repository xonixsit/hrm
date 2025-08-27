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
        
        // Apply user-based access control FIRST to ensure proper scoping
        if (!($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employee = $user->employee;
            if (!$employee) {
                return redirect()->route('dashboard')->with('error', 'You need an employee profile to access work reports.');
            }
            $query->where('employee_id', $employee->id);
        }
        
        // Apply search filter within the user's scope
        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            
            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    // Search in employee name
                    $q->whereHas('employee.user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    })
                    // Search in employee code
                    ->orWhereHas('employee', function ($empQuery) use ($searchTerm) {
                        $empQuery->where('employee_code', 'like', "%{$searchTerm}%");
                    })
                    // Search in notes (if not null)
                    ->orWhere('notes', 'like', "%{$searchTerm}%")
                    // Search in formatted date (YYYY-MM-DD format)
                    ->orWhere('date', 'like', "%{$searchTerm}%")
                    // Search in numeric fields if the search term is numeric
                    ->when(is_numeric($searchTerm), function ($numQuery) use ($searchTerm) {
                        $numQuery->orWhere('calls', $searchTerm)
                                ->orWhere('successful_calls', $searchTerm)
                                ->orWhere('calls_not_received', $searchTerm)
                                ->orWhere('disconnected_calls', $searchTerm)
                                ->orWhere('follow_up_calls', $searchTerm)
                                ->orWhere('emails', $searchTerm)
                                ->orWhere('whatsapp', $searchTerm)
                                ->orWhere('sms', $searchTerm);
                    });
                });
            }
        }
        
        // Apply employee filter (only for admins/managers/HR)
        if ($request->filled('user_id') && ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employeeId = trim($request->user_id);
            if (is_numeric($employeeId) && $employeeId > 0) {
                $query->where('employee_id', (int) $employeeId);
            }
        }
        
        // Date range validation and filtering
        $dateFrom = $request->filled('date_from') ? trim($request->date_from) : null;
        $dateTo = $request->filled('date_to') ? trim($request->date_to) : null;
        
        // Validate date format and range
        if ($dateFrom && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
            $dateFrom = null;
        }
        if ($dateTo && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
            $dateTo = null;
        }
        
        // Validate date range - swap if from is after to
        if ($dateFrom && $dateTo && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }
        
        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
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
                        'value' => (string) $employee->id,
                        'label' => $employee->user->name . ' (' . $employee->employee_code . ')',
                        'employee_code' => $employee->employee_code
                    ];
                })
                ->sortBy('label')
                ->values()
                ->toArray();
        }
        
        return Inertia::render('WorkReports/Index', [
            'workReports' => $workReports,
            'employees' => $employees,
            'filters' => [
                'search' => $request->search,
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