<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Pending Timesheet Approvals"
      subtitle="Review and approve employee timesheet submissions"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Employee Filter -->
          <div class="flex-1 min-w-48">
            <label for="employee-filter" class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              id="employee-filter"
              v-model="filters.employee"
              @change="applyFilters"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Employees</option>
              <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
                {{ employee.name }}
              </option>
            </select>
          </div>

          <!-- Project Filter -->
          <div class="flex-1 min-w-48">
            <label for="project-filter" class="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              id="project-filter"
              v-model="filters.project"
              @change="applyFilters"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Projects</option>
              <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div class="flex-1 min-w-48">
            <label for="date-from" class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              id="date-from"
              v-model="filters.date_from"
              @change="applyFilters"
              type="date"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div class="flex-1 min-w-48">
            <label for="date-to" class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              id="date-to"
              v-model="filters.date_to"
              @change="applyFilters"
              type="date"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <!-- Clear Filters Button -->
          <div class="flex items-end">
            <button
              @click="clearAllFilters"
              :disabled="!hasActiveFilters"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Header with Stats -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Pending Approvals</h3>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                {{ timesheets.total }} pending
              </span>
              <button
                v-if="selectedTimesheets.length > 0"
                @click="showBulkApprovalModal = true"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Bulk Approve ({{ selectedTimesheets.length }})
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="timesheet in timesheets.data" :key="timesheet.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    :value="timesheet.id"
                    v-model="selectedTimesheets"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-indigo-700">
                          {{ getInitials(timesheet.employee?.user?.name) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {{ timesheet.employee?.user?.name || 'Unknown' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ timesheet.employee?.employee_code || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(timesheet.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ timesheet.project?.name || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ timesheet.task?.name || 'No task' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ timesheet.hours }}h
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ timesheet.description || 'No description' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatTimeAgo(timesheet.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="approveTimesheet(timesheet)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Approve
                    </button>
                    <button
                      @click="rejectTimesheet(timesheet)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!timesheets.data.length" class="py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p class="mt-1 text-sm text-gray-500">All timesheets have been reviewed.</p>
        </div>
      </div>

      <!-- Bulk Approval Modal -->
      <div v-if="showBulkApprovalModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Bulk Approve Timesheets</h3>
          
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              You are about to approve {{ selectedTimesheets.length }} timesheet(s).
            </p>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
              <textarea
                v-model="bulkApprovalComments"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add comments for all selected timesheets..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showBulkApprovalModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="performBulkApproval"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Approve All
            </button>
          </div>
        </div>
      </div>

      <!-- Approval Modal -->
      <div v-if="showApprovalModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ approvalAction === 'approve' ? 'Approve' : 'Reject' }} Timesheet
          </h3>
          
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm">
                <div class="font-medium text-gray-900">{{ selectedTimesheet?.employee?.user?.name }}</div>
                <div class="text-gray-600">{{ formatDate(selectedTimesheet?.date) }} - {{ selectedTimesheet?.hours }}h</div>
                <div class="text-gray-600">{{ selectedTimesheet?.project?.name }}</div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Comments {{ approvalAction === 'reject' ? '(Required)' : '(Optional)' }}
              </label>
              <textarea
                v-model="approvalComments"
                rows="3"
                :required="approvalAction === 'reject'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :placeholder="approvalAction === 'approve' ? 'Add approval comments...' : 'Please provide reason for rejection...'"
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showApprovalModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="performApproval"
              :disabled="approvalAction === 'reject' && !approvalComments.trim()"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg',
                approvalAction === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700',
                (approvalAction === 'reject' && !approvalComments.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ approvalAction === 'approve' ? 'Approve' : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'

const props = defineProps({
  timesheets: {
    type: Object,
    required: true
  },
  availableEmployees: {
    type: Array,
    default: () => []
  },
  availableProjects: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Local state
const loading = ref(false)
const selectedTimesheets = ref([])
const showBulkApprovalModal = ref(false)
const showApprovalModal = ref(false)
const selectedTimesheet = ref(null)
const approvalAction = ref('approve')
const approvalComments = ref('')

// Filter state
const filters = ref({
  employee: props.filters.employee || '',
  project: props.filters.project || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || ''
})
const bulkApprovalComments = ref('')

// Computed properties
const allSelected = computed(() => {
  return props.timesheets.data.length > 0 && 
         selectedTimesheets.value.length === props.timesheets.data.length
})

// Filter-related computed properties
const hasActiveFilters = computed(() => {
  return filters.value.employee || 
         filters.value.project || 
         filters.value.date_from || 
         filters.value.date_to
})

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Timesheets', href: route('timesheets.index') },
  { label: 'Pending Approvals', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'view-all-timesheets',
    label: 'View All Timesheets',
    variant: 'secondary',
    handler: () => router.visit(route('timesheets.index'))
  }
]

// Methods
const getInitials = (name) => {
  if (!name) return 'N/A'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTimesheets.value = []
  } else {
    selectedTimesheets.value = props.timesheets.data.map(t => t.id)
  }
}

const approveTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  approvalAction.value = 'approve'
  approvalComments.value = ''
  showApprovalModal.value = true
}

const rejectTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  approvalAction.value = 'reject'
  approvalComments.value = ''
  showApprovalModal.value = true
}

const performApproval = () => {
  if (approvalAction.value === 'reject' && !approvalComments.value.trim()) {
    return
  }

  loading.value = true
  const endpoint = approvalAction.value === 'approve' 
    ? route('timesheets.approve', selectedTimesheet.value.id)
    : route('timesheets.reject', selectedTimesheet.value.id)

  router.post(endpoint, {
    comments: approvalComments.value.trim()
  }, {
    onSuccess: () => {
      showApprovalModal.value = false
      selectedTimesheet.value = null
      approvalComments.value = ''
    },
    onFinish: () => {
      loading.value = false
    }
  })
}

const performBulkApproval = () => {
  if (selectedTimesheets.value.length === 0) return

  loading.value = true
  router.post(route('timesheets.bulk-approve'), {
    timesheet_ids: selectedTimesheets.value,
    comments: bulkApprovalComments.value.trim()
  }, {
    onSuccess: () => {
      showBulkApprovalModal.value = false
      selectedTimesheets.value = []
      bulkApprovalComments.value = ''
    },
    onFinish: () => {
      loading.value = false
    }
  })
}

// Filter methods
const applyFilters = () => {
  const queryParams = new URLSearchParams()
  
  // Add non-empty filter values to query params
  Object.keys(filters.value).forEach(key => {
    if (filters.value[key]) {
      queryParams.set(key, filters.value[key])
    }
  })
  
  // Navigate with filters
  const url = route('timesheets.pending-approvals') + (queryParams.toString() ? '?' + queryParams.toString() : '')
  router.visit(url, {
    preserveState: true,
    preserveScroll: true
  })
}

const clearAllFilters = () => {
  // Reset all filter values
  filters.value = {
    employee: '',
    project: '',
    date_from: '',
    date_to: ''
  }
  
  // Navigate to the page without any query parameters
  router.visit(route('timesheets.pending-approvals'), {
    preserveState: false,
    preserveScroll: true
  })
}
</script>