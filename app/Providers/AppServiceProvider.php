<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Attendance;
use App\Policies\AttendancePolicy;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Query\Expression;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Mail\Events\MessageFailed;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Set application timezone from database settings
        // This runs after database is connected
        $this->app->booted(function () {
            try {
                if (Schema::hasTable('settings')) {
                    $timezone = \App\Models\Setting::get('system_settings.app_timezone');
                    if ($timezone) {
                        date_default_timezone_set($timezone);
                        config(['app.timezone' => $timezone]);
                    }
                }
            } catch (\Exception $e) {
                // Silently fail if settings table doesn't exist yet (during migration)
                \Log::debug('Timezone setting failed: ' . $e->getMessage());
            }
        });

     
    
        Vite::prefetch(concurrency: 3);
        Schema::defaultStringLength(191);

        
        // Register policies
        Gate::policy(Attendance::class, AttendancePolicy::class);

            $checkConfig = function ($array, $prefix = '') use (&$checkConfig) {
        foreach ($array as $key => $value) {
            $fullKey = $prefix === '' ? $key : $prefix . '.' . $key;

            if ($value instanceof Expression) {
                dump("⚠️ Found Query Expression in config: {$fullKey}", $value);
            } elseif (is_array($value)) {
                $checkConfig($value, $fullKey);
            }
        }

        foreach (\Illuminate\Support\Facades\Route::getRoutes() as $route) {
    foreach ($route->middleware() as $mw) {
        if ($mw instanceof \Illuminate\Database\Query\Expression) {
            dump("⚠️ Found Expression in route middleware: " . $route->uri(), $mw);
        }
    }
}

    };

    $checkConfig(config()->all());

    // Mail event logging to diagnose delivery issues
    Event::listen(MessageSent::class, function (MessageSent $event) {
        try {
            $to = array_map(fn($addr) => method_exists($addr, 'getAddress') ? $addr->getAddress() : (string) $addr, (array) $event->message->getTo());
            $messageId = null;
            try {
                $headers = method_exists($event->message, 'getHeaders') ? $event->message->getHeaders() : null;
                if ($headers && $headers->has('Message-ID')) {
                    $messageId = (string) $headers->get('Message-ID');
                }
            } catch (\Throwable $e) {
                // ignore header parsing errors
            }
            Log::info('Mail message sent', [
                'to' => $to,
                'subject' => $event->message->getSubject(),
                'message_id' => $messageId,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to log MessageSent event', ['error' => $e->getMessage()]);
        }
    });

    Event::listen(MessageFailed::class, function (MessageFailed $event) {
        try {
            $to = array_map(fn($addr) => method_exists($addr, 'getAddress') ? $addr->getAddress() : (string) $addr, (array) $event->message->getTo());
            $messageId = null;
            try {
                $headers = method_exists($event->message, 'getHeaders') ? $event->message->getHeaders() : null;
                if ($headers && $headers->has('Message-ID')) {
                    $messageId = (string) $headers->get('Message-ID');
                }
            } catch (\Throwable $e) {
                // ignore header parsing errors
            }
            Log::error('Mail message failed', [
                'to' => $to,
                'subject' => $event->message->getSubject(),
                'message_id' => $messageId,
                'error' => $event->exception ? $event->exception->getMessage() : null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to log MessageFailed event', ['error' => $e->getMessage()]);
        }
    });

    }
}
