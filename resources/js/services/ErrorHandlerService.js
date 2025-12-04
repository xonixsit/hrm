/**
 * Error Handler Service
 * 
 * Centralized error handling service that provides error classification,
 * reporting, and recovery mechanisms for different types of errors.
 */

class ErrorHandlerService {
  constructor() {
    this.errorReporters = []
    this.errorRecoveryStrategies = new Map()
    this.errorHistory = []
    this.maxHistorySize = 50
    
    // Initialize default recovery strategies
    this.initializeRecoveryStrategies()
  }
  
  /**
   * Initialize default error recovery strategies
   */
  initializeRecoveryStrategies() {
    // Network error recovery
    this.errorRecoveryStrategies.set('network', {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      recovery: async (error, attempt) => {
        // Wait with exponential backoff
        const delay = this.errorRecoveryStrategies.get('network').retryDelay * 
                     Math.pow(this.errorRecoveryStrategies.get('network').backoffMultiplier, attempt - 1)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Check network connectivity
        if (navigator.onLine === false) {
          throw new Error('No internet connection')
        }
        
        // Attempt to ping a reliable endpoint
        try {
          await fetch('/api/health', { method: 'HEAD' })
          return true
        } catch {
          throw new Error('Server unreachable')
        }
      }
    })
    
    // Authentication error recovery
    this.errorRecoveryStrategies.set('authentication', {
      maxRetries: 1,
      retryDelay: 0,
      recovery: async (error, attempt) => {
        // Try to refresh the session
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
          })
          
          if (response.ok) {
            return true
          }
        } catch {
          // Refresh failed, redirect to login
          window.location.href = '/login'
          return false
        }
        
        throw new Error('Authentication refresh failed')
      }
    })
    
    // Permission error recovery
    this.errorRecoveryStrategies.set('permission', {
      maxRetries: 0,
      recovery: async (error, attempt) => {
        // No automatic recovery for permission errors
        // Log the attempt and redirect to appropriate page
        console.warn('[ERROR HANDLER] Permission denied:', error.message)
        
        // Redirect to dashboard or previous page
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/dashboard'
        }
        
        return false
      }
    })
    
    // Server error recovery
    this.errorRecoveryStrategies.set('server', {
      maxRetries: 2,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      recovery: async (error, attempt) => {
        const delay = this.errorRecoveryStrategies.get('server').retryDelay * 
                     Math.pow(this.errorRecoveryStrategies.get('server').backoffMultiplier, attempt - 1)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Check if server is responding
        try {
          const response = await fetch('/api/health', { method: 'HEAD' })
          if (response.ok) {
            return true
          }
        } catch {
          // Server still not responding
        }
        
        throw new Error('Server still unavailable')
      }
    })
    
    // Client error recovery
    this.errorRecoveryStrategies.set('client', {
      maxRetries: 1,
      retryDelay: 500,
      recovery: async (error, attempt) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Clear any cached data that might be causing issues
        if (typeof window !== 'undefined') {
          try {
            // Clear localStorage items that might be corrupted
            const keysToCheck = ['user', 'auth', 'preferences', 'cache']
            keysToCheck.forEach(key => {
              const item = localStorage.getItem(key)
              if (item) {
                try {
                  JSON.parse(item)
                } catch {
                  localStorage.removeItem(key)
                  console.warn(`[ERROR HANDLER] Removed corrupted localStorage item: ${key}`)
                }
              }
            })
          } catch (error) {
            console.warn('[ERROR HANDLER] Failed to clean localStorage:', error)
          }
        }
        
        return true
      }
    })
    
    // Validation error recovery
    this.errorRecoveryStrategies.set('validation', {
      maxRetries: 0,
      recovery: async (error, attempt) => {
        // No automatic recovery for validation errors
        // These should be handled by the form components
        console.warn('[ERROR HANDLER] Validation error:', error.message)
        return false
      }
    })
  }
  
  /**
   * Classify an error based on its characteristics
   * @param {Error} error - The error to classify
   * @returns {string} - The error type
   */
  classifyError(error) {
    if (!error) return 'unknown'
    
    const message = error.message?.toLowerCase() || ''
    const stack = error.stack?.toLowerCase() || ''
    const name = error.name?.toLowerCase() || ''
    
    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      name.includes('networkerror') ||
      error.code === 'NETWORK_ERROR'
    ) {
      return 'network'
    }
    
    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('session') ||
      message.includes('token') ||
      message.includes('unauthorized') ||
      (error && typeof error === 'object' && error.status === 401)
    ) {
      return 'authentication'
    }
    
    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied') ||
      (error && typeof error === 'object' && error.status === 403)
    ) {
      return 'permission'
    }
    
    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format') ||
      (error && typeof error === 'object' && (error.status === 400 || error.status === 422))
    ) {
      return 'validation'
    }
    
    // Server errors
    if (
      message.includes('server') ||
      message.includes('internal') ||
      (error && typeof error === 'object' && error.status >= 500) ||
      name.includes('servererror')
    ) {
      return 'server'
    }
    
    // Client-side errors
    if (
      message.includes('undefined') ||
      message.includes('null') ||
      message.includes('cannot read') ||
      message.includes('is not a function') ||
      stack.includes('vue') ||
      stack.includes('inertia') ||
      name.includes('typeerror') ||
      name.includes('referenceerror')
    ) {
      return 'client'
    }
    
    return 'unknown'
  }
  
  /**
   * Handle an error with automatic classification and recovery
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context information
   * @returns {Promise<Object>} - Error handling result
   */
  async handleError(error, context = {}) {
    const errorType = this.classifyError(error)
    const timestamp = new Date().toISOString()
    
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp,
      type: errorType,
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      handled: false,
      recovered: false,
      attempts: 0
    }
    
    // Add to error history
    this.addToHistory(errorInfo)
    
    // Report the error
    await this.reportError(errorInfo)
    
    // Attempt recovery
    const recoveryResult = await this.attemptRecovery(error, errorType, errorInfo)
    
    errorInfo.handled = true
    errorInfo.recovered = recoveryResult.success
    errorInfo.attempts = recoveryResult.attempts
    
    return {
      errorInfo,
      recovered: recoveryResult.success,
      attempts: recoveryResult.attempts,
      strategy: recoveryResult.strategy
    }
  }
  
  /**
   * Attempt to recover from an error
   * @param {Error} error - The original error
   * @param {string} errorType - The classified error type
   * @param {Object} errorInfo - Error information object
   * @returns {Promise<Object>} - Recovery result
   */
  async attemptRecovery(error, errorType, errorInfo) {
    const strategy = this.errorRecoveryStrategies.get(errorType)
    
    if (!strategy || !strategy.recovery) {
      return {
        success: false,
        attempts: 0,
        strategy: null,
        error: 'No recovery strategy available'
      }
    }
    
    const maxRetries = strategy.maxRetries || 0
    let attempts = 0
    let lastError = error
    
    while (attempts <= maxRetries) {
      attempts++
      
      try {
        const result = await strategy.recovery(error, attempts)
        
        if (result === true) {
          return {
            success: true,
            attempts,
            strategy: errorType,
            error: null
          }
        }
      } catch (recoveryError) {
        lastError = recoveryError
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[ERROR HANDLER] Recovery attempt ${attempts} failed:`, recoveryError.message)
        }
      }
      
      // Don't wait after the last attempt
      if (attempts <= maxRetries && strategy.retryDelay) {
        const delay = strategy.retryDelay * Math.pow(strategy.backoffMultiplier || 1, attempts - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return {
      success: false,
      attempts,
      strategy: errorType,
      error: lastError.message
    }
  }
  
  /**
   * Report an error to all registered reporters
   * @param {Object} errorInfo - Error information object
   */
  async reportError(errorInfo) {
    const reportPromises = this.errorReporters.map(async (reporter) => {
      try {
        await reporter(errorInfo)
      } catch (reportError) {
        console.error('[ERROR HANDLER] Failed to report error:', reportError)
      }
    })
    
    await Promise.allSettled(reportPromises)
  }
  
  /**
   * Add an error reporter
   * @param {Function} reporter - Error reporter function
   */
  addErrorReporter(reporter) {
    if (typeof reporter === 'function') {
      this.errorReporters.push(reporter)
    }
  }
  
  /**
   * Remove an error reporter
   * @param {Function} reporter - Error reporter function to remove
   */
  removeErrorReporter(reporter) {
    const index = this.errorReporters.indexOf(reporter)
    if (index > -1) {
      this.errorReporters.splice(index, 1)
    }
  }
  
  /**
   * Add error to history
   * @param {Object} errorInfo - Error information object
   */
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo)
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }
  
  /**
   * Get error history
   * @param {number} limit - Maximum number of errors to return
   * @returns {Array} - Array of error information objects
   */
  getErrorHistory(limit = 10) {
    return this.errorHistory.slice(0, limit)
  }
  
  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = []
  }
  
  /**
   * Generate a unique error ID
   * @returns {string} - Unique error identifier
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Get error statistics
   * @returns {Object} - Error statistics
   */
  getErrorStatistics() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      recovered: 0,
      unrecovered: 0,
      recentErrors: 0
    }
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    this.errorHistory.forEach(error => {
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      
      // Count recovery status
      if (error.recovered) {
        stats.recovered++
      } else {
        stats.unrecovered++
      }
      
      // Count recent errors
      if (new Date(error.timestamp).getTime() > oneHourAgo) {
        stats.recentErrors++
      }
    })
    
    return stats
  }
  
  /**
   * Check if error rate is too high
   * @param {number} threshold - Error threshold per hour
   * @returns {boolean} - Whether error rate is too high
   */
  isErrorRateTooHigh(threshold = 10) {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const recentErrors = this.errorHistory.filter(error => 
      new Date(error.timestamp).getTime() > oneHourAgo
    )
    
    return recentErrors.length > threshold
  }
  
  /**
   * Add a custom recovery strategy
   * @param {string} errorType - Error type to handle
   * @param {Object} strategy - Recovery strategy configuration
   */
  addRecoveryStrategy(errorType, strategy) {
    this.errorRecoveryStrategies.set(errorType, strategy)
  }
  
  /**
   * Remove a recovery strategy
   * @param {string} errorType - Error type to remove strategy for
   */
  removeRecoveryStrategy(errorType) {
    this.errorRecoveryStrategies.delete(errorType)
  }
  
  /**
   * Get available recovery strategies
   * @returns {Array} - Array of error types with recovery strategies
   */
  getAvailableStrategies() {
    return Array.from(this.errorRecoveryStrategies.keys())
  }
}

// Create singleton instance
const errorHandlerService = new ErrorHandlerService()

// Add default error reporters
if (process.env.NODE_ENV === 'development') {
  // Console reporter for development
  errorHandlerService.addErrorReporter((errorInfo) => {
    console.group(`🚨 [ERROR HANDLER] ${errorInfo.type.toUpperCase()} Error`)
    console.error('Message:', errorInfo.message)
    //console.log('Type:', errorInfo.type)
    //console.log('Timestamp:', errorInfo.timestamp)
    //console.log('URL:', errorInfo.url)
    //console.log('Context:', errorInfo.context)
    if (errorInfo.stack) {
      //console.log('Stack:', errorInfo.stack)
    }
    console.groupEnd()
  })
} else {
  // Production error reporter (could integrate with external services)
  errorHandlerService.addErrorReporter(async (errorInfo) => {
    try {
      // Example: Send to external error tracking service
      if (window.reportError) {
        window.reportError(errorInfo)
      }
      
      // Example: Send to your own error logging endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo)
      })
    } catch (error) {
      console.error('[ERROR HANDLER] Failed to report error to external service:', error)
    }
  })
}

export default errorHandlerService
export { ErrorHandlerService }