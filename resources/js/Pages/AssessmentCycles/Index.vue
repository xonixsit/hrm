<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Assessment Cycles"
      subtitle="Manage assessment cycles and track progress"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="filters.status"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ formatStatus(status) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  v-model="filters.search"
                  @input="debounceSearch"
                  type="text"
                  placeholder="Search cycles..."
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="filters.date_from"
                  @change="applyFilters"
                  type="date"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              
              <div class="flex items-end">
                <button
                  @click="clearFilters"
                  class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cycles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="cycle in cycles.data"
            :key="cycle.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ cycle.name }}
                  </h3>
                  <p v-if="cycle.description" class="text-sm text-gray-600 mt-1 line-clamp-2">
                    {{ cycle.description }}
                  </p>
                </div>
                <span :class="getStatusClasses(cycle.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3">
                  {{ formatStatus(cycle.status) }}
                </span>
              </div>

              <!-- Progress -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{{ cycle.completion_percentage }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${cycle.completion_percentage}%` }"
                  ></div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ cycle.participant_count }}</div>
                  <div class="text-xs text-gray-500">Participants</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ cycle.assessment_count }}</div>
                  <div class="text-xs text-gray-500">Assessments</div>
                </div>
              </div>

              <!-- Dates -->
              <div class="text-sm text-gray-600 mb-4">
                <div class="flex items-center justify-between">
                  <span>Start:</span>
                  <span>{{ formatDate(cycle.start_date) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>End:</span>
                  <span>{{ formatDate(cycle.end_date) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  :href="route('assessment-cycles.show', cycle.id)"
                  class="text-sm text-teal-600 hover:text-teal-900 font-medium"
                >
                  View Details
                </Link>
                <div class="flex items-center space-x-2">
                  <Link
                    v-if="cycle.status === 'planned'"
                    :href="route('assessment-cycles.edit', cycle.id)"
                    class="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                  <button
                    v-if="cycle.status === 'planned'"
                    @click="startCycle(cycle)"
                    class="text-sm text-green-600 hover:text-green-900 font-medium"
                  >
                    Start
                  </button>
                  <button
                    v-if="cycle.status === 'active'"
                    @click="completeCycle(cycle)"
                    class="text-sm text-teal-600 hover:text-teal-900 font-medium"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="cycles.data.length === 0" class="text-center py-12">
          <CalendarIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Assessment Cycles</h3>
          <p class="text-gray-500 mb-6">Get started by creating your first assessment cycle.</p>
          <Link
            :href="route('assessment-cycles.create')"
            class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Create Assessment Cycle
          </Link>
        </div>

        <!-- Pagination -->
        <div v-if="cycles.links && cycles.data.length > 0" class="mt-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ cycles.from }} to {{ cycles.to }} of {{ cycles.total }} results
            </div>
            <div class="flex space-x-1">
              <Link
                v-for="link in cycles.links"
                :key="link.label"
                :href="link.url"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  link.active
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
                v-html="link.label"
              />
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
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  cycles: Object,
  statusOptions: Array,
  filters: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Assessment Cycles', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'New Cycle',
    href: route('assessment-cycles.create'),
    icon: PlusIcon,
    variant: 'primary'
  }
]);

const filters = ref({
  status: props.filters?.status || '',
  search: props.filters?.search || '',
  date_from: props.filters?.date_from || ''
});

let searchTimeout = null;

const applyFilters = () => {
  router.get(route('assessment-cycle-manager'), filters.value, {
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
    status: '',
    search: '',
    date_from: ''
  };
  applyFilters();
};

const startCycle = (cycle) => {
  if (confirm(`Are you sure you want to start the "${cycle.name}" assessment cycle?`)) {
    router.post(route('assessment-cycles.start', cycle.id));
  }
};

const completeCycle = (cycle) => {
  if (confirm(`Are you sure you want to complete the "${cycle.name}" assessment cycle?`)) {
    router.post(route('assessment-cycles.complete', cycle.id));
  }
};

const formatStatus = (status) => {
  const statuses = {
    'planned': 'Planned',
    'active': 'Active',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    'planned': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-teal-100 text-teal-800',
    'cancelled': 'bg-red-100 text-red-800'
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>