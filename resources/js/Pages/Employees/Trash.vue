<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Deleted Employees"
      subtitle="Manage soft-deleted employees - restore or permanently delete"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Header with Filters -->
        <div class="border-b border-gray-200 bg-red-50 px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <TrashIcon class="h-5 w-5 text-red-600 mr-2" />
              <h3 class="text-lg font-medium text-red-900">Deleted Employee Records</h3>
            </div>
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FunnelIcon class="w-4 h-4 mr-2" />
              {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
            </button>
          </div>
          
          <div class="bg-red-100 border border-red-200 rounded-md p-3 mb-4">
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-red-700">
                <p class="font-medium">These employees have been removed from the system</p>
                <p class="mt-1">You can restore them to make them active again, or permanently delete them to free up space.</p>
              </div>
            </div>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Department Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <BaseSelect
                v-model="localFilters.department_id"
                :options="departmentOptions"
                placeholder="All departments"
                class="w-full"
                @change="applyFilters"
              />
            </div>
            
            <!-- Search Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                v-model="localFilters.search"
                type="text"
                placeholder="Name, email, job title..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                @input="debounceSearch"
              />
            </div>
            
            <!-- Clear Filters -->
            <div class="flex items-end">
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <ContentCard class="border-0 shadow-none">
          <DataTable
            :data="employees.data"
            :columns="columns"
            :loading="loading"
            :row-actions="rowActions"
            :empty-state="emptyState"
            :show-footer="true"
            :server-side-pagination="true"
            :current-page="employees.current_page"
            :total-pages="employees.last_page"
            :total-items="employees.total"
            :page-size="employees.per_page"
            :page-size-options="[10, 25, 50, 100]"
            @row-action="handleRowAction"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            class="w-full"
          >
            <!-- Employee profile with deleted indicator -->
            <template #cell-name="{ row }">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 relative">
                  <div class="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm opacity-75">
                    <span class="text-sm font-semibold text-gray-600">
                      {{ getInitials(row.user.name) }}
                    </span>
                  </div>
                  <!-- Deleted indicator -->
                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-semibold text-gray-700 truncate">{{ row.user.name }}</div>
                  <div class="flex items-center space-x-2 text-sm text-gray-500">
                    <span class="truncate">{{ row.employee_code || 'No code' }}</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Deleted
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Email with deleted styling -->
            <template #cell-email="{ row }">
              <div class="text-sm text-gray-600">
                {{ row.user.email }}
              </div>
            </template>

            <!-- Department with muted styling -->
            <template #cell-department="{ row }">
              <div class="text-sm text-gray-600">
                <span v-if="row.department">
                  {{ row.department.name }}
                </span>
                <span v-else class="italic">
                  Unassigned
                </span>
              </div>
            </template>

            <!-- Job title with muted styling -->
            <template #cell-job_title="{ row }">
              <div class="text-sm text-gray-600">
                {{ row.job_title || 'N/A' }}
              </div>
            </template>

            <!-- Deleted date -->
            <template #cell-deleted_at="{ row }">
              <div class="text-sm">
                <div class="text-gray-900">{{ formatDate(row.deleted_at) }}</div>
                <div class="text-gray-500">{{ getTimeAgo(row.deleted_at) }}</div>
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
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import DataTable from '@/Components/Data/DataTable.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import { 
  TrashIcon, 
  ArrowPathIcon, 
  XMarkIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
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

// Filter state
const localFilters = ref({
  department_id: props.queryParams.filter_department || '',
  search: props.queryParams.search || ''
})

// Filter options
const departmentOptions = computed(() => [
  { value: '', label: 'All departments' },
  ...((props.filters.departments || []).map(dept => ({
    value: dept.id.toString(),
    label: dept.name
  })))
])

// Active filters
const hasActiveFilters = computed(() => {
  return localFilters.value.department_id || localFilters.value.search;
})

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', href: route('employees.index') },
  { label: 'Deleted Employees', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'back-to-employees',
    label: 'Back to Employees',
    icon: ArrowLeftIcon,
    variant: 'secondary',
    handler: () => router.visit(route('employees.index'))
  }
]

// Table columns configuration
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
    priority: 'high'
  },
  {
    key: 'job_title',
    label: 'Position',
    sortable: true,
    minWidth: '150px',
    priority: 'medium'
  },
  {
    key: 'deleted_at',
    label: 'Deleted Date',
    sortable: true,
    minWidth: '120px',
    priority: 'high'
  }
]

// Row actions configuration
const rowActions = (row) => [
  {
    id: 'restore',
    label: 'Restore Employee',
    icon: ArrowPathIcon,
    variant: 'success',
    handler: () => restoreEmployee(row.id)
  },
  {
    id: 'force-delete',
    label: 'Delete Permanently',
    icon: XMarkIcon,
    variant: 'danger',
    handler: () => forceDeleteEmployee(row.id)
  }
]

// Empty state configuration
const emptyState = {
  title: 'No deleted employees found',
  description: 'There are no deleted employees to display.',
  icon: 'trash',
  actions: [
    {
      id: 'back-to-employees',
      label: 'Back to Employees',
      variant: 'primary',
      handler: () => router.visit(route('employees.index'))
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

const restoreEmployee = (id) => {
  if (confirm('Are you sure you want to restore this employee? They will become active again.')) {
    loading.value = true
    router.post(route('employees.restore', id), {}, {
      onFinish: () => {
        loading.value = false
      },
      onError: () => {
        alert('Failed to restore employee. Please try again.')
      }
    })
  }
}

const forceDeleteEmployee = (id) => {
  if (confirm('Are you sure you want to permanently delete this employee? This action cannot be undone and will remove all their data.')) {
    loading.value = true
    router.delete(route('employees.force-delete', id), {
      onFinish: () => {
        loading.value = false
      },
      onError: () => {
        alert('Failed to permanently delete employee. Please try again.')
      }
    })
  }
}

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler()
  }
}

// Filter methods
const applyFilters = () => {
  loading.value = true;
  
  const params = {
    page: 1,
    per_page: props.employees.per_page || 10
  };
  
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  
  router.get(route('employees.trash'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const clearAllFilters = () => {
  localFilters.value = {
    department_id: '',
    search: ''
  };
  applyFilters();
};

const debounceSearch = () => {
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const handlePageChange = (page) => {
  const params = { ...props.queryParams, page };
  
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  
  router.visit(route('employees.trash', params), {
    preserveState: true,
    preserveScroll: true
  });
};

const handlePageSizeChange = (size) => {
  const params = { ...props.queryParams, per_page: size, page: 1 };
  
  if (localFilters.value.department_id) {
    params.filter_department = localFilters.value.department_id;
  }
  if (localFilters.value.search) {
    params.search = localFilters.value.search;
  }
  
  router.visit(route('employees.trash', params), {
    preserveState: true,
    preserveScroll: true
  });
};
</script>