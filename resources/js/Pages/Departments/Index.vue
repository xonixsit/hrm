<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Departments"
      subtitle="Manage organizational departments and structure"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentCard>
        <DataTable
          :data="departments.data"
          :columns="columns"
          :loading="loading"
          :row-actions="rowActions"
          :header-actions="tableActions"
          :search-config="searchConfig"
          :empty-state="emptyState"
          :show-footer="true"
          :server-side-pagination="true"
          :current-page="departments.current_page"
          :total-pages="departments.last_page"
          :total-items="departments.total"
          :page-size="departments.per_page"
          :page-size-options="[10, 25, 50, 100]"
          @row-action="handleRowAction"
          @header-action="handleTableAction"
          @search="handleSearch"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          class="w-full"
        >
          <!-- Custom cell for department name with icon -->
          <template #cell-name="{ row }">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon 
                    :name="getDepartmentIcon(row.name)" 
                    class="w-5 h-5 text-primary-600"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-neutral-900 truncate">{{ row.name }}</div>
                <div class="text-sm text-neutral-500 truncate">{{ row.code || 'No code' }}</div>
              </div>
            </div>
          </template>

          <!-- Custom cell for employee count -->
          <template #cell-employees_count="{ row }">
            <div class="flex items-center space-x-2">
              <div class="flex -space-x-1">
                <div 
                  v-for="(employee, index) in row.recent_employees?.slice(0, 3)" 
                  :key="employee.id"
                  class="w-6 h-6 bg-neutral-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-neutral-600"
                  :style="{ zIndex: 3 - index }"
                >
                  {{ getInitials(employee.user.name) }}
                </div>
                <div 
                  v-if="row.employees_count > 3"
                  class="w-6 h-6 bg-neutral-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-neutral-600"
                >
                  +{{ row.employees_count - 3 }}
                </div>
              </div>
              <span class="text-sm font-medium text-neutral-700">
                {{ row.employees_count }} {{ row.employees_count === 1 ? 'employee' : 'employees' }}
              </span>
            </div>
          </template>

          <!-- Custom cell for manager -->
          <template #cell-manager="{ row }">
            <div v-if="row.manager" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-green-700">
                  {{ getInitials(row.manager.user.name) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-neutral-900 truncate">{{ row.manager.user.name }}</div>
                <div class="text-sm text-neutral-500 truncate">{{ row.manager.job_title || 'Manager' }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-neutral-400 italic">
              No manager assigned
            </div>
          </template>

          <!-- Custom cell for status -->
          <template #cell-status="{ row }">
            <span :class="getStatusClasses(row.status)">
              {{ row.status || 'Active' }}
            </span>
          </template>

          <!-- Custom cell for created date -->
          <template #cell-created_at="{ row }">
            <div class="text-sm">
              <div class="text-neutral-900">{{ formatDate(row.created_at) }}</div>
              <div class="text-neutral-500">{{ getTimeAgo(row.created_at) }}</div>
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
import Icon from '@/Components/Base/Icon.vue'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Object,
    required: true
  }
})

// Local state
const loading = ref(false)

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

const handleFilter = () => {
  console.log('Opening filters...')
}
</script>