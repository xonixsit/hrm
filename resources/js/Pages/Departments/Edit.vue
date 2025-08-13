<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="`Edit Department: ${department.name}`"
      subtitle="Update department information and structure"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <FormLayout
        title="Department Information"
        description="Update the department's information below"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
      >
        <!-- Department Overview -->
        <div class="bg-neutral-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon 
                :name="getDepartmentIcon(department.name)" 
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900">{{ department.name }}</h3>
              <p class="text-sm text-neutral-600">{{ department.code || 'No code assigned' }}</p>
              <div class="flex items-center space-x-4 mt-1">
                <span class="text-xs text-neutral-500">
                  {{ department.employees_count || 0 }} employees
                </span>
                <span v-if="department.manager" class="text-xs text-neutral-500">
                  Manager: {{ department.manager.user.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Basic Information Section -->
        <FormSection
          title="Basic Information"
          description="Essential details about the department"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Department Name"
              required
              :error="form.errors.name"
              help="Enter the full name of the department"
            >
              <BaseInput
                v-model="form.name"
                type="text"
                placeholder="Engineering"
                :error="!!form.errors.name"
                required
              />
            </FormField>

            <FormField
              label="Department Code"
              :error="form.errors.code"
              help="Short code for the department"
            >
              <BaseInput
                v-model="form.code"
                type="text"
                placeholder="ENG"
                :error="!!form.errors.code"
                maxlength="10"
              />
            </FormField>

            <FormField
              label="Description"
              :error="form.errors.description"
              help="Brief description of the department's purpose"
              class="md:col-span-2"
            >
              <BaseTextarea
                v-model="form.description"
                placeholder="Describe the department's role and responsibilities..."
                :error="!!form.errors.description"
                rows="3"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Management Section -->
        <FormSection
          title="Management Structure"
          description="Assign leadership and organizational details"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Department Manager"
              :error="form.errors.manager_id"
              help="Select an employee to manage this department"
            >
              <BaseSelect
                v-model="form.manager_id"
                :options="employeeOptions"
                option-label="label"
                option-value="value"
                :error="!!form.errors.manager_id"
                placeholder="Select manager"
              />
            </FormField>

            <FormField
              label="Parent Department"
              :error="form.errors.parent_id"
              help="Select a parent department if this is a sub-department"
            >
              <BaseSelect
                v-model="form.parent_id"
                :options="departmentOptions"
                option-label="label"
                option-value="value"
                :error="!!form.errors.parent_id"
                placeholder="Select parent department"
              />
            </FormField>

            <FormField
              label="Budget"
              :error="form.errors.budget"
              help="Annual budget for this department"
            >
              <BaseInput
                v-model="form.budget"
                type="number"
                placeholder="100000"
                :error="!!form.errors.budget"
                step="1000"
                min="0"
              />
            </FormField>

            <FormField
              label="Location"
              :error="form.errors.location"
              help="Physical location or office"
            >
              <BaseInput
                v-model="form.location"
                type="text"
                placeholder="Building A, Floor 2"
                :error="!!form.errors.location"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Status Section -->
        <FormSection
          title="Department Status"
          description="Set the current status and operational details"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Status"
              :error="form.errors.status"
              help="Current operational status"
            >
              <BaseSelect
                v-model="form.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                :error="!!form.errors.status"
                placeholder="Select status"
              />
            </FormField>

            <FormField
              label="Established Date"
              :error="form.errors.established_date"
              help="When was this department established"
            >
              <BaseInput
                v-model="form.established_date"
                type="date"
                :error="!!form.errors.established_date"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Department History Section -->
        <FormSection
          title="Department History"
          description="Track changes and important dates"
        >
          <div class="bg-neutral-50 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="font-medium text-neutral-700">Created:</span>
                <p class="text-neutral-600">{{ formatDate(department.created_at) }}</p>
              </div>
              <div>
                <span class="font-medium text-neutral-700">Last Updated:</span>
                <p class="text-neutral-600">{{ formatDate(department.updated_at) }}</p>
              </div>
              <div>
                <span class="font-medium text-neutral-700">Current Employees:</span>
                <p class="text-neutral-600">{{ department.employees_count || 0 }} members</p>
              </div>
            </div>
          </div>
        </FormSection>
      </FormLayout>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import FormLayout from '@/Components/Forms/FormLayout.vue'
import FormSection from '@/Components/Forms/FormSection.vue'
import FormField from '@/Components/Forms/FormField.vue'
import BaseInput from '@/Components/Base/BaseInput.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import BaseTextarea from '@/Components/Base/BaseTextarea.vue'
import Icon from '@/Components/Base/Icon.vue'
import { 
  XMarkIcon, 
  CheckIcon, 
  EyeIcon, 
  TrashIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  department: {
    type: Object,
    required: true
  },
  employees: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  }
})

// Form setup
const form = useForm({
  name: props.department.name,
  code: props.department.code,
  description: props.department.description,
  manager_id: props.department.manager_id,
  parent_id: props.department.parent_id,
  budget: props.department.budget,
  location: props.department.location,
  status: props.department.status || 'Active',
  established_date: props.department.established_date
})

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'People Management', href: '#' },
  { label: 'Departments', href: route('departments.index') },
  { label: props.department.name, href: route('departments.show', props.department.id) },
  { label: 'Edit', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'view-department',
    label: 'View Details',
    icon: EyeIcon,
    variant: 'secondary',
    handler: () => router.visit(route('departments.show', props.department.id))
  },
  {
    id: 'delete-department',
    label: 'Delete Department',
    icon: TrashIcon,
    variant: 'danger',
    handler: () => handleDelete(),
    disabled: props.department.employees_count > 0
  }
]

// Form actions configuration
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('departments.show', props.department.id))
  },
  {
    id: 'reset',
    label: 'Reset Changes',
    variant: 'ghost',
    handler: () => handleReset(),
    disabled: !hasChanges.value
  },
  {
    id: 'update',
    label: 'Update Department',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Updating Department...',
    disabled: !isFormValid.value || !hasChanges.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0
})

// Transform employees data for BaseSelect
const employeeOptions = computed(() => {
  return props.employees.map(employee => ({
    value: employee.id,
    label: `${employee.user.name} - ${employee.job_title || 'No title'}`
  }))
})

// Transform departments data for BaseSelect
const departmentOptions = computed(() => {
  return props.departments.filter(d => d.id !== props.department.id).map(dept => ({
    value: dept.id,
    label: dept.name
  }))
})

// Status options for BaseSelect
const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Restructuring', label: 'Restructuring' }
]

// Check if form has changes
const hasChanges = computed(() => {
  return form.name !== props.department.name ||
         form.code !== props.department.code ||
         form.description !== props.department.description ||
         form.manager_id !== props.department.manager_id ||
         form.parent_id !== props.department.parent_id ||
         form.budget !== props.department.budget ||
         form.location !== props.department.location ||
         form.status !== (props.department.status || 'Active') ||
         form.established_date !== props.department.established_date
})

// Methods
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

const formatDate = (dateString) => {
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

const handleSubmit = () => {
  form.put(route('departments.update', props.department.id), {
    onSuccess: () => {
      // Success handled by Inertia redirect
    },
    onError: (errors) => {
      console.error('Form submission errors:', errors)
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.focus()
        }
      }
    }
  })
}

const handleReset = () => {
  if (confirm('Are you sure you want to reset all changes? This action cannot be undone.')) {
    form.reset()
    form.clearErrors()
  }
}

const handleDelete = () => {
  if (props.department.employees_count > 0) {
    alert('Cannot delete department with employees. Please reassign employees first.')
    return
  }

  if (confirm(`Are you sure you want to delete ${props.department.name}? This action cannot be undone.`)) {
    router.delete(route('departments.destroy', props.department.id), {
      onSuccess: () => {
        router.visit(route('departments.index'))
      },
      onError: () => {
        alert('Failed to delete department. Please try again.')
      }
    })
  }
}
</script>