<template>
  <div class="error-boundary">
    <!-- Main content when no error -->
    <slot v-if="!hasError" />
    
    <!-- Error fallback UI -->
    <div v-else class="error-fallback">
      <div class="error-container">
        <div class="error-content">
          <!-- Error Icon -->
          <div class="error-icon">
            <Icon 
              :name="errorIcon" 
              size="xl" 
              :color="errorIconColor"
              class="error-icon-component"
            />
          </div>
          
          <!-- Error Title -->
          <h2 class="error-title">{{ errorTitle }}</h2>
          
          <!-- Error Message -->
          <p class="error-message">{{ errorMessage }}</p>
          
          <!-- Error Details (Development Only) -->
          <div v-if="showErrorDetails && isDevelopment" class="error-details">
            <button 
              @click="toggleErrorDetails" 
              class="details-toggle"
              type="button"
            >
              {{ showDetailsExpanded ? 'Hide' : 'Show' }} Technical Details
            </button>
            
            <div v-if="showDetailsExpanded" class="details-content">
              <div class="details-section">
                <h4 class="details-heading">Error Information</h4>
                <pre class="details-text">{{ formattedErrorDetails }}</pre>
              </div>
              
              <div v-if="errorContext" class="details-section">
                <h4 class="details-heading">Context</h4>
                <pre class="details-text">{{ JSON.stringify(errorContext, null, 2) }}</pre>
              </div>
            </div>
          </div>
          
          <!-- Error Actions -->
          <div class="error-actions">
            <button
              @click="handleRetry"
              :disabled="isRetrying"
              class="error-action error-action--primary"
              type="button"
            >
              <Icon 
                v-if="isRetrying" 
                name="loading" 
                size="sm" 
                class="animate-spin mr-2" 
              />
              <Icon 
                v-else 
                name="arrow-path" 
                size="sm" 
                class="mr-2" 
              />
              {{ isRetrying ? 'Retrying...' : 'Try Again' }}
            </button>
            
            <button
              v-if="showReportButton"
              @click="handleReportError"
              class="error-action error-action--secondary"
              type="button"
            >
              <Icon name="bug-ant" size="sm" class="mr-2" />
              Report Issue
            </button>
            
            <button
              v-if="showReloadButton"
              @click="handleReload"
              class="error-action error-action--secondary"
              type="button"
            >
              <Icon name="arrow-path" size="sm" class="mr-2" />
              Reload Page
            </button>
            
            <button
              v-if="showHomeButton"
              @click="handleGoHome"
              class="error-action error-action--ghost"
              type="button"
            >
              <Icon name="home" size="sm" class="mr-2" />
              Go to Dashboard
            </button>
          </div>
          
          <!-- Retry Counter (Development) -->
          <div v-if="isDevelopment && retryCount > 0" class="retry-info">
            <p class="retry-text">Retry attempts: {{ retryCount }}/{{ maxRetries }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onErrorCaptured, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import Icon from '@/Components/Base/Icon.vue'

const props = defineProps({
  /**
   * Custom error message to display
   */
  fallbackMessage: {
    type: String,
    default: ''
  },
  
  /**
   * Whether to show the retry button
   */
  showRetry: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show the reload button
   */
  showReload: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show the home/dashboard button
   */
  showHome: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show the report error button
   */
  showReport: {
    type: Boolean,
    default: true
  },
  
  /**
   * Maximum number of retry attempts
   */
  maxRetries: {
    type: Number,
    default: 3
  },
  
  /**
   * Custom retry handler function
   */
  onRetry: {
    type: Function,
    default: null
  },
  
  /**
   * Custom error reporter function
   */
  onReportError: {
    type: Function,
    default: null
  },
  
  /**
   * Error types to catch (empty array catches all)
   */
  errorTypes: {
    type: Array,
    default: () => []
  },
  
  /**
   * Component name for error reporting
   */
  componentName: {
    type: String,
    default: 'Unknown Component'
  }
})

const emit = defineEmits(['error', 'retry', 'reset', 'report'])

// Reactive state
const hasError = ref(false)
const errorInfo = ref(null)
const errorContext = ref(null)
const isRetrying = ref(false)
const retryCount = ref(0)
const showDetailsExpanded = ref(false)
const lastErrorTime = ref(null)

// Constants
const isDevelopment = process.env.NODE_ENV === 'development'

// Computed properties
const errorType = computed(() => {
  if (!errorInfo.value) return 'unknown'
  return errorInfo.value.type || 'unknown'
})

const errorTitle = computed(() => {
  const titles = {
    network: 'Network Error',
    permission: 'Access Denied',
    authentication: 'Authentication Error',
    validation: 'Validation Error',
    server: 'Server Error',
    client: 'Application Error',
    unknown: 'Something went wrong'
  }
  
  return titles[errorType.value] || titles.unknown
})

const errorMessage = computed(() => {
  if (props.fallbackMessage) {
    return props.fallbackMessage
  }
  
  if (!errorInfo.value) {
    return 'An unexpected error occurred. Please try again.'
  }
  
  const messages = {
    network: 'Unable to connect to the server. Please check your internet connection and try again.',
    permission: 'You don\'t have permission to access this resource. Please contact your administrator.',
    authentication: 'Your session has expired or you\'re not authenticated. Please log in again.',
    validation: 'The data provided is invalid. Please check your input and try again.',
    server: 'The server encountered an error. Please try again later.',
    client: 'The application encountered an error. Please refresh the page or try again.',
    unknown: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
  
  return messages[errorType.value] || messages.unknown
})

const errorIcon = computed(() => {
  const icons = {
    network: 'wifi-slash',
    permission: 'shield-exclamation',
    authentication: 'lock-closed',
    validation: 'exclamation-triangle',
    server: 'server-stack',
    client: 'computer-desktop',
    unknown: 'exclamation-triangle'
  }
  
  return icons[errorType.value] || icons.unknown
})

const errorIconColor = computed(() => {
  const colors = {
    network: 'warning',
    permission: 'error',
    authentication: 'warning',
    validation: 'warning',
    server: 'error',
    client: 'error',
    unknown: 'error'
  }
  
  return colors[errorType.value] || colors.unknown
})

const showErrorDetails = computed(() => {
  return isDevelopment && errorInfo.value
})

const showReportButton = computed(() => {
  return props.showReport && !isDevelopment
})

const showReloadButton = computed(() => {
  return props.showReload
})

const showHomeButton = computed(() => {
  return props.showHome
})

const formattedErrorDetails = computed(() => {
  if (!errorInfo.value) return ''
  
  return JSON.stringify({
    message: errorInfo.value.message,
    stack: errorInfo.value.stack,
    timestamp: errorInfo.value.timestamp,
    url: errorInfo.value.url,
    userAgent: errorInfo.value.userAgent,
    componentName: props.componentName
  }, null, 2)
})

// Error classification
const classifyError = (error) => {
  const message = error.message?.toLowerCase() || ''
  const stack = error.stack?.toLowerCase() || ''
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network'
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission'
  }
  
  // Authentication errors
  if (message.includes('auth') || message.includes('login') || message.includes('session')) {
    return 'authentication'
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation'
  }
  
  // Server errors
  if (message.includes('server') || message.includes('500') || message.includes('internal')) {
    return 'server'
  }
  
  // Client-side errors
  if (message.includes('undefined') || message.includes('null') || stack.includes('vue')) {
    return 'client'
  }
  
  return 'unknown'
}

// Error handling
const handleError = (error, instance, errorInfo) => {
  // Check if we should handle this error type
  if (props.errorTypes.length > 0) {
    const errorType = classifyError(error)
    if (!props.errorTypes.includes(errorType)) {
      return true // Let other error boundaries handle it
    }
  }
  
  const timestamp = new Date().toISOString()
  
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    type: classifyError(error),
    timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent,
    componentName: props.componentName,
    errorInfo
  }
  
  errorInfo.value = errorData
  errorContext.value = {
    instance: instance?.$options?.name || 'Unknown',
    props: instance?.$props,
    errorInfo
  }
  
  hasError.value = true
  lastErrorTime.value = Date.now()
  
  // Log error in development
  if (isDevelopment) {
    console.group(`🚨 [ERROR BOUNDARY] ${props.componentName}`)
    console.error('Error:', error)
    //console.log('Error Type:', errorData.type)
    //console.log('Component:', props.componentName)
    //console.log('Error Info:', errorInfo)
    //console.log('Context:', errorContext.value)
    console.groupEnd()
  }
  
  // Report error to external services
  reportError(errorData)
  
  // Emit error event
  emit('error', errorData)
  
  return false // Prevent error from propagating
}

// Error reporting
const reportError = (errorData) => {
  // Custom error reporter
  if (props.onReportError) {
    try {
      props.onReportError(errorData)
    } catch (reportError) {
      console.error('[ERROR BOUNDARY] Failed to report error:', reportError)
    }
  }
  
  // Global error reporter
  if (typeof window !== 'undefined' && window.reportError) {
    try {
      window.reportError(errorData)
    } catch (reportError) {
      console.error('[ERROR BOUNDARY] Failed to report to global handler:', reportError)
    }
  }
  
  // Emit report event
  emit('report', errorData)
}

// Action handlers
const handleRetry = async () => {
  if (isRetrying.value || retryCount.value >= props.maxRetries) {
    return
  }
  
  isRetrying.value = true
  retryCount.value++
  
  try {
    // Custom retry handler
    if (props.onRetry) {
      await props.onRetry()
    } else {
      // Default retry: wait and reset
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Reset error state
    resetError()
    
    emit('retry', { attempt: retryCount.value })
    
  } catch (retryError) {
    console.error('[ERROR BOUNDARY] Retry failed:', retryError)
    
    // If max retries reached, show different message
    if (retryCount.value >= props.maxRetries) {
      errorInfo.value = {
        ...errorInfo.value,
        message: 'Maximum retry attempts reached. Please reload the page or contact support.',
        type: 'client'
      }
    }
  } finally {
    isRetrying.value = false
  }
}

const handleReportError = () => {
  if (errorInfo.value) {
    reportError(errorInfo.value)
    
    // Show user feedback
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Error reported successfully. Thank you!', 'success')
    }
  }
}

const handleReload = () => {
  window.location.reload()
}

const handleGoHome = () => {
  try {
    router.visit('/dashboard')
  } catch (error) {
    // Fallback to direct navigation
    window.location.href = '/dashboard'
  }
}

const toggleErrorDetails = () => {
  showDetailsExpanded.value = !showDetailsExpanded.value
}

const resetError = () => {
  hasError.value = false
  errorInfo.value = null
  errorContext.value = null
  retryCount.value = 0
  showDetailsExpanded.value = false
  
  emit('reset')
}

// Vue error capture
onErrorCaptured((error, instance, errorInfo) => {
  return handleError(error, instance, errorInfo)
})

// Global error listeners
onMounted(() => {
  // Unhandled promise rejections
  const handleUnhandledRejection = (event) => {
    handleError(event.reason, null, { type: 'unhandledrejection' })
    event.preventDefault()
  }
  
  // JavaScript errors
  const handleGlobalError = (event) => {
    handleError(event.error, null, { type: 'error' })
  }
  
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleGlobalError)
  
  // Store cleanup function
  window._errorBoundaryCleanup = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleGlobalError)
  }
})

// Cleanup
onUnmounted(() => {
  if (window._errorBoundaryCleanup) {
    window._errorBoundaryCleanup()
    delete window._errorBoundaryCleanup
  }
})

// Watch for error changes to auto-retry in some cases
watch(hasError, (newValue) => {
  if (newValue && errorType.value === 'network' && retryCount.value === 0) {
    // Auto-retry network errors once after a delay
    setTimeout(() => {
      if (hasError.value && !isRetrying.value) {
        handleRetry()
      }
    }, 2000)
  }
})

// Expose methods for parent components
defineExpose({
  resetError,
  hasError,
  errorInfo,
  retryCount
})
</script>

<style scoped>
.error-boundary {
  @apply w-full h-full;
}

.error-fallback {
  @apply min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8;
}

.error-container {
  @apply sm:mx-auto sm:w-full sm:max-w-md;
}

.error-content {
  @apply bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 space-y-6;
}

.error-icon {
  @apply flex justify-center;
}

.error-icon-component {
  @apply drop-shadow-sm;
}

.error-title {
  @apply text-center text-xl font-semibold text-neutral-900;
}

.error-message {
  @apply text-center text-sm text-neutral-600 leading-relaxed;
}

.error-details {
  @apply border-t border-neutral-200 pt-4;
}

.details-toggle {
  @apply text-sm text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded;
}

.details-content {
  @apply mt-3 space-y-4;
}

.details-section {
  @apply bg-neutral-50 rounded-md p-3;
}

.details-heading {
  @apply text-xs font-medium text-neutral-700 mb-2;
}

.details-text {
  @apply text-xs text-neutral-600 whitespace-pre-wrap break-words font-mono;
}

.error-actions {
  @apply flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3;
}

.error-action {
  @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.error-action--primary {
  @apply border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
}

.error-action--secondary {
  @apply border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500;
}

.error-action--ghost {
  @apply border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500;
}

.retry-info {
  @apply text-center border-t border-neutral-200 pt-4;
}

.retry-text {
  @apply text-xs text-neutral-500;
}

/* Dark theme support */
.theme-dark .error-fallback {
  @apply bg-neutral-900;
}

.theme-dark .error-content {
  @apply bg-neutral-800 border border-neutral-700;
}

.theme-dark .error-title {
  @apply text-neutral-100;
}

.theme-dark .error-message {
  @apply text-neutral-300;
}

.theme-dark .error-details {
  @apply border-neutral-700;
}

.theme-dark .details-section {
  @apply bg-neutral-700;
}

.theme-dark .details-heading {
  @apply text-neutral-300;
}

.theme-dark .details-text {
  @apply text-neutral-400;
}

.theme-dark .error-action--secondary {
  @apply border-neutral-600 text-neutral-300 bg-neutral-700 hover:bg-neutral-600;
}

.theme-dark .error-action--ghost {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .retry-text {
  @apply text-neutral-400;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-actions {
    @apply space-y-2;
  }
  
  .error-action {
    @apply w-full;
  }
}

/* Animation */
.error-content {
  @apply animate-fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>