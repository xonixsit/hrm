<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Employees"
      subtitle="Manage your organization's employees and their information"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Employee List</h3>
            <div class="flex items-center space-x-4">
              <!-- Search Field -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="localFilters.search"
                  type="text"
                  placeholder="Name, email, job title..."
                  class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  @input="debounceSearch"
                />
              </div>
              
              <!-- Show Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
                {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
              </button>
            </div>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Department Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <BaseSelect
                v-model="localFilters.department_id"
                :options="departmentOptions"
                placeholder="All departments"
                class="w-full"
                @update:modelValue="applyFilters"
                />
            </div>
            
            <!-- Employment Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <BaseSelect
                v-model="localFilters.contract_type"
                :options="contractTypeOptions"
                placeholder="All types"
                class="w-full"
                @update:modelValue="applyFilters"
                />
            </div>
            
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <BaseSelect
                v-model="localFilters.status"
                :options="statusOptions"
                placeholder="All statuses"
                class="w-full"
                @update:modelValue="applyFilters"
                />
            </div>

            <!-- Date of Joining Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Joined After</label>
              <input
                v-model="localFilters.joined_after"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="applyFilters"
              />
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700">Active filters:</span>
            <span
              v-if="activeDepartmentFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
            >
              Department: {{ activeDepartmentFilter }}
              <button
                @click="clearDepartmentFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="activeContractTypeFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Type: {{ activeContractTypeFilter }}
              <button
                @click="clearContractTypeFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="activeStatusFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              Status: {{ activeStatusFilter }}
              <button
                @click="clearStatusFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="localFilters.joined_after"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              Joined After: {{ formatDate(localFilters.joined_after) }}
              <button
                @click="clearDateFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <button
              @click="clearAllFilters"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>

        <ContentCard class="border-0 shadow-none">
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
      </div>
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
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import Icon from '@/Components/Base/Icon.vue'
import { 
  UserPlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
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
const showFilters = ref(false)

// Filter state - simple like work reports
const localFilters = ref({
  department_id: props.queryParams.filter_department || '',
  contract_type: props.queryParams.filter_contract_type || '',
  status: props.queryParams.filter_status || '',
  search: props.queryParams.search || '',
  joined_after: props.queryParams.filter_joined_after || ''
})

// Filter options
const departmentOptions = computed(() => [
  { value: '', label: 'All departments' },
  ...((props.filters.departments || []).map(dept => ({
    value: dept.id.toString(),
    label: dept.name
  })))
])

const contractTypeOptions = computed(() => [
  { value: '', label: 'All types' },
  ...((props.filters.contractTypes || []).map(type => ({
    value: type,
    label: type
  })))
])

const statusOptions = computed(() => [
  { value: '', label: 'All statuses' },
  ...((props.filters.statuses || []).map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  })))
])

// Active filters computed properties - simple like work reports
const hasActiveFilters = computed(() => {
  return localFilters.value.department_id || 
         localFilters.value.contract_type || 
         localFilters.value.status ||
         localFilters.value.search ||
         localFilters.value.joined_after;
})

const activeDepartmentFilter = computed(() => {
  if (!localFilters.value.department_id) return null;
  
  // Find the option that matches the current filter value
  const selectedOption = departmentOptions.value.find(option => 
    option.value === localFilters.value.department_id
  );
  
  // Don't show "All departments" as an active filter (empty value)
  if (!selectedOption || selectedOption.value === '') return null;
  
  return selectedOption.label;
})

const activeContractTypeFilter = computed(() => {
  if (!localFilters.value.contract_type) return null;
  
  // Find the option that matches the current filter value
  const selectedOption = contractTypeOptions.value.find(option => 
    option.value === localFilters.value.contract_type
  );
  
  // Don't show "All types" as an active filter (empty value)
  if (!selectedOption || selectedOption.value === '') return null;
  
  return selectedOption.label;
})

const activeStatusFilter = computed(() => {
  if (!localFilters.value.status) return null;
  
  // Find the option that matches the current filter value
  const selectedOption = statusOptions.value.find(option => 
    option.value === localFilters.value.status
  );
  
  // Don't show "All statuses" as an active filter (empty value)
  if (!selectedOption || selectedOption.value === '') return null;
  
  return selectedOption.label;
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
    id: 'import-employees',
    label: 'Import Employees',
    icon: DocumentArrowUpIcon,
    variant: 'secondary',
    handler: () => router.visit(route('employees.import'))
  },
  {
    id: 'view-trash',
    label: 'View Deleted',
    icon: TrashIcon,
    variant: 'secondary',
    handler: () => router.visit(route('employees.trash'))
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

// Search configuration - disabled since we have search in filters
const searchConfig = {
  enabled: false
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
    'HR': 'bg-teal-100 text-teal-800',
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
  
  // Handle date string safely without timezone conversion
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Fallback for other date formats
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

// Filter methods - simple like work reports
const applyFilters = () => {
  loading.value = true;
  console.log('apply filters');
  const params = {
    page: 1, // Reset to first page when filtering
    per_page: props.employees.per_page || 10
  };
  
  // Add non-empty filters to params
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.contract_type) {
    params.filter_contract_type = localFilters.value.contract_type;
  }
  if (localFilters.value.status) {
    params.filter_status = localFilters.value.status;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  if (localFilters.value.joined_after) {
    params.filter_joined_after = localFilters.value.joined_after;
  }
  
  router.get(route('employees.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const clearDepartmentFilter = () => {
  localFilters.value.department_id = '';
  applyFilters();
};

const clearContractTypeFilter = () => {
  localFilters.value.contract_type = '';
  applyFilters();
};

const clearStatusFilter = () => {
  localFilters.value.status = '';
  applyFilters();
};

const clearDateFilter = () => {
  localFilters.value.joined_after = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    department_id: '',
    contract_type: '',
    status: '',
    search: '',
    joined_after: ''
  };
  applyFilters();
};

const debounceSearch = () => {
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const handleSearch = (query) => {
  // This is handled by the DataTable search, but we keep it for compatibility
  localFilters.value.search = query || '';
  applyFilters();
};

const handlePageChange = (page) => {
  const params = { ...props.queryParams, page };
  
  // Ensure current filters are preserved
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.contract_type) {
    params.filter_contract_type = localFilters.value.contract_type;
  }
  if (localFilters.value.status) {
    params.filter_status = localFilters.value.status;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  });
};

const handlePageSizeChange = (size) => {
  const params = { ...props.queryParams, per_page: size, page: 1 };
  
  // Ensure current filters are preserved
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.contract_type) {
    params.filter_contract_type = localFilters.value.contract_type;
  }
  if (localFilters.value.status) {
    params.filter_status = localFilters.value.status;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  
  router.visit(route('employees.index', params), {
    preserveState: true,
    preserveScroll: true
  });
};

const handleExport = () => {
  // Build export URL with current filters
  const params = new URLSearchParams();
  
  if (localFilters.value.department_id) {
    params.set('filter_department', localFilters.value.department_id);
  }
  if (localFilters.value.contract_type) {
    params.set('filter_contract_type', localFilters.value.contract_type);
  }
  if (localFilters.value.status) {
    params.set('filter_status', localFilters.value.status);
  }
  if (localFilters.value.search) {
    params.set('search', localFilters.value.search);
  }
  
  params.set('export', 'true');
  
  // You can implement the export endpoint in the backend
  window.open(`${route('employees.index')}?${params.toString()}`, '_blank');
};
</script>