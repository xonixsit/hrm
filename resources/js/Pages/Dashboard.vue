<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your comprehensive system overview and management tools."
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentSection>
        <!-- Role-specific Dashboard Components -->
        <AdminDashboard
          v-if="isAdmin"
          :stats="adminStats"
          :system-activities="systemActivities"
          :pending-approvals="pendingApprovals"
          :system-health="systemHealth"
          :recent-user-activity="recentUserActivity"
          :loading="loading"
          @refresh="handleRefresh"
          @approve="handleApproval"
          @reject="handleRejection"
          @action="handleAction"
        />

        <ManagerDashboard
          v-else-if="isManager"
          :stats="managerStats"
          :team-activities="teamActivities"
          :team-performance="teamPerformance"
          :team-members="teamMembers"
          :pending-approvals="pendingApprovals"
          :loading="loading"
          @refresh="handleRefresh"
          @approve="handleApproval"
          @reject="handleRejection"
          @action="handleAction"
          @view-member="handleViewMember"
          @send-message="handleSendMessage"
        />

        <EmployeeDashboard
          v-else
          :stats="employeeStats"
          :personal-activities="personalActivities"
          :todays-schedule="todaysSchedule"
          :my-tasks="myTasks"
          :recent-feedback="recentFeedback"
          :clocked-in="clockedIn"
          :loading="loading"
          @clock-in-out="handleClockInOut"
          @toggle-task="handleToggleTask"
          @action="handleAction"
          @view-task="handleViewTask"
        />
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import AdminDashboard from '@/Components/Dashboard/AdminDashboard.vue';
import ManagerDashboard from '@/Components/Dashboard/ManagerDashboard.vue';
import EmployeeDashboard from '@/Components/Dashboard/EmployeeDashboard.vue';

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
  }
});

// Composables
const { hasRole } = useAuth();

// Local state
const loading = ref(false);

// Role detection computed properties
const isAdmin = computed(() => hasRole('Admin'));
const isManager = computed(() => hasRole('Manager') && !isAdmin.value);

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

// Event handlers for role-specific dashboard components
const handleRefresh = async () => {
  loading.value = true;
  try {
    // Refresh dashboard data - this would typically make API calls
    // For now, we'll just simulate a refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Dashboard refreshed');
  } finally {
    loading.value = false;
  }
};

const handleApproval = async (approval) => {
  try {
    console.log('Approving:', approval);
    // Handle approval logic - make API call to approve
    // This would typically be handled by the backend
  } catch (error) {
    console.error('Error approving item:', error);
  }
};

const handleRejection = async (approval) => {
  try {
    console.log('Rejecting:', approval);
    // Handle rejection logic - make API call to reject
    // This would typically be handled by the backend
  } catch (error) {
    console.error('Error rejecting item:', error);
  }
};

const handleAction = (actionData) => {
  console.log('Dashboard action:', actionData);
  
  // Handle different types of actions
  switch (actionData.type) {
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
  try {
    console.log('Clock in/out action');
    // Handle clock in/out logic - make API call
    // This would typically update the clockedIn prop
  } catch (error) {
    console.error('Error with clock in/out:', error);
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
</script>

<style scoped>
.dashboard-container {
  @apply min-h-screen bg-neutral-50 py-8;
}

.dashboard-header {
  @apply mb-8;
}

.header-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.dashboard-title {
  @apply text-3xl font-bold text-neutral-900 mb-2;
}

.dashboard-subtitle {
  @apply text-lg text-neutral-600;
}

.dashboard-grid {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8;
}

.stats-row {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.main-content-row {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.secondary-content-row {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.personal-data-row {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .stats-row {
    @apply grid-cols-1;
  }
  
  .main-content-row {
    @apply grid-cols-1;
  }
  
  .secondary-content-row {
    @apply grid-cols-1;
  }
  
  .personal-data-row {
    @apply grid-cols-1;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .stats-row {
    @apply grid-cols-2;
  }
  
  .main-content-row {
    @apply grid-cols-1;
  }
  
  .personal-data-row {
    @apply grid-cols-2;
  }
}
</style>