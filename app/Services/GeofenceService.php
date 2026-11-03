<?php

namespace App\Services;

use App\Models\GeofenceSetting;
use Illuminate\Http\Request;

class GeofenceService
{
    /**
     * Check whether the incoming login request is within the allowed geofence.
     *
     * Returns null on success, or an error message string on failure.
     */
    public function check(Request $request, bool $isAdmin = false): ?string
    {
        $setting = GeofenceSetting::active();

        // No setting configured → allow everyone through
        if (!$setting) {
            return null;
        }

        // Admins can bypass if the option is enabled
        if ($isAdmin && $setting->bypass_for_admin) {
            return null;
        }

        $ipAllowed  = false;
        $gpsAllowed = false;

        // ── IP check ──────────────────────────────────────────────────────────
        if ($setting->ip_enabled && !empty($setting->allowed_ips)) {
            $clientIp = $this->getClientIp($request);
            $ipAllowed = in_array($clientIp, $setting->allowed_ips, true);
        } else {
            // IP check disabled OR no IPs configured → skip this check
            $ipAllowed = !$setting->ip_enabled; // only pass if explicitly disabled, not just empty
        }

        // ── GPS check ─────────────────────────────────────────────────────────
        if ($setting->gps_enabled && $setting->latitude && $setting->longitude) {
            $lat = $request->input('gps_latitude');
            $lng = $request->input('gps_longitude');

            if ($lat !== null && $lng !== null) {
                $distance = $this->haversineDistance(
                    (float) $lat,
                    (float) $lng,
                    (float) $setting->latitude,
                    (float) $setting->longitude
                );
                $gpsAllowed = $distance <= $setting->radius_meters;
            }
            // GPS coords not submitted (permission denied on device) → not allowed via GPS
        } else {
            // GPS check disabled OR coordinates not configured → skip this check
            $gpsAllowed = !$setting->gps_enabled; // only pass if explicitly disabled, not just unconfigured
        }

        // Pass if EITHER enabled check succeeds
        // If both checks are enabled but neither has data → deny
        if ($ipAllowed || $gpsAllowed) {
            return null;
        }

        return 'Access denied. You must be connected to the office network or located at the office to log in.';
    }

    /**
     * Calculate distance in metres between two lat/lng points (Haversine formula).
     */
    public function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // metres

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Resolve the real client IP, honouring common proxy headers.
     */
    public function getClientIp(Request $request): string
    {
        foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP'] as $header) {
            $value = $request->server($header);
            if ($value) {
                // X-Forwarded-For may be a comma-separated list; take the first
                return trim(explode(',', $value)[0]);
            }
        }

        return $request->ip();
    }
}
