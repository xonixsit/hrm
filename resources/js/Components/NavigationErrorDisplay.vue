<template>
  <div v-if="showError" class="fixed top-4 right-4 z-50 max-w-md">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">
            Navigation Error
          </h3>
          <div class="mt-1 text-sm text-red-700">
            {{ errorMessage }}
          </div>
          <div v-if="fallbackAction" class="mt-3">
            <button
              @click="executeFallback"
              class="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded-md transition-colors duration-200"
            >
              {{ fallbackButtonText }}
            </button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="dismissError"
            class="bg-red-50 rounded-md inline-flex text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showError = ref(false)
const errorMessage = ref('')
const fallbackAction = ref(null)
const errorTimeout = ref(null)

const fallbackButtonText = computed(() => {
  if (errorMessage.value.includes('log in')) {
    return 'Go to Login'
  } else if (errorMessage.value.includes('permission')) {
    return 'Go to Dashboard'
  } else if (errorMessage.value.includes('network')) {
    return 'Reload Page'
  }
  return 'Try Again'
})

const showNavigationError = (message, fallback = null) => {
  errorMessage.value = message
  fallbackAction.value = fallback
  showError.value = true
  
  // Auto-dismiss after 10 seconds
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
  
  errorTimeout.value = setTimeout(() => {
    dismissError()
  }, 10000)
}

const executeFallback = async () => {
  if (fallbackAction.value) {
    try {
      await fallbackAction.value()
    } catch (error) {
      console.error('[NAVIGATION ERROR DISPLAY] Fallback action failed:', error)
    }
  }
  dismissError()
}

const dismissError = () => {
  showError.value = false
  errorMessage.value = ''
  fallbackAction.value = null
  
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
    errorTimeout.value = null
  }
}

// Set up global error handler
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.showNavigationError = showNavigationError
  }
})

// Cleanup
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete window.showNavigationError
  }
  
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
})
</script>