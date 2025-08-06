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

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('HR') || $user->hasRole('Manager')) {
            $feedbacks = Feedback::with(['reviewer', 'reviewee'])->paginate(10);
        } else {
            $feedbacks = Feedback::where('reviewee_id', $user->id)->orWhere('reviewer_id', $user->id)->with(['reviewer', 'reviewee'])->paginate(10);
        }
        return Inertia::render('Feedbacks/Index', ['feedbacks' => $feedbacks]);
    }

    public function create()
    {
        $users = User::all();
        return Inertia::render('Feedbacks/Create', ['users' => $users]);
    }

    public function store(Request $request)
    {
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
