import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NotificationQueue } from '@/services/NotificationQueue'

describe('NotificationQueue', () => {
  let queue

  beforeEach(() => {
    queue = new NotificationQueue()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a new notification queue', () => {
      expect(queue).toBeInstanceOf(NotificationQueue)
      expect(queue.notifications).toEqual([])
      expect(queue.count()).toBe(0)
    })

    it('should add a notification', () => {
      const id = queue.add({
        message: 'Test message',
        type: 'info'
      })

      expect(queue.count()).toBe(1)
      expect(queue.getById(id)).toMatchObject({
        message: 'Test message',
        type: 'info'
      })
    })

    it('should remove a notification', () => {
      const id = queue.add({
        message: 'Test message'
      })

      expect(queue.count()).toBe(1)
      queue.remove(id)
      expect(queue.count()).toBe(0)
    })

    it('should clear all notifications', () => {
      queue.add({ message: 'Test 1' })
      queue.add({ message: 'Test 2' })
      
      expect(queue.count()).toBe(2)
      queue.clear()
      expect(queue.count()).toBe(0)
    })
  })

  describe('Notification Types', () => {
    it('should create success notification', () => {
      const id = queue.success('Success message')
      const notification = queue.getById(id)
      
      expect(notification.type).toBe('success')
      expect(notification.message).toBe('Success message')
    })

    it('should create error notification', () => {
      const id = queue.error('Error message')
      const notification = queue.getById(id)
      
      expect(notification.type).toBe('error')
      expect(notification.message).toBe('Error message')
      expect(notification.persistent).toBe(true)
    })

    it('should create warning notification', () => {
      const id = queue.warning('Warning message')
      const notification = queue.getById(id)
      
      expect(notification.type).toBe('warning')
      expect(notification.message).toBe('Warning message')
    })

    it('should create info notification', () => {
      const id = queue.info('Info message')
      const notification = queue.getById(id)
      
      expect(notification.type).toBe('info')
      expect(notification.message).toBe('Info message')
    })

    it('should create loading notification', () => {
      const id = queue.loading('Loading message')
      const notification = queue.getById(id)
      
      expect(notification.type).toBe('loading')
      expect(notification.message).toBe('Loading message')
      expect(notification.persistent).toBe(true)
      expect(notification.closable).toBe(false)
    })
  })

  describe('Position Management', () => {
    it('should add notifications to correct position', () => {
      const id1 = queue.add({ message: 'Test 1', position: 'top-left' })
      const id2 = queue.add({ message: 'Test 2', position: 'bottom-right' })

      expect(queue.getByPosition('top-left')).toHaveLength(1)
      expect(queue.getByPosition('bottom-right')).toHaveLength(1)
      expect(queue.getByPosition('top-right')).toHaveLength(0)
    })

    it('should clear notifications by position', () => {
      queue.add({ message: 'Test 1', position: 'top-left' })
      queue.add({ message: 'Test 2', position: 'top-left' })
      queue.add({ message: 'Test 3', position: 'bottom-right' })

      expect(queue.countByPosition('top-left')).toBe(2)
      expect(queue.countByPosition('bottom-right')).toBe(1)

      queue.clearPosition('top-left')

      expect(queue.countByPosition('top-left')).toBe(0)
      expect(queue.countByPosition('bottom-right')).toBe(1)
    })

    it('should manage queue size per position', () => {
      queue.setMaxNotifications(2)

      // Add 3 notifications to same position
      queue.add({ message: 'Test 1', position: 'top-right' })
      queue.add({ message: 'Test 2', position: 'top-right' })
      queue.add({ message: 'Test 3', position: 'top-right' })

      expect(queue.countByPosition('top-right')).toBe(2)
      expect(queue.count()).toBe(2)
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss non-persistent notifications', () => {
      const id = queue.add({
        message: 'Test message',
        duration: 1000,
        persistent: false
      })

      expect(queue.exists(id)).toBe(true)

      vi.advanceTimersByTime(1000)

      expect(queue.exists(id)).toBe(false)
    })

    it('should not auto-dismiss persistent notifications', () => {
      const id = queue.add({
        message: 'Test message',
        duration: 1000,
        persistent: true
      })

      expect(queue.exists(id)).toBe(true)

      vi.advanceTimersByTime(1000)

      expect(queue.exists(id)).toBe(true)
    })

    it('should not auto-dismiss notifications with duration 0', () => {
      const id = queue.add({
        message: 'Test message',
        duration: 0
      })

      expect(queue.exists(id)).toBe(true)

      vi.advanceTimersByTime(5000)

      expect(queue.exists(id)).toBe(true)
    })
  })

  describe('Callbacks', () => {
    it('should call onClose callback when notification is removed', () => {
      const onClose = vi.fn()
      const id = queue.add({
        message: 'Test message',
        onClose
      })

      queue.remove(id)

      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
          message: 'Test message'
        })
      )
    })

    it('should call onAction callback when action is triggered', () => {
      const onAction = vi.fn()
      const id = queue.add({
        message: 'Test message',
        onAction
      })

      const notification = queue.getById(id)
      notification.onAction('test-action')

      expect(onAction).toHaveBeenCalledWith('test-action')
    })
  })

  describe('Type Filtering', () => {
    it('should get notifications by type', () => {
      queue.success('Success 1')
      queue.error('Error 1')
      queue.success('Success 2')

      const successNotifications = queue.getByType('success')
      const errorNotifications = queue.getByType('error')

      expect(successNotifications).toHaveLength(2)
      expect(errorNotifications).toHaveLength(1)
    })

    it('should clear notifications by type', () => {
      queue.success('Success 1')
      queue.error('Error 1')
      queue.success('Success 2')

      expect(queue.getByType('success')).toHaveLength(2)
      expect(queue.getByType('error')).toHaveLength(1)

      queue.clearType('success')

      expect(queue.getByType('success')).toHaveLength(0)
      expect(queue.getByType('error')).toHaveLength(1)
    })
  })

  describe('Update Functionality', () => {
    it('should update notification properties', () => {
      const id = queue.add({
        message: 'Original message',
        type: 'info'
      })

      queue.update(id, {
        message: 'Updated message',
        type: 'success'
      })

      const notification = queue.getById(id)
      expect(notification.message).toBe('Updated message')
      expect(notification.type).toBe('success')
    })

    it('should not update non-existent notification', () => {
      expect(() => {
        queue.update('non-existent-id', { message: 'Test' })
      }).not.toThrow()
    })
  })

  describe('Settings', () => {
    it('should set maximum notifications', () => {
      queue.setMaxNotifications(3)
      expect(queue.maxNotifications.value).toBe(3)
    })

    it('should set default duration', () => {
      queue.setDefaultDuration(3000)
      expect(queue.defaultDuration.value).toBe(3000)
    })

    it('should enable/disable sounds', () => {
      queue.setSoundsEnabled(false)
      expect(queue.sounds.enabled).toBe(false)

      queue.setSoundsEnabled(true)
      expect(queue.sounds.enabled).toBe(true)
    })

    it('should set sound volume', () => {
      queue.setSoundVolume(0.5)
      expect(queue.sounds.volume).toBe(0.5)

      // Test bounds
      queue.setSoundVolume(-0.5)
      expect(queue.sounds.volume).toBe(0)

      queue.setSoundVolume(1.5)
      expect(queue.sounds.volume).toBe(1)
    })
  })

  describe('Modal Notifications', () => {
    it('should create confirm dialog', () => {
      const confirmPromise = queue.confirm({
        title: 'Test Confirm',
        message: 'Are you sure?'
      })

      // Find the confirm notification
      const confirmNotification = queue.notifications.find(n => n.type === 'confirm')
      expect(confirmNotification).toBeDefined()
      expect(confirmNotification.props.title).toBe('Test Confirm')
      expect(confirmNotification.persistent).toBe(true)
      expect(confirmNotification.closable).toBe(false)
      expect(confirmNotification.component).toBe('NotificationModal')
      
      // Verify it returns a promise
      expect(confirmPromise).toBeInstanceOf(Promise)
    })

    it('should create alert dialog', async () => {
      const alertPromise = queue.alert('Test alert message', {
        title: 'Test Alert'
      })

      // Find the alert notification
      const alertNotification = queue.notifications.find(n => n.props?.title === 'Test Alert')
      expect(alertNotification).toBeDefined()

      // Simulate confirm action
      alertNotification.onAction('confirm')

      const result = await alertPromise
      expect(result).toBe(true)
    })
  })

  describe('Pause and Resume', () => {
    it('should pause and resume all notifications', () => {
      const pauseTimer = vi.fn()
      const resumeTimer = vi.fn()

      const id = queue.add({
        message: 'Test'
      })

      // Add pause/resume functions to the notification after creation
      const notification = queue.getById(id)
      notification.pauseTimer = pauseTimer
      notification.resumeTimer = resumeTimer

      queue.pauseAll()
      expect(pauseTimer).toHaveBeenCalled()

      queue.resumeAll()
      expect(resumeTimer).toHaveBeenCalled()
    })
  })

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = queue.add({ message: 'Test 1' })
      const id2 = queue.add({ message: 'Test 2' })

      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })
  })
})