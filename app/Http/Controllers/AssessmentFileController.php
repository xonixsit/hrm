<?php

namespace App\Http\Controllers;

use App\Models\CompetencyAssessment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AssessmentFileController extends Controller
{
    /**
     * Upload files for an assessment.
     */
    public function upload(Request $request, $assessmentId)
    {
        $assessment = CompetencyAssessment::findOrFail($assessmentId);
        
        // Check if user can edit this assessment
        if (!$this->canEditAssessment($assessment)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'files.*' => 'required|file|max:10240', // 10MB max per file
        ]);
        
        $uploadedFiles = [];
        $existingFiles = $assessment->evidence_files ?? [];
        
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs("assessment-files/{$assessmentId}", $fileName, 'public');
                $uploadedFiles[] = $fileName;
            }
        }
        
        // Merge with existing files
        $allFiles = array_merge($existingFiles, $uploadedFiles);
        $assessment->update(['evidence_files' => $allFiles]);
        
        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
            'all_files' => $allFiles
        ]);
    }

    /**
     * Serve an assessment file with proper authorization.
     */
    public function show(Request $request, $assessmentId, $fileName)
    {
        // Find the assessment
        $assessment = CompetencyAssessment::findOrFail($assessmentId);
        
        // Check if user can view this assessment
        if (!$this->canViewAssessment($assessment)) {
            abort(403, 'You are not authorized to view files for this assessment.');
        }
        
        // Check if the file is actually part of this assessment
        if (!in_array($fileName, $assessment->evidence_files ?? [])) {
            abort(404, 'File not found in this assessment.');
        }
        
        // Try to serve the actual file first
        $filePath = "assessment-files/{$assessmentId}/{$fileName}";
        
        if (Storage::disk('public')->exists($filePath)) {
            // Get the file's mime type
            $mimeType = Storage::disk('public')->mimeType($filePath);
            
            // Return the actual file with proper headers
            return Storage::disk('public')->response($filePath, $fileName, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"'
            ]);
        }
        
        // If file doesn't exist, return 404 error instead of demo
        abort(404, 'File not found on server.');
    }
    
    /**
     * Check if the current user can view the assessment.
     */
    private function canViewAssessment(CompetencyAssessment $assessment): bool
    {
        $user = Auth::user();
        
        // Admins and HR can view all assessments
        if ($user->hasRole(['Admin', 'HR'])) {
            return true;
        }
        
        // The assessor can always view their own assessments
        if ($assessment->assessor_id === $user->id) {
            return true;
        }
        
        // For self-assessments, the employee can view their own assessment
        if ($assessment->assessment_type === 'self') {
            $employee = $assessment->employee;
            if ($employee && $employee->user_id === $user->id) {
                return true;
            }
        }
        
        // Managers can view assessments of their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $assessment->employee->department_id === $user->employee->department_id;
        }
        
        return false;
    }
    
    /**
     * Check if the current user can edit the assessment.
     */
    private function canEditAssessment(CompetencyAssessment $assessment): bool
    {
        $user = Auth::user();
        
        // Admins and HR can edit any assessment (even submitted ones)
        if ($user->hasRole(['Admin', 'HR'])) {
            return true;
        }
        
        // For non-admin users, only draft assessments can be edited
        if (!$assessment->isDraft()) {
            return false;
        }
        
        // Use the same logic as view, but only for drafts
        return $this->canViewAssessment($assessment);
    }
    

}