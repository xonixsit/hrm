<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class AdminSettingsController extends Controller
{
    /**
     * Get admin settings
     */
    public function getSettings()
    {
        // Get settings from database
        $settings = [
            'company_location' => Setting::get('system_settings.company_location', 'Chicago'),
            'company_timezone' => Setting::get('system_settings.app_timezone', 'America/Chicago'),
            'company_name' => Setting::get('system_settings.app_name', 'Xonobics'),
        ];

        return response()->json($settings);
    }
}
