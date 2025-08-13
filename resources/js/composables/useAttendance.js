import { ref, computed, onMounted, onUnmounted } from 'vue'
import { router } from '@inertiajs/vue3'
import webSocketService from '@/services/WebSocketService.js'
import notificationService from '@/services/NotificationService.js'

/**
 * Composable for managing attendance state and real-time updates
 */
export function useAttendance(userId = null) {
  // Reactive state
  const clockedIn = ref(false)
  const onBreak = ref(false)
  const clockInTime = ref(null)
  const breakStartTime = ref(null)
  const currentSession = ref(null)
  const todaysSummary = ref({
    totalHours: '0h 0m',
    breakTime: '0h 0m',
    sessions: 0,
    clockIns: 0
  })
  const recentActivities = ref([])
  const weeklyHours = ref('0h')
  const monthlyHours = ref('0h')
  const averageDaily = ref('0h')
  const loading = ref(false)
  const error = ref(null)
  const locationEnabled = ref(true)
  const locationVerified = ref(false)
  const currentLocation = ref(null)

  // Computed properties
  const workDuration = computed(() => {
    if (!clockedIn.value || !clockInTime.value) return '0h 0m 0s'
    
    const start = new Date(clockInTime.value)
    const now = new Date()
    const diffMs = now - start
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    return `${hours}h ${minutes}m ${seconds}s`
  })

  const canClockIn = computed(() => {
    return !loading.value && !clockedIn.value
  })

  const canClockOut = computed(() => {
    return !loading.value && clockedIn.value
  })

  const canTakeBreak = computed(() => {
    return !loading.value && clockedIn.value && !onBreak.value
  })

  const statusText = computed(() => {
    if (onBreak.value) return 'On Break'
    if (clockedIn.value) return 'Working'
    return 'Not Clocked In'
  })

  // WebSocket event handlers
  const handleAttendanceUpdate = (data) => {
    console.log('Attendance update received:', data)
    
    // Update local state based on server data
    clockedIn.value = data.clocked_in || false
    onBreak.value = data.on_break || false
    clockInTime.value = data.clock_in_time
    breakStartTime.value = data.break_start_time
    currentSession.value = data.current_session
    
    // Update summary data
    if (data.todays_summary) {
      todaysSummary.value = {
        totalHours: data.todays_summary.total_hours || '0h 0m',
        breakTime: data.todays_summary.break_time || '0h 0m',
        sessions: data.todays_summary.sessions || 0,
        clockIns: data.todays_summary.clock_ins || 0
      }
    }
    
    // Update recent activities
    if (data.recent_activities) {
      recentActivities.value = data.recent_activities
    }
    
    // Update weekly/monthly stats
    if (data.stats) {
      weeklyHours.value = data.stats.weekly_hours || '0h'
      monthlyHours.value = data.stats.monthly_hours || '0h'
      averageDaily.value = data.stats.average_daily || '0h'
    }
  }

  const handleStatsUpdate = (data) => {
    console.log('Stats update received:', data)
    
    if (data.weekly_hours) weeklyHours.value = data.weekly_hours
    if (data.monthly_hours) monthlyHours.value = data.monthly_hours
    if (data.average_daily) averageDaily.value = data.average_daily
  }

  const handleNotification = (notification) => {
    console.log('Attendance notification:', notification)
    
    // Handle different types of notifications
    switch (notification.type) {
      case 'clock_in_reminder':
        showNotification('Time to clock in!', notification.message)
        break
      case 'clock_out_reminder':
        showNotification('Don\'t forget to clock out!', notification.message)
        break
      case 'break_reminder':
        showNotification('Take a break!', notification.message)
        break
      case 'overtime_warning':
        showNotification('Overtime Alert', notification.message, 'warning')
        break
    }
  }

  // Methods
  const clockIn = async (locationData = null) => {
    if (!canClockIn.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      // Get location if enabled and not provided
      let location = locationData
      if (locationEnabled.value && !location) {
        location = await getCurrentLocation()
      }
      
      // Send clock in via WebSocket for real-time update
      webSocketService.clockIn({ location })
      
      // Also send to backend via HTTP for persistence
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          location: location ? JSON.stringify(location) : null,
          latitude: location?.latitude,
          longitude: location?.longitude,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to clock in')
      }
      
      const data = await response.json()
      
      // Update local state
      clockedIn.value = true
      clockInTime.value = data.clock_in_time || new Date().toISOString()
      onBreak.value = false
      
      // Schedule notifications for work session
      notificationService.scheduleClockOutReminder(8) // 8 hours
      notificationService.scheduleBreakReminder(2) // Every 2 hours
      notificationService.scheduleOvertimeWarning(8) // After 8 hours
      
      // Add to recent activities
      addActivity('clock-in', 'Clocked in', new Date().toISOString())
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Clock in failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clockOut = async (locationData = null) => {
    if (!canClockOut.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      // Get location if enabled and not provided
      let location = locationData
      if (locationEnabled.value && !location) {
        location = await getCurrentLocation()
      }
      
      // Send clock out via WebSocket for real-time update
      webSocketService.clockOut({ location })
      
      // Also send to backend via HTTP for persistence
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          location: location ? JSON.stringify(location) : null,
          latitude: location?.latitude,
          longitude: location?.longitude,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to clock out')
      }
      
      const data = await response.json()
      
      // Update local state
      clockedIn.value = false
      clockInTime.value = null
      onBreak.value = false
      breakStartTime.value = null
      
      // Clear work session notifications
      notificationService.clearReminder('clock-out-reminder')
      notificationService.clearReminder('break-reminder')
      notificationService.clearReminder('overtime-warning')
      
      // Update today's summary
      if (data.todays_summary) {
        todaysSummary.value = data.todays_summary
      }
      
      // Add to recent activities
      addActivity('clock-out', 'Clocked out', new Date().toISOString())
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Clock out failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const startBreak = async () => {
    if (!canTakeBreak.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      // Send break start via WebSocket
      webSocketService.startBreak()
      
      // Also send to backend via HTTP
      const response = await fetch('/api/attendance/break-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start break')
      }
      
      // Update local state
      onBreak.value = true
      breakStartTime.value = new Date().toISOString()
      
      // Add to recent activities
      addActivity('break-start', 'Started break', new Date().toISOString())
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Start break failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const endBreak = async () => {
    if (!onBreak.value) return false
    
    loading.value = true
    error.value = null
    
    try {
      // Send break end via WebSocket
      webSocketService.endBreak()
      
      // Also send to backend via HTTP
      const response = await fetch('/api/attendance/break-end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to end break')
      }
      
      // Update local state
      onBreak.value = false
      breakStartTime.value = null
      
      // Add to recent activities
      addActivity('break-end', 'Ended break', new Date().toISOString())
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('End break failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported')
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }
          currentLocation.value = location
          locationVerified.value = true
          resolve(location)
        },
        (error) => {
          locationVerified.value = false
          reject(new Error(`Location error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  const addActivity = (type, action, time) => {
    const activity = {
      id: Date.now(),
      type,
      action,
      time
    }
    
    recentActivities.value.unshift(activity)
    
    // Keep only last 10 activities
    if (recentActivities.value.length > 10) {
      recentActivities.value = recentActivities.value.slice(0, 10)
    }
  }

  const showNotification = (title, message, type = 'info') => {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'attendance-notification'
      })
    }
    
    // Also emit event for in-app notifications
    window.dispatchEvent(new CustomEvent('attendance-notification', {
      detail: { title, message, type }
    }))
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  const refreshData = async () => {
    loading.value = true
    
    try {
      // Request fresh data from server
      const response = await fetch('/api/attendance/current', {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        handleAttendanceUpdate(data)
      }
      
      // Also request via WebSocket
      webSocketService.requestStatsUpdate()
    } catch (err) {
      console.error('Failed to refresh attendance data:', err)
    } finally {
      loading.value = false
    }
  }

  // Notification event handlers
  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case 'clock_in_reminder':
        if (notification.action === 'clock-in') {
          clockIn()
        }
        break
      case 'clock_out_reminder':
        if (notification.action === 'clock-out') {
          clockOut()
        }
        break
      case 'break_reminder':
        if (notification.action === 'take-break') {
          startBreak()
        }
        break
      case 'overtime_warning':
        if (notification.action === 'clock-out') {
          clockOut()
        }
        break
    }
  }

  // Lifecycle
  onMounted(() => {
    // Set up WebSocket listeners
    webSocketService.on('attendance_update', handleAttendanceUpdate)
    webSocketService.on('stats_update', handleStatsUpdate)
    webSocketService.on('notification', handleNotification)
    
    // Set up notification service listeners
    notificationService.on('notification', handleNotificationAction)
    
    // Subscribe to attendance updates if user ID is provided
    if (userId) {
      webSocketService.subscribeToAttendance(userId)
    }
    
    // Request notification permission and initialize default reminders
    requestNotificationPermission().then((granted) => {
      if (granted) {
        notificationService.initializeDefaultReminders({
          clockInTime: '09:00',
          workHours: 8,
          breakInterval: 2,
          enableClockInReminder: true,
          enableClockOutReminder: true,
          enableBreakReminder: true,
          enableOvertimeWarning: true
        })
      }
    })
    
    // Initial data load
    refreshData()
  })

  onUnmounted(() => {
    // Clean up WebSocket listeners
    webSocketService.off('attendance_update', handleAttendanceUpdate)
    webSocketService.off('stats_update', handleStatsUpdate)
    webSocketService.off('notification', handleNotification)
    
    // Clean up notification service listeners
    notificationService.off('notification', handleNotificationAction)
  })

  return {
    // State
    clockedIn,
    onBreak,
    clockInTime,
    breakStartTime,
    currentSession,
    todaysSummary,
    recentActivities,
    weeklyHours,
    monthlyHours,
    averageDaily,
    loading,
    error,
    locationEnabled,
    locationVerified,
    currentLocation,
    
    // Computed
    workDuration,
    canClockIn,
    canClockOut,
    canTakeBreak,
    statusText,
    
    // Methods
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getCurrentLocation,
    refreshData,
    requestNotificationPermission
  }
}