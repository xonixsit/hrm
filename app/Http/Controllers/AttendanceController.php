<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class AttendanceController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('HR')) {
            $attendances = Attendance::with('employee.user')->paginate(10);
        } else {
            $employee = $user->employee;
            $attendances = Attendance::where('employee_id', $employee->id)->paginate(10);
        }
        return Inertia::render('Attendances/Index', ['attendances' => $attendances]);
    }

    public function clockIn(Request $request)
    {
        $employee = Auth::user()->employee;
        // Check if already clocked in today
        $today = now()->format('Y-m-d');
        $existing = Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->first();
        if ($existing) {
            return back()->with('error', 'Already clocked in today.');
        }

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'clock_in' => now(),
            'ip_address' => $request->ip(),
            'location' => $request->input('location', ''), // Assume geolocation is passed
        ]);

        $this->logAudit('Attendance Clock In', 'Clocked in for employee ID: ' . $employee->id);
        return back()->with('success', 'Clocked in successfully.');
    }

    public function clockOut()
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        $attendance = Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->whereNull('clock_out')->first();
        if (!$attendance) {
            return back()->with('error', 'No clock-in record found for today.');
        }

        $attendance->update(['clock_out' => now()]);

        $this->logAudit('Attendance Clock Out', 'Clocked out for employee ID: ' . $employee->id);
        return back()->with('success', 'Clocked out successfully.');
    }

    public function edit(Attendance $attendance)
    {
        return Inertia::render('Attendances/Edit', ['attendance' => $attendance]);
    }

    public function update(Request $request, Attendance $attendance)
    {
        // Only HR/Admin can edit
        $this->authorize('update', $attendance);

        $validated = $request->validate([
            'clock_in' => 'required|date',
            'clock_out' => 'nullable|date|after:clock_in',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);
        $attendance->edited_by = Auth::id();
        $attendance->save();

        $this->logAudit('Attendance Updated', 'Updated attendance ID: ' . $attendance->id);
        return redirect()->route('attendances.index')->with('success', 'Attendance updated.');
    }
}
