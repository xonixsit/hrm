<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Assessment Cycle"
      subtitle="Create a new assessment cycle to organize multiple assessments"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

        <!-- Success Message -->
        <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <form @submit.prevent="createCycle" class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cycle Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  placeholder="e.g., Q1 2024 Performance Review"
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
                placeholder="Describe the purpose and scope of this assessment cycle..."
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

            <!-- Assessment Types -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Assessment Types *</label>
              <div class="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-md">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-teal-800">Why Multiple Assessment Types?</h4>
                    <p class="text-sm text-teal-700 mt-1">
                      Select multiple types to get comprehensive feedback from different perspectives. Each type creates separate assessments with targeted notifications.
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4">
                <div v-for="type in assessmentTypes" :key="type" class="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                  <label class="flex items-start cursor-pointer">
                    <input
                      v-model="form.assessment_types"
                      :value="type"
                      type="checkbox"
                      class="mt-1 rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                    <div class="ml-3 flex-1">
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">{{ formatAssessmentType(type) }}</span>
                        <span v-if="getAssessmentTypeIcon(type)" class="ml-2 text-lg">{{ getAssessmentTypeIcon(type) }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ getAssessmentTypeDescription(type) }}</p>
                      <div class="mt-2 text-xs text-gray-500">
                        <strong>Who gets notified:</strong> {{ getAssessmentTypeNotifications(type) }}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Selected Types Summary -->
              <div v-if="form.assessment_types.length > 0" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 class="text-sm font-medium text-green-800 mb-2">Selected Assessment Flow:</h4>
                <div class="text-sm text-green-700">
                  <div v-if="form.assessment_types.includes('self')" class="flex items-center mb-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Employees will assess themselves
                  </div>
                  <div v-if="form.assessment_types.includes('manager')" class="flex items-center mb-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Managers will assess their direct reports
                  </div>
                  <div v-if="form.assessment_types.includes('peer')" class="flex items-center mb-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Colleagues will assess each other
                  </div>
                  <div v-if="form.assessment_types.includes('360')" class="flex items-center mb-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Multiple people will provide 360° feedback
                  </div>
                </div>
              </div>
              
              <div v-if="errors.assessment_types" class="mt-2 text-sm text-red-600">
                {{ errors.assessment_types }}
              </div>
            </div>

            <!-- Assessment Scope -->
            <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-teal-800">Assessment Cycle Scope</h4>
                  <p class="text-sm text-teal-700 mt-1">
                    This cycle defines the time period, competencies, and assessment types. Employee selection happens when creating individual assessments within this cycle.
                  </p>
                </div>
              </div>
            </div>

            <!-- Competencies -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Competencies to Assess *</label>
              <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                <div class="space-y-2">
                  <label v-for="competency in competencies" :key="competency.id" class="flex items-center">
                    <input
                      v-model="form.competency_ids"
                      :value="competency.id"
                      type="checkbox"
                      class="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">
                      {{ competency.name }} <span class="text-gray-500">({{ competency.category }})</span>
                    </span>
                  </label>
                </div>
              </div>
              <div v-if="errors.competency_ids" class="mt-1 text-sm text-red-600">
                {{ errors.competency_ids }}
              </div>
            </div>

            <!-- Notification Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notification Settings</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.notification_settings.send_start_notifications"
                    type="checkbox"
                    class="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Send notifications when cycle starts</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.notification_settings.send_reminder_notifications"
                    type="checkbox"
                    class="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Send reminder notifications</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.notification_settings.send_completion_notifications"
                    type="checkbox"
                    class="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Send notifications when cycle completes</span>
                </label>
              </div>
            </div>

            <!-- Debug Info -->
            <div v-if="Object.keys(errors).length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 class="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li v-for="(error, field) in errors" :key="field">
                  <strong>{{ field }}:</strong> {{ Array.isArray(error) ? error.join(', ') : error }}
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                :href="route('assessment-cycle-manager')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                :disabled="processing"
                class="inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                <span v-if="processing">Creating...</span>
                <span v-else>Create Assessment Cycle</span>
              </button>
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
  employees: Array,
  competencies: Array,
  assessmentTypes: Array,
  errors: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Assessment Cycles', href: route('assessment-cycle-manager') },
  { label: 'Create Cycle', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Cycles',
    href: route('assessment-cycle-manager'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  }
]);

const form = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'planned',
  assessment_types: [],
  competency_ids: [],
  notification_settings: {
    send_start_notifications: true,
    send_reminder_notifications: true,
    send_completion_notifications: true
  }
});

const processing = ref(false);

const createCycle = () => {
  console.log('Creating assessment cycle with data:', form.value);
  
  // Basic frontend validation
  if (!form.value.name) {
    alert('Please enter a cycle name');
    return;
  }
  
  if (!form.value.start_date) {
    alert('Please select a start date');
    return;
  }
  
  if (!form.value.end_date) {
    alert('Please select an end date');
    return;
  }
  
  if (form.value.assessment_types.length === 0) {
    alert('Please select at least one assessment type');
    return;
  }
  
  if (form.value.competency_ids.length === 0) {
    alert('Please select at least one competency');
    return;
  }
  
  // Employee selection will be handled during individual assessment creation
  
  processing.value = true;
  
  router.post(route('assessment-cycles.store'), form.value, {
    onSuccess: (page) => {
      console.log('Assessment cycle created successfully:', page);
    },
    onError: (errors) => {
      console.error('Assessment cycle creation failed:', errors);
      processing.value = false;
    },
    onFinish: () => {
      processing.value = false;
    }
  });
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
    'self': 'Employees evaluate their own competencies and performance',
    'manager': 'Direct managers assess their team members\' competencies',
    'peer': 'Colleagues provide feedback on each other\'s competencies',
    '360': 'Comprehensive feedback from multiple perspectives including managers, peers, and subordinates'
  };
  return descriptions[type] || '';
};

const getAssessmentTypeNotifications = (type) => {
  const notifications = {
    'self': 'Employees being assessed',
    'manager': 'Managers and their direct reports',
    'peer': 'Selected peer reviewers',
    '360': 'All participants in the feedback circle'
  };
  return notifications[type] || '';
};
</script>