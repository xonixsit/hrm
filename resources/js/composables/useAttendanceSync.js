// Shared attendance state management for syncing between widgets
import { ref, computed, watch } from 'vue'

// Shared state - single source of truth
const sharedAttendanceState = {
  clockedIn: ref(false),
  onBreak: ref(false),
  clockInTime: ref(null),
  breakStartTime: ref(null),
  totalBreakMinutes: ref(0), // Accumulated break time in minutes
  breakSessions: ref([]), // Array of completed break sessions
  loading: ref(false),
  lastUpdate: ref(null)
}

// Computed properties based on shared state
const sharedComputedState = {
  workTime: computed(() => {
    if (!sharedAttendanceState.clockedIn.value || !sharedAttendanceState.clockInTime.value) {
      return '0h 0m 0s'
    }
    
    const now = new Date()
    const start = new Date(sharedAttendanceState.clockInTime.value)
    const totalMs = now - start
    
    // Subtract all break time
    let breakMs = sharedAttendanceState.totalBreakMinutes.value * 60 * 1000
    
    // Add current break if on break
    if (sharedAttendanceState.onBreak.value && sharedAttendanceState.breakStartTime.value) {
      const currentBreakMs = now - new Date(sharedAttendanceState.breakStartTime.value)
      breakMs += currentBreakMs
    }
    
    const workMs = Math.max(0, totalMs - breakMs)
    return formatDuration(workMs)
  }),
  
  breakTime: computed(() => {
    if (!sharedAttendanceState.clockedIn.value) {
      return '0h 0m 0s'
    }
    
    if (sharedAttendanceState.onBreak.value && sharedAttendanceState.breakStartTime.value) {
      // Show current break session duration
      const now = new Date()
      const currentBreakMs = now - new Date(sharedAttendanceState.breakStartTime.value)
      return formatDuration(currentBreakMs)
    } else {
      // Show accumulated break time
      const totalBreakMs = sharedAttendanceState.totalBreakMinutes.value * 60 * 1000
      return formatDuration(totalBreakMs)
    }
  }),
  
  statusText: computed(() => {
    if (sharedAttendanceState.onBreak.value) return 'On Break'
    if (sharedAttendanceState.clockedIn.value) return 'Working'
    return 'Clocked Out'
  }),
  
  progress: computed(() => {
    if (!sharedAttendanceState.clockedIn.value || !sharedAttendanceState.clockInTime.value) {
      return 0
    }
    
    const now = new Date()
    const start = new Date(sharedAttendanceState.clockInTime.value)
    const totalMs = now - start
    
    if (totalMs === 0) return 0
    
    let breakMs = sharedAttendanceState.totalBreakMinutes.value * 60 * 1000
    if (sharedAttendanceState.onBreak.value && sharedAttendanceState.breakStartTime.value) {
      breakMs += now - new Date(sharedAttendanceState.breakStartTime.value)
    }
    
    const workMs = Math.max(0, totalMs - breakMs)
    const workHours = workMs / (1000 * 60 * 60)
    
    // Assume 8-hour workday for progress calculation
    return Math.min(Math.round((workHours / 8) * 100), 100)
  })
}

// Helper function to format duration
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

// State persistence
const saveStateToStorage = () => {
  try {
    const state = {
      clockedIn: sharedAttendanceState.clockedIn.value,
      onBreak: sharedAttendanceState.onBreak.value,
      clockInTime: sharedAttendanceState.clockInTime.value,
      breakStartTime: sharedAttendanceState.breakStartTime.value,
      totalBreakMinutes: sharedAttendanceState.totalBreakMinutes.value,
      breakSessions: sharedAttendanceState.breakSessions.value,
      lastUpdate: new Date().toISOString()
    }
    localStorage.setItem('shared-attendance-state', JSON.stringify(state))
    //console.log('💾 Saved shared attendance state:', state)
  } catch (error) {
    console.warn('Failed to save shared attendance state:', error)
  }
}

const loadStateFromStorage = () => {
  try {
    const stored = localStorage.getItem('shared-attendance-state')
    if (stored) {
      const state = JSON.parse(stored)
      // Only use stored state if it's recent (within 5 minutes)
      const lastUpdate = new Date(state.lastUpdate)
      const now = new Date()
      const diffMinutes = (now - lastUpdate) / (1000 * 60)
      
      if (diffMinutes < 5) {
        sharedAttendanceState.clockedIn.value = state.clockedIn || false
        sharedAttendanceState.onBreak.value = state.onBreak || false
        sharedAttendanceState.clockInTime.value = state.clockInTime || null
        sharedAttendanceState.breakStartTime.value = state.breakStartTime || null
        sharedAttendanceState.totalBreakMinutes.value = state.totalBreakMinutes || 0
        sharedAttendanceState.breakSessions.value = state.breakSessions || []
        
        //console.log('📥 Loaded shared attendance state from storage:', state)
        return true
      }
    }
  } catch (error) {
    console.warn('Failed to load shared attendance state:', error)
  }
  return false
}

// API functions
const fetchCurrentStatus = async () => {
  try {
    //console.log('🔄 Fetching current attendance status...')
    
    const response = await fetch('/api/attendance/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      //console.log('✅ Current status from API:', data)
      
      // Update shared state with API data
      sharedAttendanceState.clockedIn.value = data.clocked_in || false
      sharedAttendanceState.onBreak.value = data.on_break || false
      sharedAttendanceState.clockInTime.value = data.clock_in_time || null
      sharedAttendanceState.breakStartTime.value = data.break_start_time || null
      
      // Calculate total break minutes from break sessions if available
      if (data.current_session && data.current_session.break_sessions) {
        let totalMinutes = 0
        data.current_session.break_sessions.forEach(session => {
          if (session.duration_minutes) {
            totalMinutes += session.duration_minutes
          }
        })
        sharedAttendanceState.totalBreakMinutes.value = totalMinutes
        sharedAttendanceState.breakSessions.value = data.current_session.break_sessions
      }
      
      sharedAttendanceState.lastUpdate.value = new Date().toISOString()
      saveStateToStorage()
      
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

const clockInOut = async () => {
  try {
    sharedAttendanceState.loading.value = true
    
    if (sharedAttendanceState.clockedIn.value) {
      // Clock out
      const response = await window.axios.post('/api/attendance/clock-out', {
        timestamp: new Date().toISOString()
      })
      
      sharedAttendanceState.clockedIn.value = false
      sharedAttendanceState.onBreak.value = false
      sharedAttendanceState.clockInTime.value = null
      sharedAttendanceState.breakStartTime.value = null
      sharedAttendanceState.totalBreakMinutes.value = 0
      sharedAttendanceState.breakSessions.value = []
    } else {
      // Clock in
      const response = await window.axios.post('/api/attendance/clock-in', {
        timestamp: new Date().toISOString()
      })
      
      sharedAttendanceState.clockedIn.value = true
      sharedAttendanceState.onBreak.value = false
      sharedAttendanceState.clockInTime.value = response.data.clock_in_time || new Date().toISOString()
    }
    
    sharedAttendanceState.lastUpdate.value = new Date().toISOString()
    saveStateToStorage()
    broadcastStateChange()
    
  } catch (error) {
    console.error('Clock in/out failed:', error)
    throw error
  } finally {
    sharedAttendanceState.loading.value = false
  }
}

const toggleBreak = async () => {
  try {
    sharedAttendanceState.loading.value = true
    
    if (sharedAttendanceState.onBreak.value) {
      // End break
      const response = await window.axios.post('/api/attendance/break-end', {
        timestamp: new Date().toISOString()
      })
      
      // Calculate break duration and add to total
      if (sharedAttendanceState.breakStartTime.value) {
        const now = new Date()
        const breakStart = new Date(sharedAttendanceState.breakStartTime.value)
        const breakDurationMs = now - breakStart
        const breakDurationMinutes = Math.floor(breakDurationMs / (1000 * 60))
        
        // Add to break sessions
        sharedAttendanceState.breakSessions.value.push({
          start: sharedAttendanceState.breakStartTime.value,
          end: now.toISOString(),
          duration_minutes: breakDurationMinutes
        })
        
        // Update total break minutes
        sharedAttendanceState.totalBreakMinutes.value += breakDurationMinutes
      }
      
      sharedAttendanceState.onBreak.value = false
      sharedAttendanceState.breakStartTime.value = null
    } else {
      // Start break
      const response = await window.axios.post('/api/attendance/break-start', {
        timestamp: new Date().toISOString()
      })
      
      sharedAttendanceState.onBreak.value = true
      sharedAttendanceState.breakStartTime.value = response.data.break_start_time || new Date().toISOString()
    }
    
    sharedAttendanceState.lastUpdate.value = new Date().toISOString()
    saveStateToStorage()
    broadcastStateChange()
    
  } catch (error) {
    console.error('Break action failed:', error)
    throw error
  } finally {
    sharedAttendanceState.loading.value = false
  }
}

// Broadcast state changes to other components
const broadcastStateChange = () => {
  const event = new CustomEvent('attendance-state-changed', {
    detail: {
      clockedIn: sharedAttendanceState.clockedIn.value,
      onBreak: sharedAttendanceState.onBreak.value,
      clockInTime: sharedAttendanceState.clockInTime.value,
      breakStartTime: sharedAttendanceState.breakStartTime.value,
      totalBreakMinutes: sharedAttendanceState.totalBreakMinutes.value,
      breakSessions: sharedAttendanceState.breakSessions.value
    }
  })
  window.dispatchEvent(event)
  //console.log('📡 Broadcasted attendance state change')
}

// Watch for state changes and save to storage
watch([
  sharedAttendanceState.clockedIn,
  sharedAttendanceState.onBreak,
  sharedAttendanceState.totalBreakMinutes
], () => {
  saveStateToStorage()
}, { deep: true })

// Composable hook
export function useAttendanceSync() {
  return {
    // State
    ...sharedAttendanceState,
    
    // Computed
    ...sharedComputedState,
    
    // Actions
    fetchCurrentStatus,
    clockInOut,
    toggleBreak,
    loadStateFromStorage,
    saveStateToStorage,
    broadcastStateChange
  }
}