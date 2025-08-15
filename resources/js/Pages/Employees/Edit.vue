<template>
  <AuthenticatedLayout>
    <PageLayout
    :title="`Edit Employee: ${employee.user.name}`"
    subtitle="Update employee information and employment details"
    :breadcrumbs="breadcrumbs"
    :actions="headerActions"
  >
    <FormLayout
      title="Employee Information"
      description="Update the employee's information below"
      :actions="formActions"
      :errors="form.errors"
      :is-submitting="form.processing"
      variant="card"
      @submit="handleSubmit"
    >
      <!-- Employee Overview -->
      <div class="bg-neutral-50 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-lg font-semibold text-primary-700">
              {{ getInitials(employee.user.name) }}
            </span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">{{ employee.user.name }}</h3>
            <p class="text-sm text-neutral-600">{{ employee.user.email }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs text-neutral-500">Employee ID:</span>
              <span class="text-xs font-mono bg-neutral-200 px-2 py-0.5 rounded">{{ employee.employee_code || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Information Section -->
      <FormSection
        title="Personal Information"
        description="Basic personal details of the employee"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            required
            :error="form.errors.name"
            help="Employee's full name as it appears on official documents"
          >
            <BaseInput
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              :error="!!form.errors.name"
              required
            />
          </FormField>

          <FormField
            label="Employee Code"
            :error="form.errors.employee_code"
            help="Unique identifier for the employee"
          >
            <BaseInput
              v-model="form.employee_code"
              type="text"
              placeholder="EMP001"
              :error="!!form.errors.employee_code"
            />
          </FormField>
        </div>
      </FormSection>

      <!-- Employment Details Section -->
      <FormSection
        title="Employment Details"
        description="Job-related information and organizational structure"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Department"
            :error="form.errors.department_id"
            help="Select the department this employee belongs to"
          >
            <BaseSelect
              v-model="form.department_id"
              :error="!!form.errors.department_id"
              placeholder="Select department"
            >
              <option value="">Choose a department</option>
              <option 
                v-for="dept in departments" 
                :key="dept.id" 
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </BaseSelect>
          </FormField>

          <FormField
            label="Job Title"
            :error="form.errors.job_title"
            help="The employee's position or role in the organization"
          >
            <BaseInput
              v-model="form.job_title"
              type="text"
              placeholder="Software Developer"
              :error="!!form.errors.job_title"
            />
          </FormField>

          <FormField
            label="Contract Type"
            :error="form.errors.contract_type"
            help="Type of employment contract"
          >
            <BaseSelect
              v-model="form.contract_type"
              :error="!!form.errors.contract_type"
              placeholder="Select contract type"
            >
              <option value="">Choose contract type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </BaseSelect>
          </FormField>

          <FormField
            label="Join Date"
            :error="form.errors.join_date"
            help="The date when the employee started working"
          >
            <BaseInput
              v-model="form.join_date"
              type="date"
              :error="!!form.errors.join_date"
            />
          </FormField>
        </div>
      </FormSection>

      <!-- Password Reset Section (Admin Only) -->
      <FormSection
        v-if="canResetPassword"
        title="Password Management"
        description="Reset the employee's password (Admin only)"
      >
        <div class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
          <div class="flex items-start space-x-3">
            <ExclamationTriangleIcon class="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 class="text-sm font-medium text-warning-800">Password Reset</h4>
              <p class="text-sm text-warning-700 mt-1">
                This will immediately change the employee's password. They will need to use the new password to log in.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="New Password"
            required
            :error="passwordForm.errors.new_password"
            help="Password must be at least 8 characters long"
          >
            <BaseInput
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Enter new password"
              :error="!!passwordForm.errors.new_password"
              required
            />
          </FormField>

          <FormField
            label="Confirm New Password"
            required
            :error="passwordForm.errors.new_password_confirmation"
            help="Re-enter the new password to confirm"
          >
            <BaseInput
              v-model="passwordForm.new_password_confirmation"
              type="password"
              placeholder="Confirm new password"
              :error="!!passwordForm.errors.new_password_confirmation"
              required
            />
          </FormField>
        </div>

        <div class="flex justify-end mt-4">
          <button
            @click="handlePasswordReset"
            :disabled="!isPasswordFormValid || passwordForm.processing"
            class="inline-flex items-center px-4 py-2 bg-warning-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-warning-700 focus:bg-warning-700 active:bg-warning-900 focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyIcon class="w-4 h-4 mr-2" />
            {{ passwordForm.processing ? 'Resetting Password...' : 'Reset Password' }}
          </button>
        </div>
      </FormSection>

      <!-- Employment History Section -->
      <FormSection
        title="Employment History"
        description="Track changes and important dates"
      >
        <div class="bg-neutral-50 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="font-medium text-neutral-700">Created:</span>
              <p class="text-neutral-600">{{ formatDate(employee.created_at) }}</p>
            </div>
            <div>
              <span class="font-medium text-neutral-700">Last Updated:</span>
              <p class="text-neutral-600">{{ formatDate(employee.updated_at) }}</p>
            </div>
            <div>
              <span class="font-medium text-neutral-700">Time with Company:</span>
              <p class="text-neutral-600">{{ getTimeWithCompany(employee.join_date) }}</p>
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
import { useAuth } from '@/composables/useAuth.js'
import { useNotifications } from '@/composables/useNotifications.js'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import FormLayout from '@/Components/Forms/FormLayout.vue'
import FormSection from '@/Components/Forms/FormSection.vue'
import FormField from '@/Components/Forms/FormField.vue'
import BaseInput from '@/Components/Base/BaseInput.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import { 
  XMarkIcon, 
  CheckIcon, 
  EyeIcon, 
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  },
  departments: {
    type: Array,
    default: () => []
  }
})

// Composables
const { hasRole } = useAuth()

// Form setup
const form = useForm({
  name: props.employee.user.name,
  department_id: props.employee.department_id,
  job_title: props.employee.job_title,
  employee_code: props.employee.employee_code,
  join_date: props.employee.join_date,
  contract_type: props.employee.contract_type
})

// Password reset form
const passwordForm = useForm({
  new_password: '',
  new_password_confirmation: ''
})

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', href: route('employees.index') },
  { label: props.employee.user.name, href: route('employees.show', props.employee.id) },
  { label: 'Edit', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'view-employee',
    label: 'View Details',
    icon: EyeIcon,
    variant: 'secondary',
    handler: () => router.visit(route('employees.show', props.employee.id))
  },
  {
    id: 'delete-employee',
    label: 'Delete Employee',
    icon: TrashIcon,
    variant: 'danger',
    handler: () => handleDelete()
  }
]

// Form actions configuration
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('employees.show', props.employee.id))
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
    label: 'Update Employee',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Updating Employee...',
    disabled: !isFormValid.value || !hasChanges.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0
})

// Check if form has changes
const hasChanges = computed(() => {
  return form.name !== props.employee.user.name ||
         form.department_id !== props.employee.department_id ||
         form.job_title !== props.employee.job_title ||
         form.employee_code !== props.employee.employee_code ||
         form.join_date !== props.employee.join_date ||
         form.contract_type !== props.employee.contract_type
})

// Password reset permissions and validation
const canResetPassword = computed(() => {
  return hasRole('Admin')
})

const isPasswordFormValid = computed(() => {
  return passwordForm.new_password && 
         passwordForm.new_password.length >= 8 &&
         passwordForm.new_password === passwordForm.new_password_confirmation
})

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

const handleSubmit = () => {
  form.put(route('employees.update', props.employee.id), {
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

const handlePasswordReset = () => {
  if (confirm(`Are you sure you want to reset the password for ${props.employee.user.name}? They will need to use the new password to log in.`)) {
    passwordForm.post(route('employees.reset-password', props.employee.id), {
      onSuccess: () => {
        // Clear the password form
        passwordForm.reset()
        passwordForm.clearErrors()
        
        // Show success message (handled by backend flash message)
        console.log('Password reset successfully')
      },
      onError: (errors) => {
        console.error('Password reset errors:', errors)
        
        // Scroll to first error in password form
        const firstErrorField = Object.keys(errors)[0]
        if (firstErrorField) {
          const element = document.querySelector(`input[name="${firstErrorField}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.focus()
          }
        }
      }
    })
  }
}

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete ${props.employee.user.name}? This action cannot be undone.`)) {
    router.delete(route('employees.destroy', props.employee.id), {
      onSuccess: () => {
        router.visit(route('employees.index'))
      },
      onError: () => {
        alert('Failed to delete employee. Please try again.')
      }
    })
  }
}
</script>