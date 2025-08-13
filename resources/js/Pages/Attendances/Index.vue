<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Time Tracking"
      subtitle="View and manage attendance records"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Main Content Layout with Sidebar -->
      <div class="flex gap-6">
        <!-- Main Content Area -->
        <div class="flex-1 min-w-0">
          <!-- Search Bar Section -->
          <ContentSection class="mb-6">
            <ContentCard>
              <SearchBar
                v-model="searchQuery"
                placeholder="Search by employee name, date, or status..."
                :suggestions="searchSuggestions"
                :loading="searchLoading"
                @search="handleSearch"
                @select="handleSearchSelect"
                class="w-full"
              />
            </ContentCard>
          </ContentSection>

          <!-- Active Filters Display (Mobile/Tablet) -->
          <div v-if="hasActiveFilters && (isMobile || isTablet)" class="mb-6">
            <ContentCard>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-neutral-700">Active Filters</h3>
                <button
                  @click="handleClearFilters"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="filter in activeFilterChips"
                  :key="filter.key"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                >
                  {{ filter.label }}: {{ filter.value }}
                  <button
                    @click="removeActiveFilter(filter)"
                    class="ml-1.5 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              </div>
            </ContentCard>
          </div>

          <!-- Time Tracking Data Table -->
          <ContentSection>
            <DataTable
              :data="attendances?.data || []"
              :columns="tableColumns"
              :loading="loading"
              :server-side-pagination="true"
              :current-page="attendances?.current_page || 1"
              :total-pages="attendances?.last_page || 1"
              :page-size="attendances?.per_page || 15"
              :total-items="attendances?.total || 0"
              :page-size-options="[10, 15, 25, 50, 100]"
              :selectable="isAdminOrHR"
              :selected-rows="selectedRows"
              :row-actions="getRowActions"
              :header-actions="tableHeaderActions"
              :empty-state="emptyState"
              :theme="'light'"
              striped
              hoverable
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange"
              @sort="handleSort"
              @row-click="handleRowClick"
              @row-action="handleRowAction"
              @header-action="handleHeaderAction"
              @selection-change="handleSelectionChange"
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
                      {{ row.employee?.employee_id || '' }}
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
          </ContentSection>
        </div>

        <!-- Right Sidebar - Filters -->
        <div class="w-80 flex-shrink-0 hidden lg:block">
          <div class="sticky top-6">
            <!-- Filter Panel -->
            <ContentCard class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-neutral-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                  Filters
                </h3>
                <button
                  v-if="hasActiveFilters"
                  @click="handleClearFilters"
                  class="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>

              <!-- Active Filters Display -->
              <div v-if="hasActiveFilters" class="mb-6 p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div class="text-sm font-medium text-primary-800 mb-2">Active Filters</div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="filter in activeFilterChips"
                    :key="filter.key"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700"
                  >
                    {{ filter.label }}: {{ filter.value }}
                    <button
                      @click="removeActiveFilter(filter)"
                      class="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- Filter Groups -->
              <div class="space-y-6">
                <!-- Date Range Filter -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Date Range
                  </label>
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="block text-xs text-neutral-600 mb-1">From</label>
                      <input
                        v-model="filters.date_range_from"
                        type="date"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        @change="handleFilterChange"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-neutral-600 mb-1">To</label>
                      <input
                        v-model="filters.date_range_to"
                        type="date"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        @change="handleFilterChange"
                      />
                    </div>
                  </div>
                </div>

                <!-- Status Filter -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Status
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="option in statusOptions"
                      :key="option.value"
                      class="flex items-center"
                    >
                      <input
                        v-model="filters.status"
                        type="checkbox"
                        :value="option.value"
                        class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                        @change="handleFilterChange"
                      />
                      <span class="ml-2 text-sm text-neutral-700 flex-1">{{ option.label }}</span>
                      <span class="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{{ option.count }}</span>
                    </label>
                  </div>
                </div>

                <!-- Department Filter (Admin/HR only) -->
                <div v-if="isAdminOrHR">
                  <label class="block text-sm font-medium text-neutral-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Department
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="option in departmentOptions"
                      :key="option.value"
                      class="flex items-center"
                    >
                      <input
                        v-model="filters.department"
                        type="checkbox"
                        :value="option.value"
                        class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                        @change="handleFilterChange"
                      />
                      <span class="ml-2 text-sm text-neutral-700 flex-1">{{ option.label }}</span>
                      <span class="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{{ option.count }}</span>
                    </label>
                  </div>
                </div>

                <!-- Duration Filter -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Work Duration
                  </label>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-sm text-neutral-600">
                      <span>0h</span>
                      <span class="font-medium text-primary-600">{{ filters.duration }}h</span>
                      <span>12h</span>
                    </div>
                    <input
                      v-model="filters.duration"
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      class="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                      @input="handleFilterChange"
                    />
                    <div class="text-center text-xs text-neutral-500">
                      Minimum {{ filters.duration }} hours
                    </div>
                  </div>
                </div>
              </div>

              <!-- Filter Actions -->
              <div class="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
                <button
                  @click="handleResetFilters"
                  class="text-sm text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
                  :disabled="!hasActiveFilters"
                >
                  Reset
                </button>
                <button
                  @click="handleApplyFilters(filters)"
                  class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </ContentCard>

            <!-- Filter Presets (Admin/HR only) -->
            <ContentCard v-if="isAdminOrHR && filterPresets.length > 0">
              <h4 class="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                Saved Filters
              </h4>
              <div class="space-y-2">
                <button
                  v-for="preset in filterPresets"
                  :key="preset.id"
                  @click="handleLoadPreset(preset)"
                  class="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-neutral-700 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-colors duration-200"
                >
                  <span>{{ preset.name }}</span>
                  <button
                    @click.stop="handleDeletePreset(preset.id)"
                    class="text-neutral-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </button>
              </div>
              
              <button
                v-if="hasActiveFilters"
                @click="showSavePresetModal = true"
                class="w-full mt-3 px-3 py-2 text-sm text-primary-600 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors duration-200"
              >
                Save Current Filters
              </button>
            </ContentCard>
          </div>
        </div>

        <!-- Mobile Filter Toggle Button -->
        <button
          v-if="isMobile || isTablet"
          @click="showMobileFilters = true"
          class="fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors duration-200 lg:hidden"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
        </button>
      </div>

      <!-- Bulk Export Modal -->
      <div v-if="showBulkExportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium text-neutral-900 mb-4">Bulk Export Attendance</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
              <input
                v-model="bulkExport.start_date"
                type="date"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
              <input
                v-model="bulkExport.end_date"
                type="date"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showBulkExportModal = false"
              class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              @click="performBulkExport"
              :disabled="!bulkExport.start_date || !bulkExport.end_date"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useSearch } from '@/composables/useSearch';
import { useFilters } from '@/composables/useFilters';
import { useResponsive } from '@/composables/useResponsive';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import SearchBar from '@/Components/Search/SearchBar.vue';
import FilterPanel from '@/Components/Search/FilterPanel.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const props = defineProps({
  attendances: Object,
});

const { user, roles, hasRole, hasAnyRole } = useAuth();
const isSubmitting = ref(false);
const loading = ref(false);
const selectedRows = ref([]);

// Convert roles array to role names for compatibility
const userRoles = computed(() => {
  try {
    return roles.value.map(role => typeof role === 'string' ? role : role.name);
  } catch (error) {
    console.error('Error processing user roles:', error);
    return [];
  }
});

const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));
const canClockInOut = computed(() => hasRole('Employee'));

// Search functionality
const searchQuery = ref('');
const searchSuggestions = ref([]);
const searchLoading = ref(false);

// Initialize search composable
const {
  search,
  clearSearch,
  highlightMatches
} = useSearch({
  searchFn: async (options) => {
    // This would typically call an API endpoint
    // For now, we'll simulate search suggestions
    const suggestions = [
      { id: 1, text: 'John Doe', category: 'Employee' },
      { id: 2, text: 'Clocked In', category: 'Status' },
      { id: 3, text: 'Today', category: 'Date' }
    ];
    return { results: [], suggestions };
  },
  debounceMs: 300,
  minSearchLength: 2
});

// Filter configuration
const filterGroups = computed(() => [
  {
    key: 'date_range',
    label: 'Date Range',
    type: 'daterange',
    icon: 'calendar'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'checkbox',
    icon: 'status',
    options: [
      { value: 'clocked_in', label: 'Clocked In', count: 15 },
      { value: 'clocked_out', label: 'Clocked Out', count: 45 },
      { value: 'on_break', label: 'On Break', count: 3 },
      { value: 'absent', label: 'Absent', count: 2 }
    ]
  },
  ...(isAdminOrHR.value ? [{
    key: 'department',
    label: 'Department',
    type: 'checkbox',
    icon: 'building',
    options: [
      { value: 'engineering', label: 'Engineering', count: 25 },
      { value: 'marketing', label: 'Marketing', count: 12 },
      { value: 'sales', label: 'Sales', count: 18 },
      { value: 'hr', label: 'Human Resources', count: 8 }
    ]
  }] : []),
  {
    key: 'duration',
    label: 'Work Duration (hours)',
    type: 'range',
    min: 0,
    max: 12,
    step: 0.5,
    icon: 'clock'
  }
]);

const initialFilters = ref({
  date_range_from: '',
  date_range_to: '',
  status: [],
  department: [],
  duration: 8
});

// Initialize filters composable
const {
  filters,
  appliedFilters,
  filterPresets,
  hasActiveFilters,
  applyFilters: applyFiltersComposable,
  clearAllFilters,
  savePreset,
  loadPreset,
  deletePreset
} = useFilters({
  filterGroups: filterGroups.value,
  initialFilters: initialFilters.value,
  syncWithUrl: true,
  enablePresets: true,
  presetsKey: 'attendance-filter-presets'
});

// Table configuration
const tableColumns = computed(() => {
  const baseColumns = [
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      minWidth: '120px',
      priority: 'high',
      formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
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

const tableHeaderActions = computed(() => {
  const actions = [];
  
  if (isAdminOrHR.value) {
    actions.push(
      {
        id: 'bulk-export',
        label: 'Bulk Export',
        icon: 'download',
        variant: 'secondary',
        handler: () => showBulkExportModal.value = true
      },
      {
        id: 'bulk-approve',
        label: 'Bulk Approve',
        icon: 'check',
        variant: 'primary',
        handler: handleBulkApprove,
        disabled: selectedRows.value.length === 0
      }
    );
  }
  
  return actions;
});

const emptyState = computed(() => ({
  title: hasActiveFilters.value ? 'No matching records' : 'No attendance records',
  description: hasActiveFilters.value 
    ? 'Try adjusting your search or filter criteria'
    : 'No attendance records have been created yet',
  icon: 'clock',
  actions: hasActiveFilters.value ? [
    {
      label: 'Clear Filters',
      handler: handleClearFilters,
      variant: 'secondary'
    }
  ] : []
}));

// Filter and modal state (legacy)
const showBulkExportModal = ref(false);
const bulkExport = ref({
  start_date: '',
  end_date: ''
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
        handler: clockIn,
        disabled: isSubmitting.value
      },
      {
        id: 'clock-out',
        label: 'Clock Out',
        variant: 'danger', 
        handler: clockOut,
        disabled: isSubmitting.value
      }
    );
  }
  
  return actions;
});

const clockIn = () => {
  isSubmitting.value = true;
  router.post(route('attendances.clockIn'), {}, {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};

const clockOut = () => {
  isSubmitting.value = true;
  router.post(route('attendances.clockOut'), {}, {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};

// Action methods for attendance records
const viewDetails = (attendance) => {
  if (!attendance || !attendance.id) {
    console.error('Invalid attendance object or missing ID');
    return;
  }
  
  // Navigate to attendance details page
  router.visit(route('attendances.show', attendance.id));
};

const canClockOut = (attendance) => {
  // Check if user can clock out this record
  // Must be current user's record and not already clocked out
  return !attendance.clock_out && 
         attendance.employee_id === user.value?.employee?.id &&
         canClockInOut.value;
};

const clockOutRecord = (attendance) => {
  if (!confirm('Are you sure you want to clock out this record?')) {
    return;
  }
  
  isSubmitting.value = true;
  router.post(route('attendances.clockOut'), {}, {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};

const exportRecord = (attendance) => {
  // Export individual attendance record
  window.open(route('attendances.export', attendance.id), '_blank');
};

const deleteRecord = (attendance) => {
  if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
    return;
  }
  
  isSubmitting.value = true;
  router.delete(route('attendances.destroy', attendance.id), {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};

// Filter and formatting methods
const applyFilters = () => {
  const params = {};
  
  if (filters.value.start_date) params.start_date = filters.value.start_date;
  if (filters.value.end_date) params.end_date = filters.value.end_date;
  if (filters.value.status) params.status = filters.value.status;
  
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const clearFilters = () => {
  filters.value = {
    start_date: '',
    end_date: '',
    status: ''
  };
  
  router.get(route('attendances.index'), {}, {
    preserveState: true,
    preserveScroll: true
  });
};

const performBulkExport = () => {
  if (!bulkExport.value.start_date || !bulkExport.value.end_date) {
    alert('Please select both start and end dates');
    return;
  }
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = route('attendances.bulkExport');
  
  // Add CSRF token
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
  }
  
  // Add form data
  const startDateInput = document.createElement('input');
  startDateInput.type = 'hidden';
  startDateInput.name = 'start_date';
  startDateInput.value = bulkExport.value.start_date;
  form.appendChild(startDateInput);
  
  const endDateInput = document.createElement('input');
  endDateInput.type = 'hidden';
  endDateInput.name = 'end_date';
  endDateInput.value = bulkExport.value.end_date;
  form.appendChild(endDateInput);
  
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  
  showBulkExportModal.value = false;
};

// Helper formatting functions
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return '—';
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

const calculateDuration = (attendance) => {
  if (!attendance.clock_in) return '—';
  
  const clockIn = new Date(attendance.clock_in);
  const clockOut = attendance.clock_out ? new Date(attendance.clock_out) : new Date();
  
  const diffMs = clockOut - clockIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

const getStatusBadgeClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const colorMap = {
    'clocked_in': 'bg-green-100 text-green-800',
    'clocked_out': 'bg-blue-100 text-blue-800',
    'on_break': 'bg-orange-100 text-orange-800',
    'absent': 'bg-red-100 text-red-800'
  };
  
  return `${baseClasses} ${colorMap[status] || 'bg-neutral-100 text-neutral-800'}`;
};

// New integrated design system event handlers
const handleSearch = (query) => {
  searchQuery.value = query;
  // Trigger search with current filters
  performSearch();
};

const handleSearchSelect = (suggestion) => {
  searchQuery.value = suggestion.text || suggestion.label;
  performSearch();
};

const handleApplyFilters = (filterData) => {
  // Apply filters and refresh data
  const params = buildFilterParams(filterData);
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleClearFilters = () => {
  clearAllFilters();
  router.get(route('attendances.index'), {}, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleSavePreset = (preset) => {
  savePreset(preset);
};

const handleLoadPreset = (preset) => {
  loadPreset(preset);
  const params = buildFilterParams(preset.filters);
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleDeletePreset = (presetId) => {
  deletePreset(presetId);
};

// DataTable event handlers
const handlePageChange = (page) => {
  const params = getCurrentParams();
  params.page = page;
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const handlePageSizeChange = (size) => {
  const params = getCurrentParams();
  params.per_page = size;
  params.page = 1; // Reset to first page
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleSort = (sortConfig) => {
  const params = getCurrentParams();
  params.sort = sortConfig.key;
  params.direction = sortConfig.direction;
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleRowClick = (row) => {
  viewDetails(row);
};

const handleRowAction = ({ action, row }) => {
  switch (action.id) {
    case 'view':
      viewDetails(row);
      break;
    case 'edit':
      router.visit(route('attendances.edit', row.id));
      break;
    case 'clock-out':
      clockOutRecord(row);
      break;
    case 'export':
      exportRecord(row);
      break;
    case 'delete':
      deleteRecord(row);
      break;
  }
};

const handleHeaderAction = (action) => {
  if (action.handler) {
    action.handler();
  }
};

const handleSelectionChange = (newSelection) => {
  selectedRows.value = newSelection;
};

const handleBulkApprove = () => {
  if (selectedRows.value.length === 0) {
    alert('Please select records to approve');
    return;
  }
  
  if (!confirm(`Are you sure you want to approve ${selectedRows.value.length} attendance records?`)) {
    return;
  }
  
  const ids = selectedRows.value.map(row => row.id);
  
  router.post(route('attendances.bulkApprove'), {
    attendance_ids: ids
  }, {
    onSuccess: () => {
      selectedRows.value = [];
    }
  });
};

// Helper methods
const performSearch = () => {
  const params = getCurrentParams();
  if (searchQuery.value) {
    params.search = searchQuery.value;
  } else {
    delete params.search;
  }
  params.page = 1; // Reset to first page
  
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const buildFilterParams = (filterData) => {
  const params = {};
  
  Object.entries(filterData).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      params[key] = value.join(',');
    } else if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });
  
  return params;
};

const getCurrentParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

const getRowActions = (row) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      disabled: false
    }
  ];
  
  if (isAdminOrHR.value) {
    actions.push({
      id: 'edit',
      label: 'Edit Record',
      icon: 'pencil',
      disabled: false
    });
  }
  
  if (canClockOut(row)) {
    actions.push({
      id: 'clock-out',
      label: 'Clock Out',
      icon: 'clock',
      disabled: isSubmitting.value
    });
  }
  
  if (isAdminOrHR.value) {
    actions.push({
      id: 'export',
      label: 'Export Record',
      icon: 'download',
      disabled: false
    });
  }
  
  if (hasRole('Admin')) {
    actions.push({
      id: 'delete',
      label: 'Delete Record',
      icon: 'trash',
      disabled: false,
      variant: 'danger'
    });
  }
  
  return actions;
};

const getEmployeeInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatBreakTime = (breakTime) => {
  if (!breakTime) return '—';
  
  // Assuming breakTime is in minutes
  const hours = Math.floor(breakTime / 60);
  const minutes = breakTime % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Initialize search suggestions based on current data
const updateSearchSuggestions = () => {
  if (!props.attendances?.data) return;
  
  const suggestions = [];
  const employees = new Set();
  const statuses = new Set();
  
  props.attendances.data.forEach(attendance => {
    if (attendance.employee?.user?.name) {
      employees.add(attendance.employee.user.name);
    }
    if (attendance.status) {
      statuses.add(attendance.status);
    }
  });
  
  // Add employee suggestions
  employees.forEach(name => {
    suggestions.push({
      id: `employee-${name}`,
      text: name,
      category: 'Employee',
      icon: 'user'
    });
  });
  
  // Add status suggestions
  statuses.forEach(status => {
    suggestions.push({
      id: `status-${status}`,
      text: formatStatus(status),
      category: 'Status',
      icon: 'status'
    });
  });
  
  searchSuggestions.value = suggestions;
};

// Lifecycle
onMounted(() => {
  updateSearchSuggestions();
});
</script>

<style scoped>
.attendance-page {
  @apply min-h-screen bg-neutral-50 py-8;
}
</style>