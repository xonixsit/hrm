<template>
  <div class="my-tasks-widget">
    <div class="widget-header">
      <h3 class="widget-title">My Tasks</h3>
      <span class="task-count">0</span>
    </div>
    
    <div class="tasks-placeholder">
      <CheckCircleIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-600 text-center">No tasks assigned</p>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

defineProps({
  tasks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

defineEmits(['toggle-task', 'view-task']);
</script>

<style scoped>
.my-tasks-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.widget-header {
  @apply flex items-center justify-between mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.task-count {
  @apply inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-bold rounded-full;
}

.tasks-placeholder {
  @apply py-8;
}
</style>