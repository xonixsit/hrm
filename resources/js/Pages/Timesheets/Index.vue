<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Timesheets</h1>
    <Link v-if="canCreate" :href="route('timesheets.create')" class="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">Add Entry</Link>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr>
            <th class="px-4 py-2">Date</th>
            <th v-if="isManagerOrAdmin" class="px-4 py-2">Employee</th>
            <th class="px-4 py-2">Project</th>
            <th class="px-4 py-2">Task</th>
            <th class="px-4 py-2">Hours</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timesheet in timesheets.data" :key="timesheet.id">
            <td class="border px-4 py-2">{{ timesheet.date }}</td>
            <td v-if="isManagerOrAdmin" class="border px-4 py-2">{{ timesheet.employee.user.name }}</td>
            <td class="border px-4 py-2">{{ timesheet.project.name }}</td>
            <td class="border px-4 py-2">{{ timesheet.task ? timesheet.task.name : 'N/A' }}</td>
            <td class="border px-4 py-2">{{ timesheet.hours }}</td>
            <td class="border px-4 py-2">{{ timesheet.status }}</td>
            <td class="border px-4 py-2">
              <Link :href="route('timesheets.show', timesheet.id)" class="text-blue-500 mr-2">View</Link>
              <Link v-if="canEdit(timesheet)" :href="route('timesheets.edit', timesheet.id)" class="text-green-500 mr-2">Edit</Link>
              <button v-if="canDelete(timesheet)" @click="destroy(timesheet.id)" class="text-red-500 mr-2">Delete</button>
              <button v-if="isManagerOrAdmin && timesheet.status === 'pending'" @click="approve(timesheet.id)" class="text-green-500 mr-2">Approve</button>
              <button v-if="isManagerOrAdmin && timesheet.status === 'pending'" @click="reject(timesheet.id)" class="text-red-500">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination :links="timesheets.links" />
  </div>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth.js';

const props = defineProps({
  timesheets: Object,
});

const { user, hasRole, hasAnyRole } = useAuth();

// Role-based access control using the composable
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));
const canCreate = computed(() => hasRole('Employee'));

const canEdit = (timesheet) => {
  return !isManagerOrAdmin.value && timesheet.status === 'pending';
};

const canDelete = (timesheet) => {
  return canEdit(timesheet);
};

const destroy = (id) => {
  if (confirm('Are you sure?')) {
    router.delete(route('timesheets.destroy', id));
  }
};

const approve = (id) => {
  router.put(route('timesheets.update', id), { status: 'approved' });
};

const reject = (id) => {
  router.put(route('timesheets.update', id), { status: 'rejected' });
};
</script>