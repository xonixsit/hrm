<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AdminReminderConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $sentCount;
    public $adminName;
    public $missedEmployees;

    /**
     * Create a new message instance.
     */
    public function __construct($sentCount, $adminName, $missedEmployees = [])
    {
        $this->sentCount = $sentCount;
        $this->adminName = $adminName;
        $this->missedEmployees = $missedEmployees;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Clock-In Reminders Sent - Admin Confirmation',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-reminder-confirmation',
            with: [
                'sentCount' => $this->sentCount,
                'adminName' => $this->adminName,
                'timestamp' => now()->format('F j, Y - g:i A'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        
        if (!empty($this->missedEmployees)) {
            $attachments[] = Attachment::fromData(
                fn () => $this->generateMissedClockInsReport(),
                'missed-clock-ins-' . now()->format('Y-m-d') . '.xlsx'
            )->withMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        
        return $attachments;
    }

    /**
     * Generate Excel report of missed clock-ins
     */
    private function generateMissedClockInsReport()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Missed Clock-ins Report');

        // Set headers
        $headers = ['Employee Name', 'Employee Code', 'Email', 'Department', 'Job Title', 'Phone', 'Manager'];
        $sheet->fromArray($headers, null, 'A1');

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DC2626']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ];
        $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);

        $row = 2;

        // Add missed employees data
        foreach ($this->missedEmployees as $employee) {
            $data = [
                $employee['name'] ?? 'N/A',
                $employee['employee_code'] ?? 'N/A',
                $employee['email'] ?? 'N/A',
                $employee['department'] ?? 'N/A',
                $employee['job_title'] ?? 'N/A',
                $employee['phone'] ?? 'N/A',
                $employee['manager'] ?? 'N/A'
            ];

            $sheet->fromArray($data, null, 'A' . $row);
            
            // Red background for missed employees
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
        $sheet->setCellValue('A' . ($row + 2), 'SUMMARY');
        $sheet->setCellValue('A' . ($row + 3), 'Report Date: ' . now()->format('Y-m-d'));
        $sheet->setCellValue('A' . ($row + 4), 'Total Missed Clock-ins: ' . count($this->missedEmployees));
        $sheet->setCellValue('A' . ($row + 5), 'Reminders Sent: ' . $this->sentCount);
        $sheet->setCellValue('A' . ($row + 6), 'Generated: ' . now()->format('Y-m-d H:i:s'));

        // Style summary
        $sheet->getStyle('A' . ($row + 2))->applyFromArray([
            'font' => ['bold' => true, 'size' => 14]
        ]);

        // Create writer and return content
        $writer = new Xlsx($spreadsheet);
        
        ob_start();
        $writer->save('php://output');
        return ob_get_clean();
    }
}