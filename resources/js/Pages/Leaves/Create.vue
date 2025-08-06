<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Request Leave"
      subtitle="Submit a new leave request for approval"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Progress Indicator -->
      <div class="mb-8">
        <ProgressIndicator
          :steps="formSteps"
          :current-step="currentStep"
          variant="steps"
          :show-descriptions="true"
          class="mb-6"
        />
      </div>

      <!-- Form Container -->
      <div class="bg-white shadow-sm rounded-lg border border-neutral-200">
        <FormLayout
          :title="getCurrentStepTitle()"
          :description="getCurrentStepDescription()"
          :errors="form.errors"
          :is-submitting="form.processing"
          :actions="formActions"
          variant="card"
          @submit="handleSubmit"
          @action="handleFormAction"
        >
          <!-- Step 1: Leave Type Selection -->
          <div v-if="currentStep === 0" class="space-y-6">
            <FormSection title="Select Leave Type" description="Choose the type of leave you want to request">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="type in leaveTypes"
                    :key="type.id"
                    :class="getLeaveTypeCardClasses(type)"
                    @click="selectLeaveType(type)"
                  >
                    <div class="flex items-center space-x-3">
                      <div :class="getLeaveTypeIconClasses(type.name)">
                        <component :is="getLeaveTypeIcon(type.name)" class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <h3 class="text-sm font-medium text-neutral-900">{{ type.name }}</h3>
                        <p class="text-xs text-neutral-500 mt-1">{{ getLeaveTypeDescription(type.name) }}</p>
                      </div>
                      <div v-if="form.leave_type_id === type.id" class="flex-shrink-0">
                        <CheckCircleIcon class="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="form.errors.leave_type_id" class="text-error-600 text-sm mt-2">
                  {{ form.errors.leave_type_id }}
                </div>
              </FormSection>
            </div>

            <!-- Step 2: Date Selection -->
            <div v-if="currentStep === 1" class="space-y-6">
              <FormSection title="Select Dates" description="Choose your leave start and end dates">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Start Date"
                    :error="form.errors.from_date"
                    required
                  >
                    <input
                      v-model="form.from_date"
                      type="date"
                      :min="minDate"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      @change="validateDates"
                    />
                  </FormField>

                  <FormField
                    label="End Date"
                    :error="form.errors.to_date"
                    required
                  >
                    <input
                      v-model="form.to_date"
                      type="date"
                      :min="form.from_date || minDate"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      @change="validateDates"
                    />
                  </FormField>
                </div>

                <!-- Duration Display -->
                <div v-if="form.from_date && form.to_date" class="mt-4 p-4 bg-primary-50 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <CalendarIcon class="w-5 h-5 text-primary-600" />
                    <div>
                      <p class="text-sm font-medium text-primary-900">
                        Leave Duration: {{ calculateDuration() }}
                      </p>
                      <p class="text-xs text-primary-700 mt-1">
                        From {{ formatDate(form.from_date) }} to {{ formatDate(form.to_date) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Calendar Integration Placeholder -->
                <div class="mt-6 p-4 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
                  <div class="text-center">
                    <CalendarIcon class="mx-auto w-8 h-8 text-neutral-400" />
                    <p class="text-sm text-neutral-600 mt-2">Calendar integration coming soon</p>
                    <p class="text-xs text-neutral-500">View team availability and holidays</p>
                  </div>
                </div>
              </FormSection>
            </div>

            <!-- Step 3: Reason and Details -->
            <div v-if="currentStep === 2" class="space-y-6">
              <FormSection title="Provide Details" description="Add a reason for your leave request">
                <FormField
                  label="Reason for Leave"
                  :error="form.errors.reason"
                  required
                >
                  <textarea
                    v-model="form.reason"
                    rows="4"
                    placeholder="Please provide a detailed reason for your leave request..."
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  ></textarea>
                  <p class="text-xs text-neutral-500 mt-1">
                    {{ form.reason?.length || 0 }}/500 characters
                  </p>
                </FormField>

                <!-- Additional Options -->
                <div class="space-y-4">
                  <div class="flex items-center">
                    <input
                      id="emergency"
                      v-model="form.is_emergency"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label for="emergency" class="ml-2 block text-sm text-neutral-900">
                      This is an emergency leave request
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="half-day"
                      v-model="form.is_half_day"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label for="half-day" class="ml-2 block text-sm text-neutral-900">
                      Half day leave
                    </label>
                  </div>
                </div>
              </FormSection>
            </div>

            <!-- Step 4: Review and Submit -->
            <div v-if="currentStep === 3" class="space-y-6">
              <FormSection title="Review Your Request" description="Please review your leave request before submitting">
                <div class="bg-neutral-50 rounded-lg p-6 space-y-4">
                  <!-- Leave Type -->
                  <div class="flex items-center justify-between py-2 border-b border-neutral-200">
                    <span class="text-sm font-medium text-neutral-600">Leave Type</span>
                    <div class="flex items-center space-x-2">
                      <div :class="getLeaveTypeIconClasses(getSelectedLeaveType()?.name)">
                        <component :is="getLeaveTypeIcon(getSelectedLeaveType()?.name)" class="w-4 h-4" />
                      </div>
                      <span class="text-sm font-medium text-neutral-900">
                        {{ getSelectedLeaveType()?.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Dates -->
                  <div class="flex items-center justify-between py-2 border-b border-neutral-200">
                    <span class="text-sm font-medium text-neutral-600">Duration</span>
                    <div class="text-right">
                      <p class="text-sm font-medium text-neutral-900">{{ calculateDuration() }}</p>
                      <p class="text-xs text-neutral-500">
                        {{ formatDate(form.from_date) }} - {{ formatDate(form.to_date) }}
                      </p>
                    </div>
                  </div>

                  <!-- Reason -->
                  <div class="py-2">
                    <span class="text-sm font-medium text-neutral-600">Reason</span>
                    <p class="text-sm text-neutral-900 mt-1">{{ form.reason }}</p>
                  </div>

                  <!-- Additional Options -->
                  <div v-if="form.is_emergency || form.is_half_day" class="py-2 border-t border-neutral-200">
                    <span class="text-sm font-medium text-neutral-600">Additional Options</span>
                    <div class="mt-1 space-y-1">
                      <p v-if="form.is_emergency" class="text-xs text-orange-600 flex items-center">
                        <ExclamationTriangleIcon class="w-3 h-3 mr-1" />
                        Emergency leave request
                      </p>
                      <p v-if="form.is_half_day" class="text-xs text-blue-600 flex items-center">
                        <ClockIcon class="w-3 h-3 mr-1" />
                        Half day leave
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Submission Note -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-start space-x-3">
                    <InformationCircleIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-sm font-medium text-blue-900">Before you submit</h4>
                      <p class="text-sm text-blue-700 mt-1">
                        Your leave request will be sent to your manager for approval. You will receive an email notification once it has been reviewed.
                      </p>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
        </FormLayout>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, useForm, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';
import ProgressIndicator from '@/Components/Forms/ProgressIndicator.vue';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leaveTypes: {
    type: Array,
    default: () => []
  }
});

// Form state
const form = useForm({
  leave_type_id: '',
  from_date: '',
  to_date: '',
  reason: '',
  is_emergency: false,
  is_half_day: false
});

// Step management
const currentStep = ref(0);

// Form steps configuration
const formSteps = [
  {
    id: 'leave-type',
    title: 'Leave Type',
    description: 'Select leave category'
  },
  {
    id: 'dates',
    title: 'Dates',
    description: 'Choose duration'
  },
  {
    id: 'details',
    title: 'Details',
    description: 'Provide reason'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm and submit'
  }
];

// PageLayout configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', href: route('leaves.index') },
  { label: 'Request Leave', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'back-to-leaves',
    label: 'Back to Leaves',
    icon: 'arrow-left',
    variant: 'secondary',
    handler: () => router.visit(route('leaves.index'))
  }
]);

// Computed properties
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const formActions = computed(() => {
  const actions = [];
  
  // Previous button (except for first step)
  if (currentStep.value > 0) {
    actions.push({
      id: 'previous',
      label: 'Previous',
      variant: 'secondary',
      type: 'button'
    });
  }
  
  // Next/Submit button
  if (currentStep.value < formSteps.length - 1) {
    actions.push({
      id: 'next',
      label: 'Next',
      variant: 'primary',
      type: 'button',
      disabled: !canProceedToNextStep()
    });
  } else {
    actions.push({
      id: 'submit',
      label: 'Submit Request',
      variant: 'primary',
      type: 'submit',
      loadingLabel: 'Submitting...'
    });
  }
  
  return actions;
});

// Helper functions
const getCurrentStepTitle = () => {
  return formSteps[currentStep.value]?.title || '';
};

const getCurrentStepDescription = () => {
  return formSteps[currentStep.value]?.description || '';
};

const getLeaveTypeIcon = (leaveType) => {
  const iconMap = {
    'Annual Leave': CalendarIcon,
    'Sick Leave': HeartIcon,
    'Personal Leave': UserIcon,
    'Study Leave': AcademicCapIcon,
    'Emergency Leave': ExclamationTriangleIcon
  };
  
  return iconMap[leaveType] || CalendarIcon;
};

const getLeaveTypeIconClasses = (leaveType) => {
  const classMap = {
    'Annual Leave': 'w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg',
    'Sick Leave': 'w-8 h-8 p-1.5 bg-red-100 text-red-600 rounded-lg',
    'Personal Leave': 'w-8 h-8 p-1.5 bg-green-100 text-green-600 rounded-lg',
    'Study Leave': 'w-8 h-8 p-1.5 bg-purple-100 text-purple-600 rounded-lg',
    'Emergency Leave': 'w-8 h-8 p-1.5 bg-orange-100 text-orange-600 rounded-lg'
  };
  
  return classMap[leaveType] || 'w-8 h-8 p-1.5 bg-neutral-100 text-neutral-600 rounded-lg';
};

const getLeaveTypeDescription = (leaveType) => {
  const descriptionMap = {
    'Annual Leave': 'Planned vacation or personal time off',
    'Sick Leave': 'Medical leave for illness or health issues',
    'Personal Leave': 'Personal matters and family obligations',
    'Study Leave': 'Educational purposes and training',
    'Emergency Leave': 'Urgent and unexpected situations'
  };
  
  return descriptionMap[leaveType] || 'Standard leave request';
};

const getLeaveTypeCardClasses = (type) => {
  const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';
  const selectedClasses = form.leave_type_id === type.id 
    ? 'border-primary-500 bg-primary-50' 
    : 'border-neutral-200 bg-white hover:border-neutral-300';
  
  return `${baseClasses} ${selectedClasses}`;
};

const getSelectedLeaveType = () => {
  return props.leaveTypes.find(type => type.id === form.leave_type_id);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateDuration = () => {
  if (!form.from_date || !form.to_date) return '';
  
  const start = new Date(form.from_date);
  const end = new Date(form.to_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (form.is_half_day && diffDays === 1) {
    return '0.5 days';
  }
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

const canProceedToNextStep = () => {
  switch (currentStep.value) {
    case 0: // Leave type selection
      return form.leave_type_id !== '';
    case 1: // Date selection
      return form.from_date !== '' && form.to_date !== '';
    case 2: // Details
      return form.reason.trim() !== '';
    default:
      return true;
  }
};

// Event handlers
const selectLeaveType = (type) => {
  form.leave_type_id = type.id;
};

const validateDates = () => {
  if (form.from_date && form.to_date) {
    const start = new Date(form.from_date);
    const end = new Date(form.to_date);
    
    if (end < start) {
      form.to_date = form.from_date;
    }
  }
};

const handleFormAction = (action) => {
  switch (action.id) {
    case 'previous':
      if (currentStep.value > 0) {
        currentStep.value--;
      }
      break;
    case 'next':
      if (canProceedToNextStep() && currentStep.value < formSteps.length - 1) {
        currentStep.value++;
      }
      break;
    case 'submit':
      handleSubmit();
      break;
  }
};

const handleSubmit = () => {
  if (currentStep.value === formSteps.length - 1) {
    form.post(route('leaves.store'), {
      onSuccess: () => {
        // Handle success - redirect will be handled by Inertia
      },
      onError: (errors) => {
        // Handle validation errors by going back to relevant step
        if (errors.leave_type_id) {
          currentStep.value = 0;
        } else if (errors.from_date || errors.to_date) {
          currentStep.value = 1;
        } else if (errors.reason) {
          currentStep.value = 2;
        }
      }
    });
  }
};
</script>