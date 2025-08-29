<template>
  <div class="team-activities-widget">
    <div class="widget-header">
      <h3 class="widget-title">Team Activities</h3>
    </div>
    
    <div class="activities-placeholder">
      <BriefcaseIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-600 text-center">Team activities will appear here</p>
    </div>
  </div>
</template>

<script setup>
import { BriefcaseIcon } from '@heroicons/vue/24/outline';

defineProps({
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});
</script>

<style scoped>
.team-activities-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.widget-header {
  @apply flex items-center justify-between mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.activities-placeholder {
  @apply py-8;
}
</style>