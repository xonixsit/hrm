<template>
  <div class="employee-dashboard">
    <!-- Motivational Message Block -->
    <div class="motivation-block">
      <div class="motivation-content">
        <p class="motivation-text">
          <BoltIcon class="w-5 h-5 inline-block mr-2 text-yellow-500" />
          Ready to tackle today's challenges?
        </p>
      </div>
      <div class="quick-clock-actions">
        <button
          @click="handleClockInOut"
          :disabled="loading"
          :class="clockButtonClasses"
        >
          <ClockIcon class="w-4 h-4" />
          {{ clockButtonText }}
        </button>
        <button
          v-if="isCurrentlyClockedIn && !currentAttendance.on_break"
          @click="handleTakeBreak"
          :disabled="loading"
          class="break-button"
        >
          <PauseIcon class="w-4 h-4" />
          Take Break
        </button>
        <button
          v-if="isCurrentlyClockedIn && currentAttendance.on_break"
          @click="handleEndBreak"
          :disabled="loading"
          class="end-break-button"
        >
          <PlayIcon class="w-4 h-4" />
          End Break
        </button>
      </div>
    </div>

    <!-- Time Progress Block -->
    <div class="time-progress-block">
      <!-- Horizontal Clock Timeline -->
      <div class="horizontal-clock-container">
        <!-- Time Markers - Dynamic based on clock-in time -->
        <div class="time-markers">
          <div 
            v-for="(marker, index) in timelineMarkers" 
            :key="index"
            class="time-marker"
            :class="{
              'start-marker': index === 0,
              'end-marker': index === timelineMarkers.length - 1,
              'lunch-marker': marker.isLunch,
              'regular-marker': !marker.isLunch && index !== 0 && index !== timelineMarkers.length - 1
            }"
          >
            <div class="marker-line"></div>
            <span class="marker-time">{{ marker.label }}</span>
          </div>
        </div>
        
        <!-- Progress Bar with Clock Visual -->
        <div class="time-progress-bar">
          <!-- Background shimmer for entire bar -->
          <div class="progress-bar-shimmer"></div>
          
          <!-- Pre-work time fill (before clock-in) -->
          <div 
            v-if="isCurrentlyClockedIn && preWorkWidth > 0"
            class="pre-work-fill"
            :style="{ 
              left: '0%',
              width: `${preWorkWidth}%`,
              transition: 'width 0.5s ease-out'
            }"
          ></div>
          
          <!-- Break time fills (for each break session) -->
          <div 
            v-for="(breakSession, index) in breakTimeFills" 
            :key="`break-${index}`"
            v-if="isCurrentlyClockedIn && breakSession.width > 0"
            class="break-time-fill"
            :style="{ 
              left: `${breakSession.left}%`,
              width: `${breakSession.width}%`,
              transition: 'width 0.5s ease-out, left 0.5s ease-out'
            }"
          ></div>

          <!-- Actual work progress fill (from clock-in to current time) -->
          <div 
            v-if="isCurrentlyClockedIn && progressWidth > 0"
            class="work-progress-fill"
            :style="{ 
              left: `${progressStartPosition}%`,
              width: `${progressWidth}%`,
              transition: 'width 0.5s ease-out, left 0.5s ease-out'
            }"
          >
            <!-- Active shimmer on filled portion -->
            <div class="work-shimmer" v-if="workdayStatus === 'during-work' && !currentAttendance.on_break"></div>
            
            <!-- Current Time Indicator -->
            <div class="current-time-indicator" v-if="workdayStatus === 'during-work'">
              <div class="time-dot"></div>
              <div class="time-tooltip">{{ currentTimeFormatted }}</div>
            </div>
          </div>
        </div>
        
        <!-- Progress Information -->
        <div class="time-progress-info">
          <div class="progress-left">
            <span class="progress-time">{{ currentTimeFormatted }}</span>
            <span class="progress-status" :class="getStatusClasses()">{{ workdayStatusText }}</span>
          </div>
          <div class="progress-right">
            <span class="progress-percentage">{{ progressLabel }}</span>
          </div>
        </div>
      </div>
    </div>



    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Personal Activity Timeline -->
        

        <!-- Today's Schedule -->
        <DashboardWidget
          title="Today's Schedule"
          :loading="loading"
          class="todays-schedule"
        >
          <template #actions>
            <button
              @click="viewFullCalendar"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              View Calendar
            </button>
          </template>

          <div v-if="todaysSchedule.length === 0" class="empty-state">
            <CalendarIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">No scheduled events for today</p>
          </div>

          <div v-else class="schedule-list">
            <div
              v-for="event in todaysSchedule"
              :key="event.id"
              class="schedule-item"
            >
              <div class="schedule-time">
                <span class="time-start">{{ formatTime(event.start_time) }}</span>
                <span class="time-separator">-</span>
                <span class="time-end">{{ formatTime(event.end_time) }}</span>
              </div>
              <div class="schedule-content">
                <h4 class="schedule-title">{{ event.title }}</h4>
                <p v-if="event.description" class="schedule-description">
                  {{ event.description }}
                </p>
                <div class="schedule-meta">
                  <span v-if="event.location" class="schedule-location">
                    <MapPinIcon class="w-4 h-4" />
                    {{ event.location }}
                  </span>
                  <span v-if="event.attendees" class="schedule-attendees">
                    <UsersIcon class="w-4 h-4" />
                    {{ event.attendees.length }} attendees
                  </span>
                </div>
              </div>
              <div class="schedule-actions">
                <button
                  @click="joinMeeting(event)"
                  v-if="event.meeting_link"
                  class="join-button"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </DashboardWidget>

        <!-- Recent Feedback -->
        <DashboardWidget
          title="Recent Feedback"
          :loading="loading"
          class="recent-feedback"
        >
          <div v-if="recentFeedback.length === 0" class="empty-state">
            <ChatBubbleLeftIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">No recent feedback</p>
          </div>

          <div v-else class="feedback-list">
            <div
              v-for="feedback in recentFeedback.slice(0, 3)"
              :key="feedback.id"
              class="feedback-item"
            >
              <div class="feedback-header">
                <div class="feedback-from">
                  <span class="feedback-author">{{ feedback.from.name }}</span>
                  <span class="feedback-role">{{ feedback.from.role }}</span>
                </div>
                <div class="feedback-rating">
                  <div class="rating-stars">
                    <StarIcon
                      v-for="star in 5"
                      :key="star"
                      :class="[
                        'w-4 h-4',
                        star <= feedback.rating ? 'text-warning-400 fill-current' : 'text-neutral-300'
                      ]"
                    />
                  </div>
                </div>
              </div>
              <p class="feedback-comment">{{ feedback.comment }}</p>
              <span class="feedback-date">{{ formatRelativeTime(feedback.created_at) }}</span>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Employee Quick Actions -->
        <QuickActions
          :actions="employeeQuickActions"
          title="Quick Actions"
          :max-visible="6"
          @action="handleQuickAction"
        />

        <!-- My Tasks -->
        

        
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import DashboardWidget from './DashboardWidget.vue';
import StatsCard from './StatsCard.vue';
import ActivityTimeline from './ActivityTimeline.vue';
import QuickActions from './QuickActions.vue';

// Import icons
import {
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  PlusIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  PauseIcon,
  PlayIcon,
  BoltIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      hoursToday: 0,
      tasksCompleted: 0,
      leaveBalance: 0,
      upcomingDeadlines: 0,
      taskTrend: 0
    })
  },
  personalActivities: {
    type: Array,
    default: () => []
  },
  todaysSchedule: {
    type: Array,
    default: () => []
  },
  myTasks: {
    type: Array,
    default: () => []
  },
  recentFeedback: {
    type: Array,
    default: () => []
  },
  clockedIn: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
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
});

const emit = defineEmits(['clock-in-out', 'toggle-task', 'action', 'view-task']);

// Composables
const { user } = useAuth();

// Local state
const activeTaskFilter = ref('all');
const clockingInOut = ref(false);
const currentTime = ref(new Date());
let timeInterval = null;

// Computed properties
const isCurrentlyClockedIn = computed(() => {
  // Check both clockedIn prop and currentAttendance.clocked_in for consistency
  return props.clockedIn || props.currentAttendance.clocked_in;
});

const clockButtonText = computed(() => {
  if (clockingInOut.value) return 'Processing...';
  return isCurrentlyClockedIn.value ? 'Clock Out' : 'Clock In';
});

const clockButtonClasses = computed(() => [
  'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  isCurrentlyClockedIn.value
    ? 'text-white bg-error-600 border border-error-600 hover:bg-error-700 focus:ring-error-500'
    : 'text-white bg-success-600 border border-success-600 hover:bg-success-700 focus:ring-success-500'
]);

// Real-time progress bar computed properties
const currentTimeFormatted = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
});

// Workday progress calculation (progress within fixed timeline starting from clock-in time)
const workdayProgressPercentage = computed(() => {
  // Only show progress if user is actually clocked in
  if (!isCurrentlyClockedIn.value) {
    return 0;
  }
  
  // Get the actual clock-in time from attendance data
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 0;
  }
  
  const now = currentTime.value;
  
  // Fixed timeline: 8 AM to 5 PM (9 hours total)
  const timelineStart = new Date(now);
  timelineStart.setHours(8, 0, 0, 0); // 8:00 AM
  
  const timelineEnd = new Date(now);
  timelineEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  const actualClockIn = new Date(clockInTime);
  const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
  
  // Calculate the clock-in position as a percentage of the timeline
  const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
  const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);
  
  // If current time is before clock-in time, show progress only up to clock-in position
  if (now < actualClockIn) {
    return Math.min(100, clockInPositionPercent);
  }
  
  // Calculate current position as percentage of timeline
  const currentPositionMs = now.getTime() - timelineStart.getTime();
  const currentPositionPercent = Math.min(100, Math.max(0, (currentPositionMs / totalTimelineMs) * 100));
  
  // Return the current position (progress fills from timeline start to current time)
  // The visual effect will show progress from clock-in position to current position
  return currentPositionPercent;
});

const workdayStatus = computed(() => {
  // If not clocked in, show before-work status
  if (!isCurrentlyClockedIn.value) {
    return 'before-work';
  }
  
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 'before-work';
  }
  
  const now = currentTime.value;
  const workdayStart = new Date(clockInTime); // Use actual clock-in time
  const standardWorkHours = 8; // 8-hour workday
  const workdayEnd = new Date(workdayStart.getTime() + (standardWorkHours * 60 * 60 * 1000)); // 8 hours after clock-in
  
  if (now < workdayStart) {
    return 'before-work';
  } else if (now > workdayEnd) {
    return 'after-work';
  } else {
    return 'during-work';
  }
});

// Actual work progress percentage (based on 8-hour workday)
const actualWorkProgressPercentage = computed(() => {
  // Only calculate if user is actually clocked in
  if (!isCurrentlyClockedIn.value) {
    return 0;
  }
  
  // Get the actual clock-in time from attendance data
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 0;
  }
  
  const now = currentTime.value;
  const actualClockIn = new Date(clockInTime);
  
  // If current time is before clock-in time, show 0%
  if (now < actualClockIn) {
    return 0;
  }
  
  // Calculate actual work time elapsed
  const workTimeElapsedMs = now.getTime() - actualClockIn.getTime();
  const workTimeElapsedHours = workTimeElapsedMs / (1000 * 60 * 60);
  
  // Standard 8-hour workday
  const standardWorkHours = 8;
  
  // Calculate percentage of standard workday completed
  const percentage = (workTimeElapsedHours / standardWorkHours) * 100;
  
  return Math.min(100, Math.max(0, percentage));
});

const progressLabel = computed(() => {
  const percentage = Math.round(actualWorkProgressPercentage.value);
  
  switch (workdayStatus.value) {
    case 'before-work':
      if (!isCurrentlyClockedIn.value) {
        return 'Ready to clock in';
      }
      return 'Work session starting';
    case 'after-work':
      return 'Workday complete!';
    case 'during-work':
      return `${percentage}% of workday`;
    default:
      return `${percentage}% of workday`;
  }
});

const workdayStatusText = computed(() => {
  switch (workdayStatus.value) {
    case 'before-work':
      return 'Pre-work';
    case 'after-work':
      return 'Complete';
    case 'during-work':
      return 'Active';
    default:
      return 'Active';
  }
});

// Fixed timeline markers (always show 8 AM to 5 PM)
const timelineMarkers = computed(() => {
  return [
    { label: '8 AM', isLunch: false },
    { label: '9', isLunch: false },
    { label: '10', isLunch: false },
    { label: '11', isLunch: false },
    { label: '12 PM', isLunch: true },
    { label: '1', isLunch: false },
    { label: '2', isLunch: false },
    { label: '3', isLunch: false },
    { label: '4', isLunch: false },
    { label: '5 PM', isLunch: false }
  ];
});

// Progress bar positioning (start position and width)
const progressStartPosition = computed(() => {
  // Only show progress if user is actually clocked in
  if (!isCurrentlyClockedIn.value) {
    return 0;
  }
  
  // Get the actual clock-in time from attendance data
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 0;
  }
  
  const now = currentTime.value;
  
  // Fixed timeline: 8 AM to 5 PM (9 hours total)
  const timelineStart = new Date(now);
  timelineStart.setHours(8, 0, 0, 0); // 8:00 AM
  
  const timelineEnd = new Date(now);
  timelineEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  const actualClockIn = new Date(clockInTime);
  const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
  
  // Calculate the clock-in position as a percentage of the timeline
  const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
  const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);
  
  return Math.min(100, clockInPositionPercent);
});

const progressWidth = computed(() => {
  // Only show progress if user is actually clocked in
  if (!isCurrentlyClockedIn.value) {
    return 0;
  }
  
  // Get the actual clock-in time from attendance data
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 0;
  }
  
  const now = currentTime.value;
  
  // Fixed timeline: 8 AM to 5 PM (9 hours total)
  const timelineStart = new Date(now);
  timelineStart.setHours(8, 0, 0, 0); // 8:00 AM
  
  const timelineEnd = new Date(now);
  timelineEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  const actualClockIn = new Date(clockInTime);
  const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
  
  // If current time is before clock-in time, show no progress width
  if (now < actualClockIn) {
    return 0;
  }
  
  // Calculate current position and clock-in position as percentages
  const currentPositionMs = now.getTime() - timelineStart.getTime();
  const currentPositionPercent = Math.min(100, Math.max(0, (currentPositionMs / totalTimelineMs) * 100));
  
  const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
  const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);
  
  // Width is the difference between current position and clock-in position
  const width = currentPositionPercent - clockInPositionPercent;
  
  return Math.max(0, width);
});

// Pre-work time width (from timeline start to clock-in time)
const preWorkWidth = computed(() => {
  // Only show if user is clocked in
  if (!isCurrentlyClockedIn.value) {
    return 0;
  }
  
  // Get the actual clock-in time from attendance data
  const clockInTime = props.currentAttendance.clock_in_time;
  if (!clockInTime) {
    return 0;
  }
  
  const now = currentTime.value;
  
  // Fixed timeline: 8 AM to 5 PM (9 hours total)
  const timelineStart = new Date(now);
  timelineStart.setHours(8, 0, 0, 0); // 8:00 AM
  
  const timelineEnd = new Date(now);
  timelineEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  const actualClockIn = new Date(clockInTime);
  const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
  
  // Calculate the clock-in position as a percentage of the timeline
  const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
  const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);
  
  // Pre-work width is from 0% to clock-in position
  return Math.min(100, clockInPositionPercent);
});

// Break time fills (for each break session)
const breakTimeFills = computed(() => {
  // Only show if user is clocked in
  if (!isCurrentlyClockedIn.value) {
    return [];
  }
  
  // Get break sessions from attendance data
  const breakSessions = props.currentAttendance.break_sessions || [];
  if (breakSessions.length === 0) {
    return [];
  }
  
  const now = currentTime.value;
  
  // Fixed timeline: 8 AM to 5 PM (9 hours total)
  const timelineStart = new Date(now);
  timelineStart.setHours(8, 0, 0, 0); // 8:00 AM
  
  const timelineEnd = new Date(now);
  timelineEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
  
  return breakSessions.map((session, index) => {
    const breakStart = new Date(session.start);
    const breakEnd = session.end ? new Date(session.end) : now; // Use current time if break is ongoing
    
    // Calculate positions as percentages of the timeline
    const breakStartMs = breakStart.getTime() - timelineStart.getTime();
    const breakEndMs = breakEnd.getTime() - timelineStart.getTime();
    
    const leftPercent = Math.max(0, (breakStartMs / totalTimelineMs) * 100);
    const rightPercent = Math.min(100, (breakEndMs / totalTimelineMs) * 100);
    const widthPercent = Math.max(0, rightPercent - leftPercent);
    
    return {
      left: leftPercent,
      width: widthPercent,
      isOngoing: !session.end // Track if this break is currently ongoing
    };
  }).filter(session => session.width > 0); // Only return visible sessions
});



// Methods for status styling
const getStatusClasses = () => {
  const baseClasses = 'text-xs font-medium px-2 py-1 rounded-full';
  
  switch (workdayStatus.value) {
    case 'before-work':
      return `${baseClasses} bg-neutral-100 text-neutral-600`;
    case 'after-work':
      return `${baseClasses} bg-success-100 text-success-700`;
    case 'during-work':
      return `${baseClasses} bg-primary-100 text-primary-700`;
    default:
      return `${baseClasses} bg-primary-100 text-primary-700`;
  }
};

const employeeQuickActions = computed(() => [
  {
    id: 'request-leave',
    label: 'Request Leave',
    description: 'Submit a new leave request',
    icon: CalendarIcon,
    variant: 'primary',
    route: 'leaves.create'
  },
  {
    id: 'update-profile',
    label: 'Update Profile',
    description: 'Manage your personal information',
    icon: UserIcon,
    variant: 'secondary',
    route: 'profile.edit'
  },
  {
    id: 'view-performance',
    label: 'Performance',
    description: 'View your performance metrics',
    icon: ChartBarIcon,
    variant: 'success',
    route: 'performance.index'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Customize your workspace',
    icon: CogIcon,
    variant: 'secondary',
    route: 'preferences.index'
  }
]);

const taskFilters = computed(() => [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' }
]);

const filteredTasks = computed(() => {
  if (activeTaskFilter.value === 'all') return props.myTasks;
  
  return props.myTasks.filter(task => {
    switch (activeTaskFilter.value) {
      case 'pending':
        return !task.completed && task.status === 'pending';
      case 'in-progress':
        return !task.completed && task.status === 'in-progress';
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });
});

// Methods

const handleTimelineAction = (data) => {
  emit('action', { type: 'timeline', data });
};

const handleQuickAction = (action) => {
  emit('action', { type: 'quick-action', data: action });
};

const viewFullCalendar = () => {
  emit('action', { type: 'view-calendar' });
};

const joinMeeting = (event) => {
  if (event.meeting_link) {
    window.open(event.meeting_link, '_blank');
  }
};

const setTaskFilter = (filter) => {
  activeTaskFilter.value = filter;
};

const getTaskFilterClasses = (filter) => {
  const baseClasses = 'px-3 py-1 text-xs font-medium rounded-full transition-colors';
  const isActive = activeTaskFilter.value === filter;
  
  return [
    baseClasses,
    isActive
      ? 'bg-primary-100 text-primary-700'
      : 'text-neutral-600 hover:bg-neutral-100'
  ];
};

const toggleTaskCompletion = (task) => {
  emit('toggle-task', task);
};

const viewTaskDetails = (task) => {
  emit('view-task', task);
};

const viewAllTasks = () => {
  emit('action', { type: 'view-all-tasks' });
};

const getPriorityClasses = (priority) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const priorityStyles = {
    high: 'bg-error-100 text-error-800',
    medium: 'bg-warning-100 text-warning-800',
    low: 'bg-success-100 text-success-800',
    default: 'bg-neutral-100 text-neutral-800'
  };
  
  return `${baseClasses} ${priorityStyles[priority] || priorityStyles.default}`;
};

const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffInMinutes = Math.floor((target - now) / (1000 * 60));
  
  if (diffInMinutes < 0) {
    const pastMinutes = Math.abs(diffInMinutes);
    if (pastMinutes < 60) return `${pastMinutes}m ago`;
    
    const pastHours = Math.floor(pastMinutes / 60);
    if (pastHours < 24) return `${pastHours}h ago`;
    
    const pastDays = Math.floor(pastHours / 24);
    return `${pastDays}d ago`;
  }
  
  if (diffInMinutes < 60) return `in ${diffInMinutes}m`;
  
  const hours = Math.floor(diffInMinutes / 60);
  if (hours < 24) return `in ${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
};

// Clock In/Out and Break Methods
const handleClockInOut = async () => {
  clockingInOut.value = true;
  try {
    emit('clock-in-out');
  } finally {
    clockingInOut.value = false;
  }
};

const handleTakeBreak = async () => {
  try {
    emit('action', { type: 'take-break' });
  } catch (error) {
    console.error('Take break failed:', error);
  }
};

const handleEndBreak = async () => {
  try {
    emit('action', { type: 'end-break' });
  } catch (error) {
    console.error('End break failed:', error);
  }
};



onMounted(() => {
  // Initialize dashboard data if needed
  // Start real-time clock update with more frequent updates for smoother progress
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 500); // Update every 500ms for smoother real-time feel
});

onUnmounted(() => {
  // Clean up interval when component is destroyed
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.employee-dashboard {
  @apply space-y-8;
}

/* Motivational Message Block - HCI Principle: Clear Visual Hierarchy */
.motivation-block {
  @apply flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 mb-4;
}

.motivation-content {
  @apply flex-1;
}

.motivation-text {
  @apply text-lg font-medium text-primary-900;
}

.quick-clock-actions {
  @apply flex items-center space-x-3;
}

/* Time Progress Block - HCI Principle: Focused Information Display */
.time-progress-block {
  @apply p-4 bg-white rounded-lg border border-neutral-200 mb-8 shadow-sm;
}

/* Horizontal Clock Container */
.horizontal-clock-container {
  @apply relative;
}

/* Time Markers - Visual Clock Indicators */
.time-markers {
  @apply flex justify-between items-center mb-2 relative;
}

.time-marker {
  @apply flex flex-col items-center;
}

.marker-line {
  @apply w-px h-4 bg-neutral-300 mb-1;
}

.start-marker .marker-line {
  @apply bg-success-400;
}

.lunch-marker .marker-line {
  @apply bg-warning-400;
}

.end-marker .marker-line {
  @apply bg-error-400;
}

.regular-marker .marker-line {
  @apply bg-neutral-300;
}

.marker-time {
  @apply text-xs font-medium text-neutral-600;
}

/* Enhanced Progress Bar - Clean, cohesive design */
.time-progress-bar {
  @apply w-full h-5 bg-neutral-100 rounded-lg mb-3 relative;
  border: 1px solid #e5e7eb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Clean edges */
}

/* Pre-work time fill (before clock-in) - Seamless integration */
.pre-work-fill {
  @apply absolute top-0 left-0 h-full;
  background: linear-gradient(135deg, #fee2e2, #fca5a5, #f87171);
  position: relative;
  z-index: 1;
}

/* Add subtle pattern overlay for pre-work time */
.pre-work-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );
  z-index: 2;
}

/* Break time fill - Orange/amber color for break periods */
.break-time-fill {
  @apply absolute top-0 h-full;
  background: linear-gradient(135deg, #f59e0b, #f97316, #fb923c) !important;
  position: absolute !important;
  z-index: 15 !important;
  min-width: 3px !important; /* Ensure minimum visibility for short breaks */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* Add subtle pattern overlay for break time */
.break-time-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.2) 2px,
    rgba(255, 255, 255, 0.2) 4px
  );
  z-index: 16;
}

/* Work progress fill - Clean, modern design with pattern */
.work-progress-fill {
  @apply absolute top-0 h-full;
  background: linear-gradient(135deg, #059669, #10b981, #34d399) !important;
  position: absolute !important;
  z-index: 20 !important;
  border-radius: 0 6px 6px 0; /* Only round the right side */
  min-width: 8px !important; /* Ensure minimum visibility */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

/* Add subtle pattern overlay for work progress */
.work-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.15) 2px,
    rgba(255, 255, 255, 0.15) 4px
  );
  z-index: 4;
}

/* Work shimmer - Subtle animation for active work */
.work-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%
  );
  background-size: 200% 100%;
  animation: workShimmer 2.5s infinite ease-in-out;
  z-index: 4;
}

@keyframes workShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Current Time Indicator - Moving Dot */
.current-time-indicator {
  @apply absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2;
}

.time-dot {
  @apply w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-lg;
  animation: pulse 2s infinite;
}

.time-tooltip {
  @apply absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 transition-opacity duration-200;
}

.current-time-indicator:hover .time-tooltip {
  @apply opacity-100;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Background Shimmer - Always visible subtle animation */
.progress-bar-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 70%
  );
  background-size: 200% 100%;
  animation: backgroundShimmer 3s infinite linear;
  z-index: 1;
}

/* Active Shimmer - Bright sweeping shimmer during work hours */
.active-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, 
    transparent 0%, 
    transparent 40%, 
    rgba(255, 255, 255, 0.9) 50%, 
    transparent 60%, 
    transparent 100%
  );
  background-size: 200% 100%;
  animation: activeShimmer 2s infinite linear;
  z-index: 2;
}

@keyframes backgroundShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes activeShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Enhanced Progress Information */
.time-progress-info {
  @apply flex items-center justify-between;
}

.progress-left {
  @apply flex items-center space-x-3;
}

.progress-right {
  @apply flex items-center;
}

.progress-time {
  @apply text-sm font-semibold text-neutral-800;
}

.progress-status {
  @apply text-xs font-medium;
}

.progress-percentage {
  @apply text-sm font-medium text-primary-600;
}

.break-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white bg-warning-600 border border-warning-600 hover:bg-warning-700 focus:ring-warning-500;
}

.end-break-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white bg-info-600 border border-info-600 hover:bg-info-700 focus:ring-info-500;
}





.dashboard-content {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-8;
}

.left-column {
  @apply lg:col-span-2 space-y-8;
}

.right-column {
  @apply lg:col-span-1 space-y-8;
}

/* Today's Schedule */
.todays-schedule .empty-state {
  @apply py-8 text-center;
}

.schedule-list {
  @apply space-y-4;
}

.schedule-item {
  @apply flex space-x-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200;
}

.schedule-time {
  @apply flex-shrink-0 text-center;
}

.time-start, .time-end {
  @apply block text-sm font-medium text-neutral-900;
}

.time-separator {
  @apply block text-xs text-neutral-500 my-1;
}

.schedule-content {
  @apply flex-1 min-w-0;
}

.schedule-title {
  @apply text-sm font-semibold text-neutral-900 mb-1;
}

.schedule-description {
  @apply text-sm text-neutral-600 mb-2;
}

.schedule-meta {
  @apply flex items-center space-x-4 text-xs text-neutral-500;
}

.schedule-location, .schedule-attendees {
  @apply flex items-center space-x-1;
}

.schedule-actions {
  @apply flex-shrink-0;
}

.join-button {
  @apply px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors;
}

/* My Tasks */
.task-filters {
  @apply flex items-center space-x-2;
}

.my-tasks .empty-state {
  @apply py-8 text-center;
}

.tasks-list {
  @apply space-y-3;
}

.task-item {
  @apply flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors;
}

.task-checkbox {
  @apply flex-shrink-0;
}

.task-checkbox-input {
  @apply w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500;
}

.task-content {
  @apply flex-1 min-w-0;
}

.task-title {
  @apply text-sm font-semibold text-neutral-900 mb-1;
}

.task-meta {
  @apply flex items-center space-x-3 text-xs;
}

.task-project {
  @apply text-neutral-600;
}

.task-due-date {
  @apply text-neutral-500;
}

.task-actions {
  @apply flex-shrink-0;
}

.task-action-button {
  @apply p-2 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors;
}

.view-all-tasks {
  @apply pt-3 border-t border-neutral-200;
}

.view-all-button {
  @apply w-full text-sm text-primary-600 hover:text-primary-700 font-medium;
}

/* Recent Feedback */
.recent-feedback .empty-state {
  @apply py-8 text-center;
}

.feedback-list {
  @apply space-y-4;
}

.feedback-item {
  @apply p-4 bg-neutral-50 rounded-lg border border-neutral-200;
}

.feedback-header {
  @apply flex items-center justify-between mb-2;
}

.feedback-from {
  @apply flex flex-col;
}

.feedback-author {
  @apply text-sm font-semibold text-neutral-900;
}

.feedback-role {
  @apply text-xs text-neutral-500;
}

.feedback-rating {
  @apply flex-shrink-0;
}

.rating-stars {
  @apply flex items-center space-x-1;
}

.feedback-comment {
  @apply text-sm text-neutral-700 mb-2;
}

.feedback-date {
  @apply text-xs text-neutral-500;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .dashboard-content {
    @apply grid-cols-1;
  }
  

}

@media (max-width: 640px) {
  /* Motivational Block - Mobile Responsive */
  .motivation-block {
    @apply flex-col items-start space-y-4 p-4;
  }
  
  .quick-clock-actions {
    @apply w-full justify-center;
  }
  
  /* Time Progress Block - Mobile Responsive */
  .time-progress-block {
    @apply p-3;
  }
  
  .time-progress-bar {
    @apply h-2 mb-2;
  }
  
  .time-progress-info {
    @apply text-xs;
  }
  

  
  .schedule-item {
    @apply flex-col space-y-3;
  }
  
  .task-item {
    @apply flex-col items-start space-y-3;
  }
  
  .task-actions {
    @apply self-end;
  }
  
  .feedback-header {
    @apply flex-col items-start space-y-2;
  }
}
</style>