<?php

namespace App\Mail;

use App\Models\Broadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BroadcastMail extends Mailable implements ShouldQueue
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
            subject: "{$typeLabel}: {$this->broadcast->title}",
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
                if (file_exists($filePath)) {
                    $attachments[] = \Illuminate\Mail\Mailables\Attachment::fromPath($filePath)
                        ->as($attachment['original_name'])
                        ->withMime($attachment['mime_type']);
                }
            }
        }
        
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
