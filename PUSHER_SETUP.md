# Laravel Pusher Broadcasting Setup

This document explains how to set up Laravel Pusher broadcasting for real-time attendance updates.

## 1. Pusher Account Setup

1. Go to [Pusher.com](https://pusher.com) and create a free account
2. Create a new app in your Pusher dashboard
3. Get your app credentials from the "App Keys" tab

## 2. Environment Configuration

Add these variables to your `.env` file:

```env
# Broadcasting
BROADCAST_DRIVER=pusher

# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster

# Vite Pusher Configuration (for frontend)
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
```

## 3. Install Required Packages

Make sure you have the required packages installed:

```bash
# PHP packages (should already be installed)
composer require pusher/pusher-php-server

# JavaScript packages (should already be installed)
npm install laravel-echo pusher-js
```

## 4. Queue Configuration

For broadcasting to work properly, you need to set up queues:

```env
QUEUE_CONNECTION=database
```

Then run the queue worker:

```bash
php artisan queue:work
```

## 5. How It Works

### Backend (Laravel)
1. **AttendanceController** methods (clockIn, clockOut, startBreak, endBreak) call `broadcastAttendanceUpdate()`
2. **AttendanceUpdated Event** is broadcast via Pusher to private channel `attendance.{employee_id}`
3. **Real-time updates** are sent to all connected clients for that employee

### Frontend (Vue.js)
1. **EmployeeDashboard** subscribes to `attendance.{employee_id}` channel on mount
2. **FloatingAttendanceWidget** also subscribes to the same channel
3. **Real-time updates** are received and local state is updated immediately
4. **UI updates** happen instantly without page refresh

## 6. Broadcasting Channels

- **Private Channel**: `attendance.{employee_id}`
- **Event Name**: `attendance.updated`
- **Data Structure**:
  ```json
  {
    "employee_id": 123,
    "clocked_in": true,
    "on_break": false,
    "clock_in_time": "2024-01-15T09:00:00.000Z",
    "current_break_start": null,
    "todays_summary": {
      "total_hours": "2h 30m",
      "break_time": "0h 15m"
    },
    "timestamp": "2024-01-15T11:30:00.000Z",
    "action": "clock-in"
  }
  ```

## 7. Action Types

- `clock-in`: User clocked in
- `clock-out`: User clocked out  
- `start-break`: User started a break
- `end-break`: User ended a break
- `update`: General attendance update

## 8. Testing

1. **Enable broadcasting**: Set `BROADCAST_DRIVER=pusher` in `.env`
2. **Start queue worker**: `php artisan queue:work`
3. **Open multiple browser tabs** with the same user logged in
4. **Clock in/out or take breaks** in one tab
5. **Watch real-time updates** in other tabs

## 9. Troubleshooting

### No real-time updates
- Check if `BROADCAST_DRIVER=pusher` in `.env`
- Verify Pusher credentials are correct
- Ensure queue worker is running: `php artisan queue:work`
- Check browser console for Echo connection errors

### Echo not connecting
- Verify `VITE_PUSHER_APP_KEY` and `VITE_PUSHER_APP_CLUSTER` in `.env`
- Run `npm run build` or `npm run dev` after changing Vite variables
- Check browser network tab for WebSocket connection

### Authentication errors
- Ensure user is logged in and has an employee record
- Check that private channel authorization is working
- Verify CSRF token is properly set

## 10. Development vs Production

### Development
- Use Pusher's free tier (100 connections, 200k messages/day)
- Queue worker can run with `php artisan queue:work`

### Production
- Consider upgrading Pusher plan for more connections
- Use supervisor or similar to manage queue workers
- Set up proper queue monitoring and error handling