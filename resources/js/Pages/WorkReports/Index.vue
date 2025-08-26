<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Work Reports"
      subtitle="Submit and manage daily work reports"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Work Report List</h3>
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
            </button>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- User Filter (only for admins/managers/HR) -->
            <div v-if="employees.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <BaseSelect
                v-model="localFilters.user_id"
                :options="employeeOptions"
                placeholder="All employees"
                class="w-full"
                @change="applyFilters"
              />
            </div>
            
            <!-- Date From Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                v-model="localFilters.date_from"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="applyFilters"
              />
            </div>
            
            <!-- Date To Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                v-model="localFilters.date_to"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="applyFilters"
              />
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700">Active filters:</span>
            <span
              v-if="activeEmployeeFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Employee: {{ activeEmployeeFilter }}
              <button
                @click="clearEmployeeFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="localFilters.date_from"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              From: {{ formatDate(localFilters.date_from) }}
              <button
                @click="clearDateFromFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="localFilters.date_to"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              To: {{ formatDate(localFilters.date_to) }}
              <button
                @click="clearDateToFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <button
              @click="clearAllFilters"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="column in tableColumns" :key="column.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ column.label }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="row in workReports.data" :key="row.id" class="hover:bg-gray-50">
                <td v-for="column in tableColumns" :key="column.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ column.formatter ? column.formatter(row[column.key]) : row[column.key] }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-1">
                    <!-- View Action -->
                    <Link 
                      :href="`/work-reports/${row.id}`" 
                      class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      title="View report details"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </Link>

                    <!-- Edit Action -->
                    <Link 
                      :href="`/work-reports/${row.id}/edit`" 
                      class="inline-flex items-center justify-center w-8 h-8 border border-transparent shadow-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      title="Edit this report"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </Link>

                    <!-- Delete Action -->
                    <button 
                      @click="confirmDelete(row)" 
                      class="inline-flex items-center justify-center w-8 h-8 border border-transparent shadow-sm rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      title="Delete this report"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Empty State -->
        <div v-if="!workReports.data.length && !loading" class="py-12 flex flex-col items-center justify-center">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ emptyState.title }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ emptyState.description }}</p>
            <div class="mt-6">
              <button v-for="action in emptyState.actions" :key="action.id" @click="action.handler" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg v-if="action.icon" class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="py-12">
          <div class="flex justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      </div>
      <!-- Pagination Component -->
      <div v-if="workReports.last_page > 1" class="mt-6">
        <Pagination 
          :links="workReports.links"
          :current-page="workReports.current_page"
          :last-page="workReports.last_page"
          :total="workReports.total"
          :per-page="workReports.per_page"
          :from="workReports.from"
          :to="workReports.to"
          @page-size-change="handlePageSizeChange"
        />
      </div>
      
      <!-- Show pagination info even when only one page -->
      <div v-else-if="workReports.total > 0" class="mt-6">
        <Pagination 
          :links="workReports.links"
          :current-page="workReports.current_page"
          :last-page="workReports.last_page"
          :total="workReports.total"
          :per-page="workReports.per_page"
          :from="workReports.from"
          :to="workReports.to"
          :show-first-last="false"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { router, Link } from '@inertiajs/vue3';
import { computed, ref, onMounted, watch } from 'vue';
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

// Filter state
const localFilters = ref({
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
  return localFilters.value.user_id || 
         localFilters.value.date_from || 
         localFilters.value.date_to;
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
  if (localFilters.value.user_id) {
    params.user_id = localFilters.value.user_id;
  }
  if (localFilters.value.date_from) {
    params.date_from = localFilters.value.date_from;
  }
  if (localFilters.value.date_to) {
    params.date_to = localFilters.value.date_to;
  }
  
  router.get('/work-reports', params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
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
    user_id: '',
    date_from: '',
    date_to: ''
  };
  applyFilters();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

onMounted(() => {
  console.log('canCreate:', canCreate.value);
  console.log('User roles:', roles.value);
  console.log('Is authenticated:', isAuthenticated.value);
  console.log('User object:', user.value);
  console.log('Has Employee role:', hasRole('Employee'));
  console.log('Has any role check:', hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']));
  
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
</script>