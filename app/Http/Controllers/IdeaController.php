<?php

namespace App\Http\Controllers;

use App\Mail\NewIdeaSubmitted;
use App\Models\Idea;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class IdeaController extends Controller
{
    // ── List (employee: own only; admin/hr: all) ──────────────────────────────
    public function index(Request $request)
    {
        $user      = Auth::user();
        $isManager = $user->hasAnyRole(['Admin', 'HR', 'Manager']);

        $query = Idea::with(['user:id,name', 'reviewer:id,name'])
            ->withCount('voters as vote_count');

        if (!$isManager) {
            $query->where('user_id', $user->id);
        }

        // Filters
        if ($request->filled('category')) $query->where('category', $request->category);
        if ($request->filled('status'))   $query->where('status',   $request->status);
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(fn($qb) => $qb->where('title', 'like', "%$q%")->orWhere('description', 'like', "%$q%"));
        }

        $ideas = $query->orderByDesc('vote_count')->orderByDesc('created_at')->paginate(12)->withQueryString();

        // Add hasVoted flag
        $votedIds = $user->ideas_voted ?? [];
        $ideas->getCollection()->transform(function ($idea) use ($user) {
            $idea->has_voted = $idea->voters()->where('user_id', $user->id)->exists();
            return $idea;
        });

        // Stats
        $statsBase = $isManager ? Idea::query() : Idea::where('user_id', $user->id);
        $stats = [
            'total'       => (clone $statsBase)->count(),
            'implemented' => (clone $statsBase)->where('status', 'implemented')->count(),
            'approved'    => (clone $statsBase)->where('status', 'approved')->count(),
            'pending'     => (clone $statsBase)->where('status', 'pending')->count(),
        ];

        return Inertia::render('Ideas/Index', [
            'ideas'      => $ideas,
            'stats'      => $stats,
            'categories' => Idea::$categories,
            'statuses'   => Idea::$statuses,
            'filters'    => $request->only(['category', 'status', 'search']),
            'isManager'  => $isManager,
        ]);
    }

    // ── Submit new idea ───────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'required|string|min:20|max:2000',
            'category'    => 'required|in:' . implode(',', array_keys(Idea::$categories)),
        ]);

        $validated['user_id'] = Auth::id();
        $validated['status']  = 'pending';

        $idea = Idea::create($validated);

        // Email all Admin + HR users via existing SMTP (support@xonixs.com)
        $recipients = User::role(['Admin', 'HR'])->get();
        foreach ($recipients as $admin) {
            try {
                Mail::to($admin->email)->send(new NewIdeaSubmitted($idea, Auth::user()));
            } catch (\Exception $e) {
                \Log::warning('[IdeaBox] Failed to email ' . $admin->email . ': ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Your idea has been submitted! Thank you for contributing.');
    }

    // ── Update own idea ───────────────────────────────────────────────────────
    public function update(Request $request, Idea $idea)
    {
        abort_unless($idea->user_id === Auth::id(), 403);
        abort_unless(in_array($idea->status, ['pending', 'under_review']), 422);

        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'required|string|min:20|max:2000',
            'category'    => 'required|in:' . implode(',', array_keys(Idea::$categories)),
        ]);

        $idea->update($validated);
        return back()->with('success', 'Your idea has been updated.');
    }

    // ── Vote / un-vote ────────────────────────────────────────────────────────
    public function vote(Idea $idea)
    {
        $user = Auth::user();

        if ($idea->user_id === $user->id) {
            return back()->with('error', 'You cannot vote on your own idea.');
        }

        $voted = $idea->voters()->where('user_id', $user->id)->exists();
        if ($voted) {
            $idea->voters()->detach($user->id);
            $idea->decrement('votes');
        } else {
            $idea->voters()->attach($user->id);
            $idea->increment('votes');
        }

        return back();
    }

    // ── Admin: update status + notes ──────────────────────────────────────────
    public function updateStatus(Request $request, Idea $idea)
    {
        $user = Auth::user();
        abort_unless($user->hasAnyRole(['Admin', 'HR']), 403);

        $validated = $request->validate([
            'status'      => 'required|in:' . implode(',', array_keys(Idea::$statuses)),
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $idea->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $idea->admin_notes,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Idea status updated.');
    }

    // ── Delete (own only, or admin) ───────────────────────────────────────────
    public function destroy(Idea $idea)
    {
        $user = Auth::user();
        abort_unless($idea->user_id === $user->id || $user->hasAnyRole(['Admin', 'HR']), 403);
        $idea->delete();
        return back()->with('success', 'Idea removed.');
    }
}
