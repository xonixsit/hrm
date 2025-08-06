<?php

namespace App\Exports;

use App\Models\Leave;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class LeavesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Leave::with(['employee.user', 'leaveType'])->get();
    }

    public function headings(): array
    {
        return [
            'Employee',
            'Leave Type',
            'From Date',
            'To Date',
            'Status',
            'Reason',
        ];
    }

    public function map($leave): array
    {
        return [
            $leave->employee->user->name,
            $leave->leaveType->name,
            $leave->from_date,
            $leave->to_date,
            $leave->status,
            $leave->reason,
        ];
    }
}
