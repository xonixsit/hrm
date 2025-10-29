<?php

namespace App\Http\Controllers;

use App\Mail\SupportRequestMail;
use App\Models\SupportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function create()
    {
        return Inertia::render('Support/Create', [
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:' . implode(',', array_keys(SupportRequest::getCategories())),
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'priority' => 'required|string|in:' . implode(',', array_keys(SupportRequest::getPriorities())),
        ]);

        $supportRequest = SupportRequest::create([
            'user_id' => auth()->id(),
            'category' => $validated['category'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        // Send email notification to all admin users
        $adminUsers = \App\Models\User::role('Admin')->get();
        foreach ($adminUsers as $admin) {
            Mail::to($admin->email)->send(new SupportRequestMail($supportRequest));
        }

        return redirect()->back()->with('success', 'Support request submitted successfully! We will get back to you soon.');
    }

    public function index()
    {
        $query = SupportRequest::with('user')->orderBy('created_at', 'desc');
        
        // Admin can see all requests, regular users only their own
        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }
        
        $supportRequests = $query->paginate(10);

        return Inertia::render('Support/Index', [
            'supportRequests' => $supportRequests,
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
            'statuses' => SupportRequest::getStatuses(),
            'isAdmin' => auth()->user()->hasRole('Admin'),
        ]);
    }

    public function show(SupportRequest $supportRequest)
    {
        // Admin can view all requests, regular users only their own
        if (!auth()->user()->hasRole('Admin') && $supportRequest->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Support/Show', [
            'supportRequest' => $supportRequest->load('user'),
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
            'statuses' => SupportRequest::getStatuses(),
            'isAdmin' => auth()->user()->hasRole('Admin'),
        ]);
    }

    public function updateStatus(Request $request, SupportRequest $supportRequest)
    {
        // Only admins can update status
        if (!auth()->user()->hasRole('Admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', array_keys(SupportRequest::getStatuses())),
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $supportRequest->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $supportRequest->admin_notes,
            'resolved_at' => $validated['status'] === 'resolved' ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Support request status updated successfully.');
    }
}
