<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Timesheet;
use App\Models\Feedback;
use App\Models\User;
use App\Models\Project;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function stats()
    {
        $stats = [
            'totalUsers' => User::count(),
            'activeProjects' => Project::where('status', 'active')->count(),
            'completedTasks' => Timesheet::where('status', 'completed')->count(),
            'hoursLogged' => Timesheet::sum('hours') ?? 0
        ];

        return response()->json(['stats' => $stats]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'format' => 'string|in:pdf,excel'
        ]);

        // For now, we'll simulate report generation
        // In a real application, you might queue this job
        
        return response()->json([
            'success' => true,
            'message' => 'Report generation started'
        ]);
    }

    public function schedule(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'frequency' => 'required|string|in:daily,weekly,monthly'
        ]);

        // Here you would typically save the schedule to a database
        // and set up a scheduled job
        
        return response()->json([
            'success' => true,
            'message' => 'Report scheduled successfully'
        ]);
    }

    public function custom(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sources' => 'required|array',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date|after_or_equal:startDate'
        ]);

        // Here you would generate a custom report based on the parameters
        
        return response()->json([
            'success' => true,
            'message' => 'Custom report generation started'
        ]);
    }

    public function recent()
    {
        // For now, return mock data
        // In a real application, you'd fetch from a reports table
        $reports = [
            [
                'id' => 1,
                'name' => 'Monthly Project Summary',
                'type' => 'project-summary',
                'status' => 'completed',
                'created_at' => now()->subDays(2)->toISOString()
            ],
            [
                'id' => 2,
                'name' => 'Team Performance Report',
                'type' => 'team-performance',
                'status' => 'processing',
                'created_at' => now()->subHours(3)->toISOString()
            ]
        ];

        return response()->json(['reports' => $reports]);
    }

    public function download($id)
    {
        // In a real application, you'd fetch the report file and return it
        // For now, we'll return a simple PDF
        $pdf = Pdf::loadView('reports.sample', ['reportId' => $id]);
        return $pdf->download("report-{$id}.pdf");
    }

    public function destroy($id)
    {
        // Here you would delete the report from storage and database
        
        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully'
        ]);
    }
    public function attendancePdf()
    {
        $attendances = Attendance::with('employee.user')->get();
        $pdf = Pdf::loadView('reports.attendance', ['attendances' => $attendances]);
        return $pdf->download('attendance-report.pdf');
    }

    public function attendanceExcel()
    {
        return Excel::download(new \App\Exports\AttendancesExport, 'attendance-report.xlsx');
    }

    public function leavesPdf()
    {
        $leaves = Leave::with(['employee.user', 'leaveType'])->get();
        $pdf = Pdf::loadView('reports.leaves', ['leaves' => $leaves]);
        return $pdf->download('leaves-report.pdf');
    }

    public function leavesExcel()
    {
        return Excel::download(new \App\Exports\LeavesExport, 'leaves-report.xlsx');
    }

    public function timesheetsPdf()
    {
        $timesheets = Timesheet::with(['employee.user', 'project', 'task'])->get();
        $pdf = Pdf::loadView('reports.timesheets', ['timesheets' => $timesheets]);
        return $pdf->download('timesheets-report.pdf');
    }

    public function timesheetsExcel()
    {
        return Excel::download(new \App\Exports\TimesheetsExport, 'timesheets-report.xlsx');
    }

    public function feedbacksPdf()
    {
        $feedbacks = Feedback::with(['reviewer', 'reviewee'])->get();
        $pdf = Pdf::loadView('reports.feedbacks', ['feedbacks' => $feedbacks]);
        return $pdf->download('feedbacks-report.pdf');
    }

    public function feedbacksExcel()
    {
        return Excel::download(new \App\Exports\FeedbacksExport, 'feedbacks-report.xlsx');
    }
}
