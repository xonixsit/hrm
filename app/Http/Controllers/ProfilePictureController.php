<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProfilePictureController extends Controller
{
    /**
     * Serve a profile picture.
     * Access: All authenticated users can view profile pictures.
     * Needed for org charts, messaging, leaderboards, team views, etc.
     */
    public function show(Request $request, string $filename)
    {
        if (!auth()->check()) {
            abort(403);
        }

        $filename = basename($filename); // prevent directory traversal
        
        // Profile pictures are visible to all authenticated users
        // (needed for org charts, messaging, leaderboards, etc.)

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
