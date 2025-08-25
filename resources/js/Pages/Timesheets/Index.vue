<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Timesheets
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <!-- Header Actions -->
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Time Entries</h3>
                <p class="mt-1 text-sm text-gray-600">
                  Manage and track time entries for projects and tasks.
                </p>
              </div>
              <div class="flex space-x-3">
                <Link 
                  v-if="canCreate" 
                  :href="route('timesheets.create')" 
                  class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Entry
                </Link>
              </div>
            </div>

            <!-- Timesheets Table -->
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th v-if="isManagerOrAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
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
                  <tr v-for="timesheet in timesheets.data" :key="timesheet.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(timesheet.date) }}
                    </td>
                    <td v-if="isManagerOrAdmin" class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
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
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ timesheet.project.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ timesheet.task ? timesheet.task.name : 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ timesheet.hours }}h
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClasses(timesheet.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ timesheet.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <Link 
                          :href="route('timesheets.show', timesheet.id)" 
                          class="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          View
                        </Link>
                        <Link 
                          v-if="canEdit(timesheet)" 
                          :href="route('timesheets.edit', timesheet.id)" 
                          class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        >
                          Edit
                        </Link>
                        <button 
                          v-if="canDelete(timesheet)" 
                          @click="destroy(timesheet.id)" 
                          class="text-red-600 hover:text-red-900 transition-colors duration-150"
                        >
                          Delete
                        </button>
                        <button 
                          v-if="isManagerOrAdmin && timesheet.status === 'pending'" 
                          @click="approve(timesheet.id)" 
                          class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        >
                          Approve
                        </button>
                        <button 
                          v-if="isManagerOrAdmin && timesheet.status === 'pending'" 
                          @click="reject(timesheet.id)" 
                          class="text-red-600 hover:text-red-900 transition-colors duration-150"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="timesheets.data.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No timesheets</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating a new time entry.</p>
              <div class="mt-6">
                <Link 
                  v-if="canCreate"
                  :href="route('timesheets.create')" 
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Entry
                </Link>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="timesheets.last_page > 1" class="mt-6">
              <Pagination 
                :links="timesheets.links"
                :current-page="timesheets.current_page"
                :last-page="timesheets.last_page"
                :total="timesheets.total"
                :per-page="timesheets.per_page"
                :from="timesheets.from"
                :to="timesheets.to"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth.js';

const props = defineProps({
  timesheets: Object,
});

const { user, hasRole, hasAnyRole } = useAuth();

// Role-based access control using the composable
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));
const canCreate = computed(() => hasRole('Employee') || hasAnyRole(['Admin', 'Manager']));

const canEdit = (timesheet) => {
  // Employees can edit their own pending timesheets
  if (hasRole('Employee') && !isManagerOrAdmin.value) {
    return timesheet.status === 'pending';
  }
  // Managers and Admins can edit any pending timesheet
  return isManagerOrAdmin.value && timesheet.status === 'pending';
};

const canDelete = (timesheet) => {
  // Only allow deletion of pending timesheets
  if (hasRole('Employee') && !isManagerOrAdmin.value) {
    return timesheet.status === 'pending';
  }
  return isManagerOrAdmin.value && timesheet.status === 'pending';
};

const destroy = (id) => {
  if (confirm('Are you sure you want to delete this timesheet entry?')) {
    router.delete(route('timesheets.destroy', id));
  }
};

const approve = (id) => {
  if (confirm('Are you sure you want to approve this timesheet?')) {
    router.post(route('timesheets.approve', id), {
      comments: 'Approved from timesheet list'
    });
  }
};

const reject = (id) => {
  const comments = prompt('Please provide a reason for rejection:');
  if (comments !== null) {
    router.post(route('timesheets.reject', id), {
      comments: comments || 'Rejected from timesheet list'
    });
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
  
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