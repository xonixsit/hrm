<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompetencyAssessment;
use App\Services\AssessmentWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AssessmentWorkflowController extends Controller
{
    protected AssessmentWorkflowService $workflowService;

    public function __construct(AssessmentWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * Get workflow dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $statistics = $this->workflowService->getWorkflowStatistics();
            $pendingApprovals = $this->workflowService->getAssessmentsRequiringApproval(Auth::user());

            return response()->json([
                'statistics' => $statistics,
                'pending_approvals' => $pendingApprovals->map(function ($assessment) {
                    return [
                        'id' => $assessment->id,
                        'employee_name' => $assessment->employee->user->name,
                        'competency_name' => $assessment->competency->name,
                        'assessor_name' => $assessment->assessor->name,
                        'submitted_at' => $assessment->submitted_at,
                        'assessment_type' => $assessment->assessment_type,
                        'rating' => $assessment->rating,
                        'workflow_status' => $assessment->getWorkflowStatus()
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load workflow dashboard.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transition assessment status.
     */
    public function transitionStatus(Request $request, CompetencyAssessment $assessment): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:draft,submitted,approved,rejected',
                'reason' => 'nullable|string|max:1000'
            ]);

            $updatedAssessment = $this->workflowService->transitionAssessmentStatus(
                $assessment,
                $validated['status'],
                Auth::user(),
                $validated['reason'] ?? null
            );

            return response()->json([
                'message' => 'Assessment status updated successfully.',
                'assessment' => [
                    'id' => $updatedAssessment->id,
                    'status' => $updatedAssessment->status,
                    'workflow_status' => $updatedAssessment->getWorkflowStatus()
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update assessment status.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk process assessments.
     */
    public function bulkProcess(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'assessment_ids' => 'required|array|min:1',
                'assessment_ids.*' => 'exists:competency_assessments,id',
                'action' => 'required|in:approve,reject,submit,extend_deadline,reassign',
                'reason' => 'nullable|string|max:1000',
                'new_deadline' => 'nullable|date|after:now',
                'new_assessor_id' => 'nullable|exists:users,id'
            ]);

            $assessments = CompetencyAssessment::whereIn('id', $validated['assessment_ids'])->get();
            
            $options = [];
            if (isset($validated['reason'])) {
                $options['reason'] = $validated['reason'];
            }
            if (isset($validated['new_deadline'])) {
                $options['new_deadline'] = Carbon::parse($validated['new_deadline']);
            }
            if (isset($validated['new_assessor_id'])) {
                $options['new_assessor_id'] = $validated['new_assessor_id'];
            }

            $results = $this->workflowService->processBulkAssessments(
                $assessments,
                $validated['action'],
                Auth::user(),
                $options
            );

            return response()->json([
                'message' => 'Bulk operation completed.',
                'results' => $results
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process bulk operation.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extend assessment deadline.
     */
    public function extendDeadline(Request $request, CompetencyAssessment $assessment): JsonResponse
    {
        try {
            $validated = $request->validate([
                'new_deadline' => 'required|date|after:now',
                'reason' => 'nullable|string|max:1000'
            ]);

            $updatedAssessment = $this->workflowService->extendAssessmentDeadline(
                $assessment,
                Carbon::parse($validated['new_deadline']),
                Auth::user(),
                $validated['reason'] ?? null
            );

            return response()->json([
                'message' => 'Assessment deadline extended successfully.',
                'assessment' => [
                    'id' => $updatedAssessment->id,
                    'extended_deadline' => $updatedAssessment->extended_deadline,
                    'workflow_status' => $updatedAssessment->getWorkflowStatus()
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to extend deadline.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reassign assessment.
     */
    public function reassign(Request $request, CompetencyAssessment $assessment): JsonResponse
    {
        try {
            $validated = $request->validate([
                'new_assessor_id' => 'required|exists:users,id',
                'reason' => 'nullable|string|max:1000'
            ]);

            $updatedAssessment = $this->workflowService->reassignAssessment(
                $assessment,
                $validated['new_assessor_id'],
                Auth::user(),
                $validated['reason'] ?? null
            );

            return response()->json([
                'message' => 'Assessment reassigned successfully.',
                'assessment' => [
                    'id' => $updatedAssessment->id,
                    'assessor_id' => $updatedAssessment->assessor_id,
                    'assessor_name' => $updatedAssessment->assessor->name,
                    'workflow_status' => $updatedAssessment->getWorkflowStatus()
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reassign assessment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get assessment workflow history.
     */
    public function getWorkflowHistory(CompetencyAssessment $assessment): JsonResponse
    {
        try {
            $statusLogs = \DB::table('assessment_status_logs')
                ->where('assessment_id', $assessment->id)
                ->join('users', 'assessment_status_logs.changed_by', '=', 'users.id')
                ->select([
                    'assessment_status_logs.*',
                    'users.name as changed_by_name'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            $deadlineExtensions = \DB::table('assessment_deadline_extensions')
                ->where('assessment_id', $assessment->id)
                ->join('users', 'assessment_deadline_extensions.extended_by', '=', 'users.id')
                ->select([
                    'assessment_deadline_extensions.*',
                    'users.name as extended_by_name'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            $reassignments = \DB::table('assessment_reassignments')
                ->where('assessment_id', $assessment->id)
                ->join('users as old_assessor', 'assessment_reassignments.old_assessor_id', '=', 'old_assessor.id')
                ->join('users as new_assessor', 'assessment_reassignments.new_assessor_id', '=', 'new_assessor.id')
                ->join('users as reassigned_by_user', 'assessment_reassignments.reassigned_by', '=', 'reassigned_by_user.id')
                ->select([
                    'assessment_reassignments.*',
                    'old_assessor.name as old_assessor_name',
                    'new_assessor.name as new_assessor_name',
                    'reassigned_by_user.name as reassigned_by_name'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status_logs' => $statusLogs,
                'deadline_extensions' => $deadlineExtensions,
                'reassignments' => $reassignments,
                'current_status' => $assessment->getWorkflowStatus()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load workflow history.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get assessments requiring approval.
     */
    public function getPendingApprovals(): JsonResponse
    {
        try {
            $assessments = $this->workflowService->getAssessmentsRequiringApproval(Auth::user());

            return response()->json([
                'assessments' => $assessments->map(function ($assessment) {
                    return [
                        'id' => $assessment->id,
                        'employee' => [
                            'id' => $assessment->employee->id,
                            'name' => $assessment->employee->user->name,
                            'department' => $assessment->employee->department?->name
                        ],
                        'competency' => [
                            'id' => $assessment->competency->id,
                            'name' => $assessment->competency->name,
                            'category' => $assessment->competency->category
                        ],
                        'assessor' => [
                            'id' => $assessment->assessor->id,
                            'name' => $assessment->assessor->name
                        ],
                        'assessment_type' => $assessment->assessment_type,
                        'rating' => $assessment->rating,
                        'comments' => $assessment->comments,
                        'submitted_at' => $assessment->submitted_at,
                        'workflow_status' => $assessment->getWorkflowStatus()
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load pending approvals.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
