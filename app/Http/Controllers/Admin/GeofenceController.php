<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeofenceSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GeofenceController extends Controller
{
    public function index(): Response
    {
        $setting = GeofenceSetting::first();

        return Inertia::render('Admin/Geofence/Index', [
            'setting' => $setting,
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:100'],
            'is_active'         => ['boolean'],
            'ip_enabled'        => ['boolean'],
            'allowed_ips'       => ['nullable', 'string'],   // newline or comma separated
            'gps_enabled'       => ['boolean'],
            'latitude'          => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'         => ['nullable', 'numeric', 'between:-180,180'],
            'radius_meters'     => ['required', 'integer', 'min:50', 'max:50000'],
            'bypass_for_admin'  => ['boolean'],
        ]);

        // Parse IP list — accept newline or comma separated
        $rawIps = trim($validated['allowed_ips'] ?? '');
        $ips    = [];
        if ($rawIps !== '') {
            $ips = array_values(array_filter(
                array_map('trim', preg_split('/[\r\n,]+/', $rawIps))
            ));
        }

        $data = [
            'name'             => $validated['name'],
            'is_active'        => $validated['is_active'] ?? true,
            'ip_enabled'       => $validated['ip_enabled'] ?? true,
            'allowed_ips'      => $ips,
            'gps_enabled'      => $validated['gps_enabled'] ?? true,
            'latitude'         => $validated['latitude'] ?? null,
            'longitude'        => $validated['longitude'] ?? null,
            'radius_meters'    => $validated['radius_meters'],
            'bypass_for_admin' => $validated['bypass_for_admin'] ?? true,
        ];

        GeofenceSetting::updateOrCreate(['id' => 1], $data);

        return back()->with('success', 'Geofence settings saved successfully.');
    }
}
