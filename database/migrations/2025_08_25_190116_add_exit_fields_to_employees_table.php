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
        Schema::table('employees', function (Blueprint $table) {
            $table->date('exit_date')->nullable()->after('join_date');
            $table->string('exit_reason')->nullable()->after('exit_date');
            $table->text('exit_notes')->nullable()->after('exit_reason');
            $table->timestamp('exit_processed_at')->nullable()->after('exit_notes');
            $table->unsignedBigInteger('exit_processed_by')->nullable()->after('exit_processed_at');
            
            $table->foreign('exit_processed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['exit_processed_by']);
            $table->dropColumn([
                'exit_date',
                'exit_reason', 
                'exit_notes',
                'exit_processed_at',
                'exit_processed_by'
            ]);
        });
    }
};