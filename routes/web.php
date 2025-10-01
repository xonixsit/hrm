<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimesheetController;
use App\Http\Controllers\WorkReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Form Layout Demo
    Route::get('/form-layout-demo', function () {
        return Inertia::render('FormLayoutDemo');
    })->name('form.layout.demo');
    
    // Animation Demo
    Route::get('/animation-demo', function () {
        return Inertia::render('AnimationDemo');
    })->name('animation.demo');
    Route::resource('employees', EmployeeController::class);
    Route::get('employees-trash', [EmployeeController::class, 'trash'])->name('employees.trash');
    Route::post('employees/{employee}/reset-password', [EmployeeController::class, 'resetPassword'])->name('employees.reset-password');
    Route::post('employees/{employee}/mark-as-exit', [EmployeeController::class, 'markAsExit'])->name('employees.mark-as-exit');
    Route::post('employees/{employee}/reactivate', [EmployeeController::class, 'reactivate'])->name('employees.reactivate');
    Route::post('employees/{id}/restore', [EmployeeController::class, 'restore'])->name('employees.restore');
    Route::delete('employees/{id}/force-delete', [EmployeeController::class, 'forceDelete'])->name('employees.force-delete');
    Route::resource('departments', DepartmentController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('tasks', TaskController::class);
    Route::resource('timesheets', TimesheetController::class);
    Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve'])->name('timesheets.approve');
    Route::post('timesheets/{timesheet}/reject', [TimesheetController::class, 'reject'])->name('timesheets.reject');
    Route::post('timesheets/bulk-approve', [TimesheetController::class, 'bulkApprove'])->name('timesheets.bulk-approve');
    Route::get('timesheets/pending/approvals', [TimesheetController::class, 'pendingApprovals'])->name('timesheets.pending-approvals');
    Route::get('api/timesheets/approval-stats', [TimesheetController::class, 'approvalStats'])->name('timesheets.approval-stats');
    Route::get('work-reports/leaderboard', [WorkReportController::class, 'leaderboard'])->name('work-reports.leaderboard');
    Route::resource('work-reports', WorkReportController::class);
    Route::resource('attendances', AttendanceController::class);
    Route::post('attendances/clock-in', [AttendanceController::class, 'clockIn'])->name('attendances.clockIn');
    Route::post('attendances/clock-out', [AttendanceController::class, 'clockOut'])->name('attendances.clockOut');
    Route::get('attendances/{attendance}/export', [AttendanceController::class, 'export'])->name('attendances.export');
    Route::post('attendances/bulk-export', [AttendanceController::class, 'bulkExport'])->name('attendances.bulkExport');
    
    Route::get('api/csrf-token', function () {
        return response()->json(['csrf_token' => csrf_token()]);
    });

    // Real-time attendance API routes
    Route::prefix('api/attendance')->group(function () {
        Route::post('clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('clock-out', [AttendanceController::class, 'clockOut']);
        Route::post('break-start', [AttendanceController::class, 'startBreak']);
        Route::post('break-end', [AttendanceController::class, 'endBreak']);
        Route::get('current', [AttendanceController::class, 'getCurrentStatus']);
    });
    Route::resource('leaves', LeaveController::class)->parameters(['leaves' => 'leave']);
    Route::post('leaves/{leave}/approve', [LeaveController::class, 'approve'])->name('leaves.approve');
    Route::post('leaves/{leave}/reject', [LeaveController::class, 'reject'])->name('leaves.reject');
    Route::put('leaves/{leave}/update-and-approve', [LeaveController::class, 'updateAndApprove'])->name('leaves.update-and-approve');
    
    // Leave Types (Leave Policies) Management
    Route::resource('leave-types', LeaveTypeController::class)->parameters(['leave-types' => 'leaveType']);
    Route::post('leave-types/{leaveType}/toggle-status', [LeaveTypeController::class, 'toggleStatus'])->name('leave-types.toggle-status');
    
    // Debug route to test data passing
    Route::get('debug/leave-data/{leave}', function(App\Models\Leave $leave) {
        $leave->load(['employee.user', 'leaveType']);
        
        return response()->json([
            'raw_leave' => $leave->toArray(),
            'inertia_data' => [
                'leave' => $leave
            ],
            'relationships_loaded' => [
                'employee' => $leave->relationLoaded('employee'),
                'leaveType' => $leave->relationLoaded('leaveType'),
                'user' => $leave->employee ? $leave->employee->relationLoaded('user') : false
            ]
        ]);
    })->name('debug.leave.data');
    Route::resource('feedbacks', FeedbackController::class);

    Route::get('/reports/attendance/pdf', [ReportController::class, 'attendancePdf'])->name('reports.attendance.pdf');
    Route::get('/reports/attendance/excel', [ReportController::class, 'attendanceExcel'])->name('reports.attendance.excel');
    Route::get('/reports/leaves/pdf', [ReportController::class, 'leavesPdf'])->name('reports.leaves.pdf');
    Route::get('/reports/leaves/excel', [ReportController::class, 'leavesExcel'])->name('reports.leaves.excel');
    Route::get('/reports/timesheets/pdf', [ReportController::class, 'timesheetsPdf'])->name('reports.timesheets.pdf');
    Route::get('/reports/timesheets/excel', [ReportController::class, 'timesheetsExcel'])->name('reports.timesheets.excel');
    Route::get('/reports/feedbacks/pdf', [ReportController::class, 'feedbacksPdf'])->name('reports.feedbacks.pdf');
    Route::get('/reports/feedbacks/excel', [ReportController::class, 'feedbacksExcel'])->name('reports.feedbacks.excel');
    
    // Reports Dashboard Routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/stats', [ReportController::class, 'stats'])->name('reports.stats');
    Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
    Route::post('/reports/schedule', [ReportController::class, 'schedule'])->name('reports.schedule');
    Route::post('/reports/custom', [ReportController::class, 'custom'])->name('reports.custom');
    Route::get('/reports/recent', [ReportController::class, 'recent'])->name('reports.recent');
    Route::get('/reports/{id}/download', [ReportController::class, 'download'])->name('reports.download');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->name('reports.destroy');
    
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

require __DIR__.'/auth.php';
