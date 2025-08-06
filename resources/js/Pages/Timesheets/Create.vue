<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Create Timesheet Entry</h1>
    <form @submit.prevent="form.post(route('timesheets.store'))">
      <div class="mb-4">
        <label class="block">Project</label>
        <select v-model="form.project_id" class="w-full border px-2 py-1">
          <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
        </select>
        <div v-if="form.errors.project_id" class="text-red-500">{{ form.errors.project_id }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Task (Optional)</label>
        <select v-model="form.task_id" class="w-full border px-2 py-1">
          <option value="">None</option>
          <option v-for="task in tasks" :key="task.id" :value="task.id">{{ task.name }}</option>
        </select>
        <div v-if="form.errors.task_id" class="text-red-500">{{ form.errors.task_id }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Date</label>
        <input v-model="form.date" type="date" class="w-full border px-2 py-1" />
        <div v-if="form.errors.date" class="text-red-500">{{ form.errors.date }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Hours</label>
        <input v-model="form.hours" type="number" step="0.5" class="w-full border px-2 py-1" />
        <div v-if="form.errors.hours" class="text-red-500">{{ form.errors.hours }}</div>
      </div>
      <div class="mb-4">
        <label class="block">Description</label>
        <textarea v-model="form.description" class="w-full border px-2 py-1"></textarea>
        <div v-if="form.errors.description" class="text-red-500">{{ form.errors.description }}</div>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="form.processing">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

defineProps({
  projects: Array,
  tasks: Array,
});

const form = useForm({
  project_id: '',
  task_id: '',
  date: '',
  hours: 0,
  description: '',
});
</script>