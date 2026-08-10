<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('category', [
                'lead_conversion',
                'sales_strategy',
                'client_retention',
                'tax_consultation',
                'payment_process',
                'team_process',
                'other',
            ])->default('other');
            $table->enum('status', ['pending', 'under_review', 'approved', 'implemented', 'declined'])
                  ->default('pending');
            $table->integer('votes')->default(0);
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('category');
            $table->index('status');
            $table->index('created_at');
        });

        // Votes pivot
        Schema::create('idea_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['idea_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idea_votes');
        Schema::dropIfExists('ideas');
    }
};
