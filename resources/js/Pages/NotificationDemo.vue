<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Notification System Demo
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <h3 class="text-lg font-semibold mb-6">Notification System Demo</h3>
            
            <!-- Toast Notifications -->
            <div class="mb-8">
              <h4 class="text-md font-medium mb-4">Toast Notifications</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  @click="showSuccessToast"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Success Toast
                </button>
                <button
                  @click="showErrorToast"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Error Toast
                </button>
                <button
                  @click="showWarningToast"
                  class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Warning Toast
                </button>
                <button
                  @click="showInfoToast"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Info Toast
                </button>
              </div>
            </div>

            <!-- Modal Notifications -->
            <div class="mb-8">
              <h4 class="text-md font-medium mb-4">Modal Notifications</h4>
              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="showConfirmDialog"
                  class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Confirm Dialog
                </button>
                <button
                  @click="showAlertDialog"
                  class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Alert Dialog
                </button>
              </div>
            </div>

            <!-- Convenience Methods -->
            <div class="mb-8">
              <h4 class="text-md font-medium mb-4">Convenience Methods</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  @click="showFormSuccess"
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Form Success
                </button>
                <button
                  @click="showFormError"
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Form Error
                </button>
                <button
                  @click="showValidationErrors"
                  class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Validation Errors
                </button>
                <button
                  @click="showNetworkError"
                  class="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                >
                  Network Error
                </button>
                <button
                  @click="showPermissionError"
                  class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Permission Error
                </button>
                <button
                  @click="showLoadingProgress"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Loading Progress
                </button>
              </div>
            </div>

            <!-- Batch Operations -->
            <div class="mb-8">
              <h4 class="text-md font-medium mb-4">Batch Operations</h4>
              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="handleBatchSuccess"
                  class="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
                >
                  Batch Success
                </button>
                <button
                  @click="handleBatchError"
                  class="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                >
                  Batch Error
                </button>
              </div>
            </div>

            <!-- Control Actions -->
            <div class="mb-8">
              <h4 class="text-md font-medium mb-4">Control Actions</h4>
              <div class="grid grid-cols-3 gap-4">
                <button
                  @click="clearAllNotifications"
                  class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear All
                </button>
                <button
                  @click="pauseNotifications"
                  class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Pause All
                </button>
                <button
                  @click="resumeNotifications"
                  class="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
                >
                  Resume All
                </button>
              </div>
            </div>

            <!-- Current State -->
            <div class="bg-gray-50 p-4 rounded">
              <h4 class="text-md font-medium mb-2">Current State</h4>
              <p class="text-sm text-gray-600">
                Active Notifications: {{ notificationCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { useNotifications } from '@/composables/useNotifications'

const {
  // Basic methods
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showAlert,
  
  // Convenience methods
  notifyFormSuccess,
  notifyFormError,
  notifyValidationError,
  notifyNetworkError,
  notifyPermissionError,
  showLoadingWithProgress,
  showBatchSuccess,
  showBatchError,
  
  // Control methods
  clearAll,
  pauseAll,
  resumeAll,
  
  // State
  notificationCount
} = useNotifications()

// Toast notification handlers
const showSuccessToast = () => {
  showSuccess('Operation completed successfully!', {
    actionText: 'View Details'
  })
}

const showErrorToast = () => {
  showError('Something went wrong. Please try again.', {
    title: 'Error'
  })
}

const showWarningToast = () => {
  showWarning('This action cannot be undone.', {
    title: 'Warning'
  })
}

const showInfoToast = () => {
  showInfo('New features are available in the latest update.', {
    title: 'Information'
  })
}

// Modal notification handlers
const showConfirmDialog = async () => {
  const confirmed = await showConfirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  })
  
  if (confirmed) {
    showSuccess('Item deleted successfully!')
  } else {
    showInfo('Delete operation cancelled.')
  }
}

const showAlertDialog = async () => {
  await showAlert('This is an important message that requires your attention.', {
    title: 'Important Notice',
    type: 'warning'
  })
  
  showInfo('Alert acknowledged.')
}

// Convenience method handlers
const showFormSuccess = () => {
  notifyFormSuccess('created')
}

const showFormError = () => {
  notifyFormError('Please check the required fields and try again.')
}

const showValidationErrors = () => {
  const errors = {
    name: ['Name is required'],
    email: ['Email is invalid', 'Email must be unique'],
    password: ['Password must be at least 8 characters']
  }
  notifyValidationError(errors)
}

const showNetworkError = () => {
  notifyNetworkError()
}

const showPermissionError = () => {
  notifyPermissionError()
}

const showLoadingProgress = () => {
  const loader = showLoadingWithProgress('Processing items...')
  
  let progress = 0
  const interval = setInterval(() => {
    progress += 20
    loader.updateProgress(progress, `Processing... ${progress}%`)
    
    if (progress >= 100) {
      clearInterval(interval)
      loader.complete('All items processed successfully!')
    }
  }, 500)
}

// Batch operation handlers
const handleBatchSuccess = () => {
  showBatchSuccess(15, 'processed')
}

const handleBatchError = () => {
  showBatchError(12, 15, 'process')
}

// Control handlers
const clearAllNotifications = () => {
  clearAll()
}

const pauseNotifications = () => {
  pauseAll()
}

const resumeNotifications = () => {
  resumeAll()
}
</script>