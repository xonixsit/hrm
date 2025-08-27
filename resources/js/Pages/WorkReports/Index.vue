<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Work Reports"
      subtitle="Submit and manage daily work reports"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Header Actions -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Work Reports</h3>
              <p class="mt-1 text-sm text-gray-600">
                Track and manage daily work performance reports.
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Show More Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                {{ showFilters ? 'Hide More Filters' : 'More Filters' }}
              </button>
            </div>
          </div>
          
          <!-- Additional Filter Controls -->
          <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Search Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="localFilters.search"
                    type="text"
                    placeholder="Search..."
                    class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    @input="debouncedApplyFilters"
                  />
                </div>
              </div>

              <!-- User Filter (only for admins/managers/HR) -->
              <div v-if="employees.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <BaseSelect
                  v-model="localFilters.user_id"
                  :options="employeeOptions"
                  placeholder="All employees"
                  class="w-full"
                  @update:modelValue="applyFilters"
                />
              </div>
              
              <!-- Date From Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="localFilters.date_from"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="handleDateFromChange"
                />
              </div>
              
              <!-- Date To Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  v-model="localFilters.date_to"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="handleDateToChange"
                />
              </div>
            </div>
          
            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
              <span class="text-sm font-medium text-gray-700">Active filters:</span>
              
              <!-- Search Filter -->
              <span 
                v-if="localFilters.search"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Search: "{{ localFilters.search }}"
                <button 
                  @click="clearSearchFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
                >
                  <span class="sr-only">Remove search filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span
                v-if="activeEmployeeFilter"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Employee: {{ activeEmployeeFilter }}
                <button
                  @click="clearEmployeeFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <span class="sr-only">Remove employee filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span
                v-if="localFilters.date_from"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                From: {{ formatDate(localFilters.date_from) }}
                <button
                  @click="clearDateFromFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date from filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span
                v-if="localFilters.date_to"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                To: {{ formatDate(localFilters.date_to) }}
                <button
                  @click="clearDateToFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date to filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <button
                @click="clearAllFilters"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          </div>
          <!-- Work Reports Table -->
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th v-for="column in tableColumns" :key="column.key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ column.label }}
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="row in workReports.data" :key="row.id" class="hover:bg-gray-50">
                    <td v-for="column in tableColumns" :key="column.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ column.formatter ? column.formatter(row[column.key]) : row[column.key] }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end">
                        <!-- Unified Actions Menu -->
                        <div class="relative" :ref="el => setDropdownRef(el, row.id)">
                          <button
                            @click="toggleDropdown(row.id)"
                            class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            :title="'Actions'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          <!-- Unified Dropdown Menu -->
                          <div
                            v-if="activeDropdown === row.id"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          >
                            <!-- View Action (always available) -->
                            <Link
                              :href="`/work-reports/${row.id}`"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </Link>

                            <!-- Divider -->
                            <div class="border-t border-gray-100 my-1"></div>

                            <!-- Edit Action -->
                            <Link
                              :href="`/work-reports/${row.id}/edit`"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Report
                            </Link>

                            <!-- Delete Action -->
                            <button
                              @click="confirmDelete(row)"
                              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        
          <!-- Empty State -->
          <div v-if="workReports.data.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No work reports</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by submitting your first work report' }}
            </p>
            <div v-if="canCreate" class="mt-6">
              <Link 
                :href="route('work-reports.create')" 
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Submit New Report
              </Link>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="workReports.last_page > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div class="flex flex-1 justify-between sm:hidden">
            <Link 
              v-if="workReports.prev_page_url"
              :href="workReports.prev_page_url" 
              class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
            <Link 
              v-if="workReports.next_page_url"
              :href="workReports.next_page_url" 
              class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ workReports.from }}</span>
                to
                <span class="font-medium">{{ workReports.to }}</span>
                of
                <span class="font-medium">{{ workReports.total }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Link 
                  v-if="workReports.prev_page_url"
                  :href="workReports.prev_page_url"
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                  </svg>
                </Link>
                
                <template v-for="link in workReports.links" :key="link.label">
                  <Link 
                    v-if="link.url && !link.label.includes('Previous') && !link.label.includes('Next')"
                    :href="link.url"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                      link.active 
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    ]"
                  >
                    {{ link.label }}
                  </Link>
                </template>
                
                <Link 
                  v-if="workReports.next_page_url"
                  :href="workReports.next_page_url"
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                  </svg>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { router, Link } from '@inertiajs/vue3';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import Pagination from '@/Components/Pagination.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  workReports: Object,
  employees: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

const { hasAnyRole, hasRole, roles, user, isAuthenticated } = useAuth();
const loading = ref(false);
const showFilters = ref(false);
const canCreate = computed(() => hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']));
const activeDropdown = ref(null);
const dropdownRefs = ref({});

// Filter state
const localFilters = ref({
  search: props.filters.search || '',
  user_id: props.filters.user_id || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || ''
});

// Employee options for select dropdown
const employeeOptions = computed(() => [
  { value: '', label: 'All employees' },
  ...props.employees.map(emp => ({
    value: emp.value,
    label: emp.label
  }))
]);

// Active filters computed properties
const hasActiveFilters = computed(() => {
  return (localFilters.value.search && localFilters.value.search.trim()) ||
         localFilters.value.user_id || 
         localFilters.value.date_from || 
         localFilters.value.date_to;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (localFilters.value.search && localFilters.value.search.trim()) count++;
  if (localFilters.value.user_id) count++;
  if (localFilters.value.date_from) count++;
  if (localFilters.value.date_to) count++;
  return count;
});

const activeEmployeeFilter = computed(() => {
  if (!localFilters.value.user_id) return null;
  
  // Find the option that matches the current filter value
  const selectedOption = employeeOptions.value.find(option => 
    option.value === localFilters.value.user_id
  );
  
  // Don't show "All employees" as an active filter (empty value)
  if (!selectedOption || selectedOption.value === '') return null;
  
  return selectedOption.label;
});

// Filter methods
const applyFilters = () => {
  loading.value = true;
  
  const params = {
    page: 1, // Reset to first page when filtering
    per_page: props.workReports.per_page || 10
  };
  
  // Add non-empty filters to params
  if (localFilters.value.search && localFilters.value.search.trim()) {
    params.search = localFilters.value.search.trim();
  }
  if (localFilters.value.user_id) {
    params.user_id = localFilters.value.user_id;
  }
  if (localFilters.value.date_from) {
    params.date_from = localFilters.value.date_from;
  }
  if (localFilters.value.date_to) {
    params.date_to = localFilters.value.date_to;
  }
  
  router.get(route('work-reports.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    },
    onError: (errors) => {
      console.error('Filter error:', errors);
      loading.value = false;
    }
  });
};

const clearSearchFilter = () => {
  localFilters.value.search = '';
  applyFilters();
};

const clearEmployeeFilter = () => {
  localFilters.value.user_id = '';
  applyFilters();
};

const clearDateFromFilter = () => {
  localFilters.value.date_from = '';
  applyFilters();
};

const clearDateToFilter = () => {
  localFilters.value.date_to = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    user_id: '',
    date_from: '',
    date_to: ''
  };
  applyFilters();
};

const debouncedApplyFilters = debounce(applyFilters, 300);

// Date validation
const validateDateRange = () => {
  if (localFilters.value.date_from && localFilters.value.date_to) {
    if (localFilters.value.date_from > localFilters.value.date_to) {
      // Auto-correct: swap the dates
      const temp = localFilters.value.date_from;
      localFilters.value.date_from = localFilters.value.date_to;
      localFilters.value.date_to = temp;
    }
  }
};

// Enhanced date change handler
const handleDateFromChange = () => {
  validateDateRange();
  applyFilters();
};

const handleDateToChange = () => {
  validateDateRange();
  applyFilters();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Dropdown management
const setDropdownRef = (el, reportId) => {
  if (el) {
    dropdownRefs.value[reportId] = el;
  }
};

const toggleDropdown = (reportId) => {
  if (activeDropdown.value === reportId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = reportId;
  }
};

const closeDropdowns = (event) => {
  const clickedInsideDropdown = Object.values(dropdownRefs.value).some(ref => 
    ref && ref.contains(event.target)
  );
  
  if (!clickedInsideDropdown) {
    activeDropdown.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
  console.log('canCreate:', canCreate.value);
  console.log('User roles:', roles.value);
  console.log('Is authenticated:', isAuthenticated.value);
  console.log('User object:', user.value);
  console.log('Has Employee role:', hasRole('Employee'));
  console.log('Has any role check:', hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']));
  
  // Debug employee data
  console.log('Employees data:', props.employees);
  console.log('Employee options:', employeeOptions.value);
  console.log('Current filters:', props.filters);
  console.log('Local filters:', localFilters.value);
  
  // Test route helper
  console.log('Testing route helper...');
  try {
    if (typeof route !== 'undefined') {
      console.log('Route helper available:', route('work-reports.index'));
    } else {
      console.warn('Route helper not available - using fallback URLs');
    }
  } catch (error) {
    console.error('Route helper error:', error);
  }
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Work Reports', current: true }
]);

const headerActions = computed(() => {
  if (!canCreate.value) return [];
  return [
    {
      id: 'create',
      label: 'Submit New Report',
      variant: 'primary',
      icon: 'plus',
      handler: () => router.visit('/work-reports/create')
    }
  ];
});

const tableColumns = computed(() => {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      formatter: (value) => {
        if (!value) return '';
        // Parse date safely without timezone issues
        const [year, month, day] = value.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'calls',
      label: 'Total Calls',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'successful_calls',
      label: 'Successful',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'calls_not_received',
      label: 'Not Received',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'disconnected_calls',
      label: 'Disconnected',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'follow_up_calls',
      label: 'Follow-up',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'emails',
      label: 'Emails',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'sms',
      label: 'SMS',
      sortable: true,
      formatter: (value) => value || 0
    },
  ];
  if (hasAnyRole(['Admin', 'Manager'])) {
    columns.splice(1, 0, {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      formatter: (value) => value?.user?.name || 'Unavailable'
    });
  }
  return columns;
});

// No longer needed as actions are directly in the table
// const getRowActions = (row) => ([]);

const emptyState = computed(() => ({
  title: 'No work reports found',
  description: 'There are no work reports to display. Submit your first report to get started.',
  icon: 'document-text',
  actions: canCreate.value ? [{
    id: 'create',
    label: 'Submit New Report',
    variant: 'primary',
    icon: 'plus',
    handler: () => router.visit('/work-reports/create')
  }] : []
}));

const confirmDelete = (row) => {
  // Format date safely without timezone issues
  const formatDateSafely = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };
  
  const confirmMessage = `Are you sure you want to delete the work report for ${formatDateSafely(row.date)}?\n\nThis action cannot be undone.`;
  
  if (confirm(confirmMessage)) {
    loading.value = true;
    router.delete(`/work-reports/${row.id}`, {
      onSuccess: () => {
        loading.value = false;
        // Success message will be handled by the backend flash message
      },
      onError: (errors) => {
        loading.value = false;
        console.error('Delete failed:', errors);
        alert('Failed to delete work report. Please try again.');
      }
    });
  }
};

// Page size change handler (page navigation is handled internally by Pagination component)
const handlePageSizeChange = (perPage) => {
  console.log('handlePageSizeChange called with perPage:', perPage);
  
  if (!perPage || perPage < 1) {
    console.warn('Invalid per page value:', perPage);
    return;
  }
  
  loading.value = true;
  
  const url = '/work-reports';
  const params = { 
    per_page: parseInt(perPage),
    page: 1 // Reset to first page when changing page size
  };
  
  console.log('Navigating to:', url, 'with params:', params);
  
  router.get(url, params, {
    preserveState: true,
    preserveScroll: true,
    onStart: () => {
      console.log('Page size change navigation started');
    },
    onSuccess: (page) => {
      console.log('Page size change navigation successful', page);
      loading.value = false;
    },
    onError: (errors) => {
      console.error('Page size change navigation failed:', errors);
      loading.value = false;
    },
    onFinish: () => {
      console.log('Page size change navigation finished');
      loading.value = false;
    }
  });
};

// Legacy method for backward compatibility
const destroy = (id) => {
  if (confirm('Are you sure?')) {
    router.delete(`/work-reports/${id}`);
  }
};

// Lifecycle hooks
onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>