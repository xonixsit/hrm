<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompetencyController extends Controller
{
    /**
     * Display a listing of competencies with filtering and search.
     */
    public function index(Request $request): Response
    {
        $query = Competency::with(['department', 'creator', 'updater'])
            ->withCount('assessments');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('role_specific')) {
            $query->where('role_specific', $request->boolean('role_specific'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $competencies = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Competencies/Index', [
            'competencies' => $competencies,
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'categories' => $this->getCompetencyCategories(),
            'filters' => $request->only(['category', 'department_id', 'is_active', 'role_specific', 'search', 'sort_by', 'sort_order']),
            'stats' => $this->getCompetencyStats()
        ]);
    }

    /**
     * Show the form for creating a new competency.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Competencies/Create', [
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'categories' => $this->getCompetencyCategories(),
            'defaultRatingGuidelines' => $this->getDefaultRatingGuidelines()
        ]);
    }

    /**
     * Store a newly created competency.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:competencies,name',
            'description' => 'nullable|string|max:2000',
            'category' => [
                'required',
                'string',
                Rule::in($this->getCompetencyCategories())
            ],
            'weight' => 'required|numeric|between:0.1,5.0',
            'measurement_indicators' => 'nullable|array',
            'measurement_indicators.*' => 'string|max:500',
            'rating_guidelines' => 'nullable|array',
            'rating_guidelines.*.rating' => 'required|integer|between:1,5',
            'rating_guidelines.*.description' => 'required|string|max:500',
            'department_id' => 'nullable|exists:departments,id',
            'role_specific' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();

        // Set default rating guidelines if not provided
        if (empty($validated['rating_guidelines'])) {
            $validated['rating_guidelines'] = $this->getDefaultRatingGuidelines();
        }

        $competency = Competency::create($validated);

        return redirect()->route('competencies.index')
            ->with('success', 'Competency created successfully.');
    }

    /**
     * Display the specified competency with related data.
     */
    public function show(Competency $competency): Response
    {
        $competency->load(['department', 'creator', 'updater', 'assessments.employee', 'developmentPlans.employee']);

        // Get competency statistics
        $stats = [
            'total_assessments' => $competency->assessments()->count(),
            'average_rating' => $competency->assessments()->where('status', 'approved')->avg('rating') ?? 0,
            'employees_assessed' => $competency->assessments()->distinct('employee_id')->count(),
            'development_plans' => $competency->developmentPlans()->count(),
            'active_development_plans' => $competency->developmentPlans()->where('status', 'active')->count()
        ];

        return Inertia::render('Admin/Competencies/Show', [
            'competency' => $competency,
            'stats' => $stats,
            'recentAssessments' => $competency->assessments()
                ->with(['employee', 'assessor'])
                ->latest()
                ->limit(10)
                ->get()
        ]);
    }

    /**
     * Show the form for editing the specified competency.
     */
    public function edit(Competency $competency): Response
    {
        return Inertia::render('Admin/Competencies/Edit', [
            'competency' => $competency,
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'categories' => $this->getCompetencyCategories(),
            'defaultRatingGuidelines' => $this->getDefaultRatingGuidelines()
        ]);
    }

    /**
     * Update the specified competency.
     */
    public function update(Request $request, Competency $competency)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('competencies', 'name')->ignore($competency->id)
            ],
            'description' => 'nullable|string|max:2000',
            'category' => [
                'required',
                'string',
                Rule::in($this->getCompetencyCategories())
            ],
            'weight' => 'required|numeric|between:0.1,5.0',
            'measurement_indicators' => 'nullable|array',
            'measurement_indicators.*' => 'string|max:500',
            'rating_guidelines' => 'nullable|array',
            'rating_guidelines.*.rating' => 'required|integer|between:1,5',
            'rating_guidelines.*.description' => 'required|string|max:500',
            'department_id' => 'nullable|exists:departments,id',
            'role_specific' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $validated['updated_by'] = Auth::id();

        $competency->update($validated);

        return redirect()->route('competencies.show', $competency)
            ->with('success', 'Competency updated successfully.');
    }

    /**
     * Remove the specified competency from storage.
     */
    public function destroy(Competency $competency): JsonResponse
    {
        // Check if competency has assessments
        if ($competency->assessments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete competency with existing assessments. Deactivate instead.'
            ], 422);
        }

        $competency->delete();

        return response()->json([
            'message' => 'Competency deleted successfully.'
        ]);
    }

    /**
     * Toggle competency active status.
     */
    public function toggleStatus(Competency $competency): JsonResponse
    {
        $competency->update([
            'is_active' => !$competency->is_active,
            'updated_by' => Auth::id()
        ]);

        $status = $competency->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'message' => "Competency {$status} successfully.",
            'competency' => $competency
        ]);
    }

    /**
     * Get competencies by department.
     */
    public function byDepartment(Department $department): JsonResponse
    {
        $competencies = Competency::where('department_id', $department->id)
            ->orWhereNull('department_id') // Include general competencies
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($competencies);
    }

    /**
     * Get competencies by category.
     */
    public function byCategory(string $category): JsonResponse
    {
        $competencies = Competency::where('category', $category)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($competencies);
    }

    /**
     * Bulk update competency weights.
     */
    public function bulkUpdateWeights(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:competencies,id',
            'updates.*.weight' => 'required|numeric|between:0.1,5.0'
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['updates'] as $update) {
                Competency::where('id', $update['id'])->update([
                    'weight' => $update['weight'],
                    'updated_by' => Auth::id()
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Competency weights updated successfully.',
                'updated_count' => count($validated['updates'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update competency weights.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duplicate a competency.
     */
    public function duplicate(Competency $competency): JsonResponse
    {
        $newCompetency = $competency->replicate();
        $newCompetency->name = $competency->name . ' (Copy)';
        $newCompetency->created_by = Auth::id();
        $newCompetency->updated_by = Auth::id();
        $newCompetency->save();

        return response()->json([
            'message' => 'Competency duplicated successfully.',
            'competency' => $newCompetency->load(['department', 'creator'])
        ], 201);
    }

    /**
     * Export competencies to CSV.
     */
    public function export(Request $request): JsonResponse
    {
        $query = Competency::with(['department']);

        // Apply same filters as index
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $competencies = $query->get();

        $csvData = [];
        $csvData[] = ['Name', 'Category', 'Department', 'Weight', 'Active', 'Role Specific', 'Description'];

        foreach ($competencies as $competency) {
            $csvData[] = [
                $competency->name,
                $competency->category,
                $competency->department?->name ?? 'General',
                $competency->weight,
                $competency->is_active ? 'Yes' : 'No',
                $competency->role_specific ? 'Yes' : 'No',
                $competency->description
            ];
        }

        return response()->json([
            'data' => $csvData,
            'filename' => 'competencies_' . now()->format('Y-m-d_H-i-s') . '.csv'
        ]);
    }

    /**
     * Get competency framework overview.
     */
    public function framework(): Response
    {
        $categories = $this->getCompetencyCategories();
        $frameworkData = [];

        foreach ($categories as $category) {
            $competencies = Competency::where('category', $category)
                ->where('is_active', true)
                ->with(['department'])
                ->get();

            $frameworkData[$category] = [
                'competencies' => $competencies,
                'count' => $competencies->count(),
                'average_weight' => $competencies->avg('weight') ?? 0,
                'departments' => $competencies->pluck('department.name')->filter()->unique()->values()
            ];
        }

        return Inertia::render('Admin/Competencies/Framework', [
            'framework' => $frameworkData,
            'stats' => $this->getCompetencyStats(),
            'categories' => $categories
        ]);
    }

    /**
     * Get available competency categories.
     */
    private function getCompetencyCategories(): array
    {
        // Get categories from existing competencies in database
        $existingCategories = Competency::distinct('category')
            ->whereNotNull('category')
            ->pluck('category')
            ->toArray();

        // Default categories based on workplace competency framework
        $defaultCategories = [
            'Behavioral Competencies',
            'Performance Competencies', 
            'Technical Competencies',
            'Communication Competencies',
            'Learning & Development'
        ];

        // Merge existing and default categories, remove duplicates
        $allCategories = array_unique(array_merge($existingCategories, $defaultCategories));
        
        // Sort alphabetically
        sort($allCategories);
        
        return $allCategories;
    }

    /**
     * Get default rating guidelines.
     */
    private function getDefaultRatingGuidelines(): array
    {
        return [
            ['rating' => 1, 'description' => 'Poor - Significantly below expectations, requires immediate improvement'],
            ['rating' => 2, 'description' => 'Needs Improvement - Below expectations, requires development'],
            ['rating' => 3, 'description' => 'Meets Expectations - Satisfactory performance, meets job requirements'],
            ['rating' => 4, 'description' => 'Exceeds Expectations - Above average performance, demonstrates proficiency'],
            ['rating' => 5, 'description' => 'Outstanding - Exceptional performance, role model for others']
        ];
    }

    /**
     * Bulk activate competencies.
     */
    public function bulkActivate(Request $request): JsonResponse
    {
        $request->validate([
            'competency_ids' => 'required|array',
            'competency_ids.*' => 'exists:competencies,id'
        ]);

        $count = Competency::whereIn('id', $request->competency_ids)
            ->update(['is_active' => true]);

        return response()->json([
            'message' => "{$count} competencies activated successfully."
        ]);
    }

    /**
     * Bulk deactivate competencies.
     */
    public function bulkDeactivate(Request $request): JsonResponse
    {
        $request->validate([
            'competency_ids' => 'required|array',
            'competency_ids.*' => 'exists:competencies,id'
        ]);

        $count = Competency::whereIn('id', $request->competency_ids)
            ->update(['is_active' => false]);

        return response()->json([
            'message' => "{$count} competencies deactivated successfully."
        ]);
    }

    /**
     * Bulk delete competencies.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'competency_ids' => 'required|array',
            'competency_ids.*' => 'exists:competencies,id'
        ]);

        // Check if any competencies have assessments
        $competenciesWithAssessments = Competency::whereIn('id', $request->competency_ids)
            ->whereHas('assessments')
            ->pluck('name')
            ->toArray();

        if (!empty($competenciesWithAssessments)) {
            return response()->json([
                'error' => 'Cannot delete competencies with existing assessments: ' . implode(', ', $competenciesWithAssessments)
            ], 422);
        }

        $count = Competency::whereIn('id', $request->competency_ids)->delete();

        return response()->json([
            'message' => "{$count} competencies deleted successfully."
        ]);
    }

    /**
     * Get competency statistics.
     */
    private function getCompetencyStats(): array
    {
        $totalAssessments = DB::table('competency_assessments')->count();
        
        return [
            'total' => Competency::count(),
            'active' => Competency::where('is_active', true)->count(),
            'categories' => Competency::distinct('category')->whereNotNull('category')->count(),
            'assessments' => $totalAssessments,
            'department_specific' => Competency::whereNotNull('department_id')->count(),
            'role_specific' => Competency::where('role_specific', true)->count(),
            'average_weight' => round(Competency::where('is_active', true)->avg('weight') ?? 0, 2),
            'most_used' => DB::table('competency_assessments')
                ->select('competency_id', DB::raw('COUNT(*) as usage_count'))
                ->groupBy('competency_id')
                ->orderByDesc('usage_count')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $competency = Competency::find($item->competency_id);
                    return [
                        'name' => $competency->name ?? 'Unknown',
                        'usage_count' => $item->usage_count
                    ];
                })
                ->toArray()
        ];
    }
}
