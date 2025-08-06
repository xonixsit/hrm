# Design Document

## Overview

The HR management system has critical authentication and navigation issues that prevent users from accessing any pages except the dashboard after login. The core problem is the "Cannot read properties of undefined (reading 'auth')" error, which indicates that authentication data is not being properly shared with Vue components through Inertia.js.

**Root Cause Analysis:**
1. Inertia.js `HandleInertiaRequests` middleware is not properly sharing authentication data
2. Vue components are attempting to access `page.props.auth.user` but the auth object is undefined
3. Inconsistent Inertia.js import statements across Vue components
4. Missing error handling and fallback mechanisms for authentication state
5. Deprecated Inertia.js API usage in some components

**Impact:** Users cannot navigate to employee management, attendance, leaves, departments, projects, timesheets, or feedback pages, effectively breaking the entire HR system functionality.

The solution involves fixing the Inertia.js data sharing configuration, standardizing component authentication access patterns, and implementing comprehensive error handling across all HR system modules.

## Architecture

### Current Issues Identified

1. **Inconsistent Inertia.js Imports**: Some components use `@inertiajs/inertia-vue3` (deprecated) while others use `@inertiajs/vue3` (current)
2. **Authentication Data Access**: Components are trying to access `page.props.value.auth.user` but the auth data structure may not be properly shared
3. **Missing Error Handling**: No fallback handling when authentication data is undefined
4. **Deprecated API Usage**: Using old Inertia.js router methods

### Solution Architecture

The fix will implement a standardized approach across all components:

1. **Standardized Imports**: All components will use the current `@inertiajs/vue3` package
2. **Consistent Auth Access**: Implement a composable for safe authentication data access
3. **Proper Error Handling**: Add fallback mechanisms for missing authentication data
4. **Updated API Usage**: Replace deprecated Inertia methods with current ones

## Components and Interfaces

### 1. Authentication Composable

Create a reusable composable `useAuth.js` that provides:
- Safe access to authentication data
- Role checking utilities
- Permission validation
- Error handling for missing auth data

```javascript
// composables/useAuth.js
import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

export function useAuth() {
  const page = usePage()
  
  const user = computed(() => page.props.auth?.user || null)
  const isAuthenticated = computed(() => !!user.value)
  const roles = computed(() => user.value?.roles || [])
  
  const hasRole = (role) => roles.value.includes(role)
  const hasAnyRole = (roleList) => roleList.some(role => hasRole(role))
  
  return {
    user,
    isAuthenticated,
    roles,
    hasRole,
    hasAnyRole
  }
}
```

### 2. Updated Inertia Middleware

Ensure the `HandleInertiaRequests` middleware properly shares authentication data:
- User information with roles
- Permissions data
- Error handling for missing user data

### 3. Component Standardization

All Vue components will be updated to:
- Use consistent Inertia.js imports
- Implement the `useAuth` composable
- Handle missing authentication data gracefully
- Use current Inertia.js API methods

### 4. Navigation System Enhancement

**Design Decision:** Implement a centralized navigation system that handles authentication state and role-based access control.

**Rationale:** The current navigation system fails because it doesn't properly check authentication state before rendering navigation items or handling route transitions.

Components affected:
- Employee management pages
- Attendance tracking pages
- Leave management pages
- Department management pages
- Project management pages
- Timesheet pages
- Feedback system pages

**Navigation Guard Implementation:**
```javascript
// composables/useNavigation.js
import { useAuth } from './useAuth'
import { router } from '@inertiajs/vue3'

export function useNavigation() {
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth()
  
  const navigateWithAuth = (url, options = {}) => {
    if (!isAuthenticated.value) {
      router.visit('/login')
      return
    }
    router.visit(url, options)
  }
  
  const canAccessRoute = (routeName, requiredRoles = []) => {
    if (!isAuthenticated.value) return false
    if (requiredRoles.length === 0) return true
    return hasAnyRole(requiredRoles)
  }
  
  return {
    navigateWithAuth,
    canAccessRoute
  }
}
```

### 5. Role-Based UI Components

**Design Decision:** Create wrapper components that conditionally render content based on user roles.

**Rationale:** This addresses Requirement 4 by ensuring users only see navigation options and content appropriate to their permission level.

```javascript
// components/RoleGuard.vue
<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <p>You don't have permission to access this content.</p>
    </slot>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { computed } from 'vue'

const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  },
  showFallback: {
    type: Boolean,
    default: false
  }
})

const { hasAnyRole, isAuthenticated } = useAuth()

const hasAccess = computed(() => {
  if (!isAuthenticated.value) return false
  if (props.roles.length === 0) return true
  return hasAnyRole(props.roles)
})
</script>
```

## Data Models

### Authentication Data Structure

```javascript
{
  auth: {
    user: {
      id: number,
      name: string,
      email: string,
      roles: string[], // Array of role names
      permissions: string[] // Array of permission names (if needed)
    }
  }
}
```

### Component Props Structure

Each component will receive standardized props and access auth data through the composable:

```javascript
// Component setup
const { user, hasRole, hasAnyRole } = useAuth()
const isAdmin = computed(() => hasRole('Admin'))
const canManage = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']))
```

## Error Handling

**Design Decision:** Implement comprehensive error handling that provides clear debugging information while maintaining user experience.

**Rationale:** Requirement 2 specifically calls for proper error handling and debugging information to help developers quickly identify and resolve authentication issues.

### 1. Authentication Error Handling

- Graceful degradation when auth data is missing
- Redirect to login when authentication is required
- Clear error messages for debugging
- Structured error logging for development environments

```javascript
// Enhanced useAuth composable with error handling
export function useAuth() {
  const page = usePage()
  
  const user = computed(() => {
    try {
      return page.props.auth?.user || null
    } catch (error) {
      console.error('Auth data access error:', error)
      console.warn('Page props structure:', page.props)
      return null
    }
  })
  
  const isAuthenticated = computed(() => {
    if (!user.value) {
      console.warn('User not authenticated or auth data missing')
      return false
    }
    return true
  })
  
  // Additional error context for debugging
  const debugAuthState = () => {
    console.group('Authentication Debug Info')
    console.log('Page props:', page.props)
    console.log('Auth object:', page.props.auth)
    console.log('User object:', user.value)
    console.log('Is authenticated:', isAuthenticated.value)
    console.groupEnd()
  }
  
  return {
    user,
    isAuthenticated,
    roles,
    hasRole,
    hasAnyRole,
    debugAuthState // Available in development
  }
}
```

### 2. Component Error Boundaries

- Try-catch blocks around authentication checks
- Fallback UI when authentication data is unavailable
- Console warnings for development debugging
- Structured error reporting with component context

```javascript
// Error boundary wrapper for authentication-dependent components
export function withAuthErrorHandling(component) {
  return {
    ...component,
    setup(props, context) {
      const { debugAuthState } = useAuth()
      
      onErrorCaptured((error, instance, errorInfo) => {
        if (error.message.includes('auth') || error.message.includes('undefined')) {
          console.error('Authentication-related error caught:', {
            error: error.message,
            component: instance?.$options.name || 'Unknown',
            errorInfo,
            timestamp: new Date().toISOString()
          })
          
          // Provide debug information
          debugAuthState()
          
          return false // Prevent error from propagating
        }
      })
      
      return component.setup?.(props, context) || {}
    }
  }
}
```

### 3. Network Error Handling

- Handle Inertia.js request failures
- Retry mechanisms for failed authentication checks
- User-friendly error messages
- Detailed logging for Inertia.js configuration issues

### 4. Development Debugging Tools

**Design Decision:** Provide debugging utilities specifically for authentication issues.

**Rationale:** This directly addresses Requirement 2's need for meaningful error information and debugging capabilities.

```javascript
// Development debugging utility
export function createAuthDebugger() {
  if (process.env.NODE_ENV !== 'development') {
    return { log: () => {}, warn: () => {}, error: () => {} }
  }
  
  return {
    log: (message, data) => {
      console.log(`[AUTH DEBUG] ${message}`, data)
    },
    warn: (message, data) => {
      console.warn(`[AUTH WARNING] ${message}`, data)
    },
    error: (message, error, context) => {
      console.group(`[AUTH ERROR] ${message}`)
      console.error('Error:', error)
      console.log('Context:', context)
      console.trace('Stack trace')
      console.groupEnd()
    }
  }
}
```

## Testing Strategy

### 1. Unit Tests

- Test the `useAuth` composable with various authentication states
- Test component behavior with and without authentication data
- Test role-based access control logic

### 2. Integration Tests

- Test navigation between pages with authentication
- Test role-based UI rendering
- Test authentication data persistence across page transitions

### 3. End-to-End Tests

- Test complete user workflows (login → navigate → perform actions)
- Test different user roles and their access patterns
- Test error scenarios (network failures, invalid auth data)

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create the `useAuth` composable
2. Update the Inertia middleware to ensure proper data sharing
3. Create error handling utilities

### Phase 2: Component Updates
1. Update all Index.vue components with standardized imports
2. Replace authentication logic with the `useAuth` composable
3. Add error handling and fallback UI

### Phase 3: Testing and Validation
1. Test all navigation paths
2. Verify role-based access control
3. Test error scenarios and edge cases

### Phase 4: Documentation and Cleanup
1. Document the new authentication patterns
2. Remove deprecated code
3. Add development guidelines for future components

## Security Considerations

1. **Client-Side Role Checking**: Remember that client-side role checks are for UI purposes only; server-side validation is still required
2. **Sensitive Data**: Avoid exposing sensitive user data in the shared authentication object
3. **Session Management**: Ensure proper session handling and logout functionality
4. **CSRF Protection**: Maintain Laravel's CSRF protection for all authenticated requests

## Performance Considerations

1. **Computed Properties**: Use Vue's computed properties for derived authentication state
2. **Minimal Re-renders**: Optimize authentication checks to prevent unnecessary component re-renders
3. **Caching**: Consider caching role/permission checks where appropriate
4. **Bundle Size**: Keep the authentication utilities lightweight to minimize bundle impact

## Console errors 
