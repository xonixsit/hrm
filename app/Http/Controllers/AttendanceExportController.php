<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AttendanceExportController extends Controller
{
    /**
     * Export attendance report for admin dashboard widget
     */
    public function exportAttendanceReport(Request $request)
    {
        try {
            // Only Admin/HR can export attendance reports
            if (!Auth::user()->hasRole(['Admin', 'HR'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to export attendance reports.'
                ], 403);
            }

            $today = now()->format('Y-m-d');
            
            // Get all active employees with Employee role
            $employeeRoleEmployees = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    });
                })
                ->with(['user', 'department'])
                ->get();

            // Get today's attendance records for these employees
            $todaysAttendances = Attendance::whereDate('date', $today)
                ->whereIn('employee_id', $employeeRoleEmployees->pluck('id'))
                ->with(['employee.user', 'employee.department'])
                ->get()
                ->keyBy('employee_id');

            // Prepare data for export
            $exportData = [];
            
            foreach ($employeeRoleEmployees as $employee) {
                $attendance = $todaysAttendances->get($employee->id);
                
                if ($attendance) {
                    // Employee has clocked in
                    $exportData[] = [
                        'Employee Name' => $employee->user->name,
                        'Employee Code' => $employee->employee_code,
                        'Department' => $employee->department ? $employee->department->name : 'No Department',
                        'Job Title' => $employee->job_title,
                        'Status' => $attendance->clock_out ? 'Clocked Out' : 'Clocked In',
                        'Clock In Time' => $attendance->clock_in ? $attendance->clock_in->format('H:i:s') : 'N/A',
                        'Clock Out Time' => $attendance->clock_out ? $attendance->clock_out->format('H:i:s') : 'Still Working',
                        'Work Duration' => $attendance->work_duration,
                        'Break Duration' => $attendance->break_duration,
                        'Break Sessions' => count($attendance->break_sessions ?? []),
                        'On Break' => $attendance->on_break ? 'Yes' : 'No',
                        'Location' => $attendance->location ?? 'N/A',
                        'Notes' => $attendance->notes ?? 'N/A'
                    ];
                } else {
                    // Employee hasn't clocked in
                    $exportData[] = [
                        'Employee Name' => $employee->user->name,
                        'Employee Code' => $employee->employee_code,
                        'Department' => $employee->department ? $employee->department->name : 'No Department',
                        'Job Title' => $employee->job_title,
                        'Status' => 'Not Clocked In',
                        'Clock In Time' => 'N/A',
                        'Clock Out Time' => 'N/A',
                        'Work Duration' => '0h 0m',
                        'Break Duration' => '0h 0m',
                        'Break Sessions' => 0,
                        'On Break' => 'No',
                        'Location' => 'N/A',
                        'Notes' => 'Employee has not clocked in today'
                    ];
                }
            }

            $filename = "attendance_report_{$today}.xlsx";
            
            // Create Excel export using Laravel Excel
            return Excel::download(
                new AttendanceReportExport($exportData, $employeeRoleEmployees->count(), $todaysAttendances->count()),
                $filename
            );
            
        } catch (\Exception $e) {
            Log::error('Failed to export attendance report: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to export attendance report. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

class AttendanceReportExport implements FromArray, WithHeadings, WithStyles, WithTitle
{
    private $data;
    private $totalEmployees;
    private $clockedInCount;
    
    public function __construct($data, $totalEmployees, $clockedInCount) 
    {
        $this->data = $data;
        $this->totalEmployees = $totalEmployees;
        $this->clockedInCount = $clockedInCount;
    }
    
    public function array(): array 
    {
        // Add summary rows at the top
        $summary = [
            ['Attendance Report - ' . now()->format('F j, Y')],
            ['Total Employees: ' . $this->totalEmployees . ' | Clocked In: ' . $this->clockedInCount . ' | Missed Clock-in: ' . ($this->totalEmployees - $this->clockedInCount)],
            [''], // Empty row
        ];
        
        // Add data rows
        return array_merge($summary, array_map('array_values', $this->data));
    }
    
    public function headings(): array 
    {
        return [
            '', // Empty for summary rows
            '',
            '',
            'Employee Name',
            'Employee Code', 
            'Department',
            'Job Title',
            'Status',
            'Clock In Time',
            'Clock Out Time',
            'Work Duration',
            'Break Duration',
            'Break Sessions',
            'On Break',
            'Location',
            'Notes'
        ];
    }
    
    public function styles(Worksheet $sheet) 
    {
        // Style summary rows
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getFont()->setBold(true);
        
        // Style headers (row 4)
        $sheet->getStyle('A4:P4')->getFont()->setBold(true);
        $sheet->getStyle('A4:P4')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF4F81BD');
        $sheet->getStyle('A4:P4')->getFont()->getColor()->setARGB('FFFFFFFF');
        
        // Auto-size columns
        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        return [];
    }
    
    public function title(): string 
    {
        return 'Attendance Report';
    }
}