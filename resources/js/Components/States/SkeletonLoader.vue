<template>
  <div :class="skeletonClasses">
    <!-- Text Skeleton -->
    <template v-if="type === 'text'">
      <div
        v-for="line in lines"
        :key="line"
        :class="textLineClasses"
        :style="getLineWidth(line)"
      ></div>
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <div class="skeleton-card">
        <div v-if="showAvatar" class="skeleton-avatar"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-text-lines">
            <div
              v-for="line in textLines"
              :key="line"
              :class="textLineClasses"
              :style="getLineWidth(line)"
            ></div>
          </div>
        </div>
      </div>
    </template>

    <!-- List Skeleton -->
    <template v-else-if="type === 'list'">
      <div
        v-for="item in items"
        :key="item"
        class="skeleton-list-item"
      >
        <div v-if="showAvatar" class="skeleton-list-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-list-title"></div>
          <div class="skeleton-list-subtitle"></div>
        </div>
        <div v-if="showActions" class="skeleton-list-actions">
          <div class="skeleton-action-button"></div>
          <div class="skeleton-action-button"></div>
        </div>
      </div>
    </template>

    <!-- Form Skeleton -->
    <template v-else-if="type === 'form'">
      <div class="skeleton-form">
        <div
          v-for="field in fields"
          :key="field"
          class="skeleton-form-field"
        >
          <div class="skeleton-form-label"></div>
          <div class="skeleton-form-input"></div>
        </div>
        <div class="skeleton-form-actions">
          <div class="skeleton-form-button skeleton-form-button--secondary"></div>
          <div class="skeleton-form-button skeleton-form-button--primary"></div>
        </div>
      </div>
    </template>

    <!-- Custom Skeleton -->
    <template v-else-if="type === 'custom'">
      <slot />
    </template>

    <!-- Default Rectangle Skeleton -->
    <template v-else>
      <div class="skeleton-rectangle"></div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Type of skeleton to display
   */
  type: {
    type: String,
    default: 'rectangle',
    validator: (value) => ['text', 'card', 'list', 'form', 'rectangle', 'custom'].includes(value)
  },

  /**
   * Number of lines for text skeleton
   */
  lines: {
    type: Number,
    default: 3
  },

  /**
   * Number of items for list skeleton
   */
  items: {
    type: Number,
    default: 5
  },

  /**
   * Number of fields for form skeleton
   */
  fields: {
    type: Number,
    default: 4
  },

  /**
   * Number of text lines for card skeleton
   */
  textLines: {
    type: Number,
    default: 2
  },

  /**
   * Show avatar in card/list skeletons
   */
  showAvatar: {
    type: Boolean,
    default: true
  },

  /**
   * Show actions in list skeleton
   */
  showActions: {
    type: Boolean,
    default: false
  },

  /**
   * Enable shimmer animation
   */
  animated: {
    type: Boolean,
    default: true
  },

  /**
   * Size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Custom height for rectangle skeleton
   */
  height: {
    type: String,
    default: ''
  },

  /**
   * Custom width for rectangle skeleton
   */
  width: {
    type: String,
    default: ''
  },

  /**
   * Border radius variant
   */
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  },

  /**
   * Additional CSS classes
   */
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

// Computed properties
const skeletonClasses = computed(() => [
  'skeleton-loader',
  `skeleton-loader--${props.type}`,
  `skeleton-loader--${props.size}`,
  {
    'skeleton-loader--animated': props.animated
  },
  props.class
])

const textLineClasses = computed(() => [
  'skeleton-text-line',
  `skeleton-rounded--${props.rounded}`,
  {
    'skeleton-animated': props.animated
  }
])

// Methods
const getLineWidth = (lineNumber) => {
  // Generate varied line widths for more realistic appearance
  const widths = ['100%', '85%', '92%', '78%', '95%', '88%', '90%']
  const width = widths[(lineNumber - 1) % widths.length]
  
  return {
    width: lineNumber === props.lines ? '60%' : width // Last line is shorter
  }
}
</script>

<style scoped>
/* Base Skeleton Styles */
.skeleton-loader {
  @apply w-full;
}

.skeleton-loader--animated .skeleton-animated {
  @apply animate-pulse;
}

/* Skeleton Base Element */
.skeleton-base {
  @apply bg-neutral-200;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-loader--animated .skeleton-base {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Text Skeleton */
.skeleton-text-line {
  @apply bg-neutral-200 mb-2;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-loader--sm .skeleton-text-line {
  @apply h-3 mb-1;
}

.skeleton-loader--md .skeleton-text-line {
  @apply h-4 mb-2;
}

.skeleton-loader--lg .skeleton-text-line {
  @apply h-5 mb-3;
}

.skeleton-animated {
  animation: shimmer 1.5s infinite;
}

/* Card Skeleton */
.skeleton-card {
  @apply flex space-x-4 p-4 bg-white rounded-lg border border-neutral-200;
}

.skeleton-avatar {
  @apply w-12 h-12 bg-neutral-200 rounded-full flex-shrink-0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-card-content {
  @apply flex-1 space-y-2;
}

.skeleton-title {
  @apply h-5 bg-neutral-200 rounded w-3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-subtitle {
  @apply h-4 bg-neutral-200 rounded w-1/2;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-text-lines {
  @apply space-y-2 mt-3;
}

/* List Skeleton */
.skeleton-list-item {
  @apply flex items-center space-x-4 p-3 border-b border-neutral-200 last:border-b-0;
}

.skeleton-list-avatar {
  @apply w-10 h-10 bg-neutral-200 rounded-full flex-shrink-0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-list-content {
  @apply flex-1 space-y-1;
}

.skeleton-list-title {
  @apply h-4 bg-neutral-200 rounded w-2/3;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-list-subtitle {
  @apply h-3 bg-neutral-200 rounded w-1/2;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-list-actions {
  @apply flex space-x-2;
}

.skeleton-action-button {
  @apply w-8 h-8 bg-neutral-200 rounded;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

/* Form Skeleton */
.skeleton-form {
  @apply space-y-4;
}

.skeleton-form-field {
  @apply space-y-2;
}

.skeleton-form-label {
  @apply h-4 bg-neutral-200 rounded w-1/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-form-input {
  @apply h-10 bg-neutral-200 rounded w-full;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-form-actions {
  @apply flex justify-end space-x-3 pt-4;
}

.skeleton-form-button {
  @apply h-10 bg-neutral-200 rounded;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-form-button--secondary {
  @apply w-20;
}

.skeleton-form-button--primary {
  @apply w-24;
}

/* Rectangle Skeleton */
.skeleton-rectangle {
  @apply bg-neutral-200 rounded;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  height: v-bind(height || '4rem');
  width: v-bind(width || '100%');
}

/* Rounded Variants */
.skeleton-rounded--none {
  @apply rounded-none;
}

.skeleton-rounded--sm {
  @apply rounded-sm;
}

.skeleton-rounded--md {
  @apply rounded;
}

.skeleton-rounded--lg {
  @apply rounded-lg;
}

.skeleton-rounded--full {
  @apply rounded-full;
}

/* Size Variants */
.skeleton-loader--sm .skeleton-avatar {
  @apply w-8 h-8;
}

.skeleton-loader--sm .skeleton-list-avatar {
  @apply w-8 h-8;
}

.skeleton-loader--sm .skeleton-title {
  @apply h-4;
}

.skeleton-loader--sm .skeleton-subtitle {
  @apply h-3;
}

.skeleton-loader--sm .skeleton-list-title {
  @apply h-3;
}

.skeleton-loader--sm .skeleton-list-subtitle {
  @apply h-2;
}

.skeleton-loader--lg .skeleton-avatar {
  @apply w-16 h-16;
}

.skeleton-loader--lg .skeleton-list-avatar {
  @apply w-12 h-12;
}

.skeleton-loader--lg .skeleton-title {
  @apply h-6;
}

.skeleton-loader--lg .skeleton-subtitle {
  @apply h-5;
}

.skeleton-loader--lg .skeleton-list-title {
  @apply h-5;
}

.skeleton-loader--lg .skeleton-list-subtitle {
  @apply h-4;
}

/* Dark Theme */
.theme-dark .skeleton-card {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .skeleton-text-line,
.theme-dark .skeleton-avatar,
.theme-dark .skeleton-title,
.theme-dark .skeleton-subtitle,
.theme-dark .skeleton-list-avatar,
.theme-dark .skeleton-list-title,
.theme-dark .skeleton-list-subtitle,
.theme-dark .skeleton-action-button,
.theme-dark .skeleton-form-label,
.theme-dark .skeleton-form-input,
.theme-dark .skeleton-form-button,
.theme-dark .skeleton-rectangle {
  @apply bg-neutral-700;
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

.theme-dark .skeleton-list-item {
  @apply border-neutral-700;
}

/* Responsive */
@media (max-width: 640px) {
  .skeleton-card {
    @apply p-3 space-x-3;
  }
  
  .skeleton-list-item {
    @apply p-2 space-x-3;
  }
  
  .skeleton-form-actions {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .skeleton-form-button {
    @apply w-full;
  }
}

/* Animation Performance */
@media (prefers-reduced-motion: reduce) {
  .skeleton-animated {
    animation: none;
  }
  
  .skeleton-loader--animated .skeleton-base {
    animation: none;
  }
}
</style>