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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('client')->nullable()->after('description');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('status');
            $table->decimal('budget', 12, 2)->nullable()->after('priority');
            $table->date('due_date')->nullable()->after('end_date');
            $table->integer('progress')->default(0)->after('due_date');
            $table->foreignId('manager_id')->nullable()->constrained('employees')->onDelete('set null')->after('progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn([
                'client',
                'priority',
                'budget',
                'due_date',
                'progress',
                'manager_id'
            ]);
        });
    }
};
