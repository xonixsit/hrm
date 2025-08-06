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
      />
      
      <StatsCard
        :value="stats.totalDepartments"
        label="Departments"
        :icon="BuildingOfficeIcon"
        icon-color="secondary"
        :trend="stats.departmentTrend"
        :loading="loading"
      />
      
      <StatsCard
        :value="stats.pendingLeaves"
        label="Pending Leaves"
        :icon="CalendarDaysIcon"
        icon-color="warning"
        :trend="stats.leaveTrend"
        :loading="loading"
      />
      
      <StatsCard
        :value="stats.activeProjects"
        label="Active Projects"
        :icon="FolderOpenIcon"
        icon-color="success"
        :trend="stats.projectTrend"
        :loading="loading"
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

            <div v-else class="approvals-list">
              <div
                v-for="approval in pendingApprovals"
                :key="approval.id"
                class="approval-item"
              >
                <div class="approval-content">
                  <div class="approval-header">
                    <h4 class="approval-title">{{ approval.title }}</h4>
                    <span :class="getApprovalTypeClasses(approval.type)">
                      {{ approval.type }}
                    </span>
                  </div>
                  <p class="approval-description">{{ approval.description }}</p>
                  <div class="approval-meta">
                    <span class="approval-requester">{{ approval.requester }}</span>
                    <span class="approval-date">{{ formatDate(approval.created_at) }}</span>
                  </div>
                </div>
                <div class="approval-actions">
                  <button
                    @click="approveItem(approval)"
                    class="approve-button"
                    :disabled="processing"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="rejectItem(approval)"
                    class="reject-button"
                    :disabled="processing"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import DashboardWidget from './DashboardWidget.vue';
import StatsCard from './StatsCard.vue';
import ActivityTimeline from './ActivityTimeline.vue';
import QuickActions from './QuickActions.vue';

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
  BellIcon
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
  emit('action', { type: 'view-approvals' });
};

const approveItem = async (approval) => {
  processing.value = true;
  try {
    await emit('approve', approval);
  } finally {
    processing.value = false;
  }
};

const rejectItem = async (approval) => {
  processing.value = true;
  try {
    await emit('reject', approval);
  } finally {
    processing.value = false;
  }
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

.approvals-list {
  @apply space-y-4;
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

.approval-actions {
  @apply flex items-center space-x-2 ml-4;
}

.approve-button {
  @apply p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors;
}

.reject-button {
  @apply p-2 text-error-600 hover:bg-error-100 rounded-lg transition-colors;
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