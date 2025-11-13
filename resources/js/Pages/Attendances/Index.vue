<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Time Tracking"
      subtitle="View and manage attendance records"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Header Actions -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Attendance Records</h3>
              <p class="mt-1 text-sm text-gray-600">
                View and manage attendance records.
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Search Field -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="localFilters.search"
                  type="text"
                  placeholder="Search by employee name or notes..."
                  class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @input="debouncedApplyFilters"
                />
              </div>
              
              <!-- Show Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
              </button>
            </div>
          </div>

          <!-- Filter Controls -->
          <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Employee Filter (Admin/HR only) -->
              <div v-if="isAdminOrHR">
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  v-model="localFilters.employee_id"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All employees</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.name }}
                  </option>
                </select>
              </div>
              
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="localFilters.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All statuses</option>
                  <option value="clocked_in">Clocked In</option>
                  <option value="clocked_out">Clocked Out</option>
                  <option value="on_break">On Break</option>
                </select>
              </div>

              <!-- Date From -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="localFilters.date_from"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                />
              </div>

              <!-- Date To -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  v-model="localFilters.date_to"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                />
              </div>


            </div>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
              <span class="text-sm font-medium text-gray-700">Active filters:</span>
              
              <span 
                v-if="localFilters.employee_id"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
              >
                Employee: {{ getEmployeeName(localFilters.employee_id) }}
                <button 
                  @click="clearFilter('employee_id')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500 focus:outline-none"
                >
                  <span class="sr-only">Remove employee filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span 
                v-if="localFilters.status"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Status: {{ formatStatus(localFilters.status) }}
                <button 
                  @click="clearFilter('status')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <span class="sr-only">Remove status filter</span>
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
                  @click="clearFilter('date_from')"
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
                  @click="clearFilter('date_to')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date to filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <button 
                @click="resetFilters"
                class="text-sm text-teal-600 hover:text-teal-800"
              >
                Clear all
              </button>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th v-if="isAdminOrHR" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="attendance in attendances.data" :key="attendance.id" class="hover:bg-gray-50">
                  <!-- Employee Column (Admin/HR only) -->
                  <td v-if="isAdminOrHR" class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-teal-700">
                            {{ getEmployeeInitials(attendance.employee?.user?.name) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ attendance.employee?.user?.name || 'N/A' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ attendance.employee?.employee_code || '' }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Date -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(attendance.date) }}
                  </td>

                  <!-- Clock In -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatTime(attendance.clock_in) }}
                  </td>

                  <!-- Clock Out -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatTime(attendance.clock_out) }}
                  </td>

                  <!-- Duration -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ attendance.work_duration_formatted || calculateDuration(attendance) }}
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusBadgeClasses(attendance.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatStatus(attendance.status) }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <Link
                        :href="route('attendances.show', attendance.id)"
                        class="text-teal-600 hover:text-teal-900"
                      >
                        View
                      </Link>
                      <Link
                        v-if="isAdminOrHR"
                        :href="route('attendances.edit', attendance.id)"
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>

                    </div>
                  </td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="attendances.data.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <Link 
                v-if="attendances.prev_page_url"
                :href="attendances.prev_page_url" 
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </Link>
              <Link 
                v-if="attendances.next_page_url"
                :href="attendances.next_page_url" 
                class="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </Link>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ attendances.from }}</span>
                  to
                  <span class="font-medium">{{ attendances.to }}</span>
                  of
                  <span class="font-medium">{{ attendances.total }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Link 
                    v-if="attendances.prev_page_url"
                    :href="attendances.prev_page_url"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </Link>
                  
                  <template v-for="link in attendances.links" :key="link.label">
                    <Link 
                      v-if="link.url && !link.label.includes('Previous') && !link.label.includes('Next')"
                      :href="link.url"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        link.active 
                          ? 'z-10 bg-teal-50 border-teal-500 text-teal-600' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      ]"
                    >
                      {{ link.label }}
                    </Link>
                  </template>
                  
                  <Link 
                    v-if="attendances.next_page_url"
                    :href="attendances.next_page_url"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
      </div>
    </PageLayout>


  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ManualClockOutModal from '@/Components/Attendance/ManualClockOutModal.vue';
import { useAuth } from '@/composables/useAuth.js';
import axios from 'axios';

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'clock-in') {
    axios.post('/api/attendance/clock-in').then(() => {
      window.location.href = route('dashboard');
    });
  }
});

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

const { hasAnyRole, user } = useAuth();

// Refs
const showFilters = ref(true);
const loading = ref(false);
const showManualClockOutModal = ref(false);
const selectedAttendance = ref(null);
const localFilters = ref({
  employee_id: props.queryParams.employee_id || '',
  status: props.queryParams.status || '',
  date_from: props.queryParams.date_from || '',
  date_to: props.queryParams.date_to || '',
  search: props.queryParams.search || ''
});

// Computed
const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));

const employees = computed(() => props.filters.employees || []);

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.employee_id ||
    localFilters.value.status ||
    localFilters.value.date_from ||
    localFilters.value.date_to ||
    localFilters.value.search
  );
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendance Management', current: true }
]);

const headerActions = computed(() => []);

// Helper functions
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
    let time;
    if (timeString.includes('T')) {
      time = new Date(timeString);
    } else if (timeString.includes(':')) {
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

const calculateDuration = (attendance) => {
  if (!attendance.clock_in || !attendance.clock_out) return '-';
  
  try {
    let clockIn, clockOut;
    
    if (attendance.clock_in.includes('T')) {
      clockIn = new Date(attendance.clock_in);
    } else {
      clockIn = new Date(`${attendance.date} ${attendance.clock_in}`);
    }
    
    if (attendance.clock_out.includes('T')) {
      clockOut = new Date(attendance.clock_out);
    } else {
      clockOut = new Date(`${attendance.date} ${attendance.clock_out}`);
    }
    
    if (isNaN(clockIn.getTime()) || isNaN(clockOut.getTime())) return '-';
    
    const diffMs = clockOut - clockIn;
    if (diffMs < 0) return '-';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  } catch (error) {
    return '-';
  }
};

const formatStatus = (status) => {
  const statusMap = {
    'clocked_in': 'Clocked In',
    'clocked_out': 'Clocked Out',
    'on_break': 'On Break'
  };
  return statusMap[status] || status || 'N/A';
};

const getStatusBadgeClasses = (status) => {
  const classes = {
    'clocked_in': 'bg-green-100 text-green-800',
    'clocked_out': 'bg-teal-100 text-teal-800',
    'on_break': 'bg-yellow-100 text-yellow-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getEmployeeInitials = (name) => {
  if (!name) return '--';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getEmployeeName = (employeeId) => {
  const employee = employees.value.find(emp => emp.id == employeeId);
  return employee ? employee.name : 'Unknown';
};

// Filter methods
const applyFilters = () => {
  const params = { ...localFilters.value };
  
  // Remove empty values
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '') {
      delete params[key];
    }
  });
  
  loading.value = true;
  router.get(route('attendances.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const debouncedApplyFilters = debounce(applyFilters, 300);

const clearFilter = (filterKey) => {
  localFilters.value[filterKey] = '';
  applyFilters();
};

const resetFilters = () => {
  localFilters.value = {
    employee_id: '',
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  };
  applyFilters();
};

// Manual Clock Out functions
const canManualClockOut = (attendance) => {
  // Show manual clock out button if:
  // 1. User is Admin/HR OR it's their own attendance
  // 2. Attendance is clocked in (not clocked out)
  // 3. Clock out is missing
  const isOwnAttendance = attendance.employee?.user?.id === user.value?.id;
  const canAccess = isAdminOrHR.value || isOwnAttendance;
  const hasNoClockOut = !attendance.clock_out || attendance.clock_out === null || attendance.clock_out === '-';
  const isActiveStatus = attendance.status === 'clocked_in' || attendance.status === 'on_break';
  
  // Debug logging
  console.log('Manual clock out check:', {
    attendanceId: attendance.id,
    employeeUserId: attendance.employee?.user?.id,
    currentUserId: user.value?.id,
    isOwnAttendance,
    isAdminOrHR: isAdminOrHR.value,
    canAccess,
    status: attendance.status,
    clockOut: attendance.clock_out,
    hasNoClockOut,
    isActiveStatus,
    finalResult: canAccess && isActiveStatus && hasNoClockOut
  });
  
  return canAccess && isActiveStatus && hasNoClockOut;
};

const openManualClockOut = (attendance) => {
  selectedAttendance.value = attendance;
  showManualClockOutModal.value = true;
};

const closeManualClockOut = () => {
  showManualClockOutModal.value = false;
  selectedAttendance.value = null;
};

const handleManualClockOutSuccess = (response) => {
  // Refresh the page to show updated data
  router.reload({
    preserveState: true,
    preserveScroll: true,
    onSuccess: () => {
      // Show success message
      alert(response.message || 'Manual clock out completed successfully');
    }
  });
};
</script>




