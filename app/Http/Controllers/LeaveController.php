<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;
use App\Notifications\LeaveAppliedNotification;
use App\Notifications\LeaveApplicationConfirmationNotification;
use App\Notifications\LeaveApprovedNotification;
use App\Notifications\LeaveRejectedNotification;
use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);
        $query = Leave::query();

        $isApprover = $user->hasAnyRole(['Admin', 'HR', 'Manager']);

        if ($isApprover) {
            $query->with(['employee.user', 'leaveType']);
        } else {
            $query->with('leaveType');
            $query->where('employee_id', $user->employee->id);
        }

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee.user', function ($uq) use ($search) {
                    $uq->where('name', 'like', '%' . $search . '%')
                       ->orWhere('email', 'like', '%' . $search . '%');
                });
                $q->orWhere('reason', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('status')) {
            $status = $request->get('status');
            if (is_string($status) && strpos($status, ',') !== false) {
                $status = explode(',', $status);
            }
            $query->whereIn('status', is_array($status) ? $status : [$status]);
        }

        // Handle both 'type' (from frontend) and 'leave_type_id' (legacy)
        if ($request->filled('type') || $request->filled('leave_type_id')) {
            $leaveType = $request->get('type') ?: $request->get('leave_type_id');
            if (is_string($leaveType) && strpos($leaveType, ',') !== false) {
                $leaveType = explode(',', $leaveType);
            }
            
            // If the type is a string (like 'annual', 'sick'), convert to leave_type_id
            if (is_array($leaveType)) {
                $typeIds = [];
                foreach ($leaveType as $type) {
                    if (is_numeric($type)) {
                        $typeIds[] = $type;
                    } else {
                        // Convert simplified type name to full name, then to ID
                        $fullName = $this->getFullLeaveTypeName($type);
                        $leaveTypeModel = LeaveType::where('name', $fullName)->first();
                        if ($leaveTypeModel) {
                            $typeIds[] = $leaveTypeModel->id;
                        }
                    }
                }
                $query->whereIn('leave_type_id', $typeIds);
            } else {
                if (is_numeric($leaveType)) {
                    $query->where('leave_type_id', $leaveType);
                } else {
                    // Convert simplified type name to full name, then to ID
                    $fullName = $this->getFullLeaveTypeName($leaveType);
                    $leaveTypeModel = LeaveType::where('name', $fullName)->first();
                    if ($leaveTypeModel) {
                        $query->where('leave_type_id', $leaveTypeModel->id);
                    }
                }
            }
        }

        if ($request->filled('employee_id') && $isApprover) {
            $employeeId = $request->get('employee_id');
            if ($employeeId === 'my_team') {
                // TODO: Implement my_team logic
                // e.g., $teamIds = $user->employee->managedEmployees()->pluck('id');
                // $query->whereIn('employee_id', $teamIds);
            } else {
        
                $query->where('employee_id', $employeeId);
            }
        }

        // Date filtering - support both single date_from and date range
        if ($request->filled('date_from')) {
            $dateFrom = $request->get('date_from');
            $query->where('from_date', '>=', $dateFrom);
        }
        
        if ($request->filled('date_to')) {
            $dateTo = $request->get('date_to');
            $query->where('to_date', '<=', $dateTo);
        }

        
        
        $leaves = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Leaves/Index', [
            'leaves' => $leaves,
            'queryParams' => $request->query(),
            'canManageLeaves' => $isApprover,
            'filters' => [
                'leaveTypes' => LeaveType::all(),
                'employees' => $isApprover ? Employee::with('user')->get()->map(function($emp) {
                    return ['id' => $emp->id, 'name' => $emp->user ? $emp->user->name : 'Unknown'];
                }) : [],
            ],
        ]);
    }

    public function create()
    {
        $leaveTypes = LeaveType::all();
        return Inertia::render('Leaves/Create', ['leaveTypes' => $leaveTypes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'nullable|string',
        ]);

        $validated['employee_id'] = Auth::user()->employee->id;
        $validated['status'] = 'pending';

        $leave = Leave::create($validated);

        // Load relationships for notifications
        $leave->load(['employee.user', 'leaveType']);

        // Notify the employee who applied
        Auth::user()->notify(new LeaveApplicationConfirmationNotification($leave));

        // Notify admins and HR
        $admins = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'HR']);
        })->get();

        foreach ($admins as $admin) {
            $admin->notify(new LeaveAppliedNotification($leave));
        }

        $this->logAudit('Leave Created', 'Created leave request for dates: ' . $validated['from_date'] . ' to ' . $validated['to_date']);
        return redirect()->route('leaves.index')->with('success', 'Leave request submitted.');
    }

    public function show(Leave $leave)
    {
        $this->authorize('view', $leave);
        
        // Use fresh query with relationships instead of loading on existing model
        $leave = Leave::with(['employee.user.roles', 'employee.department', 'leaveType', 'approver'])
            ->findOrFail($leave->id);
        
        // Calculate leave balance for the employee and leave type
        $leaveBalance = null;
        if ($leave->employee && $leave->leaveType) {
            // Simple calculation - you might want to implement more complex logic
            $usedLeaves = Leave::where('employee_id', $leave->employee_id)
                ->where('leave_type_id', $leave->leave_type_id)
                ->where('status', 'approved')
                ->whereYear('from_date', date('Y'))
                ->sum(DB::raw('DATEDIFF(to_date, from_date) + 1'));
            
            $totalQuota = $leave->leaveType->quota ?? 25; // Default 25 days
            $leaveBalance = max(0, $totalQuota - $usedLeaves);
        }
        
        // Debug: Log the leave data being passed to the frontend
        \Log::info('Leave Controller Show Method:', [
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'leave_id' => $leave->id,
            'leave_employee_id' => $leave->employee_id,
            'leave_type_id' => $leave->leave_type_id,
            'leave_type' => $leave->leaveType ? $leave->leaveType->name : 'No leave type',
            'employee' => $leave->employee ? ($leave->employee->user ? $leave->employee->user->name : 'No user') : 'No employee',
            'dates' => ['from' => $leave->from_date, 'to' => $leave->to_date],
            'status' => $leave->status,
            'employee_loaded' => $leave->relationLoaded('employee'),
            'leave_type_loaded' => $leave->relationLoaded('leaveType'),
            'user_loaded' => $leave->employee ? $leave->employee->relationLoaded('user') : false,
            'leave_array' => $leave->toArray(),
            'inertia_data' => [
                'leave' => $leave,
                'leaveBalance' => $leaveBalance
            ]
        ]);
        
        return Inertia::render('Leaves/Show', [
            'leave' => $leave,
            'leaveBalance' => $leaveBalance
        ]);
    }

    public function edit(Leave $leave)
    {
        $this->authorize('update', $leave);
        
        // Load relationships for admin editing
        $leave->load(['employee.user', 'leaveType']);
        
        $leaveTypes = LeaveType::all();
        return Inertia::render('Leaves/Edit', ['leave' => $leave, 'leaveTypes' => $leaveTypes]);
    }

    public function update(Request $request, Leave $leave)
    {
        $this->authorize('update', $leave);

        $validated = $request->validate([
            'leave_type_id' => 'sometimes|exists:leave_types,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
            'reason' => 'nullable|string',
        ]);

        $leave->update($validated);

        $this->logAudit('Leave Updated', 'Updated leave ID: ' . $leave->id);
        return redirect()->route('leaves.index')->with('success', 'Leave updated.');
    }

    public function approve(Request $request, Leave $leave)
    {
        try {
            $this->authorize('approve', $leave);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to approve this leave request.'
                ], 403);
            }
            throw $e;
        }

        $leave->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'approval_comments' => $request->input('comments'),
        ]);

        // Reload the leave with relationships for notification
        $leave->load(['employee.user', 'leaveType', 'approver']);
        
        $leave->employee->user->notify(new LeaveApprovedNotification($leave));

        $this->logAudit('Leave Approved', 'Approved leave ID: ' . $leave->id);
        
        // Handle AJAX requests (but not Inertia requests)
        if (($request->expectsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Leave approved successfully.',
                'leave' => $leave->fresh()
            ]);
        }
        
        return redirect()->back()->with('success', 'Leave approved successfully.');
    }

    public function reject(Request $request, Leave $leave)
    {
        try {
            $this->authorize('reject', $leave);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to reject this leave request.'
                ], 403);
            }
            throw $e;
        }

        $leave->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'approval_comments' => $request->input('comments', 'Request rejected'),
        ]);

        // Reload the leave with relationships for notification
        $leave->load(['employee.user', 'leaveType', 'approver']);
        
        $leave->employee->user->notify(new LeaveRejectedNotification($leave));

        $this->logAudit('Leave Rejected', 'Rejected leave ID: ' . $leave->id);
        
        // Handle AJAX requests (but not Inertia requests)
        if (($request->expectsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Leave rejected successfully.',
                'leave' => $leave->fresh()
            ]);
        }
        
        return redirect()->back()->with('success', 'Leave rejected successfully.');
    }

    public function updateAndApprove(Request $request, Leave $leave)
    {
        $this->authorize('update', $leave);
        $this->authorize('approve', $leave);

        $validated = $request->validate([
            'leave_type_id' => 'sometimes|exists:leave_types,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
            'reason' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        // Extract approval comments
        $approvalComments = $validated['comments'] ?? 'Updated and approved by admin';
        unset($validated['comments']);

        // Update the leave details
        $leave->update($validated);

        // Approve the leave
        $leave->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'approval_comments' => $approvalComments,
        ]);

        // Reload the leave with relationships for notification
        $leave->load(['employee.user', 'leaveType', 'approver']);
        
        $leave->employee->user->notify(new LeaveApprovedNotification($leave));

        $this->logAudit('Leave Updated and Approved', 'Updated and approved leave ID: ' . $leave->id);
        return redirect()->route('leaves.show', $leave->id)->with('success', 'Leave updated and approved successfully.');
    }

    public function destroy(Leave $leave)
    {
        $this->authorize('delete', $leave);

        $leave->delete();

        $this->logAudit('Leave Deleted', 'Deleted leave ID: ' . $leave->id);
        return redirect()->route('leaves.index')->with('success', 'Leave deleted.');
    }

    /**
     * Convert simplified leave type names from frontend to full database names
     */
    private function getFullLeaveTypeName($simplifiedName)
    {
        $mapping = [
            'annual' => 'Annual Leave',
            'sick' => 'Sick Leave', 
            'personal' => 'Personal Leave',
            'maternity' => 'Maternity Leave',
            'paternity' => 'Paternity Leave',
            'study' => 'Study Leave',
            'emergency' => 'Emergency Leave',
        ];

        return $mapping[strtolower($simplifiedName)] ?? $simplifiedName;
    }
}
