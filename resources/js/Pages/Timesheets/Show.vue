<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Timesheet Details</h1>
    <div class="bg-white p-4 rounded shadow">
      <p v-if="isManagerOrAdmin"><strong>Employee:</strong> {{ timesheet.employee.user.name }}</p>
      <p><strong>Project:</strong> {{ timesheet.project.name }}</p>
      <p><strong>Task:</strong> {{ timesheet.task ? timesheet.task.name : 'N/A' }}</p>
      <p><strong>Date:</strong> {{ timesheet.date }}</p>
      <p><strong>Hours:</strong> {{ timesheet.hours }}</p>
      <p><strong>Description:</strong> {{ timesheet.description }}</p>
      <p><strong>Status:</strong> {{ timesheet.status }}</p>
    </div>
    <div class="mt-4">
      <Link v-if="canEdit" :href="route('timesheets.edit', timesheet.id)" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Edit</Link>
      <Link :href="route('timesheets.index')" class="bg-gray-500 text-white px-4 py-2 rounded">Back</Link>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import { computed } from 'vue';

const props = defineProps({
  timesheet: Object,
});

const { hasAnyRole } = useAuth();
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));
const canEdit = computed(() => !isManagerOrAdmin.value && props.timesheet.status === 'pending');
</script>