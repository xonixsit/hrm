<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Registry of every controllable menu item / feature
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();        // e.g. "attendance", "work_reports"
            $table->string('label');                // e.g. "Attendance Tracking"
            $table->string('group')->nullable();    // e.g. "HR", "Management", "General"
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Which roles can access which feature (Admin always bypasses this table)
        Schema::create('feature_role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feature_id')->constrained('features')->onDelete('cascade');
            $table->string('role_name');            // e.g. "HR", "Manager", "Employee"
            $table->timestamps();

            $table->unique(['feature_id', 'role_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_role_permissions');
        Schema::dropIfExists('features');
    }
};
