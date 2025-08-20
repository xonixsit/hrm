<template>
  <AuthenticatedLayout>
    <PageLayout
    title="Create Employee"
    subtitle="Add a new employee to your organization"
    :breadcrumbs="breadcrumbs"
  >
    <FormLayout
      title="Employee Information"
      description="Enter the basic information for the new employee"
      :actions="formActions"
      :errors="form.errors"
      :is-submitting="form.processing"
      variant="card"
      @submit="handleSubmit"
    >
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
            help="Enter the employee's full name as it appears on official documents"
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
            label="Email Address"
            required
            :error="form.errors.email"
            help="This will be used for login and communication"
          >
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="john.doe@company.com"
              :error="!!form.errors.email"
              required
            />
          </FormField>

          <FormField
            label="Password"
            required
            :error="form.errors.password"
            help="Temporary password for the employee's first login"
          >
            <BaseInput
              v-model="form.password"
              type="password"
              placeholder="Enter temporary password"
              :error="!!form.errors.password"
              required
            />
          </FormField>

          <FormField
            label="Employee Code"
            :error="form.errors.employee_code"
            help="Unique identifier for the employee (optional)"
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
              :options="departments"
              option-label="name"
              option-value="id"
              :error="!!form.errors.department_id"
              placeholder="Select department"
            />
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
              :options="contractTypes"
              :error="!!form.errors.contract_type"
              placeholder="Select contract type"
            />
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
    </FormLayout>
  </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import FormLayout from '@/Components/Forms/FormLayout.vue'
import FormSection from '@/Components/Forms/FormSection.vue'
import FormField from '@/Components/Forms/FormField.vue'
import BaseInput from '@/Components/Base/BaseInput.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Array,
    default: () => []
  }
})

// Form setup
const form = useForm({
  name: '',
  email: '',
  password: '',
  department_id: '',
  job_title: '',
  employee_code: '',
  join_date: '',
  contract_type: ''
})

const contractTypes = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
];

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', href: route('employees.index') },
  { label: 'Create Employee', current: true }
]

// Form actions configuration
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('employees.index'))
  },
  {
    id: 'save-draft',
    label: 'Save as Draft',
    variant: 'ghost',
    handler: () => handleSaveDraft()
  },
  {
    id: 'create',
    label: 'Create Employee',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Creating Employee...',
    disabled: !isFormValid.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && 
         form.email && 
         form.password &&
         form.email.includes('@')
})

// Methods
const handleSubmit = () => {
  form.post(route('employees.store'), {
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

const handleSaveDraft = () => {
  // Implement save as draft functionality
  console.log('Saving as draft...')
  // You could save to localStorage or send to a draft endpoint
}

// Auto-generate employee code if not provided
const generateEmployeeCode = () => {
  if (!form.employee_code && form.name) {
    const initials = form.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
    
    const timestamp = Date.now().toString().slice(-4)
    form.employee_code = `EMP${initials}${timestamp}`
  }
}

// Watch for name changes to auto-generate employee code
watch(() => form.name, () => {
  if (form.name && !form.employee_code) {
    generateEmployeeCode()
  }
})

// Set default join date to today
if (!form.join_date) {
  form.join_date = new Date().toISOString().split('T')[0]
}
</script>