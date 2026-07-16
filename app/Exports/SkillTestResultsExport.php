<?php

namespace App\Exports;

use App\Models\TestResponse;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SkillTestResultsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $testId;
    protected $reviewStatus;

    public function __construct($testId = null, $reviewStatus = null)
    {
        $this->testId = $testId;
        $this->reviewStatus = $reviewStatus;
    }

    /**
     * Get the test results collection
     */
    public function collection()
    {
        $query = TestResponse::with([
            'employee.user',
            'skillTest',
            'testSession',
        ])->whereNotNull('submitted_at');

        if ($this->testId) {
            $query->where('skill_test_id', $this->testId);
        }

        if ($this->reviewStatus) {
            $query->where('review_status', $this->reviewStatus);
        }

        return $query->latest('submitted_at')->get();
    }

    /**
     * Map the data for export
     */
    public function map($response): array
    {
        // Handle department - could be string or object
        $department = $response->employee->department;
        if (is_array($department) || is_object($department)) {
            $department = is_array($department) ? ($department['name'] ?? json_encode($department)) : ($department->name ?? json_encode($department));
        }
        
        // Handle position - could be string or object
        $position = $response->employee->position;
        if (is_array($position) || is_object($position)) {
            $position = is_array($position) ? ($position['name'] ?? json_encode($position)) : ($position->name ?? json_encode($position));
        }
        
        return [
            $response->id,
            $response->employee->getFullName(),
            $response->employee->user->email ?? 'N/A',
            $department ?? 'N/A',
            $position ?? 'N/A',
            $response->skillTest->name,
            $response->skillTest->category,
            $response->skillTest->difficulty_level,
            $response->total_score,
            $response->skillTest->getTotalPoints(),
            $response->percentage_score . '%',
            $response->passed ? 'Yes' : 'No',
            $response->skillTest->passing_score . '%',
            $response->review_status,
            $response->testSession?->time_spent ?? 'N/A',
            $response->submitted_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Define the headings for the export
     */
    public function headings(): array
    {
        return [
            'Response ID',
            'Employee Name',
            'Email',
            'Department',
            'Position',
            'Test Name',
            'Category',
            'Difficulty Level',
            'Score',
            'Total Points',
            'Percentage',
            'Passed',
            'Passing Score',
            'Review Status',
            'Time Spent',
            'Submitted At',
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet)
    {
        // Style the header row
        $sheet->getStyle('A1:P1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'rgb' => '4F81BD',
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Style the header text color
        $sheet->getStyle('A1:P1')->applyFromArray([
            'font' => [
                'color' => [
                    'rgb' => 'FFFFFF',
                ],
            ],
        ]);

        // Apply borders to all cells
        $sheet->getStyle('A1:P' . ($sheet->getHighestRow()))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => [
                        'rgb' => '000000',
                    ],
                ],
            ],
        ]);

        // Auto-size columns
        foreach (range('A', 'P') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return [
            // Center align all cells
            1 => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }
}
