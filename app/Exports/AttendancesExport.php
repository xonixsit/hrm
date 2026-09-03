<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendancesExport implements FromCollection, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Attendance::with('employee.user');

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('clock_in', '>=', $this->filters['date_from']);
        }
        if (!empty($this->filters['date_to'])) {
            $query->whereDate('clock_in', '<=', $this->filters['date_to']);
        }

        return $query->latest('clock_in')->get();
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
            $attendance->employee?->user?->name ?? 'N/A',
            $attendance->clock_in,
            $attendance->clock_out,
            $attendance->notes,
        ];
    }
}
