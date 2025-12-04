import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

/**
 * Authentication composable for safe access to user authentication data
 * Provides utilities for role checking and comprehensive error handling
 * Integrates with the authentication error handling system
 */
export function useAuth() {
  const page = usePage()
  
  // Enhanced error reporting function with structured logging
  const reportError = (error, context) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔐 [AUTH ERROR] ${context}`)
      console.error('Error:', error)
      //console.log('Page props structure:', page.props ? Object.keys(page.props) : 'No props')
      //console.log('Auth object:', page.props?.auth)
      //console.log('Timestamp:', new Date().toISOString())
      console.trace('Stack trace')
      console.groupEnd()
    }
    
    // Emit custom event for error boundary to catch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-error', {
        detail: { error, context, timestamp: new Date().toISOString() }
      }))
    }
  }
  
  // Safe access to user data with enhanced error handling
  const user = computed(() => {
    try {
      const userData = page.props.auth?.user || null
      
      if (!userData && process.env.NODE_ENV === 'development') {
        console.warn('[AUTH DEBUG] User data not available', {
          hasPageProps: !!page.props,
          hasAuth: !!page.props?.auth,
          authKeys: page.props?.auth ? Object.keys(page.props.auth) : [],
          timestamp: new Date().toISOString()
        })
      }
      
      return userData
    } catch (error) {
      reportError(error, 'accessing user data')
      return null
    }
  })
  
  // Authentication state with enhanced validation
  const isAuthenticated = computed(() => {
    try {
      const authenticated = !!user.value
      
      if (!authenticated && process.env.NODE_ENV === 'development') {
        console.warn('[AUTH DEBUG] User not authenticated', {
          hasUser: !!user.value,
          pagePropsStructure: page.props ? Object.keys(page.props) : 'No page props',
          timestamp: new Date().toISOString()
        })
      }
      
      return authenticated
    } catch (error) {
      reportError(error, 'checking authentication state')
      return false
    }
  })
  
  // Safe access to user roles with validation
  const roles = computed(() => {
    try {
      const userRoles = user.value?.roles || []
      
      if (!Array.isArray(userRoles)) {
        console.warn('[AUTH WARNING] User roles is not an array:', userRoles)
        return []
      }
      
      return userRoles
    } catch (error) {
      reportError(error, 'accessing user roles')
      return []
    }
  })
  
  // Enhanced role checking utilities
  const hasRole = (role) => {
    try {
      if (!role || typeof role !== 'string') {
        console.warn('[AUTH WARNING] Invalid role parameter:', role)
        return false
      }
      
      if (!isAuthenticated.value) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AUTH DEBUG] Role check for '${role}' failed: user not authenticated`)
        }
        return false
      }
      
      return roles.value.some(r => typeof r === 'string' ? r === role : r.name === role)
    } catch (error) {
      reportError(error, `checking role '${role}'`)
      return false
    }
  }
  
  const hasAnyRole = (roleList) => {
    try {
      if (!Array.isArray(roleList)) {
        console.warn('[AUTH WARNING] hasAnyRole expects an array, received:', roleList)
        return false
      }
      
      if (!isAuthenticated.value) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AUTH DEBUG] Role check for ${roleList} failed: user not authenticated`)
        }
        return false
      }
      
      return roleList.some(role => hasRole(role))
    } catch (error) {
      reportError(error, `checking multiple roles ${roleList}`)
      return false
    }
  }
  
  const hasAllRoles = (roleList) => {
    try {
      if (!Array.isArray(roleList)) {
        console.warn('[AUTH WARNING] hasAllRoles expects an array, received:', roleList)
        return false
      }
      
      if (!isAuthenticated.value) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AUTH DEBUG] Role check for ${roleList} failed: user not authenticated`)
        }
        return false
      }
      
      return roleList.every(role => hasRole(role))
    } catch (error) {
      reportError(error, `checking all roles ${roleList}`)
      return false
    }
  }
  
  // Enhanced debug utility for development
  const debugAuthState = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔐 Authentication Debug Info')
      //console.log('Timestamp:', new Date().toISOString())
      //console.log('Page props available:', !!page.props)
      //console.log('Page props keys:', page.props ? Object.keys(page.props) : 'None')
      //console.log('Auth object:', page.props?.auth)
      //console.log('Auth object keys:', page.props?.auth ? Object.keys(page.props.auth) : 'None')
      //console.log('User object:', user.value)
      //console.log('User object keys:', user.value ? Object.keys(user.value) : 'None')
      //console.log('Is authenticated:', isAuthenticated.value)
      //console.log('User roles:', roles.value)
      //console.log('Roles type:', typeof roles.value, Array.isArray(roles.value) ? '(array)' : '(not array)')
      console.groupEnd()
    }
  }
  
  // Enhanced error detection and reporting
  const getAuthError = () => {
    try {
      if (!page.props) {
        return {
          type: 'critical',
          message: 'Page props not available',
          code: 'NO_PAGE_PROPS'
        }
      }
      
      if (!page.props.auth) {
        return {
          type: 'critical',
          message: 'Auth data not shared from server',
          code: 'NO_AUTH_DATA',
          context: { availableProps: Object.keys(page.props) }
        }
      }
      
      if (!page.props.auth.user) {
        return {
          type: 'critical',
          message: 'User data not available in auth object',
          code: 'NO_USER_DATA',
          context: { authKeys: Object.keys(page.props.auth) }
        }
      }
      
      if (!Array.isArray(page.props.auth.user.roles)) {
        return {
          type: 'warning',
          message: 'User roles data is invalid or missing',
          code: 'INVALID_ROLES',
          context: { 
            rolesType: typeof page.props.auth.user.roles,
            rolesValue: page.props.auth.user.roles
          }
        }
      }
      
      return null
    } catch (error) {
      return {
        type: 'critical',
        message: 'Error while checking authentication state',
        code: 'AUTH_CHECK_ERROR',
        error: error.message
      }
    }
  }
  
  // Safe getter for user properties with enhanced error handling
  const getUserProperty = (property, defaultValue = null) => {
    try {
      if (!property || typeof property !== 'string') {
        console.warn('[AUTH WARNING] Invalid property parameter:', property)
        return defaultValue
      }
      
      if (!user.value) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AUTH DEBUG] Cannot get property '${property}': user not available`)
        }
        return defaultValue
      }
      
      return user.value[property] ?? defaultValue
    } catch (error) {
      reportError(error, `accessing user property '${property}'`)
      return defaultValue
    }
  }
  
  // Validation function for authentication state
  const validateAuthState = () => {
    const error = getAuthError()
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[AUTH VALIDATION] ${error.message}`, error.context || {})
      }
      return false
    }
    return true
  }
  
  // Safe execution wrapper for auth-dependent operations
  const withAuthCheck = (operation, fallback = null) => {
    try {
      if (!validateAuthState()) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AUTH DEBUG] Operation skipped due to invalid auth state')
        }
        return fallback
      }
      
      return operation()
    } catch (error) {
      reportError(error, 'executing auth-dependent operation')
      return fallback
    }
  }
  
  return {
    // Core authentication data
    user,
    isAuthenticated,
    roles,
    
    // Role checking utilities
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Utility functions
    debugAuthState,
    getAuthError,
    getUserProperty,
    validateAuthState,
    withAuthCheck
  }
}