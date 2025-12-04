import { ref, onErrorCaptured, provide, inject } from 'vue'
import { useAuth } from './useAuth.js'

// Symbol for providing/injecting error boundary context
const AUTH_ERROR_BOUNDARY_KEY = Symbol('authErrorBoundary')

/**
 * Composable for creating authentication error boundaries
 * Catches and handles authentication-related errors in components
 */
export function useAuthErrorBoundary() {
  const { debugAuthState, getAuthError } = useAuth()
  const hasError = ref(false)
  const errorInfo = ref(null)
  const errorCount = ref(0)
  
  // Enhanced error detection for auth-related issues
  const isAuthError = (error) => {
    const errorMessage = error.message?.toLowerCase() || ''
    const authKeywords = [
      'auth',
      'user',
      'roles',
      'permission',
      'cannot read properties of undefined',
      'cannot read property',
      'undefined is not an object'
    ]
    
    return authKeywords.some(keyword => errorMessage.includes(keyword))
  }
  
  // Structured error reporting
  const reportAuthError = (error, instance, errorInfo) => {
    const timestamp = new Date().toISOString()
    const componentName = instance?.$options.name || instance?.$?.type?.name || 'Unknown Component'
    const authError = getAuthError()
    
    const errorReport = {
      timestamp,
      componentName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo,
      authState: authError,
      errorCount: errorCount.value + 1
    }
    
    // Log structured error in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 [AUTH ERROR BOUNDARY] Error in ${componentName}`)
      console.error('Error:', error)
      //console.log('Component:', componentName)
      //console.log('Error Info:', errorInfo)
      //console.log('Auth State Error:', authError)
      //console.log('Error Count:', errorReport.errorCount)
      //console.log('Full Report:', errorReport)
      debugAuthState()
      console.groupEnd()
    }
    
    // Store error information for fallback UI
    errorInfo.value = errorReport
    hasError.value = true
    errorCount.value++
    
    return errorReport
  }
  
  // Error capture handler
  onErrorCaptured((error, instance, errorInfo) => {
    if (isAuthError(error)) {
      reportAuthError(error, instance, errorInfo)
      
      // Prevent error from propagating to parent error boundaries
      return false
    }
    
    // Let non-auth errors bubble up
    return true
  })
  
  // Reset error state
  const resetError = () => {
    hasError.value = false
    errorInfo.value = null
  }
  
  // Retry mechanism for auth errors
  const retryWithAuthCheck = async (operation, maxRetries = 3) => {
    let attempts = 0
    
    while (attempts < maxRetries) {
      try {
        const authError = getAuthError()
        if (authError && authError.type === 'critical') {
          throw new Error(`Authentication not available: ${authError.message}`)
        }
        
        return await operation()
      } catch (error) {
        attempts++
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AUTH RETRY] Attempt ${attempts}/${maxRetries} failed:`, error.message)
        }
        
        if (attempts >= maxRetries) {
          throw error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100))
      }
    }
  }
  
  // Provide error boundary context to child components
  const errorBoundaryContext = {
    hasError,
    errorInfo,
    errorCount,
    resetError,
    retryWithAuthCheck,
    reportAuthError
  }
  
  provide(AUTH_ERROR_BOUNDARY_KEY, errorBoundaryContext)
  
  return errorBoundaryContext
}

/**
 * Composable for accessing error boundary context in child components
 */
export function useAuthErrorContext() {
  const context = inject(AUTH_ERROR_BOUNDARY_KEY, null)
  
  if (!context) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUTH ERROR CONTEXT] No error boundary found in component tree')
    }
    return {
      hasError: ref(false),
      errorInfo: ref(null),
      errorCount: ref(0),
      resetError: () => {},
      retryWithAuthCheck: async (operation) => operation(),
      reportAuthError: () => {}
    }
  }
  
  return context
}

/**
 * Higher-order function to wrap components with auth error handling
 */
export function withAuthErrorHandling(component) {
  return {
    ...component,
    setup(props, context) {
      const errorBoundary = useAuthErrorBoundary()
      
      // Enhanced error reporting for this specific component
      const componentErrorHandler = (error, errorInfo) => {
        return errorBoundary.reportAuthError(error, { $options: { name: component.name } }, errorInfo)
      }
      
      // Call original setup if it exists
      const originalSetup = component.setup?.(props, context) || {}
      
      return {
        ...originalSetup,
        // Expose error boundary utilities
        ...errorBoundary,
        componentErrorHandler
      }
    }
  }
}