<template>
  <AuthenticatedLayout>
    <PageLayout
      title="My Assessments"
      subtitle="Assessments assigned to me for completion"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Assigned</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.total || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Pending</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.pending || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completed</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.completed || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Employee filter removed - users only see their own assessments -->
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="filters.status"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ formatStatus(status) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Cycle</label>
                <select
                  v-model="filters.assessment_cycle_id"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Cycles</option>
                  <option v-for="cycle in assessmentCycles" :key="cycle.id" :value="cycle.id">
                    {{ cycle.name }}
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

        <!-- Assessments List -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Assessments ({{ assessments?.total || 0 }})
            </h3>
          </div>
          
          <div v-if="!assessments?.data || assessments.data.length === 0" class="p-12 text-center">
            <ClipboardDocumentCheckIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p class="text-gray-500">You don't have any assessments assigned to you yet.</p>
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="assessment in (assessments?.data || [])"
              :key="assessment?.id || Math.random()"
              class="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span class="text-xs font-medium text-blue-600">
                          {{ getInitials(assessment.employee?.user?.name || 'Unknown') }}
                        </span>
                      </div>
                      <div>
                        <Link
                          :href="safeRoute('competency-assessments.by-employee', assessment.employee?.id)"
                          class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {{ assessment.employee?.user?.name || 'Unknown' }}
                        </Link>
                      </div>
                    </div>
                    <span class="text-gray-300">•</span>
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ assessment.competency?.name }}
                    </h4>
                    <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatStatus(assessment.status) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-6 text-sm text-gray-600">
                    <div class="flex items-center">
                      <CalendarIcon class="w-4 h-4 mr-1" />
                      {{ formatDate(assessment.created_at) }}
                    </div>
                    <div v-if="assessment.assessment_cycle" class="flex items-center">
                      <TagIcon class="w-4 h-4 mr-1" />
                      {{ assessment.assessment_cycle.name }}
                    </div>
                  </div>
                  
                  <!-- Rating Display -->
                  <div v-if="assessment.rating" class="mt-3 flex items-center">
                    <span class="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                    <div class="flex items-center">
                      <div class="flex">
                        <StarIcon
                          v-for="i in 5"
                          :key="i"
                          :class="[
                            i <= assessment.rating ? 'text-yellow-400' : 'text-gray-300',
                            'h-4 w-4'
                          ]"
                        />
                      </div>
                      <span class="ml-2 text-sm font-medium text-gray-900">{{ assessment.rating }}/5</span>
                      <span class="ml-2 text-sm text-gray-500">({{ getRatingLabel(assessment.rating) }})</span>
                    </div>
                  </div>
                  
                  <!-- Comments Preview -->
                  <div v-if="assessment.comments" class="mt-3">
                    <p class="text-sm text-gray-700 line-clamp-2">{{ assessment.comments }}</p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-3 ml-6">
                  <Link
                    :href="safeRoute('competency-assessments.show', assessment.id)"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon class="w-4 h-4 mr-2" />
                    View
                  </Link>
                  <Link
                    v-if="assessment.status === 'draft'"
                    :href="safeRoute('competency-assessments.evaluate', assessment.id)"
                    class="inline-flex items-center px-3 py-2 bg-teal-500 text-white text-sm font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <PencilIcon class="w-4 h-4 mr-2" />
                    Complete
                  </Link>
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
                      ? 'bg-teal-500 text-white'
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
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  TagIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  assessments: Object,
  stats: Object,
  employees: Array,
  assessmentCycles: Array,
  statusOptions: Array,
  filters: Object
});

// Debug logging to help identify issues
console.log('MyAssessments props:', {
  assessments: props.assessments,
  stats: props.stats,
  assessmentsData: props.assessments?.data,
  assessmentsTotal: props.assessments?.total,
  assessmentsCount: props.assessments?.data?.length,
  filters: props.filters
});

// Additional debugging for each assessment
if (props.assessments?.data) {
  console.log('Individual assessments:');
  props.assessments.data.forEach((assessment, index) => {
    console.log(`Assessment ${index + 1}:`, {
      id: assessment.id,
      employee: assessment.employee?.user?.name,
      competency: assessment.competency?.name,
      type: assessment.assessment_type,
      status: assessment.status
    });
  });
} else {
  console.log('No assessments data found');
}

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: typeof route !== 'undefined' ? route('dashboard') : '/dashboard' },
  { label: 'My Assessments', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'All Assessments',
    href: typeof route !== 'undefined' ? route('competency-assessments.index') : '/competency-assessments',
    variant: 'secondary'
  }
]);

const filters = ref({
  status: (props.filters && typeof props.filters === 'object' && !Array.isArray(props.filters)) ? (props.filters.status || '') : '',
  assessment_cycle_id: (props.filters && typeof props.filters === 'object' && !Array.isArray(props.filters)) ? (props.filters.assessment_cycle_id || '') : ''
});

const applyFilters = () => {
  try {
    // Check if route function is available
    if (typeof route === 'undefined') {
      console.error('Route function is not available');
      return;
    }
    
    const routeUrl = route('competency-assessments.my-assessments');
    if (!routeUrl) {
      console.error('Route URL could not be generated');
      return;
    }
    
    router.get(routeUrl, filters.value, {
      preserveState: true,
      preserveScroll: true
    }).catch(error => {
      console.error('Error applying filters:', error);
    });
  } catch (error) {
    console.error('Error in applyFilters:', error);
  }
};

const clearFilters = () => {
  filters.value = {
    status: '',
    assessment_cycle_id: ''
  };
  applyFilters();
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatStatus = (status) => {
  const statuses = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Safe route helper functions
const safeRoute = (routeName, params = null) => {
  try {
    if (typeof route === 'undefined') {
      console.warn(`Route function not available for: ${routeName}`);
      return '#';
    }
    return route(routeName, params);
  } catch (error) {
    console.error(`Error generating route ${routeName}:`, error);
    return '#';
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>