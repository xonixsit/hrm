<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Test route to check timezone configuration
Route::get('/test-timezone', function () {
    $data = [
        'php_timezone' => date_default_timezone_get(),
        'config_timezone' => config('app.timezone'),
        'env_timezone' => env('APP_TIMEZONE'),
        'current_time' => now()->toString(),
        'current_time_formatted' => now()->format('Y-m-d H:i:s T'),
    ];
    
    // Check if settings table exists
    try {
        $dbTimezone = \App\Models\Setting::get('system_settings.app_timezone');
        $data['db_timezone'] = $dbTimezone;
        
        // Get all system settings
        $allSettings = DB::table('settings')
            ->where('key', 'like', 'system_settings.%')
            ->get();
        $data['all_settings'] = $allSettings;
    } catch (\Exception $e) {
        $data['db_error'] = $e->getMessage();
    }
    
    return response()->json($data, 200, [], JSON_PRETTY_PRINT);
})->name('test.timezone');
