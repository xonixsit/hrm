<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Page Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <!-- Breadcrumbs -->
            <nav class="flex mb-4" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <Link :href="route('dashboard')"
                    class="text-gray-500 hover:text-gray-700 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                  <Link :href="route('timesheets.index')"
                    class="text-gray-500 hover:text-gray-700 transition-colors">
                    Timesheets
                  </Link>
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-900 font-medium">Edit Entry</span>
                </li>
              </ol>
            </nav>

            <!-- Page Title and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl font-bold text-gray-900">Edit Timesheet Entry</h1>
                <p class="mt-1 text-sm text-gray-600">
                  Update your time entry for {{ formatDate(timesheet.date) }}
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <span :class="getStatusClasses(timesheet.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                  {{ timesheet.status }}
                </span>
                <Link :href="route('timesheets.show', timesheet.id)"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <EyeIcon class="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-8">
            <!-- Warning for approved/rejected timesheets -->
            <div v-if="timesheet.status !== 'pending'" class="mb-6 p-4 rounded-md" :class="timesheet.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg v-if="timesheet.status === 'approved'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm" :class="timesheet.status === 'approved' ? 'text-green-800' : 'text-red-800'">
                    This timesheet has been {{ timesheet.status }}. 
                    <span v-if="timesheet.status === 'approved'">Changes may require re-approval.</span>
                    <span v-else>You can edit and resubmit for approval.</span>
                  </p>
                </div>
              </div>
            </div>

            <form @submit.prevent="updateTimesheet" class="space-y-6">
              <!-- Project Selection -->
              <div>
                <label for="project_id" class="block text-sm font-medium text-gray-700">
                  Project <span class="text-red-500">*</span>
                </label>
                <select 
                  id="project_id"
                  v-model="form.project_id" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.project_id }"
                  :disabled="!canEdit"
                >
                  <option value="">Select a project</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
                <div v-if="form.errors.project_id" class="mt-1 text-sm text-red-600">
                  {{ form.errors.project_id }}
                </div>
              </div>

              <!-- Task Selection -->
              <div>
                <label for="task_id" class="block text-sm font-medium text-gray-700">
                  Task (Optional)
                </label>
                <select 
                  id="task_id"
                  v-model="form.task_id" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.task_id }"
                  :disabled="!canEdit"
                >
                  <option value="">No specific task</option>
                  <option v-for="task in tasks" :key="task.id" :value="task.id">
                    {{ task.name }}
                  </option>
                </select>
                <div v-if="form.errors.task_id" class="mt-1 text-sm text-red-600">
                  {{ form.errors.task_id }}
                </div>
              </div>

              <!-- Date -->
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700">
                  Date <span class="text-red-500">*</span>
                </label>
                <input 
                  id="date"
                  v-model="form.date" 
                  type="date" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.date }"
                  :disabled="!canEdit"
                />
                <div v-if="form.errors.date" class="mt-1 text-sm text-red-600">
                  {{ form.errors.date }}
                </div>
              </div>

              <!-- Hours -->
              <div>
                <label for="hours" class="block text-sm font-medium text-gray-700">
                  Hours <span class="text-red-500">*</span>
                </label>
                <input 
                  id="hours"
                  v-model="form.hours" 
                  type="number" 
                  step="0.25" 
                  min="0" 
                  max="24"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.hours }"
                  placeholder="e.g., 8.5"
                  :disabled="!canEdit"
                />
                <div v-if="form.errors.hours" class="mt-1 text-sm text-red-600">
                  {{ form.errors.hours }}
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Enter hours in decimal format (e.g., 8.5 for 8 hours 30 minutes)
                </p>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea 
                  id="description"
                  v-model="form.description" 
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.description }"
                  placeholder="Describe the work performed..."
                  :disabled="!canEdit"
                ></textarea>
                <div v-if="form.errors.description" class="mt-1 text-sm text-red-600">
                  {{ form.errors.description }}
                </div>
              </div>

              <!-- Status (for managers/admins) -->
              <div v-if="canApprove" class="border-t border-gray-200 pt-6">
                <label for="status" class="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select 
                  id="status"
                  v-model="form.status" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <p class="mt-1 text-sm text-gray-500">
                  Change the approval status of this timesheet entry
                </p>
              </div>

              <!-- Attendance Sync Section -->
              <div class="border-t border-gray-200 pt-6">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-900">Attendance Synchronization</h4>
                  <button
                    @click="loadAttendanceData"
                    type="button"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                <div v-if="attendanceData.has_attendance" class="bg-blue-50 p-4 rounded-md">
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3 flex-1">
                      <h5 class="text-sm font-medium text-blue-800">Attendance Record Found</h5>
                      <div class="mt-2 text-sm text-blue-700">
                        <p><strong>Clock In:</strong> {{ attendanceData.attendance.clock_in || 'Not clocked in' }}</p>
                        <p><strong>Clock Out:</strong> {{ attendanceData.attendance.clock_out || 'Not clocked out' }}</p>
                        <p><strong>Work Duration:</strong> {{ attendanceData.attendance.work_duration }}</p>
                        <p><strong>Calculated Hours:</strong> {{ attendanceData.attendance.calculated_hours }}h</p>
                        <p v-if="attendanceData.attendance.break_sessions > 0">
                          <strong>Break Time:</strong> {{ attendanceData.attendance.break_duration }} ({{ attendanceData.attendance.break_sessions }} session{{ attendanceData.attendance.break_sessions > 1 ? 's' : '' }})
                        </p>
                      </div>
                      
                      <div v-if="attendanceData.sync_needed" class="mt-3">
                        <div class="flex items-center justify-between">
                          <p class="text-sm text-amber-700">
                            <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            Hours mismatch detected (Timesheet: {{ form.hours }}h, Attendance: {{ attendanceData.attendance.calculated_hours }}h)
                          </p>
                          <button
                            @click="syncWithAttendance"
                            type="button"
                            :disabled="syncingAttendance"
                            class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            <svg v-if="syncingAttendance" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ syncingAttendance ? 'Syncing...' : 'Sync Now' }}
                          </button>
                        </div>
                      </div>
                      
                      <div v-else class="mt-2">
                        <p class="text-sm text-green-700">
                          <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Timesheet is synchronized with attendance data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="attendanceData.has_attendance === false" class="bg-yellow-50 p-4 rounded-md">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h5 class="text-sm font-medium text-yellow-800">No Attendance Record</h5>
                      <p class="text-sm text-yellow-700 mt-1">
                        No attendance record found for this date. This timesheet was created manually.
                      </p>
                    </div>
                  </div>
                </div>

                <div v-else class="bg-gray-50 p-4 rounded-md">
                  <p class="text-sm text-gray-600">Click "Refresh" to check for attendance data.</p>
                </div>
              </div>

              <!-- Approval Comments (if exists) -->
              <div v-if="timesheet.approval_comments" class="bg-gray-50 p-4 rounded-md">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Approval Comments</h4>
                <p class="text-sm text-gray-700">{{ timesheet.approval_comments }}</p>
                <p v-if="timesheet.approved_at" class="text-xs text-gray-500 mt-2">
                  {{ formatDateTime(timesheet.approved_at) }}
                </p>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <div class="flex items-center space-x-3">
                  <Link 
                    :href="route('timesheets.index')" 
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to List
                  </Link>
                  <Link 
                    :href="route('timesheets.show', timesheet.id)" 
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </Link>
                </div>
                
                <div class="flex items-center space-x-3">
                  <button 
                    v-if="canDelete"
                    type="button"
                    @click="deleteTimesheet"
                    class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                  <button 
                    v-if="canEdit || canApprove"
                    type="submit" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="form.processing"
                  >
                    <svg v-if="form.processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ form.processing ? 'Updating...' : 'Update Entry' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { useForm, Link, router, usePage } from '@inertiajs/vue3';
import { computed, ref, onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { EyeIcon } from '@heroicons/vue/24/outline';
import axios from 'axios';

const props = defineProps({
  timesheet: Object,
  projects: Array,
  tasks: Array,
});

const page = usePage();

const form = useForm({
  project_id: props.timesheet.project_id,
  task_id: props.timesheet.task_id || '',
  date: props.timesheet.date,
  hours: props.timesheet.hours,
  description: props.timesheet.description || '',
  status: props.timesheet.status,
});

// Attendance sync state
const attendanceData = ref({});
const syncingAttendance = ref(false);

// Check user permissions
const canEdit = computed(() => {
  // Users can edit their own pending timesheets
  // Managers/Admins can edit any timesheet
  return props.timesheet.status === 'pending' || page.props.auth.user.roles?.some(role => ['Admin', 'Manager'].includes(role.name));
});

const canApprove = computed(() => {
  // Only managers and admins can change status
  return page.props.auth.user.roles?.some(role => ['Admin', 'Manager'].includes(role.name));
});

const canDelete = computed(() => {
  // Users can delete their own pending timesheets
  // Managers/Admins can delete any timesheet
  return props.timesheet.status === 'pending' || page.props.auth.user.roles?.some(role => ['Admin', 'Manager'].includes(role.name));
});

const updateTimesheet = () => {
  form.put(route('timesheets.update', props.timesheet.id), {
    onSuccess: () => {
      // Success message will be handled by the backend
    }
  });
};

const deleteTimesheet = () => {
  if (confirm('Are you sure you want to delete this timesheet entry? This action cannot be undone.')) {
    router.delete(route('timesheets.destroy', props.timesheet.id));
  }
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex px-3 py-1 text-sm font-semibold rounded-full';
  switch (status) {
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'pending':
    default:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

// Load attendance data for this timesheet
const loadAttendanceData = async () => {
  try {
    const response = await axios.get(route('timesheets.attendance-data', props.timesheet.id));
    attendanceData.value = response.data;
  } catch (error) {
    console.error('Failed to load attendance data:', error);
    attendanceData.value = { has_attendance: false, message: 'Failed to load attendance data' };
  }
};

// Sync timesheet with attendance data
const syncWithAttendance = async () => {
  if (syncingAttendance.value) return;
  
  syncingAttendance.value = true;
  
  try {
    const response = await axios.post(route('timesheets.sync-attendance', props.timesheet.id));
    
    if (response.data.success) {
      // Update form with synced data
      form.hours = response.data.timesheet.hours;
      form.description = response.data.timesheet.description;
      
      // Reload attendance data to update sync status
      await loadAttendanceData();
      
      // Show success message
      alert('Timesheet synchronized with attendance data successfully!');
    }
  } catch (error) {
    console.error('Failed to sync with attendance:', error);
    alert('Failed to sync with attendance data. Please try again.');
  } finally {
    syncingAttendance.value = false;
  }
};

// Load attendance data when component mounts
onMounted(() => {
  loadAttendanceData();
});
</script>
</template>