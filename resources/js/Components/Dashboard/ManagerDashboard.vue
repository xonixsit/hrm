<template>
  <div class="manager-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          Good {{ timeOfDay }}, {{ userName }}!
        </h1>
        <p class="welcome-subtitle">
          Here's your team overview and management tools for today.
        </p>
      </div>
      <div class="welcome-actions">
        <button
          @click="refreshDashboard"
          :disabled="refreshing"
          class="refresh-button"
        >
          <component 
            :is="refreshing ? 'LoadingIcon' : 'ArrowPathIcon'" 
            :class="['w-4 h-4', { 'animate-spin': refreshing }]" 
          />
          Refresh
        </button>
      </div>
    </div>

    <!-- Team Stats Overview -->
    <div class="stats-grid">
      <StatsCard
        :value="stats.teamSize"
        label="Team Members"
        :icon="UsersIcon"
        icon-color="primary"
        variant="featured"
        :trend="stats.teamTrend"
        :loading="loading"
        :clickable="true"
        route="employees.index"
      />
      
      <!-- <StatsCard
        :value="stats.activeProjects"
        label="Active Projects"
        :icon="FolderOpenIcon"
        icon-color="success"
        :trend="stats.projectTrend"
        :loading="loading"
        :clickable="true"
        route="projects.index"
      /> -->
      
      <StatsCard
        :value="stats.pendingTasks"
        label="Pending Tasks"
        :icon="ClipboardDocumentListIcon"
        icon-color="warning"
        :trend="stats.taskTrend"
        :loading="loading"
        :clickable="true"
        route="tasks.index"
      />
      
      <StatsCard
        :value="stats.teamAttendance"
        label="Team Attendance"
        :icon="CalendarDaysIcon"
        icon-color="info"
        unit="%"
        :trend="stats.attendanceTrend"
        :loading="loading"
        :clickable="true"
        route="attendances.index"
      />
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Team Activity Timeline -->
        <ActivityTimeline
          :activities="teamActivities"
          title="Team Activity"
          :max-items="8"
          :loading="loading"
          @action="handleTimelineAction"
        />

        <!-- Team Performance -->
        <DashboardWidget
          title="Team Performance"
          :loading="loading"
          class="team-performance"
        >
          <template #actions>
            <button
              @click="viewDetailedReports"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              View Reports
            </button>
          </template>

          <div class="performance-metrics">
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Project Completion Rate</span>
                <span class="metric-value">{{ teamPerformance.completionRate }}%</span>
              </div>
              <div class="metric-bar">
                <div 
                  class="metric-progress bg-success-500" 
                  :style="{ width: `${teamPerformance.completionRate}%` }"
                ></div>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Average Task Velocity</span>
                <span class="metric-value">{{ teamPerformance.taskVelocity }} tasks/week</span>
              </div>
              <div class="metric-bar">
                <div 
                  class="metric-progress bg-info-500" 
                  :style="{ width: `${Math.min(teamPerformance.taskVelocity * 10, 100)}%` }"
                ></div>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Team Satisfaction</span>
                <span class="metric-value">{{ teamPerformance.satisfaction }}/5</span>
              </div>
              <div class="metric-bar">
                <div 
                  class="metric-progress bg-warning-500" 
                  :style="{ width: `${(teamPerformance.satisfaction / 5) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Manager Quick Actions -->
        <QuickActions
          :actions="managerQuickActions"
          title="Management Tools"
          :max-visible="6"
          @action="handleQuickAction"
        />

        <!-- Team Status -->
        <DashboardWidget
          title="Team Status"
          :loading="loading"
          class="team-status"
        >
          <div class="team-members">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="team-member"
            >
              <div class="member-avatar">
                <img
                  v-if="member.avatar"
                  :src="member.avatar"
                  :alt="member.name"
                  class="w-10 h-10 rounded-full"
                />
                <div v-else class="avatar-placeholder">
                  {{ member.name.charAt(0) }}
                </div>
                <div :class="getStatusIndicatorClasses(member.status)"></div>
              </div>
              <div class="member-info">
                <h4 class="member-name">{{ member.name }}</h4>
                <p class="member-role">{{ member.role }}</p>
                <div class="member-status">
                  <span :class="getStatusClasses(member.status)">
                    {{ member.status }}
                  </span>
                  <span v-if="member.currentTask" class="member-task">
                    Working on: {{ member.currentTask }}
                  </span>
                </div>
              </div>
              <div class="member-actions">
                <button
                  @click="viewMemberDetails(member)"
                  class="action-button"
                  title="View Details"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
                <button
                  @click="sendMessage(member)"
                  class="action-button"
                  title="Send Message"
                >
                  <ChatBubbleLeftIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </DashboardWidget>

        <!-- Pending Approvals -->
        <DashboardWidget
          title="Pending Approvals"
          :loading="loading"
          class="pending-approvals"
        >
          <template #actions>
            <span class="approval-count">{{ pendingApprovals.length }}</span>
          </template>

          <div v-if="pendingApprovals.length === 0" class="empty-state">
            <CheckCircleIcon class="w-12 h-12 text-success-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">All approvals handled!</p>
          </div>

          <div v-else class="approvals-container">
            <div class="approvals-scroll">
              <div
                v-for="approval in pendingApprovals"
                :key="approval.id"
                :data-approval-id="approval.id"
                :class="['approval-item', { 'approval-processing': processingItems.has(approval.id) }]"
              >
              <div class="approval-content">
                <div class="approval-header">
                  <h4 class="approval-title">{{ approval.title }}</h4>
                </div>
                <p class="approval-requester">
                  Requested by {{ approval.requester }}
                </p>
                <span class="approval-date">{{ formatRelativeTime(approval.created_at) }}</span>
                
                <!-- Timesheet Quick Stats -->
                <div v-if="approval.type === 'timesheet' && approval.stats" class="approval-stats">
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-label">Total Hours:</span>
                      <span class="stat-value">{{ approval.stats.total_hours || '0h 0m' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Days:</span>
                      <span class="stat-value">{{ approval.stats.days_count || 0 }}</span>
                    </div>
                  </div>
                  <div v-if="approval.stats.overtime_hours" class="stats-row">
                    <div class="stat-item overtime">
                      <span class="stat-label">Overtime:</span>
                      <span class="stat-value">{{ approval.stats.overtime_hours }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Inline Feedback Messages -->
                <div v-if="approvalFeedback[approval.id]" class="approval-feedback">
                  <div :class="getApprovalFeedbackClasses(approvalFeedback[approval.id].type)">
                    <component :is="getFeedbackIcon(approvalFeedback[approval.id].type)" class="w-4 h-4" />
                    <span>{{ approvalFeedback[approval.id].message }}</span>
                  </div>
                </div>
              </div>
              <div class="approval-actions">
                <button
                  @click="openApprovalModal(approval, 'approve')"
                  class="approve-button"
                  :disabled="processing || processingItems.has(approval.id)"
                  :title="processingItems.has(approval.id) ? 'Processing...' : 'Approve'"
                >
                  <div v-if="processingItems.has(approval.id)" class="w-4 h-4 animate-spin">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <CheckIcon v-else class="w-4 h-4" />
                </button>
                <button
                  @click="openApprovalModal(approval, 'reject')"
                  class="reject-button"
                  :disabled="processing || processingItems.has(approval.id)"
                  :title="processingItems.has(approval.id) ? 'Processing...' : 'Reject'"
                >
                  <div v-if="processingItems.has(approval.id)" class="w-4 h-4 animate-spin">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <XMarkIcon v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>

            <!-- Enhanced View All Section -->
            <div v-if="pendingApprovals.length > 3" class="view-all-section">
              <button
                @click="viewAllApprovals"
                class="view-all-link"
              >
                <span>View All {{ pendingApprovals.length }} Approvals</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>

    <!-- Approval Modal -->
    <ApprovalModal
      :show="showApprovalModal"
      :approval="selectedApproval"
      :action="approvalAction"
      @close="showApprovalModal = false"
      @submit="handleApprovalSubmit"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import DashboardWidget from './DashboardWidget.vue';
import StatsCard from './StatsCard.vue';
import ActivityTimeline from './ActivityTimeline.vue';
import QuickActions from './QuickActions.vue';
import ApprovalModal from './ApprovalModal.vue';

// Import icons
import {
  UsersIcon,
  FolderOpenIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserPlusIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      teamSize: 0,
      activeProjects: 0,
      pendingTasks: 0,
      teamAttendance: 0,
      teamTrend: 0,
      projectTrend: 0,
      taskTrend: 0,
      attendanceTrend: 0
    })
  },
  teamActivities: {
    type: Array,
    default: () => []
  },
  teamPerformance: {
    type: Object,
    default: () => ({
      completionRate: 85,
      taskVelocity: 12,
      satisfaction: 4.2
    })
  },
  teamMembers: {
    type: Array,
    default: () => []
  },
  pendingApprovals: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['refresh', 'approve', 'reject', 'action', 'view-member', 'send-message']);

// Composables
const { user } = useAuth();

// Local state
const refreshing = ref(false);
const processing = ref(false);
const processingItems = ref(new Set());
const approvalFeedback = ref({});
const showApprovalModal = ref(false);
const selectedApproval = ref(null);
const approvalAction = ref('approve');

// Computed properties
const userName = computed(() => user.value?.name || 'Manager');

const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
});

const managerQuickActions = computed(() => [
  {
    id: 'create-project',
    label: 'New Project',
    description: 'Start a new team project',
    icon: PlusIcon,
    variant: 'primary',
    route: 'projects.create'
  },
  {
    id: 'assign-tasks',
    label: 'Assign Tasks',
    description: 'Delegate tasks to team members',
    icon: ClipboardDocumentListIcon,
    variant: 'secondary',
    route: 'tasks.create'
  },
  {
    id: 'team-reports',
    label: 'Team Reports',
    description: 'View team performance analytics',
    icon: ChartBarIcon,
    variant: 'info',
    route: 'reports.team'
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    description: 'Plan team meetings and reviews',
    icon: CalendarIcon,
    variant: 'success',
    route: 'meetings.create'
  },
  {
    id: 'review-timesheets',
    label: 'Review Timesheets',
    description: 'Approve team time entries',
    icon: ClockIcon,
    variant: 'warning',
    route: 'timesheets.review'
  },
  {
    id: 'team-feedback',
    label: 'Team Feedback',
    description: 'Provide feedback to team members',
    icon: DocumentTextIcon,
    variant: 'secondary',
    route: 'feedbacks.create'
  }
]);

// Methods
const refreshDashboard = async () => {
  refreshing.value = true;
  try {
    await emit('refresh');
  } finally {
    refreshing.value = false;
  }
};

const handleTimelineAction = (data) => {
  emit('action', { type: 'timeline', data });
};

const handleQuickAction = (action) => {
  emit('action', { type: 'quick-action', data: action });
};

const viewDetailedReports = () => {
  emit('action', { type: 'view-reports' });
};

const viewMemberDetails = (member) => {
  emit('view-member', member);
};

const sendMessage = (member) => {
  emit('send-message', member);
};

const openApprovalModal = (approval, action) => {
  selectedApproval.value = approval;
  approvalAction.value = action;
  showApprovalModal.value = true;
};

const handleApprovalSubmit = async (data) => {
  processing.value = true;
  
  // Clear any existing feedback
  delete approvalFeedback.value[data.approval.id];
  
  try {
    const approvalData = {
      ...data.approval,
      comments: data.comments
    };

    if (data.action === 'approve') {
      await emit('approve', approvalData);
    } else {
      await emit('reject', approvalData);
    }
    
    // Show success feedback
    showApprovalFeedback(
      data.approval.id, 
      'success', 
      `${data.action === 'approve' ? 'Approved' : 'Rejected'} successfully`
    );
    
    // Auto-hide feedback after 3 seconds
    setTimeout(() => {
      delete approvalFeedback.value[data.approval.id];
    }, 3000);
    
    // Close modal
    showApprovalModal.value = false;
    
  } catch (error) {
    // Show error feedback
    showApprovalFeedback(
      data.approval.id, 
      'error', 
      `Failed to ${data.action}. Please try again.`
    );
    
    // Auto-hide error feedback after 5 seconds
    setTimeout(() => {
      delete approvalFeedback.value[data.approval.id];
    }, 5000);
  } finally {
    processing.value = false;
  }
};

const scrollToApprovalItem = (approvalId) => {
  // Use nextTick to ensure DOM is updated
  nextTick(() => {
    const element = document.querySelector(`[data-approval-id="${approvalId}"]`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  });
};

const viewAllApprovals = () => {
  emit('action', { type: 'view-all-approvals' });
};

const getStatusIndicatorClasses = (status) => {
  const baseClasses = 'absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white';
  
  const statusColors = {
    online: 'bg-success-500',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
    offline: 'bg-neutral-400'
  };
  
  return `${baseClasses} ${statusColors[status] || statusColors.offline}`;
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const statusStyles = {
    online: 'bg-success-100 text-success-800',
    away: 'bg-warning-100 text-warning-800',
    busy: 'bg-error-100 text-error-800',
    offline: 'bg-neutral-100 text-neutral-800'
  };
  
  return `${baseClasses} ${statusStyles[status] || statusStyles.offline}`;
};

const getApprovalTypeClasses = (type) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const typeStyles = {
    leave: 'bg-blue-100 text-blue-800',
    timesheet: 'bg-green-100 text-green-800',
    expense: 'bg-purple-100 text-purple-800',
    project: 'bg-orange-100 text-orange-800',
    default: 'bg-neutral-100 text-neutral-800'
  };
  
  return `${baseClasses} ${typeStyles[type] || typeStyles.default}`;
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const showApprovalFeedback = (approvalId, type, message) => {
  approvalFeedback.value[approvalId] = { type, message };
};

const getApprovalFeedbackClasses = (type) => {
  const baseClasses = 'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium';
  
  const typeStyles = {
    success: 'bg-success-50 text-success-700 border border-success-200',
    error: 'bg-error-50 text-error-700 border border-error-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200'
  };
  
  return `${baseClasses} ${typeStyles[type] || typeStyles.error}`;
};

const getFeedbackIcon = (type) => {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon
  };
  
  return icons[type] || ExclamationTriangleIcon;
};

onMounted(() => {
  // Initialize dashboard data if needed
});
</script>

<style scoped>
.manager-dashboard {
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

.refresh-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
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

/* Team Performance */
.performance-metrics {
  @apply space-y-6;
}

.metric-item {
  @apply space-y-2;
}

.metric-header {
  @apply flex items-center justify-between;
}

.metric-label {
  @apply text-sm font-medium text-neutral-700;
}

.metric-value {
  @apply text-sm font-semibold text-neutral-900;
}

.metric-bar {
  @apply w-full bg-neutral-200 rounded-full h-2;
}

.metric-progress {
  @apply h-2 rounded-full transition-all duration-300;
}

/* Team Status */
.team-members {
  @apply space-y-4;
}

.team-member {
  @apply flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors;
}

.member-avatar {
  @apply relative flex-shrink-0;
}

.avatar-placeholder {
  @apply w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.member-info {
  @apply flex-1 min-w-0;
}

.member-name {
  @apply text-sm font-semibold text-neutral-900;
}

.member-role {
  @apply text-xs text-neutral-500 mb-1;
}

.member-status {
  @apply flex items-center space-x-2;
}

.member-task {
  @apply text-xs text-neutral-600;
}

.member-actions {
  @apply flex items-center space-x-2;
}

.action-button {
  @apply p-2 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors;
}

/* Pending Approvals */
.pending-approvals .empty-state {
  @apply py-8 text-center;
}

.approval-feedback {
  @apply mt-2;
}

.approval-count {
  @apply inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-primary-600 rounded-full;
}

.approvals-container {
  @apply space-y-4;
}

.approvals-scroll {
  @apply space-y-3 overflow-y-auto pr-2;
  max-height: 280px; /* Slightly smaller for manager dashboard */
}

/* Custom scrollbar styling */
.approvals-scroll::-webkit-scrollbar {
  width: 6px;
}

.approvals-scroll::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

.approvals-scroll::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full hover:bg-gray-400;
}

.approval-item {
  @apply flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors;
}

.approval-content {
  @apply flex-1 min-w-0;
}

.approval-header {
  @apply flex items-center justify-between mb-1;
}

.approval-title {
  @apply text-sm font-semibold text-neutral-900;
}

.approval-requester {
  @apply text-xs text-neutral-600 mb-1;
}

.approval-date {
  @apply text-xs text-neutral-500;
}

.approval-stats {
  @apply mt-3 pt-3 border-t border-neutral-200;
}

.stats-row {
  @apply flex items-center space-x-4 mb-2 last:mb-0;
}

.stat-item {
  @apply flex items-center space-x-1;
}

.stat-item.overtime {
  @apply text-warning-600;
}

.stat-label {
  @apply text-xs text-neutral-500 font-medium;
}

.stat-value {
  @apply text-xs text-neutral-700 font-semibold;
}

.approval-actions {
  @apply flex items-center space-x-2 ml-3;
}

.approve-button {
  @apply p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors;
}

.reject-button {
  @apply p-2 text-error-600 hover:bg-error-100 rounded-lg transition-colors;
}

.view-all-section {
  @apply pt-3 border-t border-gray-200;
}

.view-all-link {
  @apply w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors;
}

.approval-processing {
  @apply opacity-75 pointer-events-none;
  position: relative;
}

.approval-processing::after {
  content: '';
  @apply absolute inset-0 bg-white bg-opacity-50 rounded-lg;
}

.approval-feedback > div {
  @apply animate-pulse duration-300;
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  
  .team-member {
    @apply flex-col items-start space-y-3;
  }
  
  .member-actions {
    @apply self-end;
  }
  
  .approval-item {
    @apply flex-col items-start space-y-3;
  }
  
  .approval-actions {
    @apply ml-0 self-end;
  }
}
</style>