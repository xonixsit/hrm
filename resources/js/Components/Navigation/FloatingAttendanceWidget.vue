<template>
  <div class="floating-attendance-widget">
    <!-- Floating Button (Collapsed State) -->
    <div 
      v-if="!isExpanded" 
      @click="toggleWidget"
      class="floating-button"
      :class="floatingButtonClasses"
    >
      <div class="status-indicator">
        <div :class="statusDotClasses"></div>
      </div>
      <div class="time-info">
        <div class="time-display">{{ currentTimer }}</div>
        <div class="time-label-mini">{{ timerLabel }}</div>
      </div>
      <ChevronUpIcon class="w-4 h-4 expand-icon" />
    </div>

    <!-- Expanded Widget -->
    <div 
      v-if="isExpanded" 
      class="expanded-widget"
      @click.stop
    >
      <!-- Header -->
      <div class="widget-header">
        <div class="status-info">
          <div :class="statusDotClasses"></div>
          <span class="status-text">{{ statusText }}</span>
        </div>
        <button @click="toggleWidget" class="minimize-btn" title="Minimize">
          <ChevronDownIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Timer Display -->
      <div class="timer-section">
        <div class="timer-value">{{ currentTimer }}</div>
        <div class="timer-label">{{ timerLabel }}</div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          @click="handleClockInOut"
          :disabled="loading"
          :class="primaryActionClasses"
        >
          {{ clockButtonText }}
        </button>

        <button
          v-if="attendance.clockedIn"
          @click="handleBreak"
          :disabled="loading"
          class="break-action"
        >
          <component :is="attendance.onBreak ? PlayIcon : PauseIcon" class="w-3 h-3" />
          {{ attendance.onBreak ? 'End' : 'Break' }}
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-value">{{ todaysHours }}</span>
          <span class="stat-label">Today</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ attendance.onBreak ? breakTime : totalBreakTime }}</span>
          <span class="stat-label">{{ attendance.onBreak ? 'Current' : 'Total' }}</span>
        </div>
      </div>
    </div>

    <!-- Backdrop (when expanded) -->
    <div 
      v-if="isExpanded" 
      class="backdrop" 
      @click="toggleWidget"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  PlayIcon, 
  PauseIcon 
} from '@heroicons/vue/24/outline'

// State with localStorage persistence
const isExpanded = ref(false) // Will be set based on clock-in status
const userHasManuallyToggled = ref(false) // Track if user has manually interacted
const attendance = ref({
  clockedIn: false,
  onBreak: false,
  clockInTime: null
})
const loading = ref(false)
const currentTimer = ref('0h 0m 0s')
const breakStartTime = ref(null)
const completedBreakSessions = ref([])

// State persistence helpers
const saveStateToStorage = () => {
  try {
    const state = {
      clockedIn: attendance.value.clockedIn,
      onBreak: attendance.value.onBreak,
      clockInTime: attendance.value.clockInTime,
      breakStartTime: breakStartTime.value,
      completedBreakSessions: completedBreakSessions.value,
      lastUpdate: new Date().toISOString()
    }
    localStorage.setItem('floating-attendance-state', JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save attendance state to localStorage:', error)
  }
}

const loadStateFromStorage = () => {
  try {
    const stored = localStorage.getItem('floating-attendance-state')
    if (stored) {
      const state = JSON.parse(stored)
      // Only use stored state if it's recent (within 5 minutes)
      const lastUpdate = new Date(state.lastUpdate)
      const now = new Date()
      const diffMinutes = (now - lastUpdate) / (1000 * 60)
      
      if (diffMinutes < 5) {
        attendance.value.clockedIn = state.clockedIn || false
        attendance.value.onBreak = state.onBreak || false
        attendance.value.clockInTime = state.clockInTime || null
        breakStartTime.value = state.breakStartTime || null
        completedBreakSessions.value = state.completedBreakSessions || []
        return true
      }
    }
  } catch (error) {
    console.warn('Failed to load attendance state from localStorage:', error)
  }
  return false
}

// Timer intervals
let timerInterval = null

// Computed properties
const statusText = computed(() => {
  if (attendance.value.onBreak) return 'On Break'
  if (attendance.value.clockedIn) return 'Working'
  return 'Clocked Out'
})

const timerLabel = computed(() => {
  if (attendance.value.onBreak) return 'BREAK TIME'
  if (attendance.value.clockedIn) return 'WORK TIME'
  return 'NOT ACTIVE'
})

const statusDotClasses = computed(() => [
  'status-dot',
  {
    'status-dot--working': attendance.value.clockedIn && !attendance.value.onBreak,
    'status-dot--break': attendance.value.onBreak,
    'status-dot--out': !attendance.value.clockedIn
  }
])

const floatingButtonClasses = computed(() => [
  {
    'floating-button--working': attendance.value.clockedIn && !attendance.value.onBreak,
    'floating-button--break': attendance.value.onBreak,
    'floating-button--out': !attendance.value.clockedIn
  }
])

const clockButtonText = computed(() => {
  if (loading.value) return '...'
  return attendance.value.clockedIn ? 'Clock Out' : 'Clock In'
})

const primaryActionClasses = computed(() => [
  'primary-action',
  attendance.value.clockedIn ? 'primary-action--danger' : 'primary-action--success'
])

const todaysHours = computed(() => {
  if (!attendance.value.clockedIn || !attendance.value.clockInTime) {
    return '0h 0m'
  }
  
  const clockInTime = new Date(attendance.value.clockInTime)
  const now = new Date()
  const totalMs = now - clockInTime
  
  // Convert to hours and minutes
  const totalMinutes = Math.floor(totalMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}h ${minutes}m`
})

const breakTime = computed(() => {
  // If currently on break, show current break session duration with seconds
  if (attendance.value.onBreak && breakStartTime.value) {
    const breakStart = new Date(breakStartTime.value)
    if (!isNaN(breakStart.getTime())) {
      const now = new Date()
      const diffMs = Math.max(0, now - breakStart) // Ensure positive duration
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
      
      return `${hours}h ${minutes}m ${seconds}s`
    } else {
      // If we can't find a valid break start time but we're on break, 
      // show at least 1 second to indicate break is active
      return '0h 0m 1s'
    }
  }
  
  // Otherwise show 0 when not on break
  return '0h 0m'
})

// Calculate total break time for today (completed breaks + current break)
const totalBreakTime = computed(() => {
  let totalMinutes = 0
  
  // Add completed break sessions
  completedBreakSessions.value.forEach(session => {
    if (session.start && session.end) {
      const start = new Date(session.start)
      const end = new Date(session.end)
      const diffMs = end - start
      totalMinutes += Math.floor(diffMs / (1000 * 60))
    }
  })
  
  // Add current break session if on break
  if (attendance.value.onBreak && breakStartTime.value) {
    const breakStart = new Date(breakStartTime.value)
    if (!isNaN(breakStart.getTime())) {
      const now = new Date()
      const diffMs = Math.max(0, now - breakStart)
      totalMinutes += Math.floor(diffMs / (1000 * 60))
    }
  }
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}h ${minutes}m`
})

const clockClasses = computed(() => [
  'clock',
  {
    'clock--working': attendance.value.clockedIn && !attendance.value.onBreak,
    'clock--break': attendance.value.onBreak,
    'clock--out': !attendance.value.clockedIn
  }
])

// Methods
const toggleWidget = () => {
  isExpanded.value = !isExpanded.value
  userHasManuallyToggled.value = true
}

const updateExpandedState = (forceUpdate = false) => {
  // Auto-update expanded state on major changes or force update
  if (forceUpdate || !userHasManuallyToggled.value) {
    const newExpandedState = !attendance.value.clockedIn
    const wasChanged = isExpanded.value !== newExpandedState
    
    // Widget should be expanded (open) when user is NOT clocked in
    // Widget should be collapsed (closed) when user IS clocked in
    isExpanded.value = newExpandedState
    
    if (forceUpdate) {
      // Reset manual toggle flag on major status changes
      userHasManuallyToggled.value = false
    }
    
    if (wasChanged) {
      //console.log(`FloatingWidget: Auto-${newExpandedState ? 'expanded' : 'collapsed'} (clockedIn: ${attendance.value.clockedIn}, force: ${forceUpdate})`)
    }
  }
}

const updateTimer = () => {
  if (attendance.value.clockedIn && attendance.value.clockInTime) {
    const now = new Date()
    let startTime
    
    if (attendance.value.onBreak && breakStartTime.value) {
      // Show break duration
      startTime = new Date(breakStartTime.value)
    } else {
      // Show work duration
      startTime = new Date(attendance.value.clockInTime)
    }
    
    const diffMs = now - startTime
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    currentTimer.value = `${hours}h ${minutes}m ${seconds}s`
    
    // Broadcast updated times to dashboard every 10 seconds
    if (seconds % 10 === 0) {
      broadcastCurrentStatus()
    }
  } else {
    currentTimer.value = '0h 0m 0s'
  }
}

const handleClockInOut = async () => {
  try {
    loading.value = true
    
    if (attendance.value.clockedIn) {
      // Clock out
      const response = await window.axios.post('/api/attendance/clock-out', {
        timestamp: new Date().toISOString()
      })
      
      // Update local state immediately for UI feedback
      attendance.value.clockedIn = false
      attendance.value.onBreak = false
      attendance.value.clockInTime = null
      breakStartTime.value = null
      currentTimer.value = '0h 0m 0s'
      
      // Save state to localStorage
      saveStateToStorage()
      
      // Update expanded state (widget should open when clocked out)
      updateExpandedState(true)
      
      // Broadcast clock out status change immediately for dashboard sync
      broadcastCurrentStatus()
      
      // Note: Laravel Echo will broadcast the update automatically from the backend
      
    } else {
      // Clock in
      const response = await window.axios.post('/api/attendance/clock-in', {
        timestamp: new Date().toISOString()
      })
      
      // Update local state immediately for UI feedback
      attendance.value.clockedIn = true
      attendance.value.onBreak = false
      attendance.value.clockInTime = response.data.clock_in_time || new Date().toISOString()
      
      // Save state to localStorage
      saveStateToStorage()
      
      // Update expanded state (widget should close when clocked in)
      updateExpandedState(true)
      
      // Broadcast clock in status change immediately for dashboard sync
      broadcastCurrentStatus()
      
      // Note: Laravel Echo will broadcast the update automatically from the backend
    }
  } catch (error) {
    console.error('Clock in/out failed:', error)
    alert('Action failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleBreak = async () => {
  try {
    loading.value = true
    
    if (attendance.value.onBreak) {
      // End break - save completed break session
      if (breakStartTime.value) {
        const completedBreak = {
          start: breakStartTime.value,
          end: new Date().toISOString(),
          isOngoing: false
        }
        
        // Add to completed breaks array
        completedBreakSessions.value = [
          ...completedBreakSessions.value,
          completedBreak
        ]
        
        //console.log('💾 FloatingWidget: Saved completed break session:', completedBreak)
      }
      
      const response = await window.axios.post('/api/attendance/break-end', {
        timestamp: new Date().toISOString()
      })
      
      // Update local state immediately for UI feedback
      attendance.value.onBreak = false
      breakStartTime.value = null
      
      // Save state to localStorage (including completed breaks)
      saveStateToStorage()
      
      // Broadcast break status change immediately for dashboard sync
      broadcastBreakStatusChange('end-break')
      
      // Note: Laravel Echo will broadcast the update automatically from the backend
      
    } else {
      // Start break - set break start time immediately for instant feedback
      const newBreakStartTime = new Date().toISOString()
      breakStartTime.value = newBreakStartTime
      attendance.value.onBreak = true
      
      const response = await window.axios.post('/api/attendance/break-start', {
        timestamp: new Date().toISOString()
      })
      
      // Update with server response if available
      if (response.data.break_start_time) {
        breakStartTime.value = response.data.break_start_time
      }
      
      // Save state to localStorage
      saveStateToStorage()
      
      // Broadcast break status change immediately for dashboard sync
      broadcastBreakStatusChange('start-break')
      
      // Note: Laravel Echo will broadcast the update automatically from the backend
    }
  } catch (error) {
    console.error('Break action failed:', error)
    alert('Action failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const fetchCurrentStatus = async () => {
  try {
    const response = await window.axios.get('/api/attendance/current')
    const data = response.data
    
    // Check if this is a new day (different clock_in_time means new session)
    const newClockInTime = data.clock_in_time
    const currentClockInTime = attendance.value.clockInTime
    
    // If clock in time changed or we're not clocked in, it's a new session
    if (newClockInTime !== currentClockInTime || !data.clocked_in) {
      // Clear completed break sessions for new day/session
      completedBreakSessions.value = []
      //console.log('🔄 FloatingWidget: New session detected, cleared completed breaks')
    }
    
    attendance.value.clockedIn = data.clocked_in || false
    attendance.value.onBreak = data.on_break || false
    attendance.value.clockInTime = data.clock_in_time || null
    
    // Load break sessions from server data
    if (data.break_sessions && Array.isArray(data.break_sessions)) {
      completedBreakSessions.value = data.break_sessions.map(session => ({
        start: session.start,
        end: session.end,
        isOngoing: false
      }))
      // //console.log('📊 FloatingWidget: Loaded break sessions from server:', {
      //   serverBreakSessions: data.break_sessions.length,
      //   localBreakSessions: completedBreakSessions.value.length
      // })
    }
    
    // Use the same logic as main dashboard for break start time
    if (data.on_break) {
      // Try multiple sources for break start time (same as main dashboard)
      if (data.break_start_time) {
        breakStartTime.value = data.break_start_time
      } else if (data.current_session?.current_break_start) {
        breakStartTime.value = data.current_session.current_break_start
      } else if (data.current_session?.break_sessions && data.current_session.break_sessions.length > 0) {
        // Get the last break session if it doesn't have an end time (ongoing break)
        const lastBreak = data.current_session.break_sessions[data.current_session.break_sessions.length - 1]
        if (lastBreak && !lastBreak.end) {
          breakStartTime.value = lastBreak.start
        }
      } else if (!breakStartTime.value) {
        // If no break start time found but we're on break, use current time
        breakStartTime.value = new Date().toISOString()
      }
    } else {
      breakStartTime.value = null
    }
    
    // Update expanded state based on clock-in status
    updateExpandedState()
    
    // //console.log('FloatingWidget: Fetched status:', {
    //   clockedIn: attendance.value.clockedIn,
    //   onBreak: attendance.value.onBreak,
    //   breakStartTime: breakStartTime.value,
    //   completedBreaks: completedBreakSessions.value.length,
    //   totalBreakTime: totalBreakTime.value,
    //   isExpanded: isExpanded.value
    // })
  } catch (error) {
    console.error('Failed to fetch attendance status:', error)
  }
}

// Listen for attendance updates from other components
const handleStorageChange = (event) => {
  if (event.key === 'attendance-update') {
    // Refresh status when other components update attendance
    fetchCurrentStatus()
  }
}

// Listen for attendance updates via Laravel Echo
const handleAttendanceUpdate = (data) => {
  //console.log('FloatingWidget: Received attendance update via Echo:', data)
  
  // Update local state immediately for responsive UI
  attendance.value.clockedIn = data.clocked_in
  attendance.value.onBreak = data.on_break
  attendance.value.clockInTime = data.clock_in_time
  
  // Update break start time
  if (data.on_break && data.break_start_time) {
    breakStartTime.value = data.break_start_time
  } else if (!data.on_break) {
    breakStartTime.value = null
  }
  
  // Save to localStorage for persistence
  saveStateToStorage()
  
  // Update timer immediately
  updateTimer()
  
  // Update expanded state based on new clock-in status
  updateExpandedState()
  
  // //console.log('FloatingWidget: State updated via Echo:', {
  //   clockedIn: attendance.value.clockedIn,
  //   onBreak: attendance.value.onBreak,
  //   clockInTime: attendance.value.clockInTime,
  //   breakStartTime: breakStartTime.value,
  //   isExpanded: isExpanded.value
  // })
}

// Fallback: Listen for custom attendance state change events (legacy support)
const handleAttendanceStateChange = (event) => {
  //console.log('FloatingWidget: Received attendance state change (legacy):', event.detail)
  
  const { clockedIn, onBreak, clockInTime, breakStartTime: eventBreakStartTime } = event.detail
  
  // Update local state immediately for responsive UI
  attendance.value.clockedIn = clockedIn
  attendance.value.onBreak = onBreak
  attendance.value.clockInTime = clockInTime
  
  // Ensure we use the same break start time as the main dashboard
  if (onBreak && eventBreakStartTime) {
    breakStartTime.value = eventBreakStartTime
  } else if (!onBreak) {
    breakStartTime.value = null
  }
  
  // Save to localStorage for persistence
  saveStateToStorage()
  
  // Update timer immediately
  updateTimer()
  
  // Update expanded state based on new clock-in status
  updateExpandedState()
  
  // //console.log('FloatingWidget: State updated (legacy):', {
  //   clockedIn: attendance.value.clockedIn,
  //   onBreak: attendance.value.onBreak,
  //   breakStartTime: breakStartTime.value,
  //   eventBreakStartTime: eventBreakStartTime,
  //   isExpanded: isExpanded.value
  // })
}

// Broadcast attendance updates to other components
const broadcastAttendanceUpdate = () => {
  try {
    localStorage.setItem('attendance-update', Date.now().toString())
    // Remove the item immediately to trigger storage event
    localStorage.removeItem('attendance-update')
  } catch (error) {
    console.warn('Failed to broadcast attendance update:', error)
  }
}

// Broadcast current status to dashboard (for initial sync)
const broadcastCurrentStatus = () => {
  try {
    // Broadcast via custom event for immediate dashboard sync
    const statusEvent = new CustomEvent('attendance-state-changed', {
      detail: {
        clockedIn: attendance.value.clockedIn,
        onBreak: attendance.value.onBreak,
        clockInTime: attendance.value.clockInTime,
        breakStartTime: breakStartTime.value,
        completedBreakSessions: completedBreakSessions.value,
        totalBreakTime: totalBreakTime.value,
        currentBreakTime: breakTime.value,
        todaysHours: todaysHours.value,
        timestamp: Date.now(),
        source: 'floating-widget-load'
      }
    });
    
    window.dispatchEvent(statusEvent);
    
    // Also update localStorage for persistence
    broadcastAttendanceUpdate();
    
    // 
  } catch (error) {
    console.warn('Failed to broadcast current status:', error);
  }
}

// Broadcast break status changes to dashboard (for immediate sync)
const broadcastBreakStatusChange = (action) => {
  try {
    // Broadcast via custom event for immediate dashboard sync
    const breakEvent = new CustomEvent('attendance-state-changed', {
      detail: {
        clockedIn: attendance.value.clockedIn,
        onBreak: attendance.value.onBreak,
        clockInTime: attendance.value.clockInTime,
        breakStartTime: breakStartTime.value,
        completedBreakSessions: completedBreakSessions.value,
        totalBreakTime: totalBreakTime.value,
        currentBreakTime: breakTime.value,
        todaysHours: todaysHours.value,
        timestamp: Date.now(),
        source: 'floating-widget-break',
        action: action
      }
    });
    
    window.dispatchEvent(breakEvent);
    
    // Also update localStorage for persistence
    broadcastAttendanceUpdate();
    
  
  } catch (error) {
    console.warn('Failed to broadcast break status change:', error);
  }
}

// Lifecycle
onMounted(async () => {
  // First try to load from localStorage for immediate display
  const hasStoredState = loadStateFromStorage()
  
  if (hasStoredState) {
    // Update timer immediately with stored state
    updateTimer()
  }
  
  // Then fetch fresh data from API
  await fetchCurrentStatus()
  
  // Save the fresh state and update timer
  saveStateToStorage()
  updateTimer()
  
  // Broadcast current status to dashboard for immediate sync
  setTimeout(() => {
    broadcastCurrentStatus()
  }, 100) // Small delay to ensure dashboard is ready
  
  // Start real-time updates
  timerInterval = setInterval(updateTimer, 1000) // Update every second
  
  // Subscribe to Laravel Echo attendance updates
  if (window.Echo) {
    // Get current user's employee ID from the page props or API
    try {
      const userResponse = await window.axios.get('/api/user')
      const employeeId = userResponse.data?.employee?.id
      
      if (employeeId) {
        // Subscribe to private channel for this employee
        window.Echo.private(`attendance.${employeeId}`)
          .listen('.attendance.updated', handleAttendanceUpdate)
        
        //console.log(`FloatingWidget: Subscribed to Echo channel attendance.${employeeId}`)
      } else {
        console.warn('FloatingWidget: No employee ID found for Echo subscription')
      }
    } catch (error) {
      console.error('FloatingWidget: Failed to get user data for Echo subscription:', error)
    }
  } else {
    console.warn('FloatingWidget: Echo not available')
  }
  
  // Listen for attendance updates from other components (legacy)
  window.addEventListener('storage', handleStorageChange)
  
  // Listen for custom attendance state change events from dashboard (legacy)
  window.addEventListener('attendance-state-changed', handleAttendanceStateChange)
  
  // //console.log('FloatingWidget: Event listeners registered')
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  
  // Unsubscribe from Echo channels
  if (window.Echo) {
    // We need to leave all attendance channels this component might have subscribed to
    // Since we don't store the employeeId, we'll try to get it again or use a more general approach
    try {
      // Leave any attendance channels (this is a bit of a workaround)
      window.Echo.connector.pusher.allChannels().forEach(channel => {
        if (channel.name.startsWith('private-attendance.')) {
          window.Echo.leave(channel.name.replace('private-', ''))
        }
      })
      //console.log('FloatingWidget: Unsubscribed from Echo channels')
    } catch (error) {
      console.warn('FloatingWidget: Error unsubscribing from Echo channels:', error)
    }
  }
  
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('attendance-state-changed', handleAttendanceStateChange)
  
})
</script>

<style scoped>
.floating-attendance-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Floating Button (Collapsed) */
.floating-button {
  @apply flex items-center gap-3 px-4 py-3 bg-white rounded-full shadow-lg border cursor-pointer transition-all duration-200 hover:shadow-xl;
  min-width: 140px;
}

.floating-button--working {
  @apply border-green-200 hover:border-green-300;
}

.floating-button--break {
  @apply border-yellow-200 hover:border-yellow-300;
}

.floating-button--out {
  @apply border-gray-200 hover:border-gray-300;
}

.status-indicator {
  @apply flex-shrink-0;
}

/* Status Dot with Animation */
.status-dot {
  @apply w-3 h-3 rounded-full transition-all duration-200;
}

.status-dot--working {
  @apply bg-green-500;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot--break {
  @apply bg-yellow-500;
  animation: pulse 2s ease-in-out infinite;
}
c
.status-dot--out {
  @apply bg-gray-400;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.time-info {
  @apply flex-1 flex flex-col justify-center;
}

.time-display {
  @apply text-sm font-mono font-semibold text-gray-700 leading-tight;
}

.time-label-mini {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight mt-0.5;
}

.expand-icon {
  @apply text-gray-400 transition-transform;
}

.floating-button:hover .expand-icon {
  @apply transform -translate-y-0.5;
}

/* Expanded Widget */
.expanded-widget {
  @apply bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden;
  width: 280px;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.widget-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100;
}

.status-info {
  @apply flex items-center gap-2;
}

.status-text {
  @apply text-sm font-semibold text-gray-700;
}

.minimize-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.timer-section {
  @apply text-center py-4 px-4;
}

.timer-value {
  @apply text-2xl font-mono font-bold text-gray-800 mb-1;
}

.timer-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.quick-actions {
  @apply flex gap-2 px-4 pb-4;
}

.primary-action {
  @apply flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors;
}

.primary-action--success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.primary-action--danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.break-action {
  @apply flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.quick-stats {
  @apply flex border-t border-gray-100;
}

.stat {
  @apply flex-1 text-center py-3 px-2;
}

.stat-value {
  @apply block text-sm font-mono font-bold text-gray-800;
}

.stat-label {
  @apply block text-xs text-gray-500 mt-1;
}

/* Backdrop */
.backdrop {
  @apply fixed inset-0 bg-black bg-opacity-20 -z-10;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .floating-attendance-widget {
    @apply bottom-4 right-4;
  }
  
  .expanded-widget {
    width: calc(100vw - 32px);
    max-width: 280px;
  }
  
  .floating-button {
    @apply px-3 py-2;
    min-width: 120px;
  }
  
  .time-display {
    @apply text-xs;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .floating-button,
  .expanded-widget,
  .expand-icon {
    @apply transition-none;
  }
  
  .expanded-widget {
    animation: none;
  }
}
</style>