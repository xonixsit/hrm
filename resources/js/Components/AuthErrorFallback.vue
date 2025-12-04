<template>
  <div class="auth-error-fallback">
    <!-- Critical Error State -->
    <div v-if="errorType === 'critical'" class="error-container critical">
      <div class="error-icon">
        <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <div class="error-content">
        <h2 class="error-title">Authentication Error</h2>
        <p class="error-message">
          We're having trouble loading your authentication information. 
          This might be due to a session issue or server configuration problem.
        </p>
        
        <div class="error-actions">
          <button @click="handleRefresh" class="btn-primary">
            Refresh Page
          </button>
          <button @click="handleLogout" class="btn-secondary">
            Sign Out & Sign In Again
          </button>
        </div>
        
        <!-- Development Details -->
        <div v-if="isDevelopment && showDetails" class="error-details">
          <button @click="toggleDetails" class="details-toggle">
            {{ showDetails ? 'Hide' : 'Show' }} Technical Details
          </button>
          <div v-if="showDetails" class="details-content">
            <h4>Error Information:</h4>
            <pre>{{ JSON.stringify(errorInfo, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Warning State -->
    <div v-else-if="errorType === 'warning'" class="error-container warning">
      <div class="error-icon">
        <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div class="error-content">
        <h3 class="warning-title">Limited Functionality</h3>
        <p class="warning-message">
          Some features may not work properly due to incomplete authentication data.
        </p>
        
        <div class="error-actions">
          <button @click="handleRetry" class="btn-primary" :disabled="isRetrying">
            {{ isRetrying ? 'Retrying...' : 'Try Again' }}
          </button>
          <button @click="handleContinue" class="btn-secondary">
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
    
    <!-- Fallback Content Slot -->
    <div v-else class="fallback-content">
      <slot name="fallback">
        <div class="generic-error">
          <p>Unable to load content. Please try refreshing the page.</p>
          <button @click="handleRefresh" class="btn-primary">
            Refresh
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import { useAuth } from '@/composables/useAuth.js'
import { useAuthErrorContext } from '@/composables/useAuthErrorBoundary.js'

const props = defineProps({
  errorInfo: {
    type: Object,
    default: null
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  customMessage: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['retry', 'refresh', 'continue'])

const { getAuthError, debugAuthState } = useAuth()
const { resetError, retryWithAuthCheck } = useAuthErrorContext()

const showDetails = ref(false)
const isRetrying = ref(false)
const isDevelopment = process.env.NODE_ENV === 'development'

// Determine error type and severity
const errorType = computed(() => {
  if (props.errorInfo?.authState?.type) {
    return props.errorInfo.authState.type
  }
  
  const authError = getAuthError()
  return authError?.type || 'warning'
})

// Enhanced error logging on mount
onMounted(() => {
  if (isDevelopment) {
    console.group('🔧 [AUTH ERROR FALLBACK] Component mounted')
    //console.log('Error Info:', props.errorInfo)
    //console.log('Auth Error:', getAuthError())
    //console.log('Error Type:', errorType.value)
    debugAuthState()
    console.groupEnd()
  }
})

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handleRefresh = () => {
  if (isDevelopment) {
    //console.log('[AUTH ERROR FALLBACK] Refreshing page')
  }
  
  emit('refresh')
  window.location.reload()
}

const handleLogout = () => {
  if (isDevelopment) {
    //console.log('[AUTH ERROR FALLBACK] Logging out user')
  }
  
  router.post('/logout')
}

const handleRetry = async () => {
  if (isRetrying.value) return
  
  isRetrying.value = true
  
  try {
    if (isDevelopment) {
      //console.log('[AUTH ERROR FALLBACK] Attempting retry')
    }
    
    await retryWithAuthCheck(async () => {
      // Reset error state
      resetError()
      
      // Emit retry event for parent component
      emit('retry')
      
      // Force re-evaluation of auth state
      debugAuthState()
    })
    
    if (isDevelopment) {
      //console.log('[AUTH ERROR FALLBACK] Retry successful')
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('[AUTH ERROR FALLBACK] Retry failed:', error)
    }
  } finally {
    isRetrying.value = false
  }
}

const handleContinue = () => {
  if (isDevelopment) {
    //console.log('[AUTH ERROR FALLBACK] User chose to continue despite errors')
  }
  
  resetError()
  emit('continue')
}
</script>

<style scoped>
.auth-error-fallback {
  @apply p-6 max-w-2xl mx-auto;
}

.error-container {
  @apply rounded-lg border p-6 text-center;
}

.error-container.critical {
  @apply bg-red-50 border-red-200;
}

.error-container.warning {
  @apply bg-yellow-50 border-yellow-200;
}

.error-icon {
  @apply flex justify-center mb-4;
}

.error-content {
  @apply space-y-4;
}

.error-title {
  @apply text-xl font-semibold text-red-800;
}

.warning-title {
  @apply text-lg font-semibold text-yellow-800;
}

.error-message, .warning-message {
  @apply text-gray-700 leading-relaxed;
}

.error-actions {
  @apply flex gap-3 justify-center flex-wrap;
}

.btn-primary {
  @apply px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}

.error-details {
  @apply mt-6 text-left;
}

.details-toggle {
  @apply text-sm text-teal-600 hover:text-teal-800 underline;
}

.details-content {
  @apply mt-2 p-3 bg-gray-100 rounded text-xs;
}

.details-content pre {
  @apply whitespace-pre-wrap break-words;
}

.fallback-content {
  @apply text-center p-6;
}

.generic-error {
  @apply space-y-4;
}
</style>