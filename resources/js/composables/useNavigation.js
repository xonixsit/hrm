import { ref, computed, onMounted, onUnmounted } from 'vue'
import { router } from '@inertiajs/vue3'
import { useAuth } from './useAuth.js'
import { usePermissions } from './usePermissions.js'
import { useAuthErrorHandler } from './useAuthErrorHandler.js'
import { navigationGuardService } from '@/services/NavigationGuardService.js'

/**
 * Enhanced navigation composable with comprehensive error handling and guards
 * Provides safe navigation with authentication and permission checks
 * Implements navigation guards and fallback mechanisms
 */
export function useNavigation() {
  const { 
    isAuthenticated, 
    validateAuthState, 
    debugAuthState 
  } = useAuth()
  
  const {
    canManageEmployees,
    canAccessHROperations,
    canManageProjects,
    isAdmin
  } = usePermissions()
  
  const {
    handleNavigationError,
    handleAuthError,
    safeExecute,
    ERROR_LEVELS,
    ERROR_CATEGORIES
  } = useAuthErrorHandler()
  
  const navigationHistory = ref([])
  const isNavigating = ref(false)
  const lastNavigationError = ref(null)
  const navigationGuards = ref([])
  const globalErrorHandler = ref(null)
  const navigationErrorQueue = ref([])
  const isGuardActive = ref(false)
  
  // Route definitions with permission requirements
  const ROUTES = {
    // Public routes
    LOGIN: { path: '/login', requiresAuth: false },
    REGISTER: { path: '/register', requiresAuth: false },
    
    // Authenticated routes
    DASHBOARD: { path: '/dashboard', requiresAuth: true },
    
    // Employee management routes
    EMPLOYEES: { 
      path: '/employees', 
      requiresAuth: true, 
      requiresPermission: () => canManageEmployees.value 
    },
    EMPLOYEES_CREATE: { 
      path: '/employees/create', 
      requiresAuth: true, 
      requiresPermission: () => canManageEmployees.value 
    },
    DEPARTMENTS: { 
      path: '/departments', 
      requiresAuth: true, 
      requiresPermission: () => canManageEmployees.value 
    },
    
    // HR operations routes
    LEAVES: { 
      path: '/leaves', 
      requiresAuth: true, 
      requiresPermission: () => canAccessHROperations.value 
    },
    ATTENDANCES: { 
      path: '/attendances', 
      requiresAuth: true, 
      requiresPermission: () => canAccessHROperations.value 
    },
    FEEDBACKS: { 
      path: '/feedbacks', 
      requiresAuth: true, 
      requiresPermission: () => canAccessHROperations.value 
    },
    
    // Project management routes
    PROJECTS: { 
      path: '/projects', 
      requiresAuth: true 
    },
    TASKS: { 
      path: '/tasks', 
      requiresAuth: true 
    },
    TIMESHEETS: { 
      path: '/timesheets', 
      requiresAuth: true 
    }
  }
  
  /**
   * Navigation Guard System
   * Provides comprehensive pre-navigation checks and error handling
   */
  
  /**
   * Register a navigation guard
   */
  const addNavigationGuard = (guard) => {
    if (typeof guard !== 'function') {
      console.warn('[NAVIGATION GUARD] Guard must be a function')
      return
    }
    
    navigationGuards.value.push(guard)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NAVIGATION GUARD] Registered guard (total: ${navigationGuards.value.length})`)
    }
  }
  
  /**
   * Remove a navigation guard
   */
  const removeNavigationGuard = (guard) => {
    const index = navigationGuards.value.indexOf(guard)
    if (index > -1) {
      navigationGuards.value.splice(index, 1)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NAVIGATION GUARD] Removed guard (total: ${navigationGuards.value.length})`)
      }
    }
  }
  
  /**
   * Execute all navigation guards using the centralized service
   */
  const executeNavigationGuards = async (to, from, options = {}) => {
    if (isGuardActive.value) {
      console.warn('[NAVIGATION GUARD] Guards already executing, skipping')
      return { allowed: false, reason: 'Guards already active' }
    }
    
    isGuardActive.value = true
    
    try {
      // Use the centralized navigation guard service
      const result = await navigationGuardService.executeGuards(to, from, options)
      
      // Record any errors from the service
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          navigationErrorQueue.value.push({
            type: 'guard_error',
            error: error.error,
            guard: error.guard,
            timestamp: new Date().toISOString(),
            to,
            from
          })
        })
      }
      
      return result
      
    } finally {
      isGuardActive.value = false
    }
  }
  
  /**
   * Built-in authentication guard
   */
  const authenticationGuard = async (to, from, options = {}) => {
    // Skip auth check for public routes
    if (options.requiresAuth === false) {
      return { allowed: true }
    }
    
    // Check if route requires authentication
    const routeConfig = Object.values(ROUTES).find(route => route.path === to)
    if (routeConfig?.requiresAuth === false) {
      return { allowed: true }
    }
    
    // Validate authentication state
    if (!validateAuthState()) {
      return {
        allowed: false,
        reason: 'Authentication state is invalid',
        redirect: '/login'
      }
    }
    
    if (!isAuthenticated.value) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        redirect: '/login'
      }
    }
    
    return { allowed: true }
  }
  
  /**
   * Built-in permission guard
   */
  const permissionGuard = async (to, from, options = {}) => {
    // Skip if not authenticated
    if (!isAuthenticated.value) {
      return { allowed: true } // Let auth guard handle this
    }
    
    // Find route configuration
    const routeConfig = Object.values(ROUTES).find(route => route.path === to)
    
    // Check permission requirements
    if (routeConfig?.requiresPermission) {
      try {
        const hasPermission = routeConfig.requiresPermission()
        
        if (!hasPermission) {
          return {
            allowed: false,
            reason: 'Insufficient permissions for this route',
            redirect: '/dashboard'
          }
        }
      } catch (error) {
        console.error('[PERMISSION GUARD] Permission check failed:', error)
        
        return {
          allowed: false,
          reason: `Permission check error: ${error.message}`,
          redirect: '/dashboard'
        }
      }
    }
    
    return { allowed: true }
  }
  
  /**
   * Built-in error recovery guard
   */
  const errorRecoveryGuard = async (to, from, options = {}) => {
    // Check for recent navigation errors
    const recentErrors = navigationErrorQueue.value.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 30000 // 30 seconds
    )
    
    if (recentErrors.length > 3) {
      console.warn('[ERROR RECOVERY GUARD] Too many recent navigation errors, blocking navigation')
      
      return {
        allowed: false,
        reason: 'Too many recent navigation errors',
        redirect: '/dashboard'
      }
    }
    
    // Check for error loops (same path failing repeatedly)
    const pathErrors = recentErrors.filter(error => error.to === to)
    if (pathErrors.length > 1) {
      console.warn(`[ERROR RECOVERY GUARD] Repeated errors for path ${to}, blocking navigation`)
      
      return {
        allowed: false,
        reason: `Repeated navigation errors for ${to}`,
        redirect: '/dashboard'
      }
    }
    
    return { allowed: true }
  }
  
  /**
   * Set global error handler for navigation
   */
  const setGlobalNavigationErrorHandler = (handler) => {
    if (typeof handler !== 'function') {
      console.warn('[NAVIGATION] Global error handler must be a function')
      return
    }
    
    globalErrorHandler.value = handler
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NAVIGATION] Global error handler registered')
    }
  }
  
  /**
   * Handle navigation error with user-friendly messages
   */
  const handleNavigationErrorWithFallback = async (error, path, context = {}) => {
    const errorInfo = {
      type: 'navigation_error',
      error: error.message,
      path,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Add to error queue
    navigationErrorQueue.value.push(errorInfo)
    
    // Limit error queue size
    if (navigationErrorQueue.value.length > 100) {
      navigationErrorQueue.value = navigationErrorQueue.value.slice(0, 100)
    }
    
    // Create user-friendly error message
    let userMessage = 'Navigation failed. Please try again.'
    let fallbackAction = null
    
    if (error.message.includes('Authentication')) {
      userMessage = 'Please log in to access this page.'
      fallbackAction = () => navigateToLogin()
    } else if (error.message.includes('permission')) {
      userMessage = 'You don\'t have permission to access this page.'
      fallbackAction = () => navigateToDashboard()
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.'
      fallbackAction = () => window.location.reload()
    }
    
    // Call global error handler if set
    if (globalErrorHandler.value) {
      try {
        await globalErrorHandler.value(errorInfo, userMessage, fallbackAction)
      } catch (handlerError) {
        console.error('[NAVIGATION] Global error handler failed:', handlerError)
      }
    }
    
    // Show user-friendly error (you can customize this based on your UI framework)
    if (typeof window !== 'undefined' && window.showNavigationError) {
      window.showNavigationError(userMessage, fallbackAction)
    } else {
      // Fallback: console error and alert
      console.error('[NAVIGATION ERROR]', userMessage, errorInfo)
      
      if (process.env.NODE_ENV === 'development') {
        console.group('Navigation Error Details')
        console.error('Error:', error)
        console.log('Path:', path)
        console.log('Context:', context)
        console.log('Full Error Info:', errorInfo)
        console.groupEnd()
      }
    }
    
    // Execute fallback action if available
    if (fallbackAction) {
      try {
        await fallbackAction()
      } catch (fallbackError) {
        console.error('[NAVIGATION] Fallback action failed:', fallbackError)
        
        // Ultimate fallback - reload page
        window.location.href = '/dashboard'
      }
    }
  }
  
  /**
   * Initialize built-in navigation guards
   */
  const initializeNavigationGuards = () => {
    // Register built-in guards in order of priority
    addNavigationGuard(errorRecoveryGuard)
    addNavigationGuard(authenticationGuard)
    addNavigationGuard(permissionGuard)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NAVIGATION] Built-in guards initialized')
    }
  }
  
  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (routeKey) => {
    return safeExecute(
      () => {
        const route = ROUTES[routeKey]
        if (!route) {
          console.warn(`[NAVIGATION] Unknown route: ${routeKey}`)
          return false
        }
        
        // Check authentication requirement
        if (route.requiresAuth && !isAuthenticated.value) {
          return false
        }
        
        // Check permission requirement
        if (route.requiresPermission && !route.requiresPermission()) {
          return false
        }
        
        return true
      },
      {
        fallback: false,
        operation: `checking route access: ${routeKey}`,
        component: 'useNavigation'
      }
    )
  }
  
  /**
   * Safe navigation with comprehensive error handling and guards
   */
  const navigateTo = async (path, options = {}) => {
    if (isNavigating.value) {
      console.warn('[NAVIGATION] Navigation already in progress')
      return false
    }
    
    isNavigating.value = true
    lastNavigationError.value = null
    const currentPath = window.location.pathname
    
    try {
      // Execute navigation guards
      const guardResult = await executeNavigationGuards(path, currentPath, options)
      
      if (!guardResult.allowed) {
        // Handle guard rejection
        const error = new Error(guardResult.reason || 'Navigation blocked by guard')
        
        // If guard suggests a redirect, perform it
        if (guardResult.redirect) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[NAVIGATION] Guard redirecting from ${path} to ${guardResult.redirect}`)
          }
          
          // Recursive call with redirect path (but skip guards to prevent loops)
          return await navigateTo(guardResult.redirect, { 
            ...options, 
            skipGuards: true,
            replace: true 
          })
        }
        
        throw error
      }
      
      // Pre-navigation validation (if guards didn't handle it)
      if (!options.skipGuards && !validateAuthState() && options.requiresAuth !== false) {
        throw new Error('Authentication state is invalid')
      }
      
      // Find route configuration
      const routeConfig = Object.values(ROUTES).find(route => route.path === path)
      
      // Additional validation (backup to guards)
      if (!options.skipGuards) {
        if (routeConfig?.requiresAuth && !isAuthenticated.value) {
          throw new Error(`Authentication required for route: ${path}`)
        }
        
        if (routeConfig?.requiresPermission && !routeConfig.requiresPermission()) {
          throw new Error(`Insufficient permissions for route: ${path}`)
        }
      }
      
      // Perform navigation
      await router.visit(path, {
        preserveScroll: options.preserveScroll || false,
        preserveState: options.preserveState || false,
        replace: options.replace || false,
        onStart: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🧭 [NAVIGATION] Starting navigation to: ${path}`)
          }
        },
        onProgress: (progress) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🧭 [NAVIGATION] Progress: ${progress.percentage}%`)
          }
        },
        onSuccess: () => {
          // Add to navigation history on success
          navigationHistory.value.unshift({
            path,
            from: currentPath,
            timestamp: new Date().toISOString(),
            success: true,
            options: { ...options }
          })
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`🧭 [NAVIGATION] Successfully navigated to: ${path}`)
          }
        },
        onError: (error) => {
          throw new Error(`Navigation failed: ${error.message || 'Unknown error'}`)
        },
        ...options
      })
      
      return true
      
    } catch (error) {
      // Record failed navigation
      navigationHistory.value.unshift({
        path,
        from: currentPath,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
        options: { ...options }
      })
      
      lastNavigationError.value = error
      
      // Use the enhanced error handler
      await handleNavigationErrorWithFallback(error, path, {
        component: 'useNavigation',
        level: ERROR_LEVELS.CRITICAL,
        from: currentPath,
        options
      })
      
      return false
      
    } finally {
      isNavigating.value = false
      
      // Limit navigation history size
      if (navigationHistory.value.length > 50) {
        navigationHistory.value = navigationHistory.value.slice(0, 50)
      }
    }
  }
  
  /**
   * Navigate with retry mechanism
   */
  const navigateWithRetry = async (path, options = {}, maxRetries = 3) => {
    let attempts = 0
    
    while (attempts < maxRetries) {
      const success = await navigateTo(path, options)
      
      if (success) {
        return true
      }
      
      attempts++
      
      if (attempts < maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[NAVIGATION] Retry ${attempts}/${maxRetries} for: ${path}`)
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100))
      }
    }
    
    return false
  }
  
  /**
   * Navigate to dashboard (safe fallback)
   */
  const navigateToDashboard = async () => {
    return await navigateTo('/dashboard', { replace: true })
  }
  
  /**
   * Navigate to login page
   */
  const navigateToLogin = async () => {
    return await navigateTo('/login', { 
      replace: true, 
      requiresAuth: false 
    })
  }
  
  /**
   * Handle navigation errors with fallback
   */
  const handleNavigationFailure = async (originalPath, fallbackPath = '/dashboard') => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[NAVIGATION] Falling back from ${originalPath} to ${fallbackPath}`)
      }
      
      return await navigateTo(fallbackPath, { replace: true })
    } catch (error) {
      handleAuthError(error, {
        component: 'useNavigation',
        operation: 'navigation fallback',
        level: ERROR_LEVELS.CRITICAL
      })
      
      // Ultimate fallback - reload page
      window.location.href = fallbackPath
      return false
    }
  }
  
  /**
   * Get available navigation items based on user permissions
   */
  const getAvailableNavigation = computed(() => {
    return safeExecute(
      () => {
        const navItems = []
        
        // Dashboard - always available for authenticated users
        if (isAuthenticated.value) {
          navItems.push({
            key: 'DASHBOARD',
            label: 'Dashboard',
            path: '/dashboard',
            icon: 'dashboard',
            available: true
          })
        }
        
        // Employee Management
        if (canManageEmployees.value) {
          navItems.push(
            {
              key: 'EMPLOYEES',
              label: 'Employees',
              path: '/employees',
              icon: 'users',
              available: true
            },
            {
              key: 'DEPARTMENTS',
              label: 'Departments',
              path: '/departments',
              icon: 'building',
              available: true
            }
          )
        }
        
        // HR Operations
        if (canAccessHROperations.value) {
          navItems.push(
            {
              key: 'LEAVES',
              label: 'Leave Management',
              path: '/leaves',
              icon: 'calendar',
              available: true
            },
            {
              key: 'ATTENDANCES',
              label: 'Attendance',
              path: '/attendances',
              icon: 'clock',
              available: true
            },
            {
              key: 'FEEDBACKS',
              label: 'Feedback',
              path: '/feedbacks',
              icon: 'message',
              available: true
            }
          )
        }
        
        // Project Management - available to all authenticated users
        if (isAuthenticated.value) {
          navItems.push(
            {
              key: 'PROJECTS',
              label: 'Projects',
              path: '/projects',
              icon: 'folder',
              available: true
            },
            {
              key: 'TASKS',
              label: 'Tasks',
              path: '/tasks',
              icon: 'check-square',
              available: true
            },
            {
              key: 'TIMESHEETS',
              label: 'Timesheets',
              path: '/timesheets',
              icon: 'time',
              available: true
            }
          )
        }
        
        return navItems
      },
      {
        fallback: [],
        operation: 'getting available navigation',
        component: 'useNavigation'
      }
    )
  })
  
  /**
   * Get navigation statistics
   */
  const getNavigationStats = computed(() => {
    const total = navigationHistory.value.length
    const successful = navigationHistory.value.filter(nav => nav.success).length
    const failed = total - successful
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0,
      recentHistory: navigationHistory.value.slice(0, 10),
      lastError: lastNavigationError.value
    }
  })
  
  /**
   * Clear navigation history
   */
  const clearNavigationHistory = () => {
    navigationHistory.value = []
    lastNavigationError.value = null
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NAVIGATION] Navigation history cleared')
    }
  }
  
  /**
   * Debug navigation state (development only)
   */
  const debugNavigation = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🧭 Navigation Debug Info')
      console.log('Available Navigation:', getAvailableNavigation.value)
      console.log('Navigation Stats:', getNavigationStats.value)
      console.log('Current Navigation State:', {
        isNavigating: isNavigating.value,
        lastError: lastNavigationError.value
      })
      debugAuthState()
      console.groupEnd()
    }
  }
  
  // Initialize navigation guards on composable creation
  onMounted(() => {
    initializeNavigationGuards()
    
    // Set up global error listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('navigation') || 
            event.reason?.message?.includes('Inertia')) {
          console.error('[NAVIGATION] Unhandled navigation error:', event.reason)
          
          navigationErrorQueue.value.push({
            type: 'unhandled_navigation_error',
            error: event.reason.message,
            timestamp: new Date().toISOString(),
            stack: event.reason.stack
          })
        }
      })
      
      // Custom navigation error event listener
      window.addEventListener('auth-error', (event) => {
        if (event.detail?.context?.includes('navigation')) {
          console.warn('[NAVIGATION] Auth error during navigation:', event.detail)
        }
      })
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    navigationGuards.value = []
    globalErrorHandler.value = null
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NAVIGATION] Composable unmounted, guards cleared')
    }
  })
  
  return {
    // Route definitions
    ROUTES,
    
    // Navigation functions
    navigateTo,
    navigateWithRetry,
    navigateToDashboard,
    navigateToLogin,
    handleNavigationFailure,
    
    // Guard management
    addNavigationGuard,
    removeNavigationGuard,
    executeNavigationGuards,
    setGlobalNavigationErrorHandler,
    
    // Built-in guards (for external use if needed)
    authenticationGuard,
    permissionGuard,
    errorRecoveryGuard,
    
    // Access checking
    canAccessRoute,
    getAvailableNavigation,
    
    // State
    isNavigating: computed(() => isNavigating.value),
    navigationHistory: computed(() => navigationHistory.value),
    lastNavigationError: computed(() => lastNavigationError.value),
    navigationErrorQueue: computed(() => navigationErrorQueue.value),
    
    // Statistics and debugging
    getNavigationStats,
    clearNavigationHistory,
    debugNavigation,
    
    // Error handling
    handleNavigationError: handleNavigationErrorWithFallback
  }
}