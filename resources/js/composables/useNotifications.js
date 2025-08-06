import { computed } from 'vue'
import notificationQueue from '@/services/NotificationQueue'

/**
 * Composable for managing notifications
 * Provides a clean API for showing different types of notifications
 */
export function useNotifications() {
  // Reactive notification state
  const notifications = computed(() => notificationQueue.notifications)
  const notificationCount = computed(() => notificationQueue.count())
  
  // Notification methods
  const showSuccess = (message, options = {}) => {
    return notificationQueue.success(message, {
      duration: 4000,
      position: 'top-right',
      sound: true,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    return notificationQueue.error(message, {
      persistent: true,
      position: 'top-right',
      sound: true,
      ...options
    })
  }

  const showWarning = (message, options = {}) => {
    return notificationQueue.warning(message, {
      duration: 6000,
      position: 'top-right',
      sound: true,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    return notificationQueue.info(message, {
      duration: 5000,
      position: 'top-right',
      ...options
    })
  }

  const showLoading = (message, options = {}) => {
    return notificationQueue.loading(message, {
      position: 'top-center',
      ...options
    })
  }

  // Modal notifications
  const showConfirm = async (options = {}) => {
    return await notificationQueue.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'confirm',
      ...options
    })
  }

  const showAlert = async (message, options = {}) => {
    return await notificationQueue.alert(message, {
      title: 'Alert',
      confirmText: 'OK',
      type: 'info',
      ...options
    })
  }

  // Utility methods
  const clearAll = () => {
    notificationQueue.clear()
  }

  const clearByType = (type) => {
    notificationQueue.clearType(type)
  }

  const clearByPosition = (position) => {
    notificationQueue.clearPosition(position)
  }

  const removeNotification = (id) => {
    notificationQueue.remove(id)
  }

  const updateNotification = (id, updates) => {
    notificationQueue.update(id, updates)
  }

  // Settings
  const setMaxNotifications = (max) => {
    notificationQueue.setMaxNotifications(max)
  }

  const setDefaultDuration = (duration) => {
    notificationQueue.setDefaultDuration(duration)
  }

  const setSoundsEnabled = (enabled) => {
    notificationQueue.setSoundsEnabled(enabled)
  }

  const setSoundVolume = (volume) => {
    notificationQueue.setSoundVolume(volume)
  }

  // Convenience methods for common use cases
  const notifyFormSuccess = (action = 'saved') => {
    return showSuccess(`Successfully ${action}!`, {
      icon: 'check-circle'
    })
  }

  const notifyFormError = (message = 'Please check the form and try again.') => {
    return showError(message, {
      icon: 'x-circle',
      title: 'Form Error'
    })
  }

  const notifyNetworkError = (message = 'Network error. Please check your connection and try again.') => {
    return showError(message, {
      icon: 'wifi',
      title: 'Connection Error'
    })
  }

  const notifyPermissionError = (message = 'You do not have permission to perform this action.') => {
    return showError(message, {
      icon: 'shield-exclamation',
      title: 'Permission Denied'
    })
  }

  const notifyValidationError = (errors) => {
    if (typeof errors === 'string') {
      return showError(errors, {
        icon: 'exclamation-triangle',
        title: 'Validation Error'
      })
    }

    if (Array.isArray(errors)) {
      errors.forEach(error => {
        showError(error, {
          icon: 'exclamation-triangle',
          title: 'Validation Error',
          duration: 8000
        })
      })
      return
    }

    if (typeof errors === 'object') {
      Object.values(errors).flat().forEach(error => {
        showError(error, {
          icon: 'exclamation-triangle',
          title: 'Validation Error',
          duration: 8000
        })
      })
      return
    }

    return showError('Please check the form and try again.', {
      icon: 'exclamation-triangle',
      title: 'Validation Error'
    })
  }

  // Loading state management
  const showLoadingWithProgress = (message, progressCallback) => {
    const id = showLoading(message, {
      showProgress: true,
      closable: false
    })

    const updateProgress = (progress, newMessage) => {
      updateNotification(id, {
        message: newMessage || message,
        progress: Math.max(0, Math.min(100, progress))
      })
    }

    const complete = (successMessage) => {
      removeNotification(id)
      if (successMessage) {
        showSuccess(successMessage)
      }
    }

    const error = (errorMessage) => {
      removeNotification(id)
      showError(errorMessage || 'Operation failed')
    }

    return {
      id,
      updateProgress,
      complete,
      error
    }
  }

  // Batch operations
  const showBatchSuccess = (count, action = 'processed') => {
    return showSuccess(`Successfully ${action} ${count} item${count !== 1 ? 's' : ''}`, {
      icon: 'check-circle',
      duration: 3000
    })
  }

  const showBatchError = (count, total, action = 'process') => {
    const failed = total - count
    return showError(`Failed to ${action} ${failed} of ${total} item${total !== 1 ? 's' : ''}`, {
      icon: 'x-circle',
      title: 'Batch Operation Error'
    })
  }

  // Auto-dismiss management
  const pauseAll = () => {
    notificationQueue.pauseAll()
  }

  const resumeAll = () => {
    notificationQueue.resumeAll()
  }

  return {
    // State
    notifications,
    notificationCount,

    // Basic notification methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,

    // Modal methods
    showConfirm,
    showAlert,

    // Utility methods
    clearAll,
    clearByType,
    clearByPosition,
    removeNotification,
    updateNotification,

    // Settings
    setMaxNotifications,
    setDefaultDuration,
    setSoundsEnabled,
    setSoundVolume,

    // Convenience methods
    notifyFormSuccess,
    notifyFormError,
    notifyNetworkError,
    notifyPermissionError,
    notifyValidationError,

    // Advanced methods
    showLoadingWithProgress,
    showBatchSuccess,
    showBatchError,

    // Control methods
    pauseAll,
    resumeAll,

    // Direct access to queue for advanced usage
    queue: notificationQueue
  }
}

// Global notification helper for use outside of Vue components
export const notify = {
  success: (message, options) => notificationQueue.success(message, options),
  error: (message, options) => notificationQueue.error(message, options),
  warning: (message, options) => notificationQueue.warning(message, options),
  info: (message, options) => notificationQueue.info(message, options),
  loading: (message, options) => notificationQueue.loading(message, options),
  confirm: (options) => notificationQueue.confirm(options),
  alert: (message, options) => notificationQueue.alert(message, options),
  clear: () => notificationQueue.clear(),
  remove: (id) => notificationQueue.remove(id)
}

// Make globally available
if (typeof window !== 'undefined') {
  window.notify = notify
}