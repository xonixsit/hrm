<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Attendance Record"
      subtitle="Update attendance record details and timing information"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Employee Information -->
      <div v-if="attendance.employee?.user" class="mb-6 bg-white shadow-sm rounded-lg border border-neutral-200">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span class="text-xl font-bold text-white">
                  {{ getInitials(attendance.employee.user.name) }}
                </span>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="text-lg font-medium text-gray-900">{{ attendance.employee.user.name }}</h4>
              <p class="text-sm text-gray-600">{{ attendance.employee.user.email }}</p>
              <div class="flex items-center mt-2 space-x-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Employee ID: {{ attendance.employee.employee_code || 'N/A' }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Date: {{ formatDate(attendance.date) }}
                </span>
                <span :class="getStatusBadgeClasses(attendance.status)">
                  {{ formatStatus(attendance.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Attendance Summary -->
      <div class="mb-6 bg-white shadow-sm rounded-lg border border-neutral-200">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Current Record Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ workDuration }}</div>
              <div class="text-sm text-blue-800">Work Duration</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ breakDuration }}</div>
              <div class="text-sm text-green-800">Break Duration</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ breakSessionsCount }}</div>
              <div class="text-sm text-purple-800">Break Sessions</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ attendance.location ? 'Yes' : 'No' }}</div>
              <div class="text-sm text-orange-800">Location Tracked</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white shadow-sm rounded-lg border border-neutral-200">
        <FormLayout
          title="Update Attendance Record"
          description="Modify the attendance timing and additional information"
          :errors="form.errors"
          :is-submitting="form.processing"
          :actions="formActions"
          variant="card"
          @submit="handleSubmit"
          @action="handleFormAction"
        >
          <div class="space-y-6">
            <!-- Time Information Section -->
            <FormSection title="Time Information" description="Update clock in/out times">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Clock In Time"
                  :error="form.errors.clock_in"
                  required
                >
                  <input
                    v-model="form.clock_in"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :class="{ 'border-red-500': form.errors.clock_in }"
                    required
                  />
                </FormField>

                <FormField
                  label="Clock Out Time"
                  :error="form.errors.clock_out"
                  description="Leave empty if still clocked in"
                >
                  <input
                    v-model="form.clock_out"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :class="{ 'border-red-500': form.errors.clock_out }"
                    :min="form.clock_in"
                  />
                </FormField>
              </div>

              <!-- Time Validation Warning -->
              <div v-if="timeValidationWarning" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <h4 class="text-sm font-medium text-yellow-800">Time Validation Warning</h4>
                    <p class="text-sm text-yellow-700 mt-1">{{ timeValidationWarning }}</p>
                  </div>
                </div>
              </div>
            </FormSection>

            <!-- Additional Information Section -->
            <FormSection title="Additional Information" description="Add notes or comments about this attendance record">
              <FormField
                label="Notes"
                :error="form.errors.notes"
                description="Add any relevant notes about this attendance record"
              >
                <textarea
                  v-model="form.notes"
                  rows="4"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  :class="{ 'border-red-500': form.errors.notes }"
                  placeholder="Add any notes about this attendance record..."
                ></textarea>
                <p class="text-xs text-neutral-500 mt-1">
                  {{ form.notes?.length || 0 }}/500 characters
                </p>
              </FormField>
            </FormSection>
          </div>
        </FormLayout>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useForm, router } from '@inertiajs/vue3';
import { useNotifications } from '@/composables/useNotifications';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';

const props = defineProps({
  attendance: {
    type: Object,
    required: true
  }
});

const { showNotification } = useNotifications();

// Debug logging
console.log('Attendance data received:', props.attendance);

// Helper functions
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '';
  
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

const getStatusBadgeClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const statusClasses = {
    'clocked_in': 'bg-green-100 text-green-800',
    'clocked_out': 'bg-gray-100 text-gray-800',
    'on_break': 'bg-yellow-100 text-yellow-800'
  };
  return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '--';
  }
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Form setup
const form = useForm({
  clock_in: formatDateTimeForInput(props.attendance.clock_in),
  clock_out: formatDateTimeForInput(props.attendance.clock_out),
  notes: props.attendance.notes || '',
});

// Duration calculation functions
const calculateWorkDuration = () => {
  if (!props.attendance.clock_in) return '0h 0m';
  
  const clockIn = new Date(props.attendance.clock_in);
  const clockOut = props.attendance.clock_out ? new Date(props.attendance.clock_out) : null;
  
  if (isNaN(clockIn.getTime())) {
    return '0h 0m';
  }
  
  // If no clock out, don't calculate work duration (still working)
  if (!clockOut) {
    return 'Still Working';
  }
  
  if (isNaN(clockOut.getTime())) {
    return '0h 0m';
  }
  
  // Calculate total minutes
  const totalMinutes = Math.floor((clockOut - clockIn) / (1000 * 60));
  
  // Subtract break minutes
  const breakMinutes = props.attendance.total_break_minutes || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMinutes);
  
  const hours = Math.floor(workMinutes / 60);
  const minutes = workMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

const calculateBreakDuration = () => {
  const breakMinutes = props.attendance.total_break_minutes || 0;
  
  // Add current break if on break
  let totalBreakMinutes = breakMinutes;
  if (props.attendance.on_break && props.attendance.current_break_start) {
    const breakStart = new Date(props.attendance.current_break_start);
    const now = new Date();
    const currentBreakMinutes = Math.floor((now - breakStart) / (1000 * 60));
    totalBreakMinutes += currentBreakMinutes;
  }
  
  const hours = Math.floor(totalBreakMinutes / 60);
  const minutes = totalBreakMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

// Computed properties
const workDuration = computed(() => {
  return props.attendance.work_duration_formatted || calculateWorkDuration();
});

const breakDuration = computed(() => {
  return props.attendance.break_duration_formatted || calculateBreakDuration();
});

const breakSessionsCount = computed(() => {
  return props.attendance.break_sessions_count || (props.attendance.break_sessions || []).length;
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendances', href: route('attendances.index') },
  { label: `Record #${props.attendance.id}`, href: route('attendances.show', props.attendance.id) },
  { label: 'Edit', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'back-to-details',
    label: 'Back to Details',
    icon: 'arrow-left',
    variant: 'secondary',
    handler: () => router.visit(route('attendances.show', props.attendance.id))
  }
]);

const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    type: 'button'
  },
  {
    id: 'submit',
    label: 'Update Attendance',
    variant: 'primary',
    type: 'submit',
    loadingLabel: 'Updating...'
  }
]);

const timeValidationWarning = computed(() => {
  if (!form.clock_in) return null;
  
  const clockIn = new Date(form.clock_in);
  const clockOut = form.clock_out ? new Date(form.clock_out) : null;
  
  if (clockOut && clockOut <= clockIn) {
    return 'Clock out time must be after clock in time.';
  }
  
  if (clockOut) {
    const diffHours = (clockOut - clockIn) / (1000 * 60 * 60);
    if (diffHours > 24) {
      return 'Work duration exceeds 24 hours. Please verify the times are correct.';
    }
    if (diffHours > 12) {
      return 'Work duration exceeds 12 hours. This may require manager approval.';
    }
  }
  
  return null;
});

// Event handlers
const handleFormAction = (action) => {
  switch (action.id) {
    case 'cancel':
      router.visit(route('attendances.show', props.attendance.id));
      break;
    case 'submit':
      handleSubmit();
      break;
  }
};

const handleSubmit = () => {
  form.put(route('attendances.update', props.attendance.id), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Attendance Updated',
        message: 'The attendance record has been successfully updated.'
      });
    },
    onError: () => {
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Please check the form for errors and try again.'
      });
    }
  });
};

// Watch for clock_out changes to validate against clock_in
watch(() => form.clock_out, (newValue) => {
  if (newValue && form.clock_in) {
    const clockIn = new Date(form.clock_in);
    const clockOut = new Date(newValue);
    
    if (clockOut <= clockIn) {
      // Reset clock_out if it's not after clock_in
      form.clock_out = '';
    }
  }
});
</script>