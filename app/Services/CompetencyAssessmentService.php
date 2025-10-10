<?php

namespace App\Services;

use App\Models\CompetencyAssessment;
use App\Models\AssessmentCycle;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\CompetencyNotificationService;

class CompetencyAssessmentService
{
    // Notification system is integrated directly into this service
    /**
     * Create a new competency assessment.
     *
     * @param array $data
     * @return CompetencyAssessment
     * @throws ValidationException
     */
    public function createAssessment(array $data): CompetencyAssessment
    {
        // Validate the assessment data
        $this->validateAssessmentData($data);

        // Check for duplicate assessments
        $this->checkDuplicateAssessment($data);

        DB::beginTransaction();
        try {
            // Create the assessment
            $assessment = CompetencyAssessment::create([
                'employee_id' => $data['employee_id'],
                'competency_id' => $data['competency_id'],
                'assessor_id' => $data['assessor_id'],
                'assessment_cycle_id' => $data['assessment_cycle_id'] ?? null,
                'rating' => $data['rating'] ?? null,
                'comments' => $data['comments'] ?? null,
                'assessment_type' => $data['assessment_type'],
                'status' => $data['status'] ?? 'draft',
                'evidence_files' => $data['evidence_files'] ?? [],
                'development_notes' => $data['development_notes'] ?? null,
            ]);

            // If assessment is being submitted immediately
            if (($data['status'] ?? 'draft') === 'submitted') {
                $assessment->submitted_at = now();
                $assessment->save();
                
                // Trigger submission notifications
                $this->triggerAssessmentSubmissionNotifications($assessment);
            }

            DB::commit();
            
            Log::info('Competency assessment created', [
                'assessment_id' => $assessment->id,
                'employee_id' => $assessment->employee_id,
                'competency_id' => $assessment->competency_id,
                'assessor_id' => $assessment->assessor_id
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create competency assessment', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Submit an assessment.
     *
     * @param CompetencyAssessment $assessment
     * @param array $data
     * @return CompetencyAssessment
     * @throws ValidationException
     */
    public function submitAssessment(CompetencyAssessment $assessment, array $data = []): CompetencyAssessment
    {
        if (!$assessment->isDraft()) {
            throw ValidationException::withMessages([
                'status' => ['Assessment can only be submitted from draft status.']
            ]);
        }

        // Update assessment data if provided
        if (!empty($data)) {
            $this->validateAssessmentData(array_merge($assessment->toArray(), $data));
            $assessment->fill($data);
        }

        // Validate that comments are provided for extreme ratings
        if ($assessment->requiresComments() && empty($assessment->comments)) {
            throw ValidationException::withMessages([
                'comments' => ['Comments are required for ratings of 2 or below, and 4 or above.']
            ]);
        }

        DB::beginTransaction();
        try {
            $assessment->status = 'submitted';
            $assessment->submitted_at = now();
            $assessment->save();

            // Trigger submission notifications
            $this->triggerAssessmentSubmissionNotifications($assessment);

            DB::commit();

            Log::info('Competency assessment submitted', [
                'assessment_id' => $assessment->id,
                'employee_id' => $assessment->employee_id,
                'assessor_id' => $assessment->assessor_id
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to submit competency assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Approve an assessment.
     *
     * @param CompetencyAssessment $assessment
     * @param User $approver
     * @param string|null $approvalNotes
     * @return CompetencyAssessment
     * @throws ValidationException
     */
    public function approveAssessment(CompetencyAssessment $assessment, User $approver, ?string $approvalNotes = null): CompetencyAssessment
    {
        if (!$assessment->isSubmitted()) {
            throw ValidationException::withMessages([
                'status' => ['Only submitted assessments can be approved.']
            ]);
        }

        DB::beginTransaction();
        try {
            $assessment->status = 'approved';
            if ($approvalNotes) {
                $assessment->development_notes = $approvalNotes;
            }
            $assessment->save();

            // Trigger approval notifications
            $this->triggerAssessmentApprovalNotifications($assessment, $approver);

            // Update employee's competency rating if this is the latest assessment
            $this->updateEmployeeCompetencyRating($assessment);

            DB::commit();

            Log::info('Competency assessment approved', [
                'assessment_id' => $assessment->id,
                'approver_id' => $approver->id,
                'employee_id' => $assessment->employee_id
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve competency assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Reject an assessment.
     *
     * @param CompetencyAssessment $assessment
     * @param User $rejector
     * @param string $rejectionReason
     * @return CompetencyAssessment
     * @throws ValidationException
     */
    public function rejectAssessment(CompetencyAssessment $assessment, User $rejector, string $rejectionReason): CompetencyAssessment
    {
        if (!$assessment->isSubmitted()) {
            throw ValidationException::withMessages([
                'status' => ['Only submitted assessments can be rejected.']
            ]);
        }

        DB::beginTransaction();
        try {
            $assessment->status = 'rejected';
            $assessment->development_notes = $rejectionReason;
            $assessment->save();

            // Trigger rejection notifications
            $this->triggerAssessmentRejectionNotifications($assessment, $rejector, $rejectionReason);

            DB::commit();

            Log::info('Competency assessment rejected', [
                'assessment_id' => $assessment->id,
                'rejector_id' => $rejector->id,
                'employee_id' => $assessment->employee_id,
                'reason' => $rejectionReason
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject competency assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create a new assessment cycle.
     *
     * @param array $data
     * @return AssessmentCycle
     * @throws ValidationException
     */
    public function createAssessmentCycle(array $data): AssessmentCycle
    {
        $validator = Validator::make($data, AssessmentCycle::validationRules());
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        DB::beginTransaction();
        try {
            $cycle = AssessmentCycle::create($data);

            // Create assessments for target employees if specified
            if (!empty($data['target_employees']) && !empty($data['competencies'])) {
                $this->createCycleAssessments($cycle, $data['target_employees'], $data['competencies']);
            }

            // Schedule cycle start if it's in the future
            if ($cycle->start_date->isFuture()) {
                $this->scheduleCycleStart($cycle);
            } elseif ($cycle->start_date->isToday() || $cycle->start_date->isPast()) {
                // Start immediately if start date is today or past
                $cycle->start();
            }

            DB::commit();

            Log::info('Assessment cycle created', [
                'cycle_id' => $cycle->id,
                'name' => $cycle->name,
                'created_by' => $cycle->created_by
            ]);

            return $cycle;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create assessment cycle', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Start an assessment cycle.
     *
     * @param AssessmentCycle $cycle
     * @return AssessmentCycle
     * @throws ValidationException
     */
    public function startAssessmentCycle(AssessmentCycle $cycle, bool $adminOverride = false): AssessmentCycle
    {
        if (!$cycle->canStart($adminOverride)) {
            $message = $adminOverride 
                ? 'Assessment cycle cannot be started - invalid status.'
                : 'Assessment cycle cannot be started at this time. Start date: ' . $cycle->start_date->format('M j, Y');
                
            throw ValidationException::withMessages([
                'status' => [$message]
            ]);
        }

        DB::beginTransaction();
        try {
            $cycle->start($adminOverride);

            // Trigger cycle start notifications (non-blocking)
            try {
                $this->triggerCycleStartNotifications($cycle);
            } catch (\Exception $e) {
                Log::warning('Cycle start notifications failed but cycle started successfully', [
                    'cycle_id' => $cycle->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            Log::info('Assessment cycle started', [
                'cycle_id' => $cycle->id,
                'name' => $cycle->name
            ]);

            return $cycle;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to start assessment cycle', [
                'cycle_id' => $cycle->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Complete an assessment cycle.
     *
     * @param AssessmentCycle $cycle
     * @param bool $forceComplete
     * @return AssessmentCycle
     * @throws ValidationException
     */
    public function completeAssessmentCycle(AssessmentCycle $cycle, bool $forceComplete = false): AssessmentCycle
    {
        if (!$forceComplete && !$cycle->canComplete()) {
            throw ValidationException::withMessages([
                'status' => ['Assessment cycle cannot be completed. Not all assessments are submitted.']
            ]);
        }

        DB::beginTransaction();
        try {
            $cycle->complete();

            // Trigger cycle completion notifications (non-blocking)
            try {
                $this->triggerCycleCompletionNotifications($cycle);
            } catch (\Exception $e) {
                Log::warning('Cycle completion notifications failed but cycle completed successfully', [
                    'cycle_id' => $cycle->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Generate cycle completion report
            $this->generateCycleCompletionReport($cycle);

            DB::commit();

            Log::info('Assessment cycle completed', [
                'cycle_id' => $cycle->id,
                'name' => $cycle->name,
                'completion_percentage' => $cycle->getCompletionPercentage()
            ]);

            return $cycle;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete assessment cycle', [
                'cycle_id' => $cycle->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get assessments for an employee.
     *
     * @param Employee $employee
     * @param array $filters
     * @return Collection
     */
    public function getEmployeeAssessments(Employee $employee, array $filters = []): Collection
    {
        $query = CompetencyAssessment::where('employee_id', $employee->id)
            ->with(['competency', 'assessor', 'assessmentCycle']);

        // Apply filters
        if (!empty($filters['assessment_type'])) {
            $query->where('assessment_type', $filters['assessment_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['competency_id'])) {
            $query->where('competency_id', $filters['competency_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get assessments by assessor.
     *
     * @param User $assessor
     * @param array $filters
     * @return Collection
     */
    public function getAssessorAssessments(User $assessor, array $filters = []): Collection
    {
        $query = CompetencyAssessment::where('assessor_id', $assessor->id)
            ->with(['employee', 'competency', 'assessmentCycle']);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['assessment_cycle_id'])) {
            $query->where('assessment_cycle_id', $filters['assessment_cycle_id']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get pending assessments for a user.
     *
     * @param User $user
     * @return Collection
     */
    public function getPendingAssessments(User $user): Collection
    {
        return CompetencyAssessment::where('assessor_id', $user->id)
            ->where('status', 'draft')
            ->with(['employee', 'competency', 'assessmentCycle'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get overdue assessments.
     *
     * @param AssessmentCycle|null $cycle
     * @return Collection
     */
    public function getOverdueAssessments(?AssessmentCycle $cycle = null): Collection
    {
        $query = CompetencyAssessment::where('status', 'draft')
            ->with(['employee', 'competency', 'assessor', 'assessmentCycle']);

        if ($cycle) {
            $query->where('assessment_cycle_id', $cycle->id);
        } else {
            // Get assessments from active cycles that are past their end date
            $query->whereHas('assessmentCycle', function ($q) {
                $q->where('status', 'active')
                  ->where('end_date', '<', now());
            });
        }

        return $query->orderBy('created_at', 'asc')->get();
    }

    /**
     * Send reminder notifications for overdue assessments.
     *
     * @param AssessmentCycle|null $cycle
     * @return int Number of reminders sent
     */
    public function sendOverdueReminders(?AssessmentCycle $cycle = null): int
    {
        $overdueAssessments = $this->getOverdueAssessments($cycle);
        $remindersSent = 0;

        foreach ($overdueAssessments as $assessment) {
            try {
                $this->triggerOverdueAssessmentNotification($assessment);
                $remindersSent++;
            } catch (\Exception $e) {
                Log::error('Failed to send overdue assessment reminder', [
                    'assessment_id' => $assessment->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Overdue assessment reminders sent', [
            'count' => $remindersSent,
            'cycle_id' => $cycle?->id
        ]);

        return $remindersSent;
    }

    /**
     * Bulk create assessments for multiple employees and competencies.
     *
     * @param array $employees
     * @param array $competencies
     * @param User $assessor
     * @param AssessmentCycle|null $cycle
     * @param string $assessmentType
     * @return Collection
     */
    public function bulkCreateAssessments(
        array $employees,
        array $competencies,
        User $assessor,
        ?AssessmentCycle $cycle = null,
        string $assessmentType = 'manager'
    ): Collection {
        $assessments = collect();

        DB::beginTransaction();
        try {
            foreach ($employees as $employeeId) {
                foreach ($competencies as $competencyId) {
                    // Check if assessment already exists
                    $existing = CompetencyAssessment::where([
                        'employee_id' => $employeeId,
                        'competency_id' => $competencyId,
                        'assessor_id' => $assessor->id,
                        'assessment_cycle_id' => $cycle?->id,
                    ])->first();

                    if (!$existing) {
                        $assessment = CompetencyAssessment::create([
                            'employee_id' => $employeeId,
                            'competency_id' => $competencyId,
                            'assessor_id' => $assessor->id,
                            'assessment_cycle_id' => $cycle?->id,
                            'assessment_type' => $assessmentType,
                            'status' => 'draft',
                            'rating' => null,
                            'comments' => null,
                        ]);

                        $assessments->push($assessment);
                    }
                }
            }

            DB::commit();

            Log::info('Bulk assessments created', [
                'count' => $assessments->count(),
                'assessor_id' => $assessor->id,
                'cycle_id' => $cycle?->id
            ]);

            return $assessments;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk create assessments', [
                'error' => $e->getMessage(),
                'assessor_id' => $assessor->id
            ]);
            throw $e;
        }
    }

    /**
     * Validate assessment data.
     *
     * @param array $data
     * @throws ValidationException
     */
    private function validateAssessmentData(array $data): void
    {
        $status = $data['status'] ?? 'draft';
        $rating = $data['rating'] ?? null;
        
        // Use different validation rules based on status
        if ($status === 'submitted' && $rating) {
            $rules = CompetencyAssessment::conditionalValidationRules($rating);
        } elseif ($status === 'submitted') {
            $rules = CompetencyAssessment::submissionValidationRules();
        } else {
            $rules = CompetencyAssessment::validationRules();
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Check for duplicate assessments.
     *
     * @param array $data
     * @throws ValidationException
     */
    private function checkDuplicateAssessment(array $data): void
    {
        $existing = CompetencyAssessment::where([
            'employee_id' => $data['employee_id'],
            'competency_id' => $data['competency_id'],
            'assessor_id' => $data['assessor_id'],
            'assessment_cycle_id' => $data['assessment_cycle_id'] ?? null,
        ])->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'duplicate' => ['An assessment for this employee-competency-assessor combination already exists.']
            ]);
        }
    }

    /**
     * Create assessments for a cycle.
     *
     * @param AssessmentCycle $cycle
     * @param array $employeeIds
     * @param array $competencyIds
     */
    private function createCycleAssessments(AssessmentCycle $cycle, array $employeeIds, array $competencyIds): void
    {
        foreach ($employeeIds as $employeeId) {
            foreach ($competencyIds as $competencyId) {
                foreach ($cycle->assessment_types as $assessmentType) {
                    // Determine assessor based on assessment type
                    $assessorId = $this->determineAssessor($employeeId, $assessmentType);
                    
                    if ($assessorId) {
                        CompetencyAssessment::create([
                            'employee_id' => $employeeId,
                            'competency_id' => $competencyId,
                            'assessor_id' => $assessorId,
                            'assessment_cycle_id' => $cycle->id,
                            'assessment_type' => $assessmentType,
                            'status' => 'draft',
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Determine assessor based on assessment type.
     *
     * @param int $employeeId
     * @param string $assessmentType
     * @return int|null
     */
    private function determineAssessor(int $employeeId, string $assessmentType): ?int
    {
        switch ($assessmentType) {
            case 'self':
                $employee = Employee::find($employeeId);
                return $employee?->user_id;
            
            case 'manager':
                $employee = Employee::find($employeeId);
                return $employee?->manager_id;
            
            case 'peer':
            case '360':
                // For peer and 360 assessments, we'll need additional logic
                // to determine appropriate assessors. For now, return null
                // and handle this in the UI
                return null;
            
            default:
                return null;
        }
    }

    /**
     * Update employee's competency rating.
     *
     * @param CompetencyAssessment $assessment
     */
    private function updateEmployeeCompetencyRating(CompetencyAssessment $assessment): void
    {
        // This would update the employee's overall competency rating
        // Implementation depends on how you want to calculate the overall rating
        // (e.g., average of all assessments, latest assessment, weighted average, etc.)
        
        // For now, we'll just log that this should be implemented
        Log::info('Employee competency rating should be updated', [
            'employee_id' => $assessment->employee_id,
            'competency_id' => $assessment->competency_id,
            'new_rating' => $assessment->rating
        ]);
    }

    /**
     * Schedule cycle start.
     *
     * @param AssessmentCycle $cycle
     */
    private function scheduleCycleStart(AssessmentCycle $cycle): void
    {
        // This would schedule a job to start the cycle at the specified date
        // For now, we'll just log that this should be implemented
        Log::info('Assessment cycle start should be scheduled', [
            'cycle_id' => $cycle->id,
            'start_date' => $cycle->start_date
        ]);
    }

    /**
     * Generate cycle completion report.
     *
     * @param AssessmentCycle $cycle
     */
    private function generateCycleCompletionReport(AssessmentCycle $cycle): void
    {
        // This would generate a comprehensive report of the cycle
        // For now, we'll just log that this should be implemented
        Log::info('Cycle completion report should be generated', [
            'cycle_id' => $cycle->id,
            'completion_percentage' => $cycle->getCompletionPercentage()
        ]);
    }

    // Notification methods - these would trigger actual notifications
    // For now, they just log what notifications should be sent

    public function triggerAssessmentSubmissionNotifications(CompetencyAssessment $assessment): void
    {
        try {
            // Notify managers and HR users who can approve assessments
            $managers = $this->getManagersForEmployee($assessment->employee);
            $hrUsers = $this->getHRUsers();
            
            $recipients = $managers->merge($hrUsers)->unique('id');
            
            foreach ($recipients as $recipient) {
                $recipient->notify(new \App\Notifications\AssessmentSubmittedNotification($assessment));
            }

            Log::info('Assessment submitted notification sent', [
                'assessment_id' => $assessment->id,
                'employee_id' => $assessment->employee_id,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment submitted notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function triggerAssessmentApprovalNotifications(CompetencyAssessment $assessment, User $approver): void
    {
        try {
            // Notify the employee and the assessor
            $recipients = collect([$assessment->employee->user, $assessment->assessor])
                ->filter()
                ->unique('id');
            
            foreach ($recipients as $recipient) {
                $recipient->notify(new \App\Notifications\AssessmentApprovedNotification($assessment, $approver));
            }

            Log::info('Assessment approved notification sent', [
                'assessment_id' => $assessment->id,
                'approver_id' => $approver->id,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment approved notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function triggerAssessmentRejectionNotifications(CompetencyAssessment $assessment, User $rejector, string $reason): void
    {
        try {
            // Notify the assessor who needs to revise the assessment
            $assessment->assessor->notify(new \App\Notifications\AssessmentRejectedNotification($assessment, $rejector, $reason));

            Log::info('Assessment rejected notification sent', [
                'assessment_id' => $assessment->id,
                'rejector_id' => $rejector->id,
                'assessor_id' => $assessment->assessor_id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment rejected notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function triggerCycleStartNotifications(AssessmentCycle $cycle): void
    {
        try {
            // Get all assessors involved in this cycle
            $assessors = $this->getAssessorsForCycle($cycle);
            
            // Send notifications to all assessors
            foreach ($assessors as $assessor) {
                $assessor->notify(new \App\Notifications\AssessmentCycleStartedNotification($cycle));
            }

            // Also notify HR administrators
            $hrUsers = $this->getHRUsers();
            foreach ($hrUsers as $hrUser) {
                $hrUser->notify(new \App\Notifications\AssessmentCycleStartedNotification($cycle));
            }

            Log::info('Assessment cycle started notifications sent', [
                'cycle_id' => $cycle->id,
                'cycle_name' => $cycle->name,
                'assessors_count' => $assessors->count(),
                'hr_users_count' => $hrUsers->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment cycle started notifications', [
                'cycle_id' => $cycle->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function triggerCycleCompletionNotifications(AssessmentCycle $cycle): void
    {
        try {
            // Notify HR administrators and managers
            $hrUsers = $this->getHRUsers();
            $managers = $this->getManagersForCycle($cycle);
            
            $recipients = $hrUsers->merge($managers)->unique('id');
            
            foreach ($recipients as $recipient) {
                $recipient->notify(new \App\Notifications\AssessmentCycleCompletedNotification($cycle));
            }

            Log::info('Assessment cycle completed notifications sent', [
                'cycle_id' => $cycle->id,
                'cycle_name' => $cycle->name,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment cycle completed notifications', [
                'cycle_id' => $cycle->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function triggerOverdueAssessmentNotification(CompetencyAssessment $assessment): void
    {
        try {
            // Notify the assessor
            $assessment->assessor->notify(new \App\Notifications\AssessmentOverdueNotification($assessment));
            
            // Also notify their manager if different
            if ($assessment->assessor->employee && $assessment->assessor->employee->manager) {
                $manager = $assessment->assessor->employee->manager;
                if ($manager->user && $manager->user->id !== $assessment->assessor_id) {
                    $manager->user->notify(new \App\Notifications\AssessmentOverdueNotification($assessment));
                }
            }

            Log::info('Overdue assessment notification sent', [
                'assessment_id' => $assessment->id,
                'assessor_id' => $assessment->assessor_id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send overdue assessment notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get users who should review an assessment.
     *
     * @param CompetencyAssessment $assessment
     * @return array
     */
    private function getAssessmentReviewers(CompetencyAssessment $assessment): array
    {
        $reviewers = [];

        // For self-assessments, notify the employee's manager
        if ($assessment->assessment_type === 'self' && $assessment->employee->manager) {
            if ($assessment->employee->manager->user) {
                $reviewers[] = $assessment->employee->manager->user;
            }
        }

        // For manager assessments, notify HR or senior managers
        if ($assessment->assessment_type === 'manager') {
            // Get HR administrators
            $hrAdmins = User::whereHas('roles', function ($query) {
                $query->where('name', 'HR Admin');
            })->get();
            
            $reviewers = array_merge($reviewers, $hrAdmins->toArray());
        }

        return $reviewers;
    }

    /**
     * Get all assessors involved in a cycle.
     *
     * @param AssessmentCycle $cycle
     * @return Collection
     */
    private function getCycleAssessors(AssessmentCycle $cycle): Collection
    {
        // Get unique assessor IDs from assessments in this cycle
        $assessorIds = CompetencyAssessment::where('assessment_cycle_id', $cycle->id)
            ->whereNotNull('assessor_id')
            ->distinct()
            ->pluck('assessor_id');
        
        // Return users who are assessors in this cycle
        return User::whereIn('id', $assessorIds)->get();
    }

    /**
     * Send automated reminder notifications for pending assessments.
     */
    public function sendAssessmentReminders(): void
    {
        try {
            $activeCycles = AssessmentCycle::active()->get();
            $remindersSent = 0;

            foreach ($activeCycles as $cycle) {
                $daysRemaining = $cycle->getDaysRemaining();
                
                // Send reminders at 7, 3, and 1 day(s) before deadline
                if (in_array($daysRemaining, [7, 3, 1])) {
                    $pendingAssessments = $cycle->assessments()
                        ->where('status', 'draft')
                        ->with(['assessor', 'employee', 'competency'])
                        ->get();

                    foreach ($pendingAssessments as $assessment) {
                        $assessment->assessor->notify(
                            new \App\Notifications\AssessmentReminderNotification($assessment, $daysRemaining)
                        );
                        $remindersSent++;
                    }
                }
            }

            Log::info('Assessment reminder notifications sent', [
                'reminders_sent' => $remindersSent,
                'active_cycles' => $activeCycles->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment reminder notifications', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send escalation notifications for severely overdue assessments.
     */
    public function sendEscalationNotifications(): void
    {
        try {
            $overdueCycles = AssessmentCycle::active()
                ->where('end_date', '<', now()->subDays(3))
                ->get();
            
            $escalationsSent = 0;

            foreach ($overdueCycles as $cycle) {
                $overdueAssessments = $cycle->getOverdueAssessments();
                $daysOverdue = now()->diffInDays($cycle->end_date);
                
                foreach ($overdueAssessments as $assessment) {
                    // Escalate to manager after 3 days overdue
                    if ($daysOverdue >= 3 && $daysOverdue < 7) {
                        $managers = $this->getManagersForEmployee($assessment->employee);
                        foreach ($managers as $manager) {
                            $manager->notify(
                                new \App\Notifications\AssessmentEscalationNotification($assessment, $daysOverdue, 'manager')
                            );
                            $escalationsSent++;
                        }
                    }
                    
                    // Escalate to HR after 7 days overdue
                    if ($daysOverdue >= 7) {
                        $hrUsers = $this->getHRUsers();
                        foreach ($hrUsers as $hrUser) {
                            $hrUser->notify(
                                new \App\Notifications\AssessmentEscalationNotification($assessment, $daysOverdue, 'hr')
                            );
                            $escalationsSent++;
                        }
                    }
                }
            }

            Log::info('Assessment escalation notifications sent', [
                'escalations_sent' => $escalationsSent,
                'overdue_cycles' => $overdueCycles->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send escalation notifications', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process all automated notifications (to be called by scheduled job).
     */
    public function processAutomatedNotifications(): void
    {
        Log::info('Starting automated notification processing');
        
        $this->sendAssessmentReminders();
        $this->sendOverdueReminders();
        $this->sendEscalationNotifications();
        
        Log::info('Completed automated notification processing');
    }

    /**
     * Get managers for a specific employee.
     */
    private function getManagersForEmployee(Employee $employee): Collection
    {
        $managers = collect();
        
        // Add direct manager if exists
        if ($employee->manager_id) {
            $manager = User::find($employee->manager_id);
            if ($manager) {
                $managers->push($manager);
            }
        }
        
        // Add department managers if applicable
        if ($employee->department_id) {
            $departmentManagers = User::whereHas('roles', function ($query) {
                $query->where('name', 'manager');
            })->whereHas('employee', function ($query) use ($employee) {
                $query->where('department_id', $employee->department_id);
            })->get();
            
            $managers = $managers->merge($departmentManagers);
        }
        
        return $managers->unique('id');
    }

    /**
     * Get all managers involved in a specific assessment cycle.
     */
    private function getManagersForCycle(AssessmentCycle $cycle): Collection
    {
        // Get managers of employees being assessed in this cycle
        return User::whereIn('id', function ($query) use ($cycle) {
            $query->select('manager_id')
                  ->from('employees')
                  ->whereIn('id', function ($subQuery) use ($cycle) {
                      $subQuery->select('employee_id')
                               ->from('competency_assessments')
                               ->where('assessment_cycle_id', $cycle->id)
                               ->distinct();
                  })
                  ->whereNotNull('manager_id');
        })->get();
    }

    /**
     * Get all HR users who should receive notifications.
     */
    private function getHRUsers(): Collection
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'hr']);
        })->get();
    }

    /**
     * Get all assessors involved in a specific assessment cycle.
     */
    private function getAssessorsForCycle(AssessmentCycle $cycle): Collection
    {
        return User::whereIn('id', function ($query) use ($cycle) {
            $query->select('assessor_id')
                  ->from('competency_assessments')
                  ->where('assessment_cycle_id', $cycle->id)
                  ->distinct();
        })->get();
    }}
