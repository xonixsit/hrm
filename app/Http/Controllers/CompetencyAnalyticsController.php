<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use App\Models\Competency;
use App\Models\AssessmentCycle;
use App\Services\CompetencyAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Carbon\Carbon;

class CompetencyAnalyticsController extends Controller
{
    protected CompetencyAnalyticsService $analyticsService;

    public function __construct(CompetencyAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display the analytics dashboard.
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'department_id', 'employee_id', 'date_from', 'date_to', 
            'competency_ids', 'assessment_type'
        ]);

        // Get dashboard metrics
        $dashboardMetrics = $this->getDashboardMetrics($filters);
        
        // Get competency distribution
        $distribution = $this->analyticsService->getCompetencyDistribution($filters);
        
        // Get recent trends
        $trends = $this->getRecentTrends($filters);

        return Inertia::render('Analytics/CompetencyDashboard', [
            'metrics' => $dashboardMetrics,
            'distribution' => $distribution,
            'trends' => $trends,
            'filters' => $filters,
            'departments' => Department::select('id', 'name')->get(),
            'competencies' => Competency::select('id', 'name', 'category')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Get dashboard analytics data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $filters = $request->only([
            'department_id', 'employee_id', 'date_from', 'date_to', 
            'competency_ids', 'assessment_type'
        ]);

        $metrics = $this->getDashboardMetrics($filters);
        $distribution = $this->analyticsService->getCompetencyDistribution($filters);
        $skillGaps = $this->analyticsService->generateSkillGapAnalysis(
            $request->department_id ? Department::find($request->department_id) : null,
            $request->employee_ids ? explode(',', $request->employee_ids) : [],
            $request->competency_ids ? explode(',', $request->competency_ids) : []
        );

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => $metrics,
                'distribution' => $distribution,
                'skill_gaps' => $skillGaps,
                'generated_at' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Get employee competency analytics.
     */
    public function employee(Request $request, Employee $employee): JsonResponse
    {
        $employee->load(['user', 'department']);
        
        $cycle = $request->assessment_cycle_id 
            ? AssessmentCycle::find($request->assessment_cycle_id) 
            : null;

        $competencyScore = $this->analyticsService->calculateEmployeeCompetencyScore($employee, $cycle);
        $trends = $this->analyticsService->getEmployeeCompetencyTrends($employee, $request->months ?? 12);
        $insights = $this->analyticsService->generatePerformanceInsights($employee);

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown',
                    'department' => $employee->department->name ?? null,
                    'position' => $employee->job_title,
                ],
                'competency_score' => $competencyScore,
                'trends' => $trends,
                'insights' => $insights,
                'generated_at' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Get department competency analytics.
     */
    public function department(Request $request, Department $department): JsonResponse
    {
        $skillGaps = $this->analyticsService->generateSkillGapAnalysis($department);
        $insights = $this->analyticsService->generatePerformanceInsights(null, $department);
        $distribution = $this->analyticsService->getCompetencyDistribution([
            'department_id' => $department->id
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'employee_count' => $department->employees()->count(),
                ],
                'skill_gaps' => $skillGaps,
                'insights' => $insights,
                'distribution' => $distribution,
                'generated_at' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Get skill gap analysis.
     */
    public function skillGaps(Request $request): JsonResponse
    {
        $department = $request->department_id ? Department::find($request->department_id) : null;
        $employeeIds = $request->employee_ids ? explode(',', $request->employee_ids) : [];
        $competencyIds = $request->competency_ids ? explode(',', $request->competency_ids) : [];

        $skillGaps = $this->analyticsService->generateSkillGapAnalysis($department, $employeeIds, $competencyIds);

        return response()->json([
            'success' => true,
            'data' => $skillGaps
        ]);
    }

    /**
     * Get competency trends analysis.
     */
    public function trends(Request $request): JsonResponse
    {
        $filters = $request->only([
            'department_id', 'employee_id', 'date_from', 'date_to', 
            'competency_ids', 'assessment_type', 'months'
        ]);

        $trends = $this->getDetailedTrends($filters);

        return response()->json([
            'success' => true,
            'data' => $trends
        ]);
    }

    /**
     * Compare competency scores across different dimensions.
     */
    public function compare(Request $request): JsonResponse
    {
        $filters = $request->only([
            'compare_departments', 'compare_roles', 'compare_periods', 
            'compare_assessment_types', 'department_id', 'date_from', 'date_to'
        ]);

        $comparisons = $this->analyticsService->compareCompetencyScores($filters);

        return response()->json([
            'success' => true,
            'data' => $comparisons
        ]);
    }

    /**
     * Generate and display reports.
     */
    public function reports(Request $request)
    {
        $reportType = $request->get('type', 'overview');
        $filters = $request->only([
            'department_id', 'employee_id', 'date_from', 'date_to', 
            'competency_ids', 'assessment_type'
        ]);

        $reportData = $this->generateReportData($reportType, $filters);

        return Inertia::render('Competency/CompetencyReports', [
            'reportType' => $reportType,
            'reportData' => $reportData,
            'filters' => $filters,
            'departments' => Department::select('id', 'name')->get(),
            'employees' => Employee::with(['user:id,name', 'department:id,name'])->get()->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown',
                    'department_id' => $employee->department_id,
                    'department' => $employee->department
                ];
            }),
            'competencies' => Competency::select('id', 'name', 'category')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Generate report data based on type.
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:overview,skill_gaps,employee_performance,department_comparison,trend_analysis',
            'format' => 'sometimes|in:json,pdf,excel',
            'department_id' => 'sometimes|exists:departments,id',
            'employee_ids' => 'sometimes|string',
            'competency_ids' => 'sometimes|string',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
        ]);

        $reportType = $request->type;
        $format = $request->get('format', 'json');
        $filters = $request->only([
            'department_id', 'employee_ids', 'competency_ids', 
            'date_from', 'date_to', 'assessment_type'
        ]);

        $reportData = $this->generateReportData($reportType, $filters);

        if ($format === 'json') {
            return response()->json([
                'success' => true,
                'data' => $reportData
            ]);
        }

        // For PDF/Excel formats, we'll return a download response
        return $this->downloadReport($reportData, $reportType, $format);
    }

    /**
     * Export analytics data.
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:dashboard,employee,department,skill_gaps,trends,comparison',
            'format' => 'required|in:json,csv,excel,pdf',
            'filters' => 'sometimes|array',
        ]);

        $type = $request->type;
        $format = $request->format;
        $filters = $request->get('filters', []);

        try {
            $exportData = $this->prepareExportData($type, $filters);
            
            if ($format === 'json') {
                return response()->json([
                    'success' => true,
                    'data' => $exportData,
                    'exported_at' => now()->toISOString()
                ]);
            }

            // For other formats, generate file and return download URL
            $filename = $this->generateExportFile($exportData, $type, $format);
            
            return response()->json([
                'success' => true,
                'download_url' => route('competency-analytics.download', ['filename' => $filename]),
                'filename' => $filename,
                'exported_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download exported file.
     */
    public function download(Request $request, string $filename)
    {
        $filePath = storage_path('app/exports/' . $filename);
        
        if (!file_exists($filePath)) {
            abort(404, 'Export file not found');
        }

        return Response::download($filePath)->deleteFileAfterSend();
    }

    /**
     * Get performance insights.
     */
    public function insights(Request $request): JsonResponse
    {
        $employee = $request->employee_id ? Employee::find($request->employee_id) : null;
        $department = $request->department_id ? Department::find($request->department_id) : null;

        $insights = $this->analyticsService->generatePerformanceInsights($employee, $department);

        return response()->json([
            'success' => true,
            'data' => $insights
        ]);
    }

    /**
     * Get competency distribution data.
     */
    public function distribution(Request $request): JsonResponse
    {
        $filters = $request->only([
            'department_id', 'date_from', 'date_to', 
            'competency_ids', 'assessment_type'
        ]);

        $distribution = $this->analyticsService->getCompetencyDistribution($filters);

        return response()->json([
            'success' => true,
            'data' => $distribution
        ]);
    }

    /**
     * Generate development plans report.
     */
    public function developmentPlansReport(Request $request): JsonResponse
    {
        $request->validate([
            'scope' => 'sometimes|in:all,active,overdue,completed',
            'department_id' => 'sometimes|exists:departments,id',
            'format' => 'sometimes|in:json,pdf,excel',
        ]);

        $scope = $request->get('scope', 'all');
        $departmentId = $request->get('department_id');
        $format = $request->get('format', 'json');

        try {
            $reportData = $this->generateDevelopmentPlansReportData($scope, $departmentId);
            
            if ($format === 'json') {
                return response()->json([
                    'success' => true,
                    'data' => $reportData,
                    'generated_at' => now()->toISOString()
                ]);
            }

            // For PDF/Excel formats, generate file and return download URL
            $filename = $this->generateExportFile($reportData, 'development_plans', $format);
            
            return response()->json([
                'success' => true,
                'download_url' => route('competency-analytics.download', ['filename' => $filename]),
                'filename' => $filename,
                'generated_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate development plans report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard metrics.
     */
    private function getDashboardMetrics(array $filters): array
    {
        // This would typically aggregate key metrics
        $skillGaps = $this->analyticsService->generateSkillGapAnalysis();
        $distribution = $this->analyticsService->getCompetencyDistribution($filters);

        return [
            'total_assessments' => $distribution['total_assessments'],
            'average_rating' => $this->calculateAverageRating($distribution),
            'critical_gaps' => count($skillGaps['critical_gaps'] ?? []),
            'employees_assessed' => count($skillGaps['employee_profiles'] ?? []),
            'competencies_tracked' => count($skillGaps['competency_gaps'] ?? []),
            'improvement_trends' => $this->getImprovementTrends($filters),
        ];
    }

    /**
     * Get recent trends data.
     */
    private function getRecentTrends(array $filters): array
    {
        $months = 6; // Last 6 months
        $trends = [];

        // Get monthly assessment data
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthFilters = array_merge($filters, [
                'date_from' => $date->startOfMonth()->toDateString(),
                'date_to' => $date->endOfMonth()->toDateString(),
            ]);

            $distribution = $this->analyticsService->getCompetencyDistribution($monthFilters);
            
            $trends[] = [
                'month' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
                'total_assessments' => $distribution['total_assessments'],
                'average_rating' => $this->calculateAverageRating($distribution),
            ];
        }

        return $trends;
    }

    /**
     * Get detailed trends analysis.
     */
    private function getDetailedTrends(array $filters): array
    {
        $months = $filters['months'] ?? 12;
        $trends = [];

        // If specific employee, get their trends
        if (isset($filters['employee_id'])) {
            $employee = Employee::find($filters['employee_id']);
            if ($employee) {
                $trends['employee'] = $this->analyticsService->getEmployeeCompetencyTrends($employee, $months);
            }
        }

        // Get organizational trends
        $trends['organizational'] = $this->getOrganizationalTrends($months, $filters);

        // Get category trends
        $trends['categories'] = $this->getCategoryTrends($months, $filters);

        return $trends;
    }

    /**
     * Generate report data based on type.
     */
    private function generateReportData(string $type, array $filters): array
    {
        switch ($type) {
            case 'overview':
                return [
                    'metrics' => $this->getDashboardMetrics($filters),
                    'distribution' => $this->analyticsService->getCompetencyDistribution($filters),
                    'skill_gaps' => $this->analyticsService->generateSkillGapAnalysis(),
                ];

            case 'skill_gaps':
                $department = isset($filters['department_id']) ? Department::find($filters['department_id']) : null;
                $employeeIds = isset($filters['employee_ids']) ? explode(',', $filters['employee_ids']) : [];
                $competencyIds = isset($filters['competency_ids']) ? explode(',', $filters['competency_ids']) : [];
                
                return $this->analyticsService->generateSkillGapAnalysis($department, $employeeIds, $competencyIds);

            case 'employee_performance':
                if (isset($filters['employee_id'])) {
                    $employee = Employee::find($filters['employee_id']);
                    return [
                        'employee' => $employee,
                        'competency_score' => $this->analyticsService->calculateEmployeeCompetencyScore($employee),
                        'trends' => $this->analyticsService->getEmployeeCompetencyTrends($employee),
                        'insights' => $this->analyticsService->generatePerformanceInsights($employee),
                    ];
                }
                return [];

            case 'department_comparison':
                return $this->analyticsService->compareCompetencyScores(['compare_departments' => true]);

            case 'trend_analysis':
                return $this->getDetailedTrends($filters);

            default:
                return [];
        }
    }

    /**
     * Prepare data for export.
     */
    private function prepareExportData(string $type, array $filters): array
    {
        return $this->generateReportData($type, $filters);
    }

    /**
     * Generate export file.
     */
    private function generateExportFile(array $data, string $type, string $format): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "competency_analytics_{$type}_{$timestamp}.{$format}";
        $filePath = storage_path('app/exports/' . $filename);

        // Ensure exports directory exists
        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        switch ($format) {
            case 'csv':
                $this->generateCsvFile($data, $filePath);
                break;
            case 'excel':
                $this->generateExcelFile($data, $filePath);
                break;
            case 'pdf':
                $this->generatePdfFile($data, $filePath, $type);
                break;
        }

        return $filename;
    }

    /**
     * Generate CSV file.
     */
    private function generateCsvFile(array $data, string $filePath): void
    {
        $handle = fopen($filePath, 'w');
        
        // Write CSV headers and data based on data structure
        if (isset($data['employee_profiles'])) {
            // Skill gaps export
            fputcsv($handle, ['Employee', 'Department', 'Average Rating', 'Gap Areas', 'Strength Areas']);
            
            foreach ($data['employee_profiles'] as $profile) {
                fputcsv($handle, [
                    $profile['employee_name'],
                    $profile['department'] ?? '',
                    round($profile['average_rating'], 2),
                    count($profile['gap_areas']),
                    count($profile['strength_areas']),
                ]);
            }
        } else {
            // Generic data export
            fputcsv($handle, ['Key', 'Value']);
            foreach ($data as $key => $value) {
                fputcsv($handle, [$key, is_array($value) ? json_encode($value) : $value]);
            }
        }
        
        fclose($handle);
    }

    /**
     * Generate Excel file (simplified - would use a proper Excel library in production).
     */
    private function generateExcelFile(array $data, string $filePath): void
    {
        // For now, generate as CSV with .xlsx extension
        // In production, use PhpSpreadsheet or similar
        $this->generateCsvFile($data, $filePath);
    }

    /**
     * Generate PDF file (simplified - would use a proper PDF library in production).
     */
    private function generatePdfFile(array $data, string $filePath, string $type): void
    {
        // For now, generate as JSON with .pdf extension
        // In production, use TCPDF, DOMPDF, or similar
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * Download report in specified format.
     */
    private function downloadReport(array $data, string $type, string $format): JsonResponse
    {
        $filename = $this->generateExportFile($data, $type, $format);
        
        return response()->json([
            'success' => true,
            'download_url' => route('competency-analytics.download', ['filename' => $filename]),
            'filename' => $filename,
        ]);
    }

    /**
     * Calculate average rating from distribution data.
     */
    private function calculateAverageRating(array $distribution): float
    {
        $totalRating = 0;
        $totalCount = 0;

        foreach ($distribution['rating_distribution'] as $rating => $count) {
            $totalRating += $rating * $count;
            $totalCount += $count;
        }

        return $totalCount > 0 ? $totalRating / $totalCount : 0;
    }

    /**
     * Get improvement trends.
     */
    private function getImprovementTrends(array $filters): array
    {
        // Simplified trend calculation
        $currentMonth = $this->analyticsService->getCompetencyDistribution(array_merge($filters, [
            'date_from' => Carbon::now()->startOfMonth()->toDateString(),
            'date_to' => Carbon::now()->endOfMonth()->toDateString(),
        ]));

        $previousMonth = $this->analyticsService->getCompetencyDistribution(array_merge($filters, [
            'date_from' => Carbon::now()->subMonth()->startOfMonth()->toDateString(),
            'date_to' => Carbon::now()->subMonth()->endOfMonth()->toDateString(),
        ]));

        $currentAvg = $this->calculateAverageRating($currentMonth);
        $previousAvg = $this->calculateAverageRating($previousMonth);

        return [
            'current_average' => $currentAvg,
            'previous_average' => $previousAvg,
            'change' => $currentAvg - $previousAvg,
            'trend' => $currentAvg > $previousAvg ? 'improving' : ($currentAvg < $previousAvg ? 'declining' : 'stable'),
        ];
    }

    /**
     * Get organizational trends.
     */
    private function getOrganizationalTrends(int $months, array $filters): array
    {
        $trends = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthFilters = array_merge($filters, [
                'date_from' => $date->startOfMonth()->toDateString(),
                'date_to' => $date->endOfMonth()->toDateString(),
            ]);

            $distribution = $this->analyticsService->getCompetencyDistribution($monthFilters);
            
            $trends[] = [
                'month' => $date->format('Y-m'),
                'date' => $date->toDateString(),
                'average_rating' => $this->calculateAverageRating($distribution),
                'total_assessments' => $distribution['total_assessments'],
            ];
        }

        return $trends;
    }

    /**
     * Get category trends.
     */
    private function getCategoryTrends(int $months, array $filters): array
    {
        $categoryTrends = [];
        
        // Get all categories
        $categories = Competency::where('is_active', true)->distinct()->pluck('category');
        
        foreach ($categories as $category) {
            $categoryData = [];
            
            for ($i = $months - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $monthFilters = array_merge($filters, [
                    'date_from' => $date->startOfMonth()->toDateString(),
                    'date_to' => $date->endOfMonth()->toDateString(),
                ]);

                $distribution = $this->analyticsService->getCompetencyDistribution($monthFilters);
                $categoryStats = $distribution['category_distribution'][$category] ?? ['average_rating' => 0, 'count' => 0];
                
                $categoryData[] = [
                    'month' => $date->format('Y-m'),
                    'date' => $date->toDateString(),
                    'average_rating' => $categoryStats['average_rating'],
                    'assessment_count' => $categoryStats['count'],
                ];
            }
            
            $categoryTrends[$category] = $categoryData;
        }

        return $categoryTrends;
    }

    /**
     * Generate development plans report data.
     */
    private function generateDevelopmentPlansReportData(string $scope, ?int $departmentId): array
    {
        $query = \App\Models\CompetencyDevelopmentPlan::with(['employee.user', 'employee.department', 'competency']);

        // Apply scope filter
        switch ($scope) {
            case 'active':
                $query->where('status', 'active');
                break;
            case 'overdue':
                $query->where('status', 'active')
                      ->where('target_date', '<', now());
                break;
            case 'completed':
                $query->where('status', 'completed');
                break;
            case 'all':
            default:
                // No additional filter
                break;
        }

        // Apply department filter
        if ($departmentId) {
            $query->whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $plans = $query->get();

        // Generate summary statistics
        $totalPlans = $plans->count();
        $activePlans = $plans->where('status', 'active')->count();
        $completedPlans = $plans->where('status', 'completed')->count();
        $overduePlans = $plans->where('status', 'active')
                             ->where('target_date', '<', now())
                             ->count();

        // Group by competency
        $competencyBreakdown = $plans->groupBy('competency.name')->map(function ($group) {
            return [
                'competency' => $group->first()->competency->name,
                'total_plans' => $group->count(),
                'active' => $group->where('status', 'active')->count(),
                'completed' => $group->where('status', 'completed')->count(),
                'average_progress' => $group->avg(function ($plan) {
                    return $plan->getProgressPercentage();
                }),
            ];
        })->values();

        // Group by department
        $departmentBreakdown = $plans->groupBy('employee.department.name')->map(function ($group) {
            return [
                'department' => $group->first()->employee->department->name ?? 'Unknown',
                'total_plans' => $group->count(),
                'active' => $group->where('status', 'active')->count(),
                'completed' => $group->where('status', 'completed')->count(),
                'completion_rate' => $group->count() > 0 ? 
                    ($group->where('status', 'completed')->count() / $group->count()) * 100 : 0,
            ];
        })->values();

        return [
            'summary' => [
                'total_plans' => $totalPlans,
                'active_plans' => $activePlans,
                'completed_plans' => $completedPlans,
                'overdue_plans' => $overduePlans,
                'completion_rate' => $totalPlans > 0 ? ($completedPlans / $totalPlans) * 100 : 0,
            ],
            'competency_breakdown' => $competencyBreakdown,
            'department_breakdown' => $departmentBreakdown,
            'plans' => $plans->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'employee_name' => $plan->employee->user->name ?? 'Unknown',
                    'department' => $plan->employee->department->name ?? 'Unknown',
                    'competency' => $plan->competency->name,
                    'current_rating' => $plan->current_rating,
                    'target_rating' => $plan->target_rating,
                    'target_date' => $plan->target_date?->toDateString(),
                    'status' => $plan->status,
                    'progress_percentage' => $plan->getProgressPercentage(),
                    'is_overdue' => $plan->status === 'active' && $plan->target_date && $plan->target_date < now(),
                ];
            }),
            'generated_at' => now()->toISOString(),
        ];
    }
}