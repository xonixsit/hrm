<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="`Edit Task: ${task.name}`"
      subtitle="Update task information and details"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <FormLayout
        title="Task Information"
        description="Update the task's information below"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
      >
        <!-- Task Overview -->
        <div class="bg-neutral-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon 
                :name="getTaskIcon(task.priority)" 
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900">{{ task.name }}</h3>
              <p class="text-sm text-neutral-600">{{ task.project?.name || 'No project assigned' }}</p>
              <div class="flex items-center space-x-4 mt-1">
                <span :class="getStatusClasses(task.status)">
                  {{ getStatusLabel(task.status) }}
                </span>
                <span :class="getPriorityClasses(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
            </div>
          </div>
        </div>

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
              help="Current status of the task"
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

        <!-- Task History Section -->
        <FormSection
          title="Task History"
          description="Track changes and important dates"
        >
          <div class="bg-neutral-50 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="font-medium text-neutral-700">Created:</span>
                <p class="text-neutral-600">{{ formatDate(task.created_at) }}</p>
              </div>
              <div>
                <span class="font-medium text-neutral-700">Last Updated:</span>
                <p class="text-neutral-600">{{ formatDate(task.updated_at) }}</p>
              </div>
              <div>
                <span class="font-medium text-neutral-700">Days Active:</span>
                <p class="text-neutral-600">{{ getDaysActive(task.created_at) }} days</p>
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
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  }
})

// Form setup - Fixed to handle undefined task object
const form = useForm({
  project_id: props.task?.project_id || '',
  name: props.task?.name || '',
  description: props.task?.description || '',
  priority: props.task?.priority || 'medium',
  status: props.task?.status || 'todo',
  due_date: props.task?.due_date || ''
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
  { label: props.task.name, href: route('tasks.show', props.task.id) },
  { label: 'Edit', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'view-task',
    label: 'View Details',
    icon: EyeIcon,
    variant: 'secondary',
    handler: () => router.visit(route('tasks.show', props.task.id))
  },
  {
    id: 'delete-task',
    label: 'Delete Task',
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
    handler: () => router.visit(route('tasks.show', props.task.id))
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
    label: 'Update Task',
    type: 'submit',
    variant: 'primary',
    icon: CheckIcon,
    loadingLabel: 'Updating Task...',
    disabled: !isFormValid.value || !hasChanges.value
  }
])

// Form validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0 && form.project_id
})

// Check if form has changes
const hasChanges = computed(() => {
  return form.name !== props.task.name ||
         form.project_id !== props.task.project_id ||
         form.description !== props.task.description ||
         form.priority !== props.task.priority ||
         form.status !== props.task.status ||
         form.due_date !== props.task.due_date
})

// Methods
const getTaskIcon = (priority) => {
  const iconMap = {
    'urgent': ExclamationTriangleIcon,
    'high': ExclamationTriangleIcon,
    'medium': ClockIcon,
    'low': ClockIcon
  }
  return iconMap[priority] || ClockIcon
}

const getStatusLabel = (status) => {
  const labelMap = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'review': 'In Review',
    'done': 'Done'
  }
  return labelMap[status] || status
}

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  switch (status) {
    case 'todo':
      return `${baseClasses} bg-neutral-100 text-neutral-800`
    case 'in_progress':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'review':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'done':
      return `${baseClasses} bg-green-100 text-green-800`
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`
  }
}

const getPriorityLabel = (priority) => {
  const labelMap = {
    'low': 'Low Priority',
    'medium': 'Medium Priority',
    'high': 'High Priority',
    'urgent': 'Urgent'
  }
  return labelMap[priority] || priority
}

const getPriorityClasses = (priority) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  switch (priority) {
    case 'low':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'medium':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'high':
      return `${baseClasses} bg-orange-100 text-orange-800`
    case 'urgent':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`
  }
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

const getDaysActive = (createdAt) => {
  if (!createdAt) return 0
  
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

const handleSubmit = () => {
  form.put(route('tasks.update', props.task.id), {
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
  if (confirm(`Are you sure you want to delete the task "${props.task.name}"? This action cannot be undone.`)) {
    router.delete(route('tasks.destroy', props.task.id), {
      onSuccess: () => {
        router.visit(route('tasks.index'))
      },
      onError: () => {
        alert('Failed to delete task. Please try again.')
      }
    })
  }
}
</script>