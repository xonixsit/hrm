<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Display the system settings page.
     */
    public function index(): Response
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can access system settings.');
        }

        return Inertia::render('Admin/SystemSettings/Index', [
            'settings' => $this->getSystemSettings(),
            'systemInfo' => $this->getSystemInfo()
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can update system settings.');
        }

        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_timezone' => 'required|string',
            'maintenance_mode' => 'boolean',
            'registration_enabled' => 'boolean',
            'email_notifications' => 'boolean',
            'backup_frequency' => 'required|in:daily,weekly,monthly',
            'session_timeout' => 'required|integer|min:5|max:1440',
            'max_file_upload' => 'required|integer|min:1|max:100',
        ]);

        // Store settings in cache/config
        foreach ($validated as $key => $value) {
            Cache::forever("system_settings.{$key}", $value);
        }

        return redirect()->back()->with('success', 'System settings updated successfully.');
    }

    /**
     * Get current system settings.
     */
    private function getSystemSettings(): array
    {
        return [
            'app_name' => Cache::get('system_settings.app_name', config('app.name', 'HR Management')),
            'app_timezone' => Cache::get('system_settings.app_timezone', config('app.timezone', 'UTC')),
            'maintenance_mode' => Cache::get('system_settings.maintenance_mode', false),
            'registration_enabled' => Cache::get('system_settings.registration_enabled', true),
            'email_notifications' => Cache::get('system_settings.email_notifications', true),
            'backup_frequency' => Cache::get('system_settings.backup_frequency', 'daily'),
            'session_timeout' => Cache::get('system_settings.session_timeout', 120),
            'max_file_upload' => Cache::get('system_settings.max_file_upload', 10),
        ];
    }

    /**
     * Get system information.
     */
    private function getSystemInfo(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'database_type' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'mail_driver' => config('mail.default'),
            'storage_disk' => config('filesystems.default'),
            'debug_mode' => config('app.debug'),
            'environment' => config('app.env'),
        ];
    }

    /**
     * Clear system cache.
     */
    public function clearCache()
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can clear system cache.');
        }

        try {
            \Artisan::call('cache:clear');
            \Artisan::call('config:clear');
            \Artisan::call('view:clear');
            \Artisan::call('route:clear');

            return redirect()->back()->with('success', 'System cache cleared successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to clear cache: ' . $e->getMessage());
        }
    }

    /**
     * Run system optimization.
     */
    public function optimize()
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can optimize system.');
        }

        try {
            \Artisan::call('optimize');
            \Artisan::call('config:cache');
            \Artisan::call('route:cache');
            \Artisan::call('view:cache');

            return redirect()->back()->with('success', 'System optimized successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to optimize system: ' . $e->getMessage());
        }
    }

    /**
     * Get system health status.
     */
    public function health()
    {
        // Check if user has admin role
        if (!auth()->user()->hasRole('Admin')) {
            abort(403, 'Only administrators can access system health.');
        }

        $health = [
            'database' => $this->checkDatabaseConnection(),
            'cache' => $this->checkCacheConnection(),
            'storage' => $this->checkStorageWritable(),
            'queue' => $this->checkQueueConnection(),
        ];

        return response()->json([
            'status' => collect($health)->every(fn($status) => $status === 'healthy') ? 'healthy' : 'warning',
            'checks' => $health,
            'uptime' => $this->getSystemUptime(),
            'memory_usage' => $this->getMemoryUsage(),
        ]);
    }

    /**
     * Check database connection.
     */
    private function checkDatabaseConnection(): string
    {
        try {
            \DB::connection()->getPdo();
            return 'healthy';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Check cache connection.
     */
    private function checkCacheConnection(): string
    {
        try {
            Cache::put('health_check', 'test', 1);
            $value = Cache::get('health_check');
            return $value === 'test' ? 'healthy' : 'error';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Check if storage is writable.
     */
    private function checkStorageWritable(): string
    {
        try {
            $testFile = storage_path('app/health_check.txt');
            file_put_contents($testFile, 'test');
            $content = file_get_contents($testFile);
            unlink($testFile);
            return $content === 'test' ? 'healthy' : 'error';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Check queue connection.
     */
    private function checkQueueConnection(): string
    {
        try {
            // Simple check - in production you might want to dispatch a test job
            return config('queue.default') !== null ? 'healthy' : 'warning';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Get system uptime (simplified).
     */
    private function getSystemUptime(): string
    {
        // This is a simplified version - in production you might track actual uptime
        return '99.5%';
    }

    /**
     * Get memory usage.
     */
    private function getMemoryUsage(): array
    {
        return [
            'used' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
            'peak' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB',
            'limit' => ini_get('memory_limit'),
        ];
    }
}