<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-neutral-800 leading-tight">
        Edit Feedback
      </h2>
    </template>

    <!-- Page Header -->
    <PageHeader
      title="Edit Feedback"
      subtitle="Update feedback details"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    />

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto">
      <FormLayout
        title="Feedback Information"
        description="Update the feedback details and rating"
        :actions="formActions"
        :errors="form.errors"
        :is-submitting="form.processing"
        variant="card"
        @submit="handleSubmit"
        @action="handleFormAction"
      >
        <!-- Basic Information Section -->
        <FormSection
          title="Feedback Details"
          description="Essential feedback information"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Reviewee Selection -->
            <FormField
              label="Reviewee"
              required
              :error="form.errors.reviewee_id"
              description="Select the person this feedback is about"
            >
              <BaseSelect
                v-model="form.reviewee_id"
                :options="userOptions"
                placeholder="Select reviewee"
                :error="!!form.errors.reviewee_id"
                :disabled="form.processing"
                required
                searchable
              />
            </FormField>

            <!-- Period -->
            <FormField
              label="Period"
              required
              :error="form.errors.period"
              description="The time period this feedback covers"
            >
              <BaseInput
                v-model="form.period"
                type="text"
                placeholder="e.g., Q1 2024, January 2024"
                :error="!!form.errors.period"
                :disabled="form.processing"
                required
              />
            </FormField>
          </div>

          <!-- Rating -->
          <FormField
            label="Rating"
            :error="form.errors.rating"
            description="Rate the performance (1-5 stars)"
          >
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="form.rating = star"
                    :class="[
                      'w-8 h-8 transition-colors duration-200',
                      star <= (form.rating || 0) 
                        ? 'text-yellow-400 hover:text-yellow-500' 
                        : 'text-neutral-300 hover:text-yellow-300'
                    ]"
                    :disabled="form.processing"
                  >
                    <svg class="w-full h-full fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                </div>
                <span class="text-sm text-neutral-600 ml-2">
                  {{ form.rating ? `${form.rating} star${form.rating !== 1 ? 's' : ''}` : 'No rating' }}
                </span>
              </div>
              <BaseInput
                v-model="form.rating"
                type="number"
                min="1"
                max="5"
                placeholder="Rating (1-5)"
                :error="!!form.errors.rating"
                :disabled="form.processing"
                class="w-32"
              />
            </div>
          </FormField>

          <!-- Comments -->
          <FormField
            label="Comments"
            :error="form.errors.comments"
            description="Provide detailed feedback and observations"
          >
            <BaseTextarea
              v-model="form.comments"
              placeholder="Share your feedback, observations, and suggestions for improvement..."
              rows="6"
              :error="!!form.errors.comments"
              :disabled="form.processing"
            />
            <p class="text-xs text-neutral-500 mt-1">
              {{ form.comments?.length || 0 }}/1000 characters
            </p>
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

const props = defineProps({
  feedback: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  }
});

const { showNotification } = useNotifications();

// Form setup
const form = useForm({
  reviewee_id: props.feedback.reviewee_id,
  period: props.feedback.period || '',
  comments: props.feedback.comments || '',
  rating: props.feedback.rating || null,
});

// Computed properties
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Feedbacks', href: route('feedbacks.index') },
  { label: `Feedback #${props.feedback.id}`, href: route('feedbacks.show', props.feedback.id) },
  { label: 'Edit', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'view',
    label: 'View Feedback',
    icon: 'eye',
    variant: 'secondary',
    handler: () => router.visit(route('feedbacks.show', props.feedback.id))
  }
]);

const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('feedbacks.show', props.feedback.id))
  },
  {
    id: 'save',
    label: 'Update Feedback',
    type: 'submit',
    variant: 'primary',
    loadingLabel: 'Updating...',
    disabled: !form.reviewee_id || !form.period
  }
]);

const userOptions = computed(() => 
  props.users.map(user => ({
    value: user.id,
    label: user.name,
    description: user.email
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
  form.put(route('feedbacks.update', props.feedback.id), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Feedback Updated',
        message: 'The feedback has been successfully updated.'
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