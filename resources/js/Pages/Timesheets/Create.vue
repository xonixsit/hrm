<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Create Timesheet Entry
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <form @submit.prevent="form.post(route('timesheets.store'))" class="space-y-6">
              <!-- Project Selection -->
              <div>
                <label for="project_id" class="block text-sm font-medium text-gray-700">
                  Project <span class="text-red-500">*</span>
                </label>
                <select 
                  id="project_id"
                  v-model="form.project_id" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.project_id }"
                >
                  <option value="">Select a project</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
                <div v-if="form.errors.project_id" class="mt-1 text-sm text-red-600">
                  {{ form.errors.project_id }}
                </div>
              </div>

              <!-- Task Selection -->
              <div>
                <label for="task_id" class="block text-sm font-medium text-gray-700">
                  Task (Optional)
                </label>
                <select 
                  id="task_id"
                  v-model="form.task_id" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.task_id }"
                >
                  <option value="">No specific task</option>
                  <option v-for="task in tasks" :key="task.id" :value="task.id">
                    {{ task.name }}
                  </option>
                </select>
                <div v-if="form.errors.task_id" class="mt-1 text-sm text-red-600">
                  {{ form.errors.task_id }}
                </div>
              </div>

              <!-- Date -->
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700">
                  Date <span class="text-red-500">*</span>
                </label>
                <input 
                  id="date"
                  v-model="form.date" 
                  type="date" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.date }"
                />
                <div v-if="form.errors.date" class="mt-1 text-sm text-red-600">
                  {{ form.errors.date }}
                </div>
              </div>

              <!-- Hours -->
              <div>
                <label for="hours" class="block text-sm font-medium text-gray-700">
                  Hours <span class="text-red-500">*</span>
                </label>
                <input 
                  id="hours"
                  v-model="form.hours" 
                  type="number" 
                  step="0.25" 
                  min="0" 
                  max="24"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.hours }"
                  placeholder="e.g., 8.5"
                />
                <div v-if="form.errors.hours" class="mt-1 text-sm text-red-600">
                  {{ form.errors.hours }}
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Enter hours in decimal format (e.g., 8.5 for 8 hours 30 minutes)
                </p>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea 
                  id="description"
                  v-model="form.description" 
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': form.errors.description }"
                  placeholder="Describe the work performed..."
                ></textarea>
                <div v-if="form.errors.description" class="mt-1 text-sm text-red-600">
                  {{ form.errors.description }}
                </div>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link 
                  :href="route('timesheets.index')" 
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="form.processing"
                >
                  <svg v-if="form.processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ form.processing ? 'Creating...' : 'Create Entry' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

defineProps({
  projects: Array,
  tasks: Array,
});

const form = useForm({
  project_id: '',
  task_id: '',
  date: '',
  hours: '',
  description: '',
});

// Set default date to today
onMounted(() => {
  if (!form.date) {
    form.date = new Date().toISOString().split('T')[0];
  }
});
</script>