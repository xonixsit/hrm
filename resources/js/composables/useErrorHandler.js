/**
 * Error Handler Composable
 * 
 * Vue composable that provides error handling functionality
 * with automatic recovery and reporting capabilities.
 */

import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import errorHandlerService from '@/services/ErrorHandlerService.js'

export function useErrorHandler(options = {}) {
  const {
    // Component-specific options
    componentName = 'Unknown Component',
    errorTypes = [], // Empty array means handle all error types
    autoRecover = true,
    maxRetries = 3,
    
    // Callback options
    onError = null,
    onRecovery = null,
    onRecoveryFailed = null,
    
    // UI options
    showNotifications = true,
    notificationDuration = 5000
  } = options
  
  // Reactive state
  const hasError = ref(false)
  const currentError = ref(null)
  const isRecovering = ref(false)
  const recoveryAttempts = ref(0)
  const errorHistory = ref([])
  
  // Get current component instance for context
  const instance = getCurrentInstance()
  
  /**
   * Handle an error with automatic classification and recovery
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context information
   * @returns {Promise<Object>} - Error handling result
   */
  const handleError = async (error, context = {}) => {
    // Add component context
    const fullContext = {
      ...context,
      componentName,
      componentInstance: instance?.type?.name || componentName,
      props: instance?.props,
      timestamp: new Date().toISOString()
    }
    
    // Update reactive state
    hasError.value = true
    currentError.value = error
    isRecovering.value = autoRecover
    
    try {
      // Use the error handler service
      const result = await errorHandlerService.handleError(error, fullContext)
      
      // Update recovery state
      recoveryAttempts.value = result.attempts
      
      if (result.recovered) {
        // Recovery successful
        hasError.value = false
        currentError.value = null
        isRecovering.value = false
        
        if (showNotifications) {
          showSuccessNotification('Issue resolved automatically')
        }
        
        if (onRecovery) {
          onRecovery(result)
        }
      } else {
        // Recovery failed
        isRecovering.value = false
        
        if (showNotifications) {
          showErrorNotification(getErrorMessage(error))
        }
        
        if (onRecoveryFailed) {
          onRecoveryFailed(result)
        }
      }
      
      // Add to local history
      errorHistory.value.unshift(result.errorInfo)
      
      // Call custom error handler
      if (onError) {
        onError(error, result)
      }
      
      return result
      
    } catch (handlingError) {
      console.error('[ERROR HANDLER] Failed to handle error:', handlingError)
      
      // Fallback error state
      isRecovering.value = false
      
      if (showNotifications) {
        showErrorNotification('An unexpected error occurred')
      }
      
      return {
        errorInfo: {
          type: 'unknown',
          message: error.message,
          handled: false,
          recovered: false
        },
        recovered: false,
        attempts: 0
      }
    }
  }
  
  /**
   * Manually retry error recovery
   * @returns {Promise<boolean>} - Whether recovery was successful
   */
  const retryRecovery = async () => {
    if (!currentError.value || isRecovering.value) {
      return false
    }
    
    isRecovering.value = true
    
    try {
      const result = await handleError(currentError.value, { isRetry: true })
      return result.recovered
    } catch (error) {
      console.error('[ERROR HANDLER] Manual retry failed:', error)
      return false
    } finally {
      isRecovering.value = false
    }
  }
  
  /**
   * Clear the current error state
   */
  const clearError = () => {
    hasError.value = false
    currentError.value = null
    isRecovering.value = false
    recoveryAttempts.value = 0
  }
  
  /**
   * Get a user-friendly error message
   * @param {Error} error - The error object
   * @returns {string} - User-friendly error message
   */
  const getErrorMessage = (error) => {
    const errorType = errorHandlerService.classifyError(error)
    
    const messages = {
      network: 'Connection problem. Please check your internet connection.',
      authentication: 'Please log in to continue.',
      permission: 'You don\'t have permission to perform this action.',
      validation: 'Please check your input and try again.',
      server: 'Server error. Please try again later.',
      client: 'Application error. Please refresh the page.',
      unknown: 'An unexpected error occurred.'
    }
    
    return messages[errorType] || messages.unknown
  }
  
  /**
   * Show success notification
   * @param {string} message - Success message
   */
  const showSuccessNotification = (message) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, 'success', notificationDuration)
    }
  }
  
  /**
   * Show error notification
   * @param {string} message - Error message
   */
  const showErrorNotification = (message) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, 'error', notificationDuration)
    }
  }
  
  /**
   * Get error statistics for this component
   * @returns {Object} - Error statistics
   */
  const getErrorStats = () => {
    const stats = {
      total: errorHistory.value.length,
      recovered: 0,
      failed: 0,
      byType: {}
    }
    
    errorHistory.value.forEach(error => {
      if (error.recovered) {
        stats.recovered++
      } else {
        stats.failed++
      }
      
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })
    
    return stats
  }
  
  /**
   * Check if component has frequent errors
   * @param {number} threshold - Error threshold
   * @returns {boolean} - Whether error rate is high
   */
  const hasFrequentErrors = (threshold = 5) => {
    const recentErrors = errorHistory.value.filter(error => {
      const errorTime = new Date(error.timestamp).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      return errorTime > oneHourAgo
    })
    
    return recentErrors.length > threshold
  }
  
  /**
   * Create an error boundary wrapper function
   * @param {Function} fn - Function to wrap
   * @returns {Function} - Wrapped function with error handling
   */
  const withErrorHandling = (fn) => {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        await handleError(error, { 
          function: fn.name || 'anonymous',
          arguments: args.length 
        })
        throw error // Re-throw so calling code can handle if needed
      }
    }
  }
  
  /**
   * Create a safe async function that won't throw
   * @param {Function} fn - Async function to make safe
   * @returns {Function} - Safe function that returns result or null
   */
  const makeSafe = (fn) => {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        await handleError(error, { 
          function: fn.name || 'anonymous',
          arguments: args.length,
          safe: true
        })
        return null
      }
    }
  }
  
  /**
   * Set up global error listeners for this component
   */
  const setupGlobalErrorHandling = () => {
    const handleUnhandledRejection = (event) => {
      handleError(event.reason, { type: 'unhandledrejection' })
      event.preventDefault()
    }
    
    const handleGlobalError = (event) => {
      handleError(event.error, { type: 'error' })
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }
  
  // Set up error handling on mount
  let cleanupGlobalHandling = null
  
  onMounted(() => {
    if (options.handleGlobalErrors !== false) {
      cleanupGlobalHandling = setupGlobalErrorHandling()
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (cleanupGlobalHandling) {
      cleanupGlobalHandling()
    }
  })
  
  return {
    // State
    hasError,
    currentError,
    isRecovering,
    recoveryAttempts,
    errorHistory,
    
    // Methods
    handleError,
    retryRecovery,
    clearError,
    getErrorMessage,
    getErrorStats,
    hasFrequentErrors,
    
    // Utilities
    withErrorHandling,
    makeSafe,
    
    // Service access
    errorService: errorHandlerService
  }
}

/**
 * Global error handler composable for app-level error handling
 */
export function useGlobalErrorHandler() {
  const errorStats = ref({
    total: 0,
    byType: {},
    recovered: 0,
    unrecovered: 0,
    recentErrors: 0
  })
  
  const isErrorRateHigh = ref(false)
  
  /**
   * Update error statistics
   */
  const updateStats = () => {
    errorStats.value = errorHandlerService.getErrorStatistics()
    isErrorRateHigh.value = errorHandlerService.isErrorRateTooHigh()
  }
  
  /**
   * Get global error history
   * @param {number} limit - Maximum number of errors to return
   * @returns {Array} - Array of error information objects
   */
  const getGlobalErrorHistory = (limit = 10) => {
    return errorHandlerService.getErrorHistory(limit)
  }
  
  /**
   * Clear global error history
   */
  const clearGlobalErrorHistory = () => {
    errorHandlerService.clearErrorHistory()
    updateStats()
  }
  
  /**
   * Add a custom error reporter
   * @param {Function} reporter - Error reporter function
   */
  const addErrorReporter = (reporter) => {
    errorHandlerService.addErrorReporter(reporter)
  }
  
  /**
   * Add a custom recovery strategy
   * @param {string} errorType - Error type to handle
   * @param {Object} strategy - Recovery strategy configuration
   */
  const addRecoveryStrategy = (errorType, strategy) => {
    errorHandlerService.addRecoveryStrategy(errorType, strategy)
  }
  
  // Update stats on mount
  onMounted(() => {
    updateStats()
    
    // Update stats periodically
    const interval = setInterval(updateStats, 30000) // Every 30 seconds
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  })
  
  return {
    // State
    errorStats,
    isErrorRateHigh,
    
    // Methods
    updateStats,
    getGlobalErrorHistory,
    clearGlobalErrorHistory,
    addErrorReporter,
    addRecoveryStrategy,
    
    // Service access
    errorService: errorHandlerService
  }
}

export default useErrorHandler