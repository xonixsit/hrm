<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\TeamMessage;

class MediaGalleryController extends Controller
{
    /**
     * Get profile pictures (Admin only)
     */
    public function profilePictures(Request $request)
    {
        $user = Auth::user();
        
        // Only Admin/HR can access profile picture gallery
        $hasAdminAccess = $user->hasAnyRole(['Admin', 'HR']);
        
        if (!$hasAdminAccess) {
            \Log::warning('Media gallery access denied for user: ' . $user->id . ', roles: ' . $user->roles->pluck('name')->implode(', '));
            abort(403, 'Unauthorized - Admin or HR access required');
        }

        $images = [];
        
        // Get all profile pictures from public/images/profile-pictures
        $path = public_path('images/profile-pictures');
        if (is_dir($path)) {
            $files = array_diff(scandir($path), ['.', '..']);
            foreach ($files as $file) {
                if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file)) {
                    $filePath = $path . '/' . $file;
                    $images[] = [
                        'filename' => $file,
                        'url' => '/images/profile-pictures/' . $file,
                        'created_at' => date('Y-m-d H:i:s', filemtime($filePath)),
                        'size' => filesize($filePath)
                    ];
                }
            }
        }

        // Also check storage/app/public/profile-pictures (legacy)
        $storagePath = storage_path('app/public/profile-pictures');
        if (is_dir($storagePath)) {
            $files = array_diff(scandir($storagePath), ['.', '..']);
            foreach ($files as $file) {
                if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file)) {
                    // Check if not already added
                    $exists = false;
                    foreach ($images as $img) {
                        if ($img['filename'] === $file) {
                            $exists = true;
                            break;
                        }
                    }
                    
                    if (!$exists) {
                        $filePath = $storagePath . '/' . $file;
                        $images[] = [
                            'filename' => $file,
                            'url' => '/storage/profile-pictures/' . $file,
                            'created_at' => date('Y-m-d H:i:s', filemtime($filePath)),
                            'size' => filesize($filePath)
                        ];
                    }
                }
            }
        }

        // Sort by date (newest first)
        usort($images, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json(['images' => $images]);
    }

    /**
     * Get media shared in a specific conversation
     */
    public function conversationMedia(Request $request, $conversationId)
    {
        $messages = \DB::table('messages')
            ->where('conversation_id', $conversationId)
            ->where('message', 'like', '%<img%')
            ->orderBy('created_at', 'desc')
            ->get();

        $images = [];
        
        foreach ($messages as $message) {
            preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $message->message, $matches);
            
            if (!empty($matches[1])) {
                foreach ($matches[1] as $imageUrl) {
                    $filename = basename($imageUrl);
                    
                    // Normalize URL to use the protected serve route
                    // This ensures all images (old and new) go through authorization
                    $normalizedUrl = route('team-messaging.image', ['filename' => $filename]);
                    
                    $user = \App\Models\User::find($message->user_id);
                    $images[] = [
                        'filename' => $filename,
                        'url' => $normalizedUrl,
                        'created_at' => $message->created_at,
                        'sender_id' => $message->user_id,
                        'sender_name' => $user ? $user->name : 'Unknown',
                        'message_id' => $message->id
                    ];
                }
            }
        }

        return response()->json(['images' => $images]);
    }
}
