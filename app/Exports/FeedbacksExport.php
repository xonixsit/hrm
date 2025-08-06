<?php

namespace App\Exports;

use App\Models\Feedback;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FeedbacksExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Feedback::with(['reviewer', 'reviewee'])->get();
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
            $feedback->reviewer->name,
            $feedback->reviewee->name,
            $feedback->period,
            $feedback->rating,
            $feedback->comments,
        ];
    }
}
