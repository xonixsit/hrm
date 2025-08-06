<template>
  <AuthenticatedLayout>
    <PageLayout
    title="Employees"
    subtitle="Manage your organization's employees and their information"
    :breadcrumbs="breadcrumbs"
    :actions="headerActions"
  >
    <ContentCard>
      <DataTable
        :data="employees.data"
        :columns="columns"
        :loading="loading"
        :row-actions="rowActions"
        :header-actions="tableActions"
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
        @header-action="handleTableAction"
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
  }
})

// Local state
const loading = ref(false)

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

// Table columns configuration - Flexible widths that adapt to content and screen size
const columns = [
  {
    key: 'name',
    label: 'Employee',
    sortable: true,
    flex: '2', // Takes 2 parts of available space
    minWidth: '200px',
    priority: 'high' // Always visible
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    flex: '2.5', // Takes 2.5 parts - more space for longer emails
    minWidth: '220px',
    priority: 'high'
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    flex: '1.5', // Takes 1.5 parts
    minWidth: '120px',
    align: 'left',
    priority: 'high'
  },
  {
    key: 'job_title',
    label: 'Position',
    sortable: true,
    flex: '2', // Takes 2 parts
    minWidth: '150px',
    priority: 'high'
  },
  {
    key: 'contract_type',
    label: 'Employment Type',
    sortable: true,
    flex: '1.2', // Takes 1.2 parts
    minWidth: '110px',
    align: 'center',
    priority: 'medium'
  },
  {
    key: 'join_date',
    label: 'Start Date',
    sortable: true,
    flex: '1.3', // Takes 1.3 parts
    minWidth: '110px',
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
  fields: ['user.name', 'user.email', 'job_title', 'employee_code']
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

const handleSearch = (query) => {
  // Implement search functionality
  console.log('Search query:', query)
}

const handlePageChange = (page) => {
  router.visit(route('employees.index', { page }), {
    preserveState: true,
    preserveScroll: true
  })
}

const handlePageSizeChange = (size) => {
  router.visit(route('employees.index', { per_page: size, page: 1 }), {
    preserveState: true,
    preserveScroll: true
  })
}

const handleExport = () => {
  // Implement export functionality
  console.log('Exporting employees...')
  // You could redirect to an export endpoint
  // window.location.href = route('employees.export')
}

const handleFilter = () => {
  // Implement filter functionality
  console.log('Opening filters...')
}
</script>