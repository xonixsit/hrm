<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Break tracking fields
            $table->longText('break_sessions')->nullable()->after('location');
            $table->timestamp('current_break_start')->nullable()->after('break_sessions');
            $table->boolean('on_break')->default(false)->after('current_break_start');
            $table->integer('total_break_minutes')->default(0)->after('on_break');
            
            // Enhanced location tracking
            $table->decimal('latitude', 10, 8)->nullable()->after('total_break_minutes');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->boolean('location_verified')->default(false)->after('longitude');
            
            // Session tracking
            $table->integer('work_minutes')->nullable()->after('location_verified');
            $table->string('status')->default('clocked_out')->after('work_minutes'); // clocked_out, clocked_in, on_break
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'break_sessions',
                'current_break_start',
                'on_break',
                'total_break_minutes',
                'latitude',
                'longitude',
                'location_verified',
                'work_minutes',
                'status'
            ]);
        });
    }
};
