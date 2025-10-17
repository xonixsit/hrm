<template>
  <div class="admin-dashboard space-y-4">
    <!-- System Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UnifiedStatsCard
        :value="stats.totalEmployees || 274"
        label="Total Employees"
        description="Active workforce"
        :icon="UsersIcon"
        variant="primary"
        :trend="stats.employeeTrend || 5.2"
        :loading="loading"
        route="employees.index"
      />
      
      <UnifiedStatsCard
        :value="stats.pendingLeaves || 19"
        label="Pending Approvals"
        description="Requires attention"
        :icon="ExclamationTriangleIcon"
        variant="warning"
        :status="(stats.pendingLeaves || 19) > 10 ? 'critical' : 'warning'"
        :statusText="(stats.pendingLeaves || 19) > 10 ? 'High' : 'Normal'"
        :loading="loading"
        route="leaves.index"
      />
      
      <UnifiedStatsCard
        :value="stats.pendingAssessments || 9"
        label="Pending Assessments"
        description="Review status"
        :icon="AcademicCapIcon"
        variant="info"
        :status="(stats.pendingAssessments || 9) > 5 ? 'warning' : 'good'"
        :statusText="(stats.pendingAssessments || 9) > 5 ? 'Review' : 'On Track'"
        :loading="loading"
        route="competency-assessments.index"
      />

      <UnifiedStatsCard
        value="98.5%"
        label="System Health"
        description="Uptime"
        :icon="CheckCircleIcon"
        variant="success"
        status="excellent"
        statusText="Excellent"
        :clickable="false"
        :loading="loading"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      <!-- Left Column: Action Required & Management -->
      <div class="lg:col-span-2 space-y-4">
        
        <!-- Pending Approvals -->
        <UnifiedCard
          title="Pending Approvals"
          description="Items requiring your approval"
          :icon="ExclamationTriangleIcon"
          iconVariant="warning"
          variant="elevated"
        >
          <template #headerActions>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {{ (stats.pendingLeaves || 19) + (stats.pendingAssessments || 9) }} pending
            </span>
          </template>
          
          <div class="space-y-3">
            <div v-for="approval in pendingApprovals.slice(0, 5)" :key="approval.id" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div>
                  <span class="text-sm font-medium text-gray-700">{{ approval.title }}</span>
                  <p class="text-xs text-gray-500">{{ approval.requester }}</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="$emit('approve', approval)" 
                        class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button @click="$emit('reject', approval)" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </UnifiedCard>

        <!-- System Management -->
        <UnifiedCard
          title="System Management"
          description="Administrative tools and settings"
          :icon="CogIcon"
          iconVariant="primary"
          variant="elevated"
        >
          <div class="grid grid-cols-2 gap-3">
            <button @click="navigateTo('employees.index')" 
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group">
              <UsersIcon class="w-5 h-5 text-gray-600" />
              <span class="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
            
            <button @click="navigateTo('admin.roles.index')" 
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group">
              <CogIcon class="w-5 h-5 text-gray-600" />
              <span class="text-sm font-medium text-gray-700">Role Management</span>
            </button>
            
            <button @click="navigateTo('work-reports.index')" 
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group">
              <ChartBarIcon class="w-5 h-5 text-gray-600" />
              <span class="text-sm font-medium text-gray-700">Reports</span>
            </button>
            
            <button @click="navigateTo('dashboard')" 
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group">
              <ServerIcon class="w-5 h-5 text-gray-600" />
              <span class="text-sm font-medium text-gray-700">System Monitor</span>
            </button>
          </div>
        </UnifiedCard>
      </div>

      <!-- Right Column: Quick Stats & System Info -->
      <div class="lg:col-span-1 space-y-4">
        
        <!-- Quick Actions -->
        <UnifiedCard
          title="Quick Actions"
          description="Common admin tasks"
          :icon="PlusIcon"
          iconVariant="primary"
        >
          <div class="space-y-3">
            <button @click="navigateTo('employees.create')" 
                    class="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all group shadow-lg shadow-blue-500/25">
              <div class="flex items-center">
                <UsersIcon class="w-5 h-5 mr-3" />
                <span class="font-medium">Add Employee</span>
              </div>
              <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button @click="navigateTo('competency-assessments.create')" 
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
              <div class="flex items-center">
                <AcademicCapIcon class="w-5 h-5 mr-3" />
                <span class="font-medium">New Assessment</span>
              </div>
              <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button @click="navigateTo('leave-types.index')" 
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group">
              <div class="flex items-center">
                <CalendarDaysIcon class="w-5 h-5 mr-3" />
                <span class="font-medium">Leave Policies</span>
              </div>
              <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </UnifiedCard>

        <!-- System Status -->
        <UnifiedCard
          title="System Status"
          description="All systems operational"
          :icon="CheckCircleIcon"
          iconVariant="success"
        >
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
              <span class="text-sm text-gray-600">Cache</span>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-green-600">95% Hit Rate</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Uptime</span>
              <span class="text-sm font-medium text-gray-900">98.5%</span>
            </div>
          </div>
        </UnifiedCard>

        <!-- Recent Activity -->
        <UnifiedCard
          title="Recent Activity"
          description="Latest system events"
          :icon="ClockIcon"
          iconVariant="info"
        >
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-2 rounded-lg">
              <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div class="flex-1">
                <span class="text-sm text-gray-700">New employee registered</span>
                <p class="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-2 rounded-lg">
              <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              <div class="flex-1">
                <span class="text-sm text-gray-700">Assessment completed</span>
                <p class="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-2 rounded-lg">
              <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div class="flex-1">
                <span class="text-sm text-gray-700">Leave request submitted</span>
                <p class="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </UnifiedCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import UnifiedCard from '@/Components/UI/UnifiedCard.vue'
import UnifiedStatsCard from '@/Components/UI/UnifiedStatsCard.vue'

// Icons
import {
  UsersIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  PlusIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  },
  pendingApprovals: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['approve', 'reject', 'action'])

const navigateTo = (routeName) => {
  try {
    router.visit(route(routeName))
  } catch (error) {
    console.error('Navigation error:', error)
  }
}
</script>