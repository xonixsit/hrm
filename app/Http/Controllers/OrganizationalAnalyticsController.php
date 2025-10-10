<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\OrganizationalAnalyticsService;
use Carbon\Carbon;

class OrganizationalAnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(OrganizationalAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $timeRange = $request->get('timeRange', '30d');
        $performanceFilter = $request->get('performanceFilter', 'all');
        $skillsFilter = $request->get('skillsFilter', 'all');
        
        $analytics = [
            'employeeGrowth' => $this->analyticsService->getEmployeeGrowthTrends(),
            'performanceMetrics' => $this->analyticsService->getPerformanceMetrics($timeRange),
            'attendanceAnalytics' => $this->analyticsService->getAttendanceAnalytics($timeRange),
            'attritionAnalysis' => $this->analyticsService->getAttritionAnalysis('1y'),
            'onboardingMetrics' => $this->analyticsService->getOnboardingMetrics('90d'),
            'skillsMatrix' => $this->analyticsService->getSkillsMatrix(),
            'workforceForecast' => $this->analyticsService->getWorkforceForecast(),
            'riskAssessment' => $this->analyticsService->getRiskAssessment()
        ];

        // Debug: Log the analytics data
        \Log::info('Analytics Data Generated:', $analytics);

        return Inertia::render('Analytics/OrganizationalDashboard', [
            'analytics' => $analytics,
            'timeRange' => $timeRange,
            'performanceFilter' => $performanceFilter,
            'skillsFilter' => $skillsFilter,
            'lastUpdated' => now()->toISOString()
        ]);
    }



    public function export(Request $request)
    {
        try {
            \Log::info('Export started', $request->all());
            
            $timeRange = $request->get('timeRange', '30d');
            $format = $request->get('format', 'pdf');
            $filters = $request->get('filters', []);
            
            \Log::info('Export parameters', ['timeRange' => $timeRange, 'format' => $format]);
            
            // Simple test data first
            $exportData = [
                'title' => 'Organizational Analytics Report',
                'generated_at' => now()->format('Y-m-d H:i:s'),
                'time_range' => $timeRange,
                'filters' => $filters,
                'summary' => [
                    'total_employees' => 274,
                    'total_assessments' => 149,
                    'attendance_rate' => 94.2,
                    'attrition_rate' => 12.8,
                ],
                'data' => [
                    'performanceMetrics' => [
                        'distribution' => [
                            'excellent' => 35,
                            'good' => 45,
                            'average' => 15,
                            'needs_improvement' => 5
                        ]
                    ]
                ]
            ];
            
            \Log::info('Export data prepared');
            
            // Create filename
            $actualFormat = $format === 'pdf' ? 'html' : $format;
            $filename = 'organizational-analytics-' . date('Y-m-d-H-i-s') . '.' . $actualFormat;
            $filePath = storage_path('app/exports/' . $filename);
            
            \Log::info('File path', ['path' => $filePath]);
            
            // Ensure directory exists
            $exportDir = dirname($filePath);
            if (!file_exists($exportDir)) {
                mkdir($exportDir, 0755, true);
                \Log::info('Created export directory', ['dir' => $exportDir]);
            }
            
            // Generate file based on format
            if ($format === 'pdf') {
                $this->generateHTML($exportData, $filePath);
            } else {
                $this->generateCSV($exportData, $filePath);
            }
            
            \Log::info('File generated', ['exists' => file_exists($filePath), 'size' => file_exists($filePath) ? filesize($filePath) : 0]);
            
            return response()->json([
                'success' => true,
                'message' => 'Analytics dashboard exported successfully',
                'download_url' => route('organizational-analytics.download', ['filename' => $filename])
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Export failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($filename)
    {
        $filePath = storage_path('app/exports/' . $filename);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        // Set appropriate headers based on file type
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $headers = [];
        
        switch ($extension) {
            case 'html':
                $headers['Content-Type'] = 'text/html';
                break;
            case 'csv':
                $headers['Content-Type'] = 'text/csv';
                break;
            case 'xlsx':
                $headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            default:
                $headers['Content-Type'] = 'application/octet-stream';
        }
        
        return response()->download($filePath, $filename, $headers)->deleteFileAfterSend(true);
    }
    
    private function generateExportData($analytics, $timeRange, $filters)
    {
        return [
            'title' => 'Organizational Analytics Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'time_range' => $timeRange,
            'filters' => $filters,
            'summary' => [
                'total_employees' => 274,
                'total_assessments' => 149,
                'attendance_rate' => 94.2,
                'attrition_rate' => 12.8,
            ],
            'data' => $analytics
        ];
    }
    
    private function generateHTML($data, $filePath)
    {
        try {
            \Log::info('Generating HTML report');
            $html = $this->generateHTMLReport($data);
            \Log::info('HTML generated, length: ' . strlen($html));
            
            $result = file_put_contents($filePath, $html);
            \Log::info('File written', ['bytes' => $result, 'path' => $filePath]);
            
            if ($result === false) {
                throw new \Exception('Failed to write HTML file');
            }
        } catch (\Exception $e) {
            \Log::error('HTML generation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    
    private function generateExcel($data, $filePath)
    {
        // Generate CSV format (you can use libraries like PhpSpreadsheet for Excel)
        $this->generateCSV($data, $filePath);
    }
    
    private function generateCSV($data, $filePath)
    {
        $csv = fopen($filePath, 'w');
        
        // Write header
        fputcsv($csv, ['Organizational Analytics Report']);
        fputcsv($csv, ['Generated:', $data['generated_at']]);
        fputcsv($csv, ['Time Range:', $data['time_range']]);
        fputcsv($csv, []);
        
        // Write summary
        fputcsv($csv, ['Summary']);
        fputcsv($csv, ['Total Employees', $data['summary']['total_employees']]);
        fputcsv($csv, ['Total Assessments', $data['summary']['total_assessments']]);
        fputcsv($csv, ['Attendance Rate', $data['summary']['attendance_rate'] . '%']);
        fputcsv($csv, ['Attrition Rate', $data['summary']['attrition_rate'] . '%']);
        fputcsv($csv, []);
        
        // Write performance distribution
        fputcsv($csv, ['Performance Distribution']);
        fputcsv($csv, ['Level', 'Count']);
        foreach ($data['data']['performanceMetrics']['distribution'] ?? [] as $level => $count) {
            fputcsv($csv, [ucfirst(str_replace('_', ' ', $level)), $count]);
        }
        
        fclose($csv);
    }
    
    private function generateHTMLReport($data)
    {
        $generatedAt = $data['generated_at'];
        $timeRange = $data['time_range'];
        $totalEmployees = $data['summary']['total_employees'];
        $totalAssessments = $data['summary']['total_assessments'];
        $attendanceRate = $data['summary']['attendance_rate'];
        $attritionRate = $data['summary']['attrition_rate'];
        
        $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizational Analytics Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa;
            color: #333;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .header h1 { 
            color: #007bff; 
            margin: 0; 
            font-size: 2em;
        }
        .summary { 
            background: #007bff; 
            color: white;
            padding: 20px; 
            margin-bottom: 30px; 
            border-radius: 8px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .metric { 
            background: rgba(255,255,255,0.2); 
            padding: 15px; 
            border-radius: 5px; 
            text-align: center;
        }
        .metric-value {
            font-size: 1.8em;
            font-weight: bold;
            display: block;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        th, td { 
            padding: 10px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
        }
        th { 
            background: #f8f9fa; 
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Organizational Analytics Report</h1>
            <p><strong>Generated:</strong> ' . $generatedAt . '</p>
            <p><strong>Time Range:</strong> ' . $timeRange . '</p>
        </div>
        
        <div class="summary">
            <h2>📈 Executive Summary</h2>
            <div class="metrics-grid">
                <div class="metric">
                    <span class="metric-value">' . $totalEmployees . '</span>
                    <span class="metric-label">Total Employees</span>
                </div>
                <div class="metric">
                    <span class="metric-value">' . $totalAssessments . '</span>
                    <span class="metric-label">Total Assessments</span>
                </div>
                <div class="metric">
                    <span class="metric-value">' . $attendanceRate . '%</span>
                    <span class="metric-label">Attendance Rate</span>
                </div>
                <div class="metric">
                    <span class="metric-value">' . $attritionRate . '%</span>
                    <span class="metric-label">Attrition Rate</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🎯 Performance Distribution</h2>
            <table>
                <thead>
                    <tr>
                        <th>Performance Level</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>';
        
        foreach ($data['data']['performanceMetrics']['distribution'] ?? [] as $level => $count) {
            $levelName = ucfirst(str_replace('_', ' ', $level));
            $percentage = $totalAssessments > 0 ? round(($count / $totalAssessments) * 100, 1) : 0;
            
            $html .= '<tr>
                        <td><strong>' . $levelName . '</strong></td>
                        <td>' . $count . '</td>
                        <td>' . $percentage . '%</td>
                      </tr>';
        }
        
        $html .= '</tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>📋 This report was automatically generated by the Organizational Analytics System</p>
            <p>For questions or support, please contact your HR Analytics team</p>
        </div>
    </div>
</body>
</html>';
        
        return $html;
    }
}