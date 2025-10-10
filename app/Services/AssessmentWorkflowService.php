<?php

namespace App\Services;

use App\Models\CompetencyAssessment;
use App\Models\AssessmentCycle;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AssessmentWorkflowService
{
    protected CompetencyAssessmentService $assessmentService;

    public function __construct(CompetencyAssessmentService $assessmentService)
    {
        $this->assessmentService = $assessmentService;
    }

    /**
     * Transition assessment status with validation.
     */
    public function transitionAssessmentStatus(
        CompetencyAssessment $assessment, 
        string $newStatus, 
        User $user, 
        ?string $reason = null
    ): CompetencyAssessment {
        $this->validateStatusTransition($assessment, $newStatus, $user);

        DB::beginTransaction();
        try {
            $oldStatus = $assessment->status;
            
            // Update assessment status
            $assessment->status = $newStatus;
            
            // Set timestamps based on status
            switch ($newStatus) {
                case 'submitted':
                    $assessment->submitted_at = now();
                    break;
                case 'approved':
                    $assessment->approved_at = now();
                    $assessment->approved_by = $user->id;
                    break;
                case 'rejected':
                    $assessment->rejected_at = now();
                    $assessment->rejected_by = $user->id;
                    if ($reason) {
                        $assessment->rejection_reason = $reason;
                    }
                    break;
                case 'draft':
                    // Reset timestamps when returning to draft
                    $assessment->submitted_at = null;
                    $assessment->approved_at = null;
                    $assessment->rejected_at = null;
                    $assessment->approved_by = null;
                    $assessment->rejected_by = null;
                    $assessment->rejection_reason = null;
                    break;
            }

            $assessment->save();

            // Log the status transition
            $this->logStatusTransition($assessment, $oldStatus, $newStatus, $user, $reason);

            // Trigger appropriate notifications
            $this->triggerStatusNotifications($assessment, $oldStatus, $newStatus, $user, $reason);

            DB::commit();

            Log::info('Assessment status transitioned', [
                'assessment_id' => $assessment->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_id' => $user->id,
                'reason' => $reason
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to transition assessment status', [
                'assessment_id' => $assessment->id,
                'new_status' => $newStatus,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Process bulk assessment operations.
     */
    public function processBulkAssessments(
        Collection $assessments, 
        string $action, 
        User $user, 
        array $options = []
    ): array {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        foreach ($assessments as $assessment) {
            try {
                switch ($action) {
                    case 'approve':
                        $this->transitionAssessmentStatus($assessment, 'approved', $user, $options['reason'] ?? null);
                        break;
                    case 'reject':
                        $this->transitionAssessmentStatus($assessment, 'rejected', $user, $options['reason'] ?? 'Bulk rejection');
                        break;
                    case 'submit':
                        $this->transitionAssessmentStatus($assessment, 'submitted', $user);
                        break;
                    case 'extend_deadline':
                        $this->extendAssessmentDeadline($assessment, $options['new_deadline'], $user);
                        break;
                    case 'reassign':
                        $this->reassignAssessment($assessment, $options['new_assessor_id'], $user);
                        break;
                    default:
                        throw new \InvalidArgumentException("Invalid bulk action: {$action}");
                }
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'assessment_id' => $assessment->id,
                    'error' => $e->getMessage()
                ];
            }
        }

        Log::info('Bulk assessment operation completed', [
            'action' => $action,
            'user_id' => $user->id,
            'total_assessments' => $assessments->count(),
            'success_count' => $results['success'],
            'failed_count' => $results['failed']
        ]);

        return $results;
    }

    /**
     * Extend assessment deadline.
     */
    public function extendAssessmentDeadline(
        CompetencyAssessment $assessment, 
        Carbon $newDeadline, 
        User $user,
        ?string $reason = null
    ): CompetencyAssessment {
        if (!$assessment->assessmentCycle) {
            throw ValidationException::withMessages([
                'deadline' => ['Cannot extend deadline for assessments not part of a cycle.']
            ]);
        }

        if ($newDeadline->isPast()) {
            throw ValidationException::withMessages([
                'deadline' => ['New deadline cannot be in the past.']
            ]);
        }

        DB::beginTransaction();
        try {
            $oldDeadline = $assessment->assessmentCycle->end_date;
            
            // Create individual deadline extension record
            DB::table('assessment_deadline_extensions')->insert([
                'assessment_id' => $assessment->id,
                'original_deadline' => $oldDeadline,
                'new_deadline' => $newDeadline,
                'extended_by' => $user->id,
                'reason' => $reason,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update assessment with extended deadline
            $assessment->extended_deadline = $newDeadline;
            $assessment->save();

            DB::commit();

            Log::info('Assessment deadline extended', [
                'assessment_id' => $assessment->id,
                'old_deadline' => $oldDeadline,
                'new_deadline' => $newDeadline,
                'extended_by' => $user->id,
                'reason' => $reason
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to extend assessment deadline', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Reassign assessment to a different assessor.
     */
    public function reassignAssessment(
        CompetencyAssessment $assessment, 
        int $newAssessorId, 
        User $user,
        ?string $reason = null
    ): CompetencyAssessment {
        if ($assessment->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => ['Can only reassign assessments in draft status.']
            ]);
        }

        $newAssessor = User::findOrFail($newAssessorId);

        DB::beginTransaction();
        try {
            $oldAssessorId = $assessment->assessor_id;
            
            // Log the reassignment
            DB::table('assessment_reassignments')->insert([
                'assessment_id' => $assessment->id,
                'old_assessor_id' => $oldAssessorId,
                'new_assessor_id' => $newAssessorId,
                'reassigned_by' => $user->id,
                'reason' => $reason,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update assessment with new assessor
            $assessment->assessor_id = $newAssessorId;
            $assessment->save();

            DB::commit();

            // Notify both old and new assessors
            $this->notifyAssessmentReassignment($assessment, $oldAssessorId, $newAssessorId, $user, $reason);

            Log::info('Assessment reassigned', [
                'assessment_id' => $assessment->id,
                'old_assessor_id' => $oldAssessorId,
                'new_assessor_id' => $newAssessorId,
                'reassigned_by' => $user->id,
                'reason' => $reason
            ]);

            return $assessment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reassign assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get assessments requiring approval.
     */
    public function getAssessmentsRequiringApproval(User $user): Collection
    {
        // Get assessments that need approval based on user's role and permissions
        $query = CompetencyAssessment::where('status', 'submitted')
            ->with(['employee.user', 'competency', 'assessor', 'assessmentCycle']);

        // Filter based on user's approval authority
        if ($user->hasRole('admin') || $user->hasRole('hr')) {
            // Admins and HR can approve all assessments
        } elseif ($user->hasRole('manager')) {
            // Managers can approve assessments for their direct reports
            $query->whereHas('employee', function ($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        } else {
            // Regular users cannot approve assessments
            return collect();
        }

        return $query->orderBy('submitted_at', 'asc')->get();
    }

    /**
     * Get workflow statistics.
     */
    public function getWorkflowStatistics(): array
    {
        return [
            'pending_approvals' => CompetencyAssessment::where('status', 'submitted')->count(),
            'overdue_assessments' => $this->getOverdueAssessmentsCount(),
            'extended_deadlines' => $this->getExtendedDeadlinesCount(),
            'recent_reassignments' => $this->getRecentReassignmentsCount(),
            'status_distribution' => $this->getStatusDistribution(),
            'approval_turnaround_time' => $this->getAverageApprovalTime()
        ];
    }

    /**
     * Validate status transition is allowed.
     */
    private function validateStatusTransition(CompetencyAssessment $assessment, string $newStatus, User $user): void
    {
        $currentStatus = $assessment->status;
        $allowedTransitions = $this->getAllowedStatusTransitions();

        if (!isset($allowedTransitions[$currentStatus]) || 
            !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            throw ValidationException::withMessages([
                'status' => ["Cannot transition from {$currentStatus} to {$newStatus}"]
            ]);
        }

        // Check user permissions for the transition
        if (!$this->canUserPerformTransition($user, $assessment, $newStatus)) {
            throw ValidationException::withMessages([
                'permission' => ['You do not have permission to perform this status transition.']
            ]);
        }
    }

    /**
     * Get allowed status transitions.
     */
    private function getAllowedStatusTransitions(): array
    {
        return [
            'draft' => ['submitted'],
            'submitted' => ['approved', 'rejected', 'draft'],
            'approved' => ['draft'], // Allow reopening if needed
            'rejected' => ['draft', 'submitted']
        ];
    }

    /**
     * Check if user can perform status transition.
     */
    private function canUserPerformTransition(User $user, CompetencyAssessment $assessment, string $newStatus): bool
    {
        switch ($newStatus) {
            case 'submitted':
                // Only the assessor can submit
                return $user->id === $assessment->assessor_id;
            
            case 'approved':
            case 'rejected':
                // Admins, HR, or managers of the employee can approve/reject
                return $user->hasRole('admin') || 
                       $user->hasRole('hr') || 
                       ($user->hasRole('manager') && $assessment->employee->manager_id === $user->id);
            
            case 'draft':
                // Assessor or approvers can return to draft
                return $user->id === $assessment->assessor_id ||
                       $user->hasRole('admin') || 
                       $user->hasRole('hr') || 
                       ($user->hasRole('manager') && $assessment->employee->manager_id === $user->id);
            
            default:
                return false;
        }
    }

    /**
     * Log status transition for audit trail.
     */
    private function logStatusTransition(
        CompetencyAssessment $assessment, 
        string $oldStatus, 
        string $newStatus, 
        User $user, 
        ?string $reason
    ): void {
        DB::table('assessment_status_logs')->insert([
            'assessment_id' => $assessment->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $user->id,
            'reason' => $reason,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Trigger notifications for status changes.
     */
    private function triggerStatusNotifications(
        CompetencyAssessment $assessment, 
        string $oldStatus, 
        string $newStatus, 
        User $user, 
        ?string $reason
    ): void {
        switch ($newStatus) {
            case 'submitted':
                $this->assessmentService->triggerAssessmentSubmissionNotifications($assessment);
                break;
            case 'approved':
                $this->assessmentService->triggerAssessmentApprovalNotifications($assessment, $user);
                break;
            case 'rejected':
                $this->assessmentService->triggerAssessmentRejectionNotifications($assessment, $user, $reason ?? 'Assessment rejected');
                break;
        }
    }

    /**
     * Notify about assessment reassignment.
     */
    private function notifyAssessmentReassignment(
        CompetencyAssessment $assessment, 
        int $oldAssessorId, 
        int $newAssessorId, 
        User $reassignedBy, 
        ?string $reason
    ): void {
        // This would trigger reassignment notifications
        // Implementation depends on notification system
        Log::info('Assessment reassignment notification should be sent', [
            'assessment_id' => $assessment->id,
            'old_assessor_id' => $oldAssessorId,
            'new_assessor_id' => $newAssessorId,
            'reassigned_by' => $reassignedBy->id
        ]);
    }

    /**
     * Get count of overdue assessments.
     */
    private function getOverdueAssessmentsCount(): int
    {
        return CompetencyAssessment::where('status', 'draft')
            ->whereHas('assessmentCycle', function ($query) {
                $query->where('end_date', '<', now())
                      ->where('status', 'active');
            })
            ->count();
    }

    /**
     * Get count of extended deadlines.
     */
    private function getExtendedDeadlinesCount(): int
    {
        return DB::table('assessment_deadline_extensions')
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->count();
    }

    /**
     * Get count of recent reassignments.
     */
    private function getRecentReassignmentsCount(): int
    {
        return DB::table('assessment_reassignments')
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->count();
    }

    /**
     * Get status distribution.
     */
    private function getStatusDistribution(): array
    {
        return CompetencyAssessment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get average approval time in hours.
     */
    private function getAverageApprovalTime(): float
    {
        $approvedAssessments = CompetencyAssessment::whereNotNull('submitted_at')
            ->whereNotNull('approved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, submitted_at, approved_at)) as avg_hours')
            ->first();

        return $approvedAssessments->avg_hours ?? 0;
    }
}