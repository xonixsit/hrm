<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Employees"
      subtitle="Manage your organization's employees and their information"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Enhanced Filter & Search Section -->
      <div class="mb-8 space-y-6">
        <!-- Search Bar - Primary Action -->
        <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon name="magnifying-glass" class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900">Find Employees</h3>
                <p class="text-sm text-neutral-600">Search by name, email, job title, or employee code</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-sm text-neutral-500">
              <span>{{ employees.total }} total employees</span>
              <span v-if="hasActiveFilters" class="text-primary-600 font-medium">
                • {{ activeFilterCount }} filters active
              </span>
            </div>
          </div>
          
          <div class="relative">
            <input
              type="text"
              :value="currentSearch"
              @input="handleSearchInput"
              placeholder="Search employees by name, email, job title, or employee code..."
              class="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg text-base placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <Icon name="magnifying-glass" class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <button
              v-if="currentSearch"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Icon name="x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-xl shadow-sm border border-neutral-200">
          <!-- Filter Header -->
          <div class="px-6 py-4 border-b border-neutral-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="funnel" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900">Filter Options</h3>
                  <p class="text-sm text-neutral-600">Narrow down your employee search</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  v-if="hasActiveFilters"
                  @click="handleClearFilters"
                  class="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                >
                  Clear all filters
                </button>
                <button
                  @click="toggleFilters"
                  class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  <span>{{ filtersExpanded ? 'Hide' : 'Show' }} Filters</span>
                  <Icon 
                    :name="filtersExpanded ? 'chevron-up' : 'chevron-down'" 
                    class="w-4 h-4 transition-transform duration-200"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="px-6 py-4 bg-blue-50 border-b border-neutral-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-blue-900">Active Filters</span>
              <span class="text-xs text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                {{ activeFilterCount }} active
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="filter in activeFiltersDisplay"
                :key="filter.key"
                class="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-blue-200 rounded-full text-sm"
              >
                <span class="font-medium text-blue-900">{{ filter.label }}:</span>
                <span class="text-blue-700">{{ filter.value }}</span>
                <button
                  @click="removeFilter(filter)"
                  class="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Icon name="x-mark" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Filter Controls -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-screen"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 max-h-screen"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="filtersExpanded" class="px-6 py-6 overflow-hidden">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Department Filter -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-neutral-900">
                    Department
                    <span v-if="selectedDepartments.length > 0" class="text-primary-600 font-normal">
                      ({{ selectedDepartments.length }} selected)
                    </span>
                  </label>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <label
                      v-for="dept in availableDepartments"
                      :key="dept.id"
                      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        :value="dept.id.toString()"
                        :checked="selectedDepartments.includes(dept.id.toString())"
                        @change="toggleDepartment(dept.id.toString())"
                        class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span class="text-sm text-neutral-700">{{ dept.name }}</span>
                    </label>
                  </div>
                </div>

                <!-- Employment Type Filter -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-neutral-900">
                    Employment Type
                    <span v-if="selectedContractTypes.length > 0" class="text-primary-600 font-normal">
                      ({{ selectedContractTypes.length }} selected)
                    </span>
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="type in availableContractTypes"
                      :key="type"
                      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        :value="type"
                        :checked="selectedContractTypes.includes(type)"
                        @change="toggleContractType(type)"
                        class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <div class="flex items-center space-x-2">
                        <div :class="getContractIndicator(type)" class="w-2 h-2 rounded-full"></div>
                        <span class="text-sm text-neutral-700">{{ type }}</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Status Filter -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-neutral-900">
                    Status
                    <span v-if="selectedStatuses.length > 0" class="text-primary-600 font-normal">
                      ({{ selectedStatuses.length }} selected)
                    </span>
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="status in availableStatuses"
                      :key="status"
                      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        :value="status"
                        :checked="selectedStatuses.includes(status)"
                        @change="toggleStatus(status)"
                        class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <div class="flex items-center space-x-2">
                        <div :class="status === 'active' ? 'bg-green-500' : 'bg-neutral-400'" class="w-2 h-2 rounded-full"></div>
                        <span class="text-sm text-neutral-700">{{ status.charAt(0).toUpperCase() + status.slice(1) }}</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Date Range Filter -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-neutral-900">Join Date Range</label>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs text-neutral-600 mb-1">From</label>
                      <input
                        type="date"
                        :value="dateFilters.from"
                        @change="updateDateFilter('from', $event.target.value)"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-neutral-600 mb-1">To</label>
                      <input
                        type="date"
                        :value="dateFilters.to"
                        @change="updateDateFilter('to', $event.target.value)"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Filter Actions -->
              <div class="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200">
                <button
                  @click="handleResetFilters"
                  class="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Reset All
                </button>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-neutral-600">
                    {{ employees.total }} employees found
                  </span>
                  <button
                    @click="applyFilters"
                    class="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <ContentCard>
        <DataTable
          :data="employees.data"
          :columns="columns"
          :loading="loading"
          :row-actions="rowActions"
          :search-config="searchConfig"
          :empty-state="emptyState"
          :show-footer="true"
          :server-side-pagination="true"
          :current-page="employees.current_page"
          :total-pages="employees.last_page"
          :total-items="employees.total"
          :page-size="employees.per_page"
          :page-size-options="[10, 25, 50, 100]"
          @row-action="handleRowAction"
          @search="handleSearch"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          class="w-full"
        >
      <!-- Enhanced employee profile card -->
      <template #cell-name="{ row }">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 relative">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
              <span class="text-sm font-semibold text-primary-700">
                {{ getInitials(row.user.name) }}
              </span>
            </div>
            <!-- Online status indicator -->
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-neutral-900 truncate">{{ row.user.name }}</div>
            <div class="flex items-center space-x-2 text-sm text-neutral-500">
              <span class="truncate">{{ row.employee_code || 'No code' }}</span>
              <span v-if="row.user.email_verified_at" class="text-green-600" title="Verified">
                <Icon name="check-badge" class="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom cell for email -->
      <template #cell-email="{ row }">
        <div class="text-sm">
          <div v-if="row.user.email" class="text-neutral-900">
            {{ row.user.email }}
          </div>
          <div v-else class="text-neutral-400 italic">
            No email provided
          </div>
        </div>
      </template>

      <!-- Modern department cell - minimal design -->
      <template #cell-department="{ row }">
        <div class="text-sm">
          <span v-if="row.department" class="text-neutral-900 font-medium">
            {{ row.department.name }}
          </span>
          <span v-else class="text-neutral-400 italic">
            Unassigned
          </span>
        </div>
      </template>

      <!-- Modern contract type cell - subtle indicators -->
      <template #cell-contract_type="{ row }">
        <div class="flex items-center space-x-2">
          <div :class="getContractIndicator(row.contract_type)" class="w-2 h-2 rounded-full flex-shrink-0"></div>
          <span class="text-sm text-neutral-700 font-medium">{{ row.contract_type }}</span>
        </div>
      </template>

      <!-- Custom cell for join date -->
      <template #cell-join_date="{ row }">
        <div class="text-sm">
          <div class="text-neutral-900">{{ formatDate(row.join_date) }}</div>
          <div class="text-neutral-500">{{ getTimeAgo(row.join_date) }}</div>
        </div>
      </template>
      </DataTable>
    </ContentCard>
  </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import DataTable from '@/Components/Data/DataTable.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import FilterPanel from '@/Components/Search/FilterPanel.vue'
import Icon from '@/Components/Base/Icon.vue'
import { 
  UserPlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  employees: {
    type: Object,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  queryParams: {
    type: Object,
    default: () => ({})
  }
})

// Local state
const loading = ref(false)
const filtersExpanded = ref(false)
const currentSearch = ref(props.queryParams.search || '')

// Filter state management
const selectedDepartments = ref([])
const selectedContractTypes = ref([])
const selectedStatuses = ref([])
const dateFilters = ref({
  from: '',
  to: ''
})

// Initialize filter state from URL parameters
const initializeFilterState = () => {
  // Department filters
  if (props.queryParams.filter_department) {
    const depts = typeof props.queryParams.filter_department === 'string' 
      ? props.queryParams.filter_department.split(',') 
      : props.queryParams.filter_department
    selectedDepartments.value = Array.isArray(depts) ? depts : [depts]
  }
  
  // Contract type filters
  if (props.queryParams.filter_contract_type) {
    const types = typeof props.queryParams.filter_contract_type === 'string' 
      ? props.queryParams.filter_contract_type.split(',') 
      : props.queryParams.filter_contract_type
    selectedContractTypes.value = Array.isArray(types) ? types : [types]
  }
  
  // Status filters
  if (props.queryParams.filter_status) {
    const statuses = typeof props.queryParams.filter_status === 'string' 
      ? props.queryParams.filter_status.split(',') 
      : props.queryParams.filter_status
    selectedStatuses.value = Array.isArray(statuses) ? statuses : [statuses]
  }
  
  // Date filters
  if (props.queryParams.filter_join_date_from) {
    dateFilters.value.from = props.queryParams.filter_join_date_from
  }
  if (props.queryParams.filter_join_date_to) {
    dateFilters.value.to = props.queryParams.filter_join_date_to
  }
}

// Initialize on component mount
initializeFilterState()

// Computed properties for filter data
const availableDepartments = computed(() => props.filters.departments || [])
const availableContractTypes = computed(() => props.filters.contractTypes || [])
const availableStatuses = computed(() => props.filters.statuses || [])

// Computed properties for filter state
const hasActiveFilters = computed(() => {
  return selectedDepartments.value.length > 0 ||
         selectedContractTypes.value.length > 0 ||
         selectedStatuses.value.length > 0 ||
         dateFilters.value.from ||
         dateFilters.value.to ||
         currentSearch.value
})

const activeFilterCount = computed(() => {
  let count = 0
  count += selectedDepartments.value.length
  count += selectedContractTypes.value.length
  count += selectedStatuses.value.length
  if (dateFilters.value.from) count++
  if (dateFilters.value.to) count++
  return count
})

const activeFiltersDisplay = computed(() => {
  const filters = []
  
  // Department filters
  selectedDepartments.value.forEach(deptId => {
    const dept = availableDepartments.value.find(d => d.id.toString() === deptId)
    if (dept) {
      filters.push({
        key: `department-${deptId}`,
        label: 'Department',
        value: dept.name,
        type: 'department',
        removeValue: deptId
      })
    }
  })
  
  // Contract type filters
  selectedContractTypes.value.forEach(type => {
    filters.push({
      key: `contract-${type}`,
      label: 'Employment Type',
      value: type,
      type: 'contract_type',
      removeValue: type
    })
  })
  
  // Status filters
  selectedStatuses.value.forEach(status => {
    filters.push({
      key: `status-${status}`,
      label: 'Status',
      value: status.charAt(0).toUpperCase() + status.slice(1),
      type: 'status',
      removeValue: status
    })
  })
  
  // Date filters
  if (dateFilters.value.from) {
    filters.push({
      key: 'date-from',
      label: 'Join Date From',
      value: dateFilters.value.from,
      type: 'date_from',
      removeValue: 'from'
    })
  }
  
  if (dateFilters.value.to) {
    filters.push({
      key: 'date-to',
      label: 'Join Date To',
      value: dateFilters.value.to,
      type: 'date_to',
      removeValue: 'to'
    })
  }
  
  return filters
})

// Filter configuration
const filterGroups = computed(() => [
  {
    key: 'department',
    label: 'Department',
    type: 'checkbox',
    options: props.filters.departments?.map(dept => ({
      value: dept.id.toString(),
      label: dept.name,
      count: null
    })) || []
  },
  {
    key: 'contract_type',
    label: 'Employment Type',
    type: 'checkbox',
    options: props.filters.contractTypes?.map(type => ({
      value: type,
      label: type,
      count: null
    })) || []
  },
  {
    key: 'status',
    label: 'Status',
    type: 'checkbox',
    options: props.filters.statuses?.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: null
    })) || []
  },
  {
    key: 'join_date',
    label: 'Join Date Range',
    type: 'daterange'
  }
])

// Initial filters from URL parameters
const initialFilters = computed(() => {
  const filters = {}
  
  // Extract filter parameters from query params
  Object.keys(props.queryParams).forEach(key => {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      let value = props.queryParams[key]
      
      // Handle comma-separated values for checkbox filters
      if (typeof value === 'string' && value.includes(',')) {
        value = value.split(',')
      }
      
      filters[filterKey] = value
    }
  })
  
  return filters
})

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: UserPlusIcon,
    variant: 'primary',
    handler: () => router.visit(route('employees.create'))
  },
  {
    id: 'export',
    label: 'Export',
    icon: DocumentArrowDownIcon,
    variant: 'secondary',
    handler: () => handleExport()
  }
]

// Remove old table actions since we have FilterPanel

// Table columns configuration - Auto-sizing widths like Leave Management
const columns = [
  {
    key: 'name',
    label: 'Employee',
    sortable: true,
    minWidth: '200px',
    priority: 'high'
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    minWidth: '220px',
    priority: 'high'
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    minWidth: '140px',
    align: 'left',
    priority: 'high'
  },
  {
    key: 'job_title',
    label: 'Position',
    sortable: true,
    minWidth: '150px',
    priority: 'high'
  },
  {
    key: 'contract_type',
    label: 'Employment Type',
    sortable: true,
    minWidth: '130px',
    align: 'center',
    priority: 'medium'
  },
  {
    key: 'join_date',
    label: 'Start Date',
    sortable: true,
    minWidth: '120px',
    align: 'left',
    priority: 'medium'
  }
]

// Row actions configuration
const rowActions = (row) => [
  {
    id: 'view',
    label: 'View Details',
    icon: EyeIcon,
    handler: () => router.visit(route('employees.show', row.id))
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: PencilIcon,
    handler: () => router.visit(route('employees.edit', row.id))
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: TrashIcon,
    variant: 'danger',
    handler: () => deleteEmployee(row.id)
  }
]

// Search configuration
const searchConfig = {
  enabled: true,
  placeholder: 'Search employees by name, email, or job title...',
  fields: ['user.name', 'user.email', 'job_title', 'employee_code'],
  initialValue: props.queryParams.search || ''
}

// Empty state configuration
const emptyState = {
  title: 'No employees found',
  description: 'Get started by adding your first employee to the system.',
  icon: 'users',
  actions: [
    {
      id: 'add-first-employee',
      label: 'Add Employee',
      variant: 'primary',
      handler: () => router.visit(route('employees.create'))
    }
  ]
}

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getDepartmentClasses = (departmentName) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  // Generate consistent colors based on department name
  const departmentColors = {
    'HR': 'bg-blue-100 text-blue-800',
    'Finance': 'bg-green-100 text-green-800',
    'Marketing': 'bg-purple-100 text-purple-800',
    'Sales': 'bg-orange-100 text-orange-800',
    'Engineering': 'bg-indigo-100 text-indigo-800',
    'Support': 'bg-teal-100 text-teal-800',
    'Operations': 'bg-cyan-100 text-cyan-800',
    'Legal': 'bg-gray-100 text-gray-800'
  }
  
  const colorClass = departmentColors[departmentName] || 'bg-neutral-100 text-neutral-800'
  return `${baseClasses} ${colorClass}`
}

const getContractIndicator = (contractType) => {
  // Modern subtle indicators instead of heavy badges
  switch (contractType) {
    case 'Full-time':
    case 'Permanent':
      return 'bg-green-500'
    case 'Part-time':
      return 'bg-amber-500'
    case 'Contract':
      return 'bg-purple-500'
    case 'Temporary':
      return 'bg-orange-500'
    default:
      return 'bg-neutral-400'
  }
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

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} days ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''} ago`
  }
}

const deleteEmployee = (id) => {
  if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
    loading.value = true
    router.delete(route('employees.destroy', id), {
      onFinish: () => {
        loading.value = false
      },
      onError: () => {
        alert('Failed to delete employee. Please try again.')
      }
    })
  }
}

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler()
  }
}

const handleTableAction = (action) => {
  if (action.handler) {
    action.handler()
  }
}

// Filter handlers
const handleApplyFilters = (filters) => {
  const params = { ...props.queryParams }
  
  // Clear existing filter parameters
  Object.keys(params).forEach(key => {
    if (key.startsWith('filter_')) {
      delete params[key]
    }
  })
  
  // Add new filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
      if (Array.isArray(value)) {
        params[`filter_${key}`] = value.join(',')
      } else {
        params[`filter_${key}`] = value
      }
    }
  })
  
  // Reset to first page when applying filters
  params.page = 1
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const handleClearFilters = () => {
  const params = { ...props.queryParams }
  
  // Remove all filter parameters
  Object.keys(params).forEach(key => {
    if (key.startsWith('filter_')) {
      delete params[key]
    }
  })
  
  // Reset to first page
  params.page = 1
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const handleResetFilters = () => {
  handleClearFilters()
}

const handleSearch = (query) => {
  const params = { ...props.queryParams }
  
  if (query && query.trim()) {
    params.search = query.trim()
  } else {
    delete params.search
  }
  
  // Reset to first page when searching
  params.page = 1
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const handlePageChange = (page) => {
  const params = { ...props.queryParams, page }
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const handlePageSizeChange = (size) => {
  const params = { ...props.queryParams, per_page: size, page: 1 }
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const handleExport = () => {
  // Build export URL with current filters
  const params = new URLSearchParams(props.queryParams)
  params.set('export', 'true')
  
  // You can implement the export endpoint in the backend
  window.open(`${route('employees.index')}?${params.toString()}`, '_blank')
}

// New filter interface methods
const toggleFilters = () => {
  filtersExpanded.value = !filtersExpanded.value
}

const handleSearchInput = (event) => {
  currentSearch.value = event.target.value
  // Debounce search - apply after user stops typing
  clearTimeout(window.searchTimeout)
  window.searchTimeout = setTimeout(() => {
    handleSearch(currentSearch.value)
  }, 500)
}

const clearSearch = () => {
  currentSearch.value = ''
  handleSearch('')
}

const toggleDepartment = (deptId) => {
  const index = selectedDepartments.value.indexOf(deptId)
  if (index > -1) {
    selectedDepartments.value.splice(index, 1)
  } else {
    selectedDepartments.value.push(deptId)
  }
}

const toggleContractType = (type) => {
  const index = selectedContractTypes.value.indexOf(type)
  if (index > -1) {
    selectedContractTypes.value.splice(index, 1)
  } else {
    selectedContractTypes.value.push(type)
  }
}

const toggleStatus = (status) => {
  const index = selectedStatuses.value.indexOf(status)
  if (index > -1) {
    selectedStatuses.value.splice(index, 1)
  } else {
    selectedStatuses.value.push(status)
  }
}

const updateDateFilter = (type, value) => {
  dateFilters.value[type] = value
}

const removeFilter = (filter) => {
  switch (filter.type) {
    case 'department':
      toggleDepartment(filter.removeValue)
      break
    case 'contract_type':
      toggleContractType(filter.removeValue)
      break
    case 'status':
      toggleStatus(filter.removeValue)
      break
    case 'date_from':
      dateFilters.value.from = ''
      break
    case 'date_to':
      dateFilters.value.to = ''
      break
  }
  // Auto-apply filters when removing individual filters
  applyFilters()
}

const applyFilters = () => {
  const params = { ...props.queryParams }
  
  // Clear existing filter parameters
  Object.keys(params).forEach(key => {
    if (key.startsWith('filter_')) {
      delete params[key]
    }
  })
  
  // Add new filter parameters
  if (selectedDepartments.value.length > 0) {
    params.filter_department = selectedDepartments.value.join(',')
  }
  
  if (selectedContractTypes.value.length > 0) {
    params.filter_contract_type = selectedContractTypes.value.join(',')
  }
  
  if (selectedStatuses.value.length > 0) {
    params.filter_status = selectedStatuses.value.join(',')
  }
  
  if (dateFilters.value.from) {
    params.filter_join_date_from = dateFilters.value.from
  }
  
  if (dateFilters.value.to) {
    params.filter_join_date_to = dateFilters.value.to
  }
  
  // Reset to first page when applying filters
  params.page = 1
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}

const resetAllFilters = () => {
  selectedDepartments.value = []
  selectedContractTypes.value = []
  selectedStatuses.value = []
  dateFilters.value = { from: '', to: '' }
  currentSearch.value = ''
  
  // Apply the reset
  const params = { page: 1 }
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  })
}
</script>