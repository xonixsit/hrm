<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Timesheet;
use App\Models\Feedback;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
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
