# Enhanced Navigation System Documentation

This document describes the enhanced navigation system implemented to fix authentication and navigation issues in the HR management system.

## Overview

The enhanced navigation system provides:
- **Navigation Guards**: Pre-navigation checks for authentication, permissions, and error recovery
- **Error Handling**: Comprehensive error handling with user-friendly messages and fallback mechanisms
- **Error Boundaries**: React-style error boundaries for Vue.js to catch navigation errors
- **Centralized Service**: NavigationGuardService for managing guards and error handling

## Components

### 1. NavigationErrorDisplay.vue
A toast-style error display component that shows user-friendly navigation error messages.

**Features:**
- Auto-dismissing error messages
- Fallback action buttons (Login, Dashboard, Reload)
- Contextual error messages based on error type

**Usage:**
```vue
<template>
  <NavigationErrorDisplay />
</template>
```

### 2. NavigationErrorBoundary.vue
An error boundary component that catches navigation-related errors and provides recovery options.

**Features:**
- Catches unhandled navigation errors
- Provides retry mechanisms
- Shows detailed error information in development
- Fallback UI when navigation fails

**Usage:**
```vue
<template>
  <NavigationErrorBoundary>
    <YourAppContent />
  </NavigationErrorBoundary>
</template>
```

### 3. NavigationExample.vue
A demo component showing the navigation system capabilities.

**Features:**
- Navigation status display
- Permission-based navigation items
- Error scenario testing
- Navigation statistics and history
- Guard management interface

## Composables

### useNavigation.js
Enhanced navigation composable with comprehensive error handling and guard integration.

**Key Features:**
- Navigation guards execution
- Error handling and recovery
- Navigation history tracking
- Permission-based route access
- Retry mechanisms

**Usage:**
```javascript
import { useNavigation } from '@/composables/useNavigation'

const {
  navigateTo,
  navigateWithRetry,
  canAccessRoute,
  getAvailableNavigation,
  isNavigating,
  lastNavigationError
} = useNavigation()

// Safe navigation
await navigateTo('/employees')

// Navigation with retry
await navigateWithRetry('/projects', {}, 3)

// Check route access
if (canAccessRoute('EMPLOYEES')) {
  // User can access employees page
}
```

## Services

### NavigationGuardService.js
Centralized service for managing navigation guards and error handling.

**Built-in Guards:**
1. **Authentication Guard** (Priority: 10)
   - Checks user authentication status
   - Redirects to login for unauthenticated users
   - Validates authentication state

2. **Permission Guard** (Priority: 20)
   - Checks user permissions for route access
   - Redirects to dashboard for insufficient permissions
   - Role-based access control

3. **Rate Limiting Guard** (Priority: 30)
   - Prevents excessive navigation requests
   - Configurable rate limits
   - Temporary blocking for abuse prevention

4. **Error Recovery Guard** (Priority: 40)
   - Prevents navigation to repeatedly failing routes
   - Tracks error history
   - Automatic recovery mechanisms

**Usage:**
```javascript
import { navigationGuardService } from '@/services/NavigationGuardService'

// Register custom guard
navigationGuardService.registerGuard('customGuard', async (to, from, options) => {
  // Custom guard logic
  return { allowed: true }
}, { priority: 50 })

// Get guard statistics
const stats = navigationGuardService.getGuardStats()

// Toggle guard
navigationGuardService.toggleGuard('authentication', false)
```

## Error Handling

### Error Types
The system handles various error types with appropriate user messages:

1. **Authentication Errors**
   - Message: "Please log in to access this page."
   - Action: Redirect to login

2. **Permission Errors**
   - Message: "You don't have permission to access this page."
   - Action: Redirect to dashboard

3. **Network Errors**
   - Message: "Network error. Please check your connection."
   - Action: Reload page

4. **Data Errors**
   - Message: "Application data error. The page may not have loaded correctly."
   - Action: Retry or reload

### Error Recovery
The system provides multiple recovery mechanisms:

1. **Automatic Retry**: Failed navigations are automatically retried with exponential backoff
2. **Fallback Routes**: Users are redirected to safe routes (dashboard, login) when navigation fails
3. **Error Boundaries**: Catch and handle errors at the component level
4. **User Actions**: Users can manually retry, go to dashboard, or reload the page

## Navigation Guards

### Guard Execution Order
Guards are executed in priority order (lower number = higher priority):

1. Error Recovery Guard (40)
2. Rate Limiting Guard (30)
3. Permission Guard (20)
4. Authentication Guard (10)
5. Custom Guards (configurable)

### Guard Results
Guards can return:
- `true` or `{ allowed: true }`: Allow navigation
- `false` or `{ allowed: false }`: Block navigation
- `{ allowed: false, reason: 'message', redirect: '/path' }`: Block with redirect
- Throw error: Block navigation and log error

### Custom Guards
You can register custom guards for specific requirements:

```javascript
// Example: Maintenance mode guard
navigationGuardService.registerGuard('maintenance', async (to, from, options) => {
  if (window.maintenanceMode && to !== '/maintenance') {
    return {
      allowed: false,
      reason: 'System is under maintenance',
      redirect: '/maintenance'
    }
  }
  return { allowed: true }
}, { priority: 5 }) // High priority
```

## Configuration

### Route Permissions
Route permissions are configured in the NavigationGuardService:

```javascript
const routePermissions = {
  '/employees': () => hasAnyRole(['Admin', 'HR']),
  '/departments': () => hasAnyRole(['Admin', 'HR']),
  '/attendances': () => hasAnyRole(['Admin', 'HR', 'Manager']),
  // ... more routes
}
```

### Error Messages
Error messages can be customized in the NavigationErrorDisplay component or through the global error handler.

### Rate Limiting
Rate limiting is configurable in the rate limiting guard:
- Window: 60 seconds (default)
- Max requests: 30 (default)
- Storage: localStorage

## Integration

### In Layouts
Add the error display and boundary components to your main layout:

```vue
<template>
  <NavigationErrorBoundary>
    <NavigationErrorDisplay />
    <div class="min-h-screen bg-gray-100">
      <!-- Your layout content -->
    </div>
  </NavigationErrorBoundary>
</template>
```

### In Components
Use the navigation composable for safe navigation:

```vue
<script setup>
import { useNavigation } from '@/composables/useNavigation'

const { navigateTo, canAccessRoute } = useNavigation()

const handleClick = async () => {
  if (canAccessRoute('EMPLOYEES')) {
    await navigateTo('/employees')
  }
}
</script>
```

## Development and Debugging

### Debug Mode
In development mode, the system provides:
- Detailed error logging
- Error details in UI
- Navigation statistics
- Guard execution logs

### Testing Error Scenarios
Use the NavigationExample component to test different error scenarios:
- Authentication errors
- Permission errors
- Network errors
- Rate limiting

### Console Commands
Debug navigation state:
```javascript
// In browser console
const { debugNavigation } = useNavigation()
debugNavigation()
```

## Best Practices

1. **Always use the navigation composable** instead of direct Inertia.js calls
2. **Check route access** before showing navigation links
3. **Handle navigation errors** gracefully in components
4. **Use error boundaries** to catch unexpected errors
5. **Test error scenarios** during development
6. **Monitor navigation statistics** in production

## Troubleshooting

### Common Issues

1. **"Cannot read properties of undefined" errors**
   - Ensure authentication data is properly shared from server
   - Check Inertia.js middleware configuration
   - Use the useAuth composable for safe data access

2. **Navigation not working**
   - Check if guards are blocking navigation
   - Verify user permissions
   - Check browser console for errors

3. **Error messages not showing**
   - Ensure NavigationErrorDisplay is included in layout
   - Check if global error handler is set up
   - Verify window.showNavigationError is available

4. **Guards not executing**
   - Ensure NavigationGuardService is initialized
   - Check guard registration
   - Verify guard priorities

### Debug Steps

1. Check authentication state: `useAuth().debugAuthState()`
2. Check navigation state: `useNavigation().debugNavigation()`
3. Check guard statistics: `navigationGuardService.getGuardStats()`
4. Clear error history: `navigationGuardService.clearErrorHistory()`

## Performance Considerations

- Guards are executed sequentially, so keep guard logic lightweight
- Error history is limited to prevent memory leaks
- Navigation history is capped at 50 entries
- Rate limiting uses localStorage for persistence

## Security Notes

- Client-side guards are for UX only; server-side validation is still required
- Sensitive data should not be exposed in error messages
- Rate limiting helps prevent abuse but is not a security measure
- Always validate permissions on the server side