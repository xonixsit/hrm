<?php

namespace App\Services;

use App\Models\CompetencyDevelopmentPlan;
use App\Models\CompetencyAssessment;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CompetencyDevelopmentService
{
    /**
     * Create a development plan for an employee.
     *
     * @param array $data
     * @return CompetencyDevelopmentPlan
     * @throws ValidationException
     */
    public function createDevelopmentPlan(array $data): CompetencyDevelopmentPlan
    {
        $this->validateDevelopmentPlanData($data);

        // Check for existing active plan
        $existingPlan = CompetencyDevelopmentPlan::where([
            'employee_id' => $data['employee_id'],
            'competency_id' => $data['competency_id'],
            'status' => 'active'
        ])->first();

        if ($existingPlan) {
            throw ValidationException::withMessages([
                'duplicate' => ['An active development plan already exists for this employee-competency combination.']
            ]);
        }

        DB::beginTransaction();
        try {
            // Get current rating from latest assessment
            $currentRating = $this->getCurrentCompetencyRating($data['employee_id'], $data['competency_id']);
            
            // Generate recommended actions if not provided
            $developmentActions = $data['development_actions'] ?? 
                $this->generateRecommendedActions($data['employee_id'], $data['competency_id'], $data['target_rating']);

            $plan = CompetencyDevelopmentPlan::create([
                'employee_id' => $data['employee_id'],
                'competency_id' => $data['competency_id'],
                'current_rating' => $currentRating,
                'target_rating' => $data['target_rating'],
                'target_date' => $data['target_date'] ?? null,
                'development_actions' => $developmentActions,
                'progress_notes' => $data['progress_notes'] ?? null,
                'status' => 'active',
                'created_by' => $data['created_by']
            ]);

            // Log plan creation
            Log::info('Development plan created', [
                'plan_id' => $plan->id,
                'employee_id' => $plan->employee_id,
                'competency_id' => $plan->competency_id,
                'target_rating' => $plan->target_rating
            ]);

            DB::commit();
            return $plan;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create development plan', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update a development plan.
     *
     * @param CompetencyDevelopmentPlan $plan
     * @param array $data
     * @return CompetencyDevelopmentPlan
     * @throws ValidationException
     */
    public function updateDevelopmentPlan(CompetencyDevelopmentPlan $plan, array $data): CompetencyDevelopmentPlan
    {
        $this->validateDevelopmentPlanData($data, $plan->id);

        DB::beginTransaction();
        try {
            // Update current rating if provided
            if (isset($data['current_rating'])) {
                $plan->updateCurrentRating($data['current_rating']);
            }

            // Update other fields
            $plan->fill(array_intersect_key($data, array_flip([
                'target_rating', 'target_date', 'development_actions', 'progress_notes'
            ])));

            $plan->save();

            Log::info('Development plan updated', [
                'plan_id' => $plan->id,
                'employee_id' => $plan->employee_id
            ]);

            DB::commit();
            return $plan;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update development plan', [
                'plan_id' => $plan->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Set SMART goals for a development plan.
     *
     * @param CompetencyDevelopmentPlan $plan
     * @param array $goals
     * @return CompetencyDevelopmentPlan
     */
    public function setSmartGoals(CompetencyDevelopmentPlan $plan, array $goals): CompetencyDevelopmentPlan
    {
        $smartGoals = [];

        foreach ($goals as $goal) {
            $smartGoals[] = [
                'id' => uniqid(),
                'title' => $goal['title'],
                'description' => $goal['description'],
                'specific' => $goal['specific'] ?? '',
                'measurable' => $goal['measurable'] ?? '',
                'achievable' => $goal['achievable'] ?? '',
                'relevant' => $goal['relevant'] ?? '',
                'time_bound' => $goal['time_bound'] ?? '',
                'target_date' => $goal['target_date'] ?? null,
                'status' => 'active',
                'progress_percentage' => 0,
                'created_at' => now()->toISOString()
            ];
        }

        // Add goals to development actions
        $currentActions = $plan->development_actions ?? [];
        $currentActions['smart_goals'] = $smartGoals;
        
        $plan->development_actions = $currentActions;
        $plan->save();

        Log::info('SMART goals set for development plan', [
            'plan_id' => $plan->id,
            'goals_count' => count($smartGoals)
        ]);

        return $plan;
    }

    /**
     * Track progress on a development plan.
     *
     * @param CompetencyDevelopmentPlan $plan
     * @param array $progressData
     * @return CompetencyDevelopmentPlan
     */
    public function trackProgress(CompetencyDevelopmentPlan $plan, array $progressData): CompetencyDevelopmentPlan
    {
        DB::beginTransaction();
        try {
            // Update current rating if provided
            if (isset($progressData['current_rating'])) {
                $plan->updateCurrentRating($progressData['current_rating']);
            }

            // Update action progress
            if (isset($progressData['action_updates'])) {
                foreach ($progressData['action_updates'] as $actionId => $update) {
                    $plan->updateDevelopmentAction($actionId, $update['status']);
                }
            }

            // Update SMART goals progress
            if (isset($progressData['goal_updates'])) {
                $this->updateGoalProgress($plan, $progressData['goal_updates']);
            }

            // Add progress notes
            if (isset($progressData['notes'])) {
                $currentNotes = $plan->progress_notes ?? '';
                $timestamp = now()->format('Y-m-d H:i:s');
                $newNote = "[{$timestamp}] {$progressData['notes']}";
                $plan->progress_notes = $currentNotes ? $currentNotes . "\n\n" . $newNote : $newNote;
            }

            $plan->save();

            Log::info('Development plan progress tracked', [
                'plan_id' => $plan->id,
                'current_rating' => $plan->current_rating
            ]);

            DB::commit();
            return $plan;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to track development plan progress', [
                'plan_id' => $plan->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate development action recommendations.
     *
     * @param int $employeeId
     * @param int $competencyId
     * @param int $targetRating
     * @return array
     */
    public function generateRecommendedActions(int $employeeId, int $competencyId, int $targetRating): array
    {
        $employee = Employee::find($employeeId);
        $competency = Competency::find($competencyId);
        
        if (!$employee || !$competency) {
            return [];
        }

        $currentRating = $this->getCurrentCompetencyRating($employeeId, $competencyId);
        $ratingGap = $targetRating - $currentRating;
        
        $recommendations = [
            'learning_activities' => $this->getLearningActivities($competency, $ratingGap),
            'practice_opportunities' => $this->getPracticeOpportunities($competency, $employee),
            'mentoring_suggestions' => $this->getMentoringSuggestions($competency, $employee),
            'resource_recommendations' => $this->getResourceRecommendations($competency, $ratingGap),
            'milestone_actions' => $this->getMilestoneActions($competency, $currentRating, $targetRating)
        ];

        return $recommendations;
    }

    /**
     * Suggest learning resources for a competency.
     *
     * @param Competency $competency
     * @param int $skillLevel
     * @return array
     */
    public function suggestLearningResources(Competency $competency, int $skillLevel = 1): array
    {
        $resources = [
            'online_courses' => $this->getOnlineCourses($competency, $skillLevel),
            'books_articles' => $this->getBooksAndArticles($competency, $skillLevel),
            'workshops_seminars' => $this->getWorkshopsAndSeminars($competency),
            'internal_training' => $this->getInternalTraining($competency),
            'peer_learning' => $this->getPeerLearningOpportunities($competency),
            'practical_exercises' => $this->getPracticalExercises($competency, $skillLevel)
        ];

        return array_filter($resources, function ($resourceList) {
            return !empty($resourceList);
        });
    }

    /**
     * Get development plans for an employee.
     *
     * @param Employee $employee
     * @param array $filters
     * @return Collection
     */
    public function getEmployeeDevelopmentPlans(Employee $employee, array $filters = []): Collection
    {
        $query = CompetencyDevelopmentPlan::where('employee_id', $employee->id)
            ->with(['competency', 'creator']);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['competency_id'])) {
            $query->where('competency_id', $filters['competency_id']);
        }

        if (!empty($filters['overdue_only']) && $filters['overdue_only']) {
            $query->overdue();
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get development plan analytics for an employee.
     *
     * @param Employee $employee
     * @return array
     */
    public function getEmployeeDevelopmentAnalytics(Employee $employee): array
    {
        $plans = $this->getEmployeeDevelopmentPlans($employee);
        
        $analytics = [
            'total_plans' => $plans->count(),
            'active_plans' => $plans->where('status', 'active')->count(),
            'completed_plans' => $plans->where('status', 'completed')->count(),
            'overdue_plans' => $plans->filter(fn($plan) => $plan->isOverdue())->count(),
            'average_progress' => 0,
            'competency_coverage' => [],
            'goal_completion_rate' => 0,
            'recent_activity' => []
        ];

        if ($plans->isNotEmpty()) {
            // Calculate average progress
            $totalProgress = $plans->sum(fn($plan) => $plan->getProgressPercentage());
            $analytics['average_progress'] = $totalProgress / $plans->count();

            // Competency coverage
            $competencyGroups = $plans->groupBy('competency.category');
            foreach ($competencyGroups as $category => $categoryPlans) {
                $analytics['competency_coverage'][$category] = [
                    'plan_count' => $categoryPlans->count(),
                    'average_progress' => $categoryPlans->avg(fn($plan) => $plan->getProgressPercentage()),
                    'completed_count' => $categoryPlans->where('status', 'completed')->count()
                ];
            }

            // Goal completion rate
            $totalGoals = 0;
            $completedGoals = 0;
            
            foreach ($plans as $plan) {
                $actions = $plan->development_actions ?? [];
                if (isset($actions['smart_goals'])) {
                    $goals = $actions['smart_goals'];
                    $totalGoals += count($goals);
                    $completedGoals += collect($goals)->where('status', 'completed')->count();
                }
            }

            $analytics['goal_completion_rate'] = $totalGoals > 0 ? ($completedGoals / $totalGoals) * 100 : 0;

            // Recent activity (last 30 days)
            $recentPlans = $plans->filter(function ($plan) {
                return $plan->updated_at->gte(Carbon::now()->subDays(30));
            });

            $analytics['recent_activity'] = $recentPlans->map(function ($plan) {
                return [
                    'plan_id' => $plan->id,
                    'competency_name' => $plan->competency->name,
                    'action' => $this->getLastActivity($plan),
                    'date' => $plan->updated_at->toDateString()
                ];
            })->values()->toArray();
        }

        return $analytics;
    }

    /**
     * Generate development recommendations based on assessment results.
     *
     * @param Employee $employee
     * @param Collection $assessments
     * @return array
     */
    public function generateDevelopmentRecommendations(Employee $employee, Collection $assessments): array
    {
        $recommendations = [
            'priority_areas' => [],
            'suggested_plans' => [],
            'quick_wins' => [],
            'long_term_goals' => []
        ];

        foreach ($assessments as $assessment) {
            $competency = $assessment->competency;
            $rating = $assessment->rating;

            // Priority areas (ratings below 3)
            if ($rating < 3) {
                $recommendations['priority_areas'][] = [
                    'competency_id' => $competency->id,
                    'competency_name' => $competency->name,
                    'category' => $competency->category,
                    'current_rating' => $rating,
                    'suggested_target' => min(5, $rating + 2),
                    'urgency' => $rating <= 1 ? 'high' : 'medium',
                    'estimated_timeline' => $this->estimateImprovementTimeline($rating, min(5, $rating + 2))
                ];
            }

            // Quick wins (ratings of 3 that can easily reach 4)
            if ($rating == 3) {
                $recommendations['quick_wins'][] = [
                    'competency_id' => $competency->id,
                    'competency_name' => $competency->name,
                    'category' => $competency->category,
                    'current_rating' => $rating,
                    'target_rating' => 4,
                    'actions' => $this->getQuickWinActions($competency)
                ];
            }

            // Long-term goals (ratings of 4 that can reach 5)
            if ($rating == 4) {
                $recommendations['long_term_goals'][] = [
                    'competency_id' => $competency->id,
                    'competency_name' => $competency->name,
                    'category' => $competency->category,
                    'current_rating' => $rating,
                    'target_rating' => 5,
                    'actions' => $this->getAdvancedDevelopmentActions($competency)
                ];
            }
        }

        // Generate suggested development plans
        foreach ($recommendations['priority_areas'] as $area) {
            $recommendations['suggested_plans'][] = [
                'competency_id' => $area['competency_id'],
                'competency_name' => $area['competency_name'],
                'current_rating' => $area['current_rating'],
                'target_rating' => $area['suggested_target'],
                'target_date' => Carbon::now()->addMonths($area['estimated_timeline'])->toDateString(),
                'development_actions' => $this->generateRecommendedActions(
                    $employee->id,
                    $area['competency_id'],
                    $area['suggested_target']
                )
            ];
        }

        return $recommendations;
    }

    /**
     * Validate development plan data.
     *
     * @param array $data
     * @param int|null $excludeId
     * @throws ValidationException
     */
    private function validateDevelopmentPlanData(array $data, ?int $excludeId = null): void
    {
        $rules = CompetencyDevelopmentPlan::validationRules();
        
        // Add custom validation for target rating vs current rating
        if (isset($data['current_rating']) && isset($data['target_rating'])) {
            if ($data['target_rating'] <= $data['current_rating']) {
                throw ValidationException::withMessages([
                    'target_rating' => ['Target rating must be higher than current rating.']
                ]);
            }
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Get current competency rating for an employee.
     *
     * @param int $employeeId
     * @param int $competencyId
     * @return int
     */
    private function getCurrentCompetencyRating(int $employeeId, int $competencyId): int
    {
        $latestAssessment = CompetencyAssessment::where([
            'employee_id' => $employeeId,
            'competency_id' => $competencyId,
            'status' => 'approved'
        ])->orderBy('created_at', 'desc')->first();

        return $latestAssessment ? $latestAssessment->rating : 1;
    }

    /**
     * Update SMART goals progress.
     *
     * @param CompetencyDevelopmentPlan $plan
     * @param array $goalUpdates
     */
    private function updateGoalProgress(CompetencyDevelopmentPlan $plan, array $goalUpdates): void
    {
        $actions = $plan->development_actions ?? [];
        
        if (isset($actions['smart_goals'])) {
            foreach ($actions['smart_goals'] as &$goal) {
                if (isset($goalUpdates[$goal['id']])) {
                    $update = $goalUpdates[$goal['id']];
                    $goal['progress_percentage'] = $update['progress_percentage'] ?? $goal['progress_percentage'];
                    $goal['status'] = $update['status'] ?? $goal['status'];
                    $goal['updated_at'] = now()->toISOString();
                }
            }
            
            $actions['smart_goals'] = $actions['smart_goals'];
            $plan->development_actions = $actions;
        }
    }

    /**
     * Get learning activities for a competency.
     *
     * @param Competency $competency
     * @param int $ratingGap
     * @return array
     */
    private function getLearningActivities(Competency $competency, int $ratingGap): array
    {
        $activities = [];
        $category = $competency->category;

        $categoryActivities = [
            'Attendance & Punctuality' => [
                'Set up daily arrival reminders and tracking',
                'Practice time management techniques',
                'Create morning routine checklist',
                'Use productivity apps for scheduling'
            ],
            'Performance in Sales/Targets' => [
                'Complete sales methodology training',
                'Practice objection handling scenarios',
                'Study top performer techniques',
                'Attend sales skills workshops'
            ],
            'Communication Skills' => [
                'Join public speaking groups (Toastmasters)',
                'Practice active listening exercises',
                'Take business writing courses',
                'Participate in presentation skills training'
            ],
            'Teamwork & Cooperation' => [
                'Participate in team building activities',
                'Practice conflict resolution techniques',
                'Learn collaborative problem-solving methods',
                'Study emotional intelligence concepts'
            ]
        ];

        $baseActivities = $categoryActivities[$category] ?? [
            'Identify specific skill development areas',
            'Create structured learning plan',
            'Practice regularly with feedback',
            'Seek mentorship and guidance'
        ];

        // Select activities based on rating gap
        $activityCount = min(count($baseActivities), max(2, $ratingGap));
        $activities = array_slice($baseActivities, 0, $activityCount);

        return array_map(function ($activity, $index) {
            return [
                'id' => uniqid(),
                'title' => $activity,
                'type' => 'learning',
                'priority' => $index < 2 ? 'high' : 'medium',
                'estimated_duration' => '2-4 weeks',
                'status' => 'pending'
            ];
        }, $activities, array_keys($activities));
    }

    /**
     * Get practice opportunities for a competency.
     *
     * @param Competency $competency
     * @param Employee $employee
     * @return array
     */
    private function getPracticeOpportunities(Competency $competency, Employee $employee): array
    {
        $opportunities = [];
        $category = $competency->category;

        $categoryOpportunities = [
            'Communication Skills' => [
                'Lead team meetings',
                'Present project updates',
                'Mentor junior colleagues',
                'Participate in cross-department discussions'
            ],
            'Teamwork & Cooperation' => [
                'Join cross-functional project teams',
                'Volunteer for collaborative initiatives',
                'Participate in problem-solving sessions',
                'Support team members with challenges'
            ],
            'Performance in Sales/Targets' => [
                'Shadow experienced sales representatives',
                'Practice sales calls with feedback',
                'Participate in client meetings',
                'Work on challenging sales scenarios'
            ]
        ];

        $baseOpportunities = $categoryOpportunities[$category] ?? [
            'Apply skills in daily work tasks',
            'Seek feedback from supervisors',
            'Practice in low-risk situations',
            'Document learning experiences'
        ];

        return array_map(function ($opportunity, $index) {
            return [
                'id' => uniqid(),
                'title' => $opportunity,
                'type' => 'practice',
                'frequency' => 'weekly',
                'status' => 'available'
            ];
        }, $baseOpportunities, array_keys($baseOpportunities));
    }

    /**
     * Get mentoring suggestions.
     *
     * @param Competency $competency
     * @param Employee $employee
     * @return array
     */
    private function getMentoringSuggestions(Competency $competency, Employee $employee): array
    {
        return [
            [
                'id' => uniqid(),
                'type' => 'internal_mentor',
                'title' => 'Find internal mentor with strong ' . $competency->name,
                'description' => 'Connect with a colleague who excels in this competency',
                'action' => 'Request mentorship through HR or direct approach'
            ],
            [
                'id' => uniqid(),
                'type' => 'peer_learning',
                'title' => 'Form peer learning group',
                'description' => 'Create or join a group focused on developing this competency',
                'action' => 'Organize regular peer learning sessions'
            ]
        ];
    }

    /**
     * Get resource recommendations.
     *
     * @param Competency $competency
     * @param int $ratingGap
     * @return array
     */
    private function getResourceRecommendations(Competency $competency, int $ratingGap): array
    {
        return $this->suggestLearningResources($competency, $ratingGap);
    }

    /**
     * Get milestone actions.
     *
     * @param Competency $competency
     * @param int $currentRating
     * @param int $targetRating
     * @return array
     */
    private function getMilestoneActions(Competency $competency, int $currentRating, int $targetRating): array
    {
        $milestones = [];
        
        for ($rating = $currentRating + 1; $rating <= $targetRating; $rating++) {
            $milestones[] = [
                'id' => uniqid(),
                'target_rating' => $rating,
                'title' => "Achieve rating {$rating} in {$competency->name}",
                'description' => $this->getMilestoneDescription($rating, $competency->name),
                'estimated_timeline' => $this->estimateImprovementTimeline($currentRating, $rating) . ' months',
                'success_criteria' => $this->getSuccessCriteria($rating, $competency)
            ];
        }

        return $milestones;
    }

    // Additional helper methods for resource suggestions...

    private function getOnlineCourses(Competency $competency, int $skillLevel): array
    {
        // Return relevant online courses based on competency and skill level
        return [
            [
                'title' => 'Fundamentals of ' . $competency->name,
                'provider' => 'LinkedIn Learning',
                'duration' => '2-4 hours',
                'level' => $skillLevel <= 2 ? 'beginner' : 'intermediate'
            ]
        ];
    }

    private function getBooksAndArticles(Competency $competency, int $skillLevel): array
    {
        // Return relevant books and articles
        return [
            [
                'title' => 'Essential Guide to ' . $competency->name,
                'type' => 'book',
                'author' => 'Industry Expert',
                'estimated_reading_time' => '2-3 weeks'
            ]
        ];
    }

    private function getWorkshopsAndSeminars(Competency $competency): array
    {
        return [
            [
                'title' => $competency->name . ' Workshop',
                'type' => 'workshop',
                'duration' => '1-2 days',
                'format' => 'in-person or virtual'
            ]
        ];
    }

    private function getInternalTraining(Competency $competency): array
    {
        return [
            [
                'title' => 'Internal ' . $competency->name . ' Training',
                'type' => 'internal',
                'department' => 'HR/Learning & Development',
                'availability' => 'quarterly'
            ]
        ];
    }

    private function getPeerLearningOpportunities(Competency $competency): array
    {
        return [
            [
                'title' => $competency->name . ' Study Group',
                'type' => 'peer_learning',
                'frequency' => 'bi-weekly',
                'format' => 'discussion and practice sessions'
            ]
        ];
    }

    private function getPracticalExercises(Competency $competency, int $skillLevel): array
    {
        return [
            [
                'title' => 'Daily ' . $competency->name . ' Practice',
                'type' => 'exercise',
                'frequency' => 'daily',
                'duration' => '15-30 minutes'
            ]
        ];
    }

    private function getLastActivity(CompetencyDevelopmentPlan $plan): string
    {
        // Determine the last activity based on plan updates
        if ($plan->status === 'completed') {
            return 'Plan completed';
        }
        
        return 'Progress updated';
    }

    private function estimateImprovementTimeline(int $currentRating, int $targetRating): int
    {
        $ratingGap = $targetRating - $currentRating;
        // Estimate 2-3 months per rating point improvement
        return $ratingGap * 2;
    }

    private function getQuickWinActions(Competency $competency): array
    {
        return [
            'Focus on consistent daily practice',
            'Seek immediate feedback on performance',
            'Apply skills in current work tasks'
        ];
    }

    private function getAdvancedDevelopmentActions(Competency $competency): array
    {
        return [
            'Mentor others in this competency',
            'Lead initiatives requiring this skill',
            'Pursue advanced certifications or training'
        ];
    }

    private function getMilestoneDescription(int $rating, string $competencyName): string
    {
        $descriptions = [
            2 => "Show basic understanding and application of {$competencyName}",
            3 => "Consistently meet expectations in {$competencyName}",
            4 => "Exceed expectations and demonstrate advanced skills in {$competencyName}",
            5 => "Achieve mastery and become a role model in {$competencyName}"
        ];

        return $descriptions[$rating] ?? "Improve performance in {$competencyName}";
    }

    private function getSuccessCriteria(int $rating, Competency $competency): array
    {
        // Return success criteria based on rating level and competency
        return [
            'Demonstrate consistent performance at level ' . $rating,
            'Receive positive feedback from supervisor',
            'Complete relevant training or development activities'
        ];
    }
}