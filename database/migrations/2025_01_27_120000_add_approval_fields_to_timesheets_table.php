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
        Schema::table('timesheets', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('approval_comments')->nullable()->after('approved_at');
            $table->text('description')->nullable()->after('hours');
            
            // Add index for better query performance
            $table->index(['status', 'created_at']);
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['employee_id', 'status']);
            $table->dropColumn(['approved_at', 'approval_comments', 'description']);
        });
    }
};