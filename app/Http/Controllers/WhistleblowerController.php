<?php

namespace App\Http\Controllers;

use App\Mail\WhistleblowerReportNotification;
use App\Models\User;
use App\Models\WhistleblowerReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WhistleblowerController extends Controller
{
    // ── Employee: show submission form ────────────────────────────────────────

    public function create()
    {
        return Inertia::render('Whistleblower/Create', [
            'categories'     => WhistleblowerReport::categories(),
            'severityLevels' => WhistleblowerReport::severityLevels(),
        ]);
    }

    // ── Employee: submit report ───────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category'           => 'required|in:' . implode(',', array_keys(WhistleblowerReport::categories())),
            'subject'            => 'required|string|max:255',
            'description'        => 'required|string|min:20|max:5000',
            'severity'           => 'required|in:low,medium,high,critical',
            'is_anonymous'       => 'boolean',
            'accused_name'       => 'nullable|string|max:255',
            'accused_department' => 'nullable|string|max:255',
            'attachments.*'      => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,txt|max:10240',
        ]);

        // Handle file uploads
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('whistleblower-attachments', 'local');
                $attachmentPaths[] = [
                    'path'          => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime'          => $file->getMimeType(),
                    'size'          => $file->getSize(),
                ];
            }
        }

        $report = WhistleblowerReport::create([
            'reporter_id'        => Auth::id(),  // always stored
            'category'           => $validated['category'],
            'subject'            => $validated['subject'],
            'description'        => $validated['description'],
            'severity'           => $validated['severity'],
            'is_anonymous'       => (bool) ($validated['is_anonymous'] ?? false),
            'accused_name'       => $validated['accused_name'] ?? null,
            'accused_department' => $validated['accused_department'] ?? null,
            'attachments'        => $attachmentPaths ?: null,
            'status'             => 'pending',
        ]);

        // Notify all admins via email (queued)
        $admins = User::role('Admin')->get();
        foreach ($admins as $admin) {
            Mail::to($admin->email)->queue(new WhistleblowerReportNotification($report));
        }

        return redirect()->route('whistleblower.my-reports')
            ->with('success', 'Your report has been submitted securely.');
    }

    // ── Employee: view their own reports ──────────────────────────────────────

    public function myReports()
    {
        $reports = WhistleblowerReport::where('reporter_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($r) => [
                'id'           => $r->id,
                'report_number'=> '#' . str_pad($r->id, 6, '0', STR_PAD_LEFT),
                'category'     => WhistleblowerReport::categories()[$r->category] ?? $r->category,
                'subject'      => $r->subject,
                'description'  => $r->description,
                'severity'     => $r->severity,
                'status'       => $r->status,
                'status_label' => WhistleblowerReport::statuses()[$r->status],
                'is_anonymous' => $r->is_anonymous,
                'created_at'   => $r->created_at->format('d M Y'),
                'reviewed_at'  => $r->reviewed_at?->format('d M Y'),
                'resolved_at'  => $r->resolved_at?->format('d M Y'),
            ]);

        return Inertia::render('Whistleblower/MyReports', [
            'reports'  => $reports,
            'statuses' => WhistleblowerReport::statuses(),
        ]);
    }

    // ── Admin: list all reports ───────────────────────────────────────────────

    public function adminIndex(Request $request)
    {
        $this->authorizeAdmin();

        $query = WhistleblowerReport::with(['assignedAdmin'])
            ->orderByRaw("FIELD(severity, 'critical', 'high', 'medium', 'low')")
            ->orderByRaw("FIELD(status, 'pending', 'under_review', 'resolved', 'dismissed')")
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $reports = $query->paginate(20)->through(fn ($r) => $this->formatForList($r));
        $admins  = User::role('Admin')->select('id', 'name')->get();

        return Inertia::render('Whistleblower/Index', [
            'reports'        => $reports,
            'filters'        => $request->only(['status', 'severity', 'category']),
            'statuses'       => WhistleblowerReport::statuses(),
            'severityLevels' => WhistleblowerReport::severityLevels(),
            'categories'     => WhistleblowerReport::categories(),
            'stats'          => $this->getStats(),
            'admins'         => $admins,
        ]);
    }

    // ── Admin: view single report ─────────────────────────────────────────────

    public function adminShow(WhistleblowerReport $report)
    {
        $this->authorizeAdmin();

        if ($report->status === 'pending') {
            $report->update([
                'status'      => 'under_review',
                'reviewed_at' => now(),
            ]);
        }

        $admins = User::role('Admin')->select('id', 'name')->get();

        return Inertia::render('Whistleblower/Show', [
            'report'         => $this->formatForDetail($report->fresh()),
            'statuses'       => WhistleblowerReport::statuses(),
            'severityLevels' => WhistleblowerReport::severityLevels(),
            'categories'     => WhistleblowerReport::categories(),
            'admins'         => $admins,
        ]);
    }

    // ── Admin: update status / notes / assignment ─────────────────────────────

    public function adminUpdate(Request $request, WhistleblowerReport $report)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'status'      => 'required|in:pending,under_review,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:5000',
            'assigned_to' => 'nullable|exists:users,id',
            'severity'    => 'nullable|in:low,medium,high,critical',
        ]);

        $update = [
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $report->admin_notes,
            'assigned_to' => $validated['assigned_to'] ?? $report->assigned_to,
        ];

        if (isset($validated['severity'])) {
            $update['severity'] = $validated['severity'];
        }

        if ($validated['status'] === 'resolved' && ! $report->resolved_at) {
            $update['resolved_at'] = now();
        }

        $report->update($update);

        return back()->with('success', 'Report updated successfully.');
    }

    // ── Admin: download attachment ────────────────────────────────────────────

    public function downloadAttachment(WhistleblowerReport $report, int $index)
    {
        $this->authorizeAdmin();

        $attachments = $report->attachments ?? [];
        abort_unless(isset($attachments[$index]), 404);

        $attachment = $attachments[$index];
        abort_unless(Storage::disk('local')->exists($attachment['path']), 404);

        return Storage::disk('local')->download($attachment['path'], $attachment['original_name']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeAdmin(): void
    {
        abort_unless(Auth::user()?->hasRole('Admin'), 403, 'Access restricted to administrators.');
    }

    private function getStats(): array
    {
        return [
            'total'        => WhistleblowerReport::count(),
            'pending'      => WhistleblowerReport::where('status', 'pending')->count(),
            'under_review' => WhistleblowerReport::where('status', 'under_review')->count(),
            'resolved'     => WhistleblowerReport::where('status', 'resolved')->count(),
            'critical'     => WhistleblowerReport::where('severity', 'critical')->count(),
        ];
    }

    private function formatForList(WhistleblowerReport $r): array
    {
        return [
            'id'               => $r->id,
            'report_number'    => '#' . str_pad($r->id, 6, '0', STR_PAD_LEFT),
            'category'         => $r->category,
            'category_label'   => WhistleblowerReport::categories()[$r->category] ?? $r->category,
            'subject'          => $r->subject,
            'severity'         => $r->severity,
            'severity_color'   => $r->severity_color,
            'status'           => $r->status,
            'status_color'     => $r->status_color,
            'status_label'     => WhistleblowerReport::statuses()[$r->status],
            'reporter_display' => $r->reporter_display,
            'is_anonymous'     => $r->is_anonymous,
            'assigned_admin'   => $r->assignedAdmin?->name,
            'has_attachments'  => ! empty($r->attachments),
            'created_at'       => $r->created_at->format('d M Y'),
            'created_at_human' => $r->created_at->diffForHumans(),
        ];
    }

    private function formatForDetail(WhistleblowerReport $r): array
    {
        return [
            ...$this->formatForList($r),
            'description'        => $r->description,
            'accused_name'       => $r->accused_name,
            'accused_department' => $r->accused_department,
            'admin_notes'        => $r->admin_notes,
            'assigned_to'        => $r->assigned_to,
            'attachments'        => collect($r->attachments ?? [])->map(fn ($a, $i) => [
                'index'         => $i,
                'original_name' => $a['original_name'],
                'mime'          => $a['mime'],
                'size'          => $a['size'],
                'download_url'  => route('admin.whistleblower.attachment', [$r->id, $i]),
            ])->values()->toArray(),
            'reviewed_at' => $r->reviewed_at?->format('d M Y'),
            'resolved_at' => $r->resolved_at?->format('d M Y'),
        ];
    }
}
