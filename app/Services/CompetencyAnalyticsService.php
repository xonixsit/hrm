<?php

namespace App\Services;

use App\Models\CompetencyAssessment;
use App\Models\Competency;
use App\Models\Employee;
use App\Models\Department;
use App\Models\AssessmentCycle;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CompetencyAnalyticsService
{
    /**
     * Calculate overall competency score for an employee.
     *
     * @param Employee $employee
     * @param AssessmentCycle|null $cycle
     * @return array
     */
    public function calculateEmployeeCompetencyScore(Employee $employee, ?AssessmentCycle $cycle = null): array
    {
        $cacheKey = "employee_competency_score_{$employee->id}" . ($cycle ? "_{$cycle->id}" : '');
        
        return Cache::remember($cacheKey, 300, function () use ($employee, $cycle) {
            $query = CompetencyAssessment::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->with(['competency']);

            if ($cycle) {
                $query->where('assessment_cycle_id', $cycle->id);
            } else {
                // Get latest assessments for each competency
                $query->whereIn('id', function ($subQuery) use ($employee) {
                    $subQuery->select(DB::raw('MAX(id)'))
                        ->from('competency_assessments')
                        ->where('employee_id', $employee->id)
                        ->where('status', 'approved')
                        ->groupBy('competency_id');
                });
            }

            $assessments = $query->get();

            if ($assessments->isEmpty()) {
                return [
                    'overall_score' => 0,
                    'weighted_score' => 0,
                    'category_scores' => [],
                    'competency_scores' => [],
                    'assessment_count' => 0
                ];
            }

            $totalScore = 0;
            $totalWeight = 0;
            $categoryScores = [];
            $competencyScores = [];

            foreach ($assessments as $assessment) {
                $competency = $assessment->competency;
                $weight = $competency->weight ?? 1.0;
                $score = $assessment->rating;

                $totalScore += $score * $weight;
                $totalWeight += $weight;

                // Category aggregation
                $category = $competency->category;
                if (!isset($categoryScores[$category])) {
                    $categoryScores[$category] = [
                        'total_score' => 0,
                        'total_weight' => 0,
                        'count' => 0
                    ];
                }

                $categoryScores[$category]['total_score'] += $score * $weight;
                $categoryScores[$category]['total_weight'] += $weight;
                $categoryScores[$category]['count']++;

                $competencyScores[] = [
                    'competency_id' => $competency->id,
                    'competency_name' => $competency->name,
                    'category' => $category,
                    'rating' => $score,
                    'weight' => $weight,
                    'weighted_score' => $score * $weight
                ];
            }

            // Calculate category averages
            $processedCategoryScores = [];
            foreach ($categoryScores as $category => $data) {
                $processedCategoryScores[$category] = [
                    'average_score' => $data['total_weight'] > 0 ? $data['total_score'] / $data['total_weight'] : 0,
                    'competency_count' => $data['count'],
                    'total_weight' => $data['total_weight']
                ];
            }

            return [
                'overall_score' => $totalWeight > 0 ? $totalScore / $totalWeight : 0,
                'weighted_score' => $totalScore,
                'category_scores' => $processedCategoryScores,
                'competency_scores' => $competencyScores,
                'assessment_count' => $assessments->count()
            ];
        });
    }

    /**
     * Get competency trend analysis for an employee.
     *
     * @param Employee $employee
     * @param int $months
     * @return array
     */
    public function getEmployeeCompetencyTrends(Employee $employee, int $months = 12): array
    {
        $startDate = Carbon::now()->subMonths($months);
        
        $assessments = CompetencyAssessment::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('created_at', '>=', $startDate)
            ->with(['competency'])
            ->orderBy('created_at')
            ->get();

        $trends = [];
        $monthlyScores = [];

        foreach ($assessments as $assessment) {
            $month = $assessment->created_at->format('Y-m');
            $competencyId = $assessment->competency_id;
            $competencyName = $assessment->competency->name;

            if (!isset($trends[$competencyId])) {
                $trends[$competencyId] = [
                    'competency_name' => $competencyName,
                    'category' => $assessment->competency->category,
                    'data_points' => [],
                    'trend_direction' => 'stable',
                    'improvement_rate' => 0
                ];
            }

            $trends[$competencyId]['data_points'][] = [
                'date' => $assessment->created_at->toDateString(),
                'rating' => $assessment->rating,
                'assessment_type' => $assessment->assessment_type
            ];

            // Monthly aggregation
            if (!isset($monthlyScores[$month])) {
                $monthlyScores[$month] = [
                    'total_score' => 0,
                    'count' => 0,
                    'date' => $assessment->created_at->startOfMonth()->toDateString()
                ];
            }

            $monthlyScores[$month]['total_score'] += $assessment->rating;
            $monthlyScores[$month]['count']++;
        }

        // Calculate trend directions and improvement rates
        foreach ($trends as $competencyId => &$trend) {
            if (count($trend['data_points']) >= 2) {
                $firstRating = $trend['data_points'][0]['rating'];
                $lastRating = end($trend['data_points'])['rating'];
                $improvement = $lastRating - $firstRating;
                
                $trend['improvement_rate'] = $improvement;
                
                if ($improvement > 0.5) {
                    $trend['trend_direction'] = 'improving';
                } elseif ($improvement < -0.5) {
                    $trend['trend_direction'] = 'declining';
                } else {
                    $trend['trend_direction'] = 'stable';
                }
            }
        }

        // Process monthly scores
        $processedMonthlyScores = [];
        foreach ($monthlyScores as $month => $data) {
            $processedMonthlyScores[] = [
                'month' => $month,
                'date' => $data['date'],
                'average_score' => $data['count'] > 0 ? $data['total_score'] / $data['count'] : 0,
                'assessment_count' => $data['count']
            ];
        }

        return [
            'competency_trends' => array_values($trends),
            'monthly_scores' => $processedMonthlyScores,
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => Carbon::now()->toDateString(),
                'months' => $months
            ]
        ];
    }

    /**
     * Generate skill gap analysis for a department or team.
     *
     * @param Department|null $department
     * @param array $employeeIds
     * @param array $competencyIds
     * @return array
     */
    public function generateSkillGapAnalysis(?Department $department = null, array $employeeIds = [], array $competencyIds = []): array
    {
        try {
            $query = CompetencyAssessment::query()
                ->where('status', 'approved')
                ->with(['employee.user', 'competency']);

            // Filter by department
            if ($department) {
                $query->whereHas('employee', function ($q) use ($department) {
                    $q->where('department_id', $department->id);
                });
            }

            // Filter by specific employees
            if (!empty($employeeIds)) {
                $query->whereIn('employee_id', $employeeIds);
            }

            // Filter by specific competencies
            if (!empty($competencyIds)) {
                $query->whereIn('competency_id', $competencyIds);
            }

            $assessments = $query->get();

            if ($assessments->isEmpty()) {
                return [
                    'employee_profiles' => [],
                    'competency_gaps' => [],
                    'critical_gaps' => [],
                    'summary' => [
                        'total_employees' => 0,
                        'total_competencies' => 0,
                        'average_rating' => 0,
                        'gap_count' => 0
                    ]
                ];
            }

        $skillGaps = [];
        $competencyStats = [];
        $employeeStats = [];

        foreach ($assessments as $assessment) {
            $competencyId = $assessment->competency_id;
            $competencyName = $assessment->competency->name;
            $category = $assessment->competency->category;
            $employeeId = $assessment->employee_id;
            $employeeName = $assessment->employee->user->name ?? 'Unknown Employee';
            $rating = $assessment->rating;

            // Competency statistics
            if (!isset($competencyStats[$competencyId])) {
                $competencyStats[$competencyId] = [
                    'competency_name' => $competencyName,
                    'category' => $category,
                    'ratings' => [],
                    'average_rating' => 0,
                    'gap_severity' => 'low',
                    'employees_below_target' => 0,
                    'total_employees' => 0
                ];
            }

            $competencyStats[$competencyId]['ratings'][] = $rating;
            $competencyStats[$competencyId]['total_employees']++;

            if ($rating < 3) { // Below "Meets Expectations"
                $competencyStats[$competencyId]['employees_below_target']++;
            }

            // Employee statistics
            if (!isset($employeeStats[$employeeId])) {
                $employeeStats[$employeeId] = [
                    'employee_name' => $employeeName,
                    'competencies' => [],
                    'average_rating' => 0,
                    'gap_areas' => [],
                    'strength_areas' => []
                ];
            }

            $employeeStats[$employeeId]['competencies'][] = [
                'competency_id' => $competencyId,
                'competency_name' => $competencyName,
                'category' => $category,
                'rating' => $rating
            ];
        }

        // Process competency statistics
        foreach ($competencyStats as $competencyId => &$stats) {
            $ratings = $stats['ratings'];
            $stats['average_rating'] = count($ratings) > 0 ? array_sum($ratings) / count($ratings) : 0;
            
            $belowTargetPercentage = $stats['total_employees'] > 0 
                ? ($stats['employees_below_target'] / $stats['total_employees']) * 100 
                : 0;

            if ($belowTargetPercentage >= 50) {
                $stats['gap_severity'] = 'high';
            } elseif ($belowTargetPercentage >= 25) {
                $stats['gap_severity'] = 'medium';
            } else {
                $stats['gap_severity'] = 'low';
            }

            $stats['below_target_percentage'] = $belowTargetPercentage;
        }

        // Process employee statistics
        foreach ($employeeStats as $employeeId => &$stats) {
            $competencies = $stats['competencies'];
            $totalRating = array_sum(array_column($competencies, 'rating'));
            $stats['average_rating'] = count($competencies) > 0 ? $totalRating / count($competencies) : 0;

            foreach ($competencies as $competency) {
                if ($competency['rating'] < 3) {
                    $stats['gap_areas'][] = $competency;
                } elseif ($competency['rating'] >= 4) {
                    $stats['strength_areas'][] = $competency;
                }
            }
        }

        // Identify critical skill gaps
        $criticalGaps = array_filter($competencyStats, function ($stats) {
            return $stats['gap_severity'] === 'high' && $stats['average_rating'] < 2.5;
        });

            return [
                'competency_gaps' => array_values($competencyStats),
                'employee_profiles' => array_values($employeeStats),
                'critical_gaps' => array_values($criticalGaps),
                'summary' => [
                    'total_competencies_analyzed' => count($competencyStats),
                    'total_employees_analyzed' => count($employeeStats),
                    'high_priority_gaps' => count($criticalGaps),
                    'average_organizational_rating' => $this->calculateOverallAverageRating($assessments)
                ]
            ];

        } catch (\Exception $e) {
            \Log::error('Skill gap analysis failed: ' . $e->getMessage());
            
            return [
                'employee_profiles' => [],
                'competency_gaps' => [],
                'critical_gaps' => [],
                'summary' => [
                    'total_employees' => 0,
                    'total_competencies' => 0,
                    'average_rating' => 0,
                    'gap_count' => 0,
                    'error' => 'Analysis failed: ' . $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Generate performance insights and recommendations.
     *
     * @param Employee|null $employee
     * @param Department|null $department
     * @return array
     */
    public function generatePerformanceInsights(?Employee $employee = null, ?Department $department = null): array
    {
        $insights = [];

        if ($employee) {
            $insights = $this->generateEmployeeInsights($employee);
        } elseif ($department) {
            $insights = $this->generateDepartmentInsights($department);
        } else {
            $insights = $this->generateOrganizationalInsights();
        }

        return $insights;
    }

    /**
     * Compare competency scores across different dimensions.
     *
     * @param array $filters
     * @return array
     */
    public function compareCompetencyScores(array $filters = []): array
    {
        $comparisons = [];

        // Department comparison
        if (isset($filters['compare_departments']) && $filters['compare_departments']) {
            $comparisons['departments'] = $this->compareDepartments($filters);
        }

        // Role comparison
        if (isset($filters['compare_roles']) && $filters['compare_roles']) {
            $comparisons['roles'] = $this->compareRoles($filters);
        }

        // Time period comparison
        if (isset($filters['compare_periods']) && $filters['compare_periods']) {
            $comparisons['time_periods'] = $this->compareTimePeriods($filters);
        }

        // Assessment type comparison
        if (isset($filters['compare_assessment_types']) && $filters['compare_assessment_types']) {
            $comparisons['assessment_types'] = $this->compareAssessmentTypes($filters);
        }

        return $comparisons;
    }

    /**
     * Get competency distribution statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getCompetencyDistribution(array $filters = []): array
    {
        try {
            $query = CompetencyAssessment::query()
                ->where('status', 'approved')
                ->with(['competency', 'employee']);

            // Apply filters
            $this->applyFilters($query, $filters);

            $assessments = $query->get();

        $distribution = [
            'rating_distribution' => [
                1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0
            ],
            'category_distribution' => [],
            'assessment_type_distribution' => [],
            'total_assessments' => $assessments->count()
        ];

        foreach ($assessments as $assessment) {
            // Rating distribution
            $distribution['rating_distribution'][$assessment->rating]++;

            // Category distribution
            $category = $assessment->competency->category;
            if (!isset($distribution['category_distribution'][$category])) {
                $distribution['category_distribution'][$category] = [
                    'count' => 0,
                    'average_rating' => 0,
                    'total_rating' => 0
                ];
            }
            $distribution['category_distribution'][$category]['count']++;
            $distribution['category_distribution'][$category]['total_rating'] += $assessment->rating;

            // Assessment type distribution
            $type = $assessment->assessment_type;
            if (!isset($distribution['assessment_type_distribution'][$type])) {
                $distribution['assessment_type_distribution'][$type] = [
                    'count' => 0,
                    'average_rating' => 0,
                    'total_rating' => 0
                ];
            }
            $distribution['assessment_type_distribution'][$type]['count']++;
            $distribution['assessment_type_distribution'][$type]['total_rating'] += $assessment->rating;
        }

        // Calculate averages
        foreach ($distribution['category_distribution'] as &$categoryData) {
            $categoryData['average_rating'] = $categoryData['count'] > 0 
                ? $categoryData['total_rating'] / $categoryData['count'] 
                : 0;
        }

        foreach ($distribution['assessment_type_distribution'] as &$typeData) {
            $typeData['average_rating'] = $typeData['count'] > 0 
                ? $typeData['total_rating'] / $typeData['count'] 
                : 0;
        }

            return $distribution;

        } catch (\Exception $e) {
            \Log::error('Competency distribution analysis failed: ' . $e->getMessage());
            
            return [
                'rating_distribution' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
                'category_distribution' => [],
                'assessment_type_distribution' => [],
                'total_assessments' => 0,
                'error' => 'Distribution analysis failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate employee-specific insights.
     *
     * @param Employee $employee
     * @return array
     */
    private function generateEmployeeInsights(Employee $employee): array
    {
        $competencyScore = $this->calculateEmployeeCompetencyScore($employee);
        $trends = $this->getEmployeeCompetencyTrends($employee, 6);

        $insights = [
            'type' => 'employee',
            'employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'overall_performance' => $this->categorizePerformance($competencyScore['overall_score']),
            'strengths' => [],
            'improvement_areas' => [],
            'recommendations' => [],
            'trends' => $trends
        ];

        // Identify strengths and improvement areas
        foreach ($competencyScore['competency_scores'] as $competency) {
            if ($competency['rating'] >= 4) {
                $insights['strengths'][] = $competency;
            } elseif ($competency['rating'] <= 2) {
                $insights['improvement_areas'][] = $competency;
            }
        }

        // Generate recommendations
        $insights['recommendations'] = $this->generateEmployeeRecommendations($employee, $competencyScore, $trends);

        return $insights;
    }

    /**
     * Generate department-specific insights.
     *
     * @param Department $department
     * @return array
     */
    private function generateDepartmentInsights(Department $department): array
    {
        $skillGaps = $this->generateSkillGapAnalysis($department);
        
        return [
            'type' => 'department',
            'department_id' => $department->id,
            'department_name' => $department->name,
            'skill_gaps' => $skillGaps,
            'top_performers' => $this->getTopPerformers($department),
            'improvement_priorities' => $this->getImprovementPriorities($skillGaps),
            'recommendations' => $this->generateDepartmentRecommendations($department, $skillGaps)
        ];
    }

    /**
     * Generate organizational insights.
     *
     * @return array
     */
    private function generateOrganizationalInsights(): array
    {
        $distribution = $this->getCompetencyDistribution();
        $skillGaps = $this->generateSkillGapAnalysis();

        return [
            'type' => 'organizational',
            'distribution' => $distribution,
            'skill_gaps' => $skillGaps,
            'key_metrics' => $this->calculateKeyMetrics(),
            'recommendations' => $this->generateOrganizationalRecommendations($distribution, $skillGaps)
        ];
    }

    // Helper methods for comparisons and calculations...

    private function compareDepartments(array $filters): array
    {
        $departments = Department::all();
        $comparison = [];

        foreach ($departments as $department) {
            $skillGaps = $this->generateSkillGapAnalysis($department);
            $avgRating = 0;
            $totalEmployees = 0;

            if (!empty($skillGaps['employee_profiles'])) {
                $totalEmployees = count($skillGaps['employee_profiles']);
                $avgRating = collect($skillGaps['employee_profiles'])->avg('average_rating');
            }

            $comparison[] = [
                'department_id' => $department->id,
                'department_name' => $department->name,
                'average_rating' => round($avgRating, 2),
                'employee_count' => $totalEmployees,
                'critical_gaps' => count($skillGaps['critical_gaps'] ?? []),
                'performance_category' => $this->categorizePerformance($avgRating)
            ];
        }

        // Sort by average rating descending
        usort($comparison, function ($a, $b) {
            return $b['average_rating'] <=> $a['average_rating'];
        });

        return $comparison;
    }

    private function compareRoles(array $filters): array
    {
        $roleComparison = [];
        
        // Get distinct roles from employees
        $roles = Employee::select('position')->distinct()->whereNotNull('position')->pluck('position');

        foreach ($roles as $role) {
            $employeeIds = Employee::where('position', $role)->pluck('id')->toArray();
            
            if (!empty($employeeIds)) {
                $skillGaps = $this->generateSkillGapAnalysis(null, $employeeIds);
                $avgRating = 0;
                $employeeCount = count($employeeIds);

                if (!empty($skillGaps['employee_profiles'])) {
                    $avgRating = collect($skillGaps['employee_profiles'])->avg('average_rating');
                }

                $roleComparison[] = [
                    'role' => $role,
                    'average_rating' => round($avgRating, 2),
                    'employee_count' => $employeeCount,
                    'critical_gaps' => count($skillGaps['critical_gaps'] ?? []),
                    'performance_category' => $this->categorizePerformance($avgRating)
                ];
            }
        }

        // Sort by average rating descending
        usort($roleComparison, function ($a, $b) {
            return $b['average_rating'] <=> $a['average_rating'];
        });

        return $roleComparison;
    }

    private function compareTimePeriods(array $filters): array
    {
        $periods = [
            'current_quarter' => [
                'start' => Carbon::now()->startOfQuarter(),
                'end' => Carbon::now()->endOfQuarter(),
                'label' => 'Current Quarter'
            ],
            'previous_quarter' => [
                'start' => Carbon::now()->subQuarter()->startOfQuarter(),
                'end' => Carbon::now()->subQuarter()->endOfQuarter(),
                'label' => 'Previous Quarter'
            ],
            'current_year' => [
                'start' => Carbon::now()->startOfYear(),
                'end' => Carbon::now()->endOfYear(),
                'label' => 'Current Year'
            ],
            'previous_year' => [
                'start' => Carbon::now()->subYear()->startOfYear(),
                'end' => Carbon::now()->subYear()->endOfYear(),
                'label' => 'Previous Year'
            ]
        ];

        $comparison = [];

        foreach ($periods as $key => $period) {
            $assessments = CompetencyAssessment::where('status', 'approved')
                ->whereBetween('created_at', [$period['start'], $period['end']])
                ->with(['competency'])
                ->get();

            $avgRating = $assessments->avg('rating') ?? 0;
            $totalAssessments = $assessments->count();
            
            // Category breakdown
            $categoryBreakdown = [];
            foreach ($assessments as $assessment) {
                $category = $assessment->competency->category;
                if (!isset($categoryBreakdown[$category])) {
                    $categoryBreakdown[$category] = [
                        'total_rating' => 0,
                        'count' => 0
                    ];
                }
                $categoryBreakdown[$category]['total_rating'] += $assessment->rating;
                $categoryBreakdown[$category]['count']++;
            }

            foreach ($categoryBreakdown as $category => &$data) {
                $data['average_rating'] = $data['count'] > 0 ? $data['total_rating'] / $data['count'] : 0;
            }

            $comparison[] = [
                'period' => $key,
                'label' => $period['label'],
                'start_date' => $period['start']->toDateString(),
                'end_date' => $period['end']->toDateString(),
                'average_rating' => round($avgRating, 2),
                'total_assessments' => $totalAssessments,
                'category_breakdown' => $categoryBreakdown,
                'performance_category' => $this->categorizePerformance($avgRating)
            ];
        }

        return $comparison;
    }

    private function compareAssessmentTypes(array $filters): array
    {
        $assessmentTypes = ['self', 'manager', 'peer', '360'];
        $comparison = [];

        foreach ($assessmentTypes as $type) {
            $assessments = CompetencyAssessment::where('status', 'approved')
                ->where('assessment_type', $type)
                ->with(['competency'])
                ->get();

            $avgRating = $assessments->avg('rating') ?? 0;
            $totalAssessments = $assessments->count();

            // Rating distribution
            $ratingDistribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
            foreach ($assessments as $assessment) {
                $ratingDistribution[$assessment->rating]++;
            }

            $comparison[] = [
                'assessment_type' => $type,
                'average_rating' => round($avgRating, 2),
                'total_assessments' => $totalAssessments,
                'rating_distribution' => $ratingDistribution,
                'performance_category' => $this->categorizePerformance($avgRating)
            ];
        }

        // Sort by average rating descending
        usort($comparison, function ($a, $b) {
            return $b['average_rating'] <=> $a['average_rating'];
        });

        return $comparison;
    }

    private function applyFilters($query, array $filters): void
    {
        if (isset($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['competency_ids'])) {
            $query->whereIn('competency_id', $filters['competency_ids']);
        }

        if (isset($filters['assessment_type'])) {
            $query->where('assessment_type', $filters['assessment_type']);
        }
    }

    private function calculateOverallAverageRating(Collection $assessments): float
    {
        if ($assessments->isEmpty()) {
            return 0;
        }

        return $assessments->avg('rating');
    }

    private function categorizePerformance(float $score): string
    {
        if ($score >= 4.5) return 'exceptional';
        if ($score >= 4.0) return 'exceeds_expectations';
        if ($score >= 3.0) return 'meets_expectations';
        if ($score >= 2.0) return 'needs_improvement';
        return 'poor';
    }

    private function generateEmployeeRecommendations(Employee $employee, array $competencyScore, array $trends): array
    {
        $recommendations = [];

        // Based on improvement areas
        foreach ($competencyScore['competency_scores'] as $competency) {
            if ($competency['rating'] <= 2) {
                $recommendations[] = [
                    'type' => 'improvement',
                    'priority' => 'high',
                    'competency' => $competency['competency_name'],
                    'action' => 'Focus on developing ' . $competency['competency_name'] . ' through targeted training and practice'
                ];
            }
        }

        // Based on trends
        foreach ($trends['competency_trends'] as $trend) {
            if ($trend['trend_direction'] === 'declining') {
                $recommendations[] = [
                    'type' => 'attention',
                    'priority' => 'medium',
                    'competency' => $trend['competency_name'],
                    'action' => 'Address declining performance in ' . $trend['competency_name']
                ];
            }
        }

        return $recommendations;
    }

    private function generateDepartmentRecommendations(Department $department, array $skillGaps): array
    {
        $recommendations = [];

        // High priority gaps
        foreach ($skillGaps['critical_gaps'] as $gap) {
            $recommendations[] = [
                'type' => 'critical_gap',
                'priority' => 'high',
                'competency' => $gap['competency_name'],
                'category' => $gap['category'],
                'affected_employees' => $gap['employees_below_target'],
                'action' => "Implement department-wide training for {$gap['competency_name']} - {$gap['employees_below_target']} employees need improvement"
            ];
        }

        // Team development opportunities
        $strengthAreas = array_filter($skillGaps['competency_gaps'], function ($gap) {
            return $gap['average_rating'] >= 4.0;
        });

        foreach ($strengthAreas as $strength) {
            $recommendations[] = [
                'type' => 'leverage_strength',
                'priority' => 'medium',
                'competency' => $strength['competency_name'],
                'action' => "Leverage department strength in {$strength['competency_name']} for mentoring and knowledge sharing"
            ];
        }

        return $recommendations;
    }

    private function generateOrganizationalRecommendations(array $distribution, array $skillGaps): array
    {
        $recommendations = [];

        // Overall performance recommendations
        $totalAssessments = $distribution['total_assessments'];
        $poorRatings = $distribution['rating_distribution'][1] + $distribution['rating_distribution'][2];
        $poorPercentage = $totalAssessments > 0 ? ($poorRatings / $totalAssessments) * 100 : 0;

        if ($poorPercentage > 20) {
            $recommendations[] = [
                'type' => 'organizational_improvement',
                'priority' => 'high',
                'metric' => 'poor_performance_rate',
                'value' => round($poorPercentage, 1) . '%',
                'action' => 'Implement organization-wide competency development program - high percentage of poor ratings detected'
            ];
        }

        // Category-specific recommendations
        foreach ($distribution['category_distribution'] as $category => $data) {
            if ($data['average_rating'] < 2.5) {
                $recommendations[] = [
                    'type' => 'category_improvement',
                    'priority' => 'high',
                    'category' => $category,
                    'average_rating' => round($data['average_rating'], 2),
                    'action' => "Focus on organization-wide improvement in {$category} competencies"
                ];
            }
        }

        // Critical organizational gaps
        foreach ($skillGaps['critical_gaps'] as $gap) {
            $recommendations[] = [
                'type' => 'critical_organizational_gap',
                'priority' => 'critical',
                'competency' => $gap['competency_name'],
                'severity' => $gap['gap_severity'],
                'action' => "Address critical organizational gap in {$gap['competency_name']} affecting multiple departments"
            ];
        }

        return $recommendations;
    }

    private function getTopPerformers(Department $department): array
    {
        $employeeIds = Employee::where('department_id', $department->id)->pluck('id')->toArray();
        
        if (empty($employeeIds)) {
            return [];
        }

        $topPerformers = [];

        foreach ($employeeIds as $employeeId) {
            $employee = Employee::find($employeeId);
            $competencyScore = $this->calculateEmployeeCompetencyScore($employee);
            
            if ($competencyScore['overall_score'] >= 4.0) {
                $topPerformers[] = [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->name,
                    'overall_score' => round($competencyScore['overall_score'], 2),
                    'assessment_count' => $competencyScore['assessment_count'],
                    'performance_category' => $this->categorizePerformance($competencyScore['overall_score'])
                ];
            }
        }

        // Sort by overall score descending
        usort($topPerformers, function ($a, $b) {
            return $b['overall_score'] <=> $a['overall_score'];
        });

        return array_slice($topPerformers, 0, 10); // Top 10 performers
    }

    private function getImprovementPriorities(array $skillGaps): array
    {
        $priorities = [];

        // Sort competency gaps by severity and impact
        $sortedGaps = $skillGaps['competency_gaps'];
        usort($sortedGaps, function ($a, $b) {
            // Priority: high severity first, then by number of affected employees
            if ($a['gap_severity'] !== $b['gap_severity']) {
                $severityOrder = ['high' => 3, 'medium' => 2, 'low' => 1];
                return $severityOrder[$b['gap_severity']] <=> $severityOrder[$a['gap_severity']];
            }
            return $b['employees_below_target'] <=> $a['employees_below_target'];
        });

        foreach (array_slice($sortedGaps, 0, 5) as $index => $gap) {
            $priorities[] = [
                'rank' => $index + 1,
                'competency_name' => $gap['competency_name'],
                'category' => $gap['category'],
                'severity' => $gap['gap_severity'],
                'average_rating' => round($gap['average_rating'], 2),
                'employees_affected' => $gap['employees_below_target'],
                'total_employees' => $gap['total_employees'],
                'impact_percentage' => round($gap['below_target_percentage'], 1)
            ];
        }

        return $priorities;
    }

    private function calculateKeyMetrics(): array
    {
        $totalAssessments = CompetencyAssessment::where('status', 'approved')->count();
        $totalEmployees = Employee::count();
        $totalCompetencies = Competency::where('is_active', true)->count();

        // Average organizational rating
        $avgRating = CompetencyAssessment::where('status', 'approved')->avg('rating') ?? 0;

        // Assessment completion rate (assuming target is 100% of employees assessed)
        $assessedEmployees = CompetencyAssessment::where('status', 'approved')
            ->distinct('employee_id')
            ->count('employee_id');
        $completionRate = $totalEmployees > 0 ? ($assessedEmployees / $totalEmployees) * 100 : 0;

        // Performance distribution
        $performanceDistribution = [
            'exceptional' => 0,
            'exceeds_expectations' => 0,
            'meets_expectations' => 0,
            'needs_improvement' => 0,
            'poor' => 0
        ];

        $ratingCounts = CompetencyAssessment::where('status', 'approved')
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        foreach ($ratingCounts as $rating => $count) {
            $category = $this->categorizePerformance($rating);
            $performanceDistribution[$category] += $count;
        }

        // Recent trend (last 3 months vs previous 3 months)
        $recentAvg = CompetencyAssessment::where('status', 'approved')
            ->where('created_at', '>=', Carbon::now()->subMonths(3))
            ->avg('rating') ?? 0;

        $previousAvg = CompetencyAssessment::where('status', 'approved')
            ->whereBetween('created_at', [Carbon::now()->subMonths(6), Carbon::now()->subMonths(3)])
            ->avg('rating') ?? 0;

        $trendDirection = 'stable';
        $trendValue = 0;

        if ($previousAvg > 0) {
            $trendValue = $recentAvg - $previousAvg;
            if ($trendValue > 0.1) {
                $trendDirection = 'improving';
            } elseif ($trendValue < -0.1) {
                $trendDirection = 'declining';
            }
        }

        return [
            'total_assessments' => $totalAssessments,
            'total_employees' => $totalEmployees,
            'total_competencies' => $totalCompetencies,
            'assessed_employees' => $assessedEmployees,
            'completion_rate' => round($completionRate, 1),
            'average_rating' => round($avgRating, 2),
            'performance_category' => $this->categorizePerformance($avgRating),
            'performance_distribution' => $performanceDistribution,
            'trend' => [
                'direction' => $trendDirection,
                'value' => round($trendValue, 2),
                'recent_average' => round($recentAvg, 2),
                'previous_average' => round($previousAvg, 2)
            ]
        ];
    }
}