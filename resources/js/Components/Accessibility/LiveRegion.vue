/**
 * Live Region Component
 * Provides ARIA live regions for screen reader announcements
 */
<template>
  <div class="live-regions">
    <!-- Polite announcements -->
    <div
      id="aria-live-polite"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
      ref="politeRegion"
    ></div>
    
    <!-- Assertive announcements -->
    <div
      id="aria-live-assertive"
      aria-live="assertive"
      aria-atomic="true"
      class="sr-only"
      ref="assertiveRegion"
    ></div>
    
    <!-- Status announcements -->
    <div
      id="aria-live-status"
      aria-live="polite"
      aria-atomic="true"
      role="status"
      class="sr-only"
      ref="statusRegion"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ariaLiveManager } from '@/utils/accessibility.js';

const politeRegion = ref(null);
const assertiveRegion = ref(null);
const statusRegion = ref(null);

onMounted(() => {
  // Ensure live regions are properly initialized
  ariaLiveManager.init();
});
</script>

<style scoped>
.live-regions {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>