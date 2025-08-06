<template>
  <component
    :is="iconComponent"
    :class="[
      'inline-block',
      sizeClass,
      colorClass,
      {
        'animate-spin': loading,
        'opacity-50': disabled,
        'cursor-pointer': clickable,
      },
      customClass
    ]"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue';
import { getIcon, iconSizes } from '@/config/icons.js';

const props = defineProps({
  /**
   * The semantic name of the icon to display
   */
  name: {
    type: String,
    required: true,
  },
  
  /**
   * Size of the icon (xs, sm, md, lg, xl, 2xl)
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => Object.keys(iconSizes).includes(value),
  },
  
  /**
   * Color variant for the icon
   */
  color: {
    type: String,
    default: 'current',
    validator: (value) => [
      'current', 'primary', 'secondary', 'accent', 'neutral',
      'success', 'warning', 'error', 'info', 'white'
    ].includes(value),
  },
  
  /**
   * Whether the icon should spin (for loading states)
   */
  loading: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Whether the icon appears disabled
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Whether the icon is clickable (adds cursor pointer)
   */
  clickable: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Custom CSS classes to apply
   */
  class: {
    type: [String, Array, Object],
    default: '',
  },
  
  /**
   * Accessibility label for screen readers
   */
  ariaLabel: {
    type: String,
    default: '',
  },
});

// Get the icon component
const iconComponent = computed(() => {
  const icon = getIcon(props.name);
  if (!icon) {
    console.warn(`Icon "${props.name}" not found in icon map`);
    return 'div'; // Fallback to prevent errors
  }
  return icon;
});

// Compute size class
const sizeClass = computed(() => iconSizes[props.size]);

// Compute color class
const colorClass = computed(() => {
  const colorMap = {
    current: 'text-current',
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    neutral: 'text-neutral-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    info: 'text-info-500',
    white: 'text-white',
  };
  
  return colorMap[props.color] || 'text-current';
});

// Handle custom classes
const customClass = computed(() => props.class);
</script>

<style scoped>
/* Additional icon-specific styles can be added here if needed */
</style>