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
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2',
                currentStep >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-500'
              ]">
                <span class="text-sm font-medium">1</span>
              </div>
              <span :class="[
                'ml-2 text-sm font-medium',
                currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'
              ]">Leave Details</span>
            </div>
            <div class="flex-1 h-0.5 bg-gray-200 mx-4">
              <div :class="[
                'h-full transition-all duration-300',
                currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'
              ]"></div>
            </div>
            <div class="flex items-center">
              <div :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2',
                currentStep >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-500'
              ]">
                <span class="text-sm font-medium">2</span>
              </div>
              <span :class="[
                'ml-2 text-sm font-medium',
                currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'
              ]">Review & Submit</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <ContentCard>
            <form @submit.prevent="handleSubmit" class="space-y-8">
              <!-- Step 1: Leave Details -->
              <div v-show="currentStep === 1" class="space-y-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-lg font-medium text-gray-900">Leave Information</h3>
                  <p class="mt-1 text-sm text-gray-600">
                    Please provide the details of your leave request.
                  </p>
                </div>

                <!-- Leave Type Selection with Enhanced UI -->
                <div class="space-y-3">
                  <label class="block text-sm font-medium text-gray-700">
                    Leave Type <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      v-for="type in leaveTypes" 
                      :key="type.id"
                      @click="selectLeaveType(type)"
                      :class="[
                        'relative rounded-lg border p-4 cursor-pointer focus:outline-none transition-all duration-200',
                        form.leave_type_id === type.id 
                          ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      ]"
                    >
                      <div class="flex items-start">
                        <div class="flex items-center h-5">
                          <input
                            :id="`leave-type-${type.id}`"
                            :value="type.id"
                            v-model="form.leave_type_id"
                            type="radio"
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          />
                        </div>
                        <div class="ml-3 flex-1">
                          <label :for="`leave-type-${type.id}`" class="block text-sm font-medium text-gray-900 cursor-pointer">
                            {{ type.name }}
                          </label>
                          <p v-if="type.description" class="text-sm text-gray-500 mt-1">
                            {{ type.description }}
                          </p>
                          <div class="flex items-center mt-2 text-xs text-gray-500">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ type.max_days || 'Unlimited' }} days available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="form.errors.leave_type_id" class="mt-1 text-sm text-red-600">
                    {{ form.errors.leave_type_id }}
                  </div>
                </div>

                <!-- Enhanced Date Selection -->
                <div class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-900">Leave Period</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label for="from_date" class="block text-sm font-medium text-gray-700">
                        Start Date <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input 
                          id="from_date"
                          v-model="form.from_date" 
                          type="date" 
                          :min="minDate"
                          class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                          :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': form.errors.from_date }"
                          @change="validateDates"
                        />
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div v-if="form.errors.from_date" class="text-sm text-red-600">
                        {{ form.errors.from_date }}
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label for="to_date" class="block text-sm font-medium text-gray-700">
                        End Date <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input 
                          id="to_date"
                          v-model="form.to_date" 
                          type="date" 
                          :min="form.from_date || minDate"
                          class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                          :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': form.errors.to_date }"
                          @change="validateDates"
                        />
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div v-if="form.errors.to_date" class="text-sm text-red-600">
                        {{ form.errors.to_date }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Reason Input -->
                <div class="space-y-3">
                  <label for="reason" class="block text-sm font-medium text-gray-700">
                    Reason for Leave <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <textarea 
                      id="reason"
                      v-model="form.reason" 
                      rows="4"
                      maxlength="500"
                      placeholder="Please provide a detailed reason for your leave request. Include any relevant information that will help your manager understand the context of your request."
                      class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                      :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': form.errors.reason }"
                    ></textarea>
                    <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                      {{ form.reason?.length || 0 }}/500
                    </div>
                  </div>
                  <div v-if="form.errors.reason" class="text-sm text-red-600">
                    {{ form.errors.reason }}
                  </div>
                  <div class="text-sm text-gray-500">
                    <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Be specific about your leave reason to help expedite the approval process.
                  </div>
                </div>

                <!-- Step Navigation -->
                <div class="flex justify-end pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    @click="nextStep"
                    :disabled="!canProceedToReview"
                    class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Review Request
                    <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Step 2: Review & Submit -->
              <div v-show="currentStep === 2" class="space-y-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-lg font-medium text-gray-900">Review Your Request</h3>
                  <p class="mt-1 text-sm text-gray-600">
                    Please review your leave request details before submitting.
                  </p>
                </div>

                <!-- Review Summary -->
                <div class="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Leave Type</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedLeaveType?.name || 'Not selected' }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Duration</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ calculateDuration() }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(form.from_date) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">End Date</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(form.to_date) }}</dd>
                    </div>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Reason</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ form.reason }}</dd>
                  </div>
                </div>

                <!-- Confirmation Checkbox -->
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="confirmation"
                      v-model="confirmationChecked"
                      type="checkbox"
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="confirmation" class="font-medium text-gray-700">
                      I confirm that the information provided is accurate
                    </label>
                    <p class="text-gray-500">
                      By checking this box, I acknowledge that I have reviewed my leave request and confirm that all details are correct.
                    </p>
                  </div>
                </div>

                <!-- Step Navigation -->
                <div class="flex justify-between pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    @click="previousStep"
                    class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg class="mr-2 -ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Details
                  </button>
                  <button 
                    type="submit"
                    :disabled="form.processing || !confirmationChecked"
                    class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg v-if="form.processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="mr-2 -ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ form.processing ? 'Submitting Request...' : 'Submit Leave Request' }}
                  </button>
                </div>
              </div>
            </form>
          </ContentCard>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Duration Calculator -->
          <ContentCard v-if="form.from_date && form.to_date">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Leave Duration</h3>
              <p class="mt-2 text-3xl font-bold text-indigo-600">{{ calculateDuration() }}</p>
              <p class="mt-1 text-sm text-gray-500">
                {{ formatDate(form.from_date) }} to {{ formatDate(form.to_date) }}
              </p>
            </div>
          </ContentCard>

          <!-- Leave Balance (if available) -->
          <ContentCard>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
            <div class="space-y-3">
              <div v-for="type in leaveTypes" :key="type.id" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ type.name }}</span>
                <span class="text-sm font-medium text-gray-900">{{ type.balance || 'N/A' }} days</span>
              </div>
            </div>
          </ContentCard>

          <!-- Help & Guidelines -->
          <ContentCard>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Leave Guidelines</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start">
                <svg class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit requests at least 2 weeks in advance</span>
              </div>
              <div class="flex items-start">
                <svg class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Provide detailed reasons for better approval chances</span>
              </div>
              <div class="flex items-start">
                <svg class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Check team calendar for conflicts</span>
              </div>
              <div class="flex items-start">
                <svg class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Emergency leaves can be submitted retroactively</span>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, useForm } from '@inertiajs/vue3';
import { computed, ref, onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';

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
  reason: ''
});

// UI state
const currentStep = ref(1);
const confirmationChecked = ref(false);

// Computed properties
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const selectedLeaveType = computed(() => {
  return props.leaveTypes.find(type => type.id == form.leave_type_id);
});

const canProceedToReview = computed(() => {
  return form.leave_type_id && 
         form.from_date && 
         form.to_date && 
         form.reason && 
         form.reason.trim().length >= 10;
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leaves', href: route('leaves.index') },
  { label: 'New Request', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'save-draft',
    label: 'Save Draft',
    variant: 'secondary',
    handler: saveDraft
  }
]);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not selected';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateDuration = () => {
  if (!form.from_date || !form.to_date) return 'Not calculated';
  
  // Parse dates as local dates to avoid timezone issues
  const startParts = form.from_date.split('-');
  const endParts = form.to_date.split('-');
  
  const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
  
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (diffDays === 1) return '1 day';
  if (diffDays <= 7) return `${diffDays} days`;
  
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  if (remainingDays === 0) {
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  } else {
    return `${weeks} week${weeks > 1 ? 's' : ''} and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
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

const nextStep = () => {
  if (canProceedToReview.value) {
    currentStep.value = 2;
  }
};

const previousStep = () => {
  currentStep.value = 1;
  confirmationChecked.value = false;
};

const handleSubmit = () => {
  if (currentStep.value === 1) {
    nextStep();
  } else if (currentStep.value === 2 && confirmationChecked.value) {
    form.post(route('leaves.store'), {
      onSuccess: () => {
        // Success handled by redirect
      },
      onError: (errors) => {
        // If there are validation errors, go back to step 1
        if (Object.keys(errors).some(key => ['leave_type_id', 'from_date', 'to_date', 'reason'].includes(key))) {
          currentStep.value = 1;
        }
      }
    });
  }
};

const saveDraft = () => {
  // Implementation for saving draft
  console.log('Save draft functionality would be implemented here');
};

// Set default date to tomorrow (to encourage advance planning)
onMounted(() => {
  if (!form.from_date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.from_date = tomorrow.toISOString().split('T')[0];
  }
});
</script>