import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useNotifications, notify } from '@/composables/useNotifications'
import notificationQueue from '@/services/NotificationQueue'

describe('useNotifications', () => {
  let notifications

  beforeEach(() => {
    // Clear all notifications before each test
    notificationQueue.clear()
    notifications = useNotifications()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Basic Notification Methods', () => {
    it('should show success notification', () => {
      const id = notifications.showSuccess('Success message')
      
      expect(id).toBeDefined()
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('success')
      expect(notification.message).toBe('Success message')
      expect(notification.duration).toBe(4000)
      expect(notification.position).toBe('top-right')
      expect(notification.sound).toBe(true)
    })

    it('should show error notification', () => {
      const id = notifications.showError('Error message')
      
      expect(id).toBeDefined()
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Error message')
      expect(notification.persistent).toBe(true)
      expect(notification.position).toBe('top-right')
      expect(notification.sound).toBe(true)
    })

    it('should show warning notification', () => {
      const id = notifications.showWarning('Warning message')
      
      expect(id).toBeDefined()
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('warning')
      expect(notification.message).toBe('Warning message')
      expect(notification.duration).toBe(6000)
      expect(notification.position).toBe('top-right')
      expect(notification.sound).toBe(true)
    })

    it('should show info notification', () => {
      const id = notifications.showInfo('Info message')
      
      expect(id).toBeDefined()
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('info')
      expect(notification.message).toBe('Info message')
      expect(notification.duration).toBe(5000)
      expect(notification.position).toBe('top-right')
    })

    it('should show loading notification', () => {
      const id = notifications.showLoading('Loading message')
      
      expect(id).toBeDefined()
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('loading')
      expect(notification.message).toBe('Loading message')
      expect(notification.position).toBe('top-center')
    })
  })

  describe('Modal Notifications', () => {
    it('should show confirm dialog', async () => {
      const confirmPromise = notifications.showConfirm({
        title: 'Test Confirm',
        message: 'Are you sure?'
      })

      // Find the confirm notification
      const confirmNotification = notificationQueue.notifications.find(n => n.type === 'confirm')
      expect(confirmNotification).toBeDefined()
      expect(confirmNotification.props.title).toBe('Test Confirm')

      // Simulate confirm action
      confirmNotification.onAction('confirm')

      const result = await confirmPromise
      expect(result).toBe(true)
    })

    it('should show alert dialog', async () => {
      const alertPromise = notifications.showAlert('Alert message', {
        title: 'Test Alert'
      })

      // Find the alert notification
      const alertNotification = notificationQueue.notifications.find(n => n.props?.title === 'Test Alert')
      expect(alertNotification).toBeDefined()

      // Simulate confirm action
      alertNotification.onAction('confirm')

      const result = await alertPromise
      expect(result).toBe(true)
    })
  })

  describe('Utility Methods', () => {
    it('should clear all notifications', () => {
      notifications.showSuccess('Success 1')
      notifications.showError('Error 1')
      
      expect(notifications.notificationCount.value).toBe(2)
      
      notifications.clearAll()
      
      expect(notifications.notificationCount.value).toBe(0)
    })

    it('should clear notifications by type', () => {
      notifications.showSuccess('Success 1')
      notifications.showError('Error 1')
      notifications.showSuccess('Success 2')
      
      expect(notifications.notificationCount.value).toBe(3)
      
      notifications.clearByType('success')
      
      expect(notifications.notificationCount.value).toBe(1)
      expect(notificationQueue.getByType('success')).toHaveLength(0)
      expect(notificationQueue.getByType('error')).toHaveLength(1)
    })

    it('should clear notifications by position', () => {
      notifications.showSuccess('Success', { position: 'top-left' })
      notifications.showError('Error', { position: 'top-right' })
      notifications.showInfo('Info', { position: 'top-left' })
      
      expect(notifications.notificationCount.value).toBe(3)
      
      notifications.clearByPosition('top-left')
      
      expect(notifications.notificationCount.value).toBe(1)
      expect(notificationQueue.getByPosition('top-left')).toHaveLength(0)
      expect(notificationQueue.getByPosition('top-right')).toHaveLength(1)
    })

    it('should remove specific notification', () => {
      const id = notifications.showSuccess('Success message')
      
      expect(notifications.notificationCount.value).toBe(1)
      
      notifications.removeNotification(id)
      
      expect(notifications.notificationCount.value).toBe(0)
    })

    it('should update notification', () => {
      const id = notifications.showInfo('Original message')
      
      notifications.updateNotification(id, {
        message: 'Updated message',
        type: 'success'
      })
      
      const notification = notificationQueue.getById(id)
      expect(notification.message).toBe('Updated message')
      expect(notification.type).toBe('success')
    })
  })

  describe('Settings Methods', () => {
    it('should set max notifications', () => {
      notifications.setMaxNotifications(3)
      expect(notificationQueue.maxNotifications.value).toBe(3)
    })

    it('should set default duration', () => {
      notifications.setDefaultDuration(3000)
      expect(notificationQueue.defaultDuration.value).toBe(3000)
    })

    it('should enable/disable sounds', () => {
      notifications.setSoundsEnabled(false)
      expect(notificationQueue.sounds.enabled).toBe(false)
      
      notifications.setSoundsEnabled(true)
      expect(notificationQueue.sounds.enabled).toBe(true)
    })

    it('should set sound volume', () => {
      notifications.setSoundVolume(0.5)
      expect(notificationQueue.sounds.volume).toBe(0.5)
    })
  })

  describe('Convenience Methods', () => {
    it('should notify form success', () => {
      const id = notifications.notifyFormSuccess('updated')
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('success')
      expect(notification.message).toBe('Successfully updated!')
      expect(notification.icon).toBe('check-circle')
    })

    it('should notify form error', () => {
      const id = notifications.notifyFormError('Custom error message')
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Custom error message')
      expect(notification.icon).toBe('x-circle')
      expect(notification.title).toBe('Form Error')
    })

    it('should notify network error', () => {
      const id = notifications.notifyNetworkError()
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Network error. Please check your connection and try again.')
      expect(notification.icon).toBe('wifi')
      expect(notification.title).toBe('Connection Error')
    })

    it('should notify permission error', () => {
      const id = notifications.notifyPermissionError()
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('You do not have permission to perform this action.')
      expect(notification.icon).toBe('shield-exclamation')
      expect(notification.title).toBe('Permission Denied')
    })
  })

  describe('Validation Error Handling', () => {
    it('should handle string validation error', () => {
      const id = notifications.notifyValidationError('Validation failed')
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Validation failed')
      expect(notification.icon).toBe('exclamation-triangle')
      expect(notification.title).toBe('Validation Error')
    })

    it('should handle array validation errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3']
      
      notifications.notifyValidationError(errors)
      
      const errorNotifications = notificationQueue.getByType('error')
      expect(errorNotifications).toHaveLength(3)
      expect(errorNotifications[0].message).toBe('Error 1')
      expect(errorNotifications[1].message).toBe('Error 2')
      expect(errorNotifications[2].message).toBe('Error 3')
    })

    it('should handle object validation errors', () => {
      const errors = {
        name: ['Name is required'],
        email: ['Email is invalid', 'Email is required']
      }
      
      notifications.notifyValidationError(errors)
      
      const errorNotifications = notificationQueue.getByType('error')
      expect(errorNotifications).toHaveLength(3)
      expect(errorNotifications[0].message).toBe('Name is required')
      expect(errorNotifications[1].message).toBe('Email is invalid')
      expect(errorNotifications[2].message).toBe('Email is required')
    })

    it('should handle unknown validation error format', () => {
      const id = notifications.notifyValidationError(123) // Invalid format
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Please check the form and try again.')
      expect(notification.title).toBe('Validation Error')
    })
  })

  describe('Loading with Progress', () => {
    it('should show loading with progress', () => {
      const progressCallback = vi.fn()
      const loader = notifications.showLoadingWithProgress('Processing...', progressCallback)
      
      expect(loader.id).toBeDefined()
      expect(typeof loader.updateProgress).toBe('function')
      expect(typeof loader.complete).toBe('function')
      expect(typeof loader.error).toBe('function')
      
      const notification = notificationQueue.getById(loader.id)
      expect(notification.type).toBe('loading')
      expect(notification.message).toBe('Processing...')
      expect(notification.showProgress).toBe(true)
      expect(notification.closable).toBe(false)
    })

    it('should update progress', () => {
      const loader = notifications.showLoadingWithProgress('Processing...')
      const updateSpy = vi.spyOn(notificationQueue, 'update')
      
      loader.updateProgress(50, 'Half done...')
      
      expect(updateSpy).toHaveBeenCalledWith(loader.id, {
        message: 'Half done...',
        progress: 50
      })
    })

    it('should complete loading', () => {
      const loader = notifications.showLoadingWithProgress('Processing...')
      const removeSpy = vi.spyOn(notificationQueue, 'remove')
      const successSpy = vi.spyOn(notifications, 'showSuccess')
      
      loader.complete('Done!')
      
      expect(removeSpy).toHaveBeenCalledWith(loader.id)
      expect(successSpy).toHaveBeenCalledWith('Done!')
    })

    it('should handle loading error', () => {
      const loader = notifications.showLoadingWithProgress('Processing...')
      const removeSpy = vi.spyOn(notificationQueue, 'remove')
      const errorSpy = vi.spyOn(notifications, 'showError')
      
      loader.error('Failed!')
      
      expect(removeSpy).toHaveBeenCalledWith(loader.id)
      expect(errorSpy).toHaveBeenCalledWith('Failed!')
    })
  })

  describe('Batch Operations', () => {
    it('should show batch success', () => {
      const id = notifications.showBatchSuccess(5, 'deleted')
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('success')
      expect(notification.message).toBe('Successfully deleted 5 items')
      expect(notification.icon).toBe('check-circle')
      expect(notification.duration).toBe(3000)
    })

    it('should show batch success for single item', () => {
      const id = notifications.showBatchSuccess(1, 'updated')
      
      const notification = notificationQueue.getById(id)
      expect(notification.message).toBe('Successfully updated 1 item')
    })

    it('should show batch error', () => {
      const id = notifications.showBatchError(3, 5, 'delete')
      
      const notification = notificationQueue.getById(id)
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Failed to delete 2 of 5 items')
      expect(notification.icon).toBe('x-circle')
      expect(notification.title).toBe('Batch Operation Error')
    })
  })

  describe('Control Methods', () => {
    it('should pause all notifications', () => {
      const pauseSpy = vi.spyOn(notificationQueue, 'pauseAll')
      
      notifications.pauseAll()
      
      expect(pauseSpy).toHaveBeenCalled()
    })

    it('should resume all notifications', () => {
      const resumeSpy = vi.spyOn(notificationQueue, 'resumeAll')
      
      notifications.resumeAll()
      
      expect(resumeSpy).toHaveBeenCalled()
    })
  })

  describe('Reactive State', () => {
    it('should provide reactive notification count', () => {
      expect(notifications.notificationCount.value).toBe(0)
      
      notifications.showSuccess('Test')
      expect(notifications.notificationCount.value).toBe(1)
      
      notifications.showError('Test')
      expect(notifications.notificationCount.value).toBe(2)
      
      notifications.clearAll()
      expect(notifications.notificationCount.value).toBe(0)
    })

    it('should provide reactive notifications array', () => {
      expect(notifications.notifications.value).toHaveLength(0)
      
      notifications.showSuccess('Test 1')
      notifications.showError('Test 2')
      
      expect(notifications.notifications.value).toHaveLength(2)
      expect(notifications.notifications.value[0].message).toBe('Test 1')
      expect(notifications.notifications.value[1].message).toBe('Test 2')
    })
  })

  describe('Queue Access', () => {
    it('should provide direct access to notification queue', () => {
      expect(notifications.queue).toBe(notificationQueue)
    })
  })

  describe('Custom Options', () => {
    it('should accept custom options for notifications', () => {
      const id = notifications.showSuccess('Success', {
        duration: 10000,
        position: 'bottom-left',
        sound: false,
        icon: 'custom-icon'
      })
      
      const notification = notificationQueue.getById(id)
      expect(notification.duration).toBe(10000)
      expect(notification.position).toBe('bottom-left')
      expect(notification.sound).toBe(false)
      expect(notification.icon).toBe('custom-icon')
    })
  })
})

describe('Global notify helper', () => {
  beforeEach(() => {
    notificationQueue.clear()
    global.window = {}
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should provide global notification methods', () => {
    expect(typeof notify.success).toBe('function')
    expect(typeof notify.error).toBe('function')
    expect(typeof notify.warning).toBe('function')
    expect(typeof notify.info).toBe('function')
    expect(typeof notify.loading).toBe('function')
    expect(typeof notify.confirm).toBe('function')
    expect(typeof notify.alert).toBe('function')
    expect(typeof notify.clear).toBe('function')
    expect(typeof notify.remove).toBe('function')
  })

  it('should call notification queue methods', () => {
    const successSpy = vi.spyOn(notificationQueue, 'success')
    const errorSpy = vi.spyOn(notificationQueue, 'error')
    
    notify.success('Success message', { duration: 3000 })
    notify.error('Error message', { persistent: true })
    
    expect(successSpy).toHaveBeenCalledWith('Success message', { duration: 3000 })
    expect(errorSpy).toHaveBeenCalledWith('Error message', { persistent: true })
  })

  it('should make methods globally available on window', () => {
    // The module should set window.notify when window is available
    expect(window.notify).toBe(notify)
  })
})