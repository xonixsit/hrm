<?php

namespace App\Mail;

use App\Models\Broadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestBroadcastMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Broadcast $broadcast)
    {
    }

    public function envelope(): Envelope
    {
        $typeLabel = match($this->broadcast->type) {
            'announcement' => '📢 Announcement',
            'feature' => '✨ New Feature',
            'wish' => '🎉 Special Wishes',
            'update' => '🔄 Update',
            default => '📧 Message',
        };

        return new Envelope(
            subject: "[TEST] {$typeLabel}: {$this->broadcast->title}",
        );
    }

    public function content(): Content
    {
        $template = $this->broadcast->email_template ?? 'professional';
        
        return new Content(
            view: "emails.templates.{$template}",
            with: [
                'broadcast' => $this->broadcast,
                'typeIcon' => $this->getTypeIcon(),
                'typeColor' => $this->getTypeColor(),
            ],
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        
        if ($this->broadcast->attachments) {
            foreach ($this->broadcast->attachments as $attachment) {
                $filePath = storage_path('app/public/broadcasts/' . $attachment['filename']);
                
                // Debug logging for test emails
                \Log::info('TestBroadcastMail: Processing attachment', [
                    'filename' => $attachment['filename'],
                    'original_name' => $attachment['original_name'],
                    'path' => $filePath,
                    'exists' => file_exists($filePath),
                    'size' => file_exists($filePath) ? filesize($filePath) : 0
                ]);
                
                if (file_exists($filePath)) {
                    $attachments[] = \Illuminate\Mail\Mailables\Attachment::fromPath($filePath)
                        ->as($attachment['original_name'])
                        ->withMime($attachment['mime_type']);
                } else {
                    \Log::warning('TestBroadcastMail: Attachment file not found', [
                        'filename' => $attachment['filename'],
                        'path' => $filePath
                    ]);
                }
            }
        }
        
        \Log::info('TestBroadcastMail: Final attachments count', [
            'count' => count($attachments)
        ]);
        
        return $attachments;
    }

    private function getTypeIcon(): string
    {
        return match($this->broadcast->type) {
            'announcement' => '📢',
            'feature' => '✨',
            'wish' => '🎉',
            'update' => '🔄',
            default => '📧',
        };
    }

    private function getTypeColor(): string
    {
        return match($this->broadcast->type) {
            'announcement' => '#3B82F6',
            'feature' => '#8B5CF6',
            'wish' => '#EC4899',
            'update' => '#10B981',
            default => '#6B7280',
        };
    }
}