<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-neutral-800 leading-tight">
        Edit Project: {{ project.name }}
      </h2>
    </template>
    <!-- Page Header -->
    <PageHeader
      title="Edit Project"
      :subtitle="`Update details for ${project.name}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    />

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto">
      <FormLayout
        title="Project Information"
        description="Update the project details and settings"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
        @action="handleFormAction"
      >
        <!-- Basic Information Section -->
        <FormSection
          title="Basic Information"
          description="Essential project details"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Project Name -->
            <FormField
              label="Project Name"
              required
              :error="form.errors.name"
              description="A clear, descriptive name for your project"
            >
              <BaseInput
                v-model="form.name"
                type="text"
                placeholder="Enter project name"
                :error="!!form.errors.name"
                :disabled="form.processing"
                required
              />
            </FormField>

            <!-- Client -->
            <FormField
              label="Client"
              :error="form.errors.client"
              description="The client or organization for this project"
            >
              <BaseInput
                v-model="form.client"
                type="text"
                placeholder="Enter client name"
                :error="!!form.errors.client"
                :disabled="form.processing"
              />
            </FormField>
          </div>

          <!-- Description -->
          <FormField
            label="Description"
            :error="form.errors.description"
            description="Provide a detailed description of the project goals and scope"
          >
            <BaseTextarea
              v-model="form.description"
              placeholder="Describe the project objectives, deliverables, and key requirements..."
              rows="4"
              :error="!!form.errors.description"
              :disabled="form.processing"
            />
          </FormField>
        </FormSection>

        <!-- Project Details Section -->
        <FormSection
          title="Project Details"
          description="Timeline, priority, and status information"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Status -->
            <FormField
              label="Status"
              :error="form.errors.status"
            >
              <BaseSelect
                v-model="form.status"
                :options="statusOptions"
                placeholder="Select status"
                :error="!!form.errors.status"
                :disabled="form.processing"
              />
            </FormField>

            <!-- Priority -->
            <FormField
              label="Priority"
              :error="form.errors.priority"
            >
              <BaseSelect
                v-model="form.priority"
                :options="priorityOptions"
                placeholder="Select priority"
                :error="!!form.errors.priority"
                :disabled="form.processing"
              />
            </FormField>

            <!-- Budget -->
            <FormField
              label="Budget"
              :error="form.errors.budget"
              description="Project budget (optional)"
            >
              <BaseInput
                v-model="form.budget"
                type="number"
                placeholder="0.00"
                :error="!!form.errors.budget"
                :disabled="form.processing"
                step="0.01"
                min="0"
              />
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Start Date -->
            <FormField
              label="Start Date"
              :error="form.errors.start_date"
            >
              <BaseInput
                v-model="form.start_date"
                type="date"
                :error="!!form.errors.start_date"
                :disabled="form.processing"
              />
            </FormField>

            <!-- Due Date -->
            <FormField
              label="Due Date"
              :error="form.errors.due_date"
            >
              <BaseInput
                v-model="form.due_date"
                type="date"
                :error="!!form.errors.due_date"
                :disabled="form.processing"
              />
            </FormField>
          </div>

          <!-- Progress -->
          <FormField
            label="Progress"
            :error="form.errors.progress"
            description="Current project completion percentage"
          >
            <div class="space-y-2">
              <BaseInput
                v-model="form.progress"
                type="number"
                placeholder="0"
                :error="!!form.errors.progress"
                :disabled="form.processing"
                min="0"
                max="100"
              />
              <div class="flex items-center space-x-2">
                <div class="flex-1 bg-neutral-200 rounded-full h-2">
                  <div 
                    class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${form.progress || 0}%` }"
                  ></div>
                </div>
                <span class="text-sm text-neutral-600 font-medium">{{ form.progress || 0 }}%</span>
              </div>
            </div>
          </FormField>
        </FormSection>

        <!-- Team Assignment Section -->
        <FormSection
          title="Team Assignment"
          description="Assign team members to this project"
        >
          <FormField
            label="Team Members"
            :error="form.errors.team_members"
            description="Select team members who will work on this project"
          >
            <BaseMultiSelect
              v-model="form.team_members"
              :options="teamMemberOptions"
              placeholder="Select team members"
              :error="!!form.errors.team_members"
              :disabled="form.processing"
              searchable
            />
          </FormField>

          <!-- Project Manager -->
          <FormField
            label="Project Manager"
            :error="form.errors.manager_id"
            description="Assign a project manager (optional)"
          >
            <BaseSelect
              v-model="form.manager_id"
              :options="managerOptions"
              placeholder="Select project manager"
              :error="!!form.errors.manager_id"
              :disabled="form.processing"
              searchable
            />
          </FormField>
        </FormSection>
      </FormLayout>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { useForm, router } from '@inertiajs/vue3';
import { useNotifications } from '@/composables/useNotifications.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  },
  managers: {
    type: Array,
    default: () => []
  }
});

const { showNotification } = useNotifications();

// Form setup
const form = useForm({
  name: props.project.name || '',
  description: props.project.description || '',
  client: props.project.client || '',
  status: props.project.status || 'planning',
  priority: props.project.priority || 'medium',
  budget: props.project.budget || '',
  start_date: props.project.start_date || '',
  due_date: props.project.due_date || '',
  progress: props.project.progress || 0,
  team_members: props.project.team_members?.map(member => member.id) || [],
  manager_id: props.project.manager_id || ''
});

// Computed properties
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Projects', href: route('projects.index') },
  { label: props.project.name, href: route('projects.show', props.project.id) },
  { label: 'Edit', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'view',
    label: 'View Project',
    icon: 'eye',
    variant: 'secondary',
    handler: () => router.visit(route('projects.show', props.project.id))
  }
]);

const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('projects.show', props.project.id))
  },
  {
    id: 'save',
    label: 'Update Project',
    type: 'submit',
    variant: 'primary',
    loadingLabel: 'Updating...',
    disabled: !form.name
  }
]);

const statusOptions = computed(() => [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]);

const priorityOptions = computed(() => [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]);

const teamMemberOptions = computed(() => 
  props.users.map(user => ({
    value: user.id,
    label: user.name,
    description: user.email
  }))
);

const managerOptions = computed(() => 
  props.managers.map(manager => ({
    value: manager.id,
    label: manager.name,
    description: manager.email
  }))
);

// Event handlers
const handleHeaderAction = (action) => {
  if (action.handler) {
    action.handler();
  }
};

const handleFormAction = (action) => {
  if (action.handler) {
    action.handler();
  }
};

const handleSubmit = () => {
  form.put(route('projects.update', props.project.id), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Project Updated',
        message: `"${form.name}" has been successfully updated.`
      });
    },
    onError: () => {
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Please check the form for errors and try again.'
      });
    }
  });
};
</script>