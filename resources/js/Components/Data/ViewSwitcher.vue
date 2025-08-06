<template>
  <div :class="switcherClasses">
    <div class="switcher-content">
      <!-- View Options -->
      <div class="view-options">
        <button
          v-for="view in availableViews"
          :key="view.value"
          @click="handleViewChange(view.value)"
          :class="getViewButtonClasses(view.value)"
          :title="view.label"
          :aria-label="`Switch to ${view.label} view`"
        >
          <component :is="view.icon" class="view-icon" />
          <span v-if="showLabels" class="view-label">{{ view.label }}</span>
        </button>
      </div>

      <!-- Additional Controls -->
      <div v-if="$slots.controls" class="switcher-controls">
        <slot name="controls" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Current view
  modelValue: {
    type: String,
    default: 'table',
    validator: (value) => ['table', 'list', 'grid'].includes(value)
  },
  
  // Available views
  views: {
    type: Array,
    default: () => ['table', 'list', 'grid']
  },
  
  // Display options
  showLabels: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'pills'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// View definitions
const viewDefinitions = {
  table: {
    value: 'table',
    label: 'Table',
    icon: 'TableIcon'
  },
  list: {
    value: 'list',
    label: 'List',
    icon: 'ListBulletIcon'
  },
  grid: {
    value: 'grid',
    label: 'Grid',
    icon: 'Squares2X2Icon'
  }
};

// Computed properties
const availableViews = computed(() => {
  return props.views.map(view => viewDefinitions[view]).filter(Boolean);
});

const switcherClasses = computed(() => [
  'view-switcher',
  `view-switcher--${props.variant}`,
  `view-switcher--${props.size}`,
  {
    'view-switcher--with-labels': props.showLabels
  },
  props.class
]);

// Methods
const handleViewChange = (view) => {
  if (view === props.modelValue) return;
  
  emit('update:modelValue', view);
  emit('change', view);
};

const getViewButtonClasses = (view) => [
  'view-button',
  {
    'view-button--active': view === props.modelValue,
    'view-button--inactive': view !== props.modelValue
  }
];
</script>

<style scoped>
/* Base Switcher Styles */
.view-switcher {
  @apply inline-flex;
}

.switcher-content {
  @apply flex items-center space-x-3;
}

/* View Options */
.view-options {
  @apply inline-flex rounded-lg;
}

.view-switcher--default .view-options {
  @apply bg-neutral-100 p-1;
}

.view-switcher--minimal .view-options {
  @apply space-x-1;
}

.view-switcher--pills .view-options {
  @apply bg-white border border-neutral-200 rounded-lg p-1;
}

/* View Buttons */
.view-button {
  @apply inline-flex items-center justify-center;
  @apply font-medium rounded-md transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

/* Size Variants */
.view-switcher--sm .view-button {
  @apply p-1.5 text-xs;
}

.view-switcher--md .view-button {
  @apply p-2 text-sm;
}

.view-switcher--lg .view-button {
  @apply p-3 text-base;
}

/* Button States - Default Variant */
.view-switcher--default .view-button--active {
  @apply bg-white text-primary-600 shadow-sm;
}

.view-switcher--default .view-button--inactive {
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-white/50;
}

/* Button States - Minimal Variant */
.view-switcher--minimal .view-button--active {
  @apply bg-primary-100 text-primary-700;
}

.view-switcher--minimal .view-button--inactive {
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100;
}

/* Button States - Pills Variant */
.view-switcher--pills .view-button--active {
  @apply bg-primary-600 text-white shadow-sm;
}

.view-switcher--pills .view-button--inactive {
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50;
}

/* Icon and Label */
.view-icon {
  @apply flex-shrink-0;
}

.view-switcher--sm .view-icon {
  @apply w-4 h-4;
}

.view-switcher--md .view-icon {
  @apply w-5 h-5;
}

.view-switcher--lg .view-icon {
  @apply w-6 h-6;
}

.view-label {
  @apply ml-2 truncate;
}

.view-switcher--sm .view-label {
  @apply ml-1.5;
}

.view-switcher--lg .view-label {
  @apply ml-3;
}

/* Controls */
.switcher-controls {
  @apply flex items-center;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .view-switcher--with-labels .view-label {
    @apply hidden;
  }
  
  .view-switcher--with-labels .view-button {
    @apply px-2;
  }
  
  .switcher-content {
    @apply space-x-2;
  }
}

/* Dark Theme Adjustments */
.theme-dark .view-switcher--default .view-options {
  @apply bg-neutral-700;
}

.theme-dark .view-switcher--default .view-button--active {
  @apply bg-neutral-800 text-primary-400;
}

.theme-dark .view-switcher--default .view-button--inactive {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-600;
}

.theme-dark .view-switcher--minimal .view-button--active {
  @apply bg-primary-900 text-primary-300;
}

.theme-dark .view-switcher--minimal .view-button--inactive {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .view-switcher--pills .view-options {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .view-switcher--pills .view-button--active {
  @apply bg-primary-600 text-white;
}

.theme-dark .view-switcher--pills .view-button--inactive {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

/* Animation */
.view-button {
  @apply transform transition-transform;
}

.view-button:active {
  @apply scale-95;
}

/* Focus States */
.view-button:focus {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.theme-dark .view-button:focus {
  @apply ring-offset-neutral-800;
}

/* Accessibility */
.view-button[aria-pressed="true"] {
  @apply font-semibold;
}

/* Loading State */
.view-switcher--loading .view-button {
  @apply opacity-50 cursor-not-allowed;
}

.view-switcher--loading .view-button:hover {
  @apply transform-none;
}
</style>