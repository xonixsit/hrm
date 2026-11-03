<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeofenceSetting extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'allowed_ips',
        'latitude',
        'longitude',
        'radius_meters',
        'gps_enabled',
        'ip_enabled',
        'bypass_for_admin',
    ];

    protected $casts = [
        'allowed_ips'       => 'array',
        'is_active'         => 'boolean',
        'gps_enabled'       => 'boolean',
        'ip_enabled'        => 'boolean',
        'bypass_for_admin'  => 'boolean',
        'latitude'          => 'float',
        'longitude'         => 'float',
        'radius_meters'     => 'integer',
    ];

    /**
     * Return the single active geofence setting (singleton pattern).
     */
    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
