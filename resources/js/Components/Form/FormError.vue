<template>
  <div v-if="error" class="form-error">
    <ExclamationCircleIcon class="w-4 h-4 text-red-500 mr-1" />
    <span class="text-sm text-red-600">{{ error }}</span>
  </div>
</template>

<script setup>
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';

defineProps({
  error: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.form-error {
  @apply flex items-center mt-1;
}
</style>