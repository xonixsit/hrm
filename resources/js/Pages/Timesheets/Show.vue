<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Timesheet Details
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <!-- Timesheet Details -->
            <div class="space-y-6">
              <!-- Header with Status -->
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Time Entry</h3>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ formatDate(timesheet.date) }}
                  </p>
                </div>
                <span :class="getStatusClasses(timesheet.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                  {{ timesheet.status }}
                </span>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Employee (for managers/admins) -->
                <div v-if="isManagerOrAdmin" class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Employee</dt>
                  <dd class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ timesheet.employee.user.name.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {{ timesheet.employee.user.name }}
                      </div>
                    </div>
                  </dd>
                </div>

                <!-- Project -->
                <div class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Project</dt>
                  <dd class="text-sm text-gray-900">{{ timesheet.project.name }}</dd>
                </div>

                <!-- Task -->
                <div class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Task</dt>
                  <dd class="text-sm text-gray-900">
                    {{ timesheet.task ? timesheet.task.name : 'No specific task' }}
                  </dd>
                </div>

                <!-- Hours -->
                <div class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Hours Worked</dt>
                  <dd class="text-sm text-gray-900 font-medium">{{ timesheet.hours }}h</dd>
                </div>

                <!-- Date -->
                <div class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Date</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(timesheet.date) }}</dd>
                </div>

                <!-- Created At -->
                <div class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd class="text-sm text-gray-900">{{ formatDateTime(timesheet.created_at) }}</dd>
                </div>
              </div>

              <!-- Description -->
              <div v-if="timesheet.description" class="space-y-1">
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {{ timesheet.description }}
                </dd>
              </div>

              <!-- Approval Comments -->
              <div v-if="timesheet.approval_comments" class="space-y-1">
                <dt class="text-sm font-medium text-gray-500">
                  {{ timesheet.status === 'approved' ? 'Approval Comments' : 'Rejection Comments' }}
                </dt>
                <dd class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {{ timesheet.approval_comments }}
                </dd>
              </div>

              <!-- Approval Date -->
              <div v-if="timesheet.approved_at" class="space-y-1">
                <dt class="text-sm font-medium text-gray-500">
                  {{ timesheet.status === 'approved' ? 'Approved At' : 'Rejected At' }}
                </dt>
                <dd class="text-sm text-gray-900">{{ formatDateTime(timesheet.approved_at) }}</dd>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <Link 
                :href="route('timesheets.index')" 
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to List
              </Link>
              <Link 
                v-if="canEdit" 
                :href="route('timesheets.edit', timesheet.id)" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  timesheet: Object,
});

const { hasAnyRole, hasRole } = useAuth();
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));
const canEdit = computed(() => {
  // Employees can edit their own pending timesheets
  if (hasRole('Employee') && !isManagerOrAdmin.value) {
    return props.timesheet.status === 'pending';
  }
  // Managers and Admins can edit any pending timesheet
  return isManagerOrAdmin.value && props.timesheet.status === 'pending';
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex px-3 py-1 text-sm font-semibold rounded-full';
  
  switch (status) {
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};
</script>