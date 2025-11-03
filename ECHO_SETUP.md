# Laravel Echo + Pusher Setup Guide

This guide will help you set up real-time attendance updates using Laravel Echo and Pusher.

## 1. Install Frontend Dependencies

```bash
npm install laravel-echo pusher-js
```

## 2. Environment Variables

Add these to your `.env` file:

```env
# Broadcasting
BROADCAST_DRIVER=pusher

# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1

# Vite Environment Variables (for frontend)
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

## 3. Install Laravel Dependencies

```bash
composer require pusher/pusher-php-server
```

## 4. Publish Broadcasting Configuration

```bash
php artisan vendor:publish --provider="Illuminate\Broadcasting\BroadcastServiceProvider"
```

## 5. Enable Broadcasting Routes

In `routes/channels.php`, add:

```php
<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Private channel for individual employee attendance updates
Broadcast::channel('attendance.{employeeId}', function ($user, $employeeId) {
    // User can only listen to their own attendance updates
    return $user->employee && (int) $user->employee->id === (int) $employeeId;
});

// Global channel for admin/manager dashboards (optional)
Broadcast::channel('attendance.global', function ($user) {
    // Only admins and managers can listen to global attendance updates
    return $user->hasRole(['Admin', 'Manager', 'HR']);
});
```

## 6. Update App Configuration

In `config/app.php`, uncomment the BroadcastServiceProvider:

```php
'providers' => [
    // ...
    App\Providers\BroadcastServiceProvider::class,
    // ...
],
```

## 7. Create Broadcast Service Provider (if not exists)

```bash
php artisan make:provider BroadcastServiceProvider
```

In `app/Providers/BroadcastServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Broadcast::routes();
        require base_path('routes/channels.php');
    }
}
```

## 8. Queue Configuration

For better performance, make sure you have a queue worker running:

```bash
php artisan queue:work
```

## 9. Testing the Setup

1. Start your Laravel development server: `php artisan serve`
2. Start your frontend build process: `npm run dev`
3. Start a queue worker: `php artisan queue:work`
4. Open multiple browser tabs/windows and test attendance actions

## 10. Pusher Dashboard

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new app
3. Get your app credentials from the dashboard
4. Add them to your `.env` file

## How It Works

1. **User Action**: Employee clicks clock in/out or break buttons in FloatingAttendanceWidget
2. **API Call**: Widget makes API call to AttendanceController
3. **Database Update**: Controller updates attendance record in database
4. **Event Broadcast**: Controller broadcasts AttendanceUpdated event via Pusher
5. **Real-time Update**: All subscribed components (Dashboard, FloatingWidget) receive the update instantly
6. **UI Sync**: All components update their UI to reflect the new state

## Benefits

- **Real-time sync** across multiple browser tabs/devices
- **Scalable** - works with multiple users simultaneously
- **Reliable** - uses WebSocket connections with fallbacks
- **Secure** - private channels ensure users only see their own data
- **Efficient** - only sends updates when changes occur

## Troubleshooting

1. **Echo not connecting**: Check Pusher credentials and network connectivity
2. **Events not received**: Verify channel authorization in `routes/channels.php`
3. **Multiple updates**: Ensure you're not subscribing to channels multiple times
4. **Performance issues**: Use queue workers for broadcasting events

## Development vs Production

- **Development**: Use Pusher's free tier or Laravel Reverb (local WebSocket server)
- **Production**: Use Pusher's paid plans or deploy your own WebSocket infrastructure