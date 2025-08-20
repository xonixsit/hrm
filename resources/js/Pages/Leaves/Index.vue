<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Management"
      subtitle="Manage leave requests and approvals"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow-sm">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <!-- Top Bar with Wide Search -->
          <div class="flex justify-between items-center mb-4 relative z-[99999]">
            <h3 class="text-lg font-medium text-gray-900">Leave Requests</h3>
            <SearchBar
            
            v-model="localFilters.search"
             placeholder="Search employee name, notes..."
            class="w-full max-w-xl"
            :suggestions="searchSuggestions"
            :loading="loading"
            @input="debounceSearch"
            @select="handleSearchSelect"
            @search="applyFilters"
            @clear="clearSearchFilter"
          />
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-4"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
            </button>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-start relative z-40">
            <!-- Employee Filter (Admin/HR only) -->
            <div v-if="isApprover">
              <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <BaseSelect
                v-model="localFilters.employee_id"
                :options="employeeOptions"
                placeholder="All employees"
                class="w-full"
                @change="applyFilters"
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
              />
            </div>
            
            <!-- Leave Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <BaseMultiSelect
                v-model="localFilters.leave_type_id"
                :options="leaveTypeOptions"
                placeholder="All types"
                class="w-full"
              />
            </div>

            <!-- Date Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <DateRangePicker
                v-model="dateRangeFilter"
                class="w-full"
                @update:modelValue="applyFilters"
              />
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700">Active filters:</span>
            <FilterTag
              v-if="activeEmployeeFilter"
              :filter="{ label: 'Employee' }"
              :value="activeEmployeeFilter"
              @remove="clearEmployeeFilter"
            />
            <FilterTag
              v-if="activeStatusFilter"
              :filter="{ label: 'Status' }"
              :value="localFilters.status"
              @remove="clearStatusFilter"
            />
            <FilterTag
              v-if="activeLeaveTypeFilter"
              :filter="{ label: 'Leave Type' }"
              :value="localFilters.leave_type_id"
              @remove="clearLeaveTypeFilter"
            />
            <FilterTag
              v-if="dateRangeFilter.start || dateRangeFilter.end"
              :filter="{ label: 'Date Range' }"
              :value="{ start: dateRangeFilter.start, end: dateRangeFilter.end }"
              @remove="clearDateRangeFilter"
            />
            <FilterTag
              v-if="localFilters.search"
              :filter="{ label: 'Search' }"
              :value="localFilters.search"
              @remove="clearSearchFilter"
            />
            <button
              @click="clearAllFilters"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="relative z-10">
        <DataTable
          :data="leaves.data"
          :columns="tableColumns"
          :loading="loading"
          :actions="tableActions"
          :row-actions="getRowActions"
          :search-config="{ enabled: false }"
          :empty-state="{
            title: 'No leave requests found',
            description: 'There are no leave requests to display. Create your first leave request to get started.',
            icon: 'calendar-days',
            actions: canCreate ? [{
              id: 'create-leave',
              label: 'Request Leave',
              variant: 'primary',
              icon: 'plus',
              handler: () => router.visit(route('leaves.create'))
            }] : []
          }"
          :server-side-pagination="true"
          :current-page="leaves.current_page"
          :total-pages="leaves.last_page"
          :page-size="localPerPage"
          :total-items="leaves.total"
          :page-size-options="[10, 15, 25, 50, 100]"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          @row-click="handleRowClick"
          @row-action="handleRowAction"
          @header-action="handleHeaderAction"
        >
          <!-- Employee Column -->
          <template #cell-employee="{ row }">
            <div v-if="row.employee?.user" class="flex items-center space-x-3 min-w-0">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-semibold text-primary-700">
                    {{ getInitials(row.employee.user.name) }}
                  </span>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-neutral-900 truncate">
                  {{ row.employee.user.name }}
                </p>
                <p class="text-xs text-neutral-500 truncate">
                  {{ row.employee.user.email }}
                </p>
              </div>
            </div>
            <div v-else class="flex items-center space-x-3 min-w-0">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-semibold text-neutral-500">
                    --
                  </span>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-neutral-500 truncate">
                  Employee data unavailable
                </p>
                <p class="text-xs text-neutral-400 truncate">
                  --
                </p>
              </div>
            </div>
          </template>

          <!-- Date Range Column -->
          <template #cell-dates="{ row }">
            <div class="text-sm">
              <div class="flex items-center space-x-1 text-neutral-900">
                <CalendarIcon class="w-4 h-4 text-neutral-400" />
                <span>{{ formatDate(row.from_date) }}</span>
              </div>
              <div class="flex items-center space-x-1 text-neutral-600 mt-1">
                <ArrowRightIcon class="w-3 h-3 text-neutral-400" />
                <span>{{ formatDate(row.to_date) }}</span>
              </div>
              <div class="text-xs text-neutral-500 mt-1">
                {{ getDuration(row.from_date, row.to_date) }}
              </div>
            </div>
          </template>

          <!-- Leave Type Column -->
          <template #cell-leave_type="{ row }">
            <div class="flex items-center space-x-2">
              <div :class="getLeaveTypeIconClasses(row.leave_type.name)">
                <component :is="getLeaveTypeIcon(row.leave_type.name)" class="w-4 h-4" />
              </div>
              <span class="text-sm font-medium text-neutral-900">
                {{ row.leave_type.name }}
              </span>
            </div>
          </template>

          <!-- Status Column -->
          <template #cell-status="{ row }">
            <span :class="getStatusClasses(row.status)">
              <component :is="getStatusIcon(row.status)" class="w-3 h-3 mr-1" />
              {{ getStatusLabel(row.status) }}
            </span>
          </template>
        </DataTable>

        <!-- Pagination -->
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Head, Link, usePage, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import Pagination from '@/Components/Pagination.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import DateRangePicker from '@/Components/Base/DateRangePicker.vue';
import SearchBar from '@/Components/Search/SearchBar.vue';
import FilterTag from '@/Components/Data/FilterTag.vue';
import { useAuth } from '@/composables/useAuth';
import { debounce } from 'lodash';
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  HeartIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leaves: Object,
  queryParams: Object,
  canManageLeaves: Boolean,
  leaveTypes: Array,
  employees: Array,
});

const page = usePage();
const { user, roles, hasRole, hasAnyRole } = useAuth();

// Local state
const loading = ref(false);
const showFilters = ref(false);

const localFilters = ref({
  employee_id: props.queryParams?.employee_id || '',
  status: props.queryParams?.status ? Array.isArray(props.queryParams.status) ? props.queryParams.status : [props.queryParams.status] : [],
  leave_type_id: props.queryParams?.leave_type_id ? Array.isArray(props.queryParams.leave_type_id) ? props.queryParams.leave_type_id : [props.queryParams.leave_type_id] : [],
  search: props.queryParams?.search || '',
});
const localPerPage = ref(props.queryParams?.per_page || 10);

const dateRangeFilter = computed({
  get: () => ({
    start: props.queryParams?.date_from || '',
    end: props.queryParams?.date_to || '',
  }),
  set: (value) => {
    localFilters.value.date_from = value.start;
    localFilters.value.date_to = value.end;
  },
});
const searchSuggestions = computed(() => {
  const query = localFilters.value.search?.toLowerCase() || '';
  if (!query) return [];
  return employeeOptions.value
    .filter(opt => opt.label.toLowerCase().includes(query))
    .map(opt => ({
      id: opt.value,
      text: opt.label,
      icon: 'user',
      category: 'Employee'
    }));
});

// Computed properties
const isApprover = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']));
const canCreate = computed(() => hasRole('Employee'));

const employeeOptions = computed(() => {

  const options = [{ value: '', label: 'All Employees' }];
  if (isApprover.value) {
    options.push({ value: 'my_team', label: 'My Team' });
  }
  options.push(...(props.employees || []).map(emp => ({ value: emp.id, label: emp.name })));

  return options;
});

const statusOptions = computed(() => [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]);

const leaveTypeOptions = computed(() => [
  { value: '', label: 'All Types' },
  ...(props.leaveTypes || []).map(type => ({ value: type.id, label: type.name }))
]);

const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => value !== '' && value !== null);
});

const activeEmployeeFilter = computed(() => {
  if (localFilters.value.employee_id === 'my_team') return 'My Team';
  const employee = (props.employees || []).find(emp => emp.id == localFilters.value.employee_id);
  return employee ? employee.name : '';
});

const activeStatusFilter = computed(() => {
  return localFilters.value.status
    .map(s => statusOptions.value.find(opt => opt.value === s)?.label)
    .filter(Boolean)
    .join(', ') || '';
});

const activeLeaveTypeFilter = computed(() => {
  return localFilters.value.leave_type_id
    .map(id => (props.leaveTypes || []).find(t => t.id == id)?.name)
    .filter(Boolean)
    .join(', ') || '';
});

// PageLayout configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', current: true }
]);

const headerActions = computed(() => {
  const actions = [];
  
  if (canCreate.value) {
    actions.push({
      id: 'create-leave',
      label: 'Request Leave',
      icon: 'plus',
      variant: 'primary',
      handler: () => router.visit(route('leaves.create'))
    });
  }
  
  return actions;
});

// Table configuration
const tableColumns = computed(() => {
  const columns = [
    {
      key: 'dates',
      label: 'Duration',
      sortable: true,
      minWidth: '180px',
      priority: 'high'
    },
    {
      key: 'leave_type',
      label: 'Leave Type',
      sortable: true,
      minWidth: '140px',
      priority: 'high',
      align: 'center'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      minWidth: '120px',
      priority: 'high',
      align: 'center'
    }
  ];

  // Add employee column for approvers
  if (isApprover.value) {
    columns.unshift({
      key: 'employee',
      label: 'Employee',
      sortable: true,
      minWidth: '200px',
      maxWidth: '300px',
      priority: 'high'
    });
  }

  return columns;
});

const tableActions = computed(() => [
  {
    id: 'export',
    label: 'Export',
    icon: 'document-arrow-down',
    variant: 'secondary'
  }
]);

// Filter methods
const applyFilters = (additionalParams = {}) => {

  const params = { 
    ...localFilters.value,
    date_from: dateRangeFilter.value.start,
    date_to: dateRangeFilter.value.end,
    per_page: localPerPage.value,
    ...additionalParams 
  };

  for (const key in params) {
    if (params[key] === '' || params[key] === null) {
      delete params[key];
    }
  }
  
    router.get(route('leaves.index'), params, {
    onStart: () => {
      loading.value = true;
    },
    onFinish: () => {
      loading.value = false;
    },
  });
};
const handlePageSizeChange = (newSize) => {
  localPerPage.value = newSize;
  applyFilters({ page: 1 });
};
const handlePageChange = (newPage) => {
  applyFilters({ page: newPage });
};

const clearEmployeeFilter = () => {
  localFilters.value.employee_id = '';
  applyFilters();

};

const clearStatusFilter = () => {
  localFilters.value.status = [];
  applyFilters();
};

const clearLeaveTypeFilter = () => {
  localFilters.value.leave_type_id = [];
  applyFilters();
};

const clearDateRangeFilter = () => {
  dateRangeFilter.value = { start: '', end: '' };
  applyFilters();
};

const clearSearchFilter = () => {
  localFilters.value.search = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    employee_id: '',
    status: [],
    leave_type_id: [],
    search: '',
  };
  dateRangeFilter.value = { start: '', end: '' };
  applyFilters();
};

const debounceSearch = debounce(() => {
  applyFilters();
}, 300);

const handleSearchSelect = (suggestion) => {
  localFilters.value.employee_id = suggestion.id;

  applyFilters();
};

watch(() => localFilters.value.employee_id, (newValue, oldValue) => {
  applyFilters();
});

watch(() => localFilters.value.status, (newValue, oldValue) => {
  applyFilters();
});

watch(() => localFilters.value.leave_type_id, (newValue, oldValue) => {
  applyFilters();
});

// Helper functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getDuration = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

const getLeaveTypeIcon = (leaveType) => {
  const iconMap = {
    'Annual Leave': CalendarIcon,
    'Sick Leave': HeartIcon,
    'Personal Leave': UserIcon,
    'Study Leave': AcademicCapIcon,
    'Emergency Leave': ExclamationTriangleIcon
  };
  
  return iconMap[leaveType] || CalendarIcon;
};

const getLeaveTypeIconClasses = (leaveType) => {
  const classMap = {
    'Annual Leave': 'w-6 h-6 p-1 bg-blue-100 text-blue-600 rounded',
    'Sick Leave': 'w-6 h-6 p-1 bg-red-100 text-red-600 rounded',
    'Personal Leave': 'w-6 h-6 p-1 bg-green-100 text-green-600 rounded',
    'Study Leave': 'w-6 h-6 p-1 bg-purple-100 text-purple-600 rounded',
    'Emergency Leave': 'w-6 h-6 p-1 bg-orange-100 text-orange-600 rounded'
  };
  
  return classMap[leaveType] || 'w-6 h-6 p-1 bg-neutral-100 text-neutral-600 rounded';
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: ClockIcon,
    approved: CheckIcon,
    rejected: XMarkIcon
  };
  
  return iconMap[status] || ClockIcon;
};

const getStatusLabel = (status) => {
  const labelMap = {
    pending: 'Pending',
    approved: 'Approved', 
    rejected: 'Rejected'
  };
  
  return labelMap[status] || status;
};



const getStatusClasses = (status) => {
  const classMap = {
    pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    approved: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    rejected: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  
  return classMap[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800';
};

const getRowActions = (row) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      handler: () => router.visit(route('leaves.show', row.id))
    }
  ];

  if (props.canManageLeaves && row.status === 'pending') {
    actions.push(
      {
        id: 'approve',
        label: 'Approve',
        icon: 'check',
        handler: () => approve(row.id)
      },
      {
        id: 'reject',
        label: 'Reject',
        icon: 'x-mark',
        handler: () => reject(row.id)
      }
    );
  }

  return actions;
};





// Permission checks
const canEdit = (leave) => {
  return !isApprover.value && leave.status === 'pending';
};

const canDelete = (leave) => {
  return canEdit(leave);
};

// Event handlers
const handleSearch = () => {
  // Implement search functionality
  console.log('Search:', searchQuery.value);
};

const handleFilter = () => {
  // Implement filter functionality
  console.log('Filters:', { status: statusFilter.value, type: typeFilter.value });
};

const handleRowClick = (row) => {
  router.visit(route('leaves.show', row.id));
};

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler();
  }
};

const handleHeaderAction = (action) => {
  if (action.id === 'export') {
    // Implement export functionality
  
  }
};

// Actions
const destroy = (id) => {
  if (confirm('Are you sure you want to delete this leave request?')) {
    loading.value = true;
    router.delete(route('leaves.destroy', id), {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const approve = (id) => {
  if (confirm('Are you sure you want to approve this leave request?')) {
    loading.value = true;
    router.put(route('leaves.update', id), { status: 'approved' }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const reject = (id) => {
  if (confirm('Are you sure you want to reject this leave request?')) {
    loading.value = true;
    router.put(route('leaves.update', id), { status: 'rejected' }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};
</script>