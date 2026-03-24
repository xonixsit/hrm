<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('text_question_configs', function (Blueprint $table) {
            $table->text('expected_answer_guidelines')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('text_question_configs', function (Blueprint $table) {
            $table->text('expected_answer_guidelines')->nullable(false)->change();
        });
    }
};
