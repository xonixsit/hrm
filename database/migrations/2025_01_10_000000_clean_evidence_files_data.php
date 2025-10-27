<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if table exists before trying to clean data
        if (!Schema::hasTable('competency_assessments')) {
            return;
        }
        
        // Clean up any invalid evidence_files data
        $assessments = DB::table('competency_assessments')
            ->whereNotNull('evidence_files')
            ->get();

        foreach ($assessments as $assessment) {
            $evidenceFiles = json_decode($assessment->evidence_files, true);
            
            if (is_array($evidenceFiles)) {
                $cleanedFiles = [];
                
                foreach ($evidenceFiles as $file) {
                    if (is_string($file)) {
                        // Already a filename, keep as is
                        $cleanedFiles[] = $file;
                    } elseif (is_array($file) && isset($file['name'])) {
                        // File object with name property
                        $cleanedFiles[] = $file['name'];
                    } elseif (is_array($file) && isset($file['filename'])) {
                        // File object with filename property
                        $cleanedFiles[] = $file['filename'];
                    } elseif (is_array($file) && isset($file['originalName'])) {
                        // File object with originalName property
                        $cleanedFiles[] = $file['originalName'];
                    }
                    // Skip invalid entries
                }
                
                // Update with cleaned data
                if (!empty($cleanedFiles)) {
                    DB::table('competency_assessments')
                        ->where('id', $assessment->id)
                        ->update(['evidence_files' => json_encode($cleanedFiles)]);
                } else {
                    // No valid files, set to null
                    DB::table('competency_assessments')
                        ->where('id', $assessment->id)
                        ->update(['evidence_files' => null]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as we're cleaning up data
        // The original invalid data would be lost
    }
};