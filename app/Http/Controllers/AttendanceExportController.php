<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class AttendanceExportController extends Controller
{
    /**
     * Export attendance report with filters (date range, employee, status)
     */
    public function exportAttendanceReport(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check authorization
            $isAdminOrHR = $user->hasAnyRole(['Admin', 'HR']);
            
            // Date range
            $dateFrom = $request->date_from ?? now()->startOfMonth()->format('Y-m-d');
            $dateTo = $request->date_to ?? now()->endOfMonth()->format('Y-m-d');
            
            // Build query for detailed records
            $query = Attendance::with(['employee.user', 'employee.department']);
            
            $query->whereDate('date', '>=', $dateFrom)
                  ->whereDate('date', '<=', $dateTo);
            
            // Employee filter (Admin/HR only)
            if ($isAdminOrHR && $request->filled('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            } elseif (!$isAdminOrHR) {
                // Regular users can only export their own attendance
                $employee = $user->employee;
                if (!$employee) {
                    abort(404, 'No employee record found.');
                }
                $query->where('employee_id', $employee->id);
            }
            
            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            
            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('employee.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('notes', 'like', "%{$search}%");
            }
            
            // Get attendance records
            $attendances = $query->orderBy('date', 'desc')->get();
            
            // Calculate summary statistics per employee
            $summaryData = $this->calculateSummary($attendances, $dateFrom, $dateTo);
            
            // Prepare detailed data
            $detailedData = [];
            foreach ($attendances as $attendance) {
                // Handle date - could be Carbon instance or string
                $dateValue = 'N/A';
                if ($attendance->date) {
                    if ($attendance->date instanceof \Carbon\Carbon) {
                        $dateValue = $attendance->date->format('Y-m-d');
                    } else {
                        $dateValue = $attendance->date;
                    }
                }
                
                // Handle clock_in - could be Carbon instance or string
                $clockInValue = 'N/A';
                if ($attendance->clock_in) {
                    if ($attendance->clock_in instanceof \Carbon\Carbon) {
                        $clockInValue = $attendance->clock_in->format('H:i:s');
                    } else {
                        $clockInValue = $attendance->clock_in;
                    }
                }
                
                // Handle clock_out - could be Carbon instance or string
                $clockOutValue = 'Not Clocked Out';
                if ($attendance->clock_out) {
                    if ($attendance->clock_out instanceof \Carbon\Carbon) {
                        $clockOutValue = $attendance->clock_out->format('H:i:s');
                    } else {
                        $clockOutValue = $attendance->clock_out;
                    }
                }
                
                $detailedData[] = [
                    'Employee Name' => $attendance->employee->user->name ?? 'N/A',
                    'Employee Code' => $attendance->employee->employee_code ?? 'N/A',
                    'Department' => $attendance->employee->department->name ?? 'No Department',
                    'Job Title' => $attendance->employee->job_title ?? 'N/A',
                    'Date' => $dateValue,
                    'Clock In Time' => $clockInValue,
                    'Clock Out Time' => $clockOutValue,
                    'Work Duration' => $attendance->work_duration ?? '0h 0m',
                    'Break Duration' => $attendance->break_duration ?? '0h 0m',
                    'Break Sessions' => count($attendance->break_sessions ?? []),
                    'Status' => $this->formatStatus($attendance->status),
                    'Location' => $attendance->location ?? 'N/A',
                    'Notes' => $attendance->notes ?? 'N/A'
                ];
            }
            
            // Generate filename
            $filename = "attendance_report_{$dateFrom}_to_{$dateTo}.xlsx";
            
            // Create Excel export with multiple sheets
            return Excel::download(
                new AttendanceReportMultiSheetExport($summaryData, $detailedData, $dateFrom, $dateTo),
                $filename
            );
            
        } catch (\Exception $e) {
            Log::error('Failed to export attendance report: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Failed to export attendance report: ' . $e->getMessage());
        }
    }
    
    private function calculateSummary($attendances, $dateFrom, $dateTo)
    {
        // Group by employee
        $grouped = $attendances->groupBy('employee_id');
        
        // Calculate working days in date range (excluding weekends)
        $start = new \DateTime($dateFrom);
        $end = new \DateTime($dateTo);
        $interval = new \DateInterval('P1D');
        $dateRange = new \DatePeriod($start, $interval, $end->modify('+1 day'));
        
        $workingDays = 0;
        foreach ($dateRange as $date) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if ($date->format('N') < 6) {
                $workingDays++;
            }
        }
        
        $summaryData = [];
        
        foreach ($grouped as $employeeId => $records) {
            $employee = $records->first()->employee;
            
            // Count present days (clocked out = completed day)
            $presentDays = $records->where('status', 'clocked_out')->count();
            
            // Count absent days
            $absentDays = $workingDays - $presentDays;
            
            // Calculate break violations (break > 1 hour)
            $breakViolations = 0;
            foreach ($records as $record) {
                if ($record->break_duration) {
                    // Parse break duration (format: "Xh Ym")
                    preg_match('/(\d+)h\s*(\d+)m/', $record->break_duration, $matches);
                    if (!empty($matches)) {
                        $hours = (int)($matches[1] ?? 0);
                        $minutes = (int)($matches[2] ?? 0);
                        $totalMinutes = ($hours * 60) + $minutes;
                        
                        // Break violation if > 60 minutes
                        if ($totalMinutes > 60) {
                            $breakViolations++;
                        }
                    }
                }
            }
            
            // Calculate total work hours
            $totalWorkMinutes = 0;
            foreach ($records as $record) {
                if ($record->work_duration) {
                    preg_match('/(\d+)h\s*(\d+)m/', $record->work_duration, $matches);
                    if (!empty($matches)) {
                        $hours = (int)($matches[1] ?? 0);
                        $minutes = (int)($matches[2] ?? 0);
                        $totalWorkMinutes += ($hours * 60) + $minutes;
                    }
                }
            }
            
            $totalWorkHours = floor($totalWorkMinutes / 60);
            $totalWorkMins = $totalWorkMinutes % 60;
            
            // Average work hours per day
            $avgWorkHours = $presentDays > 0 ? round($totalWorkMinutes / $presentDays / 60, 2) : 0;
            
            $summaryData[] = [
                'Employee Name' => $employee->user->name ?? 'N/A',
                'Employee Code' => $employee->employee_code ?? 'N/A',
                'Department' => $employee->department->name ?? 'No Department',
                'Total Working Days' => $workingDays,
                'Days Present' => $presentDays,
                'Days Absent' => $absentDays,
                'Attendance %' => $workingDays > 0 ? round(($presentDays / $workingDays) * 100, 2) . '%' : '0%',
                'Break Violations' => $breakViolations,
                'Total Work Hours' => "{$totalWorkHours}h {$totalWorkMins}m",
                'Avg Hours/Day' => "{$avgWorkHours} hrs"
            ];
        }
        
        return $summaryData;
    }
    
    private function formatStatus($status)
    {
        $statusMap = [
            'clocked_in' => 'Clocked In',
            'clocked_out' => 'Clocked Out',
            'on_break' => 'On Break'
        ];
        return $statusMap[$status] ?? $status ?? 'N/A';
    }
}

// Multi-sheet export class
class AttendanceReportMultiSheetExport implements WithMultipleSheets
{
    private $summaryData;
    private $detailedData;
    private $dateFrom;
    private $dateTo;
    
    public function __construct($summaryData, $detailedData, $dateFrom, $dateTo)
    {
        $this->summaryData = $summaryData;
        $this->detailedData = $detailedData;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }
    
    public function sheets(): array
    {
        return [
            new SummarySheet($this->summaryData, $this->dateFrom, $this->dateTo),
            new DetailedRecordsSheet($this->detailedData, $this->dateFrom, $this->dateTo),
        ];
    }
}

// Summary sheet
class SummarySheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    private $data;
    private $dateFrom;
    private $dateTo;
    
    public function __construct($data, $dateFrom, $dateTo)
    {
        $this->data = $data;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }
    
    public function array(): array
    {
        $summary = [
            ['ATTENDANCE SUMMARY REPORT'],
            ['Period: ' . $this->dateFrom . ' to ' . $this->dateTo],
            ['Total Employees: ' . count($this->data)],
            ['Generated: ' . now()->format('F j, Y g:i A')],
            [''],
        ];
        
        return array_merge($summary, array_map('array_values', $this->data));
    }
    
    public function headings(): array
    {
        return [
            '',
            '',
            '',
            '',
            '',
            'Employee Name',
            'Employee Code',
            'Department',
            'Total Working Days',
            'Days Present',
            'Days Absent',
            'Attendance %',
            'Break Violations',
            'Total Work Hours',
            'Avg Hours/Day'
        ];
    }
    
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        
        // Header row (row 6)
        $sheet->getStyle('A6:O6')->getFont()->setBold(true);
        $sheet->getStyle('A6:O6')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF2E7D32'); // Green
        $sheet->getStyle('A6:O6')->getFont()->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle('A6:O6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        // Auto-size columns
        foreach (range('A', 'O') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        return [];
    }
    
    public function title(): string
    {
        return 'Summary';
    }
}

// Detailed records sheet
class DetailedRecordsSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    private $data;
    private $dateFrom;
    private $dateTo;
    
    public function __construct($data, $dateFrom, $dateTo)
    {
        $this->data = $data;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }
    
    public function array(): array
    {
        $summary = [
            ['DETAILED ATTENDANCE RECORDS'],
            ['Period: ' . $this->dateFrom . ' to ' . $this->dateTo],
            ['Total Records: ' . count($this->data)],
            ['Generated: ' . now()->format('F j, Y g:i A')],
            [''],
        ];
        
        return array_merge($summary, array_map('array_values', $this->data));
    }
    
    public function headings(): array
    {
        return [
            '',
            '',
            '',
            '',
            '',
            'Employee Name',
            'Employee Code',
            'Department',
            'Job Title',
            'Date',
            'Clock In Time',
            'Clock Out Time',
            'Work Duration',
            'Break Duration',
            'Break Sessions',
            'Status',
            'Location',
            'Notes'
        ];
    }
    
    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        
        // Header row (row 6)
        $sheet->getStyle('A6:R6')->getFont()->setBold(true);
        $sheet->getStyle('A6:R6')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF1565C0'); // Blue
        $sheet->getStyle('A6:R6')->getFont()->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle('A6:R6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        // Auto-size columns
        foreach (range('A', 'R') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        return [];
    }
    
    public function title(): string
    {
        return 'Detailed Records';
    }
}