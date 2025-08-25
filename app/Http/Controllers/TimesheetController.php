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
            $timesheets = Timesheet::with(['employee.user', 'project', 'task'])->paginate(10);
        } else {
            $employee = $user->employee;
            $timesheets = Timesheet::where('employee_id', $employee->id)->with(['project', 'task'])->paginate(10);
        }
        return Inertia::render('Timesheets/Index', ['timesheets' => $timesheets]);
    }

    public function create()
    {
        $projects = Project::all();
        $tasks = Task::all();
        return Inertia::render('Timesheets/Create', ['projects' => $projects, 'tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $validated['employee_id'] = Auth::user()->employee->id;
        $validated['status'] = 'pending';

        Timesheet::create($validated);

        $this->logAudit('Timesheet Created', 'Created timesheet for date: ' . $validated['date']);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet entry created.');
    }

    public function show(Timesheet $timesheet)
    {
        $timesheet->load(['employee.user', 'project', 'task']);
        return Inertia::render('Timesheets/Show', ['timesheet' => $timesheet]);
    }

    public function edit(Timesheet $timesheet)
    {
        $projects = Project::all();
        $tasks = Task::all();
        return Inertia::render('Timesheets/Edit', ['timesheet' => $timesheet, 'projects' => $projects, 'tasks' => $tasks]);
    }

    public function update(Request $request, Timesheet $timesheet)
    {
        $this->authorize('update', $timesheet);

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $timesheet->update($validated);

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
            'filters' => $request->only(['employee', 'project', 'date_from', 'date_to'])
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
}
