<template>
  <span class="filter-tag">
    <span class="filter-name">{{ filter.label }}:</span>
    <span class="filter-value">{{ displayValue }}</span>
    <button
      @click="handleRemove"
      class="remove-button"
      :aria-label="`Remove ${filter.label} filter`"
    >
      <Icon name="x" class="w-3 h-3" />
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  
  value: {
    type: [String, Number, Array, Object],
    required: true
  }
});

const emit = defineEmits(['remove']);

// Computed properties
const displayValue = computed(() => {
  if (Array.isArray(props.value)) {
    if (props.value.length === 0) return 'None';
    if (props.value.length === 1) return props.value[0];
    return `${props.value.length} selected`;
  }
  
  if (typeof props.value === 'object' && props.value !== null) {
    // Handle date ranges or other objects
    if (props.value.start && props.value.end) {
      return `${props.value.start} - ${props.value.end}`;
    }
    return JSON.stringify(props.value);
  }
  
  if (typeof props.value === 'boolean') {
    return props.value ? 'Yes' : 'No';
  }
  
  return String(props.value);
});

// Methods
const handleRemove = () => {
  emit('remove');
};
</script>

<style scoped>
.filter-tag {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium;
  @apply bg-primary-100 text-primary-800 rounded-md;
  @apply border border-primary-200;
}

.filter-name {
  @apply font-semibold mr-1;
}

.filter-value {
  @apply mr-2;
}

.remove-button {
  @apply p-0.5 rounded-sm text-primary-600 hover:text-primary-800;
  @apply hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500;
  @apply transition-colors duration-150;
}

/* Dark Theme */
.theme-dark .filter-tag {
  @apply bg-primary-800 text-primary-200 border-primary-700;
}

.theme-dark .remove-button {
  @apply text-primary-300 hover:text-primary-100 hover:bg-primary-700;
}
</style>