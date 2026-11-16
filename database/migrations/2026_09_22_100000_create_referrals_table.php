<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referred_by')->constrained('users')->onDelete('cascade');   // referrer (employee)
            $table->string('candidate_name');
            $table->string('candidate_email');
            $table->string('candidate_phone')->nullable();
            $table->string('position');                             // role being referred for
            $table->string('department')->nullable();
            $table->text('relationship');                           // how they know the candidate
            $table->text('note')->nullable();                       // additional notes
            $table->string('resume_path')->nullable();              // uploaded CV
            $table->enum('status', [
                'submitted',
                'under_review',
                'shortlisted',
                'interviewed',
                'hired',
                'rejected',
            ])->default('submitted');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
