<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Assessment"
      :subtitle="`${assessment.employee?.user?.name} - ${assessment.competency?.name}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Success Message -->
      <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <form @submit.prevent="updateAssessment" class="p-6 space-y-6">
            <!-- Basic Info (Read-only) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ assessment.employee?.user?.name }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Competency</label>
                <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ assessment.competency?.name }}
                </div>
              </div>
            </div>

            <!-- Assessment Type (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Assessment Type</label>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-sm text-gray-600">Assessment type cannot be changed after creation</span>
                </div>
                <div class="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md">
                  <div class="flex-shrink-0">
                    <span class="text-lg">{{ getAssessmentTypeIcon(assessment.assessment_type) }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">{{ formatAssessmentType(assessment.assessment_type) }}</h4>
                    <p class="text-xs text-gray-600">{{ getAssessmentTypeDescription(assessment.assessment_type) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div class="flex items-center space-x-4">
                <div class="flex space-x-1">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    @click="form.rating = i"
                    :class="[
                      'p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      i <= form.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                    ]"
                  >
                    <StarIcon class="h-8 w-8" />
                  </button>
                </div>
                <span v-if="form.rating" class="text-lg font-medium text-gray-900">
                  {{ form.rating }}/5 - {{ getRatingLabel(form.rating) }}
                </span>
              </div>
              <div v-if="errors.rating" class="mt-1 text-sm text-red-600">
                {{ errors.rating }}
              </div>
            </div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Comments
                <span v-if="requiresComments" class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.comments"
                :required="requiresComments"
                rows="4"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Provide detailed feedback and observations..."
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">
                Comments are required for ratings of 1-2 (needs improvement) or 4-5 (exceeds expectations).
              </p>
              <div v-if="errors.comments" class="mt-1 text-sm text-red-600">
                {{ errors.comments }}
              </div>
            </div>

            <!-- Development Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Development Notes</label>
              <textarea
                v-model="form.development_notes"
                rows="3"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Suggestions for improvement or development opportunities..."
              ></textarea>
              <div v-if="errors.development_notes" class="mt-1 text-sm text-red-600">
                {{ errors.development_notes }}
              </div>
            </div>

            <!-- Evidence Files -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Evidence Files</label>
              <input
                type="file"
                multiple
                @change="handleFileUpload"
                class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p class="mt-1 text-sm text-gray-500">
                Upload supporting documents or evidence (optional).
              </p>
              <div v-if="form.evidence_files?.length" class="mt-2">
                <div class="text-sm text-gray-700 mb-1">Current files:</div>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li v-for="file in form.evidence_files" :key="file">{{ file }}</li>
                </ul>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex items-center space-x-3">
                <button
                  type="submit"
                  :disabled="processing"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-if="processing">Saving Changes...</span>
                  <span v-else>Save Changes</span>
                </button>
                
                <button
                  v-if="assessment.status === 'draft' && form.rating"
                  type="button"
                  @click="submitAssessment"
                  :disabled="processing || !canSubmit"
                  class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                >
                  <svg v-if="processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10l2 2m0 0l2-2m-2 2V6m0 6l-2-2" />
                  </svg>
                  <span v-if="processing">Submitting...</span>
                  <span v-else>Submit Assessment</span>
                </button>
                
                <div v-if="processing" class="text-sm text-gray-600">
                  {{ processing ? 'Updating assessment...' : '' }}
                </div>
              </div>
              
              <Link
                :href="route('competency-assessments.show', assessment.id)"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Link>
            </div>
          </form>
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { ArrowLeftIcon, StarIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  assessment: Object,
  employees: Array,
  competencies: Array,
  assessmentCycles: Array,
  assessmentTypes: Array,
  errors: Object
});

const form = ref({
  assessment_type: props.assessment.assessment_type,
  rating: props.assessment.rating || 0,
  comments: props.assessment.comments || '',
  development_notes: props.assessment.development_notes || '',
  evidence_files: props.assessment.evidence_files || []
});

const processing = ref(false);

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessments', href: route('competency-assessments.index') },
  { label: 'Assessment Details', href: route('competency-assessments.show', props.assessment.id) },
  { label: 'Edit Assessment', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Assessment',
    href: route('competency-assessments.show', props.assessment.id),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  }
]);

const requiresComments = computed(() => {
  return form.value.rating && (form.value.rating <= 2 || form.value.rating >= 4);
});

const canSubmit = computed(() => {
  return form.value.rating && (!requiresComments.value || form.value.comments.trim());
});

const updateAssessment = () => {
  processing.value = true;
  
  router.put(route('competency-assessments.update', props.assessment.id), form.value, {
    onSuccess: (page) => {
      // Success - controller will redirect to show page with success message
      console.log('Assessment updated successfully');
    },
    onError: (errors) => {
      console.error('Failed to update assessment:', errors);
      processing.value = false;
    },
    onFinish: () => {
      processing.value = false;
    }
  });
};

const submitAssessment = () => {
  if (!canSubmit.value) {
    alert('Please provide a rating and required comments before submitting.');
    return;
  }

  if (confirm('Are you sure you want to submit this assessment? You will not be able to edit it after submission.')) {
    processing.value = true;
    
    router.post(route('competency-assessments.submit', props.assessment.id), form.value, {
      onSuccess: () => {
        // Success handled by controller redirect
      },
      onError: () => {
        processing.value = false;
      },
      onFinish: () => {
        processing.value = false;
      }
    });
  }
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  form.value.evidence_files = files.map(file => file.name);
};

const formatAssessmentType = (type) => {
  const types = {
    'self': 'Self Assessment',
    'manager': 'Manager Assessment',
    'peer': 'Peer Assessment',
    '360': '360° Feedback'
  };
  return types[type] || type;
};

const getRatingLabel = (rating) => {
  const labels = {
    1: 'Needs Improvement',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Outstanding'
  };
  return labels[rating] || '';
};

const getAssessmentTypeIcon = (type) => {
  const icons = {
    'self': '👤',
    'manager': '👔',
    'peer': '👥',
    '360': '🔄'
  };
  return icons[type] || '';
};

const getAssessmentTypeDescription = (type) => {
  const descriptions = {
    'self': 'Employee self-evaluation',
    'manager': 'Manager evaluation of employee',
    'peer': 'Peer evaluation',
    '360': 'Multi-perspective feedback'
  };
  return descriptions[type] || '';
};
</script>