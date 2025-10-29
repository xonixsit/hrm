<template>
  <div class="time-tracking-widget">
    <!-- Hero Time Display -->
    <div class="time-hero">
      <div class="current-time-display">
        <div class="time-section">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="status-section">
          <div :class="getStatusClasses()" class="work-status">
            <div class="status-indicator">
              <div class="status-dot"></div>
              <span class="status-text">{{ getStatusText() }}</span>
            </div>
            <div class="work-duration">{{ getWorkDuration() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- Primary Clock Action -->
      <button
        @click="$emit('clock-in-out')"
        :disabled="loading"
        :class="getPrimaryButtonClasses()"
        class="primary-action-button"
      >
        <component :is="getPrimaryButtonIcon()" class="w-5 h-5" />
        <span class="button-text">{{ getPrimaryButtonText() }}</span>
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </button>

      <!-- Break Actions -->
      <div class="break-actions">
        <button
          v-if="isClockedIn && !isOnBreak"
          @click="$emit('take-break')"
          :disabled="loading"
          class="break-button"
        >
          <PauseIcon class="w-4 h-4" />
          Take Break
        </button>
        
        <button
          v-if="isClockedIn && isOnBreak"
          @click="$emit('end-break')"
          :disabled="loading"
          class="end-break-button"
        >
          <PlayIcon class="w-4 h-4" />
          End Break
        </button>
      </div>
    </div>

    <!-- Today's Summary -->
    <div class="todays-summary">
      <h4 class="summary-title">Today's Summary</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-icon">
            <ClockIcon class="w-4 h-4 text-blue-600" />
          </div>
          <div class="summary-content">
            <span class="summary-label">Total Hours</span>
            <span class="summary-value">{{ todaysSummary.total_hours }}</span>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <PauseIcon class="w-4 h-4 text-yellow-600" />
          </div>
          <div class="summary-content">
            <span class="summary-label">Break Time</span>
            <span class="summary-value">{{ todaysSummary.break_time }}</span>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <ArrowRightCircleIcon class="w-4 h-4 text-green-600" />
          </div>
          <div class="summary-content">
            <span class="summary-label">Sessions</span>
            <span class="summary-value">{{ todaysSummary.sessions }}</span>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <CalendarIcon class="w-4 h-4 text-purple-600" />
          </div>
          <div class="summary-content">
            <span class="summary-label">Clock-ins</span>
            <span class="summary-value">{{ todaysSummary.clock_ins }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Stats -->
    <div class="weekly-stats">
      <h4 class="stats-title">This Week</h4>
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">Weekly Hours:</span>
          <span class="stat-value">{{ weeklyStats.weekly_hours }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Daily Average:</span>
          <span class="stat-value">{{ weeklyStats.average_daily }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowRightCircleIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
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
      stats: {
        weekly_hours: '0h 0m',
        monthly_hours: '0h 0m',
        average_daily: '0h 0m'
      }
    })
  },
  clockedIn: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default'
  }
});

defineEmits(['clock-in-out', 'take-break', 'end-break']);

// Real-time clock
const currentTime = ref('');
const currentDate = ref('');
let timeInterval = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Computed properties
const isClockedIn = computed(() => (props.currentAttendance && props.currentAttendance.clocked_in) || props.clockedIn);
const isOnBreak = computed(() => props.currentAttendance && props.currentAttendance.on_break);
const todaysSummary = computed(() => props.currentAttendance.todays_summary || {});
const weeklyStats = computed(() => props.currentAttendance.stats || {});

// Status helpers
const getStatusClasses = () => {
  if (isOnBreak.value) return 'status-break';
  if (isClockedIn.value) return 'status-working';
  return 'status-offline';
};

const getStatusText = () => {
  if (isOnBreak.value) return 'On Break';
  if (isClockedIn.value) return 'Working';
  return 'Offline';
};

const getWorkDuration = () => {
  if (!isClockedIn.value) return '0h 0m';
  
  if (props.currentAttendance.clock_in_time) {
    const clockInTime = new Date(props.currentAttendance.clock_in_time);
    const now = new Date();
    const diffMs = now - clockInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
  
  return todaysSummary.value.total_hours || '0h 0m';
};

// Button helpers
const getPrimaryButtonClasses = () => {
  const baseClasses = 'relative overflow-hidden transition-all duration-200';
  if (isClockedIn.value) {
    return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
  }
  return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
};

const getPrimaryButtonIcon = () => {
  if (isClockedIn.value) return StopIcon;
  return PlayIcon;
};

const getPrimaryButtonText = () => {
  if (isClockedIn.value) return 'Clock Out';
  return 'Clock In';
};
</script>

<style scoped>
.time-tracking-widget {
  @apply bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 space-y-8;
  @apply border border-blue-200 shadow-lg;
}

/* Hero Time Display */
.time-hero {
  @apply text-center;
}

.current-time-display {
  @apply space-y-4;
}

.time-section {
  @apply space-y-2;
}

.current-time {
  @apply text-4xl md:text-5xl font-bold text-gray-900;
  font-variant-numeric: tabular-nums;
}

.current-date {
  @apply text-lg text-gray-600 font-medium;
}

.status-section {
  @apply flex justify-center;
}

.work-status {
  @apply inline-flex flex-col items-center space-y-2 px-6 py-3 rounded-xl;
}

.status-indicator {
  @apply flex items-center space-x-2;
}

.status-dot {
  @apply w-3 h-3 rounded-full;
}

.status-text {
  @apply text-sm font-semibold uppercase tracking-wide;
}

.work-duration {
  @apply text-2xl font-bold;
}

/* Status Variants */
.status-working {
  @apply bg-green-100 text-green-800;
}

.status-working .status-dot {
  @apply bg-green-500 animate-pulse;
}

.status-break {
  @apply bg-yellow-100 text-yellow-800;
}

.status-break .status-dot {
  @apply bg-yellow-500 animate-pulse;
}

.status-offline {
  @apply bg-gray-100 text-gray-600;
}

.status-offline .status-dot {
  @apply bg-gray-400;
}

/* Action Buttons */
.action-buttons {
  @apply flex flex-col items-center space-y-4;
}

.primary-action-button {
  @apply flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg;
  @apply shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  min-width: 200px;
}

.primary-action-button:focus {
  @apply ring-blue-500;
}

.button-text {
  @apply relative z-10;
}

.loading-spinner {
  @apply absolute inset-0 flex items-center justify-center;
}

.spinner {
  @apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
}

.break-actions {
  @apply flex space-x-3;
}

.break-button,
.end-break-button {
  @apply flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm;
  @apply transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.break-button {
  @apply bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500;
}

.end-break-button {
  @apply bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500;
}

/* Today's Summary */
.todays-summary {
  @apply bg-white rounded-xl p-6 space-y-4;
}

.summary-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.summary-grid {
  @apply grid grid-cols-2 gap-4;
}

.summary-item {
  @apply flex items-center space-x-3 p-3 bg-gray-50 rounded-lg;
}

.summary-icon {
  @apply flex items-center justify-center w-8 h-8 bg-white rounded-lg;
}

.summary-content {
  @apply flex-1 min-w-0;
}

.summary-label {
  @apply block text-xs font-medium text-gray-600 uppercase tracking-wide;
}

.summary-value {
  @apply block text-sm font-bold text-gray-900;
}

/* Weekly Stats */
.weekly-stats {
  @apply bg-white rounded-xl p-6;
}

.stats-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.stats-content {
  @apply space-y-3;
}

.stat-item {
  @apply flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0;
}

.stat-label {
  @apply text-sm font-medium text-gray-600;
}

.stat-value {
  @apply text-sm font-bold text-gray-900;
}

/* Responsive Design */
@media (max-width: 640px) {
  .time-tracking-widget {
    @apply p-6 space-y-6;
  }
  
  .current-time {
    @apply text-3xl;
  }
  
  .primary-action-button {
    @apply px-6 py-3 text-base;
    min-width: 160px;
  }
  
  .summary-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .break-actions {
    @apply flex-col space-y-2 space-x-0;
  }
}
</style>