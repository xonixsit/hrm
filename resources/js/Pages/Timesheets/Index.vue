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
                  <Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700 transition-colors">
                  Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-900 font-medium">Timesheets</span>
                </li>
              </ol>
            </nav>

            <!-- Page Title and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl font-bold text-gray-900">Timesheets</h1>
                <p class="mt-1 text-sm text-gray-600">
                  Manage and track time entries for projects and tasks
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <Link v-if="canCreate" :href="route('timesheets.create')"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 transition-colors">
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Entry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6">

            <!-- Timesheets Table -->
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th v-if="isManagerOrAdmin" scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync
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
                      <div class="flex items-center">
                        <span>{{ timesheet.hours }}h</span>
                        <span
                          v-if="timesheet.creator && timesheet.employee && timesheet.creator.id !== timesheet.employee.user.id"
                          class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
                          :title="`Created by ${timesheet.creator.name}`">
                          Admin
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClasses(timesheet.status)"
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ timesheet.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <div class="flex justify-center">
                        <svg
                          v-if="timesheet.description && timesheet.description.includes('Auto-generated from attendance')"
                          class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"
                          title="Synced with attendance">
                          <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                        </svg>
                        <svg
                          v-else-if="timesheet.description && timesheet.description.includes('Synced with Attendance')"
                          class="h-5 w-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20"
                          title="Manually synced with attendance">
                          <path fill-rule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clip-rule="evenodd" />
                        </svg>
                        <span v-else class="text-gray-300" title="Not synced with attendance">
                          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <Link :href="route('timesheets.show', timesheet.id)"
                          class="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                        View
                        </Link>
                        <Link v-if="canEdit(timesheet)" :href="route('timesheets.edit', timesheet.id)"
                          class="text-green-600 hover:text-green-900 transition-colors duration-150">
                        Edit
                        </Link>
                        <button v-if="canDelete(timesheet)" @click="destroy(timesheet.id)"
                          class="text-red-600 hover:text-red-900 transition-colors duration-150">
                          Delete
                        </button>
                        <button v-if="isManagerOrAdmin && timesheet.status === 'pending'" @click="approve(timesheet.id)"
                          class="text-green-600 hover:text-green-900 transition-colors duration-150">
                          Approve
                        </button>
                        <button v-if="isManagerOrAdmin && timesheet.status === 'pending'" @click="reject(timesheet.id)"
                          class="text-red-600 hover:text-red-900 transition-colors duration-150">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No timesheets</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating a new time entry.</p>
              <div class="mt-6">
                <Link v-if="canCreate" :href="route('timesheets.create')"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Entry
                </Link>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="timesheets.last_page > 1" class="mt-6">
              <Pagination :links="timesheets.links" :current-page="timesheets.current_page"
                :last-page="timesheets.last_page" :total="timesheets.total" :per-page="timesheets.per_page"
                :from="timesheets.from" :to="timesheets.to" />
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
  import { PlusIcon } from '@heroicons/vue/24/outline';

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