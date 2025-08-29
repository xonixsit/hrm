<template>
  <div class="todays-schedule-widget">
    <div class="widget-header">
      <h3 class="widget-title">Today's Schedule</h3>
      <CalendarIcon class="w-5 h-5 text-gray-400" />
    </div>
    
    <div class="schedule-placeholder">
      <CalendarDaysIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-600 text-center">No scheduled events today</p>
    </div>
  </div>
</template>

<script setup>
import { CalendarIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline';

defineProps({
  schedule: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});
</script>

<style scoped>
.todays-schedule-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.widget-header {
  @apply flex items-center justify-between mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.schedule-placeholder {
  @apply py-8;
}
</style>