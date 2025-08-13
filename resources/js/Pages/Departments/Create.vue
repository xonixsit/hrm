<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Department"
      subtitle="Add a new department to your organization"
      :breadcrumbs="breadcrumbs"
    >
      <FormLayout
        title="Department Information"
        description="Enter the basic information for the new department"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
      >
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
              help="Short code for the department (optional)"
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
              help="Annual budget for this department (optional)"
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
  name: '',
  code: '',
  description: '',
  manager_id: '',
  parent_id: '',
  budget: '',
  location: '',
  status: 'Active',
  established_date: ''
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
  return props.departments.map(dept => ({
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

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'People Management', href: '#' },
  { label: 'Departments', href: route('departments.index') },
  { label: 'Create Department', current: true }
]

// Form actions configuration
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('departments.index'))
  },
  {
    id: 'save-draft',
    label: 'Save as Draft',
    variant: 'ghost',
    handler: () => handleSaveDraft()
  },
  {
    id: 'create',
    label: 'Create Department',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Creating Department...',
    disabled: !isFormValid.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0
})

// Methods
const handleSubmit = () => {
  form.post(route('departments.store'), {
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
  console.log('Saving as draft...')
  // Could save to localStorage or send to a draft endpoint
}

// Auto-generate department code if not provided
const generateDepartmentCode = () => {
  if (!form.code && form.name) {
    const code = form.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 5)
    
    form.code = code
  }
}

// Watch for name changes to auto-generate code
watch(() => form.name, () => {
  if (form.name && !form.code) {
    generateDepartmentCode()
  }
})

// Set default established date to today
if (!form.established_date) {
  form.established_date = new Date().toISOString().split('T')[0]
}
</script>