<template>
  <label
    :for="for"
    :class="labelClasses"
  >
    <slot />
    <span v-if="required" class="text-red-500 ml-1">*</span>
  </label>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  for: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const labelClasses = computed(() => {
  const baseClasses = 'block font-medium text-gray-700';
  
  const sizeClasses = {
    sm: 'text-xs mb-1',
    md: 'text-sm mb-1',
    lg: 'text-base mb-2'
  };
  
  return [baseClasses, sizeClasses[props.size]].join(' ');
});
</script>