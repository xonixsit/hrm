<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="pageTitle"
      :subtitle="pageSubtitle"
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
          :current-attendance="currentAttendance"
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
import { router } from '@inertiajs/vue3';
import axios from 'axios';
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
    
    // Handle different approval types
    if (approval.type === 'timesheet') {
      const response = await axios.post(`/timesheets/${approval.id}/approve`, {
        comments: 'Approved from dashboard'
      });
      
      if (response.data.success) {
        console.log('Timesheet approved successfully');
        // Refresh dashboard data
        router.reload({
          only: ['pendingApprovals', 'adminStats', 'managerStats'],
          preserveScroll: true
        });
      }
    }
    // Add other approval types as needed
    
  } catch (error) {
    console.error('Error approving item:', error);
    if (error.response?.data?.message) {
      alert('Error: ' + error.response.data.message);
    } else {
      alert('Failed to approve item. Please try again.');
    }
  }
};

const handleRejection = async (approval) => {
  try {
    console.log('Rejecting:', approval);
    
    // Handle different approval types
    if (approval.type === 'timesheet') {
      const comments = prompt('Please provide a reason for rejection:');
      if (comments === null) return; // User cancelled
      
      const response = await axios.post(`/timesheets/${approval.id}/reject`, {
        comments: comments || 'Rejected from dashboard'
      });
      
      if (response.data.success) {
        console.log('Timesheet rejected successfully');
        // Refresh dashboard data
        router.reload({
          only: ['pendingApprovals', 'adminStats', 'managerStats'],
          preserveScroll: true
        });
      }
    }
    // Add other approval types as needed
    
  } catch (error) {
    console.error('Error rejecting item:', error);
    if (error.response?.data?.message) {
      alert('Error: ' + error.response.data.message);
    } else {
      alert('Failed to reject item. Please try again.');
    }
  }
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