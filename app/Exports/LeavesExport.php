<?php

namespace App\Exports;

use App\Models\Leave;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class LeavesExport implements FromQuery, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Leave::query()
            ->with(['employee.user', 'leaveType', 'approver'])
            ->latest();

        // Apply filters
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('employee.user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['leave_type_id'])) {
            $query->where('leave_type_id', $this->filters['leave_type_id']);
        }

        if (!empty($this->filters['employee_id'])) {
            $query->where('employee_id', $this->filters['employee_id']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('from_date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('to_date', '<=', $this->filters['date_to']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Employee Name',
            'Employee ID',
            'Department',
            'Leave Type',
            'From Date',
            'To Date',
            'Total Days',
            'Status',
            'Reason',
            'Approved/Rejected By',
            'Approval Date',
            'Created At',
        ];
    }

    public function map($leave): array
    {
        return [
            $leave->employee?->user?->name ?? 'N/A',
            $leave->employee?->employee_id ?? 'N/A',
            $leave->employee?->department?->name ?? 'N/A',
            $leave->leaveType?->name ?? 'N/A',
            $leave->from_date->format('Y-m-d'),
            $leave->to_date->format('Y-m-d'),
            $leave->from_date->diffInDays($leave->to_date) + 1, // +1 to include both start and end dates
            ucfirst($leave->status),
            $leave->reason,
            $leave->approver?->name ?? 'N/A',
            $leave->status !== 'pending' ? $leave->updated_at->format('Y-m-d H:i') : 'N/A',
            $leave->created_at->format('Y-m-d H:i'),
        ];
    }

    public function title(): string
    {
        return 'Leaves ' . now()->format('Y-m-d');
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true]],
            // Set header row height
            'A1:L1' => ['font' => ['size' => 12]],
        ];
    }
}
