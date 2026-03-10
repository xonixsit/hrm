<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\TestBroadcastMail;
use App\Models\Broadcast;
use App\Models\User;

Route::get('/test-attachment-email', function () {
    // Create a test broadcast with attachment
    $testBroadcast = new Broadcast([
        'title' => 'Test Attachment Email',
        'content' => 'This is a test email with attachment.',
        'type' => 'announcement',
        'email_template' => 'professional',
        'attachments' => [
            [
                'filename' => 'test.txt',
                'original_name' => 'test-document.txt',
                'mime_type' => 'text/plain',
                'size' => 50
            ]
        ],
        'created_by' => 1,
        'status' => 'test',
        'sent_at' => now(),
    ]);
    
    // Set the relationship manually
    $user = User::first();
    $testBroadcast->setRelation('createdBy', $user);
    
    try {
        Mail::to('test@example.com')->send(new TestBroadcastMail($testBroadcast));
        return 'Test email sent successfully!';
    } catch (Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});