<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProfilePictureController extends Controller
{
    /**
     * Serve a profile picture.
     * Access: Admin or HR can see anyone's. Employee can only see their own.
     */
    public function show(Request $request, string $filename)
    {
        if (!auth()->check()) {
            abort(403);
        }

        $user     = auth()->user();
        $filename = basename($filename); // prevent directory traversal

        // Resolve which employee owns this picture
        $employee = \App\Models\Employee::where('profile_pic', 'like', '%' . $filename)->first();

        // Access check
        $isAdminOrHR = $user->hasAnyRole(['Admin', 'HR']);
        $isSelf      = $employee && $employee->user_id === $user->id;

        if (!$isAdminOrHR && !$isSelf) {
            // Return a generic avatar placeholder instead of 403 so the UI
            // doesn't show broken images for regular employees
            return $this->placeholder();
        }

        // Try public/images/profile-pictures first (primary storage)
        $absPath = public_path('images/profile-pictures/' . $filename);
        if (file_exists($absPath)) {
            return $this->serveFile($absPath);
        }

        // Fallback: storage/app/public/profile-pictures (legacy symlink path)
        $storagePath = storage_path('app/public/profile-pictures/' . $filename);
        if (file_exists($storagePath)) {
            return $this->serveFile($storagePath);
        }

        abort(404, 'Image not found.');
    }

    private function serveFile(string $absPath)
    {
        $ext      = strtolower(pathinfo($absPath, PATHINFO_EXTENSION));
        $mimeMap  = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp'];
        $mimeType = $mimeMap[$ext] ?? 'image/jpeg';

        return response(file_get_contents($absPath), 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'private, max-age=3600');
    }

    private function placeholder()
    {
        // 1×1 transparent PNG — frontend will show initials fallback
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        return response($png, 200)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'private, no-store');
    }
}
