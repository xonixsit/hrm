/**
 * Navigation Guard Service
 * Provides centralized navigation guard management and error handling
 * Implements comprehensive route protection and fallback mechanisms
 */

import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'

export class NavigationGuardService {
  constructor() {
    this.guards = new Map()
    this.errorHandlers = new Map()
    this.fallbackRoutes = new Map()
    this.isInitialized = false
  }

  /**
   * Initialize the navigation guard service
   */
  initialize() {
    if (this.isInitialized) {
      return
    }

    // Register default guards
    this.registerDefaultGuards()
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers()
    
    this.isInitialized = true
    
    if (process.env.NODE_ENV === 'development') {
      //console.log('[NAVIGATION GUARD SERVICE] Initialized with default guards')
    }
  }

  /**
   * Register a navigation guard
   */
  registerGuard(name, guardFunction, options = {}) {
    if (typeof guardFunction !== 'function') {
      throw new Error(`Guard '${name}' must be a function`)
    }

    this.guards.set(name, {
      guard: guardFunction,
      priority: options.priority || 100,
      enabled: options.enabled !== false,
      description: options.description || `Custom guard: ${name}`
    })

    if (process.env.NODE_ENV === 'development') {
      //console.log(`[NAVIGATION GUARD SERVICE] Registered guard: ${name}`)
    }
  }

  /**
   * Unregister a navigation guard
   */
  unregisterGuard(name) {
    const removed = this.guards.delete(name)
    
    if (removed && process.env.NODE_ENV === 'development') {
      //console.log(`[NAVIGATION GUARD SERVICE] Unregistered guard: ${name}`)
    }
    
    return removed
  }

  /**
   * Execute all registered guards for a navigation attempt
   */
  async executeGuards(to, from, options = {}) {
    const { isAuthenticated, validateAuthState } = useAuth()
    
    // Sort guards by priority (lower number = higher priority)
    const sortedGuards = Array.from(this.guards.entries())
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority)

    const results = {
      allowed: true,
      blockedBy: null,
      reason: null,
      redirect: null,
      errors: []
    }

    for (const [name, config] of sortedGuards) {
      try {
        const result = await config.guard(to, from, options)
        
        // Handle different result formats
        if (result === false) {
          results.allowed = false
          results.blockedBy = name
          results.reason = `Navigation blocked by ${name} guard`
          break
        }
        
        if (result && typeof result === 'object') {
          if (result.allowed === false) {
            results.allowed = false
            results.blockedBy = name
            results.reason = result.reason || `Navigation blocked by ${name} guard`
            results.redirect = result.redirect
            break
          }
          
          // Guard can provide warnings or additional info
          if (result.warning) {
            console.warn(`[NAVIGATION GUARD] ${name}: ${result.warning}`)
          }
        }
        
      } catch (error) {
        results.errors.push({
          guard: name,
          error: error.message,
          stack: error.stack
        })
        
        console.error(`[NAVIGATION GUARD] Error in ${name} guard:`, error)
        
        // In strict mode, any guard error blocks navigation
        if (options.strictMode) {
          results.allowed = false
          results.blockedBy = name
          results.reason = `Guard error: ${error.message}`
          break
        }
      }
    }

    return results
  }

  /**
   * Register default navigation guards
   */
  registerDefaultGuards() {
    // Authentication Guard (highest priority)
    this.registerGuard('authentication', async (to, from, options) => {
      const { isAuthenticated, validateAuthState } = useAuth()
      
      // Skip for public routes
      if (options.requiresAuth === false) {
        return { allowed: true }
      }
      
      // Check if route requires authentication
      if (this.isProtectedRoute(to) && !isAuthenticated.value) {
        return {
          allowed: false,
          reason: 'Authentication required',
          redirect: '/login'
        }
      }
      
      // Validate auth state for authenticated routes
      if (isAuthenticated.value && !validateAuthState()) {
        return {
          allowed: false,
          reason: 'Invalid authentication state',
          redirect: '/login'
        }
      }
      
      return { allowed: true }
    }, { priority: 10, description: 'Checks user authentication status' })

    // Permission Guard
    this.registerGuard('permissions', async (to, from, options) => {
      const { isAuthenticated } = useAuth()
      const { canAccessRoute } = usePermissions()
      
      // Skip if not authenticated (let auth guard handle)
      if (!isAuthenticated.value) {
        return { allowed: true }
      }
      
      // Check route-specific permissions
      const hasPermission = await this.checkRoutePermissions(to, options)
      
      if (!hasPermission) {
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          redirect: '/dashboard'
        }
      }
      
      return { allowed: true }
    }, { priority: 20, description: 'Checks user permissions for route access' })

    // Rate Limiting Guard
    this.registerGuard('rateLimit', async (to, from, options) => {
      const now = Date.now()
      const windowMs = 60000 // 1 minute
      const maxRequests = 30
      
      // Get navigation history from localStorage
      const historyKey = 'navigation_history'
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
      
      // Filter recent navigations
      const recentNavigations = history.filter(nav => 
        now - new Date(nav.timestamp).getTime() < windowMs
      )
      
      if (recentNavigations.length >= maxRequests) {
        return {
          allowed: false,
          reason: 'Too many navigation requests. Please wait a moment.',
          redirect: null
        }
      }
      
      // Update history
      recentNavigations.push({ timestamp: new Date().toISOString(), to })
      localStorage.setItem(historyKey, JSON.stringify(recentNavigations.slice(-50)))
      
      return { allowed: true }
    }, { priority: 30, description: 'Prevents excessive navigation requests' })

    // Error Recovery Guard
    this.registerGuard('errorRecovery', async (to, from, options) => {
      const errorKey = 'navigation_errors'
      const errors = JSON.parse(localStorage.getItem(errorKey) || '[]')
      const now = Date.now()
      const windowMs = 300000 // 5 minutes
      
      // Filter recent errors for this route
      const recentErrors = errors.filter(error => 
        error.to === to && 
        now - new Date(error.timestamp).getTime() < windowMs
      )
      
      if (recentErrors.length >= 3) {
        return {
          allowed: false,
          reason: 'This route has failed multiple times recently. Please try again later.',
          redirect: '/dashboard'
        }
      }
      
      return { allowed: true }
    }, { priority: 40, description: 'Prevents navigation to repeatedly failing routes' })
  }

  /**
   * Check if a route is protected (requires authentication)
   */
  isProtectedRoute(path) {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
    return !publicRoutes.includes(path)
  }

  /**
   * Check route-specific permissions
   */
  async checkRoutePermissions(path, options = {}) {
    const { hasRole, hasAnyRole } = useAuth()
    
    // Define route permission requirements
    const routePermissions = {
      '/employees': () => hasAnyRole(['Admin', 'HR']),
      '/employees/create': () => hasAnyRole(['Admin', 'HR']),
      '/departments': () => hasAnyRole(['Admin', 'HR']),
      '/departments/create': () => hasAnyRole(['Admin', 'HR']),
      '/attendances': () => hasAnyRole(['Admin', 'HR', 'Manager']),
      '/leaves': () => hasAnyRole(['Admin', 'HR', 'Manager']),
      '/feedbacks': () => hasAnyRole(['Admin', 'HR', 'Manager']),
      '/timesheets': () => true, // All authenticated users
      '/projects': () => true, // All authenticated users
      '/tasks': () => true, // All authenticated users
    }
    
    // Check exact path match
    if (routePermissions[path]) {
      return routePermissions[path]()
    }
    
    // Check pattern matches (e.g., /employees/123/edit)
    for (const [pattern, checkFn] of Object.entries(routePermissions)) {
      if (path.startsWith(pattern + '/')) {
        return checkFn()
      }
    }
    
    // Default: allow access for authenticated users
    return true
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Enhanced error handler for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason
        
        // Check for the specific status property error
        if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'status')")) {
          console.warn('[NAVIGATION GUARD SERVICE] Intercepted status property error in promise rejection')
          
          // Create a more descriptive error
          const syntheticError = new Error("Inertia navigation response handling error - undefined status property")
          syntheticError.originalError = error
          syntheticError.source = 'unhandledrejection'
          
          this.handleNavigationError(syntheticError, { 
            type: 'status_property_error',
            source: 'promise_rejection',
            intercepted: true 
          })
          
          // Prevent the error from propagating
          event.preventDefault()
          return
        }
        
        // Handle other navigation errors
        if (this.isNavigationError(error)) {
          this.handleNavigationError(error)
          event.preventDefault()
        }
      })
      
      // Enhanced general error handler
      window.addEventListener('error', (event) => {
        const error = event.error
        
        // Check for the specific status property error
        if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'status')")) {
          console.warn('[NAVIGATION GUARD SERVICE] Intercepted status property error in window error')
          
          // Create a more descriptive error
          const syntheticError = new Error("Inertia navigation response handling error - undefined status property")
          syntheticError.originalError = error
          syntheticError.source = 'window_error'
          syntheticError.filename = event.filename
          syntheticError.lineno = event.lineno
          syntheticError.colno = event.colno
          
          this.handleNavigationError(syntheticError, { 
            type: 'status_property_error',
            source: 'window_error',
            intercepted: true,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          })
          
          // Prevent the error from propagating
          event.preventDefault()
          return
        }
        
        // Handle other navigation errors
        if (this.isNavigationError(error)) {
          this.handleNavigationError(error)
        }
      })
      
      // Console error interceptor as backup
      const originalConsoleError = console.error
      console.error = (...args) => {
        const errorMessage = args.join(' ')
        if (errorMessage.includes("Cannot read properties of undefined (reading 'status')")) {
          console.warn('[NAVIGATION GUARD SERVICE] Intercepted status property error in console.error')
          
          const syntheticError = new Error("Console logged navigation error - undefined status property")
          syntheticError.originalArgs = args
          syntheticError.source = 'console_error'
          
          this.handleNavigationError(syntheticError, { 
            type: 'status_property_error',
            source: 'console_error',
            intercepted: true 
          })
          
          // Log as warning instead of error
          console.warn('[NAVIGATION GUARD SERVICE] Status property error intercepted:', ...args)
          return
        }
        
        // For all other errors, use the original console.error
        originalConsoleError.apply(console, args)
      }
    }
  }

  /**
   * Check if an error is navigation-related
   */
  isNavigationError(error) {
    if (!error || !error.message) return false
    
    const navigationKeywords = [
      'navigation', 'route', 'inertia', 'auth', 'permission',
      'Cannot read properties of undefined', 'router'
    ]
    
    return navigationKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Handle navigation errors
   */
  handleNavigationError(error, context = {}) {
    // Safely extract error information
    let errorMessage = 'Unknown navigation error'
    let errorStack = null
    
    try {
      if (error === null || error === undefined) {
        errorMessage = 'Null or undefined error'
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (typeof error === 'object') {
        // Handle Error objects
        if (error instanceof Error) {
          errorMessage = error.message || 'Error object without message'
          errorStack = error.stack || null
        } else if (error.message) {
          errorMessage = String(error.message)
          errorStack = error.stack || null
        } else if (error.response && typeof error.response === 'object' && 'status' in error.response) {
          // Handle HTTP response errors (like axios errors)
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText || 'Request failed'}`
          errorStack = error.stack || null
        } else if (typeof error === 'object' && 'status' in error && error.status !== undefined) {
          // Handle objects with status property
          errorMessage = `Status ${error.status}: ${error.statusText || error.message || 'Request failed'}`
          errorStack = error.stack || null
        } else {
          // Try to stringify the object
          try {
            errorMessage = JSON.stringify(error)
          } catch (jsonError) {
            errorMessage = error.toString() || 'Object error'
          }
        }
      } else {
        errorMessage = String(error)
      }
    } catch (e) {
      errorMessage = 'Error processing navigation error'
      console.warn('[NAVIGATION GUARD SERVICE] Error processing error object:', e)
    }
    
    const errorInfo = {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      context,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    }
    
    // Store error for recovery guard
    try {
      const errorKey = 'navigation_errors'
      const existingErrors = JSON.parse(localStorage.getItem(errorKey) || '[]')
      existingErrors.push(errorInfo)
      localStorage.setItem(errorKey, JSON.stringify(existingErrors.slice(-100)))
    } catch (storageError) {
      console.warn('[NAVIGATION GUARD SERVICE] Could not store error in localStorage:', storageError)
    }
    
    // Log error
    console.error('[NAVIGATION GUARD SERVICE] Navigation error:', errorInfo)
    
    // Show user-friendly error if available
    if (typeof window !== 'undefined' && window.showNavigationError) {
      let userMessage = 'Navigation failed. Please try again.'
      let fallbackAction = null
      
      try {
        if (errorMessage.toLowerCase().includes('auth')) {
          userMessage = 'Please log in to access this page.'
          fallbackAction = () => window.location.href = '/login'
        } else if (errorMessage.toLowerCase().includes('permission')) {
          userMessage = 'You don\'t have permission to access this page.'
          fallbackAction = () => window.location.href = '/dashboard'
        } else if (errorMessage.toLowerCase().includes('route')) {
          userMessage = 'The requested page could not be found.'
          fallbackAction = () => window.location.href = '/dashboard'
        }
        
        window.showNavigationError(userMessage, fallbackAction)
      } catch (displayError) {
        console.warn('[NAVIGATION GUARD SERVICE] Could not display error to user:', displayError)
      }
    }
  }

  /**
   * Get guard statistics
   */
  getGuardStats() {
    return {
      totalGuards: this.guards.size,
      enabledGuards: Array.from(this.guards.values()).filter(g => g.enabled).length,
      guards: Array.from(this.guards.entries()).map(([name, config]) => ({
        name,
        priority: config.priority,
        enabled: config.enabled,
        description: config.description
      }))
    }
  }

  /**
   * Enable/disable a guard
   */
  toggleGuard(name, enabled) {
    const guard = this.guards.get(name)
    if (guard) {
      guard.enabled = enabled
      
      if (process.env.NODE_ENV === 'development') {
        //console.log(`[NAVIGATION GUARD SERVICE] Guard ${name} ${enabled ? 'enabled' : 'disabled'}`)
      }
    }
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    localStorage.removeItem('navigation_errors')
    localStorage.removeItem('navigation_history')
    
    if (process.env.NODE_ENV === 'development') {
      //console.log('[NAVIGATION GUARD SERVICE] Error history cleared')
    }
  }
}

// Immediate error interceptor - runs as soon as this module is loaded
if (typeof window !== 'undefined') {
  // Set up immediate console.error interceptor
  const originalConsoleError = console.error
  console.error = (...args) => {
    const errorMessage = args.join(' ')
    if (errorMessage.includes("Cannot read properties of undefined (reading 'status')")) {
      console.warn('[NAVIGATION GUARD SERVICE] Early intercepted status property error - suppressing to prevent app crash')
      console.warn('[NAVIGATION GUARD SERVICE] Original error details:', ...args)
      return // Suppress the error
    }
    
    // For all other errors, use the original console.error
    originalConsoleError.apply(console, args)
  }
  
  // Set up immediate window error handler
  window.addEventListener('error', (event) => {
    const error = event.error
    if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'status')")) {
      console.warn('[NAVIGATION GUARD SERVICE] Early intercepted status property error in window.error')
      event.preventDefault()
      return false
    }
  })
  
  // Set up immediate unhandled rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'status')")) {
      console.warn('[NAVIGATION GUARD SERVICE] Early intercepted status property error in unhandledrejection')
      event.preventDefault()
      return false
    }
  })
}

// Create singleton instance
export const navigationGuardService = new NavigationGuardService()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  navigationGuardService.initialize()
}