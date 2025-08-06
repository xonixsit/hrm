import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NotificationContainer from '@/Components/Notifications/NotificationContainer.vue'
import { useNotifications } from '@/composables/useNotifications'
import notificationQueue from '@/services/NotificationQueue'

// Mock the notification components for integration testing
vi.mock('@/Components/Notifications/ToastNotification.vue', () => ({
  default: {
    name: 'ToastNotification',
    template: `
      <div 
        class="mock-toast" 
        :class="'toast-' + type"
        @click="$emit('close')"
      >
        <span class="toast-message">{{ message }}</span>
        <button v-if="actionText" @click="$emit('action')" class="toast-action">
          {{ actionText }}
        </button>
      </div>
    `,
    props: ['message', 'type', 'position', 'actionText'],
    emits: ['close', 'action']
  }
}))

vi.mock('@/Components/Notifications/NotificationModal.vue', () => ({
  default: {
    name: 'NotificationModal',
    template: `
      <div v-if="visible" class="mock-modal" :class="'modal-' + type">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-description">{{ description }}</p>
        <button @click="$emit('confirm')" class="modal-confirm">Confirm</button>
        <button @click="$emit('cancel')" class="modal-cancel">Cancel</button>
        <button @click="$emit('close')" class="modal-close">Close</button>
      </div>
    `,
    props: ['visible', 'title', 'description', 'type'],
    emits: ['close', 'confirm', 'cancel']
  }
}))

describe('Notification System Integration', () => {
  let wrapper
  let notifications

  beforeEach(() => {
    // Clear all notifications
    notificationQueue.clear()
    
    // Mount the notification container
    wrapper = mount(NotificationContainer)
    
    // Get the composable
    notifications = useNotifications()
    
    // Mock timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Toast Notification Flow', () => {
    it('should display and interact with toast notifications', async () => {
      // Show a success notification
      const id = notifications.showSuccess('Operation completed successfully!', {
        actionText: 'View Details'
      })

      await nextTick()

      // Verify toast is displayed
      const toast = wrapper.find('.mock-toast')
      expect(toast.exists()).toBe(true)
      expect(toast.classes()).toContain('toast-success')
      expect(toast.find('.toast-message').text()).toBe('Operation completed successfully!')
      expect(toast.find('.toast-action').text()).toBe('View Details')

      // Test action button click
      const actionSpy = vi.fn()
      const notification = notificationQueue.getById(id)
      notification.onAction = actionSpy

      await toast.find('.toast-action').trigger('click')
      expect(actionSpy).toHaveBeenCalled()

      // Test close functionality
      await toast.trigger('click')
      await nextTick()

      expect(wrapper.find('.mock-toast').exists()).toBe(false)
      expect(notificationQueue.exists(id)).toBe(false)
    })

    it('should handle multiple toast notifications', async () => {
      // Add multiple notifications
      notifications.showSuccess('Success message')
      notifications.showError('Error message')
      notifications.showWarning('Warning message')

      await nextTick()

      // Verify all toasts are displayed
      const toasts = wrapper.findAll('.mock-toast')
      expect(toasts).toHaveLength(3)
      expect(toasts[0].classes()).toContain('toast-success')
      expect(toasts[1].classes()).toContain('toast-error')
      expect(toasts[2].classes()).toContain('toast-warning')
    })

    it('should auto-dismiss non-persistent notifications', async () => {
      const id = notifications.showInfo('Auto-dismiss message', {
        duration: 1000,
        persistent: false
      })

      await nextTick()
      expect(wrapper.find('.mock-toast').exists()).toBe(true)

      // Fast-forward time
      vi.advanceTimersByTime(1000)
      await nextTick()

      expect(wrapper.find('.mock-toast').exists()).toBe(false)
      expect(notificationQueue.exists(id)).toBe(false)
    })
  })

  describe('Modal Notification Flow', () => {
    it('should display and interact with confirmation modal', async () => {
      // Show confirmation dialog
      const confirmPromise = notifications.showConfirm({
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item?'
      })

      await nextTick()

      // Verify modal is displayed
      const modal = wrapper.find('.mock-modal')
      expect(modal.exists()).toBe(true)
      expect(modal.classes()).toContain('modal-confirm')
      expect(modal.find('.modal-title').text()).toBe('Delete Item')
      expect(modal.find('.modal-description').text()).toBe('Are you sure you want to delete this item?')

      // Test confirm action
      await modal.find('.modal-confirm').trigger('click')
      
      const result = await confirmPromise
      expect(result).toBe(true)

      await nextTick()
      expect(wrapper.find('.mock-modal').exists()).toBe(false)
    })

    it('should handle modal cancellation', async () => {
      const confirmPromise = notifications.showConfirm({
        title: 'Confirm Action',
        message: 'Proceed with action?'
      })

      await nextTick()

      const modal = wrapper.find('.mock-modal')
      await modal.find('.modal-cancel').trigger('click')
      
      const result = await confirmPromise
      expect(result).toBe(false)

      await nextTick()
      expect(wrapper.find('.mock-modal').exists()).toBe(false)
    })

    it('should display alert modal', async () => {
      const alertPromise = notifications.showAlert('Important information', {
        title: 'Alert',
        type: 'warning'
      })

      await nextTick()

      const modal = wrapper.find('.mock-modal')
      expect(modal.exists()).toBe(true)
      expect(modal.classes()).toContain('modal-warning')
      expect(modal.find('.modal-title').text()).toBe('Alert')
      expect(modal.find('.modal-description').text()).toBe('Important information')

      await modal.find('.modal-confirm').trigger('click')
      
      const result = await alertPromise
      expect(result).toBe(true)
    })
  })

  describe('Global Window Methods', () => {
    it('should make notification methods globally available', async () => {
      expect(window.notify).toBeDefined()
      expect(typeof window.notify.success).toBe('function')

      // Use global method
      window.notify.success('Global success message')

      await nextTick()

      const toast = wrapper.find('.mock-toast')
      expect(toast.exists()).toBe(true)
      expect(toast.find('.toast-message').text()).toBe('Global success message')
    })

    it('should clean up global methods on unmount', () => {
      expect(window.notify).toBeDefined()

      wrapper.unmount()

      expect(window.notify).toBeUndefined()
    })
  })

  describe('Convenience Methods Integration', () => {
    it('should handle form success notification', async () => {
      notifications.notifyFormSuccess('created')

      await nextTick()

      const toast = wrapper.find('.mock-toast')
      expect(toast.exists()).toBe(true)
      expect(toast.classes()).toContain('toast-success')
      expect(toast.find('.toast-message').text()).toBe('Successfully created!')
    })

    it('should handle validation errors', async () => {
      const errors = {
        name: ['Name is required'],
        email: ['Email is invalid']
      }

      notifications.notifyValidationError(errors)

      await nextTick()

      const toasts = wrapper.findAll('.mock-toast')
      expect(toasts).toHaveLength(2)
      expect(toasts[0].classes()).toContain('toast-error')
      expect(toasts[1].classes()).toContain('toast-error')
    })

    it('should handle loading with progress', async () => {
      const loader = notifications.showLoadingWithProgress('Processing items...')

      await nextTick()

      // Verify loading notification is shown
      const toast = wrapper.find('.mock-toast')
      expect(toast.exists()).toBe(true)
      expect(toast.classes()).toContain('toast-loading')

      // Complete the loading
      loader.complete('All items processed!')

      await nextTick()

      // Verify loading is removed and success is shown
      const successToast = wrapper.find('.toast-success')
      expect(successToast.exists()).toBe(true)
      expect(successToast.find('.toast-message').text()).toBe('All items processed!')
    })
  })

  describe('Position Management', () => {
    it('should handle notifications in different positions', async () => {
      notifications.showSuccess('Top left', { position: 'top-left' })
      notifications.showError('Bottom right', { position: 'bottom-right' })

      await nextTick()

      const toasts = wrapper.findAll('.mock-toast')
      expect(toasts).toHaveLength(2)

      // Verify notifications are in correct position containers
      const topLeftContainer = wrapper.find('[class*="top-4"][class*="left-4"]')
      const bottomRightContainer = wrapper.find('[class*="bottom-4"][class*="right-4"]')

      expect(topLeftContainer.exists()).toBe(true)
      expect(bottomRightContainer.exists()).toBe(true)
    })
  })

  describe('Queue Management', () => {
    it('should respect maximum notification limits', async () => {
      // Set max notifications to 2
      notifications.setMaxNotifications(2)

      // Add 3 notifications to same position
      notifications.showInfo('Message 1', { position: 'top-right' })
      notifications.showInfo('Message 2', { position: 'top-right' })
      notifications.showInfo('Message 3', { position: 'top-right' })

      await nextTick()

      // Should only show 2 notifications (oldest removed)
      const toasts = wrapper.findAll('.mock-toast')
      expect(toasts).toHaveLength(2)
      expect(notificationQueue.countByPosition('top-right')).toBe(2)
    })

    it('should clear notifications by type', async () => {
      notifications.showSuccess('Success 1')
      notifications.showError('Error 1')
      notifications.showSuccess('Success 2')

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(3)

      notifications.clearByType('success')

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(1)
      expect(wrapper.find('.toast-error').exists()).toBe(true)
    })

    it('should clear all notifications', async () => {
      notifications.showSuccess('Success')
      notifications.showError('Error')
      notifications.showWarning('Warning')

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(3)

      notifications.clearAll()

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(0)
    })
  })

  describe('Reactive State', () => {
    it('should provide reactive notification count', async () => {
      expect(notifications.notificationCount.value).toBe(0)

      notifications.showSuccess('Test 1')
      expect(notifications.notificationCount.value).toBe(1)

      notifications.showError('Test 2')
      expect(notifications.notificationCount.value).toBe(2)

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(2)

      notifications.clearAll()
      expect(notifications.notificationCount.value).toBe(0)

      await nextTick()
      expect(wrapper.findAll('.mock-toast')).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle notification queue errors gracefully', async () => {
      // Try to remove non-existent notification
      expect(() => {
        notifications.removeNotification('non-existent-id')
      }).not.toThrow()

      // Try to update non-existent notification
      expect(() => {
        notifications.updateNotification('non-existent-id', { message: 'Updated' })
      }).not.toThrow()
    })
  })

  describe('Mixed Notification Types', () => {
    it('should handle both toast and modal notifications simultaneously', async () => {
      // Add toast notification
      notifications.showSuccess('Toast message')

      // Add modal notification
      const confirmPromise = notifications.showConfirm({
        title: 'Modal title',
        message: 'Modal message'
      })

      await nextTick()

      // Both should be visible
      expect(wrapper.find('.mock-toast').exists()).toBe(true)
      expect(wrapper.find('.mock-modal').exists()).toBe(true)

      // Interact with modal
      await wrapper.find('.modal-confirm').trigger('click')
      const result = await confirmPromise
      expect(result).toBe(true)

      await nextTick()

      // Toast should still be visible, modal should be gone
      expect(wrapper.find('.mock-toast').exists()).toBe(true)
      expect(wrapper.find('.mock-modal').exists()).toBe(false)
    })
  })
})