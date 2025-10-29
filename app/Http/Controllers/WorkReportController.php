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
                ->whereNull('deleted_at') // Exclude soft-deleted employees
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
        
        // Calculate performance statistics for the filtered data
        $performanceStats = $this->calculatePerformanceStats($request, $user);
        
        // Get employee performance list for leaderboard (only for admins/managers/HR)
        $employeePerformanceList = [];
        if ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR')) {
            $employeePerformanceList = $this->getEmployeePerformanceList($request, $user);
        }
        
        return Inertia::render('WorkReports/Index', [
            'workReports' => $workReports,
            'employees' => $employees,
            'performanceStats' => $performanceStats,
            'employeePerformanceList' => $employeePerformanceList,
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

    /**
     * Calculate performance statistics based on filters
     */
    private function calculatePerformanceStats(Request $request, $user)
    {
        $query = WorkReport::with('employee.user');
        
        // Apply user-based access control
        if (!($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employee = $user->employee;
            if (!$employee) {
                return null;
            }
            $query->where('employee_id', $employee->id);
        }
        
        // Apply employee filter (only for admins/managers/HR)
        if ($request->filled('user_id') && ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employeeId = trim($request->user_id);
            if (is_numeric($employeeId) && $employeeId > 0) {
                $query->where('employee_id', (int) $employeeId);
            }
        }
        
        // Apply date filters
        $dateFrom = $request->filled('date_from') ? trim($request->date_from) : null;
        $dateTo = $request->filled('date_to') ? trim($request->date_to) : null;
        
        // Debug logging
        \Log::info('Performance Stats Date Filters', [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'request_params' => $request->all()
        ]);
        
        // Validate date format
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
        
        // Get aggregated statistics
        $stats = $query->selectRaw('
            SUM(calls) as total_calls,
            SUM(successful_calls) as successful_calls,
            SUM(calls_not_received) as calls_not_received,
            SUM(disconnected_calls) as disconnected_calls,
            SUM(follow_up_calls) as follow_up_calls,
            SUM(emails) as emails,
            SUM(whatsapp) as whatsapp,
            SUM(sms) as sms,
            COUNT(DISTINCT date) as total_days,
            COUNT(*) as total_reports
        ')->first();
        
        if (!$stats || $stats->total_calls == 0) {
            return [
                'total_calls' => 0,
                'successful_calls' => 0,
                'calls_not_received' => 0,
                'disconnected_calls' => 0,
                'follow_up_calls' => 0,
                'emails' => 0,
                'whatsapp' => 0,
                'sms' => 0,
                'success_rate' => 0,
                'total_communications' => 0,
                'daily_average' => 0,
                'calls_trend' => 0
            ];
        }
        
        // Calculate derived metrics
        $totalCommunications = $stats->total_calls + $stats->emails + $stats->whatsapp + $stats->sms;
        $successRate = $stats->total_calls > 0 ? round(($stats->successful_calls / $stats->total_calls) * 100, 1) : 0;
        $dailyAverage = $stats->total_days > 0 ? round($stats->total_calls / $stats->total_days, 1) : 0;
        
        // Calculate trend (compare with previous period)
        $callsTrend = $this->calculateTrend($request, $user, $stats->total_calls);
        
        $result = [
            'total_calls' => (int) $stats->total_calls,
            'successful_calls' => (int) $stats->successful_calls,
            'calls_not_received' => (int) $stats->calls_not_received,
            'disconnected_calls' => (int) $stats->disconnected_calls,
            'follow_up_calls' => (int) $stats->follow_up_calls,
            'emails' => (int) $stats->emails,
            'whatsapp' => (int) $stats->whatsapp,
            'sms' => (int) $stats->sms,
            'success_rate' => $successRate,
            'total_communications' => (int) $totalCommunications,
            'daily_average' => $dailyAverage,
            'calls_trend' => $callsTrend
        ];
        
        // Debug logging
        \Log::info('Performance Stats Result', [
            'date_filters' => ['from' => $dateFrom, 'to' => $dateTo],
            'raw_stats' => $stats->toArray(),
            'calculated_result' => $result
        ]);
        
        return $result;
    }

    /**
     * Calculate trend percentage compared to previous period
     */
    private function calculateTrend(Request $request, $user, $currentCalls)
    {
        if (!$request->filled('date_from') || !$request->filled('date_to')) {
            return 0;
        }
        
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        
        // Calculate the period length
        $currentStart = new \DateTime($dateFrom);
        $currentEnd = new \DateTime($dateTo);
        $periodLength = $currentStart->diff($currentEnd)->days + 1;
        
        // Calculate previous period dates
        $previousEnd = clone $currentStart;
        $previousEnd->modify('-1 day');
        $previousStart = clone $previousEnd;
        $previousStart->modify("-{$periodLength} days");
        
        // Query for previous period
        $query = WorkReport::with('employee.user');
        
        // Apply user-based access control
        if (!($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employee = $user->employee;
            if (!$employee) {
                return 0;
            }
            $query->where('employee_id', $employee->id);
        }
        
        // Apply employee filter
        if ($request->filled('user_id') && ($user->hasRole('Admin') || $user->hasRole('Manager') || $user->hasRole('HR'))) {
            $employeeId = trim($request->user_id);
            if (is_numeric($employeeId) && $employeeId > 0) {
                $query->where('employee_id', (int) $employeeId);
            }
        }
        
        $previousStats = $query
            ->where('date', '>=', $previousStart->format('Y-m-d'))
            ->where('date', '<=', $previousEnd->format('Y-m-d'))
            ->sum('calls');
        
        if ($previousStats == 0) {
            return $currentCalls > 0 ? 100 : 0;
        }
        
        return round((($currentCalls - $previousStats) / $previousStats) * 100, 1);
    }

    /**
     * Get employee performance list for leaderboard and comparison
     */
    private function getEmployeePerformanceList(Request $request, $user)
    {
        // Apply date filters
        $dateFrom = $request->filled('date_from') ? trim($request->date_from) : null;
        $dateTo = $request->filled('date_to') ? trim($request->date_to) : null;
        
        // Validate date format
        if ($dateFrom && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
            $dateFrom = null;
        }
        if ($dateTo && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
            $dateTo = null;
        }
        
        // Get employees based on user role
        $employeesQuery = Employee::with(['user', 'department'])
            ->whereHas('user')
            ->whereNull('deleted_at'); // Exclude soft-deleted employees
            
        // Role-based filtering: Only Admin can see all employees
        if (!$user->hasRole('Admin')) {
            // For non-admin users, exclude Admin, HR, and Manager roles from leaderboard
            $employeesQuery->whereHas('user', function ($query) {
                $query->whereDoesntHave('roles', function ($roleQuery) {
                    $roleQuery->whereIn('name', ['Admin', 'HR', 'Manager']);
                });
            });
        }
        
        // Department filtering (only for Admin users)
        if ($user->hasRole('Admin') && $request->filled('department_id')) {
            $employeesQuery->where('department_id', $request->department_id);
        }
        
        $employees = $employeesQuery->get()
            ->map(function ($employee) use ($dateFrom, $dateTo) {
                $query = WorkReport::where('employee_id', $employee->id);
                
                if ($dateFrom) {
                    $query->where('date', '>=', $dateFrom);
                }
                
                if ($dateTo) {
                    $query->where('date', '<=', $dateTo);
                }
                
                $stats = $query->selectRaw('
                    SUM(calls) as total_calls,
                    SUM(successful_calls) as successful_calls,
                    SUM(emails) as emails,
                    SUM(whatsapp) as whatsapp,
                    SUM(sms) as sms,
                    COUNT(DISTINCT date) as total_days
                ')->first();
                
                $totalCalls = $stats->total_calls ?? 0;
                $successfulCalls = $stats->successful_calls ?? 0;
                $successRate = $totalCalls > 0 ? round(($successfulCalls / $totalCalls) * 100, 1) : 0;
                
                // Calculate performance score (weighted average)
                $performanceScore = $this->calculatePerformanceScore($stats);
                
                // Calculate trend (simplified - compare with previous period)
                $trend = $this->calculateEmployeeTrend($employee->id, $dateFrom, $dateTo, $totalCalls);
                
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'employee_code' => $employee->employee_code,
                    'position' => $employee->position ?? 'Employee',
                    'department' => $employee->department ? $employee->department->name : 'No Department',
                    'department_id' => $employee->department_id,
                    'total_calls' => (int) $totalCalls,
                    'successful_calls' => (int) $successfulCalls,
                    'success_rate' => $successRate,
                    'emails' => (int) ($stats->emails ?? 0),
                    'whatsapp' => (int) ($stats->whatsapp ?? 0),
                    'sms' => (int) ($stats->sms ?? 0),
                    'total_days' => (int) ($stats->total_days ?? 0),
                    'performance_score' => $performanceScore,
                    'trend' => $trend
                ];
            })
            ->sortByDesc('performance_score')
            ->values()
            ->toArray();
        
        return $employees;
    }

    /**
     * Calculate performance score based on various metrics
     */
    private function calculatePerformanceScore($stats)
    {
        $totalCalls = $stats->total_calls ?? 0;
        $successfulCalls = $stats->successful_calls ?? 0;
        $emails = $stats->emails ?? 0;
        $whatsapp = $stats->whatsapp ?? 0;
        $sms = $stats->sms ?? 0;
        $totalDays = $stats->total_days ?? 1;
        
        if ($totalCalls == 0) return 0;
        
        // Success rate (40% weight)
        $successRate = ($successfulCalls / $totalCalls) * 100;
        $successScore = min($successRate * 0.4, 40);
        
        // Activity level (30% weight) - calls per day
        $dailyAverage = $totalCalls / $totalDays;
        $activityScore = min(($dailyAverage / 50) * 30, 30); // Assuming 50 calls/day is excellent
        
        // Communication diversity (20% weight)
        $totalCommunications = $totalCalls + $emails + $whatsapp + $sms;
        $diversityRatio = $totalCommunications > 0 ? (($emails + $whatsapp + $sms) / $totalCommunications) : 0;
        $diversityScore = $diversityRatio * 20;
        
        // Consistency (10% weight) - based on total days worked
        $consistencyScore = min(($totalDays / 30) * 10, 10); // Assuming 30 days is full month
        
        return round($successScore + $activityScore + $diversityScore + $consistencyScore, 0);
    }

    /**
     * Calculate employee trend compared to previous period
     */
    private function calculateEmployeeTrend($employeeId, $dateFrom, $dateTo, $currentCalls)
    {
        if (!$dateFrom || !$dateTo) {
            return 0;
        }
        
        // Calculate previous period
        $currentStart = new \DateTime($dateFrom);
        $currentEnd = new \DateTime($dateTo);
        $periodLength = $currentStart->diff($currentEnd)->days + 1;
        
        $previousEnd = clone $currentStart;
        $previousEnd->modify('-1 day');
        $previousStart = clone $previousEnd;
        $previousStart->modify("-{$periodLength} days");
        
        $previousStats = WorkReport::where('employee_id', $employeeId)
            ->where('date', '>=', $previousStart->format('Y-m-d'))
            ->where('date', '<=', $previousEnd->format('Y-m-d'))
            ->sum('calls');
        
        if ($previousStats == 0) {
            return $currentCalls > 0 ? 100 : 0;
        }
        
        return round((($currentCalls - $previousStats) / $previousStats) * 100, 1);
    }

    /**
     * Display the leaderboard page
     */
    public function leaderboard(Request $request)
    {
        // Allow all authenticated users to view leaderboard for healthy competition
        $user = Auth::user();
        
        // Get employee performance list
        $employees = $this->getEmployeePerformanceList($request, $user);
        
        // Get departments for admin users
        $departments = [];
        if ($user->hasRole('Admin')) {
            $departments = \App\Models\Department::select('id', 'name')
                ->orderBy('name')
                ->get()
                ->toArray();
        }
        
        return Inertia::render('WorkReports/Leaderboard', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'department_id' => $request->department_id,
            ],
            'user_role' => $user->roles->pluck('name')->first() ?? 'Employee',
            'can_view_all_departments' => $user->hasRole('Admin')
        ]);
    }
}