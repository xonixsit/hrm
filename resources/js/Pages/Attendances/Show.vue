<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Attendance Details"
      :subtitle="`${attendance.employee?.user?.name || 'Employee'} - ${formatDate(attendance.date)}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="space-y-8">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            :label="`Work Duration`"
            :value="formattedWorkDuration"
            format="text"
            icon="ClockIcon"
            iconColor="info"
            class="transform hover:scale-105 transition-transform duration-200"
          >
            <div class="text-xs text-gray-500 mt-1">
              {{ workDurationSubtitle }}
            </div>
          </StatsCard>
          <StatsCard
            :label="`Break Duration`"
            :value="formattedBreakDuration"
            format="text"
            icon="PauseIcon"
            iconColor="warning"
            class="transform hover:scale-105 transition-transform duration-200"
          >
            <div class="text-xs text-gray-500 mt-1">
              {{ breakDurationSubtitle }}
            </div>
          </StatsCard>
          <StatsCard
            :label="`Break Sessions`"
            :value="breakSessions.length.toString()"
            icon="ListBulletIcon"
            iconColor="success"
            class="transform hover:scale-105 transition-transform duration-200"
          >
            <div class="text-xs text-gray-500 mt-1">
              {{ breakSessionsSubtitle }}
            </div>
          </StatsCard>
          <StatsCard
            :label="`Status`"
            :value="formatStatus(attendance.status)"
            icon="CheckCircleIcon"
            :iconColor="getStatusColor(attendance.status)"
            class="transform hover:scale-105 transition-transform duration-200"
          >
            <div class="text-xs text-gray-500 mt-1">
              {{ statusSubtitle }}
            </div>
          </StatsCard>
        </div>

        <!-- Main Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <!-- Time Details -->
          <ContentCard title="Time Details" class="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="space-y-1">
              <div class="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <CalendarIcon class="w-4 h-4 text-gray-500" />
                  <span class="text-sm font-medium text-gray-700">Date</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ formatDate(attendance.date) }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <ArrowRightOnRectangleIcon class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-green-700">Clock In</span>
                </div>
                <span class="text-sm font-semibold text-green-900">
                  {{ attendance.clock_in ? formatTime(attendance.clock_in) : '—' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <ArrowLeftOnRectangleIcon class="w-4 h-4 text-red-600" />
                  <span class="text-sm font-medium text-red-700">Clock Out</span>
                </div>
                <span class="text-sm font-semibold text-red-900">
                  {{ attendance.clock_out ? formatTime(attendance.clock_out) : '—' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                <div class="flex items-center space-x-2">
                  <ClockIcon class="w-4 h-4 text-teal-600" />
                  <span class="text-sm font-medium text-teal-700">Total Work Time</span>
                </div>
                <span class="text-lg font-bold text-teal-900">{{ workDuration || '0h 0m' }}</span>
              </div>
            </div>
          </ContentCard>

          <!-- Manual Clock Out Section -->
          <ContentCard 
            v-if="canManualClockOut" 
            title="Manual Clock Out" 
            class="shadow-sm hover:shadow-md transition-shadow duration-200 border-orange-200 bg-orange-50"
          >
            <div class="space-y-4">
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div class="flex items-start space-x-2">
                  <ExclamationTriangleIcon class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-amber-800">Manual Clock Out Required</p>
                    <p class="text-xs text-amber-700 mt-1">
                      This employee is still clocked in. You can manually clock them out by setting the clock out time below.
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Clock Out Time
                  </label>
                  <input 
                    v-model="clockOutTime" 
                    type="datetime-local" 
                    :min="getMinDateTime()" 
                    :max="getMaxDateTime()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required 
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Must be after clock-in time ({{ formatTime(attendance.clock_in) }}) and not in the future.
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Manual Clock Out
                  </label>
                  <textarea 
                    v-model="clockOutReason" 
                    rows="3"
                    placeholder="Please provide a reason for the manual clock out (e.g., forgot to clock out, system issue, etc.)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm resize-none"
                    required
                  ></textarea>
                </div>

                <div class="flex items-center justify-end space-x-3">
                  <button
                    @click="resetClockOutForm"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    @click="handleManualClockOut"
                    :disabled="!isClockOutFormValid || processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="processing" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                    <span v-else>Clock Out Employee</span>
                  </button>
                </div>
              </div>
            </div>
          </ContentCard>

          <!-- Break Sessions -->
          <ContentCard title="Break Sessions" class="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div v-if="breakSessions.length === 0" class="text-center py-12">
              <PauseIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 font-medium">No break sessions recorded</p>
              <p class="text-sm text-gray-400 mt-1">All work time was continuous</p>
            </div>
            <div v-else class="space-y-3">
              <!-- Total Break Time Summary -->
              <div class="p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border-2 border-orange-300 mb-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <PauseIcon class="w-5 h-5 text-orange-600" />
                    <span class="text-sm font-semibold text-orange-900">Total Break Time</span>
                  </div>
                  <span class="text-lg font-bold text-orange-900">{{ totalBreakTimeFormatted }}</span>
                </div>
                <p class="text-xs text-orange-700 mt-1">{{ breakSessions.length }} break session{{ breakSessions.length !== 1 ? 's' : '' }}</p>
              </div>

              <!-- Individual Break Sessions -->
              <div
                v-for="(session, index) in breakSessions"
                :key="index"
                class="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-150"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-orange-700">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-orange-900">Break {{ index + 1 }}</p>
                    <p class="text-xs text-orange-700">
                      {{ formatTime(session.start) }} - {{ session.end ? formatTime(session.end) : 'Ongoing' }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-neutral-900">
                    {{ formatBreakDuration(session) }}
                  </p>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>

        <!-- Additional Information -->
        <ContentCard title="Additional Information">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Employee</span>
                <span class="text-sm text-neutral-900">{{ attendance.employee?.user?.name || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">IP Address</span>
                <span class="text-sm text-neutral-900">{{ attendance.ip_address || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Location</span>
                <span class="text-sm text-neutral-900">{{ attendance.location || '—' }}</span>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Created</span>
                <span class="text-sm text-neutral-900">{{ formatDateTime(attendance.created_at) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Last Updated</span>
                <span class="text-sm text-neutral-900">{{ formatDateTime(attendance.updated_at) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Notes</span>
                <span class="text-sm text-neutral-900">{{ attendance.notes || '—' }}</span>
              </div>
            </div>
          </div>
        </ContentCard>

        <!-- Edit History -->
        <ContentCard v-if="attendance.editor" title="Edit History">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600" />
              <div>
                <p class="text-sm font-medium text-yellow-800">This record has been edited</p>
                <p class="text-sm text-yellow-700">
                  Last edited by {{ attendance.editor.name }} on {{ formatDateTime(attendance.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import { useAuth } from '@/composables/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  PauseIcon,
  ListBulletIcon,
  CheckCircleIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  attendance: Object,
  workDuration: String,
  breakDuration: String,
  totalMinutes: Number,
  breakSessions: Array
});

const { user, hasRole, hasAnyRole } = useAuth();

const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));

// Clock out functionality
const clockOutTime = ref('');
const clockOutReason = ref('');
const processing = ref(false);

// Manual clock out computed properties
const canManualClockOut = computed(() => {
  // Show manual clock out if:
  // 1. User is Admin/HR OR it's their own attendance
  // 2. Employee is still clocked in (no clock_out time)
  // 3. Attendance is not already clocked out
  const isOwnAttendance = user.value?.employee?.id === props.attendance.employee_id;
  const canEdit = isAdminOrHR.value || isOwnAttendance;
  const isStillClockedIn = !props.attendance.clock_out && props.attendance.status !== 'clocked_out';
  
  return canEdit && isStillClockedIn;
});

const isClockOutFormValid = computed(() => {
  return clockOutTime.value && clockOutReason.value.trim().length >= 10;
});

// Breadcrumbs configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendance Management', href: route('attendances.index') },
  { label: 'Details', current: true }
]);

// Header actions
const headerActions = computed(() => {
  const actions = [];
  
  if (isAdminOrHR.value) {
    actions.push(
      {
        id: 'edit',
        label: 'Edit Record',
        variant: 'primary',
        handler: () => router.visit(route('attendances.edit', props.attendance.id))
      },
      {
        id: 'export',
        label: 'Export',
        variant: 'secondary',
        handler: () => window.open(route('attendances.export', props.attendance.id), '_blank')
      }
    );
  }
  
  if (hasRole('Admin')) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      handler: deleteRecord
    });
  }
  
  return actions;
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // Fix timezone issue by treating date as local date, not UTC
  // For date strings like "2025-10-30", add time to force local timezone
  const date = new Date(dateString + 'T12:00:00'); // Add noon time to avoid timezone shifts
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  
  try {
    // The timeString comes from database as UTC (e.g., "2025-11-04T06:46:00.000000Z")
    // We need to display it in PST
    const date = new Date(timeString);
    
    // Convert UTC to PST for display
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles' // This converts UTC to PST
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'N/A';
  }
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatStatus = (status) => {
  const statusMap = {
    'clocked_in': 'Clocked In',
    'clocked_out': 'Clocked Out',
    'on_break': 'On Break'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    'clocked_in': 'success',
    'clocked_out': 'secondary',
    'on_break': 'warning'
  };
  return colors[status] || 'secondary';
};

// Enhanced computed properties for better stats display
const formattedWorkDuration = computed(() => {
  if (!props.workDuration || props.workDuration === '0h 0m') {
    return '0 hours';
  }
  
  // If it already contains 'h', return as-is (it's already formatted)
  if (props.workDuration && props.workDuration.includes('h')) {
    return props.workDuration;
  }
  
  // Convert duration like "10" to "10h 0m" format
  const hours = parseInt(props.workDuration);
  return isNaN(hours) ? '0 hours' : `${hours}h 0m`;
});

const workDurationSubtitle = computed(() => {
  if (!props.attendance.clock_in) return 'No clock in recorded';
  
  const clockIn = formatTime(props.attendance.clock_in);
  const clockOut = props.attendance.clock_out ? formatTime(props.attendance.clock_out) : 'Still working';
  
  return `${clockIn} - ${clockOut}`;
});

const formattedBreakDuration = computed(() => {
  if (!props.breakDuration || props.breakDuration === '-' || props.breakDuration === '0h 0m') {
    return '0 minutes';
  }
  
  // If it already contains time format, return as-is
  if (props.breakDuration && (props.breakDuration.includes('h') || props.breakDuration.includes('m'))) {
    return props.breakDuration;
  }
  
  return props.breakDuration;
});

const breakDurationSubtitle = computed(() => {
  const sessionCount = props.breakSessions.length;
  if (sessionCount === 0) return 'No breaks taken';
  if (sessionCount === 1) return '1 break session';
  return `${sessionCount} break sessions`;
});

const breakSessionsSubtitle = computed(() => {
  const count = props.breakSessions.length;
  if (count === 0) return 'Continuous work';
  if (count === 1) return 'Single break taken';
  return 'Multiple breaks';
});

const statusSubtitle = computed(() => {
  const status = props.attendance.status;
  const now = new Date();
  
  switch (status) {
    case 'clocked_in':
      if (props.attendance.clock_in) {
        const clockInTime = formatTime(props.attendance.clock_in);
        return `Since ${clockInTime}`;
      }
      return 'Currently working';
    case 'clocked_out':
      if (props.attendance.clock_out) {
        const clockOutTime = formatTime(props.attendance.clock_out);
        return `At ${clockOutTime}`;
      }
      return 'Work completed';
    case 'on_break':
      return 'Currently on break';
    default:
      return 'Status unknown';
  }
});

// Format break session duration
const formatBreakDuration = (session) => {
  if (!session.start || !session.end) {
    return '—';
  }
  
  // Always calculate duration from start and end times for accuracy
  try {
    const start = new Date(session.start);
    const end = new Date(session.end);
    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch (error) {
    console.error('Error calculating break duration:', error);
    return '—';
  }
};

// Calculate total break time
const totalBreakTimeFormatted = computed(() => {
  if (!props.breakSessions || props.breakSessions.length === 0) {
    return '0m';
  }
  
  let totalMinutes = 0;
  
  props.breakSessions.forEach(session => {
    if (session.start && session.end) {
      try {
        const start = new Date(session.start);
        const end = new Date(session.end);
        const diffMs = end - start;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        totalMinutes += diffMinutes;
      } catch (error) {
        console.error('Error calculating break duration for session:', session, error);
      }
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

const deleteRecord = () => {
  if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
    return;
  }
  
  router.delete(route('attendances.destroy', props.attendance.id), {
    onSuccess: () => {
      router.visit(route('attendances.index'));
    }
  });
};

// Manual clock out methods
const getMinDateTime = () => {
  if (!props.attendance?.clock_in) return '';

  try {
    const clockIn = new Date(props.attendance.clock_in);
    // Add 1 minute to ensure clock out is after clock in
    clockIn.setMinutes(clockIn.getMinutes() + 1);
    return clockIn.toISOString().slice(0, 16);
  } catch (error) {
    return '';
  }
};

const getMaxDateTime = () => {
  const attendanceDate = props.attendance?.date;
  if (!attendanceDate) return new Date().toISOString().slice(0, 16);
  
  // Use the attendance date directly (it's already in YYYY-MM-DD format)
  const attendanceDateString = attendanceDate;
  
  // For past dates, allow up to end of that day (11:59 PM)
  return `${attendanceDateString}T23:59`;
};

const resetClockOutForm = () => {
  // Set default clock out time based on attendance date
  const attendanceDate = props.attendance?.date;
  if (!attendanceDate) {
    clockOutTime.value = new Date().toISOString().slice(0, 16);
    clockOutReason.value = '';
    return;
  }

  // Use the attendance date directly (it's already in YYYY-MM-DD format)
  const attendanceDateString = attendanceDate;
  
  // Calculate default clock out time based on clock in time
  let defaultTime;
  
  if (props.attendance?.clock_in) {
    try {
      // Parse the clock in time and add 8 hours as default work duration
      const clockInTime = new Date(props.attendance.clock_in);
      const defaultClockOut = new Date(clockInTime.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
      
      // Format as datetime-local input format
      const year = defaultClockOut.getFullYear();
      const month = String(defaultClockOut.getMonth() + 1).padStart(2, '0');
      const day = String(defaultClockOut.getDate()).padStart(2, '0');
      const hours = String(defaultClockOut.getHours()).padStart(2, '0');
      const minutes = String(defaultClockOut.getMinutes()).padStart(2, '0');
      
      defaultTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error calculating default clock out time:', error);
      // Fallback to 6 PM on attendance date
      defaultTime = `${attendanceDateString}T18:00`;
    }
  } else {
    // No clock in time, use 6 PM as default
    defaultTime = `${attendanceDateString}T18:00`;
  }
  
  clockOutTime.value = defaultTime;
  clockOutReason.value = '';
};

const handleManualClockOut = async () => {
  if (!isClockOutFormValid.value) return;

  processing.value = true;

  try {
    const response = await axios.post(route('attendances.manual-clock-out'), {
      attendance_id: props.attendance.id,
      clock_out_time: clockOutTime.value,
      reason: clockOutReason.value.trim()
    });

    if (response.data.success) {
      // Refresh the page to show updated data
      router.visit(route('attendances.show', props.attendance.id), {
        onSuccess: () => {
          alert('Employee clocked out successfully!');
        }
      });
    } else {
      alert(response.data.message || 'Failed to clock out');
    }
  } catch (error) {
    console.error('Clock out error:', error);
    alert(error.response?.data?.message || 'An error occurred while clocking out');
  } finally {
    processing.value = false;
  }
};

// Initialize clock out form when component mounts
onMounted(() => {
  resetClockOutForm();
});
</script>