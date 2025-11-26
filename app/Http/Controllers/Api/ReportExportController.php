<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportExportController extends Controller
{
    public function exportAttendanceReport()
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

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Attendance Report');

            // Set headers
            $headers = [
                'Employee Name', 'Employee Code', 'Department', 'Job Title', 'Status', 
                'Clock In Time', 'Clock Out Time', 'Work Duration', 'Break Duration', 
                'Break Sessions', 'On Break', 'Location', 'Notes'
            ];
            $sheet->fromArray($headers, null, 'A1');

            // Style headers
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0D9488']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ];
            $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

            $row = 2;
            $clockedInCount = 0;

            // Prepare data for export
            foreach ($employeeRoleEmployees as $employee) {
                $attendance = $todaysAttendances->get($employee->id);
                
                if ($attendance) {
                    // Employee has clocked in
                    $clockedInCount++;
                    $data = [
                        $employee->user->name,
                        $employee->employee_code,
                        $employee->department ? $employee->department->name : 'No Department',
                        $employee->job_title,
                        $attendance->clock_out ? 'Clocked Out' : 'Clocked In',
                        $attendance->clock_in ? $attendance->clock_in->format('H:i:s') : 'N/A',
                        $attendance->clock_out ? $attendance->clock_out->format('H:i:s') : 'Still Working',
                        $attendance->work_duration ?? '0h 0m',
                        $attendance->break_duration ?? '0h 0m',
                        count($attendance->break_sessions ?? []),
                        $attendance->on_break ? 'Yes' : 'No',
                        $attendance->location ?? 'N/A',
                        $attendance->notes ?? 'N/A'
                    ];
                    
                    // Green background for clocked in
                    $fillColor = 'F0FDF4';
                } else {
                    // Employee hasn't clocked in
                    $data = [
                        $employee->user->name,
                        $employee->employee_code,
                        $employee->department ? $employee->department->name : 'No Department',
                        $employee->job_title,
                        'Not Clocked In',
                        'N/A',
                        'N/A',
                        '0h 0m',
                        '0h 0m',
                        0,
                        'No',
                        'N/A',
                        'Employee has not clocked in today'
                    ];
                    
                    // Red background for missed
                    $fillColor = 'FEF2F2';
                }

                $sheet->fromArray($data, null, 'A' . $row);
                $sheet->getStyle('A' . $row . ':M' . $row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fillColor]]
                ]);
                $row++;
            }

            // Auto-size columns
            foreach (range('A', 'M') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Add summary
            $sheet->setCellValue('A' . ($row + 2), 'SUMMARY');
            $sheet->setCellValue('A' . ($row + 3), 'Report Date: ' . $today);
            $sheet->setCellValue('A' . ($row + 4), 'Total Employees: ' . $employeeRoleEmployees->count());
            $sheet->setCellValue('A' . ($row + 5), 'Clocked In: ' . $clockedInCount);
            $sheet->setCellValue('A' . ($row + 6), 'Missed Clock-in: ' . ($employeeRoleEmployees->count() - $clockedInCount));
            $sheet->setCellValue('A' . ($row + 7), 'Generated: ' . now()->format('Y-m-d H:i:s'));

            // Style summary
            $sheet->getStyle('A' . ($row + 2))->applyFromArray([
                'font' => ['bold' => true, 'size' => 14]
            ]);

            // Create writer and output
            $writer = new Xlsx($spreadsheet);
            $filename = "attendance_report_{$today}.xlsx";

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');

            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            Log::error('Failed to export attendance report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export attendance report. Please try again.'
            ], 500);
        }
    }

    public function exportBreakReport()
    {
        try {
            // Only Admin/HR can export break reports
            if (!Auth::user()->hasRole(['Admin', 'HR'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to export break reports.'
                ], 403);
            }

            // Get break violations
            $violations = $this->getBreakViolations();

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Break Violations Report');

            // Set headers
            $headers = [
                'Employee Name', 'Employee Code', 'Job Title', 'Department', 
                'Break Number', 'Duration', 'Limit', 'Overtime', 'Break Start'
            ];
            $sheet->fromArray($headers, null, 'A1');

            // Style headers
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F59E0B']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ];
            $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);

            $row = 2;

            // Add violations
            foreach ($violations as $violation) {
                $data = [
                    $violation['employee_name'],
                    $violation['employee_code'] ?? 'N/A',
                    $violation['job_title'],
                    $violation['department'],
                    $violation['break_number'],
                    $violation['duration'],
                    $violation['limit'],
                    $violation['overtime'],
                    $violation['break_start']
                ];

                $sheet->fromArray($data, null, 'A' . $row);
                
                // Color code by break number
                $color = $violation['break_number'] == 1 ? 'FEF3C7' : 
                        ($violation['break_number'] == 2 ? 'FED7AA' : 'FEE2E2');
                        
                $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $color]]
                ]);
                $row++;
            }

            // Auto-size columns
            foreach (range('A', 'I') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Add summary
            $sheet->setCellValue('A' . ($row + 2), 'SUMMARY');
            $sheet->setCellValue('A' . ($row + 3), 'Report Date: ' . now()->format('Y-m-d'));
            $sheet->setCellValue('A' . ($row + 4), 'Total Violations: ' . count($violations));
            $sheet->setCellValue('A' . ($row + 5), '1st Break Violations: ' . collect($violations)->where('break_number', 1)->count());
            $sheet->setCellValue('A' . ($row + 6), '2nd Break Violations: ' . collect($violations)->where('break_number', 2)->count());
            $sheet->setCellValue('A' . ($row + 7), '3rd Break Violations: ' . collect($violations)->where('break_number', 3)->count());
            $sheet->setCellValue('A' . ($row + 8), 'Generated: ' . now()->format('Y-m-d H:i:s'));

            // Style summary
            $sheet->getStyle('A' . ($row + 2))->applyFromArray([
                'font' => ['bold' => true, 'size' => 14]
            ]);

            // Create writer and output
            $writer = new Xlsx($spreadsheet);
            $filename = "break_violations_report_" . now()->format('Y-m-d') . ".xlsx";

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');

            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            Log::error('Failed to export break report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export break report. Please try again.'
            ], 500);
        }
    }

    private function getBreakViolations()
    {
        $violations = [];
        
        $attendances = Attendance::whereDate('date', today())
            ->where('on_break', true)
            ->whereNotNull('current_break_start')
            ->with(['employee.user', 'employee.department'])
            ->get();

        foreach ($attendances as $attendance) {
            if (!$attendance->employee || !$attendance->employee->user) continue;
            
            $breakSessions = $attendance->break_sessions ?? [];
            $currentBreakStart = $attendance->current_break_start;
            
            if ($currentBreakStart) {
                $currentBreakDuration = $currentBreakStart->diffInMinutes(now());
                $breakNumber = count($breakSessions) + 1;
                
                $limits = [1 => 15, 2 => 30, 3 => 15];
                $limit = $limits[$breakNumber] ?? 15;
                
                if ($currentBreakDuration > $limit) {
                    $violations[] = [
                        'employee_name' => $attendance->employee->user->name,
                        'employee_code' => $attendance->employee->employee_code,
                        'job_title' => $attendance->employee->job_title,
                        'department' => $attendance->employee->department->name ?? 'General',
                        'break_number' => $breakNumber,
                        'duration' => $this->formatDuration($currentBreakDuration),
                        'limit' => $this->formatDuration($limit),
                        'overtime' => $this->formatDuration($currentBreakDuration - $limit),
                        'break_start' => $currentBreakStart->format('H:i'),
                    ];
                }
            }
        }
        
        return $violations;
    }

    private function formatDuration($minutes)
    {
        if ($minutes < 60) {
            return $minutes . 'm';
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        return $hours . 'h ' . $remainingMinutes . 'm';
    }
}