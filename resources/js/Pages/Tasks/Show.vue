<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Task Details</h1>
    <div class="bg-white p-4 rounded shadow">
      <p><strong>Project:</strong> {{ task.project ? task.project.name : 'N/A' }}</p>
      <p><strong>Name:</strong> {{ task.name }}</p>
      <p><strong>Description:</strong> {{ task.description }}</p>
    </div>
    <div class="mt-4">
      <Link :href="route('tasks.edit', task.id)" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Edit</Link>
      <Link :href="route('tasks.index')" class="bg-gray-500 text-white px-4 py-2 rounded">Back</Link>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
  task: Object,
});
</script>