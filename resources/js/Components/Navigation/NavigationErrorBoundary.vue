<template>
  <div class="navigation-error-boundary">
    <!-- Main navigation content when no error -->
    <slot v-if="!hasError" />
    
    <!-- Error fallback with navigation fallback component -->
    <NavigationFallback
      v-else
      :fallback-reason="errorMessage"
      :error-details="errorDetails"
      :current-route="currentRoute"
      :failed-navigation-type="failedNavigationType"
      :show-error-indicator="true"
      :show-debug-info="isDevelopment"
      :on-retry="handleRetry"
      @navigate="handleFallbackNavigation"
      @retry="handleFallbackRetry"
      @reload="handleFallbackReload"
      @fallback-action="handleFallbackAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onErrorCaptured, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import NavigationFallback from './NavigationFallback.vue'
import { conflictDetector } from '@/services/NavigationConflictDetector.js'
import { useAuthErrorHandler } from '@/composables/useAuthErrorHandler.js'

const props = defineProps({
  /**
   * Current route name for navigation state
   */
  currentRoute: {
    type: String,
    required: true
  },
  
  /**
   * Navigation type being protected
   */
  navigationType: {
    type: String,
    validator: (value) => ['desktop', 'mobile', 'controller'].includes(value),
    default: 'controller'
  },
  
  /**
   * Component identifier for conflict detection
   */
  componentId: {
    type: String,
    default: () => `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  /**
   * Maximum retry attempts before showing permanent fallback
   */
  maxRetries: {
    type: Number,
    default: 3
  },
  
  /**
   * Custom error handler function
   */
  onError: {
    type: Function,
    default: null
  },
  
  /**
   * Custom recovery function
   */
  onRecover: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'error',
  'recover',
  'fallback-activated',
  'fallback-deactivated',
  'navigation-attempt',
  'conflict-detected'
])

// Composables
const { 
  handleNavigationError, 
  handleComponentError,
  safeExecute,
  ERROR_LEVELS,
  ERROR_CATEGORIES 
} = useAuthErrorHandler()

// Reactive state
const hasError = ref(false)
const errorInfo = ref(null)
const errorDetails = ref({})
const retryCount = ref(0)
const isRetrying = ref(false)
const lastErrorTime = ref(null)
const errorHistory = ref([])
const conflictHistory = ref([])

// Constants
const isDevelopment = process.env.NODE_ENV === 'development'
const ERROR_COOLDOWN = 5000 // 5 seconds between similar errors

// Computed properties
const errorMessage = computed(() => {
  if (!errorInfo.value) return 'Navigation component failed to load'
  
  const error = errorInfo.value
  const message = error.message?.toLowerCase() || ''
  
  // Categorize error messages
  if (message.includes('chunk') || message.includes('loading')) {
    return 'Navigation component failed to load. This may be due to a network issue.'
  } else if (message.includes('permission') || message.includes('unauthorized')) {
    return 'You don\'t have permission to access this navigation. Please contact your administrator.'
  } else if (message.includes('auth') || message.includes('session')) {
    return 'Your session has expired. Please log in again.'
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'Network error while loading navigation. Please check your connection.'
  } else if (message.includes('conflict') || message.includes('multiple')) {
    return 'Navigation conflict detected. Multiple navigation components are active.'
  } else if (message.includes('breakpoint') || message.includes('responsive')) {
    return 'Navigation responsive behavior error. The navigation may not match your screen size.'
  }
  
  return 'Navigation system encountered an error. Using fallback navigation.'
})

const failedNavigationType = computed(() => {
  return props.navigationType
})

const shouldShowFallback = computed(() => {
  return hasError.value && (retryCount.value >= props.maxRetries || isRetrying.value === false)
})

// Error classification
const classifyNavigationError = (error) => {
  const message = error.message?.toLowerCase() || ''
  const stack = error.stack?.toLowerCase() || ''
  
  // Navigation-specific error types
  if (message.includes('conflict') || message.includes('multiple')) {
    return 'navigation_conflict'
  } else if (message.includes('breakpoint') || message.includes('responsive')) {
    return 'responsive_error'
  } else if (message.includes('chunk') || message.includes('loading')) {
    return 'component_loading'
  } else if (message.includes('permission') || message.includes('auth')) {
    return 'authorization_error'
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'network_error'
  } else if (stack.includes('vue') || stack.includes('component')) {
    return 'component_error'
  }
  
  return 'unknown_navigation_error'
}

// Error handling
const handleError = (error, instance, errorInfo) => {
  const now = Date.now()
  
  // Prevent error spam (same error within cooldown period)
  if (lastErrorTime.value && (now - lastErrorTime.value) < ERROR_COOLDOWN) {
    const lastError = errorHistory.value[0]
    if (lastError && lastError.message === error.message) {
      return false // Suppress duplicate error
    }
  }
  
  lastErrorTime.value = now
  
  // Create error report
  const errorType = classifyNavigationError(error)
  const errorReport = {
    id: `nav_error_${now}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now,
    type: errorType,
    message: error.message,
    stack: error.stack,
    name: error.name,
    navigationType: props.navigationType,
    componentId: props.componentId,
    currentRoute: props.currentRoute,
    retryCount: retryCount.value,
    windowWidth: window.innerWidth,
    userAgent: navigator.userAgent,
    errorInfo,
    instance: instance?.$options?.name || 'Unknown'
  }
  
  // Add to error history
  errorHistory.value.unshift(errorReport)
  if (errorHistory.value.length > 20) {
    errorHistory.value = errorHistory.value.slice(0, 20)
  }
  
  // Set error state
  errorInfo.value = errorReport
  errorDetails.value = {
    ...errorReport,
    conflictStatus: conflictDetector.getStatus(),
    navigationState: {
      hasError: hasError.value,
      retryCount: retryCount.value,
      navigationType: props.navigationType,
      componentId: props.componentId
    }
  }
  
  hasError.value = true
  
  // Handle different error types
  switch (errorType) {
    case 'navigation_conflict':
      handleNavigationConflict(errorReport)
      break
    case 'component_loading':
      handleComponentLoadingError(errorReport)
      break
    case 'authorization_error':
      handleAuthorizationError(errorReport)
      break
    default:
      handleGenericNavigationError(errorReport)
  }
  
  // Custom error handler
  if (props.onError) {
    try {
      props.onError(errorReport)
    } catch (handlerError) {
      console.error('[NAVIGATION ERROR BOUNDARY] Custom error handler failed:', handlerError)
    }
  }
  
  // Report to error tracking services
  reportNavigationError(errorReport)
  
  // Emit error event
  emit('error', errorReport)
  
  // Log in development
  if (isDevelopment) {
    console.group(`🧭 [NAVIGATION ERROR BOUNDARY] ${props.navigationType.toUpperCase()}`)
    console.error('Error:', error)
    console.log('Error Type:', errorType)
    console.log('Component ID:', props.componentId)
    console.log('Navigation Type:', props.navigationType)
    console.log('Retry Count:', retryCount.value)
    console.log('Error Report:', errorReport)
    console.log('Conflict Status:', conflictDetector.getStatus())
    console.groupEnd()
  }
  
  return false // Prevent error propagation
}

// Specific error handlers
const handleNavigationConflict = (errorReport) => {
  // Detect and resolve conflicts
  const conflicts = conflictDetector.detectConflicts()
  
  if (conflicts.length > 0) {
    conflictHistory.value.unshift({
      timestamp: Date.now(),
      conflicts,
      errorReport
    })
    
    emit('conflict-detected', { conflicts, errorReport })
    
    // Try to resolve conflicts automatically
    const resolutions = conflictDetector.resolveConflicts()
    
    if (isDevelopment) {
      console.warn('[NAVIGATION ERROR BOUNDARY] Conflicts detected and resolved:', {
        conflicts,
        resolutions
      })
    }
  }
}

const handleComponentLoadingError = (errorReport) => {
  // Component loading errors might be temporary, retry with delay
  if (retryCount.value < props.maxRetries) {
    setTimeout(() => {
      if (hasError.value) {
        handleRetry()
      }
    }, 2000)
  }
}

const handleAuthorizationError = (errorReport) => {
  // Handle auth errors through the auth error handler
  handleNavigationError(
    new Error(errorReport.message),
    props.currentRoute,
    {
      component: `NavigationErrorBoundary-${props.navigationType}`,
      navigationType: props.navigationType,
      level: ERROR_LEVELS.CRITICAL,
      category: ERROR_CATEGORIES.NAVIGATION
    }
  )
}

const handleGenericNavigationError = (errorReport) => {
  // Handle generic navigation errors
  handleComponentError(
    new Error(errorReport.message),
    `NavigationErrorBoundary-${props.navigationType}`,
    {
      navigationType: props.navigationType,
      componentId: props.componentId,
      level: ERROR_LEVELS.WARNING,
      category: ERROR_CATEGORIES.COMPONENT
    }
  )
}

// Recovery and retry logic
const handleRetry = async () => {
  if (isRetrying.value || retryCount.value >= props.maxRetries) {
    return
  }
  
  isRetrying.value = true
  retryCount.value++
  
  try {
    // Custom recovery function
    if (props.onRecover) {
      await props.onRecover()
    } else {
      // Default recovery: wait and reset
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Reset error state
    resetError()
    
    emit('recover', {
      attempt: retryCount.value,
      navigationType: props.navigationType,
      componentId: props.componentId
    })
    
    if (isDevelopment) {
      console.log(`[NAVIGATION ERROR BOUNDARY] Recovery attempt ${retryCount.value}/${props.maxRetries}`)
    }
    
  } catch (retryError) {
    console.error('[NAVIGATION ERROR BOUNDARY] Recovery failed:', retryError)
    
    // Create error report for retry failure
    const retryErrorReport = {
      ...errorInfo.value,
      retryError: retryError.message,
      retryAttempt: retryCount.value,
      timestamp: Date.now()
    }
    
    errorDetails.value = retryErrorReport
    
    // If max retries reached, activate permanent fallback
    if (retryCount.value >= props.maxRetries) {
      emit('fallback-activated', {
        reason: 'max_retries_reached',
        errorReport: retryErrorReport
      })
    }
  } finally {
    isRetrying.value = false
  }
}

const resetError = () => {
  hasError.value = false
  errorInfo.value = null
  errorDetails.value = {}
  retryCount.value = 0
  isRetrying.value = false
}

// Fallback event handlers
const handleFallbackNavigation = (navigationEvent) => {
  emit('navigation-attempt', {
    ...navigationEvent,
    source: 'fallback',
    errorContext: errorInfo.value
  })
}

const handleFallbackRetry = (retryEvent) => {
  handleRetry()
}

const handleFallbackReload = () => {
  window.location.reload()
}

const handleFallbackAction = (actionEvent) => {
  if (actionEvent.action === 'activated') {
    emit('fallback-activated', {
      reason: 'user_activated',
      errorReport: errorInfo.value
    })
  } else if (actionEvent.action === 'deactivated') {
    emit('fallback-deactivated', {
      errorReport: errorInfo.value
    })
  }
}

// Error reporting
const reportNavigationError = (errorReport) => {
  // Report to external monitoring services
  if (typeof window !== 'undefined' && window.reportError) {
    try {
      window.reportError({
        type: 'navigation_error',
        category: 'navigation_boundary',
        ...errorReport
      })
    } catch (reportError) {
      console.error('[NAVIGATION ERROR BOUNDARY] Failed to report error:', reportError)
    }
  }
  
  // Report to conflict detector for monitoring
  if (errorReport.type === 'navigation_conflict') {
    // Conflict detector handles its own reporting
  }
}

// Component lifecycle
onMounted(() => {
  // Register component with conflict detector
  conflictDetector.registerComponent(
    props.componentId,
    props.navigationType,
    {
      currentRoute: props.currentRoute,
      boundaryActive: true,
      timestamp: Date.now()
    }
  )
  
  if (isDevelopment) {
    console.log(`[NAVIGATION ERROR BOUNDARY] Mounted: ${props.navigationType} (${props.componentId})`)
  }
})

onUnmounted(() => {
  // Unregister component from conflict detector
  conflictDetector.unregisterComponent(props.componentId)
  
  if (isDevelopment) {
    console.log(`[NAVIGATION ERROR BOUNDARY] Unmounted: ${props.navigationType} (${props.componentId})`)
  }
})

// Vue error capture
onErrorCaptured((error, instance, errorInfo) => {
  return handleError(error, instance, errorInfo)
})

// Global error listeners for navigation-specific errors
onMounted(() => {
  // Listen for navigation conflicts
  const handleConflictEvent = (event) => {
    const conflictError = new Error(`Navigation conflict: ${event.detail.message}`)
    handleError(conflictError, null, { type: 'conflict_event', detail: event.detail })
  }
  
  // Listen for component cleanup events
  const handleCleanupEvent = (event) => {
    if (event.detail.componentId === props.componentId) {
      resetError()
    }
  }
  
  window.addEventListener('navigation-conflict', handleConflictEvent)
  window.addEventListener('navigation-conflict-cleanup', handleCleanupEvent)
  
  // Store cleanup function
  window._navigationErrorBoundaryCleanup = () => {
    window.removeEventListener('navigation-conflict', handleConflictEvent)
    window.removeEventListener('navigation-conflict-cleanup', handleCleanupEvent)
  }
})

onUnmounted(() => {
  if (window._navigationErrorBoundaryCleanup) {
    window._navigationErrorBoundaryCleanup()
    delete window._navigationErrorBoundaryCleanup
  }
})

// Watch for route changes to reset errors
watch(() => props.currentRoute, (newRoute, oldRoute) => {
  if (newRoute !== oldRoute && hasError.value) {
    // Reset error on route change (new page might work)
    resetError()
  }
})

// Expose methods for parent components
defineExpose({
  hasError,
  errorInfo,
  retryCount,
  resetError,
  handleRetry,
  getErrorHistory: () => errorHistory.value,
  getConflictHistory: () => conflictHistory.value,
  getStatus: () => ({
    hasError: hasError.value,
    errorType: errorInfo.value?.type,
    retryCount: retryCount.value,
    isRetrying: isRetrying.value,
    navigationType: props.navigationType,
    componentId: props.componentId
  })
})
</script>

<style scoped>
.navigation-error-boundary {
  @apply w-full h-full;
}

/* Ensure error boundary doesn't interfere with layout */
.navigation-error-boundary:not(:has(.navigation-fallback)) {
  @apply contents;
}

/* Animation for error state transitions */
.navigation-error-boundary {
  @apply transition-all duration-300 ease-in-out;
}

/* Development-only visual indicator */
.navigation-error-boundary::before {
  content: '';
  @apply absolute top-0 left-0 w-1 h-full bg-red-500 opacity-0 pointer-events-none;
  @apply transition-opacity duration-300;
}

.navigation-error-boundary:has(.navigation-fallback)::before {
  @apply opacity-100;
}

/* Hide development indicator in production */
@media not all and (min-width: 0) {
  .navigation-error-boundary::before {
    @apply hidden;
  }
}

/* Ensure proper z-index for error states */
.navigation-error-boundary:has(.navigation-fallback) {
  @apply relative z-50;
}
</style>