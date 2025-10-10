# System Settings Middleware Fix

## Issue
The System Settings routes were using a `role:Admin` middleware that doesn't exist in the application, causing the error:
```
Illuminate\Contracts\Container\BindingResolutionException
Target class [role] does not exist.
```

## Root Cause
The application doesn't have a registered `role` middleware. Instead, it uses direct role checking in controllers with the `hasRole()` method on the User model.

## Solution Applied

### 1. **Updated Routes (routes/web.php)**
**Before:**
```php
Route::middleware(['auth', 'role:Admin'])->prefix('admin')->group(function () {
    // System Settings routes
});
```

**After:**
```php
Route::middleware(['auth'])->prefix('admin')->group(function () {
    // System Settings routes - role check moved to controller
});
```

### 2. **Added Role Checks in Controller**
Added admin role verification in each method of `SystemSettingsController`:

```php
public function index(): Response
{
    // Check if user has admin role
    if (!auth()->user()->hasRole('Admin')) {
        abort(403, 'Only administrators can access system settings.');
    }
    
    // ... rest of method
}
```

**Applied to all methods:**
- ✅ `index()` - Display system settings page
- ✅ `update()` - Update system settings
- ✅ `clearCache()` - Clear system cache
- ✅ `optimize()` - Run system optimization
- ✅ `health()` - Get system health status

### 3. **Security Maintained**
- **Same Security Level**: Admin-only access is still enforced
- **Consistent Pattern**: Follows the same pattern used in other controllers
- **Proper Error Handling**: Returns 403 Forbidden for unauthorized access
- **Clear Error Messages**: Descriptive error messages for each action

## Benefits of This Approach

### **Consistency:**
- Matches the existing codebase pattern
- Uses the same `hasRole('Admin')` method used throughout the application
- No need to create additional middleware

### **Security:**
- Maintains admin-only access control
- Proper HTTP status codes (403 Forbidden)
- Clear error messages for unauthorized access

### **Maintainability:**
- Easy to understand and modify
- Follows existing code patterns
- No additional middleware to maintain

## Verification
The System Settings functionality now works correctly:
- ✅ **Routes Load**: No more middleware binding errors
- ✅ **Admin Access**: Only users with Admin role can access
- ✅ **Security**: Proper 403 errors for unauthorized users
- ✅ **Functionality**: All system settings features work as expected

## Usage
Administrators can now access System Settings via:
1. **Dashboard Header**: "System Settings" button
2. **Quick Actions**: System Settings link in sidebar
3. **Direct URL**: `/admin/system-settings`

Non-admin users will receive a 403 Forbidden error with a clear message explaining that only administrators can access system settings.