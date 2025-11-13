<template>
  <div class="error-page">
    <div class="error-page-container">
      <div class="error-page-content">
        <!-- Error Code Display -->
        <div v-if="errorCode" class="error-code">
          <span class="error-code-text">{{ errorCode }}</span>
        </div>
        
        <!-- Error Illustration/Icon -->
        <div class="error-illustration">
          <slot name="illustration">
            <div class="error-icon-wrapper">
              <Icon 
                :name="errorIcon" 
                size="2xl" 
                :color="errorIconColor"
                class="error-page-icon"
              />
            </div>
          </slot>
        </div>
        
        <!-- Error Title -->
        <h1 class="error-title">{{ displayTitle }}</h1>
        
        <!-- Error Description -->
        <p class="error-description">{{ displayDescription }}</p>
        
        <!-- Additional Information -->
        <div v-if="additionalInfo" class="error-additional-info">
          <div class="info-content">
            <Icon name="info" size="sm" class="info-icon" />
            <p class="info-text">{{ additionalInfo }}</p>
          </div>
        </div>
        
        <!-- Error Actions -->
        <div class="error-actions">
          <slot name="actions">
            <!-- Primary Action -->
            <button
              v-if="showRetryButton"
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
              {{ isRetrying ? 'Retrying...' : retryButtonText }}
            </button>
            
            <!-- Secondary Actions -->
            <button
              v-if="showHomeButton"
              @click="handleGoHome"
              class="error-action error-action--secondary"
              type="button"
            >
              <Icon name="home" size="sm" class="mr-2" />
              {{ homeButtonText }}
            </button>
            
            <button
              v-if="showBackButton"
              @click="handleGoBack"
              class="error-action error-action--secondary"
              type="button"
            >
              <Icon name="arrow-left" size="sm" class="mr-2" />
              Go Back
            </button>
            
            <button
              v-if="showReloadButton"
              @click="handleReload"
              class="error-action error-action--ghost"
              type="button"
            >
              <Icon name="arrow-path" size="sm" class="mr-2" />
              Reload Page
            </button>
          </slot>
        </div>
        
        <!-- Help Links -->
        <div v-if="showHelpLinks" class="error-help-links">
          <div class="help-links-content">
            <p class="help-links-title">Need help?</p>
            <div class="help-links-list">
              <a 
                v-if="supportEmail" 
                :href="`mailto:${supportEmail}`"
                class="help-link"
              >
                <Icon name="envelope" size="sm" class="mr-1" />
                Contact Support
              </a>
              
              <a 
                v-if="documentationUrl" 
                :href="documentationUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="help-link"
              >
                <Icon name="document-text" size="sm" class="mr-1" />
                Documentation
              </a>
              
              <a 
                v-if="statusPageUrl" 
                :href="statusPageUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="help-link"
              >
                <Icon name="signal" size="sm" class="mr-1" />
                System Status
              </a>
            </div>
          </div>
        </div>
        
        <!-- Error Details (Development) -->
        <div v-if="showErrorDetails && isDevelopment" class="error-details">
          <button 
            @click="toggleErrorDetails" 
            class="details-toggle"
            type="button"
          >
            {{ showDetailsExpanded ? 'Hide' : 'Show' }} Error Details
          </button>
          
          <div v-if="showDetailsExpanded" class="details-content">
            <div class="details-section">
              <h4 class="details-heading">Error Information</h4>
              <pre class="details-text">{{ formattedErrorDetails }}</pre>
            </div>
            
            <div v-if="requestInfo" class="details-section">
              <h4 class="details-heading">Request Information</h4>
              <pre class="details-text">{{ JSON.stringify(requestInfo, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import Icon from '@/Components/Base/Icon.vue'

const props = defineProps({
  /**
   * HTTP error code (404, 500, etc.)
   */
  errorCode: {
    type: [String, Number],
    default: null
  },
  
  /**
   * Error type for classification
   */
  errorType: {
    type: String,
    default: 'unknown',
    validator: (value) => [
      'network', 'permission', 'authentication', 'validation', 
      'server', 'client', 'not-found', 'maintenance', 'unknown'
    ].includes(value)
  },
  
  /**
   * Custom error title
   */
  title: {
    type: String,
    default: ''
  },
  
  /**
   * Custom error description
   */
  description: {
    type: String,
    default: ''
  },
  
  /**
   * Additional information to display
   */
  additionalInfo: {
    type: String,
    default: ''
  },
  
  /**
   * Error details for development
   */
  errorDetails: {
    type: Object,
    default: null
  },
  
  /**
   * Request information for debugging
   */
  requestInfo: {
    type: Object,
    default: null
  },
  
  /**
   * Whether to show retry button
   */
  showRetry: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show home button
   */
  showHome: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show back button
   */
  showBack: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show reload button
   */
  showReload: {
    type: Boolean,
    default: false
  },
  
  /**
   * Whether to show help links
   */
  showHelp: {
    type: Boolean,
    default: true
  },
  
  /**
   * Support email address
   */
  supportEmail: {
    type: String,
    default: 'support@example.com'
  },
  
  /**
   * Documentation URL
   */
  documentationUrl: {
    type: String,
    default: ''
  },
  
  /**
   * Status page URL
   */
  statusPageUrl: {
    type: String,
    default: ''
  },
  
  /**
   * Custom retry handler
   */
  onRetry: {
    type: Function,
    default: null
  },
  
  /**
   * Custom home navigation handler
   */
  onGoHome: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['retry', 'go-home', 'go-back', 'reload'])

// Reactive state
const isRetrying = ref(false)
const showDetailsExpanded = ref(false)

// Constants
const isDevelopment = process.env.NODE_ENV === 'development'

// Computed properties
const displayTitle = computed(() => {
  if (props.title) return props.title
  
  const titles = {
    'not-found': 'Page Not Found',
    'network': 'Connection Problem',
    'permission': 'Access Denied',
    'authentication': 'Authentication Required',
    'validation': 'Invalid Request',
    'server': 'Server Error',
    'client': 'Application Error',
    'maintenance': 'Under Maintenance',
    'unknown': 'Something Went Wrong'
  }
  
  // Use error code for common HTTP errors
  if (props.errorCode) {
    const codeTitle = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Page Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    }[props.errorCode]
    
    if (codeTitle) return codeTitle
  }
  
  return titles[props.errorType] || titles.unknown
})

const displayDescription = computed(() => {
  if (props.description) return props.description
  
  const descriptions = {
    'not-found': 'The page you\'re looking for doesn\'t exist or has been moved.',
    'network': 'Unable to connect to our servers. Please check your internet connection.',
    'permission': 'You don\'t have permission to access this resource.',
    'authentication': 'Please log in to access this page.',
    'validation': 'The request contains invalid data. Please check your input.',
    'server': 'Our servers are experiencing issues. Please try again later.',
    'client': 'The application encountered an error. Please refresh the page.',
    'maintenance': 'We\'re currently performing maintenance. Please check back soon.',
    'unknown': 'An unexpected error occurred. Please try again or contact support.'
  }
  
  // Use error code for common HTTP errors
  if (props.errorCode) {
    const codeDescription = {
      400: 'The request was invalid or cannot be served.',
      401: 'You need to log in to access this resource.',
      403: 'You don\'t have permission to access this resource.',
      404: 'The page you\'re looking for doesn\'t exist.',
      408: 'The request took too long to process.',
      429: 'Too many requests. Please wait before trying again.',
      500: 'The server encountered an internal error.',
      502: 'The server received an invalid response.',
      503: 'The service is temporarily unavailable.',
      504: 'The server took too long to respond.'
    }[props.errorCode]
    
    if (codeDescription) return codeDescription
  }
  
  return descriptions[props.errorType] || descriptions.unknown
})

const errorIcon = computed(() => {
  const icons = {
    'not-found': 'document-magnifying-glass',
    'network': 'wifi-slash',
    'permission': 'shield-exclamation',
    'authentication': 'lock-closed',
    'validation': 'exclamation-triangle',
    'server': 'server-stack',
    'client': 'computer-desktop',
    'maintenance': 'wrench-screwdriver',
    'unknown': 'exclamation-triangle'
  }
  
  return icons[props.errorType] || icons.unknown
})

const errorIconColor = computed(() => {
  const colors = {
    'not-found': 'info',
    'network': 'warning',
    'permission': 'error',
    'authentication': 'warning',
    'validation': 'warning',
    'server': 'error',
    'client': 'error',
    'maintenance': 'info',
    'unknown': 'error'
  }
  
  return colors[props.errorType] || colors.unknown
})

const showRetryButton = computed(() => {
  return props.showRetry && ['network', 'server', 'client'].includes(props.errorType)
})

const showHomeButton = computed(() => {
  return props.showHome
})

const showBackButton = computed(() => {
  return props.showBack && window.history.length > 1
})

const showReloadButton = computed(() => {
  return props.showReload
})

const showHelpLinks = computed(() => {
  return props.showHelp && (props.supportEmail || props.documentationUrl || props.statusPageUrl)
})

const showErrorDetails = computed(() => {
  return isDevelopment && (props.errorDetails || props.requestInfo)
})

const retryButtonText = computed(() => {
  const texts = {
    'network': 'Try Again',
    'server': 'Retry Request',
    'client': 'Reload Application'
  }
  
  return texts[props.errorType] || 'Try Again'
})

const homeButtonText = computed(() => {
  return props.errorType === 'authentication' ? 'Go to Login' : 'Go to Dashboard'
})

const formattedErrorDetails = computed(() => {
  if (!props.errorDetails) return ''
  
  return JSON.stringify(props.errorDetails, null, 2)
})

// Action handlers
const handleRetry = async () => {
  if (isRetrying.value) return
  
  isRetrying.value = true
  
  try {
    if (props.onRetry) {
      await props.onRetry()
    } else {
      // Default retry behavior
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    }
    
    emit('retry')
  } catch (error) {
    console.error('[ERROR PAGE] Retry failed:', error)
  } finally {
    isRetrying.value = false
  }
}

const handleGoHome = () => {
  if (props.onGoHome) {
    props.onGoHome()
  } else {
    const homeUrl = props.errorType === 'authentication' ? '/login' : '/dashboard'
    
    try {
      router.visit(homeUrl)
    } catch (error) {
      window.location.href = homeUrl
    }
  }
  
  emit('go-home')
}

const handleGoBack = () => {
  try {
    window.history.back()
  } catch (error) {
    handleGoHome()
  }
  
  emit('go-back')
}

const handleReload = () => {
  window.location.reload()
  emit('reload')
}

const toggleErrorDetails = () => {
  showDetailsExpanded.value = !showDetailsExpanded.value
}

// Log error information in development
onMounted(() => {
  if (isDevelopment) {
    console.group('🚨 [ERROR PAGE] Error Information')
    console.log('Error Code:', props.errorCode)
    console.log('Error Type:', props.errorType)
    console.log('Title:', displayTitle.value)
    console.log('Description:', displayDescription.value)
    console.log('Error Details:', props.errorDetails)
    console.log('Request Info:', props.requestInfo)
    console.groupEnd()
  }
})
</script>

<style scoped>
.error-page {
  @apply min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4 sm:px-6 lg:px-8;
}

.error-page-container {
  @apply max-w-lg w-full;
}

.error-page-content {
  @apply text-center space-y-8;
}

.error-code {
  @apply mb-4;
}

.error-code-text {
  @apply text-8xl font-bold text-primary-600 opacity-20 select-none;
}

.error-illustration {
  @apply flex justify-center;
}

.error-icon-wrapper {
  @apply p-4 bg-white rounded-full shadow-lg;
}

.error-page-icon {
  @apply drop-shadow-sm;
}

.error-title {
  @apply text-3xl font-bold text-neutral-900 sm:text-4xl;
}

.error-description {
  @apply text-lg text-neutral-600 leading-relaxed max-w-md mx-auto;
}

.error-additional-info {
  @apply bg-teal-50 border border-teal-200 rounded-lg p-4;
}

.info-content {
  @apply flex items-start space-x-2;
}

.info-icon {
  @apply text-teal-500 mt-0.5 flex-shrink-0;
}

.info-text {
  @apply text-sm text-teal-800;
}

.error-actions {
  @apply flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center;
}

.error-action {
  @apply inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.error-action--primary {
  @apply border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5;
}

.error-action--secondary {
  @apply border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500 shadow-sm hover:shadow-md;
}

.error-action--ghost {
  @apply border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500;
}

.error-help-links {
  @apply border-t border-neutral-200 pt-6;
}

.help-links-content {
  @apply space-y-3;
}

.help-links-title {
  @apply text-sm font-medium text-neutral-700;
}

.help-links-list {
  @apply flex flex-wrap justify-center gap-4;
}

.help-link {
  @apply inline-flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200;
}

.error-details {
  @apply border-t border-neutral-200 pt-6 text-left;
}

.details-toggle {
  @apply text-sm text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded;
}

.details-content {
  @apply mt-4 space-y-4;
}

.details-section {
  @apply bg-neutral-100 rounded-lg p-4;
}

.details-heading {
  @apply text-sm font-medium text-neutral-700 mb-2;
}

.details-text {
  @apply text-xs text-neutral-600 whitespace-pre-wrap break-words font-mono bg-white rounded p-2 border;
}

/* Dark theme support */
.theme-dark .error-page {
  @apply from-neutral-900 to-neutral-800;
}

.theme-dark .error-icon-wrapper {
  @apply bg-neutral-800 border border-neutral-700;
}

.theme-dark .error-title {
  @apply text-neutral-100;
}

.theme-dark .error-description {
  @apply text-neutral-300;
}

.theme-dark .error-additional-info {
  @apply bg-teal-900 border-teal-800;
}

.theme-dark .info-text {
  @apply text-teal-200;
}

.theme-dark .error-action--secondary {
  @apply border-neutral-600 text-neutral-300 bg-neutral-700 hover:bg-neutral-600;
}

.theme-dark .error-action--ghost {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .help-links-title {
  @apply text-neutral-300;
}

.theme-dark .error-details {
  @apply border-neutral-700;
}

.theme-dark .details-section {
  @apply bg-neutral-800;
}

.theme-dark .details-heading {
  @apply text-neutral-300;
}

.theme-dark .details-text {
  @apply text-neutral-400 bg-neutral-900 border-neutral-700;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-code-text {
    @apply text-6xl;
  }
  
  .error-title {
    @apply text-2xl;
  }
  
  .error-description {
    @apply text-base;
  }
  
  .error-actions {
    @apply space-y-2;
  }
  
  .error-action {
    @apply w-full;
  }
  
  .help-links-list {
    @apply flex-col items-center gap-2;
  }
}

/* Animation */
.error-page-content {
  @apply animate-fade-in-up;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

/* Hover effects */
.error-action:hover:not(:disabled) {
  @apply transform -translate-y-0.5;
}

.help-link:hover {
  @apply transform translate-x-0.5;
}
</style>