<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkReport;
use App\Models\Employee;
use Carbon\Carbon;

class WorkReportSeeder extends Seeder
{
    public function run(): void
    {
        // Get all employees
        $employees = Employee::all();
        
        if ($employees->isEmpty()) {
            $this->command->warn('No employees found. Please run EmployeeSeeder first.');
            return;
        }

        $this->command->info('Creating work reports for ' . $employees->count() . ' employees...');

        // Create work reports for the last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        foreach ($employees as $employee) {
            // Create reports for random days (not every day)
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Skip weekends and create reports for ~70% of weekdays
                if (!$currentDate->isWeekend() && rand(1, 10) <= 7) {
                    $totalCalls = rand(15, 80);
                    $successfulCalls = rand(5, $totalCalls);
                    $notReceived = rand(0, $totalCalls - $successfulCalls);
                    $disconnected = rand(0, $totalCalls - $successfulCalls - $notReceived);
                    $followUp = $totalCalls - $successfulCalls - $notReceived - $disconnected;

                    WorkReport::create([
                        'employee_id' => $employee->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'calls' => $totalCalls,
                        'successful_calls' => $successfulCalls,
                        'calls_not_received' => $notReceived,
                        'disconnected_calls' => $disconnected,
                        'follow_up_calls' => max(0, $followUp),
                        'emails' => rand(5, 25),
                        'whatsapp' => rand(0, 15),
                        'sms' => rand(0, 10),
                        'notes' => $this->getRandomNotes(),
                    ]);
                }
                
                $currentDate->addDay();
            }
        }

        $totalReports = WorkReport::count();
        $this->command->info("✅ Created {$totalReports} work reports successfully!");
    }

    private function getRandomNotes(): ?string
    {
        $notes = [
            'Good day with high conversion rate. Focused on follow-ups.',
            'Challenging day due to network issues in the morning.',
            'Excellent response from prospects. Several meetings scheduled.',
            'Focused on email campaigns today. Good engagement rates.',
            'Mixed results. Some prospects showed strong interest.',
            'Productive day with several successful calls.',
            'Spent time on lead qualification and research.',
            'Good progress on existing leads. Several callbacks scheduled.',
            null, // Some reports might not have notes
            null,
            'Strong performance today. Exceeded call targets.',
            'Focused on WhatsApp outreach with good results.',
        ];

        return $notes[array_rand($notes)];
    }
}