<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$inertia.visit(route('leave-types.index'))"
            class="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
              {{ leaveType.name }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Leave policy details and usage statistics
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span
            :class="{
              'bg-green-100 text-green-800': leaveType.is_active,
              'bg-red-100 text-red-800': !leaveType.is_active
            }"
            class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
          >
            {{ leaveType.is_active ? 'Active' : 'Inactive' }}
          </span>
          <button
            v-if="canEdit"
            @click="$inertia.visit(route('leave-types.edit', leaveType.id))"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Edit Policy
          </button>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CalendarDaysIcon class="h-8 w-8 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Annual Quota</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ leaveType.quota }} days</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <DocumentTextIcon class="h-8 w-8 text-green-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Requests</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ totalRequests }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CheckCircleIcon class="h-8 w-8 text-purple-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Approved</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ approvedRequests }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ClockIcon class="h-8 w-8 text-orange-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Pending</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ pendingRequests }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Policy Details and Usage -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Policy Configuration -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Policy Configuration</h3>
              
              <div class="space-y-6">
                <!-- Basic Information -->
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">Leave Type Name:</span>
                      <span class="text-sm font-medium text-gray-900">{{ leaveType.name }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">Annual Quota:</span>
                      <span class="text-sm font-medium text-gray-900">{{ leaveType.quota }} days</span>
                    </div>
                    <div v-if="leaveType.description" class="border-t pt-3">
                      <span class="text-sm text-gray-600">Description:</span>
                      <p class="text-sm text-gray-900 mt-1">{{ leaveType.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Policy Settings -->
                <div class="border-t pt-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Policy Settings</h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Requires Approval:</span>
                      <span class="inline-flex items-center">
                        <CheckIcon v-if="leaveType.requires_approval" class="w-4 h-4 text-green-500 mr-1" />
                        <XMarkIcon v-else class="w-4 h-4 text-red-500 mr-1" />
                        <span class="text-sm font-medium" :class="leaveType.requires_approval ? 'text-green-700' : 'text-red-700'">
                          {{ leaveType.requires_approval ? 'Yes' : 'No' }}
                        </span>
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Carry Forward:</span>
                      <span class="inline-flex items-center">
                        <CheckIcon v-if="leaveType.carry_forward" class="w-4 h-4 text-green-500 mr-1" />
                        <XMarkIcon v-else class="w-4 h-4 text-red-500 mr-1" />
                        <span class="text-sm font-medium" :class="leaveType.carry_forward ? 'text-green-700' : 'text-red-700'">
                          {{ leaveType.carry_forward ? 'Allowed' : 'Not Allowed' }}
                        </span>
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Status:</span>
                      <span class="inline-flex items-center">
                        <CheckIcon v-if="leaveType.is_active" class="w-4 h-4 text-green-500 mr-1" />
                        <XMarkIcon v-else class="w-4 h-4 text-red-500 mr-1" />
                        <span class="text-sm font-medium" :class="leaveType.is_active ? 'text-green-700' : 'text-red-700'">
                          {{ leaveType.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Restrictions -->
                <div class="border-t pt-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Restrictions</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">Max Consecutive Days:</span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ leaveType.max_consecutive_days || 'No limit' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">Minimum Notice:</span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ leaveType.min_notice_days ? `${leaveType.min_notice_days} days` : 'No requirement' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Statistics -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Usage Statistics</h3>
              
              <!-- Request Status Breakdown -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Request Status Breakdown</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span class="text-sm text-gray-600">Approved</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ approvedRequests }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span class="text-sm text-gray-600">Pending</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ pendingRequests }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span class="text-sm text-gray-600">Rejected</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ rejectedRequests }}</span>
                  </div>
                </div>
              </div>

              <!-- Usage Trends -->
              <div class="border-t pt-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Usage Trends</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">This Month:</span>
                    <span class="text-sm font-medium text-gray-900">{{ thisMonthRequests }} requests</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Last Month:</span>
                    <span class="text-sm font-medium text-gray-900">{{ lastMonthRequests }} requests</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Average per Month:</span>
                    <span class="text-sm font-medium text-gray-900">{{ averageMonthlyRequests }} requests</span>
                  </div>
                </div>
              </div>

              <!-- Top Users -->
              <div v-if="topUsers.length > 0" class="border-t pt-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Most Active Users</h4>
                <div class="space-y-2">
                  <div
                    v-for="user in topUsers.slice(0, 5)"
                    :key="user.id"
                    class="flex justify-between items-center"
                  >
                    <span class="text-sm text-gray-600">{{ user.name }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ user.requests_count }} requests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Leave Requests -->
        <div v-if="recentLeaves.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900">Recent Leave Requests</h3>
              <button
                @click="$inertia.visit(route('leaves.index', { type: leaveType.name }))"
                class="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View All →
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="leave in recentLeaves" :key="leave.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ leave.employee?.user?.name || 'Unknown' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ formatDate(leave.from_date) }} - {{ formatDate(leave.to_date) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ calculateDays(leave.from_date, leave.to_date) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="{
                          'bg-green-100 text-green-800': leave.status === 'approved',
                          'bg-yellow-100 text-yellow-800': leave.status === 'pending',
                          'bg-red-100 text-red-800': leave.status === 'rejected'
                        }"
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      >
                        {{ leave.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(leave.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="canEdit || canDelete" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div class="flex items-center space-x-4">
              <button
                v-if="canEdit"
                @click="$inertia.visit(route('leave-types.edit', leaveType.id))"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit Policy
              </button>
              <button
                v-if="canDelete && totalRequests === 0"
                @click="deleteLeaveType"
                class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                <TrashIcon class="w-4 h-4 mr-2" />
                Delete Policy
              </button>
              <div v-else-if="canDelete" class="text-sm text-gray-500">
                Cannot delete: {{ totalRequests }} leave requests exist for this type
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  leaveType: Object,
  canEdit: Boolean,
  canDelete: Boolean
})

// Computed statistics
const totalRequests = computed(() => {
  return props.leaveType.leaves?.length || 0
})

const approvedRequests = computed(() => {
  return props.leaveType.leaves?.filter(leave => leave.status === 'approved').length || 0
})

const pendingRequests = computed(() => {
  return props.leaveType.leaves?.filter(leave => leave.status === 'pending').length || 0
})

const rejectedRequests = computed(() => {
  return props.leaveType.leaves?.filter(leave => leave.status === 'rejected').length || 0
})

const recentLeaves = computed(() => {
  return props.leaveType.leaves?.slice(0, 10) || []
})

const thisMonthRequests = computed(() => {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  return props.leaveType.leaves?.filter(leave => {
    const leaveDate = new Date(leave.created_at)
    return leaveDate.getMonth() === thisMonth && leaveDate.getFullYear() === thisYear
  }).length || 0
})

const lastMonthRequests = computed(() => {
  const lastMonth = new Date().getMonth() - 1
  const year = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
  const month = lastMonth < 0 ? 11 : lastMonth
  
  return props.leaveType.leaves?.filter(leave => {
    const leaveDate = new Date(leave.created_at)
    return leaveDate.getMonth() === month && leaveDate.getFullYear() === year
  }).length || 0
})

const averageMonthlyRequests = computed(() => {
  if (!props.leaveType.leaves?.length) return 0
  
  const oldestLeave = props.leaveType.leaves.reduce((oldest, leave) => {
    return new Date(leave.created_at) < new Date(oldest.created_at) ? leave : oldest
  })
  
  const monthsDiff = Math.max(1, Math.ceil((new Date() - new Date(oldestLeave.created_at)) / (1000 * 60 * 60 * 24 * 30)))
  return Math.round(totalRequests.value / monthsDiff)
})

const topUsers = computed(() => {
  if (!props.leaveType.leaves?.length) return []
  
  const userCounts = {}
  props.leaveType.leaves.forEach(leave => {
    const userName = leave.employee?.user?.name || 'Unknown'
    const userId = leave.employee?.user?.id || 'unknown'
    
    if (!userCounts[userId]) {
      userCounts[userId] = {
        id: userId,
        name: userName,
        requests_count: 0
      }
    }
    userCounts[userId].requests_count++
  })
  
  return Object.values(userCounts).sort((a, b) => b.requests_count - a.requests_count)
})

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const calculateDays = (fromDate, toDate) => {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  const diffTime = Math.abs(to - from)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

const deleteLeaveType = () => {
  if (confirm(`Are you sure you want to delete "${props.leaveType.name}"? This action cannot be undone.`)) {
    router.delete(route('leave-types.destroy', props.leaveType.id))
  }
}
</script>