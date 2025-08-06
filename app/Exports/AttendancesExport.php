<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendancesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Attendance::with('employee.user')->get();
    }

    public function headings(): array
    {
        return [
            'Employee',
            'Clock In',
            'Clock Out',
            'Notes',
        ];
    }

    public function map($attendance): array
    {
        return [
            $attendance->employee->user->name,
            $attendance->clock_in,
            $attendance->clock_out,
            $attendance->notes,
        ];
    }
}
