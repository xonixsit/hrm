<template>
  <AuthenticatedLayout>
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-container">
        <div class="header-content">
          <div class="title-section">
            <h1 class="dashboard-title">Assessment Dashboard</h1>
            <p class="dashboard-subtitle">Overview of competency assessments and cycles</p>
          </div>
          <div class="header-actions">
            <button
              @click="refreshData"
              :disabled="loading"
              class="action-button secondary"
            >
              <ArrowPathIcon class="w-4 h-4" />
              Refresh
            </button>
            <button
              v-if="canCreateAssessments"
              @click="navigateToCreateAssessment"
              class="action-button secondary"
            >
              <PlusIcon class="w-4 h-4" />
              New Assessment
            </button>
            <button
              @click="navigateToAssessmentCycles"
              class="action-button primary"
            >
              <CalendarIcon class="w-4 h-4" />
              Assessment Cycles
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-container">
      <!-- Assessment Statistics -->
      <div class="primary-stats-section">
        <div class="stats-grid-primary">
          <StatsCard
            :value="stats.totalAssessments"
            label="Total Assessments"
            icon="chart-bar"
            variant="primary"
            :trend="stats.assessmentTrend"
            :loading="loading"
            size="large"
            :clickable="true"
            @click="navigateToAllAssessments"
          />
          <StatsCard
            :value="stats.pendingAssessments"
            label="Pending Assessments"
            icon="clock"
            variant="warning"
            :loading="loading"
            size="large"
            :urgent="stats.pendingAssessments > 10"
            :clickable="true"
            @click="navigateToPendingAssessments"
          />
          <StatsCard
            :value="stats.activeCycles"
            label="Active Cycles"
            icon="calendar"
            variant="success"
            :loading="loading"
            size="large"
            :clickable="true"
            @click="navigateToAssessmentCycles"
          />
          <StatsCard
            :value="stats.completionRate"
            label="Completion Rate"
            icon="check-circle"
            variant="info"
            suffix="%"
            :loading="loading"
            size="large"
          />
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="secondary-content-section">
        <div class="content-grid-secondary">
          <!-- Pending Assessments Widget -->
          <div class="pending-assessments-card priority-high">
            <div class="widget-header">
              <h3 class="widget-title">Pending Assessments</h3>
              <div class="widget-actions">
                <button
                  @click="navigateToPendingAssessments"
                  class="text-sm text-teal-600 hover:text-teal-800"
                >
                  View All
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div v-if="loading" class="loading-state">
                <div class="animate-pulse space-y-3">
                  <div v-for="i in 3" :key="i" class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                      <div class="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                      <div class="w-1/2 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="pendingAssessments.length === 0" class="empty-state">
                <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p class="text-gray-500 text-center">No pending assessments</p>
              </div>
              <div v-else class="assessment-list">
                <div
                  v-for="assessment in pendingAssessments.slice(0, 5)"
                  :key="assessment.id"
                  class="assessment-item"
                  @click="navigateToAssessment(assessment)"
                >
                  <div class="assessment-avatar">
                    <div class="avatar-circle">
                      {{ getInitials(assessment.employee.name) }}
                    </div>
                  </div>
                  <div class="assessment-details">
                    <div class="assessment-title">
                      <Link
                        :href="route('competency-assessments.by-employee', assessment.employee.id)"
                        class="text-teal-600 hover:text-teal-800 hover:underline"
                      >
                        {{ assessment.employee.name }}
                      </Link>
                      - {{ assessment.competency.name }}
                    </div>
                    <div class="assessment-meta">
                      <span class="assessment-type">{{ formatAssessmentType(assessment.assessment_type) }}</span>
                      <span class="assessment-due">Due: {{ formatDate(assessment.due_date) }}</span>
                    </div>
                  </div>
                  <div class="assessment-actions">
                    <button
                      v-if="canAssess(assessment)"
                      @click.stop="startAssessment(assessment)"
                      class="btn-sm btn-primary"
                    >
                      Assess
                    </button>
                    <span
                      v-else
                      class="text-xs text-gray-500 italic"
                    >
                      {{ assessment.assessment_type === 'self' ? 'Employee only' : 'Not assigned' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assessment Cycles Widget -->
          <div class="assessment-cycles-card priority-medium">
            <div class="widget-header">
              <h3 class="widget-title">Assessment Cycles</h3>
              <div class="widget-actions">
                <button
                  @click="navigateToAssessmentCycles"
                  class="text-sm text-teal-600 hover:text-teal-800"
                >
                  Manage Cycles
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div v-if="loading" class="loading-state">
                <div class="animate-pulse space-y-3">
                  <div v-for="i in 3" :key="i" class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                      <div class="w-1/2 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div class="w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div v-else-if="assessmentCycles.length === 0" class="empty-state">
                <CalendarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-500 text-center">No active cycles</p>
              </div>
              <div v-else class="cycle-list">
                <div
                  v-for="cycle in assessmentCycles.slice(0, 5)"
                  :key="cycle.id"
                  class="cycle-item"
                  @click="navigateToCycle(cycle)"
                >
                  <div class="cycle-details">
                    <div class="cycle-title">{{ cycle.name }}</div>
                    <div class="cycle-meta">
                      <span class="cycle-period">{{ formatDateRange(cycle.start_date, cycle.end_date) }}</span>
                    </div>
                  </div>
                  <div class="cycle-status">
                    <span :class="getCycleStatusClasses(cycle.status)" class="status-badge">
                      {{ formatCycleStatus(cycle.status) }}
                    </span>
                  </div>
                  <div class="cycle-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: `${cycle.completion_percentage}%` }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ cycle.completion_percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="tertiary-content-section">
        <div class="content-grid-tertiary">
          <!-- Quick Actions -->
          <div class="quick-actions-card">
            <div class="widget-header">
              <h3 class="widget-title">Quick Actions</h3>
            </div>
            <div class="widget-content">
              <div class="quick-actions-grid">
                <button
                  v-if="canCreateAssessments"
                  @click="navigateToNewAssessment"
                  class="quick-action-item"
                >
                  <div class="quick-action-icon bg-teal-100 text-teal-600">
                    <DocumentPlusIcon class="w-6 h-6" />
                  </div>
                  <div class="quick-action-text">
                    <div class="quick-action-title">New Assessment</div>
                    <div class="quick-action-subtitle">Create individual assessment</div>
                  </div>
                </button>
                
                <button
                  @click="navigateToAssessmentCycles"
                  class="quick-action-item"
                >
                  <div class="quick-action-icon bg-green-100 text-green-600">
                    <CalendarIcon class="w-6 h-6" />
                  </div>
                  <div class="quick-action-text">
                    <div class="quick-action-title">Assessment Cycle</div>
                    <div class="quick-action-subtitle">Manage assessment cycles</div>
                  </div>
                </button>
                
                <button
                  @click="navigateToAnalytics"
                  class="quick-action-item"
                >
                  <div class="quick-action-icon bg-purple-100 text-purple-600">
                    <ChartBarIcon class="w-6 h-6" />
                  </div>
                  <div class="quick-action-text">
                    <div class="quick-action-title">Analytics</div>
                    <div class="quick-action-subtitle">View reports and insights</div>
                  </div>
                </button>
                
                <button
                  @click="navigateToCompetencies"
                  class="quick-action-item"
                >
                  <div class="quick-action-icon bg-orange-100 text-orange-600">
                    <CogIcon class="w-6 h-6" />
                  </div>
                  <div class="quick-action-text">
                    <div class="quick-action-title">Competencies</div>
                    <div class="quick-action-subtitle">Manage competency framework</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity-card">
            <div class="widget-header">
              <h3 class="widget-title">Recent Activity</h3>
            </div>
            <div class="widget-content">
              <div v-if="loading" class="loading-state">
                <div class="animate-pulse space-y-3">
                  <div v-for="i in 4" :key="i" class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                      <div class="w-full h-3 bg-gray-200 rounded mb-2"></div>
                      <div class="w-2/3 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="recentActivity.length === 0" class="empty-state">
                <ClockIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-500 text-center">No recent activity</p>
              </div>
              <div v-else class="activity-list">
                <div
                  v-for="activity in recentActivity.slice(0, 6)"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                  <div class="activity-details">
                    <div class="activity-text">{{ activity.description }}</div>
                    <div class="activity-time">{{ formatRelativeTime(activity.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="notifications.length > 0" class="notification-overlay">
      <div class="notification-center">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          class="notification-card"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
          </div>
          <div class="notification-text">
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="notification-close"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { router, Link, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import {
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentPlusIcon,
  CogIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalAssessments: 0,
      pendingAssessments: 0,
      activeCycles: 0,
      completionRate: 0,
      assessmentTrend: 0
    })
  },
  pendingAssessments: {
    type: Array,
    default: () => []
  },
  assessmentCycles: {
    type: Array,
    default: () => []
  },
  recentActivity: {
    type: Array,
    default: () => []
  }
});

// Local state
const loading = ref(false);
const notifications = ref([]);

// Get current user from Inertia page props
const page = usePage();
const user = computed(() => page.props.auth?.user);

// Check if user can create assessments
const canCreateAssessments = computed(() => {
  const userRoles = user.value?.roles || [];
  return userRoles.some(role => ['Manager', 'Admin', 'HR'].includes(role.name));
});

// Computed properties
const formattedStats = computed(() => ({
  ...props.stats,
  completionRate: Math.round(props.stats.completionRate || 0)
}));

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    router.reload({
      only: ['stats', 'pendingAssessments', 'assessmentCycles', 'recentActivity'],
      preserveScroll: true
    });
    showNotification('Dashboard refreshed successfully', 'success');
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }
};

// Navigation methods with error handling
const navigateToAllAssessments = () => {
  try {
    router.visit(route('competency-assessments.index'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToPendingAssessments = () => {
  try {
    router.visit(route('competency-assessments.pending'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToAssessmentCycles = () => {
  try {
    router.visit(route('assessment-cycle-manager'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToNewAssessment = () => {
  try {
    router.visit(route('competency-assessments.create'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToCreateAssessment = () => {
  try {
    router.visit(route('competency-assessments.create'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToAnalytics = () => {
  try {
    router.visit(route('competency-analytics.index'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToCompetencies = () => {
  try {
    router.visit(route('competencies.index'));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToAssessment = (assessment) => {
  try {
    router.visit(route('competency-assessments.show', assessment.id));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const navigateToCycle = (cycle) => {
  try {
    router.visit(route('assessment-cycles.show', cycle.id));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

const startAssessment = (assessment) => {
  try {
    // Get current user
    const page = usePage();
    const currentUser = page.props.auth?.user;
    
    // Check if this is a self-assessment and if the current user is the employee
    if (assessment.assessment_type === 'self') {
      // For self-assessments, only the employee themselves can assess
      if (currentUser.id !== assessment.employee.user_id) {
        showNotification('Self-assessments can only be completed by the employee themselves.', 'error');
        return;
      }
    } else {
      // For other assessment types, check if user is the assigned assessor
      if (currentUser.id !== assessment.assessor_id) {
        showNotification('You are not authorized to complete this assessment.', 'error');
        return;
      }
    }
    
    router.visit(route('competency-assessments.evaluate', assessment.id));
  } catch (error) {
    console.error('Navigation error:', error);
    showNotification('Navigation failed. Please try again.', 'error');
  }
};

// Check if current user can assess a specific assessment
const canAssess = (assessment) => {
  try {
    const page = usePage();
    const currentUser = page.props.auth?.user;
    
    if (!currentUser) return false;
    
    // For self-assessments, only the employee themselves can assess
    if (assessment.assessment_type === 'self') {
      return currentUser.id === assessment.employee.user_id;
    }
    
    // For other assessment types, check if user is the assigned assessor
    return currentUser.id === assessment.assessor_id;
  } catch (error) {
    console.error('Error checking assessment permissions:', error);
    return false;
  }
};

// Utility methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatAssessmentType = (type) => {
  const types = {
    'self': 'Self Assessment',
    'manager': 'Manager Assessment',
    'peer': 'Peer Assessment',
    '360': '360° Feedback'
  };
  return types[type] || type;
};

const formatDate = (date) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};

const formatCycleStatus = (status) => {
  const statuses = {
    'planned': 'Planned',
    'active': 'Active',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statuses[status] || status;
};

const getCycleStatusClasses = (status) => {
  const classes = {
    'planned': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-teal-100 text-teal-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const getActivityIcon = (type) => {
  const icons = {
    'assessment_submitted': CheckCircleIcon,
    'assessment_approved': CheckCircleIcon,
    'cycle_started': CalendarIcon,
    'cycle_completed': CheckCircleIcon
  };
  return icons[type] || ClockIcon;
};

// Notification system
const showNotification = (message, type = 'info', duration = 4000) => {
  const id = Date.now();
  const notification = {
    id,
    message,
    type,
    visible: true
  };
  
  notifications.value.push(notification);
  
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationClasses = (type) => {
  const baseClasses = 'notification-toast';
  const typeClasses = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  };
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
};

const getNotificationIcon = (type) => {
  const iconMap = {
    success: CheckCircleIcon,
    error: XMarkIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return iconMap[type] || InformationCircleIcon;
};

onMounted(() => {
  // Check if route helper is available
  if (typeof route === 'undefined') {
    console.error('Route helper is not available. This will cause navigation issues.');
    showNotification('Navigation system not properly initialized. Please refresh the page.', 'error');
  } else {
    //console.log('Route helper is available. Navigation should work properly.');
  }
  
  // Test a few key routes
  try {
    const testRoutes = [
      'competency-assessments.index',
      'assessment-cycle-manager',
      'competency-analytics.index'
    ];
    
    testRoutes.forEach(routeName => {
      try {
        const url = route(routeName);
        //console.log(`✓ Route ${routeName} is available: ${url}`);
      } catch (error) {
        console.error(`✗ Route ${routeName} failed:`, error);
      }
    });
  } catch (error) {
    console.error('Route testing failed:', error);
  }
});
</script>

<style scoped>
/* Dashboard Layout */
.dashboard-header {
  @apply bg-white border-b border-gray-200 px-6 py-4;
}

.header-container {
  @apply max-w-7xl mx-auto;
}

.header-content {
  @apply flex items-center justify-between;
}

.title-section h1 {
  @apply text-2xl font-bold text-gray-900;
}

.title-section p {
  @apply text-gray-600 mt-1;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.action-button {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200;
}

.action-button.primary {
  @apply text-white bg-teal-600 hover:bg-teal-700 focus:ring-teal-500;
}

.action-button.secondary {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-teal-500;
}

.action-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.dashboard-container {
  @apply max-w-7xl mx-auto px-6 py-6 space-y-6;
}

/* Stats Grid */
.primary-stats-section .stats-grid-primary {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

/* Content Grids */
.secondary-content-section .content-grid-secondary {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.tertiary-content-section .content-grid-tertiary {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

/* Widget Styles */
.pending-assessments-card,
.assessment-cycles-card,
.quick-actions-card,
.recent-activity-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}

.widget-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-200;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.widget-content {
  @apply p-6;
}

/* Assessment List */
.assessment-list {
  @apply space-y-4;
}

.assessment-item {
  @apply flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer;
}

.assessment-avatar .avatar-circle {
  @apply w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.assessment-details {
  @apply flex-1 min-w-0;
}

.assessment-title {
  @apply font-medium text-gray-900 truncate;
}

.assessment-meta {
  @apply flex items-center space-x-2 text-sm text-gray-500 mt-1;
}

.assessment-type {
  @apply px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200;
}

.btn-primary {
  @apply text-white bg-teal-600 hover:bg-teal-700;
}

/* Cycle List */
.cycle-list {
  @apply space-y-4;
}

.cycle-item {
  @apply flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer;
}

.cycle-details {
  @apply flex-1 min-w-0;
}

.cycle-title {
  @apply font-medium text-gray-900 truncate;
}

.cycle-meta {
  @apply text-sm text-gray-500 mt-1;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.cycle-progress {
  @apply flex items-center space-x-2 ml-4;
}

.progress-bar {
  @apply w-16 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-teal-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-500 font-medium;
}

/* Quick Actions */
.quick-actions-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.quick-action-item {
  @apply flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left;
}

.quick-action-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center;
}

.quick-action-text {
  @apply flex-1;
}

.quick-action-title {
  @apply font-medium text-gray-900;
}

.quick-action-subtitle {
  @apply text-sm text-gray-500 mt-1;
}

/* Activity List */
.activity-list {
  @apply space-y-3;
}

.activity-item {
  @apply flex items-start space-x-3;
}

.activity-icon {
  @apply w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center flex-shrink-0;
}

.activity-details {
  @apply flex-1 min-w-0;
}

.activity-text {
  @apply text-sm text-gray-900;
}

.activity-time {
  @apply text-xs text-gray-500 mt-1;
}

/* Loading and Empty States */
.loading-state {
  @apply py-8;
}

.empty-state {
  @apply py-8 text-center;
}

/* Notifications */
.notification-overlay {
  @apply fixed top-4 right-4 z-50 space-y-2;
}

.notification-card {
  @apply flex items-center space-x-3 p-4 rounded-lg shadow-lg max-w-sm;
}

.notification-success {
  @apply bg-green-50 border border-green-200 text-green-800;
}

.notification-error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.notification-warning {
  @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
}

.notification-info {
  @apply bg-teal-50 border border-teal-200 text-teal-800;
}

.notification-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors duration-200;
}
</style>