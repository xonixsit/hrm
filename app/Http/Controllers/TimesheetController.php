<?php

namespace App\Http\Controllers;

use App\Models\Timesheet;
use App\Models\Project;
use App\Models\Task;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;
use App\Notifications\TimesheetApprovedNotification;
use App\Notifications\TimesheetRejectedNotification;

class TimesheetController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            $timesheets = Timesheet::with(['employee.user', 'project', 'task', 'creator'])->paginate(10);
        } else {
            $employee = $user->employee;
            $timesheets = Timesheet::where('employee_id', $employee->id)->with(['project', 'task', 'creator'])->paginate(10);
        }
        return Inertia::render('Timesheets/Index', ['timesheets' => $timesheets]);
    }

    public function create()
    {
        $user = Auth::user();
        $projects = Project::all();
        $tasks = Task::all();
        
        // Get employees list for admins/managers
        $employees = [];
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            $employees = Employee::with('user')
                ->whereHas('user') // Only get employees that have users
                ->where('status', 'active') // Only active employees
                ->orderBy('id')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->user->name,
                        'employee_code' => $employee->employee_code,
                        'department' => $employee->department->name ?? 'No Department'
                    ];
                })
                ->filter(function ($employee) {
                    return !empty($employee['name']); // Filter out any with empty names
                })
                ->values(); // Reset array keys
        }
        
        return Inertia::render('Timesheets/Create', [
            'projects' => $projects, 
            'tasks' => $tasks,
            'employees' => $employees,
            'canSelectEmployee' => $user->hasRole('Admin') || $user->hasRole('Manager')
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        // Determine which employee this timesheet is for
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            // Admin/Manager can create for any employee
            if (isset($validated['employee_id'])) {
                $employeeId = $validated['employee_id'];
            } else {
                // If no employee selected, default to their own
                $employeeId = $user->employee->id;
            }
        } else {
            // Regular employees can only create for themselves
            $employeeId = $user->employee->id;
        }

        $validated['employee_id'] = $employeeId;
        $validated['status'] = 'pending';
        $validated['created_by'] = $user->id;

        $timesheet = Timesheet::create($validated);

        // Get employee name for audit log
        $employee = Employee::with('user')->find($employeeId);
        $employeeName = $employee->user->name ?? 'Unknown';

        $this->logAudit('Timesheet Created', "Created timesheet for {$employeeName} on date: " . $validated['date']);
        
        return redirect()->route('timesheets.index')->with('success', 'Timesheet entry created successfully.');
    }

    public function show(Timesheet $timesheet)
    {
        $timesheet->load(['employee.user', 'project', 'task']);
        return Inertia::render('Timesheets/Show', ['timesheet' => $timesheet]);
    }

    public function edit(Timesheet $timesheet)
    {
        $user = Auth::user();
        $projects = Project::all();
        $tasks = Task::all();
        
        // Get employees list for admins/managers
        $employees = [];
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            $employees = Employee::with('user')
                ->whereHas('user') // Only get employees that have users
                ->where('status', 'active') // Only active employees
                ->orderBy('id')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->user->name,
                        'employee_code' => $employee->employee_code,
                        'department' => $employee->department->name ?? 'No Department'
                    ];
                })
                ->filter(function ($employee) {
                    return !empty($employee['name']); // Filter out any with empty names
                })
                ->values(); // Reset array keys
        }
        
        return Inertia::render('Timesheets/Edit', [
            'timesheet' => $timesheet, 
            'projects' => $projects, 
            'tasks' => $tasks,
            'employees' => $employees,
            'canSelectEmployee' => $user->hasRole('Admin') || $user->hasRole('Manager')
        ]);
    }

    public function update(Request $request, Timesheet $timesheet)
    {
        $this->authorize('update', $timesheet);
        
        $user = Auth::user();

        $validated = $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        // Only allow admins/managers to change the employee
        if (($user->hasRole('Admin') || $user->hasRole('Manager')) && isset($validated['employee_id'])) {
            // Admin/Manager can change the employee
            $timesheet->update($validated);
        } else {
            // Regular users cannot change employee_id
            unset($validated['employee_id']);
            $timesheet->update($validated);
        }

        if (isset($validated['status'])) {
            if ($validated['status'] === 'approved') {
                $timesheet->employee->user->notify(new TimesheetApprovedNotification($timesheet));
            } elseif ($validated['status'] === 'rejected') {
                $timesheet->employee->user->notify(new TimesheetRejectedNotification($timesheet));
            }
        }

        $this->logAudit('Timesheet Updated', 'Updated timesheet ID: ' . $timesheet->id);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet updated.');
    }

    public function destroy(Timesheet $timesheet)
    {
        $this->authorize('delete', $timesheet);

        $timesheet->delete();

        $this->logAudit('Timesheet Deleted', 'Deleted timesheet ID: ' . $timesheet->id);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet deleted.');
    }

    /**
     * Sync timesheet with attendance data
     */
    public function syncWithAttendance(Request $request, Timesheet $timesheet)
    {
        $this->authorize('update', $timesheet);

        try {
            // Find attendance record for the same employee and date
            $attendance = \App\Models\Attendance::where('employee_id', $timesheet->employee_id)
                ->whereDate('date', $timesheet->date)
                ->where('status', 'clocked_out')
                ->first();

            if (!$attendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'No completed attendance record found for this date.'
                ], 404);
            }

            // Calculate hours from attendance
            $hoursWorked = round($attendance->work_minutes / 60, 2);

            // Update timesheet with attendance data
            $timesheet->update([
                'hours' => $hoursWorked,
                'description' => $this->generateTimesheetDescriptionFromAttendance($attendance, $timesheet->description)
            ]);

            $this->logAudit('Timesheet Synced with Attendance', "Synced timesheet ID: {$timesheet->id} with attendance data");

            return response()->json([
                'success' => true,
                'message' => 'Timesheet synchronized with attendance data successfully.',
                'timesheet' => $timesheet->fresh(),
                'attendance_data' => [
                    'work_duration' => $attendance->work_duration,
                    'break_duration' => $attendance->break_duration,
                    'clock_in' => $attendance->clock_in->format('H:i'),
                    'clock_out' => $attendance->clock_out->format('H:i')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync with attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance data for a timesheet
     */
    public function getAttendanceData(Request $request, Timesheet $timesheet)
    {
        $attendance = \App\Models\Attendance::where('employee_id', $timesheet->employee_id)
            ->whereDate('date', $timesheet->date)
            ->first();

        if (!$attendance) {
            return response()->json([
                'has_attendance' => false,
                'message' => 'No attendance record found for this date.'
            ]);
        }

        return response()->json([
            'has_attendance' => true,
            'attendance' => [
                'clock_in' => $attendance->clock_in?->format('H:i'),
                'clock_out' => $attendance->clock_out?->format('H:i'),
                'work_duration' => $attendance->work_duration,
                'break_duration' => $attendance->break_duration,
                'work_minutes' => $attendance->work_minutes,
                'calculated_hours' => round($attendance->work_minutes / 60, 2),
                'status' => $attendance->status,
                'break_sessions' => count($attendance->break_sessions ?? [])
            ],
            'sync_needed' => $attendance->status === 'clocked_out' && 
                           round($attendance->work_minutes / 60, 2) != $timesheet->hours
        ]);
    }

    /**
     * Generate timesheet description from attendance data
     */
    private function generateTimesheetDescriptionFromAttendance($attendance, $existingDescription = '')
    {
        $clockIn = $attendance->clock_in->format('H:i');
        $clockOut = $attendance->clock_out ? $attendance->clock_out->format('H:i') : 'Not clocked out';
        $workDuration = $attendance->work_duration;
        $breakDuration = $attendance->break_duration;
        $breakSessions = count($attendance->break_sessions ?? []);

        $syncInfo = "\n\n--- Synced with Attendance ---\n";
        $syncInfo .= "Clock in: {$clockIn}, Clock out: {$clockOut}\n";
        $syncInfo .= "Work duration: {$workDuration}";
        
        if ($breakSessions > 0) {
            $syncInfo .= ", Break time: {$breakDuration} ({$breakSessions} session" . ($breakSessions > 1 ? 's' : '') . ")";
        }

        if ($attendance->location) {
            $syncInfo .= "\nLocation: {$attendance->location}";
        }

        // Preserve existing description and add sync info
        if ($existingDescription && !str_contains($existingDescription, '--- Synced with Attendance ---')) {
            return $existingDescription . $syncInfo;
        } elseif (str_contains($existingDescription, '--- Synced with Attendance ---')) {
            // Replace existing sync info
            $parts = explode('--- Synced with Attendance ---', $existingDescription);
            return trim($parts[0]) . $syncInfo;
        } else {
            return trim($syncInfo);
        }
    }

    /**
     * Approve a timesheet
     */
    public function approve(Request $request, Timesheet $timesheet)
    {
        $this->authorize('approve', $timesheet);

        $validated = $request->validate([
            'comments' => 'nullable|string|max:500'
        ]);

        $timesheet->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'approval_comments' => $validated['comments'] ?? null
        ]);

        // Send notification to employee
        $timesheet->employee->user->notify(new TimesheetApprovedNotification($timesheet));

        $this->logAudit('Timesheet Approved', "Approved timesheet ID: {$timesheet->id} for employee: {$timesheet->employee->user->name}");

        return response()->json([
            'success' => true,
            'message' => 'Timesheet approved successfully.',
            'timesheet' => $timesheet->load(['employee.user', 'project', 'task', 'approver'])
        ]);
    }

    /**
     * Reject a timesheet
     */
    public function reject(Request $request, Timesheet $timesheet)
    {
        $this->authorize('approve', $timesheet);

        $validated = $request->validate([
            'comments' => 'required|string|max:500'
        ]);

        $timesheet->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'approval_comments' => $validated['comments']
        ]);

        // Send notification to employee
        $timesheet->employee->user->notify(new TimesheetRejectedNotification($timesheet));

        $this->logAudit('Timesheet Rejected', "Rejected timesheet ID: {$timesheet->id} for employee: {$timesheet->employee->user->name}");

        return response()->json([
            'success' => true,
            'message' => 'Timesheet rejected successfully.',
            'timesheet' => $timesheet->load(['employee.user', 'project', 'task', 'approver'])
        ]);
    }

    /**
     * Bulk approve timesheets
     */
    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'exists:timesheets,id',
            'comments' => 'nullable|string|max:500'
        ]);

        $timesheets = Timesheet::whereIn('id', $validated['timesheet_ids'])
            ->where('status', 'pending')
            ->get();

        $approvedCount = 0;
        foreach ($timesheets as $timesheet) {
            if (Auth::user()->can('approve', $timesheet)) {
                $timesheet->update([
                    'status' => 'approved',
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_comments' => $validated['comments'] ?? null
                ]);

                // Send notification to employee
                $timesheet->employee->user->notify(new TimesheetApprovedNotification($timesheet));
                $approvedCount++;
            }
        }

        $this->logAudit('Bulk Timesheet Approval', "Bulk approved {$approvedCount} timesheets");

        return response()->json([
            'success' => true,
            'message' => "Successfully approved {$approvedCount} timesheet(s).",
            'approved_count' => $approvedCount
        ]);
    }

    /**
     * Get pending timesheets for approval
     */
    public function pendingApprovals(Request $request)
    {
        $user = Auth::user();
        
        $query = Timesheet::with(['employee.user', 'project', 'task'])
            ->where('status', 'pending');

        // Filter based on user role
        if ($user->hasRole('Manager')) {
            // Managers can only approve their team's timesheets
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            $query->whereIn('employee_id', $teamEmployeeIds);
        } elseif (!$user->hasAnyRole(['Admin', 'HR'])) {
            // Regular employees can't approve timesheets
            $query->where('id', 0); // Return empty result
        }

        // Apply filters
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('employee.user', function ($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('project', function ($projectQuery) use ($searchTerm) {
                    $projectQuery->where('name', 'like', "%{$searchTerm}%");
                })
                ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('employee')) {
            $query->where('employee_id', $request->employee);
        }

        if ($request->filled('project')) {
            $query->where('project_id', $request->project);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $pendingTimesheets = $query->orderBy('created_at', 'desc')->paginate(15);

        // Add work report correlation for each timesheet
        $pendingTimesheets->getCollection()->transform(function ($timesheet) {
            $workReport = \App\Models\WorkReport::where('employee_id', $timesheet->employee_id)
                ->where('date', $timesheet->date)
                ->first();
            
            $timesheet->work_report = $workReport;
            $timesheet->has_discrepancy = $this->detectTimeDiscrepancy($timesheet, $workReport);
            
            return $timesheet;
        });

        // Get available employees and projects for filters
        $availableEmployeesQuery = Employee::with('user');
        $availableProjectsQuery = Project::query();

        // Apply same role-based filtering for available options
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            $availableEmployeesQuery->whereIn('id', $teamEmployeeIds);
        }

        $availableEmployees = $availableEmployeesQuery->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'Unknown'
            ];
        });

        $availableProjects = $availableProjectsQuery->get()->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name
            ];
        });

        return Inertia::render('Timesheets/PendingApprovals', [
            'timesheets' => $pendingTimesheets,
            'availableEmployees' => $availableEmployees,
            'availableProjects' => $availableProjects,
            'filters' => $request->only(['search', 'employee', 'project', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Get timesheet approval statistics
     */
    public function approvalStats()
    {
        $user = Auth::user();
        
        $baseQuery = Timesheet::query();
        
        // Filter based on user role
        if ($user->hasRole('Manager')) {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            $baseQuery->whereIn('employee_id', $teamEmployeeIds);
        } elseif (!$user->hasAnyRole(['Admin', 'HR'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stats = [
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'approved' => (clone $baseQuery)->where('status', 'approved')->count(),
            'rejected' => (clone $baseQuery)->where('status', 'rejected')->count(),
            'total' => (clone $baseQuery)->count(),
            'this_week_pending' => (clone $baseQuery)
                ->where('status', 'pending')
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'avg_approval_time' => $this->calculateAverageApprovalTime($baseQuery)
        ];

        return response()->json($stats);
    }

    private function calculateAverageApprovalTime($query)
    {
        $approvedTimesheets = (clone $query)
            ->whereNotNull('approved_at')
            ->whereIn('status', ['approved', 'rejected'])
            ->get(['created_at', 'approved_at']);

        if ($approvedTimesheets->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($approvedTimesheets as $timesheet) {
            $totalHours += $timesheet->created_at->diffInHours($timesheet->approved_at);
        }

        return round($totalHours / $approvedTimesheets->count(), 1);
    }

    /**
     * Detect discrepancies between timesheet and work report
     */
    private function detectTimeDiscrepancy($timesheet, $workReport)
    {
        if (!$workReport) {
            return [
                'type' => 'missing_work_report',
                'message' => 'No work report found for this date',
                'severity' => 'warning'
            ];
        }

        // Calculate estimated productive hours from work report
        $productiveActivities = $workReport->successful_calls + $workReport->emails + $workReport->whatsapp;
        $estimatedHours = min(8, max(1, $productiveActivities * 0.1)); // Rough estimate: 6 minutes per activity

        $hoursDifference = abs($timesheet->hours - $estimatedHours);
        
        if ($hoursDifference > 2) {
            return [
                'type' => 'hours_mismatch',
                'message' => "Timesheet hours ({$timesheet->hours}h) significantly differ from estimated productive hours ({$estimatedHours}h)",
                'severity' => 'high',
                'timesheet_hours' => $timesheet->hours,
                'estimated_hours' => $estimatedHours,
                'difference' => $hoursDifference
            ];
        }

        if ($hoursDifference > 1) {
            return [
                'type' => 'minor_mismatch',
                'message' => "Minor difference between timesheet and estimated hours",
                'severity' => 'low',
                'timesheet_hours' => $timesheet->hours,
                'estimated_hours' => $estimatedHours,
                'difference' => $hoursDifference
            ];
        }

        return null; // No discrepancy
    }
}
