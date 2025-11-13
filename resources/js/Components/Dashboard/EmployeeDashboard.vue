<template>
  <div class="employee-dashboard">
    <!-- Time Tracking Section -->
    <div class="time-tracking-section">
      <!-- Combined Welcome & Clock Display -->
      <div class="welcome-clock-display">
        <div class="welcome-section">
          <h2 class="greeting-text">Welcome back, {{ employeeName }}! 👋</h2>
          <p class="greeting-subtitle">Ready to make today productive?</p>
        </div>
        <div class="clock-section">
          <div class="current-time">{{ currentTimeFormatted }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="work-status">
          <div class="status-indicator" :class="statusClasses">
            <div class="status-dot"></div>
            <span class="status-text">{{ statusText }}</span>
          </div>
        </div>
      </div>

      <!-- Time Progress Visualization -->
      <div class="time-progress-block">
        <!-- Work Duration Display -->
        <div class="duration-display">
          <div class="duration-item">
            <div class="duration-label">Work Time</div>
            <div class="duration-value" :class="{ 'text-gray-500': isOnBreak }">
              {{ workDuration }}
            </div>
          </div>
          <div class="duration-item">
            <div class="duration-label" :class="{ 'text-orange-600': isOnBreak }">
              {{ isOnBreak ? 'Current Break' : 'Total Breaks' }}
            </div>
            <div class="duration-value" :class="{ 'text-orange-600 font-bold': isOnBreak }">
              {{ isOnBreak ? breakDuration : totalBreakTime }}
            </div>
          </div>
          <div class="duration-item">
            <div class="duration-label">Progress</div>
            <div class="duration-value">{{ Math.round(workProgressPercentage) }}%</div>
          </div>
        </div>

        <!-- Horizontal Clock Timeline -->
        <div class="horizontal-clock-container">
          <!-- Time Markers -->
          <div class="time-markers">
            <div v-for="(marker, index) in timelineMarkers" :key="index" class="time-marker" :class="{
                'start-marker': index === 0,
                'end-marker': index === timelineMarkers.length - 1,
                'lunch-marker': marker.isLunch,
                'regular-marker': !marker.isLunch && index !== 0 && index !== timelineMarkers.length - 1
              }" :style="{ left: `${marker.position}%` }">
              <div class="marker-line"></div>
              <span class="marker-time">{{ marker.label }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="time-progress-bar">
            <div class="progress-bar-shimmer"></div>

            <!-- Current Time Position Indicator (always visible) -->
            <div class="current-time-position" :style="{ 
                left: `${currentTimePosition}%`
              }">
              <div class="time-position-dot"></div>
            </div>

            <!-- Pre-work time fill -->
            <div v-if="preWorkWidth > 0" class="pre-work-fill" :style="{ 
                width: `${preWorkWidth}%`,
                transition: 'width 0.5s ease-out'
              }"></div>

            <!-- Work progress fill -->
            <div v-if="isClockedIn && progressWidth > 0" class="work-progress-fill" :style="{ 
                left: `${progressStartPosition}%`,
                width: `${progressWidth}%`,
                transition: 'width 0.5s ease-out, left 0.5s ease-out'
              }">
              <!-- Current Time Indicator -->
              <div class="current-time-indicator" v-if="isClockedIn">
                <div class="time-dot"></div>
                <div class="time-tooltip">{{ currentTimeFormatted }}</div>
              </div>
            </div>

            <!-- Break time fills -->
            <div v-for="(breakFill, index) in breakTimeFills" :key="`break-${index}`" class="break-time-fill"
              :class="{ 'ongoing-break': breakFill.isOngoing }" :style="{ 
                left: `${breakFill.left}%`,
                width: `${breakFill.width}%`
              }"></div>
          </div>

          <!-- Progress Information -->
          <div class="time-progress-info">
            <div class="progress-left">
              <span class="progress-time">{{ currentTimeFormatted }}</span>
              <span class="progress-status" :class="progressStatusClasses">{{ statusText }}</span>
            </div>
            <div class="progress-right">
              <span class="progress-percentage">{{ progressLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview 
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <CalendarDaysIcon class="w-6 h-6 text-teal-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ Math.floor(stats.daysWithCompany || 0) }}</div>
          <div class="stat-label">Days with Company</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <ClockIcon class="w-6 h-6 text-green-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ workDuration }}</div>
          <div class="stat-label">Today's Work</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <ChartBarIcon class="w-6 h-6 text-purple-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.projectsContributed || 0 }}</div>
          <div class="stat-label">Projects</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <StarIcon class="w-6 h-6 text-yellow-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.performanceRank || 'N/A' }}</div>
          <div class="stat-label">Performance Rank</div>
        </div>
      </div>
    </div-->

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <button v-for="action in quickActions" :key="action.id" 
          @click="handleQuickAction(action)" 
          :class="['action-button', `action-${action.id}`]">
          <!-- My Assessments Icon - Purple -->
          <svg v-if="action.id === 'my-assessments'" class="w-6 h-6" fill="none" stroke="#8B5CF6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <!-- Work Reports Icon - Blue -->
          <svg v-else-if="action.id === 'work-reports'" class="w-6 h-6" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <!-- Leaderboard Icon - Gold -->
          <svg v-else-if="action.id === 'leaderboard'" class="w-6 h-6" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>{{ action.label }}</span>
        </button>
      </div>
    </div>

    <!-- Break Sessions Debug (Development) -->
    <div v-if="showDebug" class="debug-section">
      <h3 class="section-title">Break Sessions Debug</h3>
      <div class="debug-content">
        <div class="debug-item">
          <strong>Completed Break Sessions:</strong> {{ attendanceState.completedBreakSessions.length }}
        </div>
        <div class="debug-item">
          <strong>Current Break:</strong> {{ isOnBreak ? 'Yes' : 'No' }}
        </div>
        <div class="debug-item">
          <strong>Break Start Time:</strong> {{ attendanceState.breakStartTime || 'None' }}
        </div>
        <div class="debug-item">
          <strong>Current Break Duration:</strong> {{ breakDuration }}
        </div>
        <div class="debug-item">
          <strong>Total Break Time (Computed):</strong> {{ totalBreakTime }}
        </div>
        <div class="debug-item">
          <strong>Clocked In (Dashboard):</strong> {{ attendanceState.clockedIn }}
        </div>
        <div class="debug-item">
          <strong>isClockedIn Computed:</strong> {{ isClockedIn }}
        </div>
        <div class="debug-item">
          <strong>Work Progress %:</strong> {{ Math.round(workProgressPercentage) }}%
        </div>
        <div class="debug-item">
          <strong>Progress Width:</strong> {{ progressWidth }}%
        </div>
        <div class="debug-item">
          <strong>Clock In Time:</strong> {{ attendanceState.clockInTime || 'None' }}
        </div>
        <div class="debug-item">
          <strong>Break Sessions:</strong>
          <pre>{{ JSON.stringify(attendanceState.completedBreakSessions, null, 2) }}</pre>
        </div>
        <button @click="refreshFromFloatingWidget" class="debug-button">
          Refresh from FloatingWidget
        </button>
      </div>
    </div>

    <!-- Birthday Notifications -->
    <div class="birthday-section">
      <BirthdayNotifications 
        :todays-birthdays="birthdayNotifications.todaysBirthdays"
        :upcoming-birthdays="birthdayNotifications.upcomingBirthdays" 
        :stats="birthdayNotifications.stats" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import BirthdayNotifications from './BirthdayNotifications.vue';

// Import icons
import {
  ClockIcon,
  CalendarDaysIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      daysWithCompany: 0,
      projectsContributed: 0,
      performanceRank: 'N/A'
    })
  },
  currentAttendance: {
    type: Object,
    default: () => ({
      clocked_in: false,
      on_break: false,
      clock_in_time: null,
      current_break_start: null,
      todays_summary: {
        total_hours: '0h 0m',
        break_time: '0h 0m'
      }
    })
  },
  birthdayNotifications: {
    type: Object,
    default: () => ({
      todaysBirthdays: [],
      upcomingBirthdays: [],
      stats: {}
    })
  },
  employeeName: {
    type: String,
    default: 'Employee'
  }
});

const emit = defineEmits(['action']);

// Composables
const { user } = useAuth();

// Local state
const currentTime = ref(new Date());
const showDebug = ref(false); // Toggle debug section
const attendanceState = ref({
  clockedIn: false,
  onBreak: false,
  clockInTime: null,
  breakStartTime: null,
  workDuration: '0h 0m',
  breakDuration: '0h 0m',
  completedBreakSessions: [], // Track completed break sessions from FloatingWidget
  totalBreakTime: '0h 0m'
});

let timeInterval = null;

// Computed properties
const currentTimeFormatted = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
});

const currentDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const isClockedIn = computed(() => {
  return attendanceState.value.clockedIn;
});

const isOnBreak = computed(() => {
  return attendanceState.value.onBreak;
});

const statusText = computed(() => {
  // Check break status first, then clock-in status
  if (attendanceState.value.onBreak) return 'On Break';
  if (attendanceState.value.clockedIn) return 'Working';
  return 'Not Clocked In';
});

const statusClasses = computed(() => {
  if (attendanceState.value.onBreak) return 'status-break';
  if (attendanceState.value.clockedIn) return 'status-working';
  return 'status-out';
});

const workDuration = computed(() => {
  return attendanceState.value.workDuration;
});

const breakDuration = computed(() => {
  return attendanceState.value.breakDuration;
});

const totalBreakTime = computed(() => {
  let totalMinutes = 0;
  
  // Add completed break sessions
  if (attendanceState.value.completedBreakSessions) {
    attendanceState.value.completedBreakSessions.forEach(session => {
      if (session.start && session.end) {
        const start = new Date(session.start);
        const end = new Date(session.end);
        const diffMs = end - start;
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    });
  }
  
  // Add current break session if on break
  if (attendanceState.value.onBreak && attendanceState.value.breakStartTime) {
    const breakStart = new Date(attendanceState.value.breakStartTime);
    const now = currentTime.value;
    const diffMs = Math.max(0, now - breakStart);
    totalMinutes += Math.floor(diffMs / (1000 * 60));
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
});

const workdayStatus = computed(() => {
  const now = currentTime.value;
  const hour = now.getHours();
  
  // Extended work hours: 6 AM to 6 PM
  if (hour < 6) return 'before-work';
  if (hour >= 18) return 'after-work';
  return 'during-work';
});

// Timeline markers for the horizontal clock (Extended Work Day: 6 AM to 6 PM)
const timelineMarkers = computed(() => {
  const markers = [];
  
  // Extended work day: 6 AM to 6 PM (13 markers total)
  // Hours: 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  const workHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  workHours.forEach((hour, index) => {
    let label;
    let isLunch = false;
    
    // Format hour labels (short format without :00)
    if (hour === 0) {
      label = '12 AM';
    } else if (hour === 12) {
      label = '12 PM';
      isLunch = true; // Lunch break
    } else if (hour < 12) {
      label = `${hour} AM`;
    } else if (hour === 18) {
      label = '6 PM';
    } else {
      label = `${hour - 12} PM`;
    }
    
    // Mark lunch time and breaks
    if (hour === 12 || hour === 13) { // 12 PM - 1 PM lunch
      isLunch = true;
    }
    
    // Calculate position: spread evenly across 100% of timeline
    // 13 markers (0 to 12 index) = 12 intervals
    const position = (index / 12) * 100;
    
    markers.push({
      label,
      time: hour,
      isLunch,
      position
    });
  });
  
  return markers;
});

// Progress calculations
const workProgressPercentage = computed(() => {
  if (!isClockedIn.value || !attendanceState.value.clockInTime) {
    return 0;
  }

  const now = currentTime.value;
  const clockIn = new Date(attendanceState.value.clockInTime);

  if (now < clockIn) {
    return 0;
  }

  const workTimeElapsedMs = now.getTime() - clockIn.getTime();
  const workTimeElapsedHours = workTimeElapsedMs / (1000 * 60 * 60);
  const extendedWorkDayHours = 12; // Extended work day: 6 AM to 6 PM = 12 hours

  return Math.min((workTimeElapsedHours / extendedWorkDayHours) * 100, 100);
});

const preWorkWidth = computed(() => {
  // No pre-work fill for standard work day timeline
  return 0;
});

const progressStartPosition = computed(() => {
  if (!isClockedIn.value || !attendanceState.value.clockInTime) {
    return 0;
  }
  
  // Calculate where the employee clocked in on the timeline
  const clockIn = new Date(attendanceState.value.clockInTime);
  const clockInHour = clockIn.getHours();
  const clockInMinute = clockIn.getMinutes();
  
  // Extended work day timeline: 6 AM to 6 PM = 12 hours
  if (clockInHour < 6) {
    return 0; // Clocked in before 6 AM, start at beginning
  } else if (clockInHour >= 18) {
    return 100; // Clocked in after 6 PM, start at end
  } else {
    // Calculate position based on clock-in time
    const workHour = clockInHour - 6; // Convert to 0-12 range
    const workMinutes = workHour * 60 + clockInMinute;
    const totalWorkMinutes = 12 * 60; // 720 minutes
    
    return (workMinutes / totalWorkMinutes) * 100;
  }
});

const progressWidth = computed(() => {
  if (!isClockedIn.value || !attendanceState.value.clockInTime) return 0;
  
  // Calculate progress width based on actual work duration (not total elapsed time)
  const workDurationStr = attendanceState.value.workDuration || '0h 0m';
  
  // Parse work duration string (e.g., "2h 30m")
  const hoursMatch = workDurationStr.match(/(\d+)h/);
  const minutesMatch = workDurationStr.match(/(\d+)m/);
  
  const workHours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const workMinutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  
  const totalWorkMinutes = workHours * 60 + workMinutes;
  const totalWorkDayMinutes = 12 * 60; // 12-hour work day = 720 minutes
  
  // Calculate what percentage of the timeline this work duration represents
  const workPercentage = (totalWorkMinutes / totalWorkDayMinutes) * 100;
  
  return Math.min(workPercentage, 100);
});

const progressLabel = computed(() => {
  if (!isClockedIn.value) return 'Not Active';
  return `${Math.round(workProgressPercentage.value)}% Complete`;
});

// Current time position on the timeline (0-100%) for Extended Work Day (6 AM to 6 PM)
const currentTimePosition = computed(() => {
  const now = currentTime.value;
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Extended work day timeline: 6 AM to 6 PM = 12 hours
  // Timeline positions: 6 AM = 0%, 6 PM = 100%
  
  if (hour < 6) {
    // Before work hours - show at beginning
    return 0;
  } else if (hour >= 18) {
    // After work hours - show at end
    return 100;
  } else {
    // During work hours (6 AM to 6 PM)
    const workHour = hour - 6; // Convert to 0-12 range
    const workMinutes = workHour * 60 + minute;
    const totalWorkMinutes = 12 * 60; // 720 minutes
    
    return (workMinutes / totalWorkMinutes) * 100;
  }
});

const progressStatusClasses = computed(() => {
  if (isOnBreak.value) return 'bg-yellow-100 text-yellow-700';
  if (isClockedIn.value) return 'bg-green-100 text-green-700';
  
  switch (workdayStatus.value) {
    case 'before-work': return 'bg-gray-100 text-gray-600';
    case 'after-work': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
});

// Break time fills for visualization (Extended Work Day: 6 AM to 6 PM)
const breakTimeFills = computed(() => {
  const fills = [];
  
  // Helper function to convert time to work day timeline position
  const getWorkDayPosition = (hour, minute) => {
    if (hour < 6 || hour >= 18) {
      // Outside work hours - return null to skip
      return null;
    }
    
    const workHour = hour - 6; // Convert to 0-12 range
    const workMinutes = workHour * 60 + minute;
    const totalWorkMinutes = 12 * 60; // 720 minutes
    return (workMinutes / totalWorkMinutes) * 100;
  };
  
  // Add completed break sessions
  if (attendanceState.value.completedBreakSessions) {
    attendanceState.value.completedBreakSessions.forEach(session => {
      if (session.start && session.end) {
        const startTime = new Date(session.start);
        const endTime = new Date(session.end);
        
        const startPos = getWorkDayPosition(startTime.getHours(), startTime.getMinutes());
        const endPos = getWorkDayPosition(endTime.getHours(), endTime.getMinutes());
        
        if (startPos !== null && endPos !== null && endPos > startPos) {
          fills.push({
            left: startPos,
            width: endPos - startPos,
            isOngoing: false
          });
        }
      }
    });
  }
  
  // Add current break session if on break
  if (isOnBreak.value && attendanceState.value.breakStartTime) {
    const breakStart = new Date(attendanceState.value.breakStartTime);
    const now = currentTime.value;
    
    const startPos = getWorkDayPosition(breakStart.getHours(), breakStart.getMinutes());
    const currentPos = getWorkDayPosition(now.getHours(), now.getMinutes());
    
    if (startPos !== null && currentPos !== null && currentPos > startPos) {
      fills.push({
        left: startPos,
        width: currentPos - startPos,
        isOngoing: true
      });
    }
  }
  
  return fills;
});

const quickActions = computed(() => [
  {
    id: 'my-assessments',
    label: 'My Assessments',
    icon: DocumentTextIcon,
    route: 'competency-assessments.my-assessments'
  },
  {
    id: 'work-reports',
    label: 'Work Reports',
    icon: ChartBarIcon,
    route: 'work-reports.index'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: StarIcon,
    route: 'work-reports.leaderboard'
  }
]);

// Methods
const updateCurrentTime = () => {
  currentTime.value = new Date();
  updateDurations();
};

const updateDurations = () => {
  // Update work duration
  if (attendanceState.value.clockedIn && attendanceState.value.clockInTime) {
    const clockIn = new Date(attendanceState.value.clockInTime);
    const now = currentTime.value;
    const diffMs = now.getTime() - clockIn.getTime();
    
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      attendanceState.value.workDuration = `${hours}h ${minutes}m`;
    }
  } else if (!attendanceState.value.clockedIn) {
    // Reset work duration if not clocked in
    attendanceState.value.workDuration = '0h 0m';
  }
  
  // Update current break duration (for display purposes)
  if (attendanceState.value.onBreak && attendanceState.value.breakStartTime) {
    const breakStart = new Date(attendanceState.value.breakStartTime);
    const now = currentTime.value;
    const diffMs = now.getTime() - breakStart.getTime();
    
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      attendanceState.value.breakDuration = `${hours}h ${minutes}m ${seconds}s`;
    }
  } else if (!attendanceState.value.onBreak) {
    // Reset break duration if not on break
    attendanceState.value.breakDuration = '0h 0m';
  }
  
  // Debug logging for break sessions
  if (attendanceState.value.completedBreakSessions.length > 0) {
    console.log('🔍 Dashboard: Break sessions debug:', {
      completedSessions: attendanceState.value.completedBreakSessions.length,
      currentBreak: attendanceState.value.onBreak,
      breakStartTime: attendanceState.value.breakStartTime,
      currentBreakDuration: attendanceState.value.breakDuration,
      totalBreakTimeComputed: totalBreakTime.value
    });
  }
};

const handleQuickAction = (action) => {
  if (action.route) {
    window.location.href = route(action.route);
  }
  emit('action', action);
};

// Manual refresh from FloatingWidget (for debugging)
const refreshFromFloatingWidget = () => {
  console.log('🔄 Dashboard: Manual refresh requested');
  
  // First try to sync from localStorage
  const synced = syncWithFloatingWidget();
  
  // Always request fresh data from FloatingWidget
  console.log('📡 Dashboard: Requesting fresh data from FloatingWidget...');
  window.dispatchEvent(new CustomEvent('dashboard-requests-sync'));
  
  // Also try to get current status from API
  if (window.axios) {
    window.axios.get('/api/attendance/current')
      .then(response => {
        console.log('📡 Dashboard: Received fresh data from API:', response.data);
        
        // Update state with fresh API data
        attendanceState.value = {
          clockedIn: response.data.clocked_in || false,
          onBreak: response.data.on_break || false,
          clockInTime: response.data.clock_in_time || null,
          breakStartTime: response.data.current_break_start || null,
          workDuration: response.data.todays_summary?.total_hours || attendanceState.value.workDuration,
          breakDuration: '0h 0m',
          completedBreakSessions: response.data.break_sessions || [],
          totalBreakTime: response.data.todays_summary?.break_time || '0h 0m'
        };
        
        updateDurations();
        
        console.log('✅ Dashboard: Updated from API:', {
          clockedIn: attendanceState.value.clockedIn,
          isClockedInComputed: isClockedIn.value,
          workProgressPercentage: workProgressPercentage.value,
          progressWidth: progressWidth.value
        });
      })
      .catch(error => {
        console.error('❌ Dashboard: Failed to fetch from API:', error);
      });
  }
};

// Keyboard shortcut handler
const handleKeyDown = (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    showDebug.value = !showDebug.value;
    console.log('🐛 Dashboard: Debug mode', showDebug.value ? 'enabled' : 'disabled');
  }
};

const initializeAttendanceState = () => {
  attendanceState.value = {
    clockedIn: props.currentAttendance?.clocked_in || false,
    onBreak: props.currentAttendance?.on_break || false,
    clockInTime: props.currentAttendance?.clock_in_time || null,
    breakStartTime: props.currentAttendance?.current_break_start || null,
    workDuration: props.currentAttendance?.todays_summary?.total_hours || '0h 0m',
    breakDuration: '0h 0m',
    completedBreakSessions: props.currentAttendance?.break_sessions || [], // Use completedBreakSessions consistently
    totalBreakTime: props.currentAttendance?.todays_summary?.break_time || '0h 0m'
  };
  
  console.log('🔄 Dashboard: Initialized attendance state:', attendanceState.value);
};

// Sync with FloatingWidget state from localStorage
const syncWithFloatingWidget = () => {
  try {
    const stored = localStorage.getItem('floating-attendance-state');
    if (stored) {
      const state = JSON.parse(stored);
      
      // Only use stored state if it's recent (within 5 minutes)
      const lastUpdate = new Date(state.lastUpdate);
      const now = new Date();
      const diffMinutes = (now - lastUpdate) / (1000 * 60);
      
      if (diffMinutes < 5) {
        attendanceState.value = {
          clockedIn: state.clockedIn || false,
          onBreak: state.onBreak || false,
          clockInTime: state.clockInTime || null,
          breakStartTime: state.breakStartTime || null,
          workDuration: attendanceState.value.workDuration, // Keep existing duration
          breakDuration: attendanceState.value.breakDuration, // Keep existing duration
          completedBreakSessions: state.completedBreakSessions || state.break_sessions || [], // Support both property names
          totalBreakTime: attendanceState.value.totalBreakTime
        };
        
        updateDurations();
        
        console.log('🔄 Dashboard: Synced with FloatingWidget localStorage:', attendanceState.value);
        return true;
      }
    }
  } catch (error) {
    console.warn('Dashboard: Failed to sync with FloatingWidget localStorage:', error);
  }
  return false;
};

// Echo/Pusher event handlers
const handleAttendanceUpdate = (data) => {
  console.log('📡 Dashboard: Received attendance update via Echo:', data);
  
  attendanceState.value = {
    clockedIn: data.clocked_in || false,
    onBreak: data.on_break || false,
    clockInTime: data.clock_in_time || null,
    breakStartTime: data.current_break_start || null,
    workDuration: data.todays_summary?.total_hours || attendanceState.value.workDuration,
    breakDuration: '0h 0m',
    completedBreakSessions: data.break_sessions || [], // Use completedBreakSessions consistently
    totalBreakTime: data.todays_summary?.break_time || attendanceState.value.totalBreakTime
  };
  
  updateDurations();
};

// Fallback: Listen for attendance updates from FloatingWidget (legacy support)
const handleAttendanceStateChange = (event) => {
  console.log('📡 Dashboard: Received attendance state change (legacy):', event.detail);
  console.log('🔍 Dashboard: Current state before update:', {
    clockedIn: attendanceState.value.clockedIn,
    onBreak: attendanceState.value.onBreak,
    clockInTime: attendanceState.value.clockInTime
  });
  
  const { 
    clockedIn, 
    onBreak, 
    clockInTime, 
    breakStartTime: eventBreakStartTime,
    completedBreakSessions: eventCompletedBreaks,
    todaysHours,
    currentBreakTime,
    totalBreakTime,
    action
  } = event.detail;
  
  // Handle completed break sessions from FloatingWidget
  let updatedBreakSessions = attendanceState.value.completedBreakSessions || [];
  
  if (eventCompletedBreaks && Array.isArray(eventCompletedBreaks)) {
    // Use the completed breaks from the floating widget (most up-to-date)
    updatedBreakSessions = eventCompletedBreaks;
  } else if (action === 'end-break' && attendanceState.value.onBreak && attendanceState.value.breakStartTime) {
    // Fallback: save completed break session locally if not provided by floating widget
    const completedBreak = {
      start: attendanceState.value.breakStartTime,
      end: new Date().toISOString(),
      isOngoing: false
    };
    updatedBreakSessions = [...updatedBreakSessions, completedBreak];
    console.log('💾 Dashboard: Saved completed break session locally:', completedBreak);
  }
  
  attendanceState.value = {
    clockedIn: clockedIn || false,
    onBreak: onBreak || false,
    clockInTime: clockInTime || null,
    breakStartTime: eventBreakStartTime || null,
    workDuration: todaysHours || attendanceState.value.workDuration,
    breakDuration: currentBreakTime || '0h 0m',
    completedBreakSessions: updatedBreakSessions, // Use completedBreakSessions consistently
    totalBreakTime: totalBreakTime || attendanceState.value.totalBreakTime
  };
  
  updateDurations();
  
  console.log('✅ Dashboard: Updated attendance state from FloatingWidget:', {
    clockedIn: attendanceState.value.clockedIn,
    onBreak: attendanceState.value.onBreak,
    clockInTime: attendanceState.value.clockInTime,
    workDuration: attendanceState.value.workDuration,
    breakDuration: attendanceState.value.breakDuration,
    completedBreaks: attendanceState.value.completedBreakSessions.length,
    totalBreakTime: totalBreakTime,
    isClockedInComputed: isClockedIn.value,
    workProgressPercentage: workProgressPercentage.value,
    progressWidth: progressWidth.value
  });
};

// Initialize component
onMounted(async () => {
  // Initialize time and attendance state
  updateCurrentTime();
  initializeAttendanceState();
  
  // Try to sync with FloatingWidget state first
  const synced = syncWithFloatingWidget();
  if (synced) {
    console.log('✅ Dashboard: Successfully synced with FloatingWidget');
  } else {
    console.log('⚠️ Dashboard: No recent FloatingWidget data found');
  }
  
  // Log initial state for debugging
  console.log('🔍 Dashboard: Initial state after sync:', {
    clockedIn: attendanceState.value.clockedIn,
    onBreak: attendanceState.value.onBreak,
    clockInTime: attendanceState.value.clockInTime,
    isClockedInComputed: isClockedIn.value,
    workProgressPercentage: workProgressPercentage.value,
    progressWidth: progressWidth.value
  });
  
  // Start time update interval
  timeInterval = setInterval(() => {
    updateCurrentTime();
    
    // Periodic sync with FloatingWidget every 30 seconds
    if (currentTime.value.getSeconds() % 30 === 0) {
      syncWithFloatingWidget();
    }
  }, 1000);
  
  // Subscribe to Laravel Echo attendance updates
  if (window.Echo && user.value?.employee?.id) {
    const employeeId = user.value.employee.id;
    
    try {
      window.Echo.private(`attendance.${employeeId}`)
        .listen('.attendance.updated', handleAttendanceUpdate);
      
      console.log(`📡 Dashboard: Subscribed to Echo channel attendance.${employeeId}`);
    } catch (error) {
      console.error('Dashboard: Failed to subscribe to Echo channel:', error);
    }
  } else {
    console.warn('Dashboard: Echo not available or no employee ID');
  }
  
  // Listen for attendance updates from FloatingWidget (legacy support)
  window.addEventListener('attendance-state-changed', handleAttendanceStateChange);
  
  // Add keyboard shortcut to toggle debug mode (Ctrl+Shift+D)
  window.addEventListener('keydown', handleKeyDown);
  
  console.log('🚀 Dashboard: Initialized with Echo and legacy event listeners (Press Ctrl+Shift+D for debug)');
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  
  // Unsubscribe from Echo channels
  if (window.Echo && user.value?.employee?.id) {
    const employeeId = user.value.employee.id;
    try {
      window.Echo.leave(`attendance.${employeeId}`);
      console.log('📡 Dashboard: Unsubscribed from Echo channels');
    } catch (error) {
      console.warn('Dashboard: Error unsubscribing from Echo channels:', error);
    }
  }
  
  // Remove legacy event listener
  window.removeEventListener('attendance-state-changed', handleAttendanceStateChange);
  
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown);
  
  console.log('🔄 Dashboard: Cleanup completed');
});
</script>

<style scoped>
.employee-dashboard {
  @apply space-y-6;
}

/* Time Tracking Section */
.time-tracking-section {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden;
}

/* Combined Welcome & Clock Display */
.welcome-clock-display {
  @apply flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200;
}

.welcome-section {
  @apply flex flex-col justify-center;
}

.greeting-text {
  @apply text-2xl font-bold text-gray-900 leading-tight;
}

.greeting-subtitle {
  @apply text-sm text-gray-600 font-medium mt-1;
}

.clock-section {
  @apply flex flex-col justify-center text-right;
}

.current-time {
  @apply text-2xl font-bold text-gray-900 font-mono leading-tight;
}

.current-date {
  @apply text-sm text-gray-600 mt-1;
}

.clock-display {
  @apply flex flex-col;
}

.current-time {
  @apply text-3xl font-bold text-gray-900 font-mono;
}

.current-date {
  @apply text-sm text-gray-600 mt-1;
}

.work-status {
  @apply flex items-center;
}

/* Duration Display */
.duration-display {
  @apply grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-200;
}

.duration-item {
  @apply text-center;
}

.duration-label {
  @apply text-xs text-gray-500 uppercase tracking-wide font-medium mb-1;
}

.duration-value {
  @apply text-lg font-bold text-gray-900 font-mono;
}

/* Time Progress Block */
.time-progress-block {
  @apply p-4 bg-white;
}

/* Horizontal Clock Container */
.horizontal-clock-container {
  @apply relative;
}

/* Time Markers */
.time-markers {
  @apply relative mb-2 h-8;
}

.time-marker {
  @apply absolute flex flex-col items-center transform -translate-x-1/2;
}

.time-marker.start-marker .marker-time {
  @apply opacity-0;
}

.time-marker.end-marker .marker-time {
  @apply opacity-0;
}

.marker-line {
  @apply w-px h-4 bg-gray-300 mb-1;
}

.start-marker .marker-line {
  @apply bg-green-400;
}

.lunch-marker .marker-line {
  @apply bg-yellow-400;
}

.end-marker .marker-line {
  @apply bg-red-400;
}

.regular-marker .marker-line {
  @apply bg-gray-300;
}

.marker-time {
  @apply text-xs font-medium text-gray-600;
}

/* Enhanced Progress Bar */
.time-progress-bar {
  @apply w-full h-5 bg-gray-100 rounded-lg mb-3 relative overflow-hidden;
  border: 1px solid #e5e7eb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Pre-work time fill */
.pre-work-fill {
  @apply absolute top-0 left-0 h-full;
  background: linear-gradient(135deg, #fee2e2, #fca5a5, #f87171);
  z-index: 1;
}

/* Work progress fill */
.work-progress-fill {
  @apply absolute top-0 h-full;
  background: linear-gradient(135deg, #dcfce7, #86efac, #22c55e);
  z-index: 2;
}

/* Break time fill */
.break-time-fill {
  @apply absolute top-0 h-full;
  background: linear-gradient(135deg, #fed7aa, #fdba74, #fb923c);
  z-index: 3;
}

.break-time-fill.ongoing-break {
  background: linear-gradient(135deg, #fef3c7, #fde047, #eab308);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Current Time Position Indicator (always visible) */
.current-time-position {
  @apply absolute top-0 h-full transform -translate-x-1/2;
  z-index: 10;
}

.time-position-dot {
  @apply w-2 h-2 bg-teal-600 rounded-full shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
  animation: timePulse 2s infinite ease-in-out;
}

.time-position-dot::before {
  content: '';
  @apply absolute top-1/2 left-1/2 w-px h-full bg-teal-600 transform -translate-x-1/2 -translate-y-1/2;
  opacity: 0.3;
}

/* Current Time Indicator (for work progress) */
.current-time-indicator {
  @apply absolute top-0 right-0 transform translate-x-1/2 -translate-y-1;
}

.time-dot {
  @apply w-3 h-3 bg-teal-500 rounded-full shadow-lg;
  animation: timePulse 2s infinite ease-in-out;
}

.time-tooltip {
  @apply absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap;
}

@keyframes timePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes liveStreamPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes liveStreamRipple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes liveStreamRipple {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* Progress Information */
.time-progress-info {
  @apply flex justify-between items-center mt-2;
}

.progress-left {
  @apply flex items-center space-x-2;
}

.progress-time {
  @apply text-sm font-medium text-gray-700;
}

.progress-status {
  @apply text-xs font-medium px-2 py-1 rounded-full;
}

.progress-right {
  @apply text-sm font-medium text-gray-700;
}

.status-indicator {
  @apply flex items-center space-x-2 px-4 py-2 rounded-full;
}

.status-indicator.status-working {
  @apply bg-green-100 text-green-700;
}

.status-indicator.status-break {
  @apply bg-yellow-100 text-yellow-700;
}

.status-indicator.status-out {
  @apply bg-gray-100 text-gray-700;
}

.status-dot {
  @apply w-3 h-3 rounded-full;
}

.status-working .status-dot {
  @apply bg-green-500 relative;
  animation: liveStreamPulse 2s infinite ease-in-out;
}

.status-working .status-dot::before {
  content: '';
  @apply absolute inset-0 rounded-full bg-green-500;
  animation: liveStreamRipple 2s infinite ease-out;
}

.status-working .status-dot::after {
  content: '';
  @apply absolute inset-0 rounded-full bg-green-400;
  animation: liveStreamRipple 2s infinite ease-out 0.5s;
}

.status-break .status-dot {
  @apply bg-yellow-500;
}

.status-out .status-dot {
  @apply bg-gray-400;
}

.status-text {
  @apply text-sm font-medium;
}

.work-duration, .break-duration {
  @apply flex items-center space-x-2;
}

.duration-label {
  @apply text-sm text-gray-600;
}

.duration-value {
  @apply text-lg font-bold text-gray-900 font-mono;
}

/* Stats Overview */
.stats-overview {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center space-x-4;
}

.stat-icon {
  @apply flex-shrink-0;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-600 font-medium;
}

/* Quick Actions */
.quick-actions {
  @apply bg-white rounded-lg border border-gray-200 p-6 shadow-sm;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.actions-grid {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-4;
}

.action-button {
  @apply flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-lg;
}

.action-button span {
  @apply text-sm font-medium;
}

/* My Assessments - Purple Theme */
.action-my-assessments {
  @apply bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300;
}

.action-my-assessments span {
  @apply text-purple-700;
}

/* Work Reports - Blue Theme */
.action-work-reports {
  @apply bg-teal-50 border-teal-200 hover:bg-teal-100 hover:border-teal-300;
}

.action-work-reports span {
  @apply text-teal-700;
}

/* Leaderboard - Orange/Gold Theme */
.action-leaderboard {
  @apply bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300;
}

.action-leaderboard span {
  @apply text-orange-700;
}

/* Debug Section */
.debug-section {
  @apply bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm;
}

.debug-content {
  @apply space-y-2;
}

.debug-item {
  @apply text-sm;
}

.debug-item strong {
  @apply font-semibold text-gray-700;
}

.debug-item pre {
  @apply bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32;
}

.debug-button {
  @apply px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors;
}

/* Birthday Section */
.birthday-section {
  @apply space-y-4;
}

/* Responsive Design */
@media (max-width: 640px) {
  .real-time-clock {
    @apply flex-col space-y-4;
  }

  .duration-display {
    @apply grid-cols-2 gap-2;
  }

  .current-time {
    @apply text-2xl;
  }

  .time-markers {
    @apply hidden;
  }
  
  .stats-overview {
    @apply grid-cols-1;
  }
  
  .actions-grid {
    @apply grid-cols-1;
  }
}
</style>