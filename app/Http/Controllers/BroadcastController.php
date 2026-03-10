<?php

namespace App\Http\Controllers;

use App\Models\Broadcast;
use App\Models\Department;
use App\Models\User;
use App\Mail\BroadcastMail;
use App\Mail\TestBroadcastMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class BroadcastController extends Controller
{
    use AuditLogTrait;

    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:Admin|HR');
    }

    public function index(Request $request)
    {
        $broadcasts = Broadcast::with('createdBy')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Broadcasts/Index', [
            'broadcasts' => $broadcasts,
            'stats' => [
                'total' => Broadcast::count(),
                'draft' => Broadcast::draft()->count(),
                'scheduled' => Broadcast::scheduled()->count(),
                'sent' => Broadcast::sent()->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Broadcasts/Create', [
            'types' => ['announcement', 'feature', 'wish', 'update', 'other'],
            'templates' => \App\Services\BroadcastTemplateService::getTemplates(),
            'templateCategories' => \App\Services\BroadcastTemplateService::getTemplateCategories(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:announcement,feature,wish,update,other',
            'email_template' => 'nullable|string|in:professional,festive,celebration,minimal',
            'scheduled_at' => 'nullable|date|after:now',
            'notes' => 'nullable|string|max:1000',
            'attachments.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['status'] = $request->scheduled_at ? 'scheduled' : 'draft';

        // Handle file uploads
        $attachments = [];
        if ($request->hasFile('attachments')) {
            $files = is_array($request->file('attachments')) ? $request->file('attachments') : [$request->file('attachments')];
            foreach ($files as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->storeAs('public/broadcasts', $filename);
                    
                    $attachments[] = [
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }
        }
        $validated['attachments'] = $attachments;

        $broadcast = Broadcast::create($validated);

        // Get recipients and attach them
        $recipients = $broadcast->getRecipientsList();
        $broadcast->recipients()->attach(
            $recipients->pluck('id')->toArray(),
            ['status' => 'pending']
        );
        $broadcast->update(['recipients_count' => $recipients->count()]);

        $this->logAudit('Broadcast Created', "Created broadcast: {$broadcast->title}");

        return redirect()->route('admin.broadcasts.show', $broadcast)
            ->with('success', 'Broadcast created successfully.');
    }

    public function show(Broadcast $broadcast)
    {
        $broadcast->load('createdBy', 'recipients');

        return Inertia::render('Admin/Broadcasts/Show', [
            'broadcast' => $broadcast,
            'recipients' => $broadcast->recipients()
                ->withPivot('status', 'sent_at', 'error_message')
                ->paginate(20),
        ]);
    }

    public function edit(Broadcast $broadcast)
    {
        if ($broadcast->status !== 'draft') {
            return redirect()->route('admin.broadcasts.show', $broadcast)
                ->with('error', 'Only draft broadcasts can be edited.');
        }

        return Inertia::render('Admin/Broadcasts/Edit', [
            'broadcast' => $broadcast,
            'types' => ['announcement', 'feature', 'wish', 'update', 'other'],
            'templates' => \App\Services\BroadcastTemplateService::getTemplates(),
            'templateCategories' => \App\Services\BroadcastTemplateService::getTemplateCategories(),
        ]);
    }

    public function update(Request $request, Broadcast $broadcast)
    {
        if ($broadcast->status !== 'draft') {
            return back()->with('error', 'Only draft broadcasts can be edited.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:announcement,feature,wish,update,other',
            'email_template' => 'nullable|string|in:professional,festive,celebration,minimal',
            'scheduled_at' => 'nullable|date|after:now',
            'notes' => 'nullable|string|max:1000',
            'attachments.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif',
            'remove_attachments' => 'nullable|array',
        ]);

        $validated['status'] = $request->scheduled_at ? 'scheduled' : 'draft';

        // Handle file uploads
        $existingAttachments = $broadcast->attachments ?? [];
        
        // Remove specified attachments
        if ($request->has('remove_attachments')) {
            foreach ($request->remove_attachments as $filename) {
                $filePath = storage_path('app/public/broadcasts/' . $filename);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                $existingAttachments = array_filter($existingAttachments, function($attachment) use ($filename) {
                    return $attachment['filename'] !== $filename;
                });
            }
        }

        // Add new attachments
        if ($request->hasFile('attachments')) {
            $files = is_array($request->file('attachments')) ? $request->file('attachments') : [$request->file('attachments')];
            foreach ($files as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->storeAs('public/broadcasts', $filename);
                    
                    $existingAttachments[] = [
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }
        }
        
        $validated['attachments'] = array_values($existingAttachments);
        $broadcast->update($validated);

        // Update recipients
        $recipients = $broadcast->getRecipientsList();
        $broadcast->recipients()->sync(
            $recipients->pluck('id')->toArray(),
            false
        );
        $broadcast->update(['recipients_count' => $recipients->count()]);

        $this->logAudit('Broadcast Updated', "Updated broadcast: {$broadcast->title}");

        return redirect()->route('admin.broadcasts.show', $broadcast)
            ->with('success', 'Broadcast updated successfully.');
    }

    public function sendTestEmail(Request $request)
    {
        $validated = $request->validate([
            'test_email' => 'required|email',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:announcement,feature,wish,update,other',
            'email_template' => 'nullable|string|in:professional,festive,celebration,minimal',
            'notes' => 'nullable|string|max:1000',
            'attachments.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif',
        ]);

        try {
            // Handle file uploads for test
            $attachments = [];
            if ($request->hasFile('attachments')) {
                \Log::info('Processing test email attachments', [
                    'files_count' => count($request->file('attachments'))
                ]);
                
                $files = is_array($request->file('attachments')) ? $request->file('attachments') : [$request->file('attachments')];
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $filename = 'test_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                        $storedPath = $file->storeAs('public/broadcasts', $filename);
                        
                        \Log::info('Stored test attachment', [
                            'original_name' => $file->getClientOriginalName(),
                            'filename' => $filename,
                            'stored_path' => $storedPath,
                            'size' => $file->getSize(),
                            'mime_type' => $file->getMimeType()
                        ]);
                        
                        $attachments[] = [
                            'filename' => $filename,
                            'original_name' => $file->getClientOriginalName(),
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                        ];
                    }
                }
            }

            // Create a temporary broadcast object for testing - save it to database temporarily
            $testBroadcast = Broadcast::create([
                'title' => $validated['title'],
                'content' => $validated['content'],
                'type' => $validated['type'],
                'email_template' => $validated['email_template'] ?? 'professional',
                'notes' => $validated['notes'] ?? '',
                'attachments' => $attachments,
                'created_by' => Auth::id(),
                'status' => 'test',
                'sent_at' => now(),
            ]);

            // Load the relationship
            $testBroadcast->load('createdBy');

            // Debug: Log attachment information
            \Log::info('Test broadcast attachments', [
                'attachments' => $testBroadcast->attachments,
                'attachments_count' => count($testBroadcast->attachments ?? [])
            ]);

            // Check if attachment files exist
            if ($testBroadcast->attachments) {
                foreach ($testBroadcast->attachments as $attachment) {
                    $filePath = storage_path('app/public/broadcasts/' . $attachment['filename']);
                    \Log::info('Checking attachment file', [
                        'filename' => $attachment['filename'],
                        'path' => $filePath,
                        'exists' => file_exists($filePath),
                        'size' => file_exists($filePath) ? filesize($filePath) : 0
                    ]);
                }
            }

            // Debug: Check if email template view exists
            $templateName = $testBroadcast->email_template ?? 'professional';
            $viewPath = "emails.templates.{$templateName}";
            
            if (!view()->exists($viewPath)) {
                // Clean up the test broadcast and files
                $this->cleanupTestBroadcast($testBroadcast);
                return response()->json([
                    'success' => false,
                    'error' => "Email template '{$templateName}' not found. Using fallback template."
                ], 500);
            }

            // Send test email using immediate send (not queued)
            Mail::to($validated['test_email'])->send(new TestBroadcastMail($testBroadcast));

            // Clean up the test broadcast after sending
            $this->cleanupTestBroadcast($testBroadcast);

            $this->logAudit('Test Email Sent', "Sent test broadcast email to: {$validated['test_email']}");

            return response()->json([
                'success' => true,
                'message' => "Test email sent successfully to {$validated['test_email']}! Check your inbox.",
                'template_used' => $templateName,
                'attachments_count' => count($attachments)
            ]);

        } catch (\Exception $e) {
            // Clean up the test broadcast if it exists
            if (isset($testBroadcast) && $testBroadcast->exists) {
                $this->cleanupTestBroadcast($testBroadcast);
            }

            // Log the detailed error
            \Log::error('Test email failed', [
                'email' => $validated['test_email'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->logAudit('Test Email Failed', "Failed to send test email to: {$validated['test_email']}. Error: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to send test email: ' . $e->getMessage(),
                'debug_info' => [
                    'email_config' => [
                        'mailer' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'from' => config('mail.from.address')
                    ]
                ]
            ], 500);
        }
    }

    private function cleanupTestBroadcast(Broadcast $broadcast)
    {
        // Remove test attachment files
        if ($broadcast->attachments) {
            foreach ($broadcast->attachments as $attachment) {
                $filePath = storage_path('app/public/broadcasts/' . $attachment['filename']);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }
        
        // Delete the test broadcast
        $broadcast->delete();
    }

    public function send(Request $request, Broadcast $broadcast)
    {
        if ($broadcast->status === 'sent') {
            return back()->with('error', 'This broadcast has already been sent.');
        }

        try {
            $recipients = $broadcast->recipients()
                ->wherePivot('status', 'pending')
                ->get();

            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->queue(new BroadcastMail($broadcast));
                
                $broadcast->recipients()->updateExistingPivot($recipient->id, [
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            }

            $broadcast->update([
                'status' => 'sent',
                'sent_at' => now(),
                'sent_count' => $recipients->count(),
            ]);

            $this->logAudit('Broadcast Sent', "Sent broadcast: {$broadcast->title} to {$recipients->count()} recipients");

            return back()->with('success', "Broadcast sent to {$recipients->count()} recipients.");
        } catch (\Exception $e) {
            $broadcast->update(['status' => 'failed']);
            $this->logAudit('Broadcast Failed', "Failed to send broadcast: {$broadcast->title}. Error: {$e->getMessage()}");

            return back()->with('error', 'Failed to send broadcast. Please try again.');
        }
    }

    public function delete(Broadcast $broadcast)
    {
        if ($broadcast->status === 'sent') {
            return back()->with('error', 'Cannot delete sent broadcasts.');
        }

        $broadcast->delete();
        $this->logAudit('Broadcast Deleted', "Deleted broadcast: {$broadcast->title}");

        return redirect()->route('admin.broadcasts.index')
            ->with('success', 'Broadcast deleted successfully.');
    }
}
