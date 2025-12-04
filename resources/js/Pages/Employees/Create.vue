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

          <FormField
            label="Date of Birth"
            :error="form.errors.date_of_birth"
            help="Employee's date of birth"
          >
            <BaseInput
              v-model="form.date_of_birth"
              type="date"
              :error="!!form.errors.date_of_birth"
            />
          </FormField>

          <FormField
            label="Gender"
            :error="form.errors.gender"
            help="Select the employee's gender"
          >
            <BaseSelect
              v-model="form.gender"
              :options="genderOptions"
              :error="!!form.errors.gender"
              placeholder="Select gender"
            />
          </FormField>

          <FormField
            label="Phone Number"
            :error="form.errors.phone"
            help="Primary contact number"
          >
            <BaseInput
              v-model="form.phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              :error="!!form.errors.phone"
            />
          </FormField>

          <FormField
            label="Personal Email"
            :error="form.errors.personal_email"
            help="Personal email address (different from work email)"
          >
            <BaseInput
              v-model="form.personal_email"
              type="email"
              placeholder="john.doe@personal.com"
              :error="!!form.errors.personal_email"
            />
          </FormField>

          <FormField
            label="Nationality"
            :error="form.errors.nationality"
            help="Employee's nationality"
          >
            <BaseInput
              v-model="form.nationality"
              type="text"
              placeholder="American"
              :error="!!form.errors.nationality"
            />
          </FormField>
        </div>
      </FormSection>

      <!-- Address Information Section -->
      <FormSection
        title="Address Information"
        description="Current and permanent address details"
      >
        <div class="grid grid-cols-1 gap-6">
          <FormField
            label="Current Address"
            :error="form.errors.current_address"
            help="Current residential address"
          >
            <BaseTextarea
              v-model="form.current_address"
              placeholder="123 Main Street, City, State, ZIP"
              :error="!!form.errors.current_address"
              rows="3"
            />
          </FormField>

          <FormField
            label="Permanent Address"
            :error="form.errors.permanent_address"
            help="Permanent residential address (if different from current)"
          >
            <BaseTextarea
              v-model="form.permanent_address"
              placeholder="456 Home Street, City, State, ZIP"
              :error="!!form.errors.permanent_address"
              rows="3"
            />
          </FormField>
        </div>
      </FormSection>

      <!-- Emergency Contact Section -->
      <FormSection
        title="Emergency Contact"
        description="Contact person in case of emergency"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Emergency Contact Name"
            :error="form.errors.emergency_contact_name"
            help="Full name of emergency contact person"
          >
            <BaseInput
              v-model="form.emergency_contact_name"
              type="text"
              placeholder="Jane Doe"
              :error="!!form.errors.emergency_contact_name"
            />
          </FormField>

          <FormField
            label="Relationship"
            :error="form.errors.emergency_contact_relationship"
            help="Relationship to the employee"
          >
            <BaseSelect
              v-model="form.emergency_contact_relationship"
              :options="relationshipOptions"
              :error="!!form.errors.emergency_contact_relationship"
              placeholder="Select relationship"
            />
          </FormField>

          <FormField
            label="Emergency Contact Phone"
            :error="form.errors.emergency_contact_phone"
            help="Phone number of emergency contact"
          >
            <BaseInput
              v-model="form.emergency_contact_phone"
              type="tel"
              placeholder="+1 (555) 987-6543"
              :error="!!form.errors.emergency_contact_phone"
            />
          </FormField>

          <FormField
            label="Emergency Contact Email"
            :error="form.errors.emergency_contact_email"
            help="Email address of emergency contact"
          >
            <BaseInput
              v-model="form.emergency_contact_email"
              type="email"
              placeholder="jane.doe@email.com"
              :error="!!form.errors.emergency_contact_email"
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

          <FormField
            label="Manager"
            :error="form.errors.manager_id"
            help="Select the employee's direct manager"
          >
            <BaseSelect
              v-model="form.manager_id"
              :options="managers"
              option-label="name"
              option-value="id"
              :error="!!form.errors.manager_id"
              placeholder="Select manager"
            />
          </FormField>

          <FormField
            label="Employment Type"
            :error="form.errors.employment_type"
            help="Type of employment"
          >
            <BaseSelect
              v-model="form.employment_type"
              :options="employmentTypes"
              :error="!!form.errors.employment_type"
              placeholder="Select employment type"
            />
          </FormField>

          <FormField
            label="Work Location"
            :error="form.errors.work_location"
            help="Primary work location"
          >
            <BaseInput
              v-model="form.work_location"
              type="text"
              placeholder="Main Office, Remote, etc."
              :error="!!form.errors.work_location"
            />
          </FormField>

          <FormField
            label="Salary"
            :error="form.errors.salary"
            help="Annual salary (optional)"
          >
            <BaseInput
              v-model="form.salary"
              type="number"
              step="0.01"
              placeholder="50000.00"
              :error="!!form.errors.salary"
            />
          </FormField>

          <FormField
            label="Salary Currency"
            :error="form.errors.salary_currency"
            help="Currency for salary"
          >
            <BaseSelect
              v-model="form.salary_currency"
              :options="currencyOptions"
              :error="!!form.errors.salary_currency"
              placeholder="Select currency"
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
import BaseTextarea from '@/Components/Base/BaseTextarea.vue'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Array,
    default: () => []
  },
  managers: {
    type: Array,
    default: () => []
  }
})

// Form setup
const form = useForm({
  // User Information
  name: '',
  email: '',
  password: '',
  
  // Employee Basic Information
  employee_code: '',
  department_id: '',
  manager_id: '',
  job_title: '',
  join_date: '',
  contract_type: '',
  
  // Personal Information
  date_of_birth: '',
  gender: '',
  phone: '',
  personal_email: '',
  nationality: '',
  
  // Address Information
  current_address: '',
  permanent_address: '',
  
  // Emergency Contact
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
  emergency_contact_email: '',
  
  // Employment Details
  employment_type: 'full_time',
  work_location: '',
  salary: '',
  salary_currency: 'USD'
})

const contractTypes = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Consultant', value: 'Consultant' }
]

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
  //console.log('Saving as draft...')
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