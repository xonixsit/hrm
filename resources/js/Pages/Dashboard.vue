<template>
  <AuthenticatedLayout>
    <!-- Dashboard Header with Visual Hierarchy -->
    <div class="dashboard-header">
      <div class="header-container">
        <div class="header-content">
          <div class="title-section">
            <h1 class="dashboard-title">{{ pageTitle }}</h1>
            <p class="dashboard-subtitle">{{ pageSubtitle }}</p>
          </div>
          <div class="header-actions">
            <button
              v-for="action in headerActions"
              :key="action.id"
              @click="action.handler"
              :disabled="action.disabled"
              :class="getActionButtonClasses(action.variant)"
              class="action-button"
            >
              <component :is="getIconComponent(action.icon)" class="w-4 h-4" />
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content with Proper Grid Layout -->
    <div class="dashboard-container">
      <!-- Admin Dashboard Layout -->
      <div v-if="isAdmin" class="admin-layout">
        <!-- Primary Stats Row - Most Important Metrics -->
        <div class="primary-stats-section">
          <div class="stats-grid-primary">
            <StatsCard
              :value="adminStats.totalEmployees"
              label="Total Employees"
              icon="users"
              variant="primary"
              :trend="adminStats.employeeTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="employees.index"
            />
            <StatsCard
              :value="adminStats.pendingLeaves"
              label="Pending Approvals"
              icon="clock"
              variant="warning"
              :trend="adminStats.leaveTrend"
              :loading="loading"
              size="large"
              :urgent="adminStats.pendingLeaves > 10"
              :clickable="true"
              route="leaves.index"
            />
            <!-- <StatsCard
              :value="adminStats.activeProjects"
              label="Active Projects"
              icon="folder"
              variant="success"
              :trend="adminStats.projectTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="projects.index"
            /> -->
            <StatsCard
              :value="adminStats.totalDepartments"
              label="Departments"
              icon="building"
              variant="secondary"
              :trend="adminStats.departmentTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="departments.index"
            />
          </div>
        </div>

        <!-- Secondary Content Row - Supporting Information -->
        <div class="secondary-content-section">
          <div class="content-grid-secondary">
            <!-- System Health - Critical Information -->
            <div class="system-health-card priority-high">
              <SystemHealthWidget
                :health="systemHealth"
                :loading="loading"
                @refresh="handleRefresh"
              />
            </div>

            <!-- Pending Approvals - Action Required -->
            <div class="pending-approvals-card priority-high">
              <PendingApprovalsWidget
                :approvals="pendingApprovals"
                :loading="loading"
                @approve="handleApproval"
                @reject="handleRejection"
                @view-all="() => $inertia.visit(route('approvals.index'))"
              />
            </div>

            <!-- System Activities - Monitoring -->
            <div class="system-activities-card priority-medium">
              <SystemActivitiesWidget
                :activities="systemActivities"
                :loading="loading"
                @refresh="handleRefresh"
              />
            </div>
          </div>
        </div>

        <!-- Tertiary Content Row - Additional Context -->
        <div class="tertiary-content-section">
          <div class="content-grid-tertiary">
            <!-- Recent User Activity -->
            <div class="user-activity-card">
              <RecentUserActivityWidget
                :activities="recentUserActivity"
                :loading="loading"
              />
            </div>

            <!-- Quick Actions Panel -->
            <div class="quick-actions-card">
              <QuickActionsWidget
                :actions="adminQuickActions"
                @action="handleAction"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Manager Dashboard Layout -->
      <div v-else-if="isManager" class="manager-layout">
        <!-- Team Overview - Primary Focus -->
        <div class="team-overview-section">
          <div class="stats-grid-primary">
            <StatsCard
              :value="managerStats.teamSize"
              label="Team Members"
              icon="users"
              variant="primary"
              :trend="managerStats.teamTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="employees.index"
            />
            <StatsCard
              :value="managerStats.pendingLeaves"
              label="Pending Team Leaves"
              icon="calendar"
              variant="warning"
              :loading="loading"
              size="large"
              :urgent="managerStats.pendingLeaves > 5"
              :clickable="true"
              route="leaves.index"
            />
            <StatsCard
              :value="managerStats.activeProjects"
              label="Active Projects"
              icon="folder"
              variant="success"
              :trend="managerStats.projectTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="projects.index"
            />
            <StatsCard
              :value="managerStats.teamPerformance"
              label="Team Performance"
              icon="chart-bar"
              variant="info"
              suffix="%"
              :loading="loading"
              size="large"
              :clickable="true"
              route="reports.index"
            />
          </div>
        </div>

        <!-- Team Management Content -->
        <div class="team-management-section">
          <div class="content-grid-manager">
            <!-- Team Members - Direct Reports -->
            <div class="team-members-card priority-high">
              <TeamMembersWidget
                :members="teamMembers"
                :loading="loading"
                @view-member="handleViewMember"
                @send-message="handleSendMessage"
              />
            </div>

            <!-- Team Performance Metrics -->
            <div class="team-performance-card priority-medium">
              <TeamPerformanceWidget
                :performance="teamPerformance"
                :loading="loading"
              />
            </div>

            <!-- Team Activities -->
            <div class="team-activities-card priority-medium">
              <TeamActivitiesWidget
                :activities="teamActivities"
                :loading="loading"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Dashboard Layout -->
      <div v-else class="employee-layout">
        <!-- Personal Productivity Focus -->
        <div class="productivity-section">
          <!-- Time Tracking - Most Important for Employees -->
          <div class="time-tracking-hero">
            <TimeTrackingWidget
              :current-attendance="currentAttendance"
              :clocked-in="clockedIn"
              :loading="loading"
              @clock-in-out="handleClockInOut"
              @take-break="() => handleAction({ type: 'take-break' })"
              @end-break="() => handleAction({ type: 'end-break' })"
              variant="hero"
            />
          </div>

          <!-- Personal Stats -->
          <div class="personal-stats-grid">
            <StatsCard
              :value="employeeStats.hoursToday"
              label="Hours Today"
              icon="clock"
              variant="primary"
              :loading="loading"
              size="medium"
              :clickable="true"
              route="attendances.index"
            />
            <StatsCard
              :value="employeeStats.pendingLeaves"
              label="Pending Leaves"
              icon="calendar"
              variant="warning"
              :loading="loading"
              size="medium"
              :clickable="true"
              route="leaves.index"
            />
            <StatsCard
              :value="employeeStats.tasksCompleted"
              label="Tasks Completed"
              icon="check-circle"
              variant="success"
              :trend="employeeStats.taskTrend"
              :loading="loading"
              size="medium"
              :clickable="true"
              route="tasks.index"
            />
            <StatsCard
              :value="employeeStats.leaveBalance"
              label="Leave Balance"
              icon="calendar-days"
              variant="info"
              suffix=" days"
              :loading="loading"
              size="medium"
              :clickable="true"
              route="leaves.index"
            />
          </div>
        </div>

        <!-- Personal Workspace -->
        <div class="workspace-section">
          <div class="content-grid-employee">
            <!-- Today's Schedule - Immediate Actions -->
            <div class="schedule-card priority-high">
              <TodaysScheduleWidget
                :schedule="todaysSchedule"
                :loading="loading"
              />
            </div>

            <!-- My Tasks - Action Items -->
            <div class="tasks-card priority-high">
              <MyTasksWidget
                :tasks="myTasks"
                :loading="loading"
                @toggle-task="handleToggleTask"
                @view-task="handleViewTask"
              />
            </div>

            <!-- Recent Feedback - Growth -->
            <div class="feedback-card priority-medium">
              <RecentFeedbackWidget
                :feedback="recentFeedback"
                :loading="loading"
              />
            </div>

            <!-- Personal Activities -->
            <div class="activities-card priority-low">
              <PersonalActivitiesWidget
                :activities="personalActivities"
                :loading="loading"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelRejection"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Reject {{ rejectionItem?.title || 'Request' }}
                </h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-600 mb-2">
                      <strong>Requester:</strong> {{ rejectionItem?.requester }}
                    </p>
                    <p class="text-sm text-gray-600 mb-4">
                      <strong>Request:</strong> {{ rejectionItem?.description }}
                    </p>
                  </div>
                  <div>
                    <label for="rejection-reason" class="block text-sm font-medium text-gray-700 mb-2">
                      Reason for rejection <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="rejection-reason"
                      v-model="rejectionReason"
                      rows="4"
                      class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide a clear reason for rejecting this request..."
                      required
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-1">
                      This reason will be sent to the employee and recorded in the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="confirmRejection"
              :disabled="!rejectionReason.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject Request
            </button>
            <button
              @click="cancelRejection"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Notifications -->
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
import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
// Dashboard Components
import AdminDashboard from '@/Components/Dashboard/AdminDashboard.vue';
import ManagerDashboard from '@/Components/Dashboard/ManagerDashboard.vue';
import EmployeeDashboard from '@/Components/Dashboard/EmployeeDashboard.vue';

// Widget Components (these would need to be created)
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import SystemHealthWidget from '@/Components/Dashboard/SystemHealthWidget.vue';
import PendingApprovalsWidget from '@/Components/Dashboard/PendingApprovalsWidget.vue';
import SystemActivitiesWidget from '@/Components/Dashboard/SystemActivitiesWidget.vue';
import RecentUserActivityWidget from '@/Components/Dashboard/RecentUserActivityWidget.vue';
import QuickActionsWidget from '@/Components/Dashboard/QuickActionsWidget.vue';
import TeamMembersWidget from '@/Components/Dashboard/TeamMembersWidget.vue';
import TeamPerformanceWidget from '@/Components/Dashboard/TeamPerformanceWidget.vue';
import TeamActivitiesWidget from '@/Components/Dashboard/TeamActivitiesWidget.vue';
import TimeTrackingWidget from '@/Components/Dashboard/TimeTrackingWidget.vue';
import TodaysScheduleWidget from '@/Components/Dashboard/TodaysScheduleWidget.vue';
import MyTasksWidget from '@/Components/Dashboard/MyTasksWidget.vue';
import RecentFeedbackWidget from '@/Components/Dashboard/RecentFeedbackWidget.vue';
import PersonalActivitiesWidget from '@/Components/Dashboard/PersonalActivitiesWidget.vue';

// Icons
import {
  CogIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  // Legacy props for backward compatibility
  totalEmployees: Number,
  pendingLeaves: Number,
  pendingTimesheets: Number,
  recentFeedbacks: Array,
  teamAttendances: Array,
  pendingApprovals: Array,
  myAttendances: Array,
  myLeaves: Array,
  myTimesheets: Array,
  myFeedbacks: Array,
  
  // Role-specific data props
  adminStats: {
    type: Object,
    default: () => ({})
  },
  managerStats: {
    type: Object,
    default: () => ({})
  },
  employeeStats: {
    type: Object,
    default: () => ({})
  },
  systemActivities: {
    type: Array,
    default: () => []
  },
  teamActivities: {
    type: Array,
    default: () => []
  },
  personalActivities: {
    type: Array,
    default: () => []
  },
  systemHealth: {
    type: Object,
    default: () => ({})
  },
  recentUserActivity: {
    type: Array,
    default: () => []
  },
  teamPerformance: {
    type: Object,
    default: () => ({})
  },
  teamMembers: {
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

// Composables
const { hasRole, user } = useAuth();

// Local state
const loading = ref(false);
const notifications = ref([]);

// Rejection modal state
const showRejectionModal = ref(false);
const rejectionItem = ref(null);
const rejectionReason = ref('');

// Role detection computed properties
const isAdmin = computed(() => hasRole('Admin'));
const isManager = computed(() => hasRole('Manager') && !isAdmin.value);

// Dynamic page title and subtitle based on user role
const pageTitle = computed(() => {
  if (isAdmin.value) return 'Admin Dashboard';
  if (isManager.value) return 'Manager Dashboard';
  return `Welcome back, ${user.value?.name || 'Employee'}!`;
});

const pageSubtitle = computed(() => {
  if (isAdmin.value) return 'System overview and administrative management tools.';
  if (isManager.value) return 'Team overview and management tools.';
  return "Here's your personal workspace and productivity tools.";
});

// Quick actions for different roles
const adminQuickActions = computed(() => [
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: 'user-plus',
    variant: 'primary',
    handler: () => router.visit(route('employees.create'))
  },
  {
    id: 'system-reports',
    label: 'System Reports',
    icon: 'chart-bar',
    variant: 'secondary',
    handler: () => router.visit(route('reports.index'))
  },
  {
    id: 'manage-departments',
    label: 'Manage Departments',
    icon: 'building-office',
    variant: 'secondary',
    handler: () => router.visit(route('departments.index'))
  },
  {
    id: 'backup-system',
    label: 'Backup System',
    icon: 'cloud-arrow-up',
    variant: 'ghost',
    handler: () => handleAction({ type: 'backup-system' })
  }
]);

// Breadcrumb navigation - Dashboard is the root page
const breadcrumbs = computed(() => [
  {
    label: 'Dashboard',
    href: route('dashboard'),
    current: true
  }
]);

// Header actions - can be customized based on role
const headerActions = computed(() => {
  const actions = [];
  
  if (isAdmin.value) {
    actions.push({
      id: 'system-settings',
      label: 'System Settings',
      icon: 'cog-6-tooth',
      variant: 'secondary',
      handler: () => {
        // Navigate to system settings
        console.log('Navigate to system settings');
      }
    });
  }
  
  if (isAdmin.value || isManager.value) {
    actions.push({
      id: 'reports',
      label: 'View Reports',
      icon: 'chart-bar',
      variant: 'secondary',
      handler: () => {
        // Navigate to reports
        console.log('Navigate to reports');
      }
    });
  }
  
  actions.push({
    id: 'refresh',
    label: 'Refresh',
    icon: 'arrow-path',
    variant: 'ghost',
    handler: handleRefresh,
    disabled: loading.value
  });
  
  return actions;
});

// UI Helper Methods
const getActionButtonClasses = (variant) => {
  const baseClasses = 'action-button';
  return `${baseClasses} ${variant}`;
};

const getIconComponent = (iconName) => {
  // Map icon names to actual icon components
  const iconMap = {
    'cog-6-tooth': 'CogIcon',
    'chart-bar': 'ChartBarIcon',
    'arrow-path': 'ArrowPathIcon',
    'user-plus': 'UserPlusIcon',
    'building-office': 'BuildingOfficeIcon',
    'cloud-arrow-up': 'CloudArrowUpIcon'
  };
  return iconMap[iconName] || 'QuestionMarkCircleIcon';
};

const getNotificationIcon = (type) => {
  const iconMap = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon'
  };
  return iconMap[type] || 'InformationCircleIcon';
};

// Event handlers for role-specific dashboard components
const handleRefresh = async () => {
  loading.value = true;
  try {
    // Refresh dashboard data - this would typically make API calls
    // For now, we'll just simulate a refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    showNotification('Dashboard refreshed successfully', 'success');
  } finally {
    loading.value = false;
  }
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
  
  // Auto-remove notification after duration
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

const handleApproval = async (approval) => {
  try {
    console.log('🎯 Approving approval item:', approval);
    console.log('📋 Approval type:', approval.type);
    console.log('🆔 Approval ID:', approval.id);
    
    // Show loading state
    showNotification('Processing approval...', 'info');
    
    let response;
    let endpoint;
    
    // Handle different approval types
    const requestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    if (approval.type === 'timesheet') {
      endpoint = `/timesheets/${approval.id}/approve`;
      response = await axios.post(endpoint, {
        comments: 'Approved from dashboard'
      }, requestConfig);
    } else if (approval.type === 'leave' || approval.type === 'Leave Request') {
      endpoint = `/leaves/${approval.id}/approve`;
      response = await axios.post(endpoint, {
        comments: 'Approved from dashboard'
      }, requestConfig);
    } else {
      // Generic approval endpoint - adjust as needed
      endpoint = `/${approval.type}s/${approval.id}/approve`;
      response = await axios.post(endpoint, {
        comments: 'Approved from dashboard'
      }, requestConfig);
    }
    
    console.log('📡 Making request to:', endpoint);
    console.log('✅ Response received:', response.data);
    
    if (response.data.success) {
      const itemType = approval.type === 'Leave Request' ? 'Leave request' : approval.type;
      console.log(`${itemType} approved successfully`);
      showNotification(`✅ ${itemType} approved successfully!`, 'success');
      
      // Refresh dashboard data
      router.reload({
        only: ['pendingApprovals', 'adminStats', 'managerStats'],
        preserveScroll: true
      });
    } else {
      console.warn('⚠️ Approval succeeded but response indicates failure:', response.data);
      showNotification('⚠️ Approval may not have been processed correctly', 'warning');
    }
    
  } catch (error) {
    console.error('❌ Error approving item:', error);
    console.error('📄 Error response:', error.response?.data);
    console.error('🔢 Error status:', error.response?.status);
    
    let errorMessage = 'Failed to approve item. Please try again.';
    
    if (error.response?.status === 403) {
      errorMessage = 'You are not authorized to approve this request. Please contact your administrator.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showNotification('❌ ' + errorMessage, 'error');
  }
};

const handleRejection = async (approval) => {
  console.log('🚫 Initiating rejection for:', approval);
  
  // Store the approval item and show modal
  rejectionItem.value = approval;
  rejectionReason.value = '';
  showRejectionModal.value = true;
};

const confirmRejection = async () => {
  if (!rejectionReason.value.trim()) {
    showNotification('❌ Please provide a reason for rejection', 'error');
    return;
  }
  
  const approval = rejectionItem.value;
  const comments = rejectionReason.value.trim();
  
  try {
    console.log('🚫 Rejecting approval item:', approval);
    console.log('📋 Approval type:', approval.type);
    console.log('🆔 Approval ID:', approval.id);
    console.log('💬 Rejection reason:', comments);
    
    // Close modal and show loading state
    showRejectionModal.value = false;
    showNotification('Processing rejection...', 'info');
    
    let response;
    let endpoint;
    
    // Handle different approval types
    const requestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    if (approval.type === 'timesheet') {
      endpoint = `/timesheets/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    } else if (approval.type === 'leave' || approval.type === 'Leave Request') {
      endpoint = `/leaves/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    } else {
      // Generic rejection endpoint - adjust as needed
      endpoint = `/${approval.type}s/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    }
    
    console.log('📡 Making request to:', endpoint);
    console.log('✅ Response received:', response.data);
    
    if (response.data.success) {
      const itemType = approval.type === 'Leave Request' ? 'Leave request' : approval.type;
      console.log(`${itemType} rejected successfully`);
      showNotification(`✅ ${itemType} rejected successfully!`, 'success');
      
      // Refresh dashboard data
      router.reload({
        only: ['pendingApprovals', 'adminStats', 'managerStats'],
        preserveScroll: true
      });
    } else {
      console.warn('⚠️ Rejection succeeded but response indicates failure:', response.data);
      showNotification('⚠️ Rejection may not have been processed correctly', 'warning');
    }
    
  } catch (error) {
    console.error('❌ Error rejecting item:', error);
    console.error('📄 Error response:', error.response?.data);
    console.error('🔢 Error status:', error.response?.status);
    
    let errorMessage = 'Failed to reject item. Please try again.';
    
    if (error.response?.status === 403) {
      errorMessage = 'You are not authorized to reject this request. Please contact your administrator.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showNotification('❌ ' + errorMessage, 'error');
  }
};

const cancelRejection = () => {
  showRejectionModal.value = false;
  rejectionItem.value = null;
  rejectionReason.value = '';
};

const handleAction = async (actionData) => {
  console.log('Dashboard action:', actionData);
  
  // Handle different types of actions
  switch (actionData.type) {
    case 'take-break':
      await handleTakeBreak();
      break;
    case 'end-break':
      await handleEndBreak();
      break;
    case 'timeline':
      // Handle timeline actions
      break;
    case 'quick-action':
      // Handle quick actions - navigation is handled by the component
      break;
    case 'view-approvals':
      // Navigate to approvals page
      break;
    case 'view-reports':
      // Navigate to reports page
      break;
    case 'view-calendar':
      // Navigate to calendar page
      break;
    case 'view-all-tasks':
      // Navigate to tasks page
      break;
    case 'view-all-approvals':
      // Navigate to approvals page
      router.visit(route('timesheets.pending-approvals'));
      break;
    default:
      console.log('Unhandled action type:', actionData.type);
  }
};

// Manager-specific event handlers
const handleViewMember = (member) => {
  console.log('Viewing member:', member);
  // Navigate to member details page or open modal
};

const handleSendMessage = (member) => {
  console.log('Sending message to:', member);
  // Open messaging interface or navigate to chat
};

// Employee-specific event handlers
const handleClockInOut = async () => {
  loading.value = true;
  
  try {
    console.log('Clock in/out action');
    
    // Determine if we're clocking in or out
    const isClockedIn = props.currentAttendance.clocked_in;
    const endpoint = isClockedIn ? '/api/attendance/clock-out' : '/api/attendance/clock-in';
    
    console.log(`Making ${isClockedIn ? 'clock out' : 'clock in'} request to ${endpoint}`);
    
    // Make API call
    const response = await axios.post(endpoint, {
      location: 'Dashboard', // Optional location data
    });
    
    if (response.data.success) {
      console.log('Clock in/out successful:', response.data);
      
      // Show success message
      console.log(response.data.message);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: !isClockedIn,
            onBreak: false,
            clockInTime: isClockedIn ? null : new Date().toISOString(),
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Clock in/out failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error with clock in/out:', error);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};

const handleToggleTask = async (task) => {
  try {
    console.log('Toggling task completion:', task);
    // Handle task completion toggle - make API call
    // This would typically update the task status
  } catch (error) {
    console.error('Error toggling task:', error);
  }
};

const handleViewTask = (task) => {
  console.log('Viewing task:', task);
  // Navigate to task details page or open modal
};

// Break functionality
const handleTakeBreak = async () => {
  loading.value = true;
  
  try {
    console.log('Starting break...');
    
    // Make API call to start break
    const response = await axios.post('/api/attendance/break-start', {
      timestamp: new Date().toISOString(),
    });
    
    if (response.data.success) {
      console.log('Break started successfully:', response.data);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: true,
            clockInTime: props.currentAttendance.clock_in_time,
            breakStartTime: new Date().toISOString(),
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Break start failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error starting break:', error);
    
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};

const handleEndBreak = async () => {
  loading.value = true;
  
  try {
    console.log('Ending break...');
    
    // Make API call to end break
    const response = await axios.post('/api/attendance/break-end', {
      timestamp: new Date().toISOString(),
    });
    
    if (response.data.success) {
      console.log('Break ended successfully:', response.data);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: false,
            clockInTime: props.currentAttendance.clock_in_time,
            breakStartTime: null,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Break end failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error ending break:', error);
    
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* =============================================================================
   DASHBOARD VISUAL HIERARCHY & HIG PRINCIPLES
   Following Human Interface Guidelines for optimal UX
   ============================================================================= */

/* Dashboard Header - Clear Information Architecture */
.dashboard-header {
  @apply bg-white border-b border-gray-200 sticky top-0 z-40;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  @apply max-w-7xl mx-auto;
}

.header-content {
  @apply flex items-center justify-between px-6 py-4;
}

.title-section {
  @apply flex-1;
}

.dashboard-title {
  @apply text-2xl font-semibold text-gray-900 mb-1;
  letter-spacing: -0.025em;
}

.dashboard-subtitle {
  @apply text-sm text-gray-600 font-medium;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.action-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.action-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.action-button.secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500;
}

.action-button.ghost {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500;
}

/* Main Dashboard Container - Proper Spacing & Layout */
.dashboard-container {
  @apply min-h-screen bg-gray-50;
  padding: 24px 0;
}

/* =============================================================================
   ADMIN DASHBOARD LAYOUT - Information Hierarchy
   ============================================================================= */
.admin-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

/* Primary Stats - Most Important Metrics (F-Pattern Top) */
.primary-stats-section {
  @apply mb-8;
}

.stats-grid-primary {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6;
}

/* Secondary Content - Supporting Information (F-Pattern Middle) */
.secondary-content-section {
  @apply mb-8;
}

.content-grid-secondary {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* Tertiary Content - Additional Context (F-Pattern Bottom) */
.tertiary-content-section {
  @apply mb-8;
}

.content-grid-tertiary {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

/* =============================================================================
   MANAGER DASHBOARD LAYOUT - Team-Focused Hierarchy
   ============================================================================= */
.manager-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

.team-overview-section {
  @apply mb-8;
}

.team-management-section {
  @apply mb-8;
}

.content-grid-manager {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* =============================================================================
   EMPLOYEE DASHBOARD LAYOUT - Personal Productivity Focus
   ============================================================================= */
.employee-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

/* Time Tracking Hero - Primary Focus for Employees */
.productivity-section {
  @apply mb-8;
}

.time-tracking-hero {
  @apply mb-6;
}

.personal-stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

/* Personal Workspace - Secondary Actions */
.workspace-section {
  @apply mb-8;
}

.content-grid-employee {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* =============================================================================
   PRIORITY-BASED VISUAL HIERARCHY
   Following HFI principles for attention management
   ============================================================================= */

/* High Priority Cards - Immediate Attention Required */
.priority-high {
  @apply ring-2 ring-blue-100 bg-white shadow-lg;
  transform: translateY(-2px);
}

.priority-high:hover {
  @apply shadow-xl;
  transform: translateY(-4px);
}

/* Medium Priority Cards - Important but Not Urgent */
.priority-medium {
  @apply bg-white shadow-md;
}

.priority-medium:hover {
  @apply shadow-lg;
  transform: translateY(-1px);
}

/* Low Priority Cards - Contextual Information */
.priority-low {
  @apply bg-white shadow-sm;
}

.priority-low:hover {
  @apply shadow-md;
}

/* =============================================================================
   CARD COMPONENTS - Consistent Design System
   ============================================================================= */

/* System Health - Critical Status Indicator */
.system-health-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Pending Approvals - Action Required Indicator */
.pending-approvals-card {
  @apply rounded-xl p-6 border border-orange-200 bg-orange-50/30 transition-all duration-200;
}

/* Activities & Monitoring Cards */
.system-activities-card,
.team-activities-card,
.activities-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* User & Team Management Cards */
.user-activity-card,
.team-members-card,
.team-performance-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Personal Productivity Cards */
.schedule-card,
.tasks-card,
.feedback-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Quick Actions Panel */
.quick-actions-card {
  @apply rounded-xl p-6 border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-200;
}

/* =============================================================================
   NOTIFICATION SYSTEM - HIG Compliant Feedback
   ============================================================================= */
.notification-overlay {
  @apply fixed inset-0 z-50 flex items-start justify-end pointer-events-none;
  padding: 24px;
}

.notification-center {
  @apply pointer-events-auto space-y-3;
  max-width: 400px;
  width: 100%;
}

.notification-card {
  @apply flex items-start space-x-4 p-4 rounded-xl shadow-lg border backdrop-blur-sm;
  animation: slideInRight 0.3s ease-out;
}

.notification-success {
  @apply bg-green-50/95 border-green-200 text-green-800;
}

.notification-error {
  @apply bg-red-50/95 border-red-200 text-red-800;
}

.notification-warning {
  @apply bg-yellow-50/95 border-yellow-200 text-yellow-800;
}

.notification-info {
  @apply bg-blue-50/95 border-blue-200 text-blue-800;
}

.notification-icon {
  @apply flex-shrink-0 mt-0.5;
}

.notification-text {
  @apply flex-1 min-w-0;
}

.notification-message {
  @apply text-sm font-medium leading-relaxed;
}

.notification-close {
  @apply flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors;
}

/* =============================================================================
   ANIMATIONS & MICRO-INTERACTIONS
   ============================================================================= */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Card hover animations */
.system-health-card,
.pending-approvals-card,
.system-activities-card,
.team-activities-card,
.activities-card,
.user-activity-card,
.team-members-card,
.team-performance-card,
.schedule-card,
.tasks-card,
.feedback-card,
.quick-actions-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* =============================================================================
   RESPONSIVE DESIGN - Mobile-First Approach
   ============================================================================= */

/* Mobile Optimizations */
@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px 0;
  }
  
  .admin-layout,
  .manager-layout,
  .employee-layout {
    @apply px-4 space-y-6;
  }
  
  .header-content {
    @apply flex-col items-start space-y-3 py-4;
  }
  
  .header-actions {
    @apply w-full justify-end;
  }
  
  .stats-grid-primary {
    @apply grid-cols-1 gap-4;
  }
  
  .content-grid-secondary,
  .content-grid-manager,
  .content-grid-employee {
    @apply grid-cols-1 gap-4;
  }
  
  .personal-stats-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .notification-overlay {
    @apply items-end justify-center;
    padding: 16px;
  }
  
  .notification-center {
    width: 100%;
    max-width: none;
  }
}

/* Tablet Optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .stats-grid-primary {
    @apply grid-cols-2 gap-5;
  }
  
  .content-grid-secondary {
    @apply grid-cols-1 gap-5;
  }
  
  .content-grid-manager,
  .content-grid-employee {
    @apply grid-cols-2 gap-5;
  }
  
  .personal-stats-grid {
    @apply grid-cols-2 gap-4;
  }
}

/* Desktop Optimizations */
@media (min-width: 1025px) {
  .stats-grid-primary {
    @apply grid-cols-4;
  }
  
  .content-grid-secondary {
    @apply grid-cols-3;
  }
  
  .content-grid-manager,
  .content-grid-employee {
    @apply grid-cols-3;
  }
  
  .personal-stats-grid {
    @apply grid-cols-4;
  }
}

/* =============================================================================
   ACCESSIBILITY & FOCUS STATES
   ============================================================================= */
.action-button:focus,
.notification-close:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .dashboard-header {
    @apply border-b-2 border-gray-900;
  }
  
  .priority-high {
    @apply ring-4 ring-blue-600;
  }
  
  .notification-card {
    @apply border-2;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .notification-card,
  .system-health-card,
  .pending-approvals-card,
  .system-activities-card,
  .team-activities-card,
  .activities-card,
  .user-activity-card,
  .team-members-card,
  .team-performance-card,
  .schedule-card,
  .tasks-card,
  .feedback-card,
  .quick-actions-card {
    transition: none;
    animation: none;
  }
  
  .priority-high:hover,
  .priority-medium:hover {
    transform: none;
  }
}
</style>