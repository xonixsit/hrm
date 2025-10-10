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
        Schema::table('competency_assessments', function (Blueprint $table) {
            $table->foreign('assessment_cycle_id')->references('id')->on('assessment_cycles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('competency_assessments', function (Blueprint $table) {
            $table->dropForeign(['assessment_cycle_id']);
        });
    }
};