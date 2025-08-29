<template>
  <div>
    <!-- Main content slot -->
    <slot v-if="!hasError" />
    
    <!-- Error fallback UI -->
    <div v-else class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            
            <h2 class="mt-4 text-lg font-medium text-gray-900">
              Navigation Error
            </h2>
            
            <p class="mt-2 text-sm text-gray-600">
              {{ errorMessage }}
            </p>
            
            <div v-if="showErrorDetails && process.env.NODE_ENV === 'development'" class="mt-4 p-3 bg-gray-100 rounded-md text-left">
              <h4 class="text-xs font-medium text-gray-700 mb-2">Error Details (Development)</h4>
              <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ errorDetails }}</pre>
            </div>
            
            <div class="mt-6 space-y-3">
              <button
                @click="handleRetry"
                :disabled="isRetrying"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isRetrying" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isRetrying ? 'Retrying...' : 'Try Again' }}
              </button>
              
              <button
                @click="goToDashboard"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </button>
              
              <button
                @click="reloadPage"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reload Page
              </button>
              
              <button
                v-if="process.env.NODE_ENV === 'development'"
                @click="showErrorDetails = !showErrorDetails"
                class="w-full flex justify-center py-2 px-4 text-xs text-gray-500 hover:text-gray-700"
              >
                {{ showErrorDetails ? 'Hide' : 'Show' }} Error Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onErrorCaptured } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { useAuth } from '@/composables/useAuth'

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showErrorDetails = ref(false)
const isRetrying = ref(false)
const lastFailedPath = ref('')
const retryCount = ref(0)
const maxRetries = 3

const { navigateTo, navigateToDashboard } = useNavigation()
const { debugAuthState } = useAuth()

// Error messages for different error types
const getErrorMessage = (error) => {
  // Handle both string and Error object inputs
  const message = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Unknown error')
  
  if (message.includes('auth') || message.includes('Authentication')) {
    return 'Authentication error. Please log in again.'
  } else if (message.includes('permission') || message.includes('Insufficient')) {
    return 'You don\'t have permission to access this page.'
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection.'
  } else if (message.includes('Cannot read properties of undefined')) {
    return 'Application data error. The page may not have loaded correctly.'
  } else if (message.includes('navigation') || message.includes('route')) {
    return 'Navigation error. Unable to load the requested page.'
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Handle different types of errors
const handleError = (error, errorInfo = null) => {
  try {
    hasError.value = true
    
    // Ensure error is an object, not a string
    const errorObj = typeof error === 'string' ? new Error(error) : error
    errorMessage.value = getErrorMessage(errorObj)
    
    // Prepare error details for development
    try {
      if (process.env.NODE_ENV === 'development') {
        const errorData = {
          message: errorObj?.message || 'Unknown error',
          stack: errorObj?.stack || 'No stack trace',
          errorInfo: errorInfo,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
        
        errorDetails.value = JSON.stringify(errorData, null, 2)
        
        console.group('🚨 Navigation Error Boundary')
        console.error('Error:', error)
        console.log('Error Info:', errorInfo)
        console.log('Current URL:', window.location.href)
        debugAuthState()
        console.groupEnd()
      }
    } catch (detailsError) {
      console.warn('Error preparing error details:', detailsError)
      errorDetails.value = 'Error details unavailable'
    }
  } catch (handlerError) {
    console.error('Error in error handler:', handlerError)
    // Fallback error state
    try {
      hasError.value = true
      errorMessage.value = 'An unexpected error occurred'
    } catch (fallbackError) {
      console.error('Critical error in error handler fallback:', fallbackError)
    }
  }
  
  // Track the failed path for retry attempts
  lastFailedPath.value = window.location.pathname
  
  // Report error to external services if needed
  reportError(error, errorInfo)
}

// Report error to external monitoring services
const reportError = (error, errorInfo) => {
  // You can integrate with error reporting services like Sentry here
  if (typeof window !== 'undefined' && window.reportError) {
    window.reportError({
      error: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }
}

// Retry the failed operation
const handleRetry = async () => {
  if (retryCount.value >= maxRetries) {
    errorMessage.value = 'Maximum retry attempts reached. Please reload the page.'
    return
  }
  
  isRetrying.value = true
  retryCount.value++
  
  try {
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Try to navigate to the last failed path or reload
    if (lastFailedPath.value && lastFailedPath.value !== '/') {
      const success = await navigateTo(lastFailedPath.value)
      if (success) {
        // Reset error state on successful retry
        resetErrorState()
        return
      }
    }
    
    // If navigation fails, try reloading the page
    window.location.reload()
    
  } catch (retryError) {
    console.error('[ERROR BOUNDARY] Retry failed:', retryError)
    errorMessage.value = 'Retry failed. Please reload the page manually.'
  } finally {
    isRetrying.value = false
  }
}

// Navigate to dashboard as fallback
const goToDashboard = async () => {
  try {
    const success = await navigateToDashboard()
    if (success) {
      resetErrorState()
    } else {
      // If navigation fails, force redirect
      window.location.href = '/dashboard'
    }
  } catch (error) {
    console.error('[ERROR BOUNDARY] Dashboard navigation failed:', error)
    window.location.href = '/dashboard'
  }
}

// Reload the current page
const reloadPage = () => {
  window.location.reload()
}

// Reset error state
const resetErrorState = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showErrorDetails.value = false
  isRetrying.value = false
  lastFailedPath.value = ''
  retryCount.value = 0
}

// Vue error capture
onErrorCaptured((error, instance, errorInfo) => {
  try {
    // Prevent recursive error handling
    const errorMessage = typeof error === 'string' ? error : (error?.message || '')
    if (errorMessage.includes('Cannot create property') || errorMessage.includes('mounted hook')) {
      console.warn('Preventing recursive error handling:', errorMessage)
      return true // Let Vue handle it
    }
    
    // Prevent handling errors from the error boundary itself
    if (hasError.value) {
      console.warn('Error boundary already active, skipping error handling')
      return true
    }
    
    // Only handle navigation-related errors
    if (isNavigationError(error)) {
      handleError(error, errorInfo)
      return false // Prevent error from propagating
    }
    
    // Let other errors propagate
    return true
  } catch (captureError) {
    console.error('Error in onErrorCaptured:', captureError)
    return true // Let Vue handle it
  }
})

// Check if error is navigation-related
const isNavigationError = (error) => {
  if (!error) return false
  
  // Handle both string and Error object inputs
  const message = typeof error === 'string' ? error : (error?.message || '')
  if (!message) return false
  
  const navigationKeywords = [
    'navigation', 'route', 'inertia', 'auth', 'permission',
    'Cannot read properties of undefined', 'router', 'visit'
  ]
  
  return navigationKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
}

// Set up global error listeners
onMounted(() => {
  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event) => {
    if (isNavigationError(event.reason)) {
      handleError(event.reason, { type: 'unhandledrejection' })
      event.preventDefault()
    }
  }
  
  // Handle general JavaScript errors
  const handleJSError = (event) => {
    if (isNavigationError(event.error)) {
      handleError(event.error, { type: 'error' })
    }
  }
  
  // Handle custom navigation errors
  const handleNavigationError = (event) => {
    handleError(new Error(event.detail.message), {
      type: 'navigation',
      context: event.detail.context
    })
  }
  
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleJSError)
  window.addEventListener('navigation-error', handleNavigationError)
  
  // Store cleanup functions
  window._errorBoundaryCleanup = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleJSError)
    window.removeEventListener('navigation-error', handleNavigationError)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (window._errorBoundaryCleanup) {
    window._errorBoundaryCleanup()
    delete window._errorBoundaryCleanup
  }
})
</script>