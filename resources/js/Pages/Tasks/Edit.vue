<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Edit Task</h1>
    <form @submit.prevent="form.put(route('tasks.update', task.id))">
      <div class="mb-4">
        <label class="block">Project</label>
        <select v-model="form.project_id" class="w-full border px-2 py-1">
          <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
        </select>
        <div v-if="form.errors.project_id" class="text-red-500">{{ form.errors.project_id }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Name</label>
        <input v-model="form.name" type="text" class="w-full border px-2 py-1" />
        <div v-if="form.errors.name" class="text-red-500">{{ form.errors.name }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Description</label>
        <textarea v-model="form.description" class="w-full border px-2 py-1"></textarea>
        <div v-if="form.errors.description" class="text-red-500">{{ form.errors.description }}</div>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="form.processing">Update</button>
    </form>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

defineProps({
  task: Object,
  projects: Array,
});

const form = useForm({
  project_id: task.project_id,
  name: task.name,
  description: task.description,
});
</script>