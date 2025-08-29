<template>
  <div class="admin-dashboard" data-debug="admin-dashboard-component">
    <!-- DEBUG: AdminDashboard component rendered -->
    <!-- System Stats Overview -->
    <div class="stats-grid">
      <StatsCard
        :value="stats.totalEmployees"
        label="Total Employees"
        :icon="UsersIcon"
        icon-color="primary"
        variant="featured"
        :trend="stats.employeeTrend"
        :loading="loading"
        :clickable="true"
        route="employees.index"
      />
      
      <StatsCard
        :value="stats.totalDepartments"
        label="Departments"
        :icon="BuildingOfficeIcon"
        icon-color="secondary"
        :trend="stats.departmentTrend"
        :loading="loading"
        :clickable="true"
        route="departments.index"
      />
      
      <StatsCard
        :value="stats.pendingLeaves"
        label="Pending Leaves"
        :icon="CalendarDaysIcon"
        icon-color="warning"
        :trend="stats.leaveTrend"
        :loading="loading"
        :clickable="true"
        route="leaves.index"
      />
      
      <StatsCard
        :value="stats.activeProjects"
        label="Active Projects"
        :icon="FolderOpenIcon"
        icon-color="success"
        :trend="stats.projectTrend"
        :loading="loading"
        :clickable="true"
        route="projects.index"
      />
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- System Activity Timeline -->
        <ContentCard>
          <ActivityTimeline
            :activities="systemActivities"
            title="System Activity"
            :max-items="10"
            :loading="loading"
            @action="handleTimelineAction"
          />
        </ContentCard>

        <!-- Pending Approvals -->
        <ContentCard>
          <DashboardWidget
            title="Pending Approvals"
            :loading="loading"
            class="pending-approvals"
          >
            <template #actions>
              <button
                @click="viewAllApprovals"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </button>
            </template>

            <div v-if="pendingApprovals.length === 0" class="empty-state">
              <CheckCircleIcon class="w-12 h-12 text-success-400 mx-auto mb-3" />
              <p class="text-neutral-500 text-center">All caught up! No pending approvals.</p>
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
                  <p class="approval-description">{{ approval.description }}</p>
                  <div class="approval-meta">
                    <span class="approval-requester">{{ approval.requester }}</span>
                    <span class="approval-date">{{ formatDate(approval.created_at) }}</span>
                  </div>
                  
                  <!-- Quick Stats for Different Approval Types -->
                  <div v-if="approval.stats" class="approval-stats">
                    <!-- Timesheet Stats -->
                    <div v-if="approval.type === 'timesheet'" class="stats-row">
                      <div class="stat-item">
                        <span class="stat-label">Total Hours:</span>
                        <span class="stat-value">{{ approval.stats.total_hours || '0h 0m' }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Days:</span>
                        <span class="stat-value">{{ approval.stats.days_count || 0 }}</span>
                      </div>
                      <div v-if="approval.stats.overtime_hours" class="stat-item overtime">
                        <span class="stat-label">Overtime:</span>
                        <span class="stat-value">{{ approval.stats.overtime_hours }}</span>
                      </div>
                    </div>
                    
                    <!-- Leave Stats -->
                    <div v-else-if="approval.type === 'leave'" class="stats-row">
                      <div class="stat-item">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">{{ approval.stats.duration || 'N/A' }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Leave Type:</span>
                        <span class="stat-value">{{ approval.stats.leave_type || 'N/A' }}</span>
                      </div>
                    </div>
                    
                    <!-- Expense Stats -->
                    <div v-else-if="approval.type === 'expense'" class="stats-row">
                      <div class="stat-item">
                        <span class="stat-label">Amount:</span>
                        <span class="stat-value">{{ approval.stats.amount || '$0' }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Category:</span>
                        <span class="stat-value">{{ approval.stats.category || 'N/A' }}</span>
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
              
              <!-- View All Link -->
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
        </ContentCard>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Admin Quick Actions -->
        <ContentCard>
          <QuickActions
            :actions="adminQuickActions"
            title="Admin Tools"
            :max-visible="8"
            @action="handleQuickAction"
          />
        </ContentCard>

        <!-- System Health -->
        <ContentCard>
          <DashboardWidget
            title="System Health"
            :loading="loading"
            class="system-health"
          >
            <div class="health-metrics">
              <div class="health-item">
                <div class="health-indicator">
                  <div :class="getHealthIndicatorClasses('database')"></div>
                </div>
                <div class="health-content">
                  <span class="health-label">Database</span>
                  <span class="health-status">{{ systemHealth.database.status }}</span>
                </div>
                <div class="health-value">
                  {{ systemHealth.database.responseTime }}ms
                </div>
              </div>

              <div class="health-item">
                <div class="health-indicator">
                  <div :class="getHealthIndicatorClasses('cache')"></div>
                </div>
                <div class="health-content">
                  <span class="health-label">Cache</span>
                  <span class="health-status">{{ systemHealth.cache.status }}</span>
                </div>
                <div class="health-value">
                  {{ systemHealth.cache.hitRate }}%
                </div>
              </div>

              <div class="health-item">
                <div class="health-indicator">
                  <div :class="getHealthIndicatorClasses('queue')"></div>
                </div>
                <div class="health-content">
                  <span class="health-label">Queue</span>
                  <span class="health-status">{{ systemHealth.queue.status }}</span>
                </div>
                <div class="health-value">
                  {{ systemHealth.queue.pending }} pending
                </div>
              </div>
            </div>
          </DashboardWidget>
        </ContentCard>

        <!-- Recent User Activity -->
        <ContentCard>
          <DashboardWidget
            title="Recent User Activity"
            :loading="loading"
            class="user-activity"
          >
            <div class="activity-list">
              <div
                v-for="activity in recentUserActivity"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-avatar">
                  <img
                    v-if="activity.user.avatar"
                    :src="activity.user.avatar"
                    :alt="activity.user.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ activity.user.name.charAt(0) }}
                  </div>
                </div>
                <div class="activity-content">
                  <p class="activity-text">
                    <span class="font-medium">{{ activity.user.name }}</span>
                    {{ activity.action }}
                  </p>
                  <span class="activity-time">{{ formatRelativeTime(activity.created_at) }}</span>
                </div>
              </div>
            </div>
          </DashboardWidget>
        </ContentCard>
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
import ContentCard from '@/Components/Layout/ContentCard.vue';
import DashboardWidget from './DashboardWidget.vue';
import StatsCard from './StatsCard.vue';
import ActivityTimeline from './ActivityTimeline.vue';
import QuickActions from './QuickActions.vue';
import ApprovalModal from './ApprovalModal.vue';

// Import icons
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ServerIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalEmployees: 0,
      totalDepartments: 0,
      pendingLeaves: 0,
      activeProjects: 0,
      employeeTrend: 0,
      departmentTrend: 0,
      leaveTrend: 0,
      projectTrend: 0
    })
  },
  systemActivities: {
    type: Array,
    default: () => []
  },
  pendingApprovals: {
    type: Array,
    default: () => []
  },
  systemHealth: {
    type: Object,
    default: () => ({
      database: { status: 'healthy', responseTime: 45 },
      cache: { status: 'healthy', hitRate: 94 },
      queue: { status: 'healthy', pending: 3 }
    })
  },
  recentUserActivity: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['refresh', 'approve', 'reject', 'action']);

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
const userName = computed(() => user.value?.name || 'Admin');

const adminQuickActions = computed(() => [
  {
    id: 'manage-users',
    label: 'Manage Users',
    description: 'Add, edit, or remove user accounts',
    icon: UserGroupIcon,
    variant: 'primary',
    route: 'admin.users.index'
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    description: 'Configure application settings',
    icon: CogIcon,
    variant: 'secondary',
    route: 'admin.settings.index'
  },
  {
    id: 'view-reports',
    label: 'Analytics & Reports',
    description: 'View comprehensive system reports',
    icon: ChartBarIcon,
    variant: 'info',
    route: 'admin.reports.index'
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    description: 'Review system audit trail',
    icon: DocumentTextIcon,
    variant: 'warning',
    route: 'admin.audit.index'
  },
  {
    id: 'security-center',
    label: 'Security Center',
    description: 'Manage security settings',
    icon: ShieldCheckIcon,
    variant: 'error',
    route: 'admin.security.index'
  },
  {
    id: 'system-health',
    label: 'System Monitor',
    description: 'Monitor system performance',
    icon: ServerIcon,
    variant: 'success',
    route: 'admin.monitor.index'
  },
  {
    id: 'notifications',
    label: 'Send Notifications',
    description: 'Broadcast system notifications',
    icon: BellIcon,
    variant: 'secondary',
    route: 'admin.notifications.create'
  },
  {
    id: 'backup-restore',
    label: 'Backup & Restore',
    description: 'Manage system backups',
    icon: ServerIcon,
    variant: 'warning',
    route: 'admin.backup.index'
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

const viewAllApprovals = () => {
  emit('action', { type: 'view-all-approvals' });
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

const getApprovalTypeClasses = (type) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const typeStyles = {
    leave: 'bg-blue-100 text-blue-800',
    expense: 'bg-green-100 text-green-800',
    project: 'bg-purple-100 text-purple-800',
    user: 'bg-orange-100 text-orange-800',
    default: 'bg-neutral-100 text-neutral-800'
  };
  
  return `${baseClasses} ${typeStyles[type] || typeStyles.default}`;
};

const getHealthIndicatorClasses = (service) => {
  const baseClasses = 'w-3 h-3 rounded-full';
  const status = props.systemHealth[service]?.status || 'unknown';
  
  const statusColors = {
    healthy: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    unknown: 'bg-neutral-400'
  };
  
  return `${baseClasses} ${statusColors[status]}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
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
.admin-dashboard {
  @apply space-y-8;
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

/* Pending Approvals */
.pending-approvals .empty-state {
  @apply py-8 text-center;
}

.approval-feedback {
  @apply mt-3;
}

.approvals-container {
  @apply space-y-4;
}

.approvals-scroll {
  @apply space-y-3 overflow-y-auto pr-2;
  max-height: 320px; /* Roughly 4 items visible */
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

.view-all-section {
  @apply pt-3 border-t border-gray-200;
}

.view-all-link {
  @apply w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors;
}

.approval-item {
  @apply flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors;
}

.approval-content {
  @apply flex-1 min-w-0;
}

.approval-header {
  @apply flex items-center justify-between mb-2;
}

.approval-title {
  @apply text-sm font-semibold text-neutral-900;
}

.approval-description {
  @apply text-sm text-neutral-600 mb-2;
}

.approval-meta {
  @apply flex items-center space-x-4 text-xs text-neutral-500;
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
  @apply flex items-center space-x-2 ml-4;
}

.approve-button {
  @apply p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors;
}

.reject-button {
  @apply p-2 text-error-600 hover:bg-error-100 rounded-lg transition-colors;
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
  @apply duration-300;
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

/* System Health */
.health-metrics {
  @apply space-y-4;
}

.health-item {
  @apply flex items-center space-x-4;
}

.health-indicator {
  @apply flex-shrink-0;
}

.health-content {
  @apply flex-1 min-w-0;
}

.health-label {
  @apply block text-sm font-medium text-neutral-900;
}

.health-status {
  @apply block text-xs text-neutral-500 capitalize;
}

.health-value {
  @apply text-sm font-semibold text-neutral-700;
}

/* User Activity */
.activity-list {
  @apply space-y-4;
}

.activity-item {
  @apply flex items-start space-x-3;
}

.activity-avatar {
  @apply flex-shrink-0;
}

.avatar-placeholder {
  @apply w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.activity-text {
  @apply text-sm text-neutral-900 mb-1;
}

.activity-time {
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
  
  .approval-item {
    @apply flex-col items-start space-y-3;
  }
  
  .approval-actions {
    @apply ml-0 self-end;
  }
}
</style>