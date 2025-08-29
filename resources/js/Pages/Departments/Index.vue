<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Departments"
      subtitle="Manage organizational departments and structure"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Search and Filter Section -->
      <ContentCard class="mb-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Department List</h3>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Search Field -->
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="localFilters.search"
                type="text"
                placeholder="Name, code, manager..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                @input="debouncedApplyFilters"
              />
            </div>
            
            <!-- Show More Filters Button -->
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            >
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span class="hidden sm:inline">{{ showFilters ? 'Hide Filters' : 'Show Filters' }}</span>
              <span class="sm:hidden">Filters</span>
              <span v-if="activeFiltersCount > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                {{ activeFiltersCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filter Controls -->
        <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="localFilters.status"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All statuses</option>
                <option v-for="status in filterOptions.statuses" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <!-- Manager Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select
                v-model="localFilters.manager"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All managers</option>
                <option v-for="manager in filterOptions.managers" :key="manager.id" :value="manager.id">
                  {{ manager.name }}
                </option>
              </select>
            </div>

            <!-- Parent Department Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parent Department</label>
              <select
                v-model="localFilters.parent"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All departments</option>
                <option value="none">Top-level only</option>
                <option v-for="parent in filterOptions.parents" :key="parent.id" :value="parent.id">
                  {{ parent.name }}
                </option>
              </select>
            </div>

            <!-- Employee Count Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
              <select
                v-model="localFilters.employee_count"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All sizes</option>
                <option value="none">No employees</option>
                <option value="small">Small (1-5)</option>
                <option value="medium">Medium (6-15)</option>
                <option value="large">Large (16+)</option>
              </select>
            </div>

            <!-- Date From Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                v-model="localFilters.date_from"
                type="date"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <!-- Date To Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                v-model="localFilters.date_to"
                type="date"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <!-- Sort By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                v-model="localFilters.sort_by"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="name">Name</option>
                <option value="employees_count">Employee Count</option>
                <option value="manager">Manager</option>
                <option value="created_at">Created Date</option>
                <option value="status">Status</option>
              </select>
            </div>

            <!-- Sort Order -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <select
                v-model="localFilters.sort_order"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="activeFiltersCount > 0" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700">Active filters:</span>
            
            <!-- Search Filter -->
            <span v-if="localFilters.search" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Search: "{{ localFilters.search }}"
              <button @click="clearFilter('search')" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500">
                <Icon name="x-mark" class="w-2 h-2" />
              </button>
            </span>

            <!-- Status Filter -->
            <span v-if="localFilters.status" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {{ localFilters.status }}
              <button @click="clearFilter('status')" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500">
                <Icon name="x-mark" class="w-2 h-2" />
              </button>
            </span>

            <!-- Manager Filter -->
            <span v-if="localFilters.manager" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Manager: {{ getManagerName(localFilters.manager) }}
              <button @click="clearFilter('manager')" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500">
                <Icon name="x-mark" class="w-2 h-2" />
              </button>
            </span>

            <!-- Clear All Button -->
            <button
              @click="clearAllFilters"
              class="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      </ContentCard>

      <ContentCard>
        <!-- Enhanced Table Implementation with Leave Management Style -->
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table class="min-w-full divide-y divide-neutral-300">
            <thead class="bg-neutral-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Department
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Employees
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Manager
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Created
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="department in departments.data" :key="department.id" class="hover:bg-neutral-50">
                <!-- Department Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon 
                          :name="getDepartmentIcon(department.name)" 
                          class="w-5 h-5 text-primary-600"
                        />
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-semibold text-neutral-900 truncate">
                        {{ department.name }}
                      </div>
                      <div class="text-xs text-neutral-500 truncate">
                        {{ department.code || 'No department code' }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Employee Count -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <div class="flex -space-x-1">
                      <div 
                        v-for="(employee, index) in department.employees?.slice(0, 3)" 
                        :key="employee.id"
                        class="w-6 h-6 bg-neutral-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-neutral-600"
                        :style="{ zIndex: 3 - index }"
                      >
                        {{ getInitials(employee.user?.name || 'N/A') }}
                      </div>
                      <div 
                        v-if="(department.employees_count || 0) > 3"
                        class="w-6 h-6 bg-neutral-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-neutral-600"
                      >
                        +{{ (department.employees_count || 0) - 3 }}
                      </div>
                    </div>
                    <div class="text-sm">
                      <div class="font-medium text-neutral-900">
                        {{ department.employees_count || 0 }} 
                        {{ (department.employees_count || 0) === 1 ? 'employee' : 'employees' }}
                      </div>
                      <div class="text-xs text-neutral-500">
                        {{ getEmployeeStatusText(department.employees_count || 0) }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Manager -->
                <td class="px-6 py-4">
                  <div v-if="department.manager" class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-green-700">
                        {{ getInitials(department.manager.user?.name || 'N/A') }}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-neutral-900 truncate">
                        {{ department.manager.user?.name || 'Unknown' }}
                      </div>
                      <div class="text-xs text-neutral-500 truncate">
                        {{ department.manager.job_title || 'Manager' }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-neutral-400">
                        --
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm text-neutral-400 italic truncate">
                        No manager assigned
                      </div>
                      <div class="text-xs text-neutral-400 truncate">
                        Requires assignment
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Created Date -->
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <div class="flex items-center space-x-1 text-neutral-900">
                      <CalendarIcon class="w-4 h-4 text-neutral-400" />
                      <span>{{ formatDate(department.created_at) }}</span>
                    </div>
                    <div class="text-xs text-neutral-500 mt-1">
                      {{ getTimeAgo(department.created_at) }}
                    </div>
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-1">
                    <Link 
                      :href="route('departments.show', department.id)"
                      class="inline-flex items-center p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Department"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </Link>
                    <Link 
                      :href="route('departments.edit', department.id)"
                      class="inline-flex items-center p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </Link>
                    <button 
                      @click="deleteDepartment(department.id)"
                      class="inline-flex items-center p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-neutral-400 disabled:hover:bg-transparent"
                      title="Delete Department"
                      :disabled="(department.employees_count || 0) > 0"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="!departments.data || departments.data.length === 0" class="text-center py-12">
            <Icon name="building-office" class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No departments</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new department.</p>
            <div class="mt-6">
              <Link 
                :href="route('departments.create')"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
                New Department
              </Link>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="departments.data && departments.data.length > 0" class="mt-6">
          <nav class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
            <div class="-mt-px flex w-0 flex-1">
              <Link 
                v-if="departments.prev_page_url"
                :href="departments.prev_page_url"
                class="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Previous
              </Link>
            </div>
            <div class="hidden md:-mt-px md:flex">
              <span class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                Page {{ departments.current_page }} of {{ departments.last_page }}
              </span>
            </div>
            <div class="-mt-px flex w-0 flex-1 justify-end">
              <Link 
                v-if="departments.next_page_url"
                :href="departments.next_page_url"
                class="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Next
              </Link>
            </div>
          </nav>
        </div>
      </ContentCard>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import { debounce } from 'lodash'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import DataTable from '@/Components/Data/DataTable.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import Icon from '@/Components/Base/Icon.vue'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Object,
    required: true
  },
  filterOptions: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Local state
const loading = ref(false)
const showFilters = ref(false)

// Filter state
const localFilters = ref({
  search: props.filters.search || '',
  status: props.filters.status || '',
  manager: props.filters.manager || '',
  parent: props.filters.parent || '',
  employee_count: props.filters.employee_count || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || '',
  sort_by: props.filters.sort_by || 'name',
  sort_order: props.filters.sort_order || 'asc'
})

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'People Management', href: '#' },
  { label: 'Departments', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'add-department',
    label: 'Add Department',
    icon: PlusIcon,
    variant: 'primary',
    handler: () => router.visit(route('departments.create'))
  },
  {
    id: 'org-chart',
    label: 'Organization Chart',
    icon: ChartBarIcon,
    variant: 'secondary',
    handler: () => router.visit(route('departments.org-chart'))
  },
  {
    id: 'export',
    label: 'Export',
    icon: DocumentArrowDownIcon,
    variant: 'secondary',
    handler: () => handleExport()
  }
]

// Table actions
const tableActions = [
  {
    id: 'filter',
    label: 'Filter',
    icon: FunnelIcon,
    variant: 'ghost',
    handler: () => handleFilter()
  }
]

// Table columns configuration
const columns = [
  {
    key: 'name',
    label: 'Department',
    sortable: true,
    flex: '2.5',
    minWidth: '250px',
    priority: 'high'
  },
  {
    key: 'employees_count',
    label: 'Employees',
    sortable: true,
    flex: '2',
    minWidth: '180px',
    align: 'left',
    priority: 'high'
  },
  {
    key: 'manager',
    label: 'Manager',
    sortable: false,
    flex: '2',
    minWidth: '200px',
    priority: 'high'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    flex: '1',
    minWidth: '100px',
    align: 'center',
    priority: 'medium'
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    flex: '1.3',
    minWidth: '120px',
    align: 'left',
    priority: 'low'
  }
]

// Row actions configuration
const rowActions = (row) => [
  {
    id: 'view',
    label: 'View Details',
    icon: EyeIcon,
    handler: () => router.visit(route('departments.show', row.id))
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: PencilIcon,
    handler: () => router.visit(route('departments.edit', row.id))
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: TrashIcon,
    variant: 'danger',
    handler: () => deleteDepartment(row.id),
    disabled: row.employees_count > 0
  }
]

// Search configuration
const searchConfig = {
  enabled: true,
  placeholder: 'Search departments by name, code, or manager...',
  fields: ['name', 'code', 'manager.user.name']
}

// Empty state configuration
const emptyState = {
  title: 'No departments found',
  description: 'Get started by creating your first department to organize your team.',
  icon: 'building-office',
  actions: [
    {
      id: 'add-first-department',
      label: 'Create Department',
      variant: 'primary',
      handler: () => router.visit(route('departments.create'))
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

const getDepartmentIcon = (departmentName) => {
  const iconMap = {
    'Engineering': 'code-bracket',
    'Marketing': 'megaphone',
    'Sales': 'chart-bar',
    'HR': 'users',
    'Finance': 'currency-dollar',
    'Operations': 'cog',
    'Support': 'lifebuoy',
    'Legal': 'scale',
    'Design': 'paint-brush',
    'Product': 'light-bulb'
  }
  
  return iconMap[departmentName] || 'building-office'
}

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  switch (status?.toLowerCase()) {
    case 'active':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'inactive':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'restructuring':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClasses} bg-green-100 text-green-800`
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

const getEmployeeStatusText = (count) => {
  if (count === 0) {
    return 'No staff assigned'
  } else if (count === 1) {
    return 'Single member'
  } else if (count <= 5) {
    return 'Small team'
  } else if (count <= 15) {
    return 'Medium team'
  } else {
    return 'Large team'
  }
}

const deleteDepartment = (id) => {
  if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
    loading.value = true
    router.delete(route('departments.destroy', id), {
      onFinish: () => {
        loading.value = false
      },
      onError: () => {
        alert('Failed to delete department. Please try again.')
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

const handleSearch = (query) => {
  router.visit(route('departments.index', { search: query }), {
    preserveState: true,
    preserveScroll: true
  })
}

const handlePageChange = (page) => {
  router.visit(route('departments.index', { page }), {
    preserveState: true,
    preserveScroll: true
  })
}

const handlePageSizeChange = (size) => {
  router.visit(route('departments.index', { per_page: size, page: 1 }), {
    preserveState: true,
    preserveScroll: true
  })
}

const handleExport = () => {
  window.location.href = route('departments.export')
}

// Computed properties for filters
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.search) count++
  if (localFilters.value.status) count++
  if (localFilters.value.manager) count++
  if (localFilters.value.parent) count++
  if (localFilters.value.employee_count) count++
  if (localFilters.value.date_from) count++
  if (localFilters.value.date_to) count++
  return count
})

// Debounced filter application
const debouncedApplyFilters = debounce(() => {
  applyFilters()
}, 300)

// Filter methods
const applyFilters = () => {
  router.get(route('departments.index'), localFilters.value, {
    preserveState: true,
    preserveScroll: true,
    replace: true
  })
}

const clearFilter = (filterKey) => {
  localFilters.value[filterKey] = ''
  applyFilters()
}

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    status: '',
    manager: '',
    parent: '',
    employee_count: '',
    date_from: '',
    date_to: '',
    sort_by: 'name',
    sort_order: 'asc'
  }
  applyFilters()
}

const getManagerName = (managerId) => {
  const manager = props.filterOptions.managers?.find(m => m.id.toString() === managerId.toString())
  return manager ? manager.name : 'Unknown'
}

const handleFilter = () => {
  showFilters.value = !showFilters.value
}
</script>