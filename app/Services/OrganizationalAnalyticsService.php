<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrganizationalAnalyticsService
{
    // ─── Employee Growth ──────────────────────────────────────────────────────

    public function getEmployeeGrowthTrends($startDate = null, $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->subYear();
        $endDate   = $endDate   ?? Carbon::now();
        $monthly   = [];
        $current   = $startDate->copy()->startOfMonth();

        while ($current <= $endDate) {
            $monthEnd = $current->copy()->endOfMonth();
            try {
                $total    = DB::table('employees')->where('created_at', '<=', $monthEnd)->whereNull('deleted_at')->count();
                $newHires = DB::table('employees')->whereBetween('created_at', [$current, $monthEnd])->whereNull('deleted_at')->count();
            } catch (\Exception $e) {
                $total = $newHires = 0;
            }
            $monthly[] = ['month' => $current->format('M Y'), 'total_employees' => $total, 'new_hires' => $newHires, 'date' => $current->toDateString()];
            $current->addMonth();
        }
        return $monthly;
    }

    // ─── Performance Metrics (Competency Assessments) ─────────────────────────

    public function getPerformanceMetrics(string $timeRange = '30d'): array
    {
        try {
            if (!Schema::hasTable('competency_assessments')) return $this->emptyPerformance();
            $start = $this->startDate($timeRange);

            $rows = DB::table('competency_assessments')
                ->join('employees', 'employees.id', '=', 'competency_assessments.employee_id')
                ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
                ->leftJoin('competencies', 'competencies.id', '=', 'competency_assessments.competency_id')
                ->whereIn('competency_assessments.status', ['approved', 'submitted'])
                ->where('competency_assessments.created_at', '>=', $start)
                ->whereNull('employees.deleted_at')
                ->select(
                    'competency_assessments.rating',
                    DB::raw('COALESCE(departments.name, "Unassigned") as dept'),
                    DB::raw('COALESCE(competencies.name, "Unknown") as skill')
                )
                ->get();

            $dist = ['excellent' => 0, 'good' => 0, 'average' => 0, 'needs_improvement' => 0];
            $deptData = [];
            $skillData = [];
            $totalScore = 0;

            foreach ($rows as $row) {
                $pct = ($row->rating ?? 0) * 20; // 1-5 → 20-100
                $totalScore += $pct;

                if ($pct >= 80) $dist['excellent']++;
                elseif ($pct >= 60) $dist['good']++;
                elseif ($pct >= 40) $dist['average']++;
                else $dist['needs_improvement']++;

                $deptData[$row->dept]['sum']   = ($deptData[$row->dept]['sum']   ?? 0) + $pct;
                $deptData[$row->dept]['total'] = ($deptData[$row->dept]['total'] ?? 0) + 1;

                $skillData[$row->skill]['sum']   = ($skillData[$row->skill]['sum']   ?? 0) + $pct;
                $skillData[$row->skill]['total'] = ($skillData[$row->skill]['total'] ?? 0) + 1;
            }

            $deptPerf = [];
            foreach ($deptData as $name => $d) {
                $deptPerf[$name] = ['total' => $d['total'], 'sum' => $d['sum'], 'average' => $d['total'] > 0 ? round($d['sum'] / $d['total'], 1) : 0];
            }

            $total = $rows->count();
            return [
                'distribution'         => $dist,
                'department_performance' => $deptPerf,
                'skills_analysis'      => $skillData,
                'avg_score'            => $total > 0 ? round($totalScore / $total, 1) : 0,
                'total_assessments'    => $total,
            ];
        } catch (\Exception $e) {
            \Log::error('PerformanceMetrics: ' . $e->getMessage());
            return $this->emptyPerformance();
        }
    }

    // ─── Attendance Analytics ─────────────────────────────────────────────────

    public function getAttendanceAnalytics(string $timeRange = '30d'): array
    {
        try {
            $start         = $this->startDate($timeRange);
            $totalActive   = DB::table('employees')->where('status', 'active')->whereNull('deleted_at')->count();
            $workingDays   = max(1, $start->diffInWeekdays(Carbon::now()));
            $expectedTotal = $totalActive * $workingDays;

            // Overall rate
            $actual      = DB::table('attendances')->where('date', '>=', $start)->whereNotNull('clock_in')->count();
            $overallRate = $expectedTotal > 0 ? round(($actual / $expectedTotal) * 100, 1) : 0;

            // Trend vs previous period
            $prevStart  = $start->copy()->subDays($start->diffInDays(Carbon::now()));
            $prevActual = DB::table('attendances')->whereBetween('date', [$prevStart, $start])->whereNotNull('clock_in')->count();
            $prevRate   = $expectedTotal > 0 ? round(($prevActual / $expectedTotal) * 100, 1) : 0;
            $trend      = round($overallRate - $prevRate, 1);

            // Weekly heatmap — last 4 weeks, Mon–Fri
            $weekly = [];
            for ($w = 3; $w >= 0; $w--) {
                $weekStart = Carbon::now()->subWeeks($w)->startOfWeek();
                $rates = [];
                for ($d = 0; $d < 5; $d++) {
                    $day     = $weekStart->copy()->addDays($d);
                    $present = DB::table('attendances')->whereDate('date', $day)->whereNotNull('clock_in')->distinct('employee_id')->count();
                    $rates[] = $totalActive > 0 ? round(($present / $totalActive) * 100, 1) : 0;
                }
                $weekly['week' . (4 - $w)] = $rates;
            }

            // Avg hours worked per day
            $avgMinutes = DB::table('attendances')
                ->where('date', '>=', $start)
                ->whereNotNull('clock_out')
                ->whereNotNull('work_minutes')
                ->avg('work_minutes');
            $avgHours = $avgMinutes ? round($avgMinutes / 60, 1) : 0;

            // Today's present count
            $presentToday = DB::table('attendances')->whereDate('date', today())->whereNotNull('clock_in')->distinct('employee_id')->count();

            // Dept breakdown
            $deptRates = [];
            $depts = DB::table('departments')->select('id', 'name')->get();
            foreach ($depts as $dept) {
                $deptCount = DB::table('employees')->where('department_id', $dept->id)->where('status', 'active')->whereNull('deleted_at')->count();
                if ($deptCount === 0) continue;
                $deptActual = DB::table('attendances')
                    ->join('employees', 'employees.id', '=', 'attendances.employee_id')
                    ->where('employees.department_id', $dept->id)
                    ->where('attendances.date', '>=', $start)
                    ->whereNotNull('attendances.clock_in')
                    ->count();
                $deptExp    = $deptCount * $workingDays;
                $deptRates[$dept->name] = $deptExp > 0 ? round(($deptActual / $deptExp) * 100, 1) : 0;
            }

            return compact('weekly', 'deptRates', 'overallRate', 'trend', 'avgHours', 'presentToday', 'totalActive') + ['weekly_patterns' => $weekly, 'department_rates' => $deptRates, 'overall_rate' => $overallRate];
        } catch (\Exception $e) {
            \Log::error('AttendanceAnalytics: ' . $e->getMessage());
            return ['weekly_patterns' => [], 'department_rates' => [], 'overall_rate' => 0, 'trend' => 0, 'avgHours' => 0, 'presentToday' => 0, 'totalActive' => 0];
        }
    }

    // ─── Attrition Analysis ────────────────────────────────────────────────────

    public function getAttritionAnalysis(string $timeRange = '1y'): array
    {
        try {
            $start = $this->startDate($timeRange);

            $departed = DB::table('employees')
                ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
                ->where('employees.exit_date', '>=', $start)
                ->whereNotNull('employees.exit_date')
                ->select('employees.exit_reason', DB::raw('COALESCE(departments.name,"Unassigned") as dept'))
                ->get();

            $totalActive = DB::table('employees')->where('status', 'active')->whereNull('deleted_at')->count();
            $rate = ($totalActive + $departed->count()) > 0
                ? round(($departed->count() / ($totalActive + $departed->count())) * 100, 2)
                : 0;

            // Categorise exit reasons from real data
            $voluntary = $involuntary = $retirement = $other = 0;
            foreach ($departed as $e) {
                $r = strtolower($e->exit_reason ?? '');
                if (str_contains($r, 'resign') || str_contains($r, 'personal') || str_contains($r, 'better')) $voluntary++;
                elseif (str_contains($r, 'terminat') || str_contains($r, 'dismiss') || str_contains($r, 'layoff')) $involuntary++;
                elseif (str_contains($r, 'retire')) $retirement++;
                else $other++;
            }
            $total = max(1, $departed->count());
            $reasons = [
                'voluntary'   => round(($voluntary / $total) * 100),
                'involuntary' => round(($involuntary / $total) * 100),
                'retirement'  => round(($retirement / $total) * 100),
                'other'       => round(($other / $total) * 100),
            ];

            // Dept breakdown
            $deptBreakdown = [];
            foreach ($departed as $e) {
                $deptBreakdown[$e->dept] = ($deptBreakdown[$e->dept] ?? 0) + 1;
            }

            // Trend: compare this period vs prior
            $prevDeparted = DB::table('employees')
                ->where('exit_date', '>=', $start->copy()->sub($start->diffInDays(Carbon::now()), 'days'))
                ->where('exit_date', '<', $start)
                ->whereNotNull('exit_date')
                ->count();
            $trend = $prevDeparted > 0 ? round((($departed->count() - $prevDeparted) / $prevDeparted) * 100, 1) : 0;

            return [
                'rate'             => $rate,
                'total_departures' => $departed->count(),
                'reasons_breakdown'=> $reasons,
                'department_breakdown' => $deptBreakdown,
                'trend'            => $trend,
            ];
        } catch (\Exception $e) {
            \Log::error('AttritionAnalysis: ' . $e->getMessage());
            return ['rate' => 0, 'total_departures' => 0, 'reasons_breakdown' => [], 'department_breakdown' => [], 'trend' => 0];
        }
    }

    // ─── Onboarding Metrics ────────────────────────────────────────────────────

    public function getOnboardingMetrics(string $timeRange = '90d'): array
    {
        try {
            $start    = $this->startDate($timeRange);
            $newHires = DB::table('employees')->where('created_at', '>=', $start)->whereNull('deleted_at')->get();

            $succeeded = 0;
            $daysSum   = 0;
            $daysCount = 0;

            // Weekly completion timeline: how many had first assessment by week 1..6
            $weekBuckets = array_fill(0, 6, 0);

            foreach ($newHires as $emp) {
                $first = DB::table('competency_assessments')
                    ->where('employee_id', $emp->id)
                    ->orderBy('created_at')
                    ->value('created_at');

                if ($first) {
                    $days = Carbon::parse($emp->created_at)->diffInDays(Carbon::parse($first));
                    $daysSum++;
                    $daysCount++;
                    $weekIdx = min(5, (int) floor($days / 7));
                    for ($i = $weekIdx; $i < 6; $i++) $weekBuckets[$i]++;
                    if ($days <= 90 && Carbon::parse($emp->created_at)->diffInDays(Carbon::now()) > 30) $succeeded++;
                }
            }

            $total = max(1, $newHires->count());
            $timeline = array_map(fn($v) => $total > 0 ? round(($v / $total) * 100) : 0, $weekBuckets);

            return [
                'success_rate'       => round(($succeeded / $total) * 100, 1),
                'avg_days'           => $daysCount > 0 ? round($daysSum / $daysCount) : 0,
                'total_new_hires'    => $newHires->count(),
                'completion_timeline'=> $timeline,
            ];
        } catch (\Exception $e) {
            \Log::error('OnboardingMetrics: ' . $e->getMessage());
            return ['success_rate' => 0, 'avg_days' => 0, 'total_new_hires' => 0, 'completion_timeline' => [0, 0, 0, 0, 0, 0]];
        }
    }

    // ─── Skills Matrix (Competency-based) ─────────────────────────────────────

    public function getSkillsMatrix(): array
    {
        try {
            if (!Schema::hasTable('competencies') || !Schema::hasTable('competency_assessments')) return $this->emptySkillsMatrix();

            $rows = DB::table('competencies')
                ->join('competency_assessments', 'competencies.id', '=', 'competency_assessments.competency_id')
                ->whereIn('competency_assessments.status', ['approved', 'submitted'])
                ->select('competencies.name', 'competency_assessments.rating')
                ->get();

            $buckets = [];
            foreach ($rows as $r) {
                $cat = $this->categorizeSkill($r->name);
                $buckets[$cat][] = $r->rating;
            }

            $matrix = [];
            $allCats = ['Technical Skills', 'Leadership', 'Communication', 'Project Management', 'Problem Solving', 'Teamwork', 'Innovation', 'Customer Focus'];
            foreach ($allCats as $cat) {
                $ratings = $buckets[$cat] ?? [];
                if (empty($ratings)) { $matrix[$cat] = ['expert' => 0, 'proficient' => 0, 'needs_development' => 0]; continue; }
                $n       = count($ratings);
                $expert  = count(array_filter($ratings, fn($r) => $r >= 4));
                $prof    = count(array_filter($ratings, fn($r) => $r >= 3 && $r < 4));
                $nd      = count(array_filter($ratings, fn($r) => $r < 3));
                $matrix[$cat] = ['expert' => round($expert / $n * 100), 'proficient' => round($prof / $n * 100), 'needs_development' => round($nd / $n * 100)];
            }
            return $matrix;
        } catch (\Exception $e) {
            \Log::error('SkillsMatrix: ' . $e->getMessage());
            return $this->emptySkillsMatrix();
        }
    }

    // ─── Work Report Analytics ─────────────────────────────────────────────────

    public function getWorkReportAnalytics(string $timeRange = '30d'): array
    {
        try {
            if (!Schema::hasTable('work_reports')) return $this->emptyWorkReports();
            $start = $this->startDate($timeRange);

            // Totals for the period
            $totals = DB::table('work_reports')
                ->where('date', '>=', $start)
                ->select(
                    DB::raw('COUNT(*) as report_count'),
                    DB::raw('SUM(calls) as total_calls'),
                    DB::raw('SUM(emails) as total_emails'),
                    DB::raw('SUM(whatsapp) as total_whatsapp'),
                    DB::raw('SUM(follow_up_calls) as total_followups'),
                    DB::raw('SUM(interested_count) as total_interested'),
                    DB::raw('SUM(not_interested_count) as total_not_interested'),
                    DB::raw('SUM(voice_mails) as total_voicemails'),
                    DB::raw('SUM(calls_not_received) as total_missed')
                )
                ->first();

            // Daily trend for the period (calls per day)
            $dailyTrend = DB::table('work_reports')
                ->where('date', '>=', $start)
                ->select('date', DB::raw('SUM(calls) as calls'), DB::raw('SUM(interested_count) as interested'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn($r) => ['date' => $r->date, 'calls' => (int)$r->calls, 'interested' => (int)$r->interested]);

            // Top performers by total calls
            $topPerformers = DB::table('work_reports')
                ->join('employees', 'employees.id', '=', 'work_reports.employee_id')
                ->join('users', 'users.id', '=', 'employees.user_id')
                ->where('work_reports.date', '>=', $start)
                ->whereNull('employees.deleted_at')
                ->select(
                    'users.name',
                    DB::raw('SUM(work_reports.calls) as total_calls'),
                    DB::raw('SUM(work_reports.interested_count) as interested'),
                    DB::raw('COUNT(work_reports.id) as days_reported')
                )
                ->groupBy('employees.id', 'users.name')
                ->orderByDesc('total_calls')
                ->limit(5)
                ->get();

            // Department breakdown
            $deptBreakdown = DB::table('work_reports')
                ->join('employees', 'employees.id', '=', 'work_reports.employee_id')
                ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
                ->where('work_reports.date', '>=', $start)
                ->whereNull('employees.deleted_at')
                ->select(
                    DB::raw('COALESCE(departments.name,"Unassigned") as dept'),
                    DB::raw('SUM(work_reports.calls) as calls'),
                    DB::raw('SUM(work_reports.interested_count) as interested')
                )
                ->groupBy('dept')
                ->orderByDesc('calls')
                ->get();

            // Monthly trend (last 6 months)
            $monthlyTrend = DB::table('work_reports')
                ->where('date', '>=', Carbon::now()->subMonths(6)->startOfMonth())
                ->select(
                    DB::raw('DATE_FORMAT(date, "%b %Y") as month'),
                    DB::raw('SUM(calls) as calls'),
                    DB::raw('SUM(interested_count) as interested'),
                    DB::raw('COUNT(DISTINCT employee_id) as active_reporters')
                )
                ->groupBy(DB::raw('DATE_FORMAT(date, "%b %Y")'), DB::raw('DATE_FORMAT(date, "%Y%m")'))
                ->orderBy(DB::raw('DATE_FORMAT(date, "%Y%m")'))
                ->get();

            $totalCalls     = (int)($totals->total_calls ?? 0);
            $totalInterested = (int)($totals->total_interested ?? 0);
            $conversionRate  = $totalCalls > 0 ? round(($totalInterested / $totalCalls) * 100, 1) : 0;

            return [
                'totals'           => [
                    'calls'         => $totalCalls,
                    'emails'        => (int)($totals->total_emails ?? 0),
                    'whatsapp'      => (int)($totals->total_whatsapp ?? 0),
                    'followups'     => (int)($totals->total_followups ?? 0),
                    'interested'    => $totalInterested,
                    'not_interested'=> (int)($totals->total_not_interested ?? 0),
                    'voicemails'    => (int)($totals->total_voicemails ?? 0),
                    'missed'        => (int)($totals->total_missed ?? 0),
                    'report_count'  => (int)($totals->report_count ?? 0),
                ],
                'conversion_rate'  => $conversionRate,
                'daily_trend'      => $dailyTrend,
                'monthly_trend'    => $monthlyTrend,
                'top_performers'   => $topPerformers,
                'dept_breakdown'   => $deptBreakdown,
            ];
        } catch (\Exception $e) {
            \Log::error('WorkReportAnalytics: ' . $e->getMessage());
            return $this->emptyWorkReports();
        }
    }

    // ─── Skill Test Analytics ──────────────────────────────────────────────────

    public function getSkillTestAnalytics(string $timeRange = '30d'): array
    {
        try {
            if (!Schema::hasTable('skill_tests') || !Schema::hasTable('test_responses')) return $this->emptySkillTests();
            $start = $this->startDate($timeRange);

            // Overall stats — from test_responses (submitted results)
            $stats = DB::table('test_responses')
                ->where('submitted_at', '>=', $start)
                ->select(
                    DB::raw('COUNT(*) as total_attempts'),
                    DB::raw('AVG(percentage_score) as avg_score'),
                    DB::raw('SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count')
                )
                ->first();

            $total       = (int)($stats->total_attempts ?? 0);
            $passedCount = (int)($stats->passed_count ?? 0);
            $passRate    = $total > 0 ? round(($passedCount / $total) * 100, 1) : 0;

            // Per-test performance
            $testPerformance = DB::table('test_responses')
                ->join('skill_tests', 'skill_tests.id', '=', 'test_responses.skill_test_id')
                ->where('test_responses.submitted_at', '>=', $start)
                ->select(
                    'skill_tests.name',
                    'skill_tests.category',
                    'skill_tests.difficulty_level',
                    DB::raw('COUNT(*) as attempts'),
                    DB::raw('AVG(test_responses.percentage_score) as avg_score'),
                    DB::raw('SUM(CASE WHEN test_responses.passed = 1 THEN 1 ELSE 0 END) as passed')
                )
                ->groupBy('skill_tests.id', 'skill_tests.name', 'skill_tests.category', 'skill_tests.difficulty_level')
                ->orderByDesc('attempts')
                ->limit(10)
                ->get()
                ->map(fn($r) => [
                    'name'       => $r->name,
                    'category'   => $r->category,
                    'difficulty' => $r->difficulty_level,
                    'attempts'   => (int)$r->attempts,
                    'avg_score'  => round((float)$r->avg_score, 1),
                    'pass_rate'  => $r->attempts > 0 ? round(($r->passed / $r->attempts) * 100, 1) : 0,
                ]);

            // Score distribution buckets using percentage_score
            $scoreDist = DB::table('test_responses')
                ->where('submitted_at', '>=', $start)
                ->select(DB::raw('
                    SUM(CASE WHEN percentage_score >= 90 THEN 1 ELSE 0 END) as s90,
                    SUM(CASE WHEN percentage_score >= 75 AND percentage_score < 90 THEN 1 ELSE 0 END) as s75,
                    SUM(CASE WHEN percentage_score >= 60 AND percentage_score < 75 THEN 1 ELSE 0 END) as s60,
                    SUM(CASE WHEN percentage_score < 60 THEN 1 ELSE 0 END) as s_fail
                '))
                ->first();

            // Top scorers
            $topScorers = DB::table('test_responses')
                ->join('employees', 'employees.id', '=', 'test_responses.employee_id')
                ->join('users', 'users.id', '=', 'employees.user_id')
                ->join('skill_tests', 'skill_tests.id', '=', 'test_responses.skill_test_id')
                ->where('test_responses.submitted_at', '>=', $start)
                ->whereNull('employees.deleted_at')
                ->select('users.name', 'skill_tests.name as test_name', 'test_responses.percentage_score as score')
                ->orderByDesc('test_responses.percentage_score')
                ->limit(5)
                ->get();

            // Monthly trend
            $monthlyTrend = DB::table('test_responses')
                ->where('submitted_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
                ->select(
                    DB::raw('DATE_FORMAT(submitted_at, "%b %Y") as month'),
                    DB::raw('COUNT(*) as attempts'),
                    DB::raw('AVG(percentage_score) as avg_score'),
                    DB::raw('SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed')
                )
                ->groupBy(DB::raw('DATE_FORMAT(submitted_at, "%b %Y")'), DB::raw('DATE_FORMAT(submitted_at, "%Y%m")'))
                ->orderBy(DB::raw('DATE_FORMAT(submitted_at, "%Y%m")'))
                ->get();

            // Category breakdown
            $categoryBreakdown = DB::table('test_responses')
                ->join('skill_tests', 'skill_tests.id', '=', 'test_responses.skill_test_id')
                ->where('test_responses.submitted_at', '>=', $start)
                ->select(
                    'skill_tests.category',
                    DB::raw('COUNT(*) as attempts'),
                    DB::raw('AVG(test_responses.percentage_score) as avg_score'),
                    DB::raw('SUM(CASE WHEN test_responses.passed = 1 THEN 1 ELSE 0 END) as passed')
                )
                ->groupBy('skill_tests.category')
                ->orderByDesc('attempts')
                ->get();

            return [
                'overview' => [
                    'total_attempts' => $total,
                    'completed'      => $total, // all test_responses are completed submissions
                    'avg_score'      => round((float)($stats->avg_score ?? 0), 1),
                    'pass_rate'      => $passRate,
                    'passed'         => $passedCount,
                ],
                'score_distribution' => [
                    'excellent' => (int)($scoreDist->s90   ?? 0),
                    'good'      => (int)($scoreDist->s75   ?? 0),
                    'pass'      => (int)($scoreDist->s60   ?? 0),
                    'fail'      => (int)($scoreDist->s_fail ?? 0),
                ],
                'test_performance'   => $testPerformance,
                'category_breakdown' => $categoryBreakdown,
                'top_scorers'        => $topScorers,
                'monthly_trend'      => $monthlyTrend,
            ];
        } catch (\Exception $e) {
            \Log::error('SkillTestAnalytics: ' . $e->getMessage());
            return $this->emptySkillTests();
        }
    }

    // ─── Leave Analytics ──────────────────────────────────────────────────────

    public function getLeaveAnalytics(string $timeRange = '30d'): array
    {
        try {
            if (!Schema::hasTable('leaves')) return $this->emptyLeave();
            $start = $this->startDate($timeRange);

            // Overall counts
            $overview = DB::table('leaves')
                ->where('created_at', '>=', $start)
                ->select(
                    DB::raw('COUNT(*) as total'),
                    DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved'),
                    DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending'),
                    DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected'),
                    DB::raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled'),
                    DB::raw('AVG(DATEDIFF(to_date, from_date) + 1) as avg_days_per_request')
                )
                ->first();

            $approvalRate = ($overview->total ?? 0) > 0
                ? round((($overview->approved ?? 0) / $overview->total) * 100, 1)
                : 0;

            // By leave type
            $byType = DB::table('leaves')
                ->join('leave_types', 'leave_types.id', '=', 'leaves.leave_type_id')
                ->where('leaves.created_at', '>=', $start)
                ->select(
                    'leave_types.name as type',
                    DB::raw('COUNT(*) as requests'),
                    DB::raw('SUM(DATEDIFF(to_date, from_date) + 1) as total_days'),
                    DB::raw('SUM(CASE WHEN leaves.status = "approved" THEN 1 ELSE 0 END) as approved')
                )
                ->groupBy('leave_types.id', 'leave_types.name')
                ->orderByDesc('requests')
                ->get();

            // By department
            $byDept = DB::table('leaves')
                ->join('employees', 'employees.id', '=', 'leaves.employee_id')
                ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
                ->where('leaves.created_at', '>=', $start)
                ->whereNull('employees.deleted_at')
                ->select(
                    DB::raw('COALESCE(departments.name,"Unassigned") as dept'),
                    DB::raw('COUNT(*) as requests'),
                    DB::raw('SUM(DATEDIFF(to_date, from_date) + 1) as total_days')
                )
                ->groupBy('dept')
                ->orderByDesc('requests')
                ->get();

            // Monthly trend
            $monthlyTrend = DB::table('leaves')
                ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
                ->select(
                    DB::raw('DATE_FORMAT(from_date, "%b %Y") as month'),
                    DB::raw('COUNT(*) as requests'),
                    DB::raw('SUM(DATEDIFF(to_date, from_date) + 1) as total_days'),
                    DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved')
                )
                ->groupBy(DB::raw('DATE_FORMAT(from_date, "%b %Y")'), DB::raw('DATE_FORMAT(from_date, "%Y%m")'))
                ->orderBy(DB::raw('DATE_FORMAT(from_date, "%Y%m")'))
                ->get();

            // Avg approval time (days from created_at to approved_at)
            $avgApprovalDays = DB::table('leaves')
                ->where('created_at', '>=', $start)
                ->where('status', 'approved')
                ->whereNotNull('approved_at')
                ->avg(DB::raw('DATEDIFF(approved_at, created_at)'));

            return [
                'overview' => [
                    'total'           => (int)($overview->total ?? 0),
                    'approved'        => (int)($overview->approved ?? 0),
                    'pending'         => (int)($overview->pending ?? 0),
                    'rejected'        => (int)($overview->rejected ?? 0),
                    'cancelled'       => (int)($overview->cancelled ?? 0),
                    'avg_days'        => round((float)($overview->avg_days_per_request ?? 0), 1),
                    'approval_rate'   => $approvalRate,
                    'avg_approval_days' => round((float)($avgApprovalDays ?? 0), 1),
                ],
                'by_type'     => $byType,
                'by_dept'     => $byDept,
                'monthly_trend' => $monthlyTrend,
            ];
        } catch (\Exception $e) {
            \Log::error('LeaveAnalytics: ' . $e->getMessage());
            return $this->emptyLeave();
        }
    }

    // ─── Workforce Forecast ────────────────────────────────────────────────────

    public function getWorkforceForecast(): array
    {
        $history   = $this->getEmployeeGrowthTrends(Carbon::now()->subYear());
        $recent    = array_slice($history, -6);
        $rates     = [];
        for ($i = 1; $i < count($recent); $i++) {
            $prev = $recent[$i - 1]['total_employees'];
            $curr = $recent[$i]['total_employees'];
            if ($prev > 0) $rates[] = (($curr - $prev) / $prev) * 100;
        }
        $avgRate = count($rates) > 0 ? array_sum($rates) / count($rates) : 0;
        $current = end($history)['total_employees'] ?? 0;

        $predictions = [];
        for ($i = 1; $i <= 6; $i++) {
            $predictions[] = round($current * pow(1 + ($avgRate / 100), $i));
        }

        // Confidence based on data consistency (lower std-dev = higher confidence)
        $stdDev     = count($rates) > 1 ? sqrt(array_sum(array_map(fn($r) => pow($r - $avgRate, 2), $rates)) / count($rates)) : 50;
        $confidence = max(30, min(95, round(90 - ($stdDev * 2))));

        return ['current_count' => $current, 'growth_rate' => round($avgRate, 2), 'predictions' => $predictions, 'confidence' => $confidence];
    }

    // ─── Risk Assessment ──────────────────────────────────────────────────────

    public function getRiskAssessment(): array
    {
        try {
            $attritionRisk = Schema::hasTable('competency_assessments')
                ? DB::table('employees')
                    ->join('competency_assessments', 'employees.id', '=', 'competency_assessments.employee_id')
                    ->where('competency_assessments.rating', '<', 3)
                    ->where('competency_assessments.created_at', '>=', Carbon::now()->subMonths(6))
                    ->whereNull('employees.deleted_at')
                    ->where('employees.status', 'active')
                    ->distinct('employees.id')->count()
                : 0;

            $perfConcerns = Schema::hasTable('competency_assessments')
                ? DB::table('competency_assessments')
                    ->where('rating', '<', 3)
                    ->whereIn('status', ['approved', 'submitted'])
                    ->where('created_at', '>=', Carbon::now()->subMonths(3))
                    ->distinct('employee_id')->count()
                : 0;

            $skillGaps = (Schema::hasTable('competencies') && Schema::hasTable('competency_assessments'))
                ? DB::table('competencies')
                    ->join('competency_assessments', 'competencies.id', '=', 'competency_assessments.competency_id')
                    ->whereIn('competency_assessments.status', ['approved', 'submitted'])
                    ->select('competencies.id', DB::raw('AVG(competency_assessments.rating) as avg_rating'))
                    ->groupBy('competencies.id')
                    ->having('avg_rating', '<', 3)
                    ->get()->count()
                : 0;

            // Leave-based risk: employees with many pending leaves
            $leaveRisk = Schema::hasTable('leaves')
                ? DB::table('leaves')
                    ->where('status', 'pending')
                    ->where('created_at', '>=', Carbon::now()->subMonths(3))
                    ->distinct('employee_id')->count()
                : 0;

            $total    = DB::table('employees')->where('status', 'active')->whereNull('deleted_at')->count();
            $overall  = $total > 0 ? round((($attritionRisk + $perfConcerns + $leaveRisk) / ($total * 3)) * 100, 1) : 0;

            return compact('attritionRisk', 'perfConcerns', 'skillGaps', 'leaveRisk', 'overall') + [
                'high_attrition_risk'  => $attritionRisk,
                'performance_concerns' => $perfConcerns,
                'skill_gaps'           => $skillGaps,
                'overall_risk_score'   => $overall,
            ];
        } catch (\Exception $e) {
            \Log::error('RiskAssessment: ' . $e->getMessage());
            return ['high_attrition_risk' => 0, 'performance_concerns' => 0, 'skill_gaps' => 0, 'leaveRisk' => 0, 'overall_risk_score' => 0];
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function startDate(string $range): Carbon
    {
        return match($range) {
            '7d'  => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '90d' => Carbon::now()->subDays(90),
            '1y'  => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };
    }

    // Keep old method name for backward compat
    private function getStartDateFromRange(string $range): Carbon { return $this->startDate($range); }

    private function categorizeSkill(string $name): string
    {
        $n = strtolower($name);
        $map = [
            'Technical Skills'   => ['programming','coding','development','technical','software','database','system'],
            'Leadership'         => ['leadership','management','leading','supervising','mentoring'],
            'Communication'      => ['communication','presentation','writing','speaking','negotiation'],
            'Project Management' => ['project','planning','coordination','organization','scheduling'],
            'Problem Solving'    => ['problem','analytical','critical','troubleshooting','debugging'],
            'Teamwork'           => ['teamwork','collaboration','cooperation','team','interpersonal'],
            'Innovation'         => ['innovation','creativity','creative','design','improvement'],
            'Customer Focus'     => ['customer','client','service','support','satisfaction'],
        ];
        foreach ($map as $cat => $kws) foreach ($kws as $kw) if (str_contains($n, $kw)) return $cat;
        return 'Technical Skills';
    }

    private function emptyPerformance(): array
    {
        return ['distribution' => ['excellent' => 0, 'good' => 0, 'average' => 0, 'needs_improvement' => 0], 'department_performance' => [], 'skills_analysis' => [], 'avg_score' => 0, 'total_assessments' => 0];
    }

    private function emptySkillsMatrix(): array
    {
        $cats = ['Technical Skills','Leadership','Communication','Project Management','Problem Solving','Teamwork','Innovation','Customer Focus'];
        return array_fill_keys($cats, ['expert' => 0, 'proficient' => 0, 'needs_development' => 0]);
    }

    private function emptyWorkReports(): array
    {
        return ['totals' => ['calls' => 0, 'emails' => 0, 'whatsapp' => 0, 'followups' => 0, 'interested' => 0, 'not_interested' => 0, 'voicemails' => 0, 'missed' => 0, 'report_count' => 0], 'conversion_rate' => 0, 'daily_trend' => [], 'monthly_trend' => [], 'top_performers' => [], 'dept_breakdown' => []];
    }

    private function emptySkillTests(): array
    {
        return ['overview' => ['total_attempts' => 0, 'completed' => 0, 'avg_score' => 0, 'pass_rate' => 0, 'passed' => 0], 'score_distribution' => ['excellent' => 0, 'good' => 0, 'pass' => 0, 'fail' => 0], 'test_performance' => [], 'category_breakdown' => [], 'top_scorers' => [], 'monthly_trend' => []];
    }

    private function emptyLeave(): array
    {
        return ['overview' => ['total' => 0, 'approved' => 0, 'pending' => 0, 'rejected' => 0, 'cancelled' => 0, 'avg_days' => 0, 'approval_rate' => 0, 'avg_approval_days' => 0], 'by_type' => [], 'by_dept' => [], 'monthly_trend' => []];
    }
}
