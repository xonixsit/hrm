<template>
  <AuthenticatedLayout>
    <PageLayout>
      <template #header>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Edit Attendance Record</h1>
              <p class="mt-1 text-sm text-gray-600">Update attendance record details and timing information</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Link 
              :href="route('attendances.show', attendance.id)" 
              class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-wide hover:from-gray-700 hover:to-gray-800 active:from-gray-800 active:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-25 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Details
            </Link>
          </div>
        </div>
      </template>
      <!-- Employee Information -->
      <div v-if="attendance.employee?.user" class="mb-8">
        <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-teal-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 flex items-center">
              <svg class="w-6 h-6 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Employee Information
            </h3>
          </div>
          <div class="p-6">
            <div class="flex items-center space-x-6">
              <div class="flex-shrink-0">
                <div class="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span class="text-2xl font-bold text-white">
                    {{ getInitials(attendance.employee.user.name) }}
                  </span>
                </div>
              </div>
              <div class="flex-1">
                <h4 class="text-2xl font-bold text-gray-900">{{ attendance.employee.user.name }}</h4>
                <p class="text-lg text-gray-600 mt-1">{{ attendance.employee.user.email }}</p>
                <div class="flex flex-wrap items-center mt-4 gap-3">
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 011-1h2a2 2 0 011 1v2m-4 0a2 2 0 01-2 2h-2a2 2 0 01-2-2m0 0h4v2m-4-2v2m4-2v2"></path>
                    </svg>
                    ID: {{ attendance.employee.employee_code || 'N/A' }}
                  </span>
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ formatDate(attendance.date) }}
                  </span>
                  <span :class="getStatusBadgeClasses(attendance.status)">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ formatStatus(attendance.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Attendance Summary -->
      <div class="mb-8">
        <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 flex items-center">
              <svg class="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Current Record Summary
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200 transform hover:scale-105 transition-transform duration-200">
                <div class="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="text-2xl font-bold text-teal-600">{{ workDuration }}</div>
                <div class="text-sm font-medium text-teal-800 mt-1">Work Duration</div>
              </div>
              <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 transform hover:scale-105 transition-transform duration-200">
                <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="text-2xl font-bold text-green-600">{{ breakDuration }}</div>
                <div class="text-sm font-medium text-green-800 mt-1">Break Duration</div>
              </div>
              <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 transform hover:scale-105 transition-transform duration-200">
                <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                </div>
                <div class="text-2xl font-bold text-purple-600">{{ breakSessionsCount }}</div>
                <div class="text-sm font-medium text-purple-800 mt-1">Break Sessions</div>
              </div>
              <div class="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 transform hover:scale-105 transition-transform duration-200">
                <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="text-2xl font-bold text-orange-600">{{ attendance.location ? 'Yes' : 'No' }}</div>
                <div class="text-sm font-medium text-orange-800 mt-1">Location Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
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

            <!-- Break Time Information Section -->
            <FormSection title="Break Time Information" description="Edit break time details (useful when employees forget to end break)">
              <div class="space-y-6">
                <!-- Total Break Minutes -->
                <FormField
                  label="Total Break Minutes"
                  :error="form.errors.total_break_minutes"
                  description="Total break time in minutes (auto-calculated from sessions)"
                >
                  <input
                    v-model.number="form.total_break_minutes"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :class="{ 'border-red-500': form.errors.total_break_minutes }"
                    @input="handleBreakTimeChange"
                  />
                </FormField>

                <!-- Break Sessions -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-900">Break Sessions</h4>
                    <button
                      type="button"
                      @click="addBreakSession"
                      class="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Add Session
                    </button>
                  </div>

                  <div v-if="form.break_sessions.length === 0" class="text-center py-4 text-gray-500 text-sm">
                    No break sessions recorded
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="(session, index) in form.break_sessions"
                      :key="index"
                      class="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-medium text-gray-700">Session {{ index + 1 }}</span>
                        <button
                          type="button"
                          @click="removeBreakSession(index)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            v-model="session.start"
                            type="datetime-local"
                            class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            @change="updateSessionDuration(index)"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            v-model="session.end"
                            type="datetime-local"
                            class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            @change="updateSessionDuration(index)"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Duration (minutes)</label>
                          <input
                            v-model.number="session.duration_minutes"
                            type="number"
                            min="0"
                            step="1"
                            class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            @input="handleBreakTimeChange"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Break Time Warning -->
                <div v-if="breakTimeWarning" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <h4 class="text-sm font-medium text-yellow-800">Break Time Warning</h4>
                      <p class="text-sm text-yellow-700 mt-1">{{ breakTimeWarning }}</p>
                    </div>
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
import { useForm, router, Link } from '@inertiajs/vue3';
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
//console.log('Attendance data received:', props.attendance);

// Helper functions
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  // Parse the datetime string and format it for datetime-local input
  // This preserves the original date/time without timezone conversion
  const isoString = dateTimeString.includes('T') ? dateTimeString : dateTimeString + 'T00:00:00';
  const dateOnly = isoString.substring(0, 16); // Get YYYY-MM-DDTHH:MM format
  
  return dateOnly;
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
  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border';
  const statusClasses = {
    'clocked_in': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
    'clocked_out': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
    'on_break': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
  };
  return `${baseClasses} ${statusClasses[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'}`;
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
  total_break_minutes: props.attendance.total_break_minutes || 0,
  break_sessions: props.attendance.break_sessions || [],
});

// Duration calculation functions
const calculateWorkDuration = () => {
  if (!form.clock_in) return '0h 0m';
  
  const clockIn = new Date(form.clock_in);
  const clockOut = form.clock_out ? new Date(form.clock_out) : null;
  
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
  
  // Subtract break minutes from form data
  const breakMinutes = form.total_break_minutes || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMinutes);
  
  const hours = Math.floor(workMinutes / 60);
  const minutes = workMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

const calculateBreakDuration = () => {
  const breakMinutes = form.total_break_minutes || 0;
  
  const hours = Math.floor(breakMinutes / 60);
  const minutes = breakMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

// Computed properties
const workDuration = computed(() => {
  return calculateWorkDuration();
});

const breakDuration = computed(() => {
  return calculateBreakDuration();
});

const breakSessionsCount = computed(() => {
  return form.break_sessions.length;
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

const breakTimeWarning = computed(() => {
  if (!form.clock_in || !form.clock_out) return null;
  
  const clockIn = new Date(form.clock_in);
  const clockOut = new Date(form.clock_out);
  const totalWorkMinutes = (clockOut - clockIn) / (1000 * 60);
  
  if (form.total_break_minutes > totalWorkMinutes) {
    return 'Break time cannot exceed total work duration.';
  }
  
  if (form.total_break_minutes > 0 && form.break_sessions.length === 0) {
    return 'Break time is set but no break sessions are recorded. Consider adding break sessions for better tracking.';
  }
  
  return null;
});

// Break time management functions
const addBreakSession = () => {
  const newSession = {
    start: formatDateTimeForInput(new Date().toISOString()),
    end: '',
    duration_minutes: 0
  };
  form.break_sessions.push(newSession);
};

const removeBreakSession = (index) => {
  form.break_sessions.splice(index, 1);
  handleBreakTimeChange();
};

const updateSessionDuration = (index) => {
  const session = form.break_sessions[index];
  if (session.start && session.end) {
    const startTime = new Date(session.start);
    const endTime = new Date(session.end);
    if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && endTime > startTime) {
      session.duration_minutes = Math.floor((endTime - startTime) / (1000 * 60));
    }
  }
  handleBreakTimeChange();
};

const handleBreakTimeChange = () => {
  // Auto-calculate total break minutes from sessions
  if (form.break_sessions.length > 0) {
    form.total_break_minutes = form.break_sessions.reduce((total, session) => {
      return total + (session.duration_minutes || 0);
    }, 0);
  }
};

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

// Watch for break time changes to update work duration display
watch(() => [form.total_break_minutes, form.break_sessions], () => {
  // Trigger reactivity for computed properties
}, { deep: true });
</script>