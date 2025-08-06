<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Tasks</h1>
    <Link :href="route('tasks.create')" class="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">Add Task</Link>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Project</th>
            <th class="px-4 py-2">Description</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks.data" :key="task.id">
            <td class="border px-4 py-2">{{ task.name }}</td>
            <td class="border px-4 py-2">{{ task.project ? task.project.name : 'N/A' }}</td>
            <td class="border px-4 py-2">{{ task.description }}</td>
            <td class="border px-4 py-2">
              <Link :href="route('tasks.show', task.id)" class="text-blue-500 mr-2">View</Link>
              <Link v-if="canEdit(task)" :href="route('tasks.edit', task.id)" class="text-green-500 mr-2">Edit</Link>
              <button v-if="canDelete(task)" @click="destroy(task.id)" class="text-red-500">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination :links="tasks.links" />
  </div>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth.js';

const props = defineProps({
  tasks: Object,
});

const { user, hasRole, hasAnyRole, getUserProperty } = useAuth();

const userId = computed(() => getUserProperty('id'));
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));

const canEdit = (task) => {
  // Managers and Admins can edit all tasks
  return isManagerOrAdmin.value;
};

const canDelete = (task) => {
  // Only Admins can delete tasks
  return hasRole('Admin');
};

const destroy = (id) => {
  if (confirm('Are you sure?')) {
    router.delete(route('tasks.destroy', id));
  }
};
</script>