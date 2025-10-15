<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendNotificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        public string $email,
        public Mailable $mailable,
        public string $type = 'notification'
    ) {}

    public function handle(): void
    {
        try {
            Mail::to($this->email)->send($this->mailable);
            
            Log::info('Notification email sent successfully', [
                'email' => $this->email,
                'type' => $this->type,
                'mailable' => get_class($this->mailable)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send notification email', [
                'email' => $this->email,
                'type' => $this->type,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Notification email job failed permanently', [
            'email' => $this->email,
            'type' => $this->type,
            'error' => $exception->getMessage()
        ]);
    }
}