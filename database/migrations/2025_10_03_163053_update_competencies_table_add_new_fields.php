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
        Schema::table('competencies', function (Blueprint $table) {
            // Add new fields for enhanced competency management
            $table->string('category')->after('description');
            $table->decimal('weight', 3, 2)->default(1.00)->after('category');
            $table->text('measurement_indicators')->nullable()->after('weight');
            $table->text('rating_guidelines')->nullable()->after('measurement_indicators');
            $table->foreignId('department_id')->nullable()->after('rating_guidelines')->constrained()->onDelete('set null');
            $table->boolean('role_specific')->default(false)->after('department_id');
            $table->boolean('is_active')->default(true)->after('role_specific');
            $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            
            // Add indexes for performance
            $table->index('category');
            $table->index('department_id');
            $table->index('is_active');
            $table->index('role_specific');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('competencies', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['category']);
            $table->dropIndex(['department_id']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['role_specific']);
            
            // Drop foreign key constraints
            $table->dropForeign(['department_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            
            // Drop columns
            $table->dropColumn([
                'category',
                'weight',
                'measurement_indicators',
                'rating_guidelines',
                'department_id',
                'role_specific',
                'is_active',
                'created_by',
                'updated_by'
            ]);
        });
    }
};