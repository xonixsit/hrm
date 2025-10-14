<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixSelfAssessmentAssessors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-self-assessment-assessors';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix assessor_id for existing self-assessments to match the employee being assessed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix self-assessment assessors...');
        
        $selfAssessments = \App\Models\CompetencyAssessment::where('assessment_type', 'self')
            ->with(['employee.user', 'assessor'])
            ->get();
            
        $fixed = 0;
        $errors = 0;
        $alreadyCorrect = 0;
        
        foreach ($selfAssessments as $assessment) {
            try {
                $employee = $assessment->employee;
                if ($employee && $employee->user_id) {
                    // Check current state (only show if needs fixing)
                    if ($assessment->assessor_id !== $employee->user_id) {
                        $this->line("Assessment ID {$assessment->id}: Employee {$employee->user->name} (User ID: {$employee->user_id}), Current Assessor: {$assessment->assessor->name} (ID: {$assessment->assessor_id})");
                    }
                    
                    // Only update if the assessor_id is different from employee's user_id
                    if ($assessment->assessor_id !== $employee->user_id) {
                        $assessment->update(['assessor_id' => $employee->user_id]);
                        $fixed++;
                        $this->info("✓ Fixed assessment ID {$assessment->id} - Changed assessor to employee");
                    } else {
                        $alreadyCorrect++;
                    }
                } else {
                    $this->error("Employee not found or no user_id for assessment ID {$assessment->id}");
                    $errors++;
                }
            } catch (\Exception $e) {
                $this->error("Error fixing assessment ID {$assessment->id}: " . $e->getMessage());
                $errors++;
            }
        }
        
        $this->info("Completed! Fixed: {$fixed}, Already Correct: {$alreadyCorrect}, Errors: {$errors}, Total processed: " . $selfAssessments->count());
        
        return 0;
    }
}
