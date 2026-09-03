<?php

namespace App\Exports;

use App\Models\Feedback;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FeedbacksExport implements FromCollection, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Feedback::with(['reviewer', 'reviewee']);

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }
        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            'Reviewer',
            'Reviewee',
            'Period',
            'Rating',
            'Comments',
        ];
    }

    public function map($feedback): array
    {
        return [
            $feedback->reviewer?->name ?? 'N/A',
            $feedback->reviewee?->name ?? 'N/A',
            $feedback->period,
            $feedback->rating,
            $feedback->comments,
        ];
    }
}
