<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Pending Assessments"
      subtitle="Assessments waiting to be completed"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  v-model="filters.employee_id"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Employees</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.user?.name || 'Unknown' }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Competency</label>
                <select
                  v-model="filters.competency_id"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Competencies</option>
                  <option v-for="competency in competencies" :key="competency.id" :value="competency.id">
                    {{ competency.name }}
                  </option>
                </select>
              </div>
              
              <div class="flex items-end">
                <button
                  @click="clearFilters"
                  class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Assessments -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Pending Assessments ({{ assessments.total }})
            </h3>
          </div>
          
          <div v-if="assessments.data.length === 0" class="p-12 text-center">
            <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Pending Assessments</h3>
            <p class="text-gray-500">All assessments have been completed.</p>
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="assessment in assessments.data"
              :key="assessment.id"
              class="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <!-- Employee Avatar -->
                  <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ getInitials(assessment.employee?.user?.name || 'Unknown') }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Assessment Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-lg font-medium text-gray-900 truncate">
                        {{ assessment.employee?.user?.name || 'Unknown' }}
                      </h4>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ formatAssessmentType(assessment.assessment_type) }}
                      </span>
                    </div>
                    <div class="mt-1">
                      <p class="text-sm text-gray-600">
                        <span class="font-medium">Competency:</span> {{ assessment.competency?.name }}
                      </p>
                      <p class="text-sm text-gray-500 mt-1">
                        Created {{ formatRelativeTime(assessment.created_at) }}
                        <span v-if="assessment.assessor">
                          by {{ assessment.assessor.name }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-3">
                  <Link
                    :href="route('competency-assessments.show', assessment.id)"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon class="w-4 h-4 mr-2" />
                    View
                  </Link>
                  <Link
                    v-if="canAssess(assessment)"
                    :href="route('competency-assessments.evaluate', assessment.id)"
                    class="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon class="w-4 h-4 mr-2" />
                    Complete Assessment
                  </Link>
                  <span
                    v-else
                    class="inline-flex items-center px-3 py-2 text-sm text-gray-500 italic"
                  >
                    {{ assessment.assessment_type === 'self' ? 'Employee only' : 'Not assigned' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="assessments.links" class="px-6 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ assessments.from }} to {{ assessments.to }} of {{ assessments.total }} results
              </div>
              <div class="flex space-x-1">
                <Link
                  v-for="link in assessments.links"
                  :key="link.label"
                  :href="link.url"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md',
                    link.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  ]"
                  v-html="link.label"
                />
              </div>
            </div>
          </div>
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, Link, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import {
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  assessments: Object,
  employees: Array,
  competencies: Array,
  filters: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Pending Assessments', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'New Assessment',
    href: route('competency-assessments.create'),
    icon: PlusIcon,
    variant: 'primary'
  }
]);

const filters = ref({
  employee_id: props.filters?.employee_id || '',
  competency_id: props.filters?.competency_id || ''
});

const applyFilters = () => {
  router.get(route('competency-assessments.pending'), filters.value, {
    preserveState: true,
    preserveScroll: true
  });
};

const clearFilters = () => {
  filters.value = {
    employee_id: '',
    competency_id: ''
  };
  applyFilters();
};

// Check if current user can assess a specific assessment
const canAssess = (assessment) => {
  try {
    const page = usePage();
    const currentUser = page.props.auth?.user;
    
    if (!currentUser) return false;
    
    // For self-assessments, only the employee themselves can assess
    if (assessment.assessment_type === 'self') {
      return currentUser.id === assessment.employee.user_id;
    }
    
    // For other assessment types, check if user is the assigned assessor
    return currentUser.id === assessment.assessor_id;
  } catch (error) {
    console.error('Error checking assessment permissions:', error);
    return false;
  }
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

const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>