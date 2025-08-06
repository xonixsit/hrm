<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Timesheet;
use App\Models\Leave;
use App\Models\Feedback;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first();

        $data = [];

        if (in_array($role, ['Admin', 'HR'])) {
            $data['totalEmployees'] = \App\Models\Employee::count();
            $data['pendingLeaves'] = Leave::where('status', 'pending')->count();
            $data['pendingTimesheets'] = Timesheet::where('status', 'pending')->count();
            $data['recentFeedbacks'] = Feedback::with(['reviewer', 'reviewee'])->latest()->take(5)->get();
        } elseif ($role === 'Manager') {
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            $data['teamAttendances'] = Attendance::whereIn('employee_id', $teamEmployeeIds)->latest()->take(10)->get();
            $data['pendingApprovals'] = Leave::where('status', 'pending')->whereIn('employee_id', $teamEmployeeIds)->count() + Timesheet::where('status', 'pending')->whereIn('employee_id', $teamEmployeeIds)->count();
        } else {
            $data['myAttendances'] = Attendance::where('employee_id', $user->employee->id)->latest()->take(5)->get();
            $data['myLeaves'] = Leave::where('employee_id', $user->employee->id)->latest()->take(5)->get();
            $data['myTimesheets'] = Timesheet::where('employee_id', $user->employee->id)->latest()->take(5)->get();
            $data['myFeedbacks'] = Feedback::where('reviewee_id', $user->id)->latest()->take(5)->get();
        }

        return Inertia::render('Dashboard', $data);
    }
}
