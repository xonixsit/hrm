<?php

namespace App\Exports;

use App\Models\Timesheet;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TimesheetsExport implements FromCollection, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Timesheet::with(['employee.user', 'project', 'task']);

        if (!empty($this->filters['date'])) {
            $query->whereDate('date', $this->filters['date']);
        }

        return $query->latest('date')->get();
    }

    public function headings(): array
    {
        return [
            'Employee',
            'Project',
            'Task',
            'Date',
            'Hours',
            'Description',
            'Status',
        ];
    }

    public function map($timesheet): array
    {
        return [
            $timesheet->employee?->user?->name ?? 'N/A',
            $timesheet->project?->name ?? 'N/A',
            $timesheet->task?->name ?? 'N/A',
            $timesheet->date,
            $timesheet->hours,
            $timesheet->description,
            $timesheet->status,
        ];
    }
}
