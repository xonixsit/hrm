<template>
  <AuthenticatedLayout>
    <DetailPage
      :title="task.name"
      subtitle="Task details and project information"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      :avatar="{ icon: getTaskIcon(task.priority) }"
      :status="{ label: getStatusLabel(task.status), variant: getStatusVariant(task.status) }"
      :back-url="route('tasks.index')"
      :loading="loading"
    >
      <!-- Primary Content -->
      <template #primary>
        <!-- Task Information -->
        <InfoCard
          title="Task Information"
          description="Basic details about this task"
          :icon="ClipboardDocumentListIcon"
          :data="taskInfoData"
          class="mb-6"
        />

        <!-- Project Information -->
        <InfoCard
          title="Project Details"
          description="Project this task belongs to"
          :icon="FolderIcon"
          :data="projectInfoData"
          class="mb-6"
        />

        <!-- Task Progress -->
        <InfoCard
          title="Task Progress"
          description="Current status and timeline"
          :icon="ChartBarIcon"
          :data="progressData"
          class="mb-6"
        />

        <!-- Task Description -->
        <InfoCard
          title="Task Description"
          description="Detailed information about the task"
          :icon="DocumentTextIcon"
          display-mode="custom"
          class="mb-6"
        >
          <div class="prose max-w-none">
            <div v-if="task.description" class="text-neutral-700 leading-relaxed">
              {{ task.description }}
            </div>
            <div v-else class="text-neutral-500 italic">
              No description provided for this task.
            </div>
          </div>
        </InfoCard>
      </template>

      <!-- Secondary Content (Sidebar) -->
      <template #secondary>
        <!-- Task Statistics -->
        <InfoCard
          title="Task Statistics"
          :icon="ChartPieIcon"
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
import { 
  PencilIcon, 
  TrashIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChartPieIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

// Reactive state
const loading = ref(false)

// Computed properties
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Project Management', href: '#' },
  { label: 'Tasks', href: route('tasks.index') },
  { label: props.task.name, current: true }
])

const headerActions = computed(() => [
  {
    id: 'edit-task',
    label: 'Edit Task',
    icon: PencilIcon,
    variant: 'primary',
    priority: 'primary',
    handler: () => router.visit(route('tasks.edit', props.task.id))
  },
  {
    id: 'delete-task',
    label: 'Delete Task',
    icon: TrashIcon,
    variant: 'error',
    priority: 'secondary',
    handler: handleDelete
  }
])

const taskInfoData = computed(() => ({
  name: {
    label: 'Task Name',
    value: props.task.name,
    type: 'text'
  },
  priority: {
    label: 'Priority',
    value: getPriorityLabel(props.task.priority),
    type: 'badge',
    badgeVariant: getPriorityVariant(props.task.priority)
  },
  status: {
    label: 'Status',
    value: getStatusLabel(props.task.status),
    type: 'badge',
    badgeVariant: getStatusVariant(props.task.status)
  },
  due_date: {
    label: 'Due Date',
    value: props.task.due_date,
    type: 'date',
    emptyText: 'No due date set'
  }
}))

const projectInfoData = computed(() => ({
  project_name: {
    label: 'Project Name',
    value: props.task.project?.name,
    type: 'text',
    emptyText: 'No project assigned'
  },
  project_description: {
    label: 'Project Description',
    value: props.task.project?.description,
    type: 'text',
    emptyText: 'No project description'
  }
}))

const progressData = computed(() => ({
  created_date: {
    label: 'Created',
    value: props.task.created_at,
    type: 'datetime'
  },
  last_updated: {
    label: 'Last Updated',
    value: props.task.updated_at,
    type: 'datetime'
  },
  days_since_created: {
    label: 'Days Since Created',
    value: getDaysSinceCreated(props.task.created_at),
    type: 'number'
  }
}))

const statisticsData = computed(() => ({
  task_id: {
    label: 'Task ID',
    value: props.task.id,
    type: 'text'
  },
  priority_level: {
    label: 'Priority Level',
    value: getPriorityLevel(props.task.priority),
    type: 'text'
  },
  completion_status: {
    label: 'Completion',
    value: getCompletionPercentage(props.task.status),
    type: 'text'
  }
}))

const systemInfoData = computed(() => ({
  id: {
    label: 'Task ID',
    value: props.task.id,
    type: 'text'
  },
  created_at: {
    label: 'Created',
    value: props.task.created_at,
    type: 'datetime'
  },
  updated_at: {
    label: 'Last Modified',
    value: props.task.updated_at,
    type: 'datetime'
  }
}))

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

const getStatusVariant = (status) => {
  const variantMap = {
    'todo': 'neutral',
    'in_progress': 'warning',
    'review': 'primary',
    'done': 'success'
  }
  return variantMap[status] || 'neutral'
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

const getPriorityVariant = (priority) => {
  const variantMap = {
    'low': 'success',
    'medium': 'warning',
    'high': 'error',
    'urgent': 'error'
  }
  return variantMap[priority] || 'neutral'
}

const getPriorityLevel = (priority) => {
  const levelMap = {
    'low': 'Level 1 - Low',
    'medium': 'Level 2 - Medium',
    'high': 'Level 3 - High',
    'urgent': 'Level 4 - Urgent'
  }
  return levelMap[priority] || 'Unknown'
}

const getCompletionPercentage = (status) => {
  const percentageMap = {
    'todo': '0% Complete',
    'in_progress': '50% Complete',
    'review': '80% Complete',
    'done': '100% Complete'
  }
  return percentageMap[status] || '0% Complete'
}

const getDaysSinceCreated = (createdAt) => {
  if (!createdAt) return 0
  
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete the task "${props.task.name}"? This action cannot be undone.`)) {
    loading.value = true
    
    router.delete(route('tasks.destroy', props.task.id), {
      onSuccess: () => {
        router.visit(route('tasks.index'))
      },
      onError: () => {
        alert('Failed to delete task. Please try again.')
        loading.value = false
      },
      onFinish: () => {
        loading.value = false
      }
    })
  }
}
</script>