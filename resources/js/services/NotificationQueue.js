import { reactive, ref } from 'vue'

/**
 * Notification Queue Service
 * Manages multiple notifications with queuing, positioning, and lifecycle management
 */
class NotificationQueue {
  constructor() {
    this.notifications = reactive([])
    this.maxNotifications = ref(5)
    this.defaultDuration = ref(5000)
    this.positions = reactive({
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': []
    })
    this.idCounter = 0
    this.sounds = reactive({
      enabled: true,
      volume: 0.3
    })
  }

  /**
   * Add a new notification to the queue
   */
  add(notification) {
    const id = this.generateId()
    const position = notification.position || 'top-right'
    
    const notificationData = {
      id,
      message: notification.message || '',
      title: notification.title || '',
      type: notification.type || 'info',
      position,
      duration: notification.duration !== undefined ? notification.duration : this.defaultDuration.value,
      persistent: notification.persistent || false,
      closable: notification.closable !== false,
      showIcon: notification.showIcon !== false,
      showProgress: notification.showProgress !== false,
      actionText: notification.actionText || '',
      icon: notification.icon || '',
      size: notification.size || 'md',
      sound: notification.sound !== false && this.sounds.enabled,
      priority: notification.priority || 'normal',
      zIndex: notification.zIndex || 1000,
      createdAt: Date.now(),
      onAction: notification.onAction || null,
      onClose: notification.onClose || null,
      component: notification.component || null,
      props: notification.props || {}
    }

    // Add to global notifications array
    this.notifications.push(notificationData)

    // Add to position-specific array
    this.positions[position].push(notificationData)

    // Manage queue size
    this.manageQueueSize(position)

    // Auto-remove if not persistent
    if (!notificationData.persistent && notificationData.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, notificationData.duration)
    }

    return id
  }

  /**
   * Remove a notification by ID
   */
  remove(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (!notification) return

    // Remove from global array
    const globalIndex = this.notifications.findIndex(n => n.id === id)
    if (globalIndex > -1) {
      this.notifications.splice(globalIndex, 1)
    }

    // Remove from position array
    const positionArray = this.positions[notification.position]
    const positionIndex = positionArray.findIndex(n => n.id === id)
    if (positionIndex > -1) {
      positionArray.splice(positionIndex, 1)
    }

    // Call onClose callback
    if (notification.onClose) {
      notification.onClose(notification)
    }
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.splice(0)
    Object.keys(this.positions).forEach(position => {
      this.positions[position].splice(0)
    })
  }

  /**
   * Clear notifications by position
   */
  clearPosition(position) {
    const positionNotifications = [...this.positions[position]]
    positionNotifications.forEach(notification => {
      this.remove(notification.id)
    })
  }

  /**
   * Clear notifications by type
   */
  clearType(type) {
    const typeNotifications = this.notifications.filter(n => n.type === type)
    typeNotifications.forEach(notification => {
      this.remove(notification.id)
    })
  }

  /**
   * Update notification
   */
  update(id, updates) {
    const notification = this.notifications.find(n => n.id === id)
    if (!notification) return

    Object.assign(notification, updates)
  }

  /**
   * Get notifications by position
   */
  getByPosition(position) {
    return this.positions[position] || []
  }

  /**
   * Get notifications by type
   */
  getByType(type) {
    return this.notifications.filter(n => n.type === type)
  }

  /**
   * Get notification by ID
   */
  getById(id) {
    return this.notifications.find(n => n.id === id)
  }

  /**
   * Check if notification exists
   */
  exists(id) {
    return this.notifications.some(n => n.id === id)
  }

  /**
   * Get notification count
   */
  count() {
    return this.notifications.length
  }

  /**
   * Get notification count by position
   */
  countByPosition(position) {
    return this.positions[position]?.length || 0
  }

  /**
   * Set maximum notifications per position
   */
  setMaxNotifications(max) {
    this.maxNotifications.value = max
    
    // Trim existing notifications if needed
    Object.keys(this.positions).forEach(position => {
      this.manageQueueSize(position)
    })
  }

  /**
   * Set default duration
   */
  setDefaultDuration(duration) {
    this.defaultDuration.value = duration
  }

  /**
   * Enable/disable sounds
   */
  setSoundsEnabled(enabled) {
    this.sounds.enabled = enabled
  }

  /**
   * Set sound volume
   */
  setSoundVolume(volume) {
    this.sounds.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Pause all notifications
   */
  pauseAll() {
    this.notifications.forEach(notification => {
      if (notification.pauseTimer) {
        notification.pauseTimer()
      }
    })
  }

  /**
   * Resume all notifications
   */
  resumeAll() {
    this.notifications.forEach(notification => {
      if (notification.resumeTimer) {
        notification.resumeTimer()
      }
    })
  }

  /**
   * Convenience methods for different notification types
   */
  success(message, options = {}) {
    return this.add({
      message,
      type: 'success',
      ...options
    })
  }

  error(message, options = {}) {
    return this.add({
      message,
      type: 'error',
      persistent: options.persistent !== false, // Errors are persistent by default
      ...options
    })
  }

  warning(message, options = {}) {
    return this.add({
      message,
      type: 'warning',
      ...options
    })
  }

  info(message, options = {}) {
    return this.add({
      message,
      type: 'info',
      ...options
    })
  }

  loading(message, options = {}) {
    return this.add({
      message,
      type: 'loading',
      persistent: true, // Loading notifications are persistent by default
      closable: false,
      ...options
    })
  }

  /**
   * Show confirmation dialog
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      const id = this.add({
        type: 'confirm',
        persistent: true,
        closable: false,
        component: 'NotificationModal',
        props: {
          visible: true,
          type: 'confirm',
          title: options.title || 'Confirm Action',
          description: options.message || 'Are you sure you want to proceed?',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          ...options
        },
        onAction: (action) => {
          this.remove(id)
          resolve(action === 'confirm')
        },
        onClose: () => {
          resolve(false)
        }
      })
    })
  }

  /**
   * Show alert dialog
   */
  alert(message, options = {}) {
    return new Promise((resolve) => {
      const id = this.add({
        type: options.type || 'info',
        persistent: true,
        closable: false,
        component: 'NotificationModal',
        props: {
          visible: true,
          type: options.type || 'info',
          title: options.title || 'Alert',
          description: message,
          showCancel: false,
          confirmText: options.confirmText || 'OK',
          ...options
        },
        onAction: () => {
          this.remove(id)
          resolve(true)
        },
        onClose: () => {
          resolve(true)
        }
      })
    })
  }

  /**
   * Private methods
   */
  generateId() {
    return `notification-${++this.idCounter}-${Date.now()}`
  }

  manageQueueSize(position) {
    const positionArray = this.positions[position]
    if (positionArray.length > this.maxNotifications.value) {
      // Remove oldest notifications
      const toRemove = positionArray.splice(0, positionArray.length - this.maxNotifications.value)
      toRemove.forEach(notification => {
        const globalIndex = this.notifications.findIndex(n => n.id === notification.id)
        if (globalIndex > -1) {
          this.notifications.splice(globalIndex, 1)
        }
      })
    }
  }
}

// Create singleton instance
const notificationQueue = new NotificationQueue()

// Export both the class and the singleton instance
export { NotificationQueue }
export default notificationQueue