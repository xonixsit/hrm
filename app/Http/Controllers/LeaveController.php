<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;
use App\Notifications\LeaveApprovedNotification;
use App\Notifications\LeaveRejectedNotification;

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
            $query->whereIn('status', is_array($status) ? $status : [$status]);
        }

        if ($request->filled('leave_type_id')) {
            $leaveType = $request->get('leave_type_id');
            $query->whereIn('leave_type_id', is_array($leaveType) ? $leaveType : [$leaveType]);
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

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            $query->where('from_date', '>=', $dateFrom)
                  ->where('to_date', '<=', $dateTo);
        }

        
        
        $leaves = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Leaves/Index', [
            'leaves' => $leaves,
            'queryParams' => $request->query(),
            'canManageLeaves' => $isApprover,
            'leaveTypes' => LeaveType::all(),
            'employees' => Employee::with('user')->get()->map(function($emp) {
                return ['id' => $emp->id, 'name' => $emp->user ? $emp->user->name : 'Unknown'];
            }),
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

        Leave::create($validated);

        $this->logAudit('Leave Created', 'Created leave request for dates: ' . $validated['from_date'] . ' to ' . $validated['to_date']);
        return redirect()->route('leaves.index')->with('success', 'Leave request submitted.');
    }

    public function show(Leave $leave)
    {
        $leave->load(['employee.user', 'leaveType']);
        
        // Debug: Log the leave data being passed to the frontend
        if (config('app.debug')) {
            \Log::info('Leave data being passed to frontend:', [
                'leave_id' => $leave->id,
                'leave_type' => $leave->leaveType ? $leave->leaveType->name : 'No leave type',
                'employee' => $leave->employee ? $leave->employee->user->name ?? 'No user' : 'No employee',
                'dates' => ['from' => $leave->from_date, 'to' => $leave->to_date],
                'status' => $leave->status
            ]);
        }
        
        return Inertia::render('Leaves/Show', ['leave' => $leave]);
    }

    public function edit(Leave $leave)
    {
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
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $leave->update($validated);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'approved') {
                $leave->employee->user->notify(new LeaveApprovedNotification($leave));
            } elseif ($validated['status'] === 'rejected') {
                $leave->employee->user->notify(new LeaveRejectedNotification($leave));
            }
        }

        $this->logAudit('Leave Updated', 'Updated leave ID: ' . $leave->id);
        return redirect()->route('leaves.index')->with('success', 'Leave updated.');
    }

    public function destroy(Leave $leave)
    {
        $this->authorize('delete', $leave);

        $leave->delete();

        $this->logAudit('Leave Deleted', 'Deleted leave ID: ' . $leave->id);
        return redirect()->route('leaves.index')->with('success', 'Leave deleted.');
    }
}
