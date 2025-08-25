<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Time Tracking"
      subtitle="View and manage attendance records"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Attendance Records</h3>
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
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Employee Filter (Admin/HR only) -->
            <div v-if="isAdminOrHR">
              <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
               <BaseMultiSelect
                 v-model="localFilters.employee_id"
                 :options="employeeOptions"
                 placeholder="All employees"
                 class="w-full"
                 @update:modelValue="debouncedApplyFilters"
               />
            </div>
            
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <BaseMultiSelect
                v-model="localFilters.status"
                :options="statusOptions"
                placeholder="All statuses"
                class="w-full"
                @update:modelValue="debouncedApplyFilters"
              />
            </div>

            <!-- Date Range Picker -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <DateRangePicker
                :start-date="localFilters.date_from"
                :end-date="localFilters.date_to"
                class="w-full"
                @update:modelValue="(value) => {
                  localFilters.date_from = value.start;
                  localFilters.date_to = value.end;
                  console.log('DateRangePicker update:', { start: value.start, end: value.end, localFrom: localFilters.date_from, localTo: localFilters.date_to });
                  // Apply filters immediately when either date changes
                  debouncedApplyFilters();
                }"
              />
            </div>
            
            <!-- Search Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                v-model="localFilters.search"
                type="text"
                placeholder="Employee name, notes..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @input="debounceSearch"
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
              v-if="activeStatusFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Status: {{ activeStatusFilter }}
              <button
                @click="clearStatusFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
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
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
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
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="localFilters.search"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              Search: "{{ localFilters.search }}"
              <button
                @click="clearSearchFilter"
                class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 focus:outline-none"
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

        <ContentCard class="border-0 shadow-none">
          <DataTable
            :data="attendances?.data || []"
            :columns="tableColumns"
            :loading="loading"
            :server-side-pagination="true"
            :current-page="attendances?.current_page || 1"
            :total-pages="attendances?.last_page || 1"
            :page-size="perPage"
            :total-items="attendances?.total || 0"
            :page-size-options="[10, 15, 25, 50, 100]"
            :row-actions="getRowActions"
            :empty-state="emptyState"
            :search-config="searchConfig"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @row-action="handleRowAction"
            class="w-full"
          >
            <!-- Custom Employee Cell -->
            <template #cell-employee="{ row }">
              <div class="flex items-center space-x-3 min-w-0">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-700">
                      {{ getEmployeeInitials(row.employee?.user?.name) }}
                    </span>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-neutral-900 truncate">
                    {{ row.employee?.user?.name || 'N/A' }}
                  </div>
                  <div class="text-sm text-neutral-500 truncate">
                    {{ row.employee?.employee_code || '' }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Custom Date Cell -->
            <template #cell-date="{ value }">
              <div class="text-sm text-neutral-900">
                {{ formatDate(value) }}
              </div>
            </template>

            <!-- Custom Time Cells -->
            <template #cell-clock_in="{ value }">
              <div class="text-sm text-neutral-900">
                {{ formatTime(value) }}
              </div>
            </template>

            <template #cell-clock_out="{ value }">
              <div class="text-sm text-neutral-900">
                {{ formatTime(value) }}
              </div>
            </template>

            <!-- Custom Duration Cell -->
            <template #cell-duration="{ row }">
              <div class="text-sm font-medium text-neutral-900">
                {{ calculateDuration(row) }}
              </div>
            </template>

            <!-- Custom Status Cell -->
            <template #cell-status="{ value }">
              <span :class="getStatusBadgeClasses(value)">
                {{ formatStatus(value) }}
              </span>
            </template>

            <!-- Custom Break Time Cell -->
            <template #cell-break_time="{ value }">
              <div class="text-sm text-neutral-900">
                {{ formatBreakTime(value) }}
              </div>
            </template>
          </DataTable>
        </ContentCard>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import DateRangePicker from '@/Components/Base/DateRangePicker.vue';
import { debounce } from 'lodash';

const props = defineProps({
  attendances: {
    type: Object,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  queryParams: {
    type: Object,
    default: () => ({})
  }
});

 const { user, hasRole, hasAnyRole } = useAuth();
 const loading = ref(false);
 const showFilters = ref(false);
 const perPage = ref(props.queryParams.per_page || 10);

const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));
const canClockInOut = computed(() => hasRole('Employee'));

onMounted(() => {
  console.log('Index.vue mounted. employeeOptions:', props.filters.employees);
});

// Filter state - simple like work reports
const localFilters = ref({
  employee_id: props.queryParams.employee_id ? [String(props.queryParams.employee_id)] : [],
  status: props.queryParams.status ? [props.queryParams.status] : [],
  date_from: props.queryParams.date_from || '',
  date_to: props.queryParams.date_to || '',
  search: props.queryParams.search || ''
});

const updateFilter = (key, value) => {
  localFilters.value[key] = value;
  debouncedApplyFilters();
};

// Filter options
const employeeOptions = computed(() => [
  ...((props.filters.employees || []).map(emp => ({
    value: emp.id.toString(),
    label: emp.name
  })))
]);

const statusOptions = computed(() => [
  { value: 'clocked_in', label: 'Clocked In' },
  { value: 'clocked_out', label: 'Clocked Out' },
  { value: 'on_break', label: 'On Break' },
  { value: 'absent', label: 'Absent' }
]);

// Active filters computed properties
const hasActiveFilters = computed(() => {
  return (localFilters.value.employee_id && localFilters.value.employee_id.length > 0) || 
         (localFilters.value.status && localFilters.value.status.length > 0) || 
         !!localFilters.value.date_from ||
         !!localFilters.value.date_to ||
         !!localFilters.value.search;
});

const activeEmployeeFilter = computed(() => {
  if (localFilters.value.employee_id && localFilters.value.employee_id.length > 0 && props.filters.employees) {
    const employee = props.filters.employees.find(emp => emp.id == localFilters.value.employee_id[0]);
    return employee ? employee.name : '';
  }
  return '';
});

const activeStatusFilter = computed(() => {
  if (localFilters.value.status && localFilters.value.status.length > 0) {
    const statusOption = statusOptions.value.find(s => s.value === localFilters.value.status[0]);
    return statusOption ? statusOption.label : null;
  }
  return null;
});

// Breadcrumbs configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendance Management', current: true }
]);

// Header actions
const headerActions = computed(() => {
  const actions = [];
  
  if (canClockInOut.value) {
    actions.push(
      {
        id: 'clock-in',
        label: 'Clock In',
        variant: 'success',
        handler: clockIn
      },
      {
        id: 'clock-out',
        label: 'Clock Out',
        variant: 'danger', 
        handler: clockOut
      }
    );
  }
  
  return actions;
});

// Table columns configuration
const tableColumns = computed(() => {
  const baseColumns = [
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      minWidth: '120px',
      priority: 'high'
    },
    { 
      key: 'clock_in', 
      label: 'Clock In', 
      sortable: true,
      minWidth: '100px',
      priority: 'high',
      align: 'center'
    },
    { 
      key: 'clock_out', 
      label: 'Clock Out', 
      sortable: true,
      minWidth: '100px',
      priority: 'high',
      align: 'center'
    },
    { 
      key: 'duration', 
      label: 'Duration', 
      sortable: true,
      minWidth: '100px',
      priority: 'medium',
      align: 'center'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      minWidth: '120px',
      priority: 'high',
      align: 'center'
    },
    { 
      key: 'break_time', 
      label: 'Break Time', 
      sortable: false,
      minWidth: '100px',
      priority: 'low',
      align: 'center'
    }
  ];
  
  // Add employee column for admin/HR at the beginning
  if (isAdminOrHR.value) {
    baseColumns.unshift({
      key: 'employee',
      label: 'Employee',
      sortable: true,
      minWidth: '200px',
      maxWidth: '300px',
      priority: 'high'
    });
  }
  
  return baseColumns;
});

// Row actions configuration
const getRowActions = (row) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      handler: () => router.visit(route('attendances.show', row.id))
    }
  ];

  if (isAdminOrHR.value) {
    actions.push(
      {
        id: 'edit',
        label: 'Edit',
        handler: () => router.visit(route('attendances.edit', row.id))
      },
      {
        id: 'delete',
        label: 'Delete',
        variant: 'danger',
        handler: () => deleteRecord(row)
      }
    );
  }

  return actions;
};

// Search configuration - disabled since we have search in filters
const searchConfig = {
  enabled: false
};

// Empty state configuration
const emptyState = {
  title: 'No attendance records found',
  description: 'No attendance records match your current filters.',
  icon: 'clock',
  actions: hasActiveFilters.value ? [
    {
      id: 'clear-filters',
      label: 'Clear Filters',
      variant: 'secondary',
      handler: () => clearAllFilters()
    }
  ] : []
};

// Methods
const getEmployeeInitials = (name) => {
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    // Parse the date string as YYYY-MM-DD to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const formatTime = (timeString) => {
  if (!timeString || timeString === 'Invalid Date') return '-';
  
  try {
    // Handle different time formats
    let time;
    if (timeString.includes('T')) {
      // ISO datetime format
      time = new Date(timeString);
    } else if (timeString.includes(':')) {
      // Time only format
      time = new Date(`2000-01-01 ${timeString}`);
    } else {
      return '-';
    }
    
    if (isNaN(time.getTime())) return '-';
    
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '-';
  }
};

const calculateDuration = (row) => {
  if (!row.clock_in || !row.clock_out) return '-';
  
  try {
    let clockIn, clockOut;
    
    // Handle different datetime formats
    if (row.clock_in.includes('T')) {
      clockIn = new Date(row.clock_in);
    } else {
      clockIn = new Date(`${row.date} ${row.clock_in}`);
    }
    
    if (row.clock_out.includes('T')) {
      clockOut = new Date(row.clock_out);
    } else {
      clockOut = new Date(`${row.date} ${row.clock_out}`);
    }
    
    if (isNaN(clockIn.getTime()) || isNaN(clockOut.getTime())) return '-';
    
    const diffMs = clockOut - clockIn;
    if (diffMs < 0) return '-';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (isNaN(diffHours) || isNaN(diffMinutes)) return '-';
    
    return `${diffHours}h ${diffMinutes}m`;
  } catch (error) {
    return '-';
  }
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

const getStatusBadgeClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (status) {
    case 'clocked_in':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'clocked_out':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'on_break':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'absent':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const formatBreakTime = (breakTime) => {
  if (!breakTime) return '-';
  const minutes = parseInt(breakTime);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Clock in/out methods
const clockIn = () => {
  loading.value = true;
  router.post(route('attendances.clockIn'), {}, {
    onFinish: () => {
      loading.value = false;
    }
  });
};

const clockOut = () => {
  loading.value = true;
  router.post(route('attendances.clockOut'), {}, {
    onFinish: () => {
      loading.value = false;
    }
  });
};

const deleteRecord = (row) => {
  if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
    return;
  }
  
  loading.value = true;
  router.delete(route('attendances.destroy', row.id), {
    onFinish: () => {
      loading.value = false;
    }
  });
};

// Filter methods - simple like work reports
const applyFilters = () => {



  loading.value = true;
  const params = {
    page: 1,
    per_page: perPage.value
  };
  
  
  // Add filters to params, setting to null if empty to clear from URL
  params.employee_id = localFilters.value.employee_id.length > 0 ? localFilters.value.employee_id : null;
  params.status = localFilters.value.status.length > 0 ? localFilters.value.status : null;
  params.date_from = localFilters.value.date_from || undefined;
  params.date_to = localFilters.value.date_to || undefined;
  params.search = localFilters.value.search || null;
  
  
  console.log('Applying filters with params:', params);
  router.visit(route('attendances.index', params), {
    onFinish: () => {
      loading.value = false;
    }
  });
};

const clearEmployeeFilter = () => {
  localFilters.value.employee_id = [];
  applyFilters();
};

const clearStatusFilter = () => {
  localFilters.value.status = [];
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

const clearSearchFilter = () => {
  localFilters.value.search = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    employee_id: [],
    status: [],
    date_from: '',
    date_to: '',
    search: ''
  };
  applyFilters();
};

const debounceSearch = () => {
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const handlePageChange = (page) => {
  const params = { ...props.queryParams, page, per_page: perPage.value };
  
  // Ensure current filters are preserved, setting to null if empty
  params.employee_id = localFilters.value.employee_id || null;
  params.status = localFilters.value.status || null;
  params.date_from = localFilters.value.date_from || null;
  params.date_to = localFilters.value.date_to || null;
  params.search = localFilters.value.search || null;
  
  router.visit(route('attendances.index', params));
};

const handlePageSizeChange = (size) => {
  perPage.value = size;
  const params = { ...props.queryParams, per_page: perPage.value, page: 1 };
  
  // Ensure current filters are preserved, setting to null if empty
  params.employee_id = localFilters.value.employee_id || null;
  params.status = localFilters.value.status || null;
  params.date_from = localFilters.value.date_from || null;
  params.date_to = localFilters.value.date_to || null;
  params.search = localFilters.value.search || null;
  
  router.visit(route('attendances.index', params));
};

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler();
  }
};

 const debouncedApplyFilters = debounce(() => {
   applyFilters();
 }, 300);
</script>




