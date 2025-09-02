<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaveTypeController extends Controller
{
    /**
     * Display a listing of leave types.
     */
    public function index()
    {
        $this->authorize('viewAny', LeaveType::class);

        $leaveTypes = LeaveType::withCount('leaves')
            ->orderBy('name')
            ->get()
            ->map(function ($leaveType) {
                return [
                    'id' => $leaveType->id,
                    'name' => $leaveType->name,
                    'quota' => $leaveType->quota,
                    'description' => $leaveType->description ?? '',
                    'is_active' => $leaveType->is_active ?? true,
                    'requires_approval' => $leaveType->requires_approval ?? true,
                    'max_consecutive_days' => $leaveType->max_consecutive_days,
                    'min_notice_days' => $leaveType->min_notice_days,
                    'carry_forward' => $leaveType->carry_forward ?? false,
                    'leaves_count' => $leaveType->leaves_count ?? 0,
                    'created_at' => $leaveType->created_at,
                    'updated_at' => $leaveType->updated_at,
                ];
            });

        return Inertia::render('LeaveTypes/Index', [
            'leaveTypes' => $leaveTypes,
            'canCreate' => Auth::user()->can('create', LeaveType::class),
        ]);
    }

    /**
     * Show the form for creating a new leave type.
     */
    public function create()
    {
        $this->authorize('create', LeaveType::class);

        return Inertia::render('LeaveTypes/Create');
    }

    /**
     * Store a newly created leave type.
     */
    public function store(Request $request)
    {
        $this->authorize('create', LeaveType::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:leave_types,name',
            'quota' => 'required|integer|min:0|max:365',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'requires_approval' => 'boolean',
            'max_consecutive_days' => 'nullable|integer|min:1|max:365',
            'min_notice_days' => 'nullable|integer|min:0|max:365',
            'carry_forward' => 'boolean',
        ]);

        $leaveType = LeaveType::create($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type created successfully.');
    }

    /**
     * Display the specified leave type.
     */
    public function show(LeaveType $leaveType)
    {
        $this->authorize('view', $leaveType);

        // Load recent leaves separately to avoid MariaDB compatibility issues
        $recentLeaves = $leaveType->leaves()
            ->with(['employee.user'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        
        $leaveType->setRelation('leaves', $recentLeaves);

        return Inertia::render('LeaveTypes/Show', [
            'leaveType' => $leaveType,
            'canEdit' => Auth::user()->can('update', $leaveType),
            'canDelete' => Auth::user()->can('delete', $leaveType),
        ]);
    }

    /**
     * Show the form for editing the specified leave type.
     */
    public function edit(LeaveType $leaveType)
    {
        $this->authorize('update', $leaveType);

        // Load pending leaves separately to avoid MariaDB compatibility issues
        $pendingLeaves = $leaveType->leaves()
            ->where('status', 'pending')
            ->with(['employee.user'])
            ->get();
        
        $leaveType->setRelation('leaves', $pendingLeaves);

        return Inertia::render('LeaveTypes/Edit', [
            'leaveType' => $leaveType,
        ]);
    }

    /**
     * Update the specified leave type.
     */
    public function update(Request $request, LeaveType $leaveType)
    {
        $this->authorize('update', $leaveType);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:leave_types,name,' . $leaveType->id,
            'quota' => 'required|integer|min:0|max:365',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'requires_approval' => 'boolean',
            'max_consecutive_days' => 'nullable|integer|min:1|max:365',
            'min_notice_days' => 'nullable|integer|min:0|max:365',
            'carry_forward' => 'boolean',
        ]);

        $leaveType->update($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type updated successfully.');
    }

    /**
     * Remove the specified leave type.
     */
    public function destroy(LeaveType $leaveType)
    {
        $this->authorize('delete', $leaveType);

        // Check if there are any leaves using this type
        if ($leaveType->leaves()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete leave type that has associated leave records.');
        }

        $leaveType->delete();

        return redirect()->route('leave-types.index')
            ->with('success', 'Leave type deleted successfully.');
    }

    /**
     * Toggle the active status of a leave type.
     */
    public function toggleStatus(LeaveType $leaveType)
    {
        $this->authorize('update', $leaveType);

        $leaveType->update([
            'is_active' => !$leaveType->is_active
        ]);

        $status = $leaveType->is_active ? 'activated' : 'deactivated';

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Leave type {$status} successfully.",
                'leaveType' => $leaveType->fresh()
            ]);
        }

        return redirect()->back()
            ->with('success', "Leave type {$status} successfully.");
    }
}