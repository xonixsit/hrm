<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProfilePictureController extends Controller
{
    /**
     * Serve profile picture from storage
     * This bypasses symlink issues by serving files directly through Laravel
     */
    public function show(Request $request, $filename)
    {
        // Must be authenticated
        if (!auth()->check()) {
            abort(403);
        }

        $user     = auth()->user();
        $filename = basename($filename); // prevent directory traversal
        $path     = 'profile-pictures/' . $filename;

        // Resolve which employee owns this picture
        $employee = \App\Models\Employee::where('profile_pic', 'like', '%' . $filename)
            ->first();

        // Access: Admin/HR can see anyone's. User can only see their own.
        $isAdminOrHR = $user->hasAnyRole(['Admin', 'HR']);
        $isSelf      = $employee && $employee->user_id === $user->id;

        if (!$isAdminOrHR && !$isSelf) {
            abort(403, 'Access denied.');
        }

        try {
            if (!Storage::disk('public')->exists($path)) {
                abort(404, 'Image not found');
            }

            $file     = Storage::disk('public')->get($path);
            $mimeType = Storage::disk('public')->mimeType($path);

            return response($file, 200)
                ->header('Content-Type', $mimeType)
                ->header('Cache-Control', 'private, max-age=3600');

        } catch (\Exception $e) {
            \Log::error('Error serving profile picture', [
                'filename' => $filename,
                'error'    => $e->getMessage(),
            ]);
            abort(500, 'Error loading image');
        }
    }
}
