<template>
  <AuthenticatedLayout>
    <DetailPage
      :title="employee.user.name"
      subtitle="Employee details and information"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      :avatar="{ initials: getInitials(employee.user.name) }"
      :status="{ label: employee.status || 'Active', variant: getStatusVariant(employee.status) }"
      :back-url="route('employees.index')"
      :loading="loading"
    >
      <!-- Primary Content -->
      <template #primary>
        <!-- Personal Information -->
        <InfoCard
          title="Personal Information"
          description="Basic personal and contact details"
          :icon="UserIcon"
          :data="personalInfoData"
          :enable-edit-mode="canEdit"
          @field-update="handleFieldUpdate"
          class="mb-6"
        />

        <!-- Employment Information -->
        <InfoCard
          title="Employment Information"
          description="Job-related details and organizational structure"
          :icon="BriefcaseIcon"
          :data="employmentInfoData"
          :enable-edit-mode="canEdit"
          @field-update="handleFieldUpdate"
          class="mb-6"
        />

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
  ArrowLeftIcon,
  UserIcon,
  BriefcaseIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

// Composables
const { hasPermission } = usePermissions()

// Reactive state
const loading = ref(false)

// Computed properties
const canEdit = computed(() => hasPermission('employee.edit'))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', href: route('employees.index') },
  { label: props.employee.user.name, current: true }
])

const headerActions = computed(() => [
  {
    id: 'edit-employee',
    label: 'Edit Employee',
    icon: PencilIcon,
    variant: 'primary',
    priority: 'primary',
    handler: () => router.visit(route('employees.edit', props.employee.id)),
    permissions: ['employee.edit']
  },
  {
    id: 'delete-employee',
    label: 'Delete Employee',
    icon: TrashIcon,
    variant: 'error',
    priority: 'secondary',
    handler: handleDelete,
    permissions: ['employee.delete']
  }
])

const personalInfoData = computed(() => ({
  name: {
    label: 'Full Name',
    value: props.employee.user.name,
    type: 'text',
    editable: true
  },
  email: {
    label: 'Email Address',
    value: props.employee.user.email,
    type: 'email',
    editable: true
  },
  employee_code: {
    label: 'Employee Code',
    value: props.employee.employee_code,
    type: 'text',
    editable: true,
    emptyText: 'Not assigned'
  },
  status: {
    label: 'Status',
    value: props.employee.status || 'Active',
    type: 'badge',
    badgeVariant: getStatusVariant(props.employee.status),
    editable: true
  }
}))

const employmentInfoData = computed(() => ({
  department: {
    label: 'Department',
    value: props.employee.department?.name,
    type: 'text',
    emptyText: 'No department assigned'
  },
  job_title: {
    label: 'Job Title',
    value: props.employee.job_title,
    type: 'text',
    editable: true,
    emptyText: 'No title assigned'
  },
  contract_type: {
    label: 'Contract Type',
    value: props.employee.contract_type,
    type: 'badge',
    badgeVariant: getContractTypeVariant(props.employee.contract_type),
    emptyText: 'Not specified'
  },
  join_date: {
    label: 'Join Date',
    value: props.employee.join_date,
    type: 'date'
  },
  time_with_company: {
    label: 'Time with Company',
    value: getTimeWithCompany(props.employee.join_date),
    type: 'text'
  }
}))

const activityData = computed(() => [
  {
    label: 'Employee record created',
    value: formatDateTime(props.employee.created_at),
    icon: UserIcon,
    description: 'Initial employee record'
  },
  {
    label: 'Last updated',
    value: formatDateTime(props.employee.updated_at),
    icon: PencilIcon,
    description: 'Most recent modification'
  }
])

const systemInfoData = computed(() => ({
  id: {
    label: 'Employee ID',
    value: props.employee.id,
    type: 'text'
  },
  created_at: {
    label: 'Created',
    value: props.employee.created_at,
    type: 'datetime'
  },
  updated_at: {
    label: 'Last Modified',
    value: props.employee.updated_at,
    type: 'datetime'
  }
}))

const quickActions = computed(() => [
  {
    id: 'edit',
    label: 'Edit Employee',
    icon: PencilIcon,
    variant: 'primary',
    handler: () => router.visit(route('employees.edit', props.employee.id)),
    permissions: ['employee.edit']
  },
  {
    id: 'delete',
    label: 'Delete Employee',
    icon: TrashIcon,
    variant: 'error',
    handler: handleDelete,
    permissions: ['employee.delete']
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

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'error'
    case 'pending':
      return 'warning'
    case 'suspended':
      return 'warning'
    default:
      return 'neutral'
  }
}

const getContractTypeVariant = (contractType) => {
  switch (contractType) {
    case 'Full-time':
      return 'success'
    case 'Part-time':
      return 'warning'
    case 'Contract':
      return 'info'
    default:
      return 'neutral'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

const getTimeWithCompany = (joinDate) => {
  if (!joinDate) return 'N/A'
  
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - join)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months === 1 ? '' : 's'}`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    let result = `${years} year${years === 1 ? '' : 's'}`
    if (remainingMonths > 0) {
      result += `, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
    }
    return result
  }
}

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete ${props.employee.user.name}? This action cannot be undone.`)) {
    loading.value = true
    
    router.delete(route('employees.destroy', props.employee.id), {
      onSuccess: () => {
        router.visit(route('employees.index'))
      },
      onError: () => {
        alert('Failed to delete employee. Please try again.')
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
  
  router.patch(route('employees.update', props.employee.id), data, {
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