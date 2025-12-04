import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAttendance } from '@/composables/useAttendance.js'
import webSocketService from '@/services/WebSocketService.js'
import notificationService from '@/services/NotificationService.js'

/**
 * Real-time attendance composable that extends the base attendance functionality
 * with enhanced real-time features, notifications, and analytics
 */
export function useAttendanceRealTime(userId = null, options = {}) {
  // Base attendance functionality
  const baseAttendance = useAttendance(userId)
  
  // Real-time specific state
  const isConnected = ref(false)
  const connectionStatus = ref('disconnected')
  const lastUpdate = ref(null)
  const realTimeEnabled = ref(true)
  const autoRefreshInterval = ref(options.autoRefreshInterval || 30000) // 30 seconds
  const notificationsEnabled = ref(options.notificationsEnabled ?? true)
  
  // Analytics and insights
  const dailyGoal = ref(options.dailyGoal || 8) // 8 hours
  const breakGoal = ref(options.breakGoal || 1) // 1 hour
  const productivityScore = ref(0)
  const workPattern = ref({
    averageStartTime: null,
    averageEndTime: null,
    mostProductiveHours: [],
    breakFrequency: 0
  })
  
  // Real-time intervals
  let connectionCheckInterval = null
  let dataRefreshInterval = null
  let analyticsUpdateInterval = null
  let realTimeUpdateInterval = null
  
  // Real-time trigger for computed properties
  const realTimeTrigger = ref(0)
  
  // Computed properties for enhanced analytics
  const workProgress = computed(() => {
    // Include realTimeTrigger to make this reactive to time changes
    realTimeTrigger.value
    
    if (!baseAttendance.clockedIn.value || !baseAttendance.clockInTime.value) {
      return { percentage: 0, hoursWorked: 0, hoursRemaining: dailyGoal.value }
    }
    
    const clockInTime = new Date(baseAttendance.clockInTime.value)
    const now = new Date()
    const hoursWorked = (now - clockInTime) / (1000 * 60 * 60)
    const percentage = Math.min((hoursWorked / dailyGoal.value) * 100, 100)
    const hoursRemaining = Math.max(dailyGoal.value - hoursWorked, 0)
    
    return {
      percentage: Math.round(percentage),
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      hoursRemaining: Math.round(hoursRemaining * 100) / 100
    }
  })
  
  const breakProgress = computed(() => {
    const breakMinutes = baseAttendance.todaysSummary.value?.breakTime || '0h 0m'
    const breakHours = parseTimeString(breakMinutes)
    const percentage = Math.min((breakHours / breakGoal.value) * 100, 100)
    
    return {
      percentage: Math.round(percentage),
      hoursUsed: breakHours,
      hoursRemaining: Math.max(breakGoal.value - breakHours, 0)
    }
  })
  
  const workEfficiency = computed(() => {
    const totalHours = parseTimeString(baseAttendance.todaysSummary.value?.totalHours || '0h 0m')
    const breakHours = parseTimeString(baseAttendance.todaysSummary.value?.breakTime || '0h 0m')
    const workHours = totalHours - breakHours
    
    if (totalHours === 0) return 100
    
    return Math.round((workHours / totalHours) * 100)
  })
  
  const estimatedEndTime = computed(() => {
    // Include realTimeTrigger to make this reactive to time changes
    realTimeTrigger.value
    
    if (!baseAttendance.clockedIn.value || !baseAttendance.clockInTime.value) {
      return null
    }
    
    const clockInTime = new Date(baseAttendance.clockInTime.value)
    const remainingMs = workProgress.value.hoursRemaining * 60 * 60 * 1000
    const estimatedEnd = new Date(Date.now() + remainingMs)
    
    return estimatedEnd.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  })
  
  const overtimeStatus = computed(() => {
    // Include realTimeTrigger to make this reactive to time changes
    realTimeTrigger.value
    
    const hoursWorked = workProgress.value.hoursWorked
    
    if (hoursWorked <= dailyGoal.value) {
      return { status: 'normal', message: 'Within normal hours' }
    } else if (hoursWorked <= dailyGoal.value + 1) {
      return { status: 'approaching', message: 'Approaching overtime' }
    } else {
      return { status: 'overtime', message: `${Math.round((hoursWorked - dailyGoal.value) * 100) / 100}h overtime` }
    }
  })
  
  // Real-time connection management
  const initializeRealTimeConnection = () => {
    if (!realTimeEnabled.value) return
    
    // Connect to WebSocket if not already connected
    if (!webSocketService.getStatus().connected) {
      webSocketService.connect()
    }
    
    // Set up connection status monitoring
    webSocketService.on('connected', handleConnectionEstablished)
    webSocketService.on('disconnected', handleConnectionLost)
    webSocketService.on('error', handleConnectionError)
    
    // Set up attendance-specific listeners
    webSocketService.on('attendance_update', handleRealTimeAttendanceUpdate)
    webSocketService.on('stats_update', handleRealTimeStatsUpdate)
    webSocketService.on('notification', handleRealTimeNotification)
    
    // Subscribe to user's attendance updates
    if (userId) {
      webSocketService.subscribeToAttendance(userId)
    }
    
    // Start connection monitoring
    startConnectionMonitoring()
  }
  
  const handleConnectionEstablished = () => {
    isConnected.value = true
    connectionStatus.value = 'connected'
    //console.log('Real-time attendance connection established')
    
    // Request initial data refresh
    refreshRealTimeData()
  }
  
  const handleConnectionLost = () => {
    isConnected.value = false
    connectionStatus.value = 'disconnected'
    //console.log('Real-time attendance connection lost')
  }
  
  const handleConnectionError = (error) => {
    isConnected.value = false
    connectionStatus.value = 'error'
    console.error('Real-time attendance connection error:', error)
  }
  
  const handleRealTimeAttendanceUpdate = (data) => {
    //console.log('Real-time attendance update received:', data)
    lastUpdate.value = new Date().toISOString()
    
    // The base attendance composable will handle the update
    // We just need to trigger any additional real-time specific actions
    updateAnalytics()
    
    // Show notification if significant change
    if (data.status_change) {
      showStatusChangeNotification(data)
    }
  }
  
  const handleRealTimeStatsUpdate = (data) => {
    //console.log('Real-time stats update received:', data)
    lastUpdate.value = new Date().toISOString()
    
    // Update analytics based on new stats
    updateAnalytics()
  }
  
  const handleRealTimeNotification = (notification) => {
    if (!notificationsEnabled.value) return
    
    //console.log('Real-time notification received:', notification)
    
    // Handle different types of notifications
    switch (notification.type) {
      case 'break_reminder':
        handleBreakReminder(notification)
        break
      case 'overtime_warning':
        handleOvertimeWarning(notification)
        break
      case 'goal_achievement':
        handleGoalAchievement(notification)
        break
      case 'productivity_insight':
        handleProductivityInsight(notification)
        break
    }
  }
  
  // Enhanced notification handlers
  const handleBreakReminder = (notification) => {
    if (baseAttendance.clockedIn.value && !baseAttendance.onBreak.value) {
      notificationService.showInAppNotification({
        type: 'break_reminder',
        title: 'Time for a Break!',
        message: notification.message || 'You\'ve been working for a while. Consider taking a break.',
        variant: 'info',
        actions: [
          { id: 'take-break', label: 'Take Break', variant: 'primary' },
          { id: 'remind-later', label: 'Remind Later', variant: 'secondary' }
        ]
      })
    }
  }
  
  const handleOvertimeWarning = (notification) => {
    notificationService.showInAppNotification({
      type: 'overtime_warning',
      title: 'Overtime Alert',
      message: notification.message || 'You\'ve exceeded your regular work hours.',
      variant: 'warning',
      persistent: true,
      actions: [
        { id: 'clock-out', label: 'Clock Out', variant: 'primary' },
        { id: 'continue', label: 'Continue Working', variant: 'secondary' }
      ]
    })
  }
  
  const handleGoalAchievement = (notification) => {
    notificationService.showInAppNotification({
      type: 'goal_achievement',
      title: 'Goal Achieved! 🎉',
      message: notification.message || 'You\'ve reached your daily work goal!',
      variant: 'success',
      actions: [
        { id: 'view-stats', label: 'View Stats', variant: 'primary' },
        { id: 'dismiss', label: 'Dismiss', variant: 'secondary' }
      ]
    })
  }
  
  const handleProductivityInsight = (notification) => {
    notificationService.showInAppNotification({
      type: 'productivity_insight',
      title: 'Productivity Insight',
      message: notification.message,
      variant: 'info',
      actions: [
        { id: 'view-details', label: 'View Details', variant: 'primary' },
        { id: 'dismiss', label: 'Dismiss', variant: 'secondary' }
      ]
    })
  }
  
  // Analytics and insights
  const updateAnalytics = () => {
    calculateProductivityScore()
    updateWorkPattern()
  }
  
  const calculateProductivityScore = () => {
    const efficiency = workEfficiency.value
    const goalProgress = workProgress.value.percentage
    const breakBalance = Math.min(breakProgress.value.percentage, 100)
    
    // Calculate score based on efficiency, goal progress, and break balance
    const score = Math.round((efficiency * 0.4) + (goalProgress * 0.4) + (breakBalance * 0.2))
    productivityScore.value = Math.min(score, 100)
  }
  
  const updateWorkPattern = () => {
    // This would typically analyze historical data
    // For now, we'll update based on current session
    if (baseAttendance.clockInTime.value) {
      const clockInTime = new Date(baseAttendance.clockInTime.value)
      const hour = clockInTime.getHours()
      
      // Update average start time (simplified)
      workPattern.value.averageStartTime = `${hour}:${clockInTime.getMinutes().toString().padStart(2, '0')}`
      
      // Update most productive hours based on current activity
      const currentHour = new Date().getHours()
      if (!workPattern.value.mostProductiveHours.includes(currentHour)) {
        workPattern.value.mostProductiveHours.push(currentHour)
        workPattern.value.mostProductiveHours.sort((a, b) => a - b)
        
        // Keep only top 3 most productive hours
        if (workPattern.value.mostProductiveHours.length > 3) {
          workPattern.value.mostProductiveHours = workPattern.value.mostProductiveHours.slice(0, 3)
        }
      }
    }
  }
  
  // Connection monitoring
  const startConnectionMonitoring = () => {
    connectionCheckInterval = setInterval(() => {
      const status = webSocketService.getStatus()
      isConnected.value = status.connected
      connectionStatus.value = status.connected ? 'connected' : 'disconnected'
    }, 5000) // Check every 5 seconds
    
    // Auto-refresh data periodically
    if (autoRefreshInterval.value > 0) {
      dataRefreshInterval = setInterval(() => {
        if (isConnected.value) {
          refreshRealTimeData()
        }
      }, autoRefreshInterval.value)
    }
    
    // Update analytics periodically
    analyticsUpdateInterval = setInterval(() => {
      updateAnalytics()
    }, 60000) // Update every minute
    
    // Real-time trigger for computed properties (updates every second)
    realTimeUpdateInterval = setInterval(() => {
      realTimeTrigger.value++
    }, 1000) // Update every second
  }
  
  const stopConnectionMonitoring = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
    }
    
    if (dataRefreshInterval) {
      clearInterval(dataRefreshInterval)
      dataRefreshInterval = null
    }
    
    if (analyticsUpdateInterval) {
      clearInterval(analyticsUpdateInterval)
      analyticsUpdateInterval = null
    }
    
    if (realTimeUpdateInterval) {
      clearInterval(realTimeUpdateInterval)
      realTimeUpdateInterval = null
    }
  }
  
  // Data refresh
  const refreshRealTimeData = () => {
    if (isConnected.value) {
      webSocketService.requestStatsUpdate()
    }
    
    // Also refresh via HTTP as fallback
    baseAttendance.refreshData()
  }
  
  // Utility functions
  const parseTimeString = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0
    
    const match = timeStr.match(/(\d+)h\s*(\d+)m/)
    if (match) {
      return parseInt(match[1]) + (parseInt(match[2]) / 60)
    }
    
    return 0
  }
  
  const showStatusChangeNotification = (data) => {
    let title, message, variant
    
    switch (data.new_status) {
      case 'clocked_in':
        title = 'Clocked In'
        message = 'Your work session has started'
        variant = 'success'
        break
      case 'clocked_out':
        title = 'Clocked Out'
        message = 'Your work session has ended'
        variant = 'info'
        break
      case 'on_break':
        title = 'Break Started'
        message = 'Enjoy your break!'
        variant = 'info'
        break
      case 'break_ended':
        title = 'Break Ended'
        message = 'Welcome back to work'
        variant = 'success'
        break
    }
    
    if (title && notificationsEnabled.value) {
      notificationService.showInAppNotification({
        type: 'status_change',
        title,
        message,
        variant
      })
    }
  }
  
  // Configuration methods
  const setDailyGoal = (hours) => {
    dailyGoal.value = hours
    updateAnalytics()
  }
  
  const setBreakGoal = (hours) => {
    breakGoal.value = hours
    updateAnalytics()
  }
  
  const toggleRealTime = (enabled) => {
    realTimeEnabled.value = enabled
    
    if (enabled) {
      initializeRealTimeConnection()
    } else {
      cleanup()
    }
  }
  
  const toggleNotifications = (enabled) => {
    notificationsEnabled.value = enabled
  }
  
  // Cleanup
  const cleanup = () => {
    // Remove WebSocket listeners
    webSocketService.off('connected', handleConnectionEstablished)
    webSocketService.off('disconnected', handleConnectionLost)
    webSocketService.off('error', handleConnectionError)
    webSocketService.off('attendance_update', handleRealTimeAttendanceUpdate)
    webSocketService.off('stats_update', handleRealTimeStatsUpdate)
    webSocketService.off('notification', handleRealTimeNotification)
    
    // Stop monitoring
    stopConnectionMonitoring()
  }
  
  // Lifecycle
  onMounted(() => {
    if (realTimeEnabled.value) {
      initializeRealTimeConnection()
    }
    
    // Initial analytics update
    updateAnalytics()
  })
  
  onUnmounted(() => {
    cleanup()
  })
  
  // Watch for changes that should trigger analytics updates
  watch([
    () => baseAttendance.clockedIn.value,
    () => baseAttendance.onBreak.value,
    () => baseAttendance.todaysSummary.value
  ], () => {
    updateAnalytics()
  })
  
  return {
    // Base attendance functionality (spread all base properties)
    ...baseAttendance,
    
    // Real-time specific state
    isConnected,
    connectionStatus,
    lastUpdate,
    realTimeEnabled,
    notificationsEnabled,
    
    // Analytics and insights
    dailyGoal,
    breakGoal,
    productivityScore,
    workPattern,
    workProgress,
    breakProgress,
    workEfficiency,
    estimatedEndTime,
    overtimeStatus,
    
    // Methods
    refreshRealTimeData,
    setDailyGoal,
    setBreakGoal,
    toggleRealTime,
    toggleNotifications,
    updateAnalytics
  }
}