<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Assessment Cycle"
      :subtitle="cycle.name"
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
          <form @submit.prevent="updateCycle" class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cycle Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
                <div v-if="errors.name" class="mt-1 text-sm text-red-600">
                  {{ errors.name }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="form.status"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div v-if="errors.status" class="mt-1 text-sm text-red-600">
                  {{ errors.status }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              ></textarea>
              <div v-if="errors.description" class="mt-1 text-sm text-red-600">
                {{ errors.description }}
              </div>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  v-model="form.start_date"
                  type="date"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
                <div v-if="errors.start_date" class="mt-1 text-sm text-red-600">
                  {{ errors.start_date }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  v-model="form.end_date"
                  type="date"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
                <div v-if="errors.end_date" class="mt-1 text-sm text-red-600">
                  {{ errors.end_date }}
                </div>
              </div>
            </div>

            <!-- Assessment Types (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Assessment Types</label>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-sm text-gray-600">Assessment types cannot be changed after creation</span>
                </div>
                <div v-if="cycle.assessment_types && cycle.assessment_types.length > 0" class="space-y-2">
                  <div
                    v-for="type in cycle.assessment_types"
                    :key="type"
                    class="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <div class="flex-shrink-0">
                      <span class="text-lg">{{ getAssessmentTypeIcon(type) }}</span>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-900">{{ formatAssessmentType(type) }}</h4>
                      <p class="text-xs text-gray-600">{{ getAssessmentTypeDescription(type) }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">
                  No assessment types configured
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex items-center space-x-3">
                <button
                  type="submit"
                  :disabled="processing"
                  class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all duration-200"
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
                
                <div v-if="processing" class="text-sm text-gray-600">
                  Updating assessment cycle...
                </div>
              </div>
              
              <Link
                :href="route('assessment-cycles.show', cycle.id)"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
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
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  cycle: Object,
  employees: Array,
  competencies: Array,
  errors: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Assessment Cycles', href: route('assessment-cycle-manager') },
  { label: props.cycle.name, href: route('assessment-cycles.show', props.cycle.id) },
  { label: 'Edit', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Cycle',
    href: route('assessment-cycles.show', props.cycle.id),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  }
]);

const form = ref({
  name: props.cycle.name,
  description: props.cycle.description || '',
  start_date: props.cycle.start_date ? props.cycle.start_date.split('T')[0] : '',
  end_date: props.cycle.end_date ? props.cycle.end_date.split('T')[0] : '',
  status: props.cycle.status
});

const processing = ref(false);

const updateCycle = () => {
  processing.value = true;
  
  router.put(route('assessment-cycles.update', props.cycle.id), form.value, {
    onSuccess: (page) => {
      // Success - controller will redirect to show page with success message
      //console.log('Assessment cycle updated successfully');
    },
    onError: (errors) => {
      console.error('Failed to update assessment cycle:', errors);
      processing.value = false;
    },
    onFinish: () => {
      processing.value = false;
    }
  });
};

// Helper functions for assessment types
const formatAssessmentType = (type) => {
  const types = {
    'self': 'Self Assessment',
    'manager': 'Manager Assessment',
    'peer': 'Peer Assessment',
    '360': '360° Feedback'
  };
  return types[type] || type;
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
    'self': 'Employees evaluate their own competencies',
    'manager': 'Direct managers assess their team members',
    'peer': 'Colleagues provide feedback on each other',
    '360': 'Comprehensive feedback from multiple perspectives'
  };
  return descriptions[type] || '';
};
</script>