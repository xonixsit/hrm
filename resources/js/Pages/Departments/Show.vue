<template>
  <AuthenticatedLayout>
    <DetailPage
      :title="department.name"
      subtitle="Department details and organizational structure"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      :avatar="{ icon: getDepartmentIcon(department.name) }"
      :status="{ label: department.status || 'Active', variant: getStatusVariant(department.status) }"
      :back-url="route('departments.index')"
      :loading="loading"
    >
      <!-- Primary Content -->
      <template #primary>
        <!-- Department Information -->
        <InfoCard
          title="Department Information"
          description="Basic details and organizational structure"
          :icon="BuildingOfficeIcon"
          :data="departmentInfoData"
          :enable-edit-mode="canEdit"
          @field-update="handleFieldUpdate"
          class="mb-6"
        />

        <!-- Management Information -->
        <InfoCard
          title="Management Structure"
          description="Leadership and organizational hierarchy"
          :icon="UserGroupIcon"
          :data="managementInfoData"
          :enable-edit-mode="canEdit"
          @field-update="handleFieldUpdate"
          class="mb-6"
        />

        <!-- Employee Directory -->
        <InfoCard
          title="Department Employees"
          :description="`${department.employees?.length || 0} employees in this department`"
          :icon="UsersIcon"
          display-mode="custom"
          class="mb-6"
        >
          <div v-if="department.employees?.length > 0" class="space-y-3">
            <div 
              v-for="employee in department.employees" 
              :key="employee.id"
              class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-700">
                    {{ getInitials(employee.user.name) }}
                  </span>
                </div>
                <div>
                  <div class="font-medium text-neutral-900">{{ employee.user.name }}</div>
                  <div class="text-sm text-neutral-500">{{ employee.job_title || 'No title' }}</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span :class="getContractTypeClasses(employee.contract_type)">
                  {{ employee.contract_type || 'N/A' }}
                </span>
                <button
                  @click="router.visit(route('employees.show', employee.id))"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <UsersIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500">No employees assigned to this department</p>
            <button
              @click="router.visit(route('employees.create', { department_id: department.id }))"
              class="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Add Employee
            </button>
          </div>
        </InfoCard>

        <!-- Recent Activity -->
        <InfoCard
          title="Recent Activity"
          description="Latest updates and changes"
          :icon="ClockIcon"
          :data="activityData"
          display-mode="list"
        />
      </template>

      <!-- Secondary Content (Sidebar) -->
      <template #secondary>
        <!-- Department Statistics -->
        <InfoCard
          title="Department Statistics"
          :icon="ChartBarIcon"
          :data="statisticsData"
          class="mb-6"
        />

        <!-- System Information -->
        <InfoCard
          title="System Information"
          :icon="InformationCircleIcon"
          :data="systemInfoData"
        />
      </template>
    </DetailPage>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import DetailPage from '@/Components/Layout/DetailPage.vue'
import InfoCard from '@/Components/Layout/InfoCard.vue'
import { usePermissions } from '@/composables/usePermissions.js'
import { 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  department: {
    type: Object,
    required: true
  }
})

// Composables
const { hasPermission } = usePermissions()

// Reactive state
const loading = ref(false)

// Computed properties
const canEdit = computed(() => hasPermission('department.edit'))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'People Management', href: '#' },
  { label: 'Departments', href: route('departments.index') },
  { label: props.department.name, current: true }
])

const headerActions = computed(() => [
  {
    id: 'edit-department',
    label: 'Edit Department',
    icon: PencilIcon,
    variant: 'primary',
    priority: 'primary',
    handler: () => router.visit(route('departments.edit', props.department.id)),
    permissions: ['department.edit']
  },
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: PlusIcon,
    variant: 'secondary',
    priority: 'secondary',
    handler: () => router.visit(route('employees.create', { department_id: props.department.id })),
    permissions: ['employee.create']
  },
  {
    id: 'delete-department',
    label: 'Delete Department',
    icon: TrashIcon,
    variant: 'error',
    priority: 'secondary',
    handler: handleDelete,
    permissions: ['department.delete'],
    disabled: (props.department.employees?.length || 0) > 0
  }
])

const departmentInfoData = computed(() => ({
  name: {
    label: 'Department Name',
    value: props.department.name,
    type: 'text',
    editable: true
  },
  code: {
    label: 'Department Code',
    value: props.department.code,
    type: 'text',
    editable: true,
    emptyText: 'No code assigned'
  },
  description: {
    label: 'Description',
    value: props.department.description,
    type: 'textarea',
    editable: true,
    emptyText: 'No description provided'
  },
  location: {
    label: 'Location',
    value: props.department.location,
    type: 'text',
    editable: true,
    emptyText: 'No location specified'
  },
  status: {
    label: 'Status',
    value: props.department.status || 'Active',
    type: 'badge',
    badgeVariant: getStatusVariant(props.department.status),
    editable: true
  }
}))

const managementInfoData = computed(() => ({
  manager: {
    label: 'Department Manager',
    value: props.department.manager?.user?.name,
    type: 'text',
    emptyText: 'No manager assigned'
  },
  manager_title: {
    label: 'Manager Title',
    value: props.department.manager?.job_title,
    type: 'text',
    emptyText: 'No title specified'
  },
  parent_department: {
    label: 'Parent Department',
    value: props.department.parent?.name,
    type: 'text',
    emptyText: 'No parent department'
  },
  budget: {
    label: 'Annual Budget',
    value: props.department.budget ? `$${Number(props.department.budget).toLocaleString()}` : null,
    type: 'text',
    emptyText: 'No budget specified'
  },
  established_date: {
    label: 'Established Date',
    value: props.department.established_date,
    type: 'date'
  }
}))

const statisticsData = computed(() => ({
  total_employees: {
    label: 'Total Employees',
    value: props.department.employees?.length || 0,
    type: 'number'
  },
  full_time_employees: {
    label: 'Full-time Employees',
    value: props.department.employees?.filter(emp => emp.contract_type === 'Full-time').length || 0,
    type: 'number'
  },
  part_time_employees: {
    label: 'Part-time Employees',
    value: props.department.employees?.filter(emp => emp.contract_type === 'Part-time').length || 0,
    type: 'number'
  },
  contract_employees: {
    label: 'Contract Employees',
    value: props.department.employees?.filter(emp => emp.contract_type === 'Contract').length || 0,
    type: 'number'
  }
}))

const activityData = computed(() => [
  {
    label: 'Department created',
    value: formatDateTime(props.department.created_at),
    icon: BuildingOfficeIcon,
    description: 'Initial department record'
  },
  {
    label: 'Last updated',
    value: formatDateTime(props.department.updated_at),
    icon: PencilIcon,
    description: 'Most recent modification'
  }
])

const systemInfoData = computed(() => ({
  id: {
    label: 'Department ID',
    value: props.department.id,
    type: 'text'
  },
  created_at: {
    label: 'Created',
    value: props.department.created_at,
    type: 'datetime'
  },
  updated_at: {
    label: 'Last Modified',
    value: props.department.updated_at,
    type: 'datetime'
  }
}))

const quickActions = computed(() => [
  {
    id: 'edit',
    label: 'Edit Department',
    icon: PencilIcon,
    variant: 'primary',
    handler: () => router.visit(route('departments.edit', props.department.id)),
    permissions: ['department.edit']
  },
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: PlusIcon,
    variant: 'secondary',
    handler: () => router.visit(route('employees.create', { department_id: props.department.id })),
    permissions: ['employee.create']
  },
  {
    id: 'delete',
    label: 'Delete Department',
    icon: TrashIcon,
    variant: 'error',
    handler: handleDelete,
    permissions: ['department.delete'],
    disabled: (props.department.employees?.length || 0) > 0
  }
])

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

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'error'
    case 'restructuring':
      return 'warning'
    default:
      return 'success'
  }
}

const getContractTypeClasses = (contractType) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  switch (contractType) {
    case 'Full-time':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Part-time':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Contract':
      return `${baseClasses} bg-blue-100 text-blue-800`
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = () => {
  if ((props.department.employees?.length || 0) > 0) {
    alert('Cannot delete department with employees. Please reassign employees first.')
    return
  }

  if (confirm(`Are you sure you want to delete ${props.department.name}? This action cannot be undone.`)) {
    loading.value = true
    
    router.delete(route('departments.destroy', props.department.id), {
      onSuccess: () => {
        router.visit(route('departments.index'))
      },
      onError: () => {
        alert('Failed to delete department. Please try again.')
        loading.value = false
      },
      onFinish: () => {
        loading.value = false
      }
    })
  }
}

const handleFieldUpdate = (updateData) => {
  loading.value = true
  
  const data = {
    [updateData.field]: updateData.newValue
  }
  
  router.patch(route('departments.update', props.department.id), data, {
    preserveScroll: true,
    onSuccess: () => {
      // Field updated successfully
    },
    onError: (errors) => {
      console.error('Failed to update field:', errors)
      alert('Failed to update field. Please try again.')
    },
    onFinish: () => {
      loading.value = false
    }
  })
}
</script>