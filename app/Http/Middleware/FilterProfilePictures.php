<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * After the response is built, scan Inertia page props for profile_pic / profile_picture
 * fields and null them out for users who are not Admin or HR.
 * This means regular employees see initials/avatars, not actual photos.
 */
class FilterProfilePictures
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only filter Inertia responses
        if (!$request->header('X-Inertia')) {
            return $response;
        }

        $user = auth()->user();
        if (!$user) return $response;

        // Admin and HR can see all photos
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return $response;
        }

        // For everyone else — null out other people's profile pics in the JSON
        $content = $response->getContent();
        if (!$content) return $response;

        $data = json_decode($content, true);
        if (!$data) return $response;

        $userId = $user->id;
        $employeeUserId = $user->employee?->user_id ?? $userId;

        // Recursively walk the props and null profile_pic / profile_picture
        // for any user/employee that isn't the current user
        $data = $this->filterPics($data, $userId);

        $response->setContent(json_encode($data));
        return $response;
    }

    private function filterPics(mixed $node, int $selfUserId): mixed
    {
        if (!is_array($node)) return $node;

        // If this node looks like a user/employee object with an id
        // and it's NOT the current user, null out their pic
        $hasId = isset($node['id']) && is_int($node['id']);
        $isOther = $hasId && (int)$node['id'] !== $selfUserId;

        if ($isOther) {
            if (array_key_exists('profile_pic', $node))      $node['profile_pic'] = null;
            if (array_key_exists('profile_picture', $node))  $node['profile_picture'] = null;
        }

        // Recurse into child arrays
        foreach ($node as $key => $value) {
            if (is_array($value)) {
                $node[$key] = $this->filterPics($value, $selfUserId);
            }
        }

        return $node;
    }
}
