<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assessment_cycles', function (Blueprint $table) {
            // Add is_active column as a computed column based on status
            $table->boolean('is_active')->default(false)->after('status');
        });
        
        // Update existing records to set is_active based on status
        DB::table('assessment_cycles')
            ->where('status', 'active')
            ->update(['is_active' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_cycles', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
