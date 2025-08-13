<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LeaveController;
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
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
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
    Route::resource('departments', DepartmentController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('tasks', TaskController::class);
    Route::resource('timesheets', TimesheetController::class);
    Route::resource('work-reports', WorkReportController::class);
    Route::resource('attendances', AttendanceController::class);
    Route::post('attendances/clock-in', [AttendanceController::class, 'clockIn'])->name('attendances.clockIn');
    Route::post('attendances/clock-out', [AttendanceController::class, 'clockOut'])->name('attendances.clockOut');
    Route::get('attendances/{attendance}/export', [AttendanceController::class, 'export'])->name('attendances.export');
    Route::post('attendances/bulk-export', [AttendanceController::class, 'bulkExport'])->name('attendances.bulkExport');
    
    // Real-time attendance API routes
    Route::prefix('api/attendance')->group(function () {
        Route::post('clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('clock-out', [AttendanceController::class, 'clockOut']);
        Route::post('break-start', [AttendanceController::class, 'startBreak']);
        Route::post('break-end', [AttendanceController::class, 'endBreak']);
        Route::get('current', [AttendanceController::class, 'getCurrentStatus']);
    });
    Route::resource('leaves', LeaveController::class);
    Route::resource('feedbacks', FeedbackController::class);

    Route::get('/reports/attendance/pdf', [ReportController::class, 'attendancePdf'])->name('reports.attendance.pdf');
    Route::get('/reports/attendance/excel', [ReportController::class, 'attendanceExcel'])->name('reports.attendance.excel');
    Route::get('/reports/leaves/pdf', [ReportController::class, 'leavesPdf'])->name('reports.leaves.pdf');
    Route::get('/reports/leaves/excel', [ReportController::class, 'leavesExcel'])->name('reports.leaves.excel');
    Route::get('/reports/timesheets/pdf', [ReportController::class, 'timesheetsPdf'])->name('reports.timesheets.pdf');
    Route::get('/reports/timesheets/excel', [ReportController::class, 'timesheetsExcel'])->name('reports.timesheets.excel');
    Route::get('/reports/feedbacks/pdf', [ReportController::class, 'feedbacksPdf'])->name('reports.feedbacks.pdf');
    Route::get('/reports/feedbacks/excel', [ReportController::class, 'feedbacksExcel'])->name('reports.feedbacks.excel');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

require __DIR__.'/auth.php';
