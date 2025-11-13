<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Task Management"
      subtitle="Manage project tasks and assignments"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Task List -->
      <div class="mb-6 bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Task List</h3>
        
        <!-- Task Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 border border-gray-300 text-left">Task Name</th>
                <th class="px-4 py-2 border border-gray-300 text-left">Project</th>
                <th class="px-4 py-2 border border-gray-300 text-left">Description</th>
                <th class="px-4 py-2 border border-gray-300 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasks.data" :key="task.id">
                <td class="border px-4 py-2">{{ task.name }}</td>
                <td class="border px-4 py-2">{{ task.project ? task.project.name : 'N/A' }}</td>
                <td class="border px-4 py-2">{{ task.description }}</td>
                <td class="border px-4 py-2">
                  <Link :href="route('tasks.show', task.id)" class="text-teal-500 mr-2">View</Link>
                  <Link v-if="canEdit(task)" :href="route('tasks.edit', task.id)" class="text-green-500 mr-2">Edit</Link>
                  <button v-if="canDelete(task)" @click="destroy(task.id)" class="text-red-500">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="tasks.last_page > 1" class="mt-6">
          <Pagination 
            :links="tasks.links"
            :current-page="tasks.current_page"
            :last-page="tasks.last_page"
            :total="tasks.total"
            :per-page="tasks.per_page"
            :from="tasks.from"
            :to="tasks.to"
          />
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth.js';

const props = defineProps({
  tasks: Object,
});

const { hasRole } = useAuth();

// Breadcrumbs configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Tasks', current: true }
]);

// Header actions
const headerActions = computed(() => [
  {
    id: 'create',
    label: 'Create Task',
    variant: 'primary',
    handler: () => router.visit(route('tasks.create'))
  }
]);

// Permission checks
const canEdit = (task) => {
  // Admins and Managers can edit tasks
  return hasRole('Admin') || hasRole('Manager');
};

const canDelete = (task) => {
  // Only Admins can delete tasks
  return hasRole('Admin');
};

const destroy = (id) => {
  if (confirm('Are you sure you want to delete this task?')) {
    router.delete(route('tasks.destroy', id));
  }
};
</script>