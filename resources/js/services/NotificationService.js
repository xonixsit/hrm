/**
 * Notification Service for Attendance Reminders
 * Handles browser notifications and in-app notifications for attendance tracking
 */

class NotificationService {
  constructor() {
    this.permission = 'default'
    this.reminders = new Map()
    this.listeners = new Map()
    this.isEnabled = true
    
    // Initialize notification permission
    this.checkPermission()
  }

  /**
   * Check and request notification permission
   */
  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission
      
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission()
      }
    }
    
    return this.permission === 'granted'
  }

  /**
   * Show browser notification
   */
  showNotification(title, options = {}) {
    if (!this.isEnabled || this.permission !== 'granted') {
      return null
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'attendance-notification',
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      const notification = new Notification(title, defaultOptions)
      
      // Auto-close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  /**
   * Show in-app notification
   */
  showInAppNotification(notification) {
    this.emit('notification', {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification
    })
  }

  /**
   * Schedule clock-in reminder
   */
  scheduleClockInReminder(time = '09:00') {
    const reminderId = 'clock-in-reminder'
    
    // Clear existing reminder
    this.clearReminder(reminderId)
    
    const scheduleTime = this.parseTime(time)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const reminderTime = new Date(today.getTime() + scheduleTime)
    
    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }
    
    const timeoutId = setTimeout(() => {
      this.showClockInReminder()
      // Schedule for next day
      this.scheduleClockInReminder(time)
    }, reminderTime.getTime() - now.getTime())
    
    this.reminders.set(reminderId, {
      timeoutId,
      scheduledTime: reminderTime,
      type: 'clock-in'
    })
    
    //console.log(`Clock-in reminder scheduled for ${reminderTime.toLocaleString()}`)
  }

  /**
   * Schedule clock-out reminder
   */
  scheduleClockOutReminder(hoursWorked = 8) {
    const reminderId = 'clock-out-reminder'
    
    // Clear existing reminder
    this.clearReminder(reminderId)
    
    // Schedule reminder after specified hours of work
    const reminderDelay = hoursWorked * 60 * 60 * 1000 // Convert to milliseconds
    
    const timeoutId = setTimeout(() => {
      this.showClockOutReminder()
    }, reminderDelay)
    
    this.reminders.set(reminderId, {
      timeoutId,
      scheduledTime: new Date(Date.now() + reminderDelay),
      type: 'clock-out'
    })
    
    //console.log(`Clock-out reminder scheduled for ${new Date(Date.now() + reminderDelay).toLocaleString()}`)
  }

  /**
   * Schedule break reminder
   */
  scheduleBreakReminder(intervalHours = 2) {
    const reminderId = 'break-reminder'
    
    // Clear existing reminder
    this.clearReminder(reminderId)
    
    const reminderDelay = intervalHours * 60 * 60 * 1000 // Convert to milliseconds
    
    const timeoutId = setTimeout(() => {
      this.showBreakReminder()
      // Schedule next break reminder
      this.scheduleBreakReminder(intervalHours)
    }, reminderDelay)
    
    this.reminders.set(reminderId, {
      timeoutId,
      scheduledTime: new Date(Date.now() + reminderDelay),
      type: 'break'
    })
    
    //console.log(`Break reminder scheduled for ${new Date(Date.now() + reminderDelay).toLocaleString()}`)
  }

  /**
   * Schedule overtime warning
   */
  scheduleOvertimeWarning(maxHours = 8) {
    const reminderId = 'overtime-warning'
    
    // Clear existing reminder
    this.clearReminder(reminderId)
    
    const warningDelay = maxHours * 60 * 60 * 1000 // Convert to milliseconds
    
    const timeoutId = setTimeout(() => {
      this.showOvertimeWarning()
    }, warningDelay)
    
    this.reminders.set(reminderId, {
      timeoutId,
      scheduledTime: new Date(Date.now() + warningDelay),
      type: 'overtime'
    })
    
    //console.log(`Overtime warning scheduled for ${new Date(Date.now() + warningDelay).toLocaleString()}`)
  }

  /**
   * Show clock-in reminder notification
   */
  showClockInReminder() {
    const title = 'Time to Clock In!'
    const message = 'Don\'t forget to clock in for your work day.'
    
    this.showNotification(title, {
      body: message,
      tag: 'clock-in-reminder',
      actions: [
        { action: 'clock-in', title: 'Clock In Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
    
    this.showInAppNotification({
      type: 'clock_in_reminder',
      title,
      message,
      variant: 'info',
      actions: [
        { id: 'clock-in', label: 'Clock In', variant: 'primary' },
        { id: 'dismiss', label: 'Dismiss', variant: 'secondary' }
      ]
    })
  }

  /**
   * Show clock-out reminder notification
   */
  showClockOutReminder() {
    const title = 'Time to Clock Out!'
    const message = 'You\'ve completed your work hours. Don\'t forget to clock out.'
    
    this.showNotification(title, {
      body: message,
      tag: 'clock-out-reminder',
      actions: [
        { action: 'clock-out', title: 'Clock Out Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
    
    this.showInAppNotification({
      type: 'clock_out_reminder',
      title,
      message,
      variant: 'warning',
      actions: [
        { id: 'clock-out', label: 'Clock Out', variant: 'primary' },
        { id: 'dismiss', label: 'Dismiss', variant: 'secondary' }
      ]
    })
  }

  /**
   * Show break reminder notification
   */
  showBreakReminder() {
    const title = 'Take a Break!'
    const message = 'You\'ve been working for a while. Consider taking a short break.'
    
    this.showNotification(title, {
      body: message,
      tag: 'break-reminder',
      actions: [
        { action: 'take-break', title: 'Take Break' },
        { action: 'dismiss', title: 'Not Now' }
      ]
    })
    
    this.showInAppNotification({
      type: 'break_reminder',
      title,
      message,
      variant: 'info',
      actions: [
        { id: 'take-break', label: 'Take Break', variant: 'primary' },
        { id: 'dismiss', label: 'Not Now', variant: 'secondary' }
      ]
    })
  }

  /**
   * Show overtime warning notification
   */
  showOvertimeWarning() {
    const title = 'Overtime Alert!'
    const message = 'You\'ve exceeded your regular work hours. Consider clocking out.'
    
    this.showNotification(title, {
      body: message,
      tag: 'overtime-warning',
      requireInteraction: true,
      actions: [
        { action: 'clock-out', title: 'Clock Out' },
        { action: 'continue', title: 'Continue Working' }
      ]
    })
    
    this.showInAppNotification({
      type: 'overtime_warning',
      title,
      message,
      variant: 'warning',
      persistent: true,
      actions: [
        { id: 'clock-out', label: 'Clock Out', variant: 'primary' },
        { id: 'continue', label: 'Continue Working', variant: 'secondary' }
      ]
    })
  }

  /**
   * Clear a specific reminder
   */
  clearReminder(reminderId) {
    const reminder = this.reminders.get(reminderId)
    if (reminder) {
      clearTimeout(reminder.timeoutId)
      this.reminders.delete(reminderId)
      //console.log(`Cleared reminder: ${reminderId}`)
    }
  }

  /**
   * Clear all reminders
   */
  clearAllReminders() {
    this.reminders.forEach((reminder, id) => {
      clearTimeout(reminder.timeoutId)
    })
    this.reminders.clear()
    //console.log('Cleared all reminders')
  }

  /**
   * Get active reminders
   */
  getActiveReminders() {
    const active = []
    this.reminders.forEach((reminder, id) => {
      active.push({
        id,
        type: reminder.type,
        scheduledTime: reminder.scheduledTime
      })
    })
    return active
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    
    if (!enabled) {
      this.clearAllReminders()
    }
    
    //console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Parse time string (HH:MM) to milliseconds from midnight
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number)
    return (hours * 60 + minutes) * 60 * 1000
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in notification listener for ${event}:`, error)
      }
    })
  }

  /**
   * Initialize default reminders based on user preferences
   */
  initializeDefaultReminders(preferences = {}) {
    const {
      clockInTime = '09:00',
      workHours = 8,
      breakInterval = 2,
      enableClockInReminder = true,
      enableClockOutReminder = true,
      enableBreakReminder = true,
      enableOvertimeWarning = true
    } = preferences

    if (enableClockInReminder) {
      this.scheduleClockInReminder(clockInTime)
    }

    // Clock-out and break reminders will be scheduled when user clocks in
    // Overtime warning will be scheduled based on work hours
    
    //console.log('Default reminders initialized with preferences:', preferences)
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService