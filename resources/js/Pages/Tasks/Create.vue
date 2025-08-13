<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Task"
      subtitle="Add a new task to your project"
      :breadcrumbs="breadcrumbs"
    >
      <FormLayout
        title="Task Information"
        description="Enter the details for the new task"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
      >
        <!-- Basic Information Section -->
        <FormSection
          title="Basic Information"
          description="Essential details about the task"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Task Name"
              required
              :error="form.errors.name"
              help="Enter a clear, descriptive name for the task"
            >
              <BaseInput
                v-model="form.name"
                type="text"
                placeholder="e.g., Implement user authentication"
                :error="!!form.errors.name"
                required
              />
            </FormField>

            <FormField
              label="Project"
              required
              :error="form.errors.project_id"
              help="Select the project this task belongs to"
            >
              <BaseSelect
                v-model="form.project_id"
                :options="projectOptions"
                option-label="label"
                option-value="value"
                :error="!!form.errors.project_id"
                placeholder="Select a project"
              />
            </FormField>

            <FormField
              label="Description"
              :error="form.errors.description"
              help="Provide detailed information about the task"
              class="md:col-span-2"
            >
              <BaseTextarea
                v-model="form.description"
                placeholder="Describe what needs to be done, acceptance criteria, and any important notes..."
                :error="!!form.errors.description"
                rows="4"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Task Details Section -->
        <FormSection
          title="Task Details"
          description="Additional task configuration and settings"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Priority"
              :error="form.errors.priority"
              help="Set the task priority level"
            >
              <BaseSelect
                v-model="form.priority"
                :options="priorityOptions"
                option-label="label"
                option-value="value"
                :error="!!form.errors.priority"
                placeholder="Select priority"
              />
            </FormField>

            <FormField
              label="Status"
              :error="form.errors.status"
              help="Initial status for the task"
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
              label="Due Date"
              :error="form.errors.due_date"
              help="When should this task be completed"
            >
              <BaseInput
                v-model="form.due_date"
                type="date"
                :error="!!form.errors.due_date"
              />
            </FormField>
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
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  }
})

// Form setup
const form = useForm({
  project_id: '',
  name: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  due_date: ''
})

// Transform projects data for BaseSelect
const projectOptions = computed(() => {
  return props.projects.map(project => ({
    value: project.id,
    label: project.name
  }))
})

// Priority options for BaseSelect
const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' }
]

// Status options for BaseSelect
const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' }
]

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Project Management', href: '#' },
  { label: 'Tasks', href: route('tasks.index') },
  { label: 'Create Task', current: true }
]

// Form actions configuration
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('tasks.index'))
  },
  {
    id: 'save-draft',
    label: 'Save as Draft',
    variant: 'ghost',
    handler: () => handleSaveDraft()
  },
  {
    id: 'create',
    label: 'Create Task',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Creating Task...',
    disabled: !isFormValid.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0 && form.project_id
})

// Methods
const handleSubmit = () => {
  form.post(route('tasks.store'), {
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
</script>