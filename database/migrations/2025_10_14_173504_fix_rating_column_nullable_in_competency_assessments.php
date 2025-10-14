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
            // Ensure rating column is nullable
            $table->tinyInteger('rating')->unsigned()->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('competency_assessments', function (Blueprint $table) {
            // Make rating column not nullable again
            $table->tinyInteger('rating')->unsigned()->nullable(false)->change();
        });
    }
};
