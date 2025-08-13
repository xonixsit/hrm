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
        Schema::table('departments', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('name');
            $table->text('description')->nullable()->after('code');
            $table->string('location')->nullable()->after('description');
            $table->string('status')->default('Active')->after('location');
            $table->decimal('budget', 15, 2)->nullable()->after('status');
            $table->date('established_date')->nullable()->after('budget');
            $table->foreignId('manager_id')->nullable()->constrained('employees')->onDelete('set null')->after('established_date');
            $table->foreignId('parent_department_id')->nullable()->constrained('departments')->onDelete('set null')->after('manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['parent_department_id']);
            $table->dropForeign(['manager_id']);
            $table->dropColumn([
                'code',
                'description', 
                'location',
                'status',
                'budget',
                'established_date',
                'manager_id',
                'parent_department_id'
            ]);
        });
    }
};
