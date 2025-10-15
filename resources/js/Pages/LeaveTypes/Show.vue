<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="leaveType.name"
      subtitle="Leave policy details and usage statistics"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

      <!-- Policy Status Badge -->
      <div class="mb-6">
        <span
          :class="{
            'bg-success-100 text-success-800 border-success-200': leaveType.is_active,
            'bg-neutral-100 text-neutral-800 border-neutral-200': !leaveType.is_active
          }"
          class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border"
        >
          <div :class="{
            'bg-success-400': leaveType.is_active,
            'bg-neutral-400': !leaveType.is_active
          }" class="w-2 h-2 rounded-full mr-2"></div>
          {{ leaveType.is_active ? 'Active Policy' : 'Inactive Policy' }}
        </span>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SimpleInfoCard
          title="Annual Quota"
          :value="`${leaveType.quota} days`"
          icon="calendar-days"
          color="primary"
        />
        <SimpleInfoCard
          title="Total Requests"
          :value="totalRequests"
          icon="document-text"
          color="info"
        />
        <SimpleInfoCard
          title="Approved"
          :value="approvedRequests"
          icon="check-circle"
          color="success"
        />
        <SimpleInfoCard
          title="Pending"
          :value="pendingRequests"
          icon="clock"
          color="warning"
        />
      </div>

      <!-- Policy Details and Usage -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Policy Configuration -->
        <ContentCard title="Policy Configuration" subtitle="Leave type settings and restrictions">
          <ContentSection title="Basic Information">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Leave Type Name</span>
                <span class="text-sm font-semibold text-neutral-900">{{ leaveType.name }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Annual Quota</span>
                <span class="text-sm font-semibold text-neutral-900">{{ leaveType.quota }} days</span>
              </div>
              <div v-if="leaveType.description" class="py-2">
                <span class="text-sm font-medium text-neutral-600 block mb-2">Description</span>
                <p class="text-sm text-neutral-900 bg-neutral-50 rounded-lg p-3">{{ leaveType.description }}</p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Policy Settings">
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-medium text-neutral-600">Requires Approval</span>
                <span class="inline-flex items-center">
                  <CheckIcon v-if="leaveType.requires_approval" class="w-4 h-4 text-success-500 mr-2" />
                  <XMarkIcon v-else class="w-4 h-4 text-neutral-400 mr-2" />
                  <span class="text-sm font-medium" :class="leaveType.requires_approval ? 'text-success-700' : 'text-neutral-600'">
                    {{ leaveType.requires_approval ? 'Yes' : 'No' }}
                  </span>
                </span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-medium text-neutral-600">Carry Forward</span>
                <span class="inline-flex items-center">
                  <CheckIcon v-if="leaveType.carry_forward" class="w-4 h-4 text-success-500 mr-2" />
                  <XMarkIcon v-else class="w-4 h-4 text-neutral-400 mr-2" />
                  <span class="text-sm font-medium" :class="leaveType.carry_forward ? 'text-success-700' : 'text-neutral-600'">
                    {{ leaveType.carry_forward ? 'Allowed' : 'Not Allowed' }}
                  </span>
                </span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-medium text-neutral-600">Status</span>
                <span class="inline-flex items-center">
                  <CheckIcon v-if="leaveType.is_active" class="w-4 h-4 text-success-500 mr-2" />
                  <XMarkIcon v-else class="w-4 h-4 text-neutral-400 mr-2" />
                  <span class="text-sm font-medium" :class="leaveType.is_active ? 'text-success-700' : 'text-neutral-600'">
                    {{ leaveType.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </span>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Restrictions & Limits">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Max Consecutive Days</span>
                <span class="text-sm font-semibold text-neutral-900">
                  {{ leaveType.max_consecutive_days || 'No limit' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Minimum Notice</span>
                <span class="text-sm font-semibold text-neutral-900">
                  {{ leaveType.min_notice_days ? `${leaveType.min_notice_days} days` : 'No requirement' }}
                </span>
              </div>
            </div>
          </ContentSection>
        </ContentCard>

        <!-- Usage Statistics -->
        <ContentCard title="Usage Statistics" subtitle="Request analytics and trends">
          <ContentSection title="Request Status Breakdown">
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-neutral-600">Approved</span>
                </div>
                <span class="text-sm font-semibold text-neutral-900">{{ approvedRequests }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-warning-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-neutral-600">Pending</span>
                </div>
                <span class="text-sm font-semibold text-neutral-900">{{ pendingRequests }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-error-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-neutral-600">Rejected</span>
                </div>
                <span class="text-sm font-semibold text-neutral-900">{{ rejectedRequests }}</span>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Usage Trends">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">This Month</span>
                <span class="text-sm font-semibold text-neutral-900">{{ thisMonthRequests }} requests</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Last Month</span>
                <span class="text-sm font-semibold text-neutral-900">{{ lastMonthRequests }} requests</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-100">
                <span class="text-sm font-medium text-neutral-600">Average per Month</span>
                <span class="text-sm font-semibold text-neutral-900">{{ averageMonthlyRequests }} requests</span>
              </div>
            </div>
          </ContentSection>

          <ContentSection v-if="topUsers.length > 0" title="Most Active Users">
            <div class="space-y-3">
              <div
                v-for="(user, index) in topUsers.slice(0, 5)"
                :key="user.id"
                class="flex items-center justify-between py-2"
              >
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-xs font-medium text-primary-700">{{ index + 1 }}</span>
                  </div>
                  <span class="text-sm font-medium text-neutral-900">{{ user.name }}</span>
                </div>
                <span class="text-sm font-semibold text-neutral-600">{{ user.requests_count }} requests</span>
              </div>
            </div>
          </ContentSection>
        </ContentCard>
      </div>

      <!-- Recent Leave Requests -->
      <ContentCard v-if="recentLeaves.length > 0" title="Recent Leave Requests" subtitle="Latest requests for this leave type">
        <template #actions>
          <button
            @click="$inertia.visit(route('leaves.index', { type: leaveType.name }))"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-150"
          >
            View All →
          </button>
        </template>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Dates
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Days
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Requested
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="leave in recentLeaves" :key="leave.id" class="hover:bg-neutral-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-xs font-medium text-primary-700">
                        {{ getInitials(leave.employee?.user?.name || 'U') }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-neutral-900">
                      {{ leave.employee?.user?.name || 'Unknown' }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-neutral-900">
                    {{ formatDate(leave.from_date) }} - {{ formatDate(leave.to_date) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-neutral-900">
                    {{ calculateDays(leave.from_date, leave.to_date) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-success-100 text-success-800': leave.status === 'approved',
                      'bg-warning-100 text-warning-800': leave.status === 'pending',
                      'bg-error-100 text-error-800': leave.status === 'rejected'
                    }"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ leave.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {{ formatDate(leave.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ContentCard>

      <!-- Actions -->
      <ContentCard v-if="canEdit || canDelete" title="Policy Actions" subtitle="Manage this leave policy">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              v-if="canEdit"
              @click="$inertia.visit(route('leave-types.edit', leaveType.id))"
              class="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
            >
              <PencilIcon class="w-4 h-4 mr-2" />
              Edit Policy
            </button>
            <button
              v-if="canDelete && totalRequests === 0"
              @click="deleteLeaveType"
              class="inline-flex items-center px-4 py-2 bg-error-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-colors duration-150"
            >
              <TrashIcon class="w-4 h-4 mr-2" />
              Delete Policy
            </button>
          </div>
          <div v-if="canDelete && totalRequests > 0" class="text-sm text-neutral-500 bg-neutral-100 px-3 py-2 rounded-lg">
            <InformationCircleIcon class="w-4 h-4 inline mr-1" />
            Cannot delete: {{ totalRequests }} leave requests exist for this type
          </div>
        </div>
      </ContentCard>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import ContentSection from '@/Components/Layout/ContentSection.vue'
import SimpleInfoCard from '@/Components/UI/SimpleInfoCard.vue'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  leaveType: Object,
  canEdit: Boolean,
  canDelete: Boolean
})

// Breadcrumbs for consistent navigation
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Policies', href: route('leave-types.index') },
  { label: props.leaveType.name, current: true }
])

// Header actions
const headerActions = computed(() => {
  const actions = []
  
  if (props.canEdit) {
    actions.push({
      id: 'edit-policy',
      label: 'Edit Policy',
      icon: 'pencil',
      variant: 'primary',
      handler: () => router.visit(route('leave-types.edit', props.leaveType.id))
    })
  }
  
  return actions
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

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

const deleteLeaveType = () => {
  if (confirm(`Are you sure you want to delete "${props.leaveType.name}"? This action cannot be undone.`)) {
    router.delete(route('leave-types.destroy', props.leaveType.id))
  }
}
</script>