<?php

namespace App\Http\Controllers;

use App\Mail\ReferralSubmitted;
use App\Mail\ReferralStatusUpdated;
use App\Models\Referral;
use App\Models\User;
use App\Traits\AuditLogTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    use AuditLogTrait;

    // ── Employee: list own referrals ──────────────────────────────────────────

    public function index(Request $request): Response
    {
        $user    = Auth::user();
        $isAdmin = $user->hasAnyRole(['Admin', 'HR']);

        $query = Referral::with(['referrer', 'reviewer'])
            ->orderByDesc('created_at');

        if (!$isAdmin) {
            // Employees see only their own referrals
            $query->where('referred_by', $user->id);
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('candidate_name', 'like', "%{$search}%")
                  ->orWhere('candidate_email', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $referrals = $query->paginate(15)->withQueryString();

        return Inertia::render('Referrals/Index', [
            'referrals'   => $referrals,
            'queryParams' => $request->query(),
            'canManage'   => $isAdmin,
            'statuses'    => $this->statusOptions(),
        ]);
    }

    // ── Employee: show referral form ──────────────────────────────────────────

    public function create(): Response
    {
        return Inertia::render('Referrals/Create');
    }

    // ── Employee: submit referral ─────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'candidate_name'  => 'required|string|max:255',
            'candidate_email' => 'required|email|max:255',
            'candidate_phone' => 'nullable|string|max:30',
            'position'        => 'required|string|max:255',
            'department'      => 'nullable|string|max:255',
            'relationship'    => 'required|string|max:500',
            'note'            => 'nullable|string|max:1000',
            'resume'          => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('referrals/resumes', 'public');
        }

        $referral = Referral::create([
            ...$validated,
            'referred_by' => Auth::id(),
            'resume_path' => $resumePath,
            'status'      => 'submitted',
        ]);

        $referral->load('referrer');

        // Notify Admin / HR
        $admins = User::whereHas('roles', fn($q) => $q->whereIn('name', ['Admin', 'HR']))->get();
        foreach ($admins as $admin) {
            Mail::to($admin->email)->queue(new ReferralSubmitted($referral));
        }

        $this->logAudit('Referral Submitted', "Submitted referral for {$referral->candidate_name} — {$referral->position}");

        return redirect()->route('referrals.index')
            ->with('success', 'Your referral has been submitted successfully!');
    }

    // ── Admin/HR: show referral detail ────────────────────────────────────────

    public function show(Referral $referral): Response
    {
        $this->authorizeManage($referral);

        $referral->load(['referrer', 'reviewer']);

        return Inertia::render('Referrals/Show', [
            'referral' => $referral,
            'statuses' => $this->statusOptions(),
        ]);
    }

    // ── Admin/HR: update status ───────────────────────────────────────────────

    public function updateStatus(Request $request, Referral $referral): RedirectResponse
    {
        abort_unless(Auth::user()->hasAnyRole(['Admin', 'HR']), 403);

        $validated = $request->validate([
            'status'      => 'required|in:submitted,under_review,shortlisted,interviewed,hired,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $oldStatus = $referral->status;

        $referral->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $referral->admin_notes,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // Notify referrer if status changed
        if ($oldStatus !== $validated['status']) {
            $referral->load('referrer', 'reviewer');
            Mail::to($referral->referrer->email)->queue(new ReferralStatusUpdated($referral));
        }

        $this->logAudit('Referral Status Updated', "Updated referral #{$referral->id} to {$validated['status']}");

        return back()->with('success', 'Referral status updated.');
    }

    // ── Employee: delete own referral (only if still submitted) ──────────────

    public function destroy(Referral $referral): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->hasAnyRole(['Admin', 'HR']) && $referral->referred_by !== $user->id) {
            abort(403);
        }

        if (!in_array($referral->status, ['submitted']) && !$user->hasAnyRole(['Admin', 'HR'])) {
            return back()->with('error', 'You can only delete referrals that are still in Submitted status.');
        }

        if ($referral->resume_path) {
            Storage::disk('public')->delete($referral->resume_path);
        }

        $referral->delete();

        $this->logAudit('Referral Deleted', "Deleted referral #{$referral->id}");

        return redirect()->route('referrals.index')->with('success', 'Referral deleted.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeManage(Referral $referral): void
    {
        $user = Auth::user();
        if (!$user->hasAnyRole(['Admin', 'HR']) && $referral->referred_by !== $user->id) {
            abort(403);
        }
    }

    private function statusOptions(): array
    {
        return [
            ['value' => 'submitted',    'label' => 'Submitted',    'color' => 'blue'],
            ['value' => 'under_review', 'label' => 'Under Review', 'color' => 'yellow'],
            ['value' => 'shortlisted',  'label' => 'Shortlisted',  'color' => 'purple'],
            ['value' => 'interviewed',  'label' => 'Interviewed',  'color' => 'indigo'],
            ['value' => 'hired',        'label' => 'Hired',        'color' => 'green'],
            ['value' => 'rejected',     'label' => 'Rejected',     'color' => 'red'],
        ];
    }
}
