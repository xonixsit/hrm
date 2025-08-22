<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Management"
      subtitle="View and manage leave requests"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Leave Requests</h3>
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon class="w-4 h-4 mr-2" />
              {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
            </button>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <!-- Leave Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <BaseMultiSelect
                v-model="localFilters.leave_type_id"
                :options="leaveTypeOptions"
                placeholder="All types"
                class="w-full"
                @update:modelValue="debouncedApplyFilters"
              />
            </div>

            <!-- Search Filter -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                v-model="localFilters.search"
                type="text"
                placeholder="Search by employee name, ID, or notes..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @input="debouncedApplyFilters"
              />
            </div>

            <!-- Date Range Picker -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <DateRangePicker
                v-model:start-date="localFilters.date_from"
                v-model:end-date="localFilters.date_to"
                class="w-full"
                @update:startDate="updateFilter('date_from', $event)"
                @update:endDate="updateFilter('date_to', $event)"
              />
            </div>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
              <span class="text-sm font-medium text-gray-700">Active filters:</span>
              
              <!-- Status Filters -->
              <span 
                v-for="status in localFilters.status" 
                :key="`status-${status}`"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ statusOptions.find(s => s.value === status)?.name || status }}
                <button 
                  @click="removeStatusFilter(status)"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <span class="sr-only">Remove status filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <!-- Leave Type Filters -->
              <span 
                v-for="typeId in localFilters.leave_type_id" 
                :key="`type-${typeId}`"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ leaveTypeOptions.find(t => t.value == typeId)?.name || typeId }}
                <button 
                  @click="removeLeaveTypeFilter(typeId)"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove leave type filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <!-- Date Range Filter -->
              <span 
                v-if="localFilters.date_from && localFilters.date_to"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {{ formatDate(localFilters.date_from) }} - {{ formatDate(localFilters.date_to) }}
                <button 
                  @click="clearDateRange"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date range filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <!-- Clear All Button -->
              <button 
                @click="resetFilters"
                class="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear all
              </button>
            </div>
          </div>
{{ leaves.data }}
          <!-- Data Table -->
          <ContentCard class="border-0 shadow-none">
            <DataTable 
              :columns="columns" 
              :data="formattedLeaves"
              :loading="loading"
            :server-side-pagination="true"
            :current-page="attendances?.current_page || 1"
            :total-pages="attendances?.last_page || 1"
            :page-size="perPage"
            :total-items="attendances?.total || 0"
            :page-size-options="[10, 15, 25, 50, 100]"
            :row-actions="getRowActions"
            :empty-state="emptyState"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @row-action="handleRowAction"
            class="w-full"
            >
              <!-- Employee Column -->
              <template #employee="{ row: leave }">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span class="text-indigo-800 font-medium">
                      {{ getInitials(leave.employee?.name || '') }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ leave.employee?.name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">{{ leave.employee?.employee_id || '' }}</div>
                  </div>
                </div>
              </template>

              <!-- Leave Type Column -->
              <template #leave_type="{ row: leave }">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ leave.leave_type?.name || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
                  </div>
                </div>
              </template>

              <!-- Status Column -->
              <template #status="{ row: leave }">
                <span :class="[getStatusClasses(leave.status), 'px-2.5 py-0.5 rounded-full text-xs font-medium']">
                  {{ formatStatus(leave.status) }}
                </span>
              </template>

              <!-- Days Column -->
              <template #days="{ row: leave }">
                <span class="text-sm text-gray-900">
                  {{ leave.days || 0 }} {{ leave.days === 1 ? 'day' : 'days' }}
                </span>
              </template>

              <!-- Actions Column -->
              <template #actions="{ row: leave }">
                <div class="flex justify-end space-x-2">
                  <Link 
                    :href="route('leaves.show', leave.id)" 
                    class="text-indigo-600 hover:text-indigo-900"
                    title="View details"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </Link>
                </div>
              </template>

              <!-- Empty State -->
              <template #empty>
                <div class="text-center py-12">
                  <InboxIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No leaves found</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by creating a new leave request' }}
                  </p>
                </div>
              </template>
            </DataTable>

            <!-- Pagination -->
            <TablePagination 
              v-if="leaves.last_page > 1"
              :current-page="leaves.current_page"
              :last-page="leaves.last_page"
              :total="leaves.total"
              :per-page="localFilters.per_page"
              :from="leaves.from"
              :to="leaves.to"
              :links="leaves.links"
              @page-change="handlePageChange"
              @per-page-change="handlePerPageChange"
              class="border-t border-gray-200 px-6 py-4"
            />
          </ContentCard>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>

  <!-- Delete Confirmation Modal -->
  <ConfirmationModal
    :show="showDeleteModal"
    @close="showDeleteModal = false"
    @confirm="deleteLeave"
    title="Delete Leave Request"
    confirm-text="Delete"
    confirm-variant="danger"
  >
    <p>Are you sure you want to delete this leave request? This action cannot be undone.</p>
  </ConfirmationModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import TablePagination from '@/Components/Data/TablePagination.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import DateRangePicker from '@/Components/Base/DateRangePicker.vue';
import FilterChip from '@/Components/Data/FilterChip.vue';
import ConfirmationModal from '@/Components/Modals/ConfirmationModal.vue';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  PlusIcon,
  InboxIcon
} from '@heroicons/vue/24/outline';

const columns = [
  {
    key: 'employee',
    label: 'Employee',
    sortable: true,
    class: 'w-64',
    headerClass: 'pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
  },
  {
    key: 'leave_type',
    label: 'Leave Type & Dates',
    sortable: true,
    class: 'w-64',
    headerClass: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    class: 'w-32',
    headerClass: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    cellClass: 'px-6 py-4 whitespace-nowrap'
  },
  {
    key: 'days',
    label: 'Duration',
    sortable: true,
    class: 'w-24',
    headerClass: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    cellClass: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    class: 'w-24',
    headerClass: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider',
    cellClass: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium'
  }
];

const props = defineProps({
  leaves: {
    type: Object,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({
      status: [],
      leave_type_id: [],
      date_from: null,
      date_to: null,
      sort_field: 'created_at',
      sort_direction: 'desc',
      per_page: 10,
      search: ''
    })
  },
  leaveTypes: {
    type: Array,
    default: () => []
  },
  statuses: {
    type: Array,
    default: () => [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  }
});

console.log('Leaves data:', JSON.parse(JSON.stringify(props.leaves?.data)));

// Refs
const showDeleteModal = ref(false);
const showFilters = ref(true);
const loading = ref(false);
const leaveToDelete = ref(null);
const localFilters = ref({
  status: props.filters.status || [],
  leave_type_id: props.filters.leave_type_id || [],
  date_from: props.filters.date_from,
  date_to: props.filters.date_to,
  sort_field: props.filters.sort_field || 'created_at',
  sort_direction: props.filters.sort_direction || 'desc',
  per_page: props.filters.per_page || 10,
  search: props.filters.search || ''
});

// Computed
  const formattedLeaves = computed(() => {
    if (!props.leaves?.data) return [];
    return props.leaves.data.map(leave => {
      return {
        id: leave.id,
        employee_name: leave.employee.user.name,
        leave_type: leave.leave_type.name,
        from_date: leave.from_date,
        to_date: leave.to_date,
        status: leave.status,
        reason: leave.reason,
        // Add other properties as needed for display
      };
    });
  });

const statusOptions = computed(() => 
  props.statuses.map(status => ({
    value: status.value,
    name: status.label
  }))
);

const leaveTypeOptions = computed(() => 
  props.leaveTypes.map(type => ({
    value: type.id,
    name: type.name
  }))
);

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.status?.length > 0 ||
    localFilters.value.leave_type_id?.length > 0 ||
    localFilters.value.date_from ||
    localFilters.value.date_to ||
    localFilters.value.search
  );
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status || 'N/A';
};

const getStatusClasses = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getInitials = (name) => {
  if (!name) return '--';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// ... rest of the script remains the same until the applyFilters method

const applyFilters = () => {
  const params = { ...localFilters.value };
  
  // Remove empty or null values
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
      delete params[key];
    }
  });
  
  // Convert arrays to comma-separated strings for URL parameters
  if (params.status) {
    params.status = params.status.join(',');
  }
  if (params.leave_type_id) {
    params.leave_type_id = params.leave_type_id.join(',');
  }
  
  loading.value = true;
  router.get(route('leaves.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const clearDateRange = () => {
  localFilters.value.date_from = null;
  localFilters.value.date_to = null;
  applyFilters();
};

// ... rest of the script remains the same
</script>

<style scoped>
/* Add any custom styles here */
</style>