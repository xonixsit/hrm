<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportExportController extends Controller
{
    public function exportAttendanceReport()
    {
        try {
            // Get attendance data
            $employeesWithoutClockIn = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    });
                })
                ->whereDoesntHave('attendances', function($query) {
                    $query->whereDate('date', today());
                })
                ->with(['user', 'department'])
                ->get();

            $clockedInEmployees = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    });
                })
                ->whereHas('attendances', function($query) {
                    $query->whereDate('date', today())
                          ->whereNotNull('clock_in')
                          ->whereNull('clock_out');
                })
                ->with(['user', 'department', 'attendances' => function($query) {
                    $query->whereDate('date', today());
                }])
                ->get();

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Attendance Report');

            // Set headers
            $headers = ['Employee Name', 'Email', 'Job Title', 'Department', 'Status', 'Clock In Time', 'Work Duration'];
            $sheet->fromArray($headers, null, 'A1');

            // Style headers
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0D9488']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ];
            $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);

            $row = 2;

            // Add clocked in employees
            foreach ($clockedInEmployees as $employee) {
                $attendance = $employee->attendances->first();
                $sheet->fromArray([
                    $employee->user->name,
                    $employee->user->email,
                    $employee->job_title,
                    $employee->department->name ?? 'N/A',
                    'Clocked In',
                    $attendance->clock_in->format('H:i'),
                    $attendance->getCurrentSessionDuration()
                ], null, 'A' . $row);
                
                // Green background for clocked in
                $sheet->getStyle('A' . $row . ':G' . $row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']]
                ]);
                $row++;
            }

            // Add missed clock-in employees
            foreach ($employeesWithoutClockIn as $employee) {
                $sheet->fromArray([
                    $employee->user->name,
                    $employee->user->email,
                    $employee->job_title,
                    $employee->department->name ?? 'N/A',
                    'Missed Clock-in',
                    'N/A',
                    'N/A'
                ], null, 'A' . $row);
                
                // Red background for missed
                $sheet->getStyle('A' . $row . ':G' . $row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF2F2']]
                ]);
                $row++;
            }

            // Auto-size columns
            foreach (range('A', 'G') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Add summary
            $sheet->setCellValue('A' . ($row + 2), 'Summary:');
            $sheet->setCellValue('A' . ($row + 3), 'Total Employees: ' . ($clockedInEmployees->count() + $employeesWithoutClockIn->count()));
            $sheet->setCellValue('A' . ($row + 4), 'Clocked In: ' . $clockedInEmployees->count());
            $sheet->setCellValue('A' . ($row + 5), 'Missed Clock-in: ' . $employeesWithoutClockIn->count());
            $sheet->setCellValue('A' . ($row + 6), 'Generated: ' . now()->format('Y-m-d H:i:s'));

            // Create writer and output
            $writer = new Xlsx($spreadsheet);
            $filename = 'attendance-report-' . today()->format('Y-m-d') . '.xlsx';

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');

            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            Log::error('Failed to export attendance report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to export report'], 500);
        }
    }

    public function exportBreakReport()
    {
        try {
            // Get break violations
            $violations = $this->getBreakViolations();

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Break Violations Report');

            // Set headers
            $headers = ['Employee Name', 'Email', 'Job Title', 'Department', 'Break Number', 'Duration', 'Limit', 'Overtime', 'Break Start'];
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
                $sheet->fromArray([
                    $violation['employee_name'],
                    '', // Email will be fetched separately if needed
                    $violation['job_title'],
                    $violation['department'],
                    $violation['break_number'],
                    $violation['duration'],
                    $violation['limit'],
                    $violation['overtime'],
                    $violation['break_start']
                ], null, 'A' . $row);
                
                // Color code by break number
                $color = $violation['break_number'] == 1 ? 'FEF3C7' : ($violation['break_number'] == 2 ? 'FED7AA' : 'FEE2E2');
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
            $sheet->setCellValue('A' . ($row + 2), 'Summary:');
            $sheet->setCellValue('A' . ($row + 3), 'Total Violations: ' . count($violations));
            $sheet->setCellValue('A' . ($row + 4), '1st Break Violations: ' . collect($violations)->where('break_number', 1)->count());
            $sheet->setCellValue('A' . ($row + 5), '2nd Break Violations: ' . collect($violations)->where('break_number', 2)->count());
            $sheet->setCellValue('A' . ($row + 6), '3rd Break Violations: ' . collect($violations)->where('break_number', 3)->count());
            $sheet->setCellValue('A' . ($row + 7), 'Generated: ' . now()->format('Y-m-d H:i:s'));

            // Create writer and output
            $writer = new Xlsx($spreadsheet);
            $filename = 'break-violations-report-' . today()->format('Y-m-d') . '.xlsx';

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');

            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            Log::error('Failed to export break report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to export report'], 500);
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
                $currentBreakDuration = now()->diffInMinutes($currentBreakStart);
                $breakNumber = count($breakSessions) + 1;
                
                $limits = [1 => 15, 2 => 30, 3 => 15];
                $limit = $limits[$breakNumber] ?? 15;
                
                if ($currentBreakDuration > $limit) {
                    $violations[] = [
                        'employee_name' => $attendance->employee->user->name,
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