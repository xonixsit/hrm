<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-neutral-800 leading-tight">
        {{ project.name }}
      </h2>
    </template>
    <!-- Page Header -->
    <PageHeader
      :title="project.name"
      :subtitle="project.client ? `Client: ${project.client}` : 'Project Details'"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    />

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Project Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Project Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information Card -->
          <InfoCard
            title="Project Information"
            icon="folder-open"
          >
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-neutral-500">Description</dt>
                <dd class="mt-1 text-sm text-neutral-900">
                  {{ project.description || 'No description provided' }}
                </dd>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-neutral-500">Start Date</dt>
                  <dd class="mt-1 text-sm text-neutral-900">
                    {{ project.start_date ? formatDate(project.start_date) : 'Not set' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500">Due Date</dt>
                  <dd class="mt-1 text-sm text-neutral-900">
                    {{ project.due_date ? formatDate(project.due_date) : 'Not set' }}
                  </dd>
                </div>
              </div>

              <div>
                <dt class="text-sm font-medium text-neutral-500">Budget</dt>
                <dd class="mt-1 text-sm text-neutral-900">
                  {{ project.budget ? formatCurrency(project.budget) : 'Not specified' }}
                </dd>
              </div>
            </div>
          </InfoCard>

          <!-- Progress Card -->
          <InfoCard
            title="Project Progress"
            icon="chart-bar"
          >
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-neutral-700">Overall Progress</span>
                  <span class="text-sm font-semibold text-neutral-900">{{ project.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-neutral-200 rounded-full h-3">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    :style="{ width: `${project.progress || 0}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div class="text-center">
                  <div class="text-2xl font-bold text-neutral-900">{{ project.tasks_completed || 0 }}</div>
                  <div class="text-sm text-neutral-500">Tasks Completed</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-neutral-900">{{ project.tasks_total || 0 }}</div>
                  <div class="text-sm text-neutral-500">Total Tasks</div>
                </div>
              </div>
            </div>
          </InfoCard>

          <!-- Team Members Card -->
          <InfoCard
            title="Team Members"
            icon="users"
          >
            <div class="space-y-4">
              <div v-if="project.manager" class="pb-4 border-b border-neutral-200">
                <h4 class="text-sm font-medium text-neutral-700 mb-2">Project Manager</h4>
                <div class="flex items-center space-x-3">
                  <img
                    v-if="project.manager.avatar"
                    :src="project.manager.avatar"
                    :alt="project.manager.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-primary-700">
                      {{ project.manager.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-neutral-900">{{ project.manager.name }}</div>
                    <div class="text-xs text-neutral-500">{{ project.manager.email }}</div>
                  </div>
                </div>
              </div>

              <div v-if="project.team_members && project.team_members.length > 0">
                <h4 class="text-sm font-medium text-neutral-700 mb-3">Team Members</h4>
                <div class="space-y-3">
                  <div
                    v-for="member in project.team_members"
                    :key="member.id"
                    class="flex items-center space-x-3"
                  >
                    <img
                      v-if="member.avatar"
                      :src="member.avatar"
                      :alt="member.name"
                      class="w-8 h-8 rounded-full"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-neutral-600">
                        {{ member.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium text-neutral-900">{{ member.name }}</div>
                      <div class="text-xs text-neutral-500">{{ member.role || 'Team Member' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-4">
                <Icon name="users" class="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p class="text-sm text-neutral-500">No team members assigned</p>
              </div>
            </div>
          </InfoCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <InfoCard
            title="Project Status"
            icon="flag"
          >
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-neutral-500">Current Status</dt>
                <dd class="mt-1">
                  <span :class="getStatusClasses(project.status)">
                    <Icon :name="getStatusIcon(project.status)" class="w-3 h-3 mr-1" />
                    {{ getStatusLabel(project.status) }}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-neutral-500">Priority</dt>
                <dd class="mt-1">
                  <span :class="getPriorityClasses(project.priority)">
                    <Icon :name="getPriorityIcon(project.priority)" class="w-3 h-3 mr-1" />
                    {{ getPriorityLabel(project.priority) }}
                  </span>
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-neutral-500">Created</dt>
                <dd class="mt-1 text-sm text-neutral-900">
                  {{ formatDate(project.created_at) }}
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-neutral-500">Last Updated</dt>
                <dd class="mt-1 text-sm text-neutral-900">
                  {{ formatDate(project.updated_at) }}
                </dd>
              </div>
            </div>
          </InfoCard>

          <!-- Quick Actions Card -->
          <InfoCard
            title="Quick Actions"
            icon="lightning-bolt"
          >
            <div class="space-y-3">
              <BaseButton
                v-if="canEdit"
                variant="primary"
                size="sm"
                icon="pencil"
                class="w-full justify-center"
                @click="router.visit(route('projects.edit', project.id))"
              >
                Edit Project
              </BaseButton>
              
              <BaseButton
                variant="secondary"
                size="sm"
                icon="document-duplicate"
                class="w-full justify-center"
                @click="handleClone"
              >
                Clone Project
              </BaseButton>
              
              <BaseButton
                variant="secondary"
                size="sm"
                icon="download"
                class="w-full justify-center"
                @click="handleExport"
              >
                Export Details
              </BaseButton>
              
              <BaseButton
                v-if="canDelete"
                variant="danger"
                size="sm"
                icon="trash"
                class="w-full justify-center"
                @click="handleDelete"
              >
                Delete Project
              </BaseButton>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';
import InfoCard from '@/Components/Layout/InfoCard.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const { user, hasRole, hasAnyRole } = useAuth();
const { showNotification } = useNotifications();

// Computed properties
const canEdit = computed(() => hasAnyRole(['Admin', 'Manager']));
const canDelete = computed(() => hasRole('Admin'));

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Projects', href: route('projects.index') },
  { label: props.project.name, current: true }
]);

const headerActions = computed(() => {
  const actions = [
    {
      id: 'back',
      label: 'Back to Projects',
      icon: 'arrow-left',
      variant: 'secondary',
      handler: () => router.visit(route('projects.index'))
    }
  ];

  if (canEdit.value) {
    actions.unshift({
      id: 'edit',
      label: 'Edit Project',
      icon: 'pencil',
      variant: 'primary',
      handler: () => router.visit(route('projects.edit', props.project.id))
    });
  }

  return actions;
});

// Methods
const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusClasses = {
    planning: 'bg-neutral-100 text-neutral-800',
    active: 'bg-success-100 text-success-800',
    on_hold: 'bg-warning-100 text-warning-800',
    completed: 'bg-primary-100 text-primary-800',
    cancelled: 'bg-error-100 text-error-800'
  };
  
  return `${baseClasses} ${statusClasses[status] || statusClasses.planning}`;
};

const getStatusIcon = (status) => {
  const statusIcons = {
    planning: 'clock',
    active: 'check-circle',
    on_hold: 'pause',
    completed: 'check-circle-solid',
    cancelled: 'x-circle'
  };
  
  return statusIcons[status] || 'clock';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  
  return statusLabels[status] || 'Unknown';
};

const getPriorityClasses = (priority) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const priorityClasses = {
    low: 'bg-neutral-100 text-neutral-800',
    medium: 'bg-info-100 text-info-800',
    high: 'bg-warning-100 text-warning-800',
    urgent: 'bg-error-100 text-error-800'
  };
  
  return `${baseClasses} ${priorityClasses[priority] || priorityClasses.medium}`;
};

const getPriorityIcon = (priority) => {
  const priorityIcons = {
    low: 'arrow-down',
    medium: 'minus',
    high: 'arrow-up',
    urgent: 'exclamation'
  };
  
  return priorityIcons[priority] || 'minus';
};

const getPriorityLabel = (priority) => {
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  
  return priorityLabels[priority] || 'Medium';
};

// Event handlers
const handleHeaderAction = (action) => {
  if (action.handler) {
    action.handler();
  }
};

const handleClone = () => {
  router.visit(route('projects.create'), {
    data: {
      clone_from: props.project.id
    }
  });
};

const handleExport = () => {
  showNotification({
    type: 'info',
    title: 'Export Started',
    message: 'Project details are being exported...'
  });
};

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete "${props.project.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await router.delete(route('projects.destroy', props.project.id));
    showNotification({
      type: 'success',
      title: 'Project Deleted',
      message: `"${props.project.name}" has been successfully deleted.`
    });
  } catch (error) {
    showNotification({
      type: 'error',
      title: 'Delete Failed',
      message: 'Failed to delete the project. Please try again.'
    });
  }
};
</script>