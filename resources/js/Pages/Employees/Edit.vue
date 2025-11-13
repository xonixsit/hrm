<template>
  <AuthenticatedLayout>
    <PageLayout :title="`Edit Employee: ${employee.user.name}`"
      subtitle="Update employee information and employment details" :breadcrumbs="breadcrumbs" :actions="headerActions">
      <!-- Success Message -->
      <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
        </div>
      </div>

      <FormLayout title="Employee Information" description="Update the employee's information below"
        :actions="formActions" :errors="form.errors" :is-submitting="form.processing" variant="card"
        @submit="handleSubmit">
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
                <span class="text-xs font-mono bg-neutral-200 px-2 py-0.5 rounded">{{ employee.employee_code || 'N/A'
                  }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information Section -->
        <FormSection title="Personal Information" description="Basic personal details of the employee">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" required :error="form.errors.name"
              help="Employee's full name as it appears on official documents">
              <BaseInput v-model="form.name" type="text" placeholder="John Doe" :error="!!form.errors.name" required
                :disabled="!canEditPersonalInfo" />
            </FormField>

            <FormField label="Employee Code" :error="form.errors.employee_code"
              help="Unique identifier for the employee">
              <BaseInput v-model="form.employee_code" type="text" placeholder="EMP001"
                :error="!!form.errors.employee_code" :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Date of Birth" :error="form.errors.date_of_birth" help="Employee's date of birth">
              <BaseInput v-model="form.date_of_birth" type="date" :error="!!form.errors.date_of_birth"
                :disabled="!canEditPersonalInfo" />
            </FormField>

            <FormField label="Gender" :error="form.errors.gender" help="Select the employee's gender">
              <BaseSelect v-model="form.gender" :options="genderOptions" :error="!!form.errors.gender"
                placeholder="Select gender" :disabled="!canEditPersonalInfo" />
            </FormField>

            <FormField label="Phone Number" :error="form.errors.phone" help="Primary contact number">
              <BaseInput v-model="form.phone" type="tel" placeholder="+1 (555) 123-4567" :error="!!form.errors.phone"
                :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Personal Email" :error="form.errors.personal_email"
              help="Personal email address (different from work email)">
              <BaseInput v-model="form.personal_email" type="email" placeholder="john.doe@personal.com"
                :error="!!form.errors.personal_email" :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Nationality" :error="form.errors.nationality" help="Employee's nationality">
              <BaseInput v-model="form.nationality" type="text" placeholder="American"
                :error="!!form.errors.nationality" :disabled="!canEditPersonalInfo" />
            </FormField>
          </div>
        </FormSection>

        <!-- Address Information Section -->
        <FormSection title="Address Information" description="Current and permanent address details"
          v-if="canViewContactInfo">
          <div class="grid grid-cols-1 gap-6">
            <FormField label="Current Address" :error="form.errors.current_address" help="Current residential address">
              <BaseTextarea v-model="form.current_address" placeholder="123 Main Street, City, State, ZIP"
                :error="!!form.errors.current_address" rows="3" :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Permanent Address" :error="form.errors.permanent_address"
              help="Permanent residential address (if different from current)">
              <BaseTextarea v-model="form.permanent_address" placeholder="456 Home Street, City, State, ZIP"
                :error="!!form.errors.permanent_address" rows="3" :disabled="!canEditContactInfo" />
            </FormField>
          </div>
        </FormSection>

        <!-- Emergency Contact Section -->
        <FormSection title="Emergency Contact" description="Contact person in case of emergency"
          v-if="canViewContactInfo">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Emergency Contact Name" :error="form.errors.emergency_contact_name"
              help="Full name of emergency contact person">
              <BaseInput v-model="form.emergency_contact_name" type="text" placeholder="Jane Doe"
                :error="!!form.errors.emergency_contact_name" :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Relationship" :error="form.errors.emergency_contact_relationship"
              help="Relationship to the employee">
              <BaseSelect v-model="form.emergency_contact_relationship" :options="relationshipOptions"
                :error="!!form.errors.emergency_contact_relationship" placeholder="Select relationship"
                :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Emergency Contact Phone" :error="form.errors.emergency_contact_phone"
              help="Phone number of emergency contact">
              <BaseInput v-model="form.emergency_contact_phone" type="tel" placeholder="+1 (555) 987-6543"
                :error="!!form.errors.emergency_contact_phone" :disabled="!canEditContactInfo" />
            </FormField>

            <FormField label="Emergency Contact Email" :error="form.errors.emergency_contact_email"
              help="Email address of emergency contact">
              <BaseInput v-model="form.emergency_contact_email" type="email" placeholder="jane.doe@email.com"
                :error="!!form.errors.emergency_contact_email" :disabled="!canEditContactInfo" />
            </FormField>
          </div>
        </FormSection>

        <!-- Employment Details Section -->
        <FormSection title="Employment Details" description="Job-related information and organizational structure">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Job Title" :error="form.errors.job_title"
              help="The employee's position or role in the organization">
              <BaseInput v-model="form.job_title" type="text" placeholder="Software Developer"
                :error="!!form.errors.job_title" :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Department" :error="form.errors.department_id"
              help="Select the department this employee belongs to">
              <BaseSelect v-model="form.department_id" :options="departments" option-label="name" option-value="id"
                placeholder="Select department" :error="!!form.errors.department_id"
                :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Manager" :error="form.errors.manager_id" help="Select the employee's direct manager">
              <BaseSelect v-model="form.manager_id" :options="managers" option-label="name" option-value="id"
                :error="!!form.errors.manager_id" placeholder="Select manager" :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Join Date" :error="form.errors.join_date"
              help="The date when the employee started working">
              <BaseInput v-model="form.join_date" type="date" :error="!!form.errors.join_date"
                :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Contract Type" :error="form.errors.contract_type" help="Type of employment contract">
              <BaseSelect v-model="form.contract_type" :options="contractTypeOptions"
                :error="!!form.errors.contract_type" placeholder="Select contract type"
                :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Employment Type" :error="form.errors.employment_type" help="Type of employment">
              <BaseSelect v-model="form.employment_type" :options="employmentTypes"
                :error="!!form.errors.employment_type" placeholder="Select employment type"
                :disabled="!canEditEmploymentInfo" />
            </FormField>

            <FormField label="Work Location" :error="form.errors.work_location" help="Primary work location">
              <BaseInput v-model="form.work_location" type="text" placeholder="Main Office, Remote, etc."
                :error="!!form.errors.work_location" :disabled="!canEditEmploymentInfo" />
            </FormField>
          </div>

          <!-- Salary Information (Admin/HR Only) -->
          <div v-if="canViewSalaryInfo" class="mt-6">
            <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center mt-0.5">
                  <span class="text-xs text-white font-bold">$</span>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-teal-800">Salary Information</h4>
                  <p class="text-sm text-teal-700 mt-1">
                    This information is confidential and only visible to authorized personnel.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Salary" :error="form.errors.salary" help="Annual salary">
                <BaseInput v-model="form.salary" type="number" step="0.01" placeholder="50000.00"
                  :error="!!form.errors.salary" :disabled="!canEditSalaryInfo" />
              </FormField>

              <FormField label="Salary Currency" :error="form.errors.salary_currency" help="Currency for salary">
                <BaseSelect v-model="form.salary_currency" :options="currencyOptions"
                  :error="!!form.errors.salary_currency" placeholder="Select currency" :disabled="!canEditSalaryInfo" />
              </FormField>
            </div>
          </div>
        </FormSection>

        <!-- Password Reset Section (Admin Only) -->
        <FormSection title="Password Reset" description="Reset the employee's login password" v-if="canResetPassword">
          <div class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
            <div class="flex items-start space-x-3">
              <ExclamationTriangleIcon class="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 class="text-sm font-medium text-warning-800">Password Reset</h4>
                <p class="text-sm text-warning-700 mt-1">
                  This will immediately change the employee's password. They will need to use the new password to log
                  in.
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="New Password" required :error="passwordForm.errors.new_password"
              help="Password must be at least 8 characters long">
              <BaseInput v-model="passwordForm.new_password" type="password" placeholder="Enter new password"
                :error="!!passwordForm.errors.new_password" required />
            </FormField>

            <FormField label="Confirm New Password" required :error="passwordForm.errors.new_password_confirmation"
              help="Re-enter the new password to confirm">
              <BaseInput v-model="passwordForm.new_password_confirmation" type="password"
                placeholder="Confirm new password" :error="!!passwordForm.errors.new_password_confirmation" required />
            </FormField>
          </div>

          <div class="flex justify-end mt-4">
            <button @click="handlePasswordReset" :disabled="!isPasswordFormValid || passwordForm.processing"
              class="inline-flex items-center px-4 py-2 bg-warning-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-warning-700 focus:bg-warning-700 active:bg-warning-900 focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
              <KeyIcon class="w-4 h-4 mr-2" />
              {{ passwordForm.processing ? 'Resetting Password...' : 'Reset Password' }}
            </button>
          </div>
        </FormSection>

        <!-- Employment History Section -->
        <FormSection title="Employment History" description="Track changes and important dates">
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
  import { computed, onMounted } from 'vue'
  import { useForm, router, usePage } from '@inertiajs/vue3'
  import { useAuth } from '@/composables/useAuth.js'
  import { useNotifications } from '@/composables/useNotifications.js'
  import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
  import PageLayout from '@/Components/Layout/PageLayout.vue'
  import FormLayout from '@/Components/Forms/FormLayout.vue'
  import FormSection from '@/Components/Forms/FormSection.vue'
  import FormField from '@/Components/Forms/FormField.vue'
  import BaseInput from '@/Components/Base/BaseInput.vue'
  import BaseSelect from '@/Components/Base/BaseSelect.vue'
  import BaseTextarea from '@/Components/Base/BaseTextarea.vue'
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
    },
    contractTypes: {
      type: Array,
      default: () => []
    },
    managers: {
      type: Array,
      default: () => []
    }
  })





  // Composables
  const { hasRole, hasAnyRole, user } = useAuth()
  const { showNotification } = useNotifications()

  // RBAC Permissions
  const canEditPersonalInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR']) || user.value?.id === props.employee.user_id
  })

  const canEditContactInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR']) || user.value?.id === props.employee.user_id
  })

  const canEditEmploymentInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR', 'Manager'])
  })

  const canEditSalaryInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR'])
  })

  const canViewContactInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR', 'Manager']) || user.value?.id === props.employee.user_id
  })

  const canViewSalaryInfo = computed(() => {
    return hasAnyRole(['Admin', 'HR'])
  })

  // Form Options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' }
  ]

  const relationshipOptions = [
    { label: 'Spouse', value: 'spouse' },
    { label: 'Parent', value: 'parent' },
    { label: 'Child', value: 'child' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other Relative', value: 'other_relative' },
    { label: 'Other', value: 'other' }
  ]

  const employmentTypes = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Part Time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Intern', value: 'intern' },
    { label: 'Consultant', value: 'consultant' }
  ]

  const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
    { label: 'INR - Indian Rupee', value: 'INR' }
  ]

  const contractTypeOptions = computed(() => {
    return props.contractTypes.map(type => ({
      label: type,
      value: type
    }))
  })

  // Form setup
  const form = useForm({
    // User Information
    name: props.employee.user?.name || '',

    // Employee Basic Information
    employee_code: props.employee.employee_code || '',
    department_id: props.employee.department_id || '',
    manager_id: props.employee.manager_id || '',
    job_title: props.employee.job_title || '',
    join_date: props.employee.join_date ? new Date(props.employee.join_date).toISOString().split('T')[0] : '',
    contract_type: props.employee.contract_type || '',

    // Personal Information
    date_of_birth: props.employee.date_of_birth ? new Date(props.employee.date_of_birth).toISOString().split('T')[0] : '',
    gender: props.employee.gender || '',
    phone: props.employee.phone || '',
    personal_email: props.employee.personal_email || '',
    nationality: props.employee.nationality || '',

    // Address Information
    current_address: props.employee.current_address || '',
    permanent_address: props.employee.permanent_address || '',

    // Emergency Contact
    emergency_contact_name: props.employee.emergency_contact_name || '',
    emergency_contact_relationship: props.employee.emergency_contact_relationship || '',
    emergency_contact_phone: props.employee.emergency_contact_phone || '',
    emergency_contact_email: props.employee.emergency_contact_email || '',

    // Employment Details
    employment_type: props.employee.employment_type || 'full_time',
    work_location: props.employee.work_location || '',
    salary: props.employee.salary || '',
    salary_currency: props.employee.salary_currency || 'USD'
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
    const originalJoinDate = props.employee.join_date ? new Date(props.employee.join_date).toISOString().split('T')[0] : ''
    const originalDOB = props.employee.date_of_birth ? new Date(props.employee.date_of_birth).toISOString().split('T')[0] : ''

    return form.name !== (props.employee.user?.name || '') ||
      form.department_id !== (props.employee.department_id || '') ||
      form.manager_id !== (props.employee.manager_id || '') ||
      form.job_title !== (props.employee.job_title || '') ||
      form.employee_code !== (props.employee.employee_code || '') ||
      form.join_date !== originalJoinDate ||
      form.contract_type !== (props.employee.contract_type || '') ||
      form.date_of_birth !== originalDOB ||
      form.gender !== (props.employee.gender || '') ||
      form.phone !== (props.employee.phone || '') ||
      form.personal_email !== (props.employee.personal_email || '') ||
      form.nationality !== (props.employee.nationality || '') ||
      form.current_address !== (props.employee.current_address || '') ||
      form.permanent_address !== (props.employee.permanent_address || '') ||
      form.emergency_contact_name !== (props.employee.emergency_contact_name || '') ||
      form.emergency_contact_relationship !== (props.employee.emergency_contact_relationship || '') ||
      form.emergency_contact_phone !== (props.employee.emergency_contact_phone || '') ||
      form.emergency_contact_email !== (props.employee.emergency_contact_email || '') ||
      form.employment_type !== (props.employee.employment_type || 'full_time') ||
      form.work_location !== (props.employee.work_location || '') ||
      form.salary !== (props.employee.salary || '') ||
      form.salary_currency !== (props.employee.salary_currency || 'USD')
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
    });


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
        // Success message will be shown via flash message and notification
        console.log('Employee updated successfully')
      },
      onError: (errors) => {
        console.error('Form submission errors:', errors)
        
        // Show error notification
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Please check the form for errors and try again.'
        })
        
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

          // Show success notification
          showNotification({
            type: 'success',
            title: 'Password Reset',
            message: `Password has been reset successfully for ${props.employee.user.name}`
          })
          
          console.log('Password reset successfully')
        },
        onError: (errors) => {
          console.error('Password reset errors:', errors)

          // Show error notification
          showNotification({
            type: 'error',
            title: 'Password Reset Failed',
            message: 'Failed to reset password. Please check the form and try again.'
          })

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
          showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'Failed to delete employee. Please try again.'
          })
        }
      })
    }
  }

  // Handle flash messages from backend on component mount
  onMounted(() => {
    // Access flash messages from global page props
    const page = usePage()
    
    // Check for success flash message
    if (page.props.flash?.success) {
      showNotification({
        type: 'success',
        title: 'Success',
        message: page.props.flash.success
      })
    }
    
    // Check for error flash message
    if (page.props.flash?.error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: page.props.flash.error
      })
    }
  })
</script>