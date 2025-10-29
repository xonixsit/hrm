<template>
  <div class="attendance-widget">
    <!-- Status Header -->
    <div class="widget-header">
      <div class="status-row">
        <div class="status-indicator">
          <div :class="statusDotClasses"></div>
          <span>{{ statusText }}</span>
        </div>
        <button @click="showSettings = !showSettings" class="settings-btn" aria-label="Settings">
          <CogIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Status Info (Simplified) -->
    <div v-if="attendance.clockedIn.value" class="status-info-section">
      <div class="status-message">{{ attendance.onBreak.value ? 'Currently on break' : 'Work session active' }}</div>
      <div class="status-note">Check floating widget for live timer</div>
    </div>

    <!-- Action Buttons -->
    <div class="action-row">
      <button
        @click="handleClockInOut"
        :disabled="attendance.loading.value"
        :class="primaryActionClasses"
      >
        {{ clockButtonText }}
      </button>

      <button
        v-if="attendance.clockedIn.value"
        @click="handleBreak"
        :disabled="attendance.loading.value"
        class="secondary-action"
        :key="`break-btn-${attendance.clockedIn.value}-${attendance.onBreak.value}`"
      >
        <component :is="attendance.onBreak.value ? PlayIcon : PauseIcon" class="w-4 h-4" />
        {{ attendance.onBreak.value ? 'End Break' : 'Take Break' }}
      </button>
    </div>

    <!-- Time Display Section -->
    <div v-if="attendance.clockedIn.value" class="time-display-section">
      <div class="time-metrics">
        <div class="time-metric">
          <div class="time-value">{{ realTimeWorkDuration }}</div>
          <div class="time-label">WORK TIME</div>
        </div>
        <div class="time-metric">
          <div class="time-value" id="main-break-time">{{ breakTimeFromFloatingWidget }}</div>
          <div class="time-label">BREAK TIME</div>
        </div>
        <div class="time-metric">
          <div class="time-value">{{ workEfficiency }}%</div>
          <div class="time-label">PROGRESS</div>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
      <div class="summary-row">
        <div class="metric">
          <div class="metric-value">{{ attendance.todaysSummary.value.sessions || 0 }}</div>
          <div class="metric-label">SESSIONS</div>
        </div>
        <div class="metric">
          <div class="metric-value">{{ attendance.todaysSummary.value.clockIns || 0 }}</div>
          <div class="metric-label">CLOCK INS</div>
        </div>
        <div class="metric">
          <div class="metric-value">{{ workEfficiency }}%</div>
          <div class="metric-label">EFFICIENCY</div>
        </div>
      </div>
    </div>

    <!-- Progress Section (When Active and Not on Break) -->
    <div v-if="attendance.clockedIn.value && !attendance.onBreak.value" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Daily Progress</span>
        <span class="progress-percent">{{ attendance.workProgress.value.percentage }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${attendance.workProgress.value.percentage}%` }"></div>
      </div>
      <div class="progress-details">
        <span>{{ attendance.workProgress.value.hoursWorked }}h worked</span>
        <span>{{ attendance.workProgress.value.hoursRemaining }}h remaining</span>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-overlay" @click="showSettings = false">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">Settings</span>
          <button @click="showSettings = false" class="modal-close">
            <XCircleIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>Daily Goal (hours)</label>
            <input type="number" :value="attendance.dailyGoal.value" @input="updateDailyGoal($event.target.value)" min="1" max="24" />
          </div>
          <div class="setting-item">
            <label>Break Goal (hours)</label>
            <input type="number" :value="attendance.breakGoal.value" @input="updateBreakGoal($event.target.value)" min="0" max="8" step="0.5" />
          </div>
          <div class="setting-item">
            <label class="toggle-label">
              <input type="checkbox" :checked="attendance.realTimeEnabled.value" @change="toggleRealTime($event.target.checked)" />
              <div class="toggle"></div>
              Real-time Updates
            </label>
          </div>
          <div class="setting-item">
            <label class="toggle-label">
              <input type="checkbox" :checked="attendance.notificationsEnabled.value" @change="toggleNotifications($event.target.checked)" />
              <div class="toggle"></div>
              Notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
console.log('🎯 ClockInOutWidget script is loading...')

import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  // Legacy props for backward compatibility
  clockedIn: {
    type: Boolean,
    default: false
  },
  onBreak: {
    type: Boolean,
    default: false
  },
  clockInTime: {
    type: String,
    default: null
  },
  todaysSummary: {
    type: Object,
    default: () => ({
      totalHours: '0h 0m',
      breakTime: '0h 0m',
      sessions: 0
    })
  },
  recentActivities: {
    type: Array,
    default: () => []
  },
  weeklyHours: {
    type: String,
    default: '0h'
  },
  monthlyHours: {
    type: String,
    default: '0h'
  },
  averageDaily: {
    type: String,
    default: '0h'
  },
  locationEnabled: {
    type: Boolean,
    default: true
  },
  locationVerified: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  // New enhanced props
  showAnalytics: {
    type: Boolean,
    default: true
  },
  showNotifications: {
    type: Boolean,
    default: true
  },
  dailyGoal: {
    type: Number,
    default: 8
  },
  breakGoal: {
    type: Number,
    default: 1
  },
  currentAttendance: {
    type: Object,
    default: () => ({
      clocked_in: false,
      on_break: false,
      clock_in_time: null,
      todays_summary: {
        total_hours: '0h 0m',
        break_time: '0h 0m',
        sessions: 0,
        clock_ins: 0
      },
      recent_activities: [],
      stats: {
        weekly_hours: '0h 0m',
        monthly_hours: '0h 0m',
        average_daily: '0h 0m'
      }
    })
  }
})

const emit = defineEmits(['clock-in-out', 'take-break', 'verify-location', 'settings-change'])

// Composables
const { user } = useAuth()

// Local attendance state (using own state management)
const attendance = {
  clockedIn: ref(false),
  onBreak: ref(false),
  clockInTime: ref(null),
  loading: ref(false),
  locationVerified: ref(false),
  todaysSummary: ref({
    totalHours: '0h 0m',
    breakTime: '0h 0m',
    sessions: 0,
    clockIns: 0
  }),
  recentActivities: ref([]),
  weeklyHours: ref('0h 0m'),
  monthlyHours: ref('0h 0m'),
  averageDaily: ref('0h 0m'),
  workEfficiency: ref(100),
  productivityScore: ref(40),
  workProgress: ref({ percentage: 0, hoursWorked: 0, hoursRemaining: 8 }),
  estimatedEndTime: ref(null),
  overtimeStatus: ref({ status: 'normal', message: 'Within normal hours' }),
  isConnected: ref(true),
  connectionStatus: ref('connected'),
  lastUpdate: ref(null),
  realTimeEnabled: ref(true),
  notificationsEnabled: ref(true),
  dailyGoal: ref(8),
  breakGoal: ref(1)
}

// Real-time state
const currentTime = ref('')
const currentDate = ref('')
const timezone = ref('')
const locationStatus = ref('Location not detected')
const showSettings = ref(false)
const realTimeWorkDuration = ref('0h 0m 0s')
const realTimeBreakDuration = ref('0h 0m 0s')
const breakStartTime = ref(null)

// Break time computed property - FIXED to use backend data
const breakTimeDisplay = computed(() => {
  // If currently on break, show current break session duration
  if (attendance.onBreak.value && breakStartTime.value) {
    const breakStart = new Date(breakStartTime.value)
    const now = new Date()
    const breakMs = now - breakStart
    
    // Convert to hours, minutes, and seconds
    const breakMinutes = Math.floor(breakMs / (1000 * 60))
    const hours = Math.floor(breakMinutes / 60)
    const minutes = breakMinutes % 60
    const seconds = Math.floor((breakMs % (1000 * 60)) / 1000)
    
    return `${hours}h ${minutes}m ${seconds}s`
  }
  
  // Get break time directly from API data stored in component
  // We know the API returns break_time: "1h 23m"
  const apiBreakTime = attendance.todaysSummary.value?.breakTime
  
  console.log('🔍 Current break time from API:', apiBreakTime)
  console.log('🔍 Full summary object:', attendance.todaysSummary.value)
  
  if (apiBreakTime && apiBreakTime !== '0h 0m') {
    // Parse and add seconds for consistency
    const breakTimeMatch = apiBreakTime.match(/(\d+)h\s*(\d+)m/)
    if (breakTimeMatch) {
      const hours = parseInt(breakTimeMatch[1])
      const minutes = parseInt(breakTimeMatch[2])
      console.log('✅ Showing accumulated break time:', `${hours}h ${minutes}m 0s`)
      return `${hours}h ${minutes}m 0s`
    }
  }
  
  console.log('⚠️ No accumulated break time found, showing 0')
  return '0h 0m 0s'
})

// Break time calculation (same as floating widget)
const breakTimeFromFloatingWidget = computed(() => {
  // If currently on break, show current break session duration
  if (attendance.onBreak.value && breakStartTime.value) {
    const breakStart = new Date(breakStartTime.value)
    const now = new Date()
    const breakMs = now - breakStart
    
    // Convert to hours, minutes, and seconds
    const breakMinutes = Math.floor(breakMs / (1000 * 60))
    const hours = Math.floor(breakMinutes / 60)
    const minutes = breakMinutes % 60
    const seconds = Math.floor((breakMs % (1000 * 60)) / 1000)
    
    return `${hours}h ${minutes}m ${seconds}s`
  }
  
  // Otherwise show accumulated break time from backend
  const todaysBreakTime = attendance.todaysSummary.value?.breakTime || '0h 0m'
  
  // Parse and add seconds for consistency
  const breakTimeMatch = todaysBreakTime.match(/(\d+)h\s*(\d+)m/)
  if (breakTimeMatch) {
    const hours = parseInt(breakTimeMatch[1])
    const minutes = parseInt(breakTimeMatch[2])
    return `${hours}h ${minutes}m 0s`
  }
  
  return '0h 0m 0s'
})

// Timer for real-time updates
let timeInterval = null
let workDurationInterval = null
let syncInterval = null

// Sync with floating widget
const syncWithFloatingWidget = () => {
  const floatingWidget = document.querySelector('.floating-attendance-widget')
  if (floatingWidget) {
    const floatingBreakTime = floatingWidget.querySelector('.stat:last-child .stat-value')
    if (floatingBreakTime) {
      const breakValue = floatingBreakTime.textContent.trim()
      console.log('🔄 Syncing break time from floating widget:', breakValue)
      
      // Update the main widget break time element directly
      const mainBreakTime = document.querySelector('.time-display-section .time-metric:nth-child(2) .time-value')
      if (mainBreakTime) {
        const breakWithSeconds = breakValue.includes('s') ? breakValue : breakValue + ' 0s'
        mainBreakTime.textContent = breakWithSeconds
        console.log('✅ Main widget break time synced to:', breakWithSeconds)
      }
    }
  }
}

// Computed properties
const statusText = computed(() => {
  if (attendance.onBreak.value) return 'On Break'
  if (attendance.clockedIn.value) return 'Clocked In'
  return 'Clocked Out'
})

const statusIndicatorClasses = computed(() => [
  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium',
  {
    'bg-green-100 text-green-800': attendance.clockedIn.value && !attendance.onBreak.value,
    'bg-yellow-100 text-yellow-800': attendance.onBreak.value,
    'bg-neutral-100 text-neutral-600': !attendance.clockedIn.value
  }
])

const clockButtonText = computed(() => {
  if (attendance.loading.value) return 'Processing...'
  return attendance.clockedIn.value ? 'Clock Out' : 'Clock In'
})

const statusDotClasses = computed(() => [
  'w-2 h-2 rounded-full mr-2',
  {
    'bg-green-500': attendance.clockedIn.value && !attendance.onBreak.value,
    'bg-yellow-500': attendance.onBreak.value,
    'bg-gray-400': !attendance.clockedIn.value
  }
])

const primaryActionClasses = computed(() => [
  'primary-action',
  attendance.clockedIn.value ? 'primary-action--danger' : 'primary-action--success'
])

const breakButtonClasses = computed(() => [
  'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer',
  attendance.onBreak.value
    ? 'border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
])

const connectionStatusClasses = computed(() => [
  attendance.isConnected.value ? 'text-green-500' : 'text-red-500'
])

const connectionStatusText = computed(() => {
  switch (attendance.connectionStatus.value) {
    case 'connected':
      return 'Connected'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return 'Connection Error'
    default:
      return 'Unknown'
  }
})

const progressBarClasses = computed(() => {
  const percentage = attendance.workProgress.value.percentage
  if (percentage >= 100) return 'bg-green-500'
  if (percentage >= 75) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-neutral-400'
})

// Real-time computed properties for consistent time display
const realTimeTotalHours = computed(() => {
  if (!attendance.clockedIn.value || !attendance.clockInTime.value) {
    return '0h 0m'
  }
  
  const clockInTime = new Date(attendance.clockInTime.value)
  const now = new Date()
  const totalMs = now - clockInTime
  
  // Convert to hours and minutes
  const totalMinutes = Math.floor(totalMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}h ${minutes}m`
})

const workEfficiency = computed(() => {
  if (!attendance.clockedIn.value || !attendance.clockInTime.value) {
    return 100
  }
  
  const clockInTime = new Date(attendance.clockInTime.value)
  const now = new Date()
  const totalMs = now - clockInTime
  const totalMinutes = Math.floor(totalMs / (1000 * 60))
  
  // Calculate break time in minutes
  let breakMinutes = 0
  if (attendance.onBreak.value && breakStartTime.value) {
    const breakStart = new Date(breakStartTime.value)
    breakMinutes = Math.floor((now - breakStart) / (1000 * 60))
  }
  
  const workMinutes = totalMinutes - breakMinutes
  
  if (totalMinutes === 0) return 100
  
  return Math.round((workMinutes / totalMinutes) * 100)
})

// Methods
const updateTime = () => {
  const now = new Date()
  
  // Update current time
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // Update current date
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Update timezone
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone
}

const updateWorkDuration = () => {
  console.log('updateWorkDuration called', {
    clockedIn: attendance.clockedIn.value,
    onBreak: attendance.onBreak.value,
    clockInTime: attendance.clockInTime.value,
    breakStartTime: breakStartTime.value
  })
  
  if (attendance.clockedIn.value && attendance.clockInTime.value) {
    const clockInTime = new Date(attendance.clockInTime.value)
    const now = new Date()
    const diffMs = now - clockInTime
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    realTimeWorkDuration.value = `${hours}h ${minutes}m ${seconds}s`
    console.log('Work duration updated to:', realTimeWorkDuration.value)
  } else {
    realTimeWorkDuration.value = '0h 0m 0s'
  }
  
  // Update break duration - show current break session if on break, otherwise show total break time
  if (attendance.onBreak.value && breakStartTime.value) {
    // Show current break session duration
    const breakStart = new Date(breakStartTime.value)
    const now = new Date()
    const diffMs = now - breakStart
    
    console.log('Current break duration calculation:', {
      onBreak: attendance.onBreak.value,
      breakStartTime: breakStartTime.value,
      breakStart: breakStart.toISOString(),
      now: now.toISOString(),
      diffMs: diffMs
    })
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    realTimeBreakDuration.value = `${hours}h ${minutes}m ${seconds}s`
    console.log('Current break duration updated to:', realTimeBreakDuration.value)
  } else {
    // Show total break time from today's summary (accumulated breaks)
    const todaysBreakTime = attendance.todaysSummary.value?.breakTime || '0h 0m'
    
    console.log('🔍 Getting break time from summary:', {
      todaysBreakTime,
      fullSummary: attendance.todaysSummary.value,
      onBreak: attendance.onBreak.value,
      breakStartTime: breakStartTime.value
    })
    
    // Parse the break time string (e.g., "1h 30m") and add seconds for consistency
    const breakTimeMatch = todaysBreakTime.match(/(\d+)h\s*(\d+)m/)
    if (breakTimeMatch) {
      const hours = parseInt(breakTimeMatch[1])
      const minutes = parseInt(breakTimeMatch[2])
      realTimeBreakDuration.value = `${hours}h ${minutes}m 0s`
      console.log('✅ Parsed break time successfully:', realTimeBreakDuration.value)
    } else {
      // If no break time in summary, show 0 but make it visible
      realTimeBreakDuration.value = '0h 0m 0s'
      console.log('⚠️ No break time found or failed to parse, showing 0:', todaysBreakTime)
    }
    
    console.log('📊 Final break duration set to:', realTimeBreakDuration.value, 'from source:', todaysBreakTime)
  }
}

const handleClockInOut = async () => {
  try {
    attendance.loading.value = true
    
    if (attendance.clockedIn.value) {
      console.log('Clocking out...')
      
      // Make API call to clock out using Axios (handles CSRF automatically)
      const response = await window.axios.post('/api/attendance/clock-out', {
        timestamp: new Date().toISOString()
      })
      
      console.log('Clock out successful:', response.data)
      const data = response.data
      
      // Update local state
      attendance.clockedIn.value = false
      attendance.onBreak.value = false
      attendance.clockInTime.value = null
      realTimeWorkDuration.value = '0h 0m 0s'
      
      // Update today's summary if provided
      if (data.attendance) {
        attendance.todaysSummary.value = {
          totalHours: data.attendance.work_duration || '0h 0m',
          breakTime: data.attendance.break_duration || '0h 0m',
          sessions: 1,
          clockIns: 1
        }
      }
      
      // Broadcast state change to floating widget
      window.dispatchEvent(new CustomEvent('attendance-state-changed', {
        detail: {
          clockedIn: false,
          onBreak: false,
          clockInTime: null,
          breakStartTime: null
        }
      }))
    } else {
      console.log('Clocking in...')
      
      // Make API call to clock in using Axios (handles CSRF automatically)
      const response = await window.axios.post('/api/attendance/clock-in', {
        timestamp: new Date().toISOString()
      })
      
      console.log('Clock in response status:', response.status, response.statusText)
      console.log('Clock in successful:', response.data)
      
      const data = response.data
      
      // Update local state
      attendance.clockedIn.value = true
      attendance.onBreak.value = false
      attendance.clockInTime.value = data.clock_in_time || new Date().toISOString()
      
      console.log('After clock in - clockedIn:', attendance.clockedIn.value, 'clockInTime:', attendance.clockInTime.value)
      
      // Force UI update by triggering reactivity
      await nextTick()
      
      // Start updating work duration immediately
      updateWorkDuration()
      
      // Broadcast state change to floating widget
      window.dispatchEvent(new CustomEvent('attendance-state-changed', {
        detail: {
          clockedIn: true,
          onBreak: false,
          clockInTime: attendance.clockInTime.value,
          breakStartTime: null
        }
      }))
      
      // Fetch fresh status to ensure UI is in sync
      setTimeout(() => {
        fetchCurrentStatus()
      }, 500)
    }
    
    emit('clock-in-out')
  } catch (error) {
    console.error('Clock in/out failed:', error)
    // Show error message to user
    alert('Clock in/out failed: ' + error.message)
  } finally {
    attendance.loading.value = false
  }
}

const handleBreak = async () => {
  try {
    attendance.loading.value = true
    
    if (attendance.onBreak.value) {
      console.log('Ending break...')
      
      // Make API call to end break using Axios (handles CSRF automatically)
      const response = await window.axios.post('/api/attendance/break-end', {
        timestamp: new Date().toISOString()
      })
      
      console.log('Break end successful:', response.data)
      
      // Update local state
      attendance.onBreak.value = false
      breakStartTime.value = null
      
      // Update today's summary with the new break time from the response
      console.log('🔍 Break end response data:', response.data)
      
      if (response.data.attendance) {
        const newBreakTime = response.data.attendance.break_duration
        console.log('📊 Updating break time from API response:', newBreakTime)
        attendance.todaysSummary.value.breakTime = newBreakTime || attendance.todaysSummary.value.breakTime
      }
      
      // Also check if break_duration is directly in response.data
      if (response.data.break_duration) {
        console.log('📊 Found break_duration directly in response:', response.data.break_duration)
        attendance.todaysSummary.value.breakTime = response.data.break_duration
      }
      
      // Fetch fresh data from API to ensure we have the latest break time
      console.log('🔄 Fetching fresh status after break end...')
      const freshData = await fetchCurrentStatus()
      
      // Double-check that break time was updated
      if (freshData && freshData.todays_summary && freshData.todays_summary.break_time) {
        console.log('✅ Fresh break time from API:', freshData.todays_summary.break_time)
        attendance.todaysSummary.value.breakTime = freshData.todays_summary.break_time
      }
      
      // Let updateWorkDuration calculate the accumulated break time
      updateWorkDuration()
      
      console.log('🎯 Break end complete - final break time:', attendance.todaysSummary.value.breakTime)
    } else {
      console.log('Starting break...')
      
      // Make API call to start break using Axios (handles CSRF automatically)
      const response = await window.axios.post('/api/attendance/break-start', {
        timestamp: new Date().toISOString()
      })
      
      console.log('Break start successful:', response.data)
      const data = response.data
      
      // Update local state
      attendance.onBreak.value = true
      breakStartTime.value = data.break_start_time || new Date().toISOString()
    }
    
    emit('take-break')
  } catch (error) {
    console.error('Break action failed:', error)
    alert('Break action failed: ' + error.message)
  } finally {
    attendance.loading.value = false
  }
}

const verifyLocation = async () => {
  if (!navigator.geolocation) {
    locationStatus.value = 'Geolocation not supported'
    return
  }
  
  try {
    locationStatus.value = 'Getting location...'
    
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      })
    })
    
    const { latitude, longitude } = position.coords
    locationStatus.value = `Location verified (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
    
    emit('verify-location', { latitude, longitude })
  } catch (error) {
    locationStatus.value = 'Location verification failed'
    console.error('Geolocation error:', error)
  }
}

const getActivityIcon = (type) => {
  const iconMap = {
    'clock-in': PlayIcon,
    'clock-out': PauseIcon,
    'break-start': PauseIcon,
    'break-end': PlayIcon,
    'location-verified': CheckCircleIcon,
    'location-failed': XCircleIcon
  }
  return iconMap[type] || ClockIcon
}

const formatTime = (timeString) => {
  const time = new Date(timeString)
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatRelativeTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

// Settings methods
const updateDailyGoal = (value) => {
  const hours = parseFloat(value)
  if (hours >= 1 && hours <= 24) {
    attendance.dailyGoal.value = hours
    emit('settings-change', { dailyGoal: hours })
  }
}

const updateBreakGoal = (value) => {
  const hours = parseFloat(value)
  if (hours >= 0 && hours <= 8) {
    attendance.breakGoal.value = hours
    emit('settings-change', { breakGoal: hours })
  }
}

const toggleRealTime = (enabled) => {
  attendance.realTimeEnabled.value = enabled
  emit('settings-change', { realTimeEnabled: enabled })
}

const toggleNotifications = (enabled) => {
  attendance.notificationsEnabled.value = enabled
  emit('settings-change', { notificationsEnabled: enabled })
}

// Notification panel
const unreadNotifications = ref(0)
const showNotificationPanel = ref(false)

const toggleNotificationPanel = () => {
  showNotificationPanel.value = !showNotificationPanel.value
  if (showNotificationPanel.value) {
    unreadNotifications.value = 0
  }
}

// Initialize attendance state with current data
const initializeAttendanceState = () => {
  console.log('🔄 Initializing attendance state with:', props.currentAttendance)
  
  // Set the attendance state from the current attendance data
  if (props.currentAttendance) {
    const clockedIn = props.currentAttendance.clocked_in || false
    const onBreak = props.currentAttendance.on_break || false
    const clockInTime = props.currentAttendance.clock_in_time || null
    
    console.log('📊 Setting attendance state:', {
      clockedIn,
      onBreak,
      clockInTime
    })
    
    attendance.clockedIn.value = clockedIn
    attendance.onBreak.value = onBreak
    attendance.clockInTime.value = clockInTime
    
    // Set today's summary
    if (props.currentAttendance.todays_summary) {
      attendance.todaysSummary.value = {
        totalHours: props.currentAttendance.todays_summary.total_hours || '0h 0m',
        breakTime: props.currentAttendance.todays_summary.break_time || '0h 0m',
        sessions: props.currentAttendance.todays_summary.sessions || 0,
        clockIns: props.currentAttendance.todays_summary.clock_ins || 0
      }
    }
    
    // Set recent activities
    if (props.currentAttendance.recent_activities) {
      attendance.recentActivities.value = props.currentAttendance.recent_activities
    }
    
    // Set stats
    if (props.currentAttendance.stats) {
      attendance.weeklyHours.value = props.currentAttendance.stats.weekly_hours || '0h 0m'
      attendance.monthlyHours.value = props.currentAttendance.stats.monthly_hours || '0h 0m'
      attendance.averageDaily.value = props.currentAttendance.stats.average_daily || '0h 0m'
    }
    
    console.log('Attendance state initialized:', {
      clockedIn: attendance.clockedIn.value,
      onBreak: attendance.onBreak.value,
      clockInTime: attendance.clockInTime.value
    })
  }
}

// Fetch current attendance status from API
const fetchCurrentStatus = async () => {
  try {
    console.log('🔄 Fetching current attendance status from API...')
    
    const response = await fetch('/api/attendance/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Current status from API:', data)
      
      // Update attendance state with API data
      attendance.clockedIn.value = data.clocked_in || false
      attendance.onBreak.value = data.on_break || false
      attendance.clockInTime.value = data.clock_in_time || null
      breakStartTime.value = data.break_start_time || null
      
      // Update today's summary with API data
      if (data.todays_summary) {
        attendance.todaysSummary.value = {
          totalHours: data.todays_summary.total_hours || '0h 0m',
          breakTime: data.todays_summary.break_time || '0h 0m',
          sessions: data.todays_summary.sessions || 0,
          clockIns: data.todays_summary.clock_ins || 0
        }
        console.log('📊 Updated today\'s summary from API:', attendance.todaysSummary.value)
      }
      
      console.log('📊 Updated attendance state from API:', {
        clockedIn: attendance.clockedIn.value,
        onBreak: attendance.onBreak.value,
        clockInTime: attendance.clockInTime.value,
        breakTime: attendance.todaysSummary.value.breakTime
      })
      
      // Update work duration if clocked in
      if (attendance.clockedIn.value && attendance.clockInTime.value) {
        updateWorkDuration()
      }
      
      return data
    } else {
      console.error('❌ Failed to fetch current status:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching current status:', error)
    return null
  }
}

// Function to update break time display directly
const updateBreakTimeDisplay = () => {
  const breakTimeElement = document.getElementById('main-break-time')
  if (breakTimeElement) {
    // Get break time from today's summary
    const todaysBreakTime = attendance.todaysSummary.value?.breakTime || '0h 0m'
    
    // If currently on break, show real-time break duration
    if (attendance.onBreak.value && breakStartTime.value) {
      const breakStart = new Date(breakStartTime.value)
      const now = new Date()
      const breakMs = now - breakStart
      
      const hours = Math.floor(breakMs / (1000 * 60 * 60))
      const minutes = Math.floor((breakMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((breakMs % (1000 * 60)) / 1000)
      
      breakTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`
    } else {
      // Show accumulated break time from backend
      const breakTimeMatch = todaysBreakTime.match(/(\d+)h\s*(\d+)m/)
      if (breakTimeMatch) {
        const hours = parseInt(breakTimeMatch[1])
        const minutes = parseInt(breakTimeMatch[2])
        breakTimeElement.textContent = `${hours}h ${minutes}m 0s`
      } else {
        breakTimeElement.textContent = '0h 0m 0s'
      }
    }
  }
}

// Listen for floating widget state changes
const handleFloatingWidgetStateChange = (event) => {
  console.log('🔄 Main widget received state change from floating widget:', event.detail)
  
  const { clockedIn, onBreak, clockInTime, breakStartTime: floatingBreakStartTime } = event.detail
  
  // Update local state to match floating widget
  attendance.clockedIn.value = clockedIn
  attendance.onBreak.value = onBreak
  attendance.clockInTime.value = clockInTime
  breakStartTime.value = floatingBreakStartTime
  
  // Update work duration immediately
  updateWorkDuration()
  
  // Update break time display
  updateBreakTimeDisplay()
  
  console.log('✅ Main widget state synchronized with floating widget')
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 ClockInOutWidget mounted - syncing with floating widget...')
  
  // Initialize with props first
  initializeAttendanceState()
  
  // Fetch current status from API
  await fetchCurrentStatus()
  
  // Initialize time display
  updateTime()
  updateWorkDuration()
  
  // Start real-time updates
  timeInterval = setInterval(updateTime, 1000)
  workDurationInterval = setInterval(updateWorkDuration, 1000)
  
  // Start syncing with floating widget every 2 seconds
  syncInterval = setInterval(syncWithFloatingWidget, 2000)
  
  // Sync immediately after 1 second (let floating widget load first)
  setTimeout(syncWithFloatingWidget, 1000)
  
  // Listen for floating widget state changes
  window.addEventListener('attendance-state-changed', handleFloatingWidgetStateChange)
  
  // Initialize location if enabled
  if (props.locationEnabled && !attendance.locationVerified.value) {
    verifyLocation()
  }
  
  console.log('✅ ClockInOutWidget initialization complete with floating widget sync!')
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (workDurationInterval) clearInterval(workDurationInterval)
})
</script>

<style scoped>
/* Ultra-Minimalistic HFI-Compliant Design */

.attendance-widget {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header - Minimal Status Row */
.widget-header {
  @apply p-4 border-b border-gray-100;
}

.status-row {
  @apply flex items-center justify-between;
}

.status-indicator {
  @apply flex items-center text-sm font-medium text-gray-700;
}

.settings-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors;
}

/* Status Info Section - Simplified Status Display */
.status-info-section {
  @apply text-center py-4 px-4 bg-gradient-to-b from-blue-50 to-white border-b border-gray-100;
}

.status-message {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.status-note {
  @apply text-xs text-gray-500 italic;
}

/* Action Buttons - Fitts' Law Compliant */
.action-row {
  @apply flex gap-3 p-4;
}

.primary-action {
  @apply flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50;
  min-height: 44px; /* HFI minimum touch target */
}

.primary-action--success {
  @apply text-white bg-green-600 hover:bg-green-700 focus:ring-green-500;
}

.primary-action--danger {
  @apply text-white bg-red-600 hover:bg-red-700 focus:ring-red-500;
}

.secondary-action {
  @apply flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1;
  min-height: 44px;
}

/* Time Display Section - Main Time Metrics */
.time-display-section {
  @apply p-6 bg-white border-b border-gray-100;
}

.time-metrics {
  @apply grid grid-cols-3 gap-6;
}

.time-metric {
  @apply text-center;
}

.time-value {
  @apply text-2xl font-bold text-gray-900 font-mono mb-1;
}

.time-label {
  @apply text-xs text-gray-500 font-medium uppercase tracking-wide;
}

/* Summary Section - Clean Metrics */
.summary-section {
  @apply p-4 bg-gray-50;
}

.summary-row {
  @apply grid grid-cols-3 gap-4;
}

.metric {
  @apply text-center;
}

.metric-value {
  @apply text-lg font-bold text-gray-900 font-mono;
}

.metric-label {
  @apply text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide;
}

/* Progress Section - Minimal Progress Bar */
.progress-section {
  @apply p-4 border-t border-gray-100;
}

.progress-header {
  @apply flex justify-between items-center mb-2;
}

.progress-label {
  @apply text-sm font-medium text-gray-700;
}

.progress-percent {
  @apply text-sm font-bold text-blue-600;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2 mb-2;
}

.progress-fill {
  @apply h-full bg-blue-500 rounded-full transition-all duration-300;
}

.progress-details {
  @apply flex justify-between text-xs text-gray-600;
}

/* Settings Modal - Clean Overlay */
.settings-overlay {
  @apply fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.settings-modal {
  @apply bg-white rounded-lg shadow-xl max-w-sm w-full;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.modal-title {
  @apply font-semibold text-gray-900;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded;
}

.modal-body {
  @apply p-4 space-y-4;
}

.setting-item {
  @apply space-y-2;
}

.setting-item label {
  @apply block text-sm font-medium text-gray-700;
}

.setting-item input[type="number"] {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.toggle-label {
  @apply flex items-center gap-3 cursor-pointer;
}

.toggle-label input[type="checkbox"] {
  @apply sr-only;
}

.toggle {
  @apply relative w-10 h-6 bg-gray-200 rounded-full transition-colors;
}

.toggle-label input:checked + .toggle {
  @apply bg-blue-600;
}

.toggle::before {
  @apply absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform;
  content: '';
}

.toggle-label input:checked + .toggle::before {
  @apply transform translate-x-4;
}

/* Responsive Design */
@media (max-width: 640px) {
  .timer-value {
    @apply text-2xl;
  }
  
  .action-row {
    @apply flex-col;
  }
  
  .summary-row {
    @apply grid-cols-1 gap-3;
  }
  
  .metric {
    @apply flex justify-between items-center bg-white rounded-lg p-3;
  }
  
  .metric-value {
    @apply text-base;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .timer-value,
  .primary-action,
  .secondary-action,
  .progress-fill,
  .toggle {
    @apply transition-none;
  }
}

/* Focus States */
.primary-action:focus-visible,
.secondary-action:focus-visible,
.settings-btn:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Loading States */
.primary-action:disabled {
  @apply cursor-not-allowed opacity-60;
}

.secondary-action:disabled {
  @apply cursor-not-allowed opacity-60;
}

/* Primary Section - F-Pattern Layout (Top Priority) */
.primary-section {
  @apply p-6 bg-gradient-to-r from-blue-50 to-green-50 border-b border-neutral-200;
}

/* Status Header - Clear Visual Hierarchy */
.status-header {
  @apply mb-4;
}

.status-header .flex {
  @apply items-center space-x-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm;
}

.status-icon {
  @apply flex-shrink-0;
}

.status-dot {
  @apply w-3 h-3 rounded-full bg-current animate-pulse;
}

.status-content {
  @apply flex-1 min-w-0;
}

.status-text {
  @apply block text-lg font-semibold text-neutral-900;
}

.status-duration {
  @apply block text-sm font-mono text-neutral-600 mt-1;
}

/* Timer Display - Prominent When Active */
.timer-display {
  @apply mb-6;
}

.timer-container {
  @apply text-center p-6 bg-white rounded-xl shadow-sm border border-green-200;
}

.timer-value {
  @apply text-4xl font-mono font-bold text-green-700 mb-2;
  letter-spacing: 0.05em;
}

.timer-label {
  @apply text-sm font-medium text-neutral-600 uppercase tracking-wide;
}

/* Primary Actions - Fitts' Law Compliance */
.primary-actions {
  @apply flex flex-col sm:flex-row gap-3;
}

.primary-button {
  @apply flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5;
  min-height: 56px; /* Fitts' Law: Minimum 44px touch target */
  min-width: 120px;
}

.primary-button--success {
  @apply text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500;
}

.primary-button--danger {
  @apply text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500;
}

.secondary-button {
  @apply flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-md;
  min-height: 44px;
}

.secondary-button--default {
  @apply border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500;
}

.secondary-button--active {
  @apply border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500;
}

.button-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.button-text {
  @apply font-medium;
}

/* Secondary Section - Scannable Information */
.secondary-section {
  @apply p-6 space-y-6;
}

.section-title {
  @apply text-lg font-semibold text-neutral-900 mb-4;
}

/* Summary Card - Key Metrics */
.summary-card {
  @apply bg-neutral-50 rounded-lg p-4;
}

.summary-grid {
  @apply grid grid-cols-3 gap-4;
}

.metric-item {
  @apply text-center;
}

.metric-value {
  @apply text-xl font-bold text-neutral-900 font-mono;
}

.metric-label {
  @apply text-xs text-neutral-600 mt-1 font-medium uppercase tracking-wide;
}

/* Progress Card - Visual Progress Indicator */
.progress-card {
  @apply bg-blue-50 rounded-lg p-4 border border-blue-200;
}

.progress-header {
  @apply flex items-center justify-between mb-3;
}

.progress-title {
  @apply text-sm font-semibold text-neutral-700;
}

.progress-value {
  @apply text-sm font-bold text-blue-600;
}

.progress-track {
  @apply w-full bg-neutral-200 rounded-full h-3 mb-3 overflow-hidden;
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500 ease-out;
}

.progress-details {
  @apply flex items-center justify-between text-xs text-neutral-600;
}

.detail-item {
  @apply font-medium;
}

/* Productivity Card - Contextual Information */
.productivity-card {
  @apply bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200;
}

.productivity-header {
  @apply flex items-center space-x-2 mb-3;
}

.productivity-icon {
  @apply w-5 h-5 text-yellow-500;
}

.productivity-title {
  @apply text-sm font-semibold text-neutral-700 flex-1;
}

.productivity-value {
  @apply text-sm font-bold text-purple-600;
}

.productivity-insights {
  @apply space-y-2;
}

.insight-item {
  @apply flex items-center space-x-2 text-xs text-neutral-600;
}

.insight-item.warning {
  @apply text-orange-600;
}

.insight-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.insight-label {
  @apply font-medium;
}

.insight-value {
  @apply text-neutral-800;
}

/* Tertiary Section - Minimal Information */
.tertiary-section {
  @apply px-6 pb-6 pt-0 border-t border-neutral-100;
}

.time-display {
  @apply flex items-center justify-between py-3 text-sm;
}

.time-value {
  @apply font-mono font-semibold text-neutral-700;
}

.date-value {
  @apply text-neutral-500;
}

.system-status {
  @apply flex items-center justify-center py-2;
}

.status-item {
  @apply flex items-center space-x-2 text-xs text-neutral-500;
}

.status-icon {
  @apply w-4 h-4;
}

.status-label {
  @apply font-medium;
}

/* Settings Panel - Modal Design */
.settings-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.settings-modal {
  @apply bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-neutral-200;
}

.modal-title {
  @apply text-lg font-semibold text-neutral-900;
}

.modal-close {
  @apply p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors;
}

.close-icon {
  @apply w-5 h-5;
}

.modal-content {
  @apply p-6 space-y-6 overflow-y-auto;
}

.setting-group {
  @apply space-y-2;
}

.setting-label {
  @apply block text-sm font-medium text-neutral-700;
}

.setting-input {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.setting-help {
  @apply text-xs text-neutral-500;
}

.setting-toggle {
  @apply flex items-center space-x-3 cursor-pointer;
}

.toggle-input {
  @apply sr-only;
}

.toggle-slider {
  @apply relative w-11 h-6 bg-neutral-200 rounded-full transition-colors duration-200 ease-in-out;
}

.toggle-input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-slider::before {
  @apply absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out;
  content: '';
}

.toggle-input:checked + .toggle-slider::before {
  @apply transform translate-x-5;
}

.toggle-label {
  @apply text-sm font-medium text-neutral-700;
}

/* Settings Trigger - Accessible */
.settings-trigger {
  @apply absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.settings-icon {
  @apply w-5 h-5;
}

/* Responsive Design - Mobile First */
@media (max-width: 640px) {
  .attendance-widget {
    @apply rounded-lg;
  }
  
  .primary-section {
    @apply p-4;
  }
  
  .secondary-section {
    @apply p-4 space-y-4;
  }
  
  .tertiary-section {
    @apply px-4 pb-4;
  }
  
  .timer-value {
    @apply text-3xl;
  }
  
  .primary-button {
    @apply px-6 py-3 text-base;
    min-height: 48px;
  }
  
  .summary-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .metric-item {
    @apply flex items-center justify-between bg-white rounded-lg p-3;
  }
  
  .metric-value {
    @apply text-lg;
  }
  
  .settings-overlay {
    @apply p-2;
  }
  
  .settings-modal {
    @apply max-h-[90vh];
  }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
  .timer-value,
  .status-dot,
  .primary-button,
  .progress-fill {
    @apply transition-none;
  }
  
  .status-dot {
    @apply animate-none;
  }
  
  .primary-button {
    @apply transform-none;
  }
  
  .primary-button:hover {
    @apply transform-none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .attendance-widget {
    @apply border-2 border-black;
  }
  
  .primary-button {
    @apply border-2 border-current;
  }
  
  .secondary-button {
    @apply border-2;
  }
}

/* Focus Visible for Keyboard Navigation */
.primary-button:focus-visible,
.secondary-button:focus-visible,
.settings-trigger:focus-visible,
.modal-close:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Loading States */
.primary-button:disabled {
  @apply cursor-not-allowed opacity-60;
}

.secondary-button:disabled {
  @apply cursor-not-allowed opacity-60;
}

/* Animation for Timer Updates */
.timer-value {
  @apply transition-all duration-300 ease-in-out;
}

/* Status Color Coding */
.bg-green-100.text-green-800 .status-dot {
  @apply bg-green-500;
}

.bg-yellow-100.text-yellow-800 .status-dot {
  @apply bg-yellow-500;
}

.bg-neutral-100.text-neutral-600 .status-dot {
  @apply bg-neutral-400;
}

.clock-display {
  @apply text-center border-b border-neutral-200 pb-6;
}

.current-time {
  @apply mb-2;
}

.time-text {
  @apply text-4xl font-bold text-neutral-900 font-mono;
}

.date-text {
  @apply text-sm text-neutral-600 mt-1;
}

.timezone-info {
  @apply text-xs text-neutral-500;
}

.status-section {
  @apply space-y-4;
}

.status-indicator {
  @apply flex items-center justify-between;
}

.status-dot {
  @apply w-2 h-2 rounded-full bg-current;
}

.work-duration {
  @apply flex items-center space-x-1 text-sm text-neutral-600;
}

/* Large Work Duration Display */
.work-duration-display {
  @apply text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 mb-4;
}

.duration-label {
  @apply text-xs font-medium text-neutral-600 mb-1;
}

.duration-time {
  @apply text-3xl font-mono font-bold text-green-700 mb-1;
}

.duration-status {
  @apply text-sm font-medium text-neutral-700;
}

.todays-summary {
  @apply grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg;
}

.summary-item {
  @apply text-center;
}

.summary-label {
  @apply block text-xs text-neutral-500 mb-1;
}

.summary-value {
  @apply block text-sm font-semibold text-neutral-900;
}

.action-section {
  @apply flex flex-col space-y-3;
}

.location-section {
  @apply border-t border-neutral-200 pt-4;
}

.location-status {
  @apply flex items-center justify-between text-sm;
}

.location-text {
  @apply text-neutral-600 flex-1 mx-2;
}

.verify-location-btn {
  @apply px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors;
}

.recent-activity {
  @apply border-t border-neutral-200 pt-4;
}

.activity-title {
  @apply text-sm font-semibold text-neutral-900 mb-3;
}

.activity-list {
  @apply space-y-2 max-h-32 overflow-y-auto;
}

.activity-item {
  @apply flex items-center space-x-3 text-sm;
}

.activity-icon {
  @apply flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600;
}

.activity-content {
  @apply flex-1 flex justify-between;
}

.activity-action {
  @apply text-neutral-900;
}

.activity-time {
  @apply text-neutral-500 text-xs;
}

.quick-stats {
  @apply grid grid-cols-3 gap-4 border-t border-neutral-200 pt-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-lg font-bold text-neutral-900;
}

.stat-label {
  @apply text-xs text-neutral-500 mt-1;
}

/* Connection Status */
.connection-status {
  @apply border-b border-neutral-200 pb-4;
}

.connection-indicator {
  @apply flex items-center justify-between text-sm;
}

.connection-text {
  @apply font-medium;
}

.last-update {
  @apply text-xs text-neutral-500;
}

/* Work Progress */
.work-progress {
  @apply mt-4 p-3 bg-neutral-50 rounded-lg;
}

.progress-header {
  @apply flex items-center justify-between mb-2;
}

.progress-label {
  @apply text-sm font-medium text-neutral-700;
}

.progress-percentage {
  @apply text-sm font-bold text-neutral-900;
}

.progress-bar {
  @apply w-full bg-neutral-200 rounded-full h-2 mb-2;
}

.progress-fill {
  @apply h-2 rounded-full transition-all duration-300;
}

.progress-details {
  @apply flex items-center justify-between text-xs text-neutral-600;
}

/* Current Time Section (Moved to bottom) */
.current-time-section {
  @apply border-t border-neutral-200 pt-4 mt-4;
}

.time-display {
  @apply text-center;
}

.time-info {
  @apply flex items-center justify-center space-x-2 mb-1;
}

.current-time-label {
  @apply text-xs text-neutral-500 font-medium;
}

.current-time-value {
  @apply text-sm font-mono font-semibold text-neutral-700;
}

.date-info {
  @apply flex items-center justify-center space-x-1 text-xs text-neutral-500;
}

.current-date {
  @apply font-medium;
}

.timezone {
  @apply text-neutral-400;
}

.progress-fill {
  @apply h-2 rounded-full transition-all duration-300;
}

.progress-details {
  @apply flex items-center justify-between text-xs text-neutral-600;
}

/* Productivity Section */
.productivity-section {
  @apply mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100;
}

.productivity-header {
  @apply flex items-center space-x-2 mb-2;
}

.productivity-label {
  @apply text-sm font-medium text-neutral-700 flex-1;
}

.productivity-score {
  @apply text-sm font-bold text-blue-600;
}

.productivity-insights {
  @apply space-y-1;
}

.insight-item {
  @apply flex items-center space-x-2 text-xs text-neutral-600;
}

.insight-label {
  @apply font-medium;
}

.insight-value {
  @apply text-neutral-800;
}

/* Settings Panel */
.settings-panel {
  @apply absolute top-0 left-0 right-0 bottom-0 bg-white rounded-xl border border-neutral-200 shadow-lg z-10 p-4;
}

.settings-header {
  @apply flex items-center justify-between mb-4 pb-2 border-b border-neutral-200;
}

.settings-title {
  @apply text-lg font-semibold text-neutral-900;
}

.close-settings {
  @apply p-1 text-neutral-500 hover:text-neutral-700 transition-colors;
}

.settings-content {
  @apply space-y-4;
}

.setting-item {
  @apply space-y-2;
}

.setting-label {
  @apply block text-sm font-medium text-neutral-700;
}

.setting-input {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.setting-checkbox {
  @apply flex items-center space-x-2 text-sm text-neutral-700 cursor-pointer;
}

.setting-checkbox input[type="checkbox"] {
  @apply w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500;
}

/* Widget Actions */
.widget-actions {
  @apply absolute top-4 right-4 flex items-center space-x-2;
}

.settings-toggle,
.notifications-toggle {
  @apply p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors relative;
}

.notification-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
}

/* Enhanced Summary Grid */
.todays-summary {
  @apply grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-blue-50 rounded-lg border border-neutral-200;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .clock-in-out-widget {
    @apply p-4 space-y-4 relative;
  }
  
  .time-text {
    @apply text-3xl;
  }
  
  .todays-summary {
    @apply grid-cols-1 gap-2;
  }
  
  .quick-stats {
    @apply grid-cols-1 gap-2;
  }
  
  .action-section {
    @apply space-y-2;
  }
  
  .work-progress {
    @apply p-2;
  }
  
  .productivity-section {
    @apply p-2;
  }
  
  .settings-panel {
    @apply p-3;
  }
  
  .widget-actions {
    @apply top-2 right-2;
  }
}
</style>