<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class FeedbackController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);
        $query = Feedback::query();

        $isManager = $user->hasRole('Admin') || $user->hasRole('HR') || $user->hasRole('Manager');

        if ($isManager) {
            $query->with(['reviewer', 'reviewee']);
        } else {
            $query->where(function($q) use ($user) {
                $q->where('reviewee_id', $user->id)->orWhere('reviewer_id', $user->id);
            })->with(['reviewer', 'reviewee']);
        }

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('reviewer', function ($uq) use ($search) {
                    $uq->where('name', 'like', '%' . $search . '%')
                       ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orWhereHas('reviewee', function ($uq) use ($search) {
                    $uq->where('name', 'like', '%' . $search . '%')
                       ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orWhere('period', 'like', '%' . $search . '%')
                ->orWhere('comments', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->get('rating'));
        }

        if ($request->filled('period')) {
            $query->where('period', $request->get('period'));
        }

        // Date filtering
        if ($request->filled('date_from')) {
            $dateFrom = $request->get('date_from');
            $query->where('created_at', '>=', $dateFrom);
        }
        
        if ($request->filled('date_to')) {
            $dateTo = $request->get('date_to');
            $query->where('created_at', '<=', $dateTo . ' 23:59:59');
        }

        // Sentiment filtering
        if ($request->filled('sentiments')) {
            $sentiments = explode(',', $request->get('sentiments'));
            $query->where(function($q) use ($sentiments) {
                foreach ($sentiments as $sentiment) {
                    if ($sentiment === 'positive') {
                        $q->orWhere('rating', '>=', 4);
                    } elseif ($sentiment === 'neutral') {
                        $q->orWhere('rating', '=', 3);
                    } elseif ($sentiment === 'negative') {
                        $q->orWhere('rating', '<=', 2);
                    }
                }
            });
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        // Calculate feedback statistics
        $statsQuery = Feedback::query();
        if (!$isManager) {
            $statsQuery->where(function($q) use ($user) {
                $q->where('reviewee_id', $user->id)->orWhere('reviewer_id', $user->id);
            });
        }

        $feedbackStats = [
            'total' => $statsQuery->count(),
            'averageRating' => number_format($statsQuery->avg('rating') ?? 0, 1),
            'thisMonth' => $statsQuery->whereMonth('created_at', now()->month)
                                    ->whereYear('created_at', now()->year)
                                    ->count(),
            'positiveTrend' => $statsQuery->where('rating', '>=', 4)->count() > 0 
                ? round(($statsQuery->where('rating', '>=', 4)->count() / $statsQuery->count()) * 100) . '%'
                : '0%'
        ];

        return Inertia::render('Feedbacks/Index', [
            'feedbacks' => $feedbacks,
            'queryParams' => $request->query(),
            'feedbackStats' => $feedbackStats
        ]);
    }

    public function create()
    {
        $this->authorize('create', Feedback::class);
        
        $users = User::all();
        return Inertia::render('Feedbacks/Create', ['users' => $users]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Feedback::class);
        
        $validated = $request->validate([
            'reviewee_id' => 'required|exists:users,id',
            'period' => 'required|string|max:255',
            'comments' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $validated['reviewer_id'] = Auth::id();

        Feedback::create($validated);

        $this->logAudit('Feedback Created', 'Created feedback for reviewee ID: ' . $validated['reviewee_id']);
        return redirect()->route('feedbacks.index')->with('success', 'Feedback submitted.');
    }

    public function show(Feedback $feedback)
    {
        $feedback->load(['reviewer', 'reviewee']);
        return Inertia::render('Feedbacks/Show', ['feedback' => $feedback]);
    }

    public function edit(Feedback $feedback)
    {
        $this->authorize('update', $feedback);
        $users = User::all();
        return Inertia::render('Feedbacks/Edit', ['feedback' => $feedback, 'users' => $users]);
    }

    public function update(Request $request, Feedback $feedback)
    {
        $this->authorize('update', $feedback);

        $validated = $request->validate([
            'reviewee_id' => 'sometimes|exists:users,id',
            'period' => 'sometimes|string|max:255',
            'comments' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $feedback->update($validated);

        $this->logAudit('Feedback Updated', 'Updated feedback ID: ' . $feedback->id);
        return redirect()->route('feedbacks.index')->with('success', 'Feedback updated.');
    }

    public function destroy(Feedback $feedback)
    {
        $this->authorize('delete', $feedback);

        $feedback->delete();

        $this->logAudit('Feedback Deleted', 'Deleted feedback ID: ' . $feedback->id);
        return redirect()->route('feedbacks.index')->with('success', 'Feedback deleted.');
    }
}
