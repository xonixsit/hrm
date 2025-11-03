# Development Setup - Real-time Features

## Option 1: Quick Development (No Pusher Required)

For immediate development without setting up Pusher, the system will automatically fall back to the legacy event system.

### Current Status:
- ✅ **Legacy Events**: Custom JavaScript events still work
- ✅ **UI Updates**: Dashboard and FloatingWidget sync via localStorage
- ⚠️ **Echo Disabled**: Real-time features disabled until Pusher is configured

### To Continue Development:
1. The error will disappear - Echo initialization is now conditional
2. Attendance functionality works with legacy event system
3. Multiple browser tabs will sync via localStorage events

## Option 2: Full Real-time Setup (Recommended)

### 1. Install Dependencies
```bash
npm install laravel-echo pusher-js
composer require pusher/pusher-php-server
```

### 2. Get Pusher Credentials
1. Sign up at [pusher.com](https://pusher.com) (free tier available)
2. Create a new app
3. Get your credentials from the dashboard

### 3. Update .env File
```env
# Change broadcast driver
BROADCAST_DRIVER=pusher

# Add Pusher credentials
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1

# Frontend variables (automatically set from above)
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 4. Enable Broadcasting
```bash
# Uncomment BroadcastServiceProvider in config/app.php
php artisan config:cache
```

### 5. Start Queue Worker
```bash
php artisan queue:work
```

## Testing Real-time Features

1. **Open multiple browser tabs**
2. **Clock in/out in one tab**
3. **Watch other tabs update instantly**

## Troubleshooting

### Error: "You must pass your app key when you instantiate Pusher"
- ✅ **Fixed**: Echo initialization is now conditional
- The system falls back to legacy events automatically

### No Real-time Updates
- Check if `VITE_PUSHER_APP_KEY` is set in .env
- Restart `npm run dev` after adding environment variables
- Check browser console for Echo connection status

### Events Not Broadcasting
- Ensure `BROADCAST_DRIVER=pusher` in .env
- Start queue worker: `php artisan queue:work`
- Check Laravel logs for broadcasting errors

## Development vs Production

### Development (Current)
- Legacy event system works immediately
- No external dependencies required
- Perfect for feature development

### Production (With Pusher)
- True real-time across devices/users
- Scalable WebSocket connections
- Enterprise-grade reliability