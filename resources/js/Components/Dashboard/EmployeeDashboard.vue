<template>
  <div class="employee-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          Welcome back, {{ userName }}!
        </h1>
        <p class="welcome-subtitle">
          {{ welcomeMessage }}
        </p>
      </div>
      <div class="welcome-actions">
        <button
          @click="clockInOut"
          :disabled="clockingInOut"
          :class="clockButtonClasses"
        >
          <component 
            :is="clockingInOut ? 'LoadingIcon' : 'ClockIcon'" 
            :class="['w-4 h-4', { 'animate-spin': clockingInOut }]" 
          />
          {{ clockButtonText }}
        </button>
      </div>
    </div>

    <!-- Personal Stats Overview -->
    <div class="stats-grid">
      <StatsCard
        :value="stats.hoursToday"
        label="Hours Today"
        :icon="ClockIcon"
        icon-color="primary"
        variant="featured"
        unit="h"
        :loading="loading"
      />
      
      <StatsCard
        :value="stats.tasksCompleted"
        label="Tasks Completed"
        :icon="CheckCircleIcon"
        icon-color="success"
        :trend="stats.taskTrend"
        :loading="loading"
      />
      
      <StatsCard
        :value="stats.leaveBalance"
        label="Leave Balance"
        :icon="CalendarDaysIcon"
        icon-color="info"
        unit=" days"
        :loading="loading"
      />
      
      <StatsCard
        :value="stats.upcomingDeadlines"
        label="Upcoming Deadlines"
        :icon="ExclamationTriangleIcon"
        icon-color="warning"
        :loading="loading"
      />
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Personal Activity Timeline -->
        <ActivityTimeline
          :activities="personalActivities"
          title="Your Recent Activity"
          :max-items="6"
          :loading="loading"
          @action="handleTimelineAction"
        />

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
        <DashboardWidget
          title="My Tasks"
          :loading="loading"
          class="my-tasks"
        >
          <template #actions>
            <div class="task-filters">
              <button
                v-for="filter in taskFilters"
                :key="filter.key"
                @click="setTaskFilter(filter.key)"
                :class="getTaskFilterClasses(filter.key)"
              >
                {{ filter.label }}
              </button>
            </div>
          </template>

          <div v-if="filteredTasks.length === 0" class="empty-state">
            <CheckCircleIcon class="w-12 h-12 text-success-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">
              {{ activeTaskFilter === 'all' ? 'No tasks assigned' : 'No tasks in this category' }}
            </p>
          </div>

          <div v-else class="tasks-list">
            <div
              v-for="task in filteredTasks.slice(0, 8)"
              :key="task.id"
              class="task-item"
            >
              <div class="task-checkbox">
                <input
                  type="checkbox"
                  :checked="task.completed"
                  @change="toggleTaskCompletion(task)"
                  class="task-checkbox-input"
                />
              </div>
              <div class="task-content">
                <h4 :class="['task-title', { 'line-through text-neutral-500': task.completed }]">
                  {{ task.title }}
                </h4>
                <div class="task-meta">
                  <span v-if="task.project" class="task-project">
                    {{ task.project.name }}
                  </span>
                  <span :class="getPriorityClasses(task.priority)">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.due_date" class="task-due-date">
                    Due {{ formatRelativeTime(task.due_date) }}
                  </span>
                </div>
              </div>
              <div class="task-actions">
                <button
                  @click="viewTaskDetails(task)"
                  class="task-action-button"
                  title="View Details"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="filteredTasks.length > 8" class="view-all-tasks">
              <button
                @click="viewAllTasks"
                class="view-all-button"
              >
                View {{ filteredTasks.length - 8 }} more tasks
              </button>
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
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
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
  CogIcon
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
  }
});

const emit = defineEmits(['clock-in-out', 'toggle-task', 'action', 'view-task']);

// Composables
const { user } = useAuth();

// Local state
const clockingInOut = ref(false);
const activeTaskFilter = ref('all');

// Computed properties
const userName = computed(() => user.value?.name?.split(' ')[0] || 'Employee');

const welcomeMessage = computed(() => {
  const hour = new Date().getHours();
  const messages = {
    morning: "Ready to tackle today's challenges?",
    afternoon: "Hope you're having a productive day!",
    evening: "Wrapping up another great day of work!"
  };
  
  if (hour < 12) return messages.morning;
  if (hour < 17) return messages.afternoon;
  return messages.evening;
});

const clockButtonText = computed(() => {
  if (clockingInOut.value) return 'Processing...';
  return props.clockedIn ? 'Clock Out' : 'Clock In';
});

const clockButtonClasses = computed(() => [
  'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  props.clockedIn
    ? 'text-error-700 bg-error-100 border border-error-300 hover:bg-error-200 focus:ring-error-500'
    : 'text-success-700 bg-success-100 border border-success-300 hover:bg-success-200 focus:ring-success-500'
]);

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
    id: 'log-timesheet',
    label: 'Log Time',
    description: 'Record your working hours',
    icon: ClockIcon,
    variant: 'secondary',
    route: 'timesheets.create'
  },
  {
    id: 'view-payslip',
    label: 'View Payslip',
    description: 'Check your latest payslip',
    icon: DocumentTextIcon,
    variant: 'info',
    route: 'payslips.index'
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
const clockInOut = async () => {
  clockingInOut.value = true;
  try {
    await emit('clock-in-out');
  } finally {
    clockingInOut.value = false;
  }
};

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

onMounted(() => {
  // Initialize dashboard data if needed
});
</script>

<style scoped>
.employee-dashboard {
  @apply space-y-8;
}

.welcome-section {
  @apply flex items-center justify-between mb-8;
}

.welcome-content {
  @apply flex-1;
}

.welcome-title {
  @apply text-3xl font-bold text-neutral-900 mb-2;
}

.welcome-subtitle {
  @apply text-lg text-neutral-600;
}

.welcome-actions {
  @apply flex items-center space-x-3;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
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
  
  .stats-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
}

@media (max-width: 640px) {
  .welcome-section {
    @apply flex-col items-start space-y-4;
  }
  
  .stats-grid {
    @apply grid-cols-1;
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