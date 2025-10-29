<template>
  <AuthenticatedLayout>
    <template #header>
      {{ pageTitle }}
    </template>

    <template #subtitle>
      {{ pageSubtitle }}
    </template>

    <template #headerActions>
      <!-- <div class="flex items-center text-gray-500 mr-6">
        <div class="flex items-center mr-6">
          <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span class="text-sm">System Online</span>
        </div>
        <div class="flex items-center">
          <ClockIcon class="w-4 h-4 mr-2" />
          <span class="text-sm">{{ currentTime }}</span>
        </div>
      </div> -->

      <div class="flex space-x-3">
        <button v-for="action in headerActions" :key="action.id" @click="action.handler" :disabled="action.disabled"
          :class="[
            'inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
            action.primary 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25' 
              : 'bg-white/60 text-gray-700 border border-gray-200 hover:bg-white hover:shadow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          ]">
          <component :is="getIconComponent(action.icon)" class="w-4 h-4 mr-2" />
          {{ action.label }}
        </button>
      </div>
    </template>

    <!-- Main Dashboard Content -->
    <div v-if="isAdmin" class="space-y-6">

      <!-- Key Metrics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UnifiedStatsCard :value="adminStats.totalEmployees" label="Total Employees" description="Active workforce"
          :icon="UsersIcon" variant="primary" :trend="adminStats.employeeTrend" route="employees.index"
          :loading="loading" />

        <UnifiedStatsCard :value="adminStats.pendingLeaves" label="Pending Approvals" description="Requires attention"
          :icon="ExclamationTriangleIcon" variant="warning"
          :status="adminStats.pendingLeaves > 10 ? 'critical' : 'warning'"
          :statusText="adminStats.pendingLeaves > 10 ? 'High' : 'Normal'" route="approvals.index"
          :urgent="adminStats.pendingLeaves > 15" :loading="loading" />

        <UnifiedStatsCard :value="adminStats.pendingAssessments" label="Pending Assessments" description="Review status"
          :icon="AcademicCapIcon" variant="info" :status="adminStats.pendingAssessments > 5 ? 'warning' : 'good'"
          :statusText="adminStats.pendingAssessments > 5 ? 'Review' : 'On Track'" route="assessment-dashboard"
          :loading="loading" />

        <UnifiedStatsCard :value="adminStats.systemHealth + '%'" label="System Health" description="Uptime"
          :icon="CheckCircleIcon" variant="success"
          :status="adminStats.systemHealth > 95 ? 'excellent' : adminStats.systemHealth > 85 ? 'good' : 'warning'"
          :statusText="adminStats.systemHealth > 95 ? 'Excellent' : adminStats.systemHealth > 85 ? 'Good' : 'Needs Attention'"
          :clickable="false" :loading="loading" />
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UnifiedStatsCard :value="(adminStats.attendanceRate || 0) + '%'" label="Attendance Rate"
          description="This month" :icon="ClockIcon" variant="info" :trend="adminStats.attendanceTrend || 0"
          :status="(adminStats.attendanceRate || 0) > 95 ? 'excellent' : (adminStats.attendanceRate || 0) > 85 ? 'good' : 'warning'"
          :statusText="(adminStats.attendanceRate || 0) > 95 ? 'Excellent' : (adminStats.attendanceRate || 0) > 85 ? 'Good' : 'Needs Attention'"
          route="attendance.reports" :loading="loading" />

        <UnifiedStatsCard :value="adminStats.workReportsCount || 0" label="Work Reports" description="This month"
          :icon="ChartBarIcon" variant="primary" :trend="adminStats.workReportsTrend || 0"
          :status="(adminStats.workReportsCount || 0) > 50 ? 'excellent' : (adminStats.workReportsCount || 0) > 20 ? 'good' : 'warning'"
          :statusText="(adminStats.workReportsCount || 0) > 50 ? 'High Activity' : (adminStats.workReportsCount || 0) > 20 ? 'Active' : 'Low Activity'"
          route="work-reports.index" :loading="loading" />

        <UnifiedStatsCard :value="adminStats.successfulCalls || 0" label="Successful Calls" description="This month"
          :icon="ArrowTrendingUpIcon" variant="success" :trend="adminStats.successfulCallsTrend || 0"
          :status="(adminStats.successfulCalls || 0) > 100 ? 'excellent' : (adminStats.successfulCalls || 0) > 50 ? 'good' : 'warning'"
          :statusText="(adminStats.successfulCalls || 0) > 100 ? 'Excellent' : (adminStats.successfulCalls || 0) > 50 ? 'Good' : 'Needs Focus'"
          route="work-reports.leaderboard" :loading="loading" />

        <UnifiedStatsCard :value="(adminStats.avgPerformanceScore || 0) + '%'" label="Avg Performance"
          description="Team score" :icon="AcademicCapIcon" variant="info" :trend="adminStats.performanceTrend || 0"
          :status="(adminStats.avgPerformanceScore || 0) > 85 ? 'excellent' : (adminStats.avgPerformanceScore || 0) > 70 ? 'good' : 'warning'"
          :statusText="(adminStats.avgPerformanceScore || 0) > 85 ? 'Excellent' : (adminStats.avgPerformanceScore || 0) > 70 ? 'Good' : 'Needs Improvement'"
          route="performance.reports" :loading="loading" />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Left Column: Action Required & Approvals -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Pending Items Overview -->
          <UnifiedCard v-if="pendingApprovals.length > 0" title="Pending Approvals Overview"
            description="Items requiring your attention" :icon="ExclamationTriangleIcon" iconVariant="info"
            variant="elevated">
            <template #headerActions>
              <button @click="navigateTo('leaves.index')"
                class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Manage All Approvals
              </button>
            </template>

            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">{{ pendingApprovals.filter(a => a.type ===
                  'leave').length }}</div>
                <div class="text-sm text-gray-600">Leave Requests</div>
              </div>
              <div class="p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ pendingApprovals.filter(a => a.type ===
                  'timesheet').length }}</div>
                <div class="text-sm text-gray-600">Timesheets</div>
              </div>
              <div class="p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ pendingApprovals.filter(a => a.type ===
                  'competency-assessment').length }}</div>
                <div class="text-sm text-gray-600">Assessments</div>
              </div>
            </div>
          </UnifiedCard>

          <!-- Competency Management Dashboard -->
          <UnifiedCard title="Competency Management" description="Track and manage employee competencies"
            :icon="AcademicCapIcon" iconVariant="primary" variant="elevated">
            <template #headerActions>
              <button @click="navigateTo('assessment-dashboard')"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
                View Details
                <ChevronRightIcon class="w-4 h-4 ml-1" />
              </button>
            </template>

            <!-- Competency Metrics Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <div class="text-2xl font-bold text-green-600">{{ adminStats.completedAssessmentsThisMonth || 0 }}</div>
                <div class="text-xs text-gray-600 mt-1">Completed</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div class="text-2xl font-bold text-orange-600">{{ adminStats.pendingAssessments || 0 }}</div>
                <div class="text-xs text-gray-600 mt-1">Pending</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div class="text-2xl font-bold text-purple-600">{{ adminStats.activeAssessmentCycles || 0 }}</div>
                <div class="text-xs text-gray-600 mt-1">Active Cycles</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div class="text-2xl font-bold text-blue-600">{{ adminStats.averageRating || '-' }}</div>
                <div class="text-xs text-gray-600 mt-1">Avg Rating</div>
              </div>
            </div>

            <!-- Recent Activity -->
            <!-- <div class="space-y-3">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Recent Competency Activity</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-sm text-gray-700">Q4 Performance Review cycle started</span>
                  </div>
                  <span class="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span class="text-sm text-gray-700">5 new assessments submitted</span>
                  </div>
                  <span class="text-xs text-gray-500">4 hours ago</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span class="text-sm text-gray-700">Leadership competency updated</span>
                  </div>
                  <span class="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div> -->
          </UnifiedCard>
        </div>

        <!-- Right Column: Quick Actions & Insights -->
        <div class="lg:col-span-1 space-y-4">

          <!-- Quick Actions -->
          <UnifiedCard title="Quick Actions" description="Common tasks" :icon="PlusIcon" iconVariant="primary">
            <div class="space-y-3">
              <button @click="navigateTo('competencies.create')"
                class="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all group shadow-lg shadow-blue-500/25">
                <div class="flex items-center">
                  <AcademicCapIcon class="w-5 h-5 mr-3" />
                  <span class="font-medium">Add Competency</span>
                </div>
                <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button @click="navigateTo('employees.index')"
                class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
                <div class="flex items-center">
                  <UsersIcon class="w-5 h-5 mr-3" />
                  <span class="font-medium">Manage Employees</span>
                </div>
                <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button @click="navigateTo('assessment-cycles.create')"
                class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
                <div class="flex items-center">
                  <PlusIcon class="w-5 h-5 mr-3" />
                  <span class="font-medium">New Assessment Cycle</span>
                </div>
                <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button @click="navigateTo('reports.index')"
                class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
                <div class="flex items-center">
                  <ChartBarIcon class="w-5 h-5 mr-3" />
                  <span class="font-medium">View Reports</span>
                </div>
                <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button @click="navigateTo('admin.roles.index')"
                class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
                <div class="flex items-center">
                  <CogIcon class="w-5 h-5 mr-3" />
                  <span class="font-medium">Role Management</span>
                </div>
                <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </UnifiedCard>

          <!-- Birthday Notifications -->
          <BirthdayNotifications :todays-birthdays="birthdayData.todaysBirthdays"
            :upcoming-birthdays="birthdayData.upcomingBirthdays" :stats="birthdayData.stats" />

          <!-- System Status -->
          <UnifiedCard title="System Status" description="All systems operational" :icon="CheckCircleIcon"
            iconVariant="success">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Database</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">API Services</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Uptime</span>
                <span class="text-sm font-medium text-gray-900">{{ adminStats.systemUptime }}%</span>
              </div>
            </div>
          </UnifiedCard>
        </div>
      </div>
    </div>

    <!-- Manager Dashboard Layout -->
    <!-- <div v-else-if="isManager" class="manager-layout">
      <ManagerDashboard :stats="managerStats" :team-members="teamMembers" :team-performance="teamPerformance"
        :team-activities="teamActivities" :loading="loading" @view-member="handleViewMember"
        @send-message="handleSendMessage" />
    </div> -->

    <!-- Employee Dashboard Layout -->
    <div v-else class="employee-layout">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Dashboard Content -->
        <div class="lg:col-span-3">
          <EmployeeDashboard :stats="employeeStats" :personal-activities="personalActivities" :my-tasks="myTasks"
            :recent-feedback="recentFeedback" :clocked-in="clockedIn" :current-attendance="currentAttendance"
            :birthday-notifications="birthdayData" :loading="loading" @clock-in-out="handleClockInOut"
            @action="handleAction" @toggle-task="handleToggleTask" @view-task="handleViewTask" />
        </div>

        <!-- Right Sidebar -->
        <!-- <div class="lg:col-span-1 space-y-4">  -->
        <!-- Additional widgets can be added here -->
        <!-- </div> -->
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelRejection"></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
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
                    <textarea id="rejection-reason" v-model="rejectionReason" rows="4"
                      class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide a clear reason for rejecting this request..." required></textarea>
                    <p class="text-xs text-gray-500 mt-1">
                      This reason will be sent to the employee and recorded in the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmRejection" :disabled="!rejectionReason.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Reject Request
            </button>
            <button @click="cancelRejection"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Birthday Popup -->
    <BirthdayPopup v-if="birthdayData?.currentUserBirthday" :show="showBirthdayPopup"
      :employee="birthdayData.currentUserBirthday" @close="closeBirthdayPopup" />
  </AuthenticatedLayout>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { useAuth } from '@/composables/useAuth.js';
  import { router } from '@inertiajs/vue3';
  import axios from 'axios';
  import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

  // Unified UI Components
  import UnifiedCard from '@/Components/UI/UnifiedCard.vue';
  import UnifiedStatsCard from '@/Components/UI/UnifiedStatsCard.vue';

  // Dashboard Components

  import ManagerDashboard from '@/Components/Dashboard/ManagerDashboard.vue';
  import EmployeeDashboard from '@/Components/Dashboard/EmployeeDashboard.vue';
  import ApprovalModal from '@/Components/Dashboard/ApprovalModal.vue';

  // Widget Components
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

  import MyTasksWidget from '@/Components/Dashboard/MyTasksWidget.vue';
  import RecentFeedbackWidget from '@/Components/Dashboard/RecentFeedbackWidget.vue';
  import PersonalActivitiesWidget from '@/Components/Dashboard/PersonalActivitiesWidget.vue';
  import CompetencyDashboardWidget from '@/Components/Dashboard/CompetencyDashboardWidget.vue';
  import BirthdayNotifications from '@/Components/Dashboard/BirthdayNotifications.vue';
  import BirthdayPopup from '@/Components/Dashboard/BirthdayPopup.vue';

  // Icons
  import {
    ClockIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    PlusIcon,
    ChartBarIcon,
    CogIcon,
    ArrowTrendingUpIcon
  } from '@heroicons/vue/24/outline';

  import { CakeIcon } from '@heroicons/vue/24/solid';

  // Props
  const props = defineProps({
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
    pendingApprovals: {
      type: Array,
      default: () => []
    },
    teamMembers: {
      type: Array,
      default: () => []
    },
    teamPerformance: {
      type: Object,
      default: () => ({})
    },
    teamActivities: {
      type: Array,
      default: () => []
    },
    personalActivities: {
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
      default: null
    },
    birthdayData: {
      type: Object,
      default: () => ({
        todaysBirthdays: [],
        upcomingBirthdays: [],
        stats: {}
      })
    }
  });

  // Composables
  const { user, roles: userRoles } = useAuth();

  // Reactive data
  const loading = ref(false);
  const showRejectionModal = ref(false);
  const rejectionItem = ref(null);
  const rejectionReason = ref('');
  const showBirthdayPopup = ref(false);

  // Computed properties
  const isAdmin = computed(() => {
    const result = Array.isArray(userRoles.value) && userRoles.value.includes('Admin');
    console.log('Dashboard - User:', user.value);
    console.log('Dashboard - Roles:', userRoles.value);
    console.log('Dashboard - Is Admin:', result);
    return result;
  });

  const isManager = computed(() => {
    return Array.isArray(userRoles.value) && (
      userRoles.value.includes('Manager') ||
      userRoles.value.includes('HR')
    ) && !isAdmin.value;
  });

  const pageTitle = computed(() => {
    if (isAdmin.value) return 'Admin Dashboard';
    if (isManager.value) return 'Manager Dashboard';
    return 'My Dashboard';
  });

  const pageSubtitle = computed(() => {
    if (isAdmin.value) return 'System overview and administrative management tools';
    if (isManager.value) return 'Team management and performance overview';
    return 'Your personal workspace and activities';
  });

  const currentTime = computed(() => {
    return new Date().toLocaleTimeString();
  });

  const headerActions = computed(() => {
    const actions = [
      {
        id: 'refresh',
        label: 'Refresh',
        icon: 'ArrowPathIcon',
        handler: handleRefresh,
        disabled: loading.value
      }
    ];

    if (isAdmin.value) {
      actions.unshift(
        {
          id: 'settings',
          label: 'System Settings',
          icon: 'CogIcon',
          handler: () => navigateTo('admin.roles.index')
        },
        {
          id: 'reports',
          label: 'View Reports',
          icon: 'ChartBarIcon',
          handler: () => navigateTo('reports.index'),
          primary: true
        }
      );
    }

    return actions;
  });

  // Methods
  const navigateTo = (routeName) => {
    try {
      router.visit(route(routeName));
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      ArrowPathIcon,
      CogIcon,
      ChartBarIcon,
      ClockIcon
    };
    return iconMap[iconName] || ClockIcon;
  };

  const handleRefresh = async () => {
    loading.value = true;
    try {
      await router.reload({ only: ['adminStats', 'managerStats', 'employeeStats', 'pendingApprovals'] });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      loading.value = false;
    }
  };



  const cancelRejection = () => {
    showRejectionModal.value = false;
    rejectionItem.value = null;
    rejectionReason.value = '';
  };

  const handleViewMember = (member) => {
    navigateTo('employees.show', { employee: member.id });
  };

  const handleSendMessage = (member) => {
    // Implement messaging functionality
    console.log('Send message to:', member);
  };

  const handleClockInOut = async () => {
    loading.value = true;
    try {
      // Get current status first
      const statusResponse = await axios.get('/api/attendance/current');
      const currentStatus = statusResponse.data;

      // Handle null or invalid response
      if (!currentStatus || typeof currentStatus !== 'object') {
        throw new Error('Invalid attendance status response');
      }

      // Determine action based on current status
      let endpoint;
      if (!currentStatus.clocked_in) {
        endpoint = '/api/attendance/clock-in';
      } else {
        endpoint = '/api/attendance/clock-out';
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('🎯 Clock in/out successful, response:', response.data);
        
        // Update local state immediately without full refresh
        await updateAttendanceStatus();
      }
    } catch (error) {
      console.error('Clock in/out error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Clock in/out failed. Please try again.';
      
      if (error.message === 'Invalid attendance status response') {
        errorMessage = 'Unable to get attendance status. Please ensure you have an employee profile.';
      } else if (error.response?.status === 419) {
        // CSRF token mismatch - refresh page
        window.location.reload();
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // You can add a toast notification here if you have one
      alert(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  const updateAttendanceStatus = async () => {
    try {
      // First, verify the current status via API
      const statusCheck = await axios.get('/api/attendance/current');
      console.log('🔍 API status check before reload:', statusCheck.data);
      
      // Use Inertia to reload only the attendance-related props
      await router.reload({ 
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true,
        preserveState: true
      });
      
      console.log('✅ Attendance status updated via Inertia reload');
    } catch (error) {
      console.error('Failed to update attendance status:', error);
      // Fallback to page reload if Inertia reload fails
      window.location.reload();
    }
  };

  const handleAction = async (action) => {
    if (action.route) {
      // Handle route-based actions (like quick actions)
      navigateTo(action.route);
    } else if (action.type) {
      // Handle break actions
      try {
        loading.value = true;

        if (action.type === 'take-break') {
          await axios.post('/api/attendance/break-start', {}, {
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
        } else if (action.type === 'end-break') {
          await axios.post('/api/attendance/break-end', {}, {
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
        }

        // Update attendance status after break action
        await updateAttendanceStatus();
      } catch (error) {
        console.error('Break action failed:', error);
        if (error.response?.status === 419) {
          // CSRF token mismatch - refresh page
          window.location.reload();
        }
      } finally {
        loading.value = false;
      }
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await axios.patch(route('tasks.toggle', task.id));
      await handleRefresh();
    } catch (error) {
      console.error('Task toggle error:', error);
    }
  };

  const handleViewTask = (task) => {
    navigateTo('tasks.show', { task: task.id });
  };

  // Birthday popup logic
  const checkAndShowBirthdayPopup = () => {
    if (props.birthdayData?.currentUserBirthday) {
      // Show popup after a short delay to let the page load
      setTimeout(() => {
        showBirthdayPopup.value = true;
      }, 1000);
    }
  };

  const closeBirthdayPopup = () => {
    showBirthdayPopup.value = false;
  };



  // Check for birthday popup on component mount
  import { onMounted } from 'vue';
  onMounted(() => {
    checkAndShowBirthdayPopup();
  });
</script>