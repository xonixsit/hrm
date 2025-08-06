import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * Enhanced authentication error handler with structured reporting
 * Provides comprehensive error tracking and debugging utilities
 */
export function useAuthErrorHandler() {
  const { getAuthError, debugAuthState, validateAuthState } = useAuth()
  
  const errorHistory = ref([])
  const maxErrorHistory = 50
  
  // Error severity levels
  const ERROR_LEVELS = {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'debug'
  }
  
  // Error categories for better organization
  const ERROR_CATEGORIES = {
    AUTH_DATA: 'auth_data',
    ROLE_CHECK: 'role_check',
    NAVIGATION: 'navigation',
    COMPONENT: 'component',
    NETWORK: 'network'
  }
  
  /**
   * Create a structured error report
   */
  const createErrorReport = (error, context = {}) => {
    const timestamp = new Date().toISOString()
    const authError = getAuthError()
    
    const report = {
      id: `auth_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      level: context.level || ERROR_LEVELS.WARNING,
      category: context.category || ERROR_CATEGORIES.COMPONENT,
      message: error.message || 'Unknown authentication error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        component: context.component || 'Unknown',
        operation: context.operation || 'Unknown',
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      authState: authError,
      sessionInfo: {
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        cookiesEnabled: navigator.cookieEnabled
      }
    }
    
    // Add to error history
    errorHistory.value.unshift(report)
    if (errorHistory.value.length > maxErrorHistory) {
      errorHistory.value = errorHistory.value.slice(0, maxErrorHistory)
    }
    
    return report
  }
  
  /**
   * Log structured error with appropriate console method
   */
  const logError = (report) => {
    if (process.env.NODE_ENV !== 'development') return
    
    const logMethod = {
      [ERROR_LEVELS.CRITICAL]: console.error,
      [ERROR_LEVELS.WARNING]: console.warn,
      [ERROR_LEVELS.INFO]: console.info,
      [ERROR_LEVELS.DEBUG]: console.debug
    }[report.level] || console.log
    
    console.group(`🔐 [AUTH ${report.level.toUpperCase()}] ${report.message}`)
    logMethod('Report ID:', report.id)
    logMethod('Timestamp:', report.timestamp)
    logMethod('Category:', report.category)
    logMethod('Component:', report.context.component)
    logMethod('Operation:', report.context.operation)
    
    if (report.error.stack) {
      logMethod('Stack:', report.error.stack)
    }
    
    if (report.authState) {
      logMethod('Auth State Error:', report.authState)
    }
    
    logMethod('Full Report:', report)
    console.groupEnd()
  }
  
  /**
   * Handle authentication errors with comprehensive reporting
   */
  const handleAuthError = (error, context = {}) => {
    const report = createErrorReport(error, context)
    logError(report)
    
    // Trigger debug state logging for critical errors
    if (report.level === ERROR_LEVELS.CRITICAL) {
      debugAuthState()
    }
    
    return report
  }
  
  /**
   * Handle role checking errors
   */
  const handleRoleError = (error, roleName, context = {}) => {
    return handleAuthError(error, {
      ...context,
      category: ERROR_CATEGORIES.ROLE_CHECK,
      operation: `checking role: ${roleName}`,
      level: ERROR_LEVELS.WARNING
    })
  }
  
  /**
   * Handle navigation errors
   */
  const handleNavigationError = (error, route, context = {}) => {
    return handleAuthError(error, {
      ...context,
      category: ERROR_CATEGORIES.NAVIGATION,
      operation: `navigating to: ${route}`,
      level: ERROR_LEVELS.CRITICAL
    })
  }
  
  /**
   * Handle component mounting errors
   */
  const handleComponentError = (error, componentName, context = {}) => {
    return handleAuthError(error, {
      ...context,
      category: ERROR_CATEGORIES.COMPONENT,
      component: componentName,
      operation: 'component initialization',
      level: ERROR_LEVELS.CRITICAL
    })
  }
  
  /**
   * Handle network/API errors related to authentication
   */
  const handleNetworkError = (error, endpoint, context = {}) => {
    return handleAuthError(error, {
      ...context,
      category: ERROR_CATEGORIES.NETWORK,
      operation: `API request to: ${endpoint}`,
      level: ERROR_LEVELS.WARNING
    })
  }
  
  /**
   * Safe execution wrapper with error handling
   */
  const safeExecute = async (operation, context = {}) => {
    try {
      // Pre-execution auth validation
      if (!validateAuthState() && context.requireAuth !== false) {
        throw new Error('Authentication state is invalid')
      }
      
      return await operation()
    } catch (error) {
      const report = handleAuthError(error, {
        ...context,
        operation: context.operation || 'safe execution'
      })
      
      // Return fallback value or re-throw based on context
      if (context.fallback !== undefined) {
        return context.fallback
      }
      
      if (context.suppressError) {
        return null
      }
      
      throw error
    }
  }
  
  /**
   * Get error statistics
   */
  const getErrorStats = computed(() => {
    const stats = {
      total: errorHistory.value.length,
      byLevel: {},
      byCategory: {},
      recent: errorHistory.value.slice(0, 10),
      oldestError: errorHistory.value[errorHistory.value.length - 1],
      newestError: errorHistory.value[0]
    }
    
    // Count by level
    Object.values(ERROR_LEVELS).forEach(level => {
      stats.byLevel[level] = errorHistory.value.filter(e => e.level === level).length
    })
    
    // Count by category
    Object.values(ERROR_CATEGORIES).forEach(category => {
      stats.byCategory[category] = errorHistory.value.filter(e => e.category === category).length
    })
    
    return stats
  })
  
  /**
   * Clear error history
   */
  const clearErrorHistory = () => {
    errorHistory.value = []
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH ERROR HANDLER] Error history cleared')
    }
  }
  
  /**
   * Export error history for debugging
   */
  const exportErrorHistory = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stats: getErrorStats.value,
      errors: errorHistory.value
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH ERROR HANDLER] Error history export:', exportData)
    }
    
    return exportData
  }
  
  /**
   * Development-only debugging utilities
   */
  const debugUtils = process.env.NODE_ENV === 'development' ? {
    logErrorStats: () => {
      console.group('📊 Authentication Error Statistics')
      console.log('Stats:', getErrorStats.value)
      console.groupEnd()
    },
    
    logRecentErrors: (count = 5) => {
      console.group(`📋 Recent Authentication Errors (${count})`)
      errorHistory.value.slice(0, count).forEach((error, index) => {
        console.log(`${index + 1}.`, error)
      })
      console.groupEnd()
    },
    
    simulateError: (type = 'component') => {
      const simulatedError = new Error(`Simulated ${type} error for testing`)
      handleAuthError(simulatedError, {
        category: ERROR_CATEGORIES[type.toUpperCase()] || ERROR_CATEGORIES.COMPONENT,
        component: 'DebugComponent',
        operation: 'error simulation',
        level: ERROR_LEVELS.DEBUG
      })
    }
  } : {}
  
  return {
    // Core error handling
    handleAuthError,
    handleRoleError,
    handleNavigationError,
    handleComponentError,
    handleNetworkError,
    
    // Utilities
    safeExecute,
    createErrorReport,
    
    // Data access
    errorHistory: computed(() => errorHistory.value),
    getErrorStats,
    
    // Management
    clearErrorHistory,
    exportErrorHistory,
    
    // Constants
    ERROR_LEVELS,
    ERROR_CATEGORIES,
    
    // Development utilities
    ...debugUtils
  }
}

/**
 * Global error handler setup for authentication errors
 */
export function setupGlobalAuthErrorHandler() {
  if (typeof window === 'undefined') return
  
  const { handleAuthError, ERROR_CATEGORIES, ERROR_LEVELS } = useAuthErrorHandler()
  
  // Global error handler for unhandled authentication errors
  window.addEventListener('error', (event) => {
    const error = event.error
    if (!error) return
    
    const errorMessage = error.message?.toLowerCase() || ''
    const isAuthRelated = [
      'auth',
      'user',
      'roles',
      'permission',
      'cannot read properties of undefined',
      'cannot read property'
    ].some(keyword => errorMessage.includes(keyword))
    
    if (isAuthRelated) {
      handleAuthError(error, {
        category: ERROR_CATEGORIES.COMPONENT,
        level: ERROR_LEVELS.CRITICAL,
        operation: 'global error handler',
        component: 'Global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }
  })
  
  // Global promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    if (!error || typeof error !== 'object') return
    
    const errorMessage = error.message?.toLowerCase() || ''
    const isAuthRelated = errorMessage.includes('auth') || 
                         errorMessage.includes('user') || 
                         errorMessage.includes('permission')
    
    if (isAuthRelated) {
      handleAuthError(error, {
        category: ERROR_CATEGORIES.NETWORK,
        level: ERROR_LEVELS.WARNING,
        operation: 'unhandled promise rejection',
        component: 'Global'
      })
    }
  })
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [AUTH ERROR HANDLER] Global error handlers initialized')
  }
}