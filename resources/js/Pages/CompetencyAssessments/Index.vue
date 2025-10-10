<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Competency Assessments"
      subtitle="Manage and review competency assessments"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Filters -->
          <div class="bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  v-model="filters.assessment_type"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option v-for="type in assessmentTypes" :key="type" :value="type">
                    {{ formatAssessmentType(type) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  v-model="filters.search"
                  @input="debounceSearch"
                  type="text"
                  placeholder="Search assessments..."
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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
      </div>
        <!-- Assessments Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competency
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="assessment in assessments.data" :key="assessment.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-blue-600">
                            {{ getInitials(assessment.employee?.user?.name || 'Unknown') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <Link
                          :href="route('competency-assessments.by-employee', assessment.employee?.id)"
                          class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {{ assessment.employee?.user?.name || 'Unknown' }}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ assessment.competency?.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ formatAssessmentType(assessment.assessment_type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="assessment.rating" class="flex items-center">
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
                      <span class="ml-2 text-sm text-gray-600">{{ assessment.rating }}/5</span>
                    </div>
                    <span v-else class="text-sm text-gray-400">Not rated</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatStatus(assessment.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(assessment.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <Link
                        :href="route('competency-assessments.show', assessment.id)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        v-if="assessment.status === 'draft'"
                        :href="route('competency-assessments.evaluate', assessment.id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { PlusIcon, StarIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  assessments: Object,
  employees: Array,
  competencies: Array,
  assessmentCycles: Array,
  assessors: Array,
  assessmentTypes: Array,
  statusOptions: Array,
  filters: Object,
  stats: Object
});

const filters = ref({
  employee_id: props.filters?.employee_id || '',
  competency_id: props.filters?.competency_id || '',
  assessment_type: props.filters?.assessment_type || '',
  status: props.filters?.status || '',
  search: props.filters?.search || ''
});

let searchTimeout = null;

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Competency Management', href: route('competency-assessments.index') },
  { label: 'Assessments', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'new-assessment',
    label: 'New Assessment',
    icon: 'plus',
    variant: 'primary',
    href: route('competency-assessments.create')
  }
]);

const applyFilters = () => {
  router.get(route('competency-assessments.index'), filters.value, {
    preserveState: true,
    preserveScroll: true
  });
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
};

const clearFilters = () => {
  filters.value = {
    employee_id: '',
    competency_id: '',
    assessment_type: '',
    status: '',
    search: ''
  };
  applyFilters();
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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