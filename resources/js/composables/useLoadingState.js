import { ref, computed, reactive } from 'vue'

/**
 * Composable for managing loading states
 * Provides centralized loading state management with support for multiple concurrent operations
 */
export function useLoadingState() {
  // Global loading states
  const loadingStates = reactive(new Map())
  const globalLoading = ref(false)

  // Computed properties
  const isLoading = computed(() => {
    return globalLoading.value || loadingStates.size > 0
  })

  const hasSpecificLoading = computed(() => (key) => {
    return loadingStates.has(key)
  })

  const loadingCount = computed(() => {
    return loadingStates.size
  })

  const loadingKeys = computed(() => {
    return Array.from(loadingStates.keys())
  })

  // Methods
  const startLoading = (key = 'default', options = {}) => {
    const loadingState = {
      key,
      startTime: Date.now(),
      message: options.message || 'Loading...',
      progress: options.progress || null,
      estimatedTime: options.estimatedTime || null,
      cancelable: options.cancelable || false,
      onCancel: options.onCancel || null,
      ...options
    }

    loadingStates.set(key, loadingState)
    
    // Emit loading start event
    if (options.onStart) {
      options.onStart(loadingState)
    }

    return loadingState
  }

  const stopLoading = (key = 'default', options = {}) => {
    const loadingState = loadingStates.get(key)
    
    if (loadingState) {
      const duration = Date.now() - loadingState.startTime
      loadingStates.delete(key)
      
      // Emit loading complete event
      if (options.onComplete) {
        options.onComplete({ ...loadingState, duration })
      }
      
      return { ...loadingState, duration }
    }
    
    return null
  }

  const updateLoading = (key, updates) => {
    const loadingState = loadingStates.get(key)
    
    if (loadingState) {
      Object.assign(loadingState, updates)
      loadingStates.set(key, loadingState)
      return loadingState
    }
    
    return null
  }

  const setGlobalLoading = (loading, message = 'Loading...') => {
    globalLoading.value = loading
    
    if (loading) {
      startLoading('global', { message })
    } else {
      stopLoading('global')
    }
  }

  const clearAllLoading = () => {
    loadingStates.clear()
    globalLoading.value = false
  }

  const getLoadingState = (key) => {
    return loadingStates.get(key) || null
  }

  const cancelLoading = (key) => {
    const loadingState = loadingStates.get(key)
    
    if (loadingState && loadingState.cancelable && loadingState.onCancel) {
      loadingState.onCancel()
      stopLoading(key)
      return true
    }
    
    return false
  }

  // Utility methods for common loading patterns
  const withLoading = async (key, asyncFn, options = {}) => {
    try {
      startLoading(key, options)
      const result = await asyncFn()
      stopLoading(key, options)
      return result
    } catch (error) {
      stopLoading(key, options)
      throw error
    }
  }

  const withGlobalLoading = async (asyncFn, message = 'Loading...') => {
    try {
      setGlobalLoading(true, message)
      const result = await asyncFn()
      setGlobalLoading(false)
      return result
    } catch (error) {
      setGlobalLoading(false)
      throw error
    }
  }

  // Progress tracking utilities
  const createProgressTracker = (key, total, options = {}) => {
    const progressState = {
      current: 0,
      total,
      percentage: 0,
      startTime: Date.now(),
      estimatedTime: null,
      ...options
    }

    startLoading(key, {
      ...options,
      progress: progressState
    })

    const updateProgress = (current, message) => {
      progressState.current = Math.min(current, total)
      progressState.percentage = Math.round((progressState.current / total) * 100)
      
      // Calculate estimated time remaining
      if (progressState.current > 0) {
        const elapsed = Date.now() - progressState.startTime
        const rate = progressState.current / elapsed
        const remaining = (total - progressState.current) / rate
        progressState.estimatedTime = Math.round(remaining / 1000)
      }

      updateLoading(key, {
        progress: progressState,
        message: message || `${progressState.current} of ${total} completed`
      })

      return progressState
    }

    const completeProgress = () => {
      updateProgress(total)
      stopLoading(key)
      return progressState
    }

    return {
      updateProgress,
      completeProgress,
      getProgress: () => progressState
    }
  }

  // Debounced loading for rapid state changes
  const debouncedLoading = (key, delay = 300) => {
    let timeoutId = null

    const start = (options = {}) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        startLoading(key, options)
        timeoutId = null
      }, delay)
    }

    const stop = (options = {}) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      } else {
        stopLoading(key, options)
      }
    }

    return { start, stop }
  }

  return {
    // State
    isLoading,
    hasSpecificLoading,
    loadingCount,
    loadingKeys,
    globalLoading,

    // Basic methods
    startLoading,
    stopLoading,
    updateLoading,
    setGlobalLoading,
    clearAllLoading,
    getLoadingState,
    cancelLoading,

    // Utility methods
    withLoading,
    withGlobalLoading,
    createProgressTracker,
    debouncedLoading
  }
}

/**
 * Global loading state instance
 * Use this for application-wide loading state management
 */
export const globalLoadingState = useLoadingState()

/**
 * Hook for component-specific loading states
 * Creates an isolated loading state manager for a component
 */
export function useComponentLoading() {
  return useLoadingState()
}

/**
 * Loading state decorator for async functions
 * Automatically manages loading state for async operations
 */
export function withLoadingDecorator(loadingKey, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const loadingState = options.global ? globalLoadingState : useLoadingState()
      
      try {
        loadingState.startLoading(loadingKey, options)
        const result = await originalMethod.apply(this, args)
        loadingState.stopLoading(loadingKey)
        return result
      } catch (error) {
        loadingState.stopLoading(loadingKey)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Vue directive for automatic loading states
 * Usage: v-loading="loadingKey"
 */
export const vLoading = {
  mounted(el, binding) {
    const loadingKey = binding.value || 'element-loading'
    const loadingState = binding.modifiers.global ? globalLoadingState : useLoadingState()
    
    // Store reference for cleanup
    el._loadingState = loadingState
    el._loadingKey = loadingKey
    
    // Add loading class if currently loading
    if (loadingState.hasSpecificLoading.value(loadingKey)) {
      el.classList.add('loading')
    }
  },
  
  updated(el, binding) {
    const loadingKey = binding.value || 'element-loading'
    const loadingState = el._loadingState
    
    if (loadingState && loadingState.hasSpecificLoading.value(loadingKey)) {
      el.classList.add('loading')
    } else {
      el.classList.remove('loading')
    }
  },
  
  unmounted(el) {
    // Cleanup
    if (el._loadingState && el._loadingKey) {
      el._loadingState.stopLoading(el._loadingKey)
    }
    el.classList.remove('loading')
  }
}

export default useLoadingState