<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geofence_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Office');          // location label
            $table->boolean('is_active')->default(true);

            // IP whitelist (comma-separated or JSON array)
            $table->json('allowed_ips')->nullable();            // ["103.160.27.213","103.160.27.245"]

            // GPS coordinates + radius
            $table->decimal('latitude', 10, 7)->nullable();     // e.g. 17.3850
            $table->decimal('longitude', 10, 7)->nullable();    // e.g. 78.4867
            $table->integer('radius_meters')->default(300);     // allowed radius from office

            // Options
            $table->boolean('gps_enabled')->default(true);
            $table->boolean('ip_enabled')->default(true);
            $table->boolean('bypass_for_admin')->default(true); // admins skip geofence

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geofence_settings');
    }
};
