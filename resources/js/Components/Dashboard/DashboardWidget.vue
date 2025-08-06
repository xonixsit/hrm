<template>
  <div :class="widgetClasses">
    <!-- Widget Header -->
    <div v-if="$slots.header || title" class="widget-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="widget-title">{{ title }}</h3>
          <div v-if="$slots.actions" class="widget-actions">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Widget Content -->
    <div class="widget-content">
      <slot />
    </div>

    <!-- Widget Footer -->
    <div v-if="$slots.footer" class="widget-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Widget title
  title: {
    type: String,
    default: ''
  },
  
  // Widget size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Widget padding
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  
  // Widget background
  background: {
    type: String,
    default: 'white',
    validator: (value) => ['white', 'neutral', 'gradient'].includes(value)
  },
  
  // Interactive state
  interactive: {
    type: Boolean,
    default: false
  },
  
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Error state
  error: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

// Base widget classes
const baseClasses = computed(() => [
  'dashboard-widget',
  'relative',
  'overflow-hidden',
  'transition-all',
  'duration-200',
  {
    'cursor-pointer': props.interactive,
    'hover:shadow-lg': props.interactive,
    'opacity-50': props.loading,
    'border-error-200': props.error,
    'bg-error-50': props.error
  }
]);

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'min-h-[120px]',
    md: 'min-h-[160px]',
    lg: 'min-h-[200px]',
    xl: 'min-h-[240px]'
  };
  return sizes[props.size];
});

// Padding classes
const paddingClasses = computed(() => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  return paddings[props.padding];
});

// Background classes
const backgroundClasses = computed(() => {
  const backgrounds = {
    white: 'bg-white border border-neutral-200 shadow-sm',
    neutral: 'bg-neutral-50 border border-neutral-200',
    gradient: 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 shadow-sm'
  };
  return backgrounds[props.background];
});

// Rounded classes
const roundedClasses = computed(() => 'rounded-xl');

// Combined widget classes
const widgetClasses = computed(() => [
  ...baseClasses.value,
  sizeClasses.value,
  paddingClasses.value,
  backgroundClasses.value,
  roundedClasses.value,
  props.class
]);
</script>

<style scoped>
.dashboard-widget {
  /* Ensure consistent widget styling */
}

.widget-header {
  @apply mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-neutral-900;
}

.widget-actions {
  @apply flex items-center space-x-2;
}

.widget-content {
  @apply flex-1;
}

.widget-footer {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

/* Loading state overlay */
.dashboard-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.dashboard-widget.loading::before {
  opacity: 1;
}

/* Interactive hover effects */
.dashboard-widget.interactive:hover {
  transform: translateY(-2px);
}
</style>