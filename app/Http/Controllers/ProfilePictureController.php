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
    public function show($filename)
    {
        try {
            // Prevent directory traversal attacks
            $filename = basename($filename);
            $path = 'profile-pictures/' . $filename;
            
            Log::info('Profile picture request', [
                'filename' => $filename,
                'path' => $path,
                'storage_path' => storage_path('app/public/' . $path)
            ]);
            
            // Check if file exists
            if (!Storage::disk('public')->exists($path)) {
                Log::warning('Profile picture not found', [
                    'path' => $path,
                    'full_path' => storage_path('app/public/' . $path)
                ]);
                abort(404, 'Image not found');
            }
            
            // Get file contents
            $file = Storage::disk('public')->get($path);
            $mimeType = Storage::disk('public')->mimeType($path);
            
            Log::info('Profile picture served successfully', [
                'filename' => $filename,
                'mime_type' => $mimeType,
                'size' => strlen($file)
            ]);
            
            // Return file with proper headers
            return response($file, 200)
                ->header('Content-Type', $mimeType)
                ->header('Cache-Control', 'public, max-age=31536000')
                ->header('Access-Control-Allow-Origin', '*');
                
        } catch (\Exception $e) {
            Log::error('Error serving profile picture', [
                'filename' => $filename,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Error loading image');
        }
    }
}
