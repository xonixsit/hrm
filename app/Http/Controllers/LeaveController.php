<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;
use App\Notifications\LeaveApprovedNotification;
use App\Notifications\LeaveRejectedNotification;

class LeaveController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('HR') || $user->hasRole('Manager')) {
            $leaves = Leave::with(['employee.user', 'leaveType'])->paginate(10);
        } else {
            $employee = $user->employee;
            $leaves = Leave::where('employee_id', $employee->id)->with('leaveType')->paginate(10);
        }
        return Inertia::render('Leaves/Index', ['leaves' => $leaves]);
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
