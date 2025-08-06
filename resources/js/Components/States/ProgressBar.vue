<template>
  <div :class="progressContainerClasses">
    <!-- Progress Label -->
    <div v-if="showLabel || $slots.label" class="progress-label">
      <slot name="label">
        <div class="progress-label-content">
          <span class="progress-title">{{ label }}</span>
          <span v-if="showPercentage" class="progress-percentage">{{ displayPercentage }}%</span>
        </div>
      </slot>
    </div>

    <!-- Progress Bar -->
    <div :class="progressBarClasses">
      <div 
        :class="progressFillClasses"
        :style="progressFillStyle"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-label="ariaLabel"
      >
        <!-- Animated Stripes -->
        <div v-if="striped" class="progress-stripes"></div>
        
        <!-- Shimmer Effect -->
        <div v-if="shimmer" class="progress-shimmer"></div>
      </div>
    </div>

    <!-- Progress Info -->
    <div v-if="showInfo || $slots.info" class="progress-info">
      <slot name="info">
        <div class="progress-info-content">
          <span v-if="showValue" class="progress-value">{{ displayValue }} / {{ displayMax }}</span>
          <span v-if="showTime && estimatedTime" class="progress-time">{{ formatTime(estimatedTime) }} remaining</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Current progress value
   */
  value: {
    type: Number,
    default: 0
  },

  /**
   * Maximum value
   */
  max: {
    type: Number,
    default: 100
  },

  /**
   * Minimum value
   */
  min: {
    type: Number,
    default: 0
  },

  /**
   * Progress bar label
   */
  label: {
    type: String,
    default: ''
  },

  /**
   * Color variant
   */
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },

  /**
   * Size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },

  /**
   * Show percentage
   */
  showPercentage: {
    type: Boolean,
    default: false
  },

  /**
   * Show label
   */
  showLabel: {
    type: Boolean,
    default: false
  },

  /**
   * Show progress info
   */
  showInfo: {
    type: Boolean,
    default: false
  },

  /**
   * Show current/max values
   */
  showValue: {
    type: Boolean,
    default: false
  },

  /**
   * Show estimated time
   */
  showTime: {
    type: Boolean,
    default: false
  },

  /**
   * Estimated time remaining in seconds
   */
  estimatedTime: {
    type: Number,
    default: null
  },

  /**
   * Striped animation
   */
  striped: {
    type: Boolean,
    default: false
  },

  /**
   * Shimmer effect
   */
  shimmer: {
    type: Boolean,
    default: false
  },

  /**
   * Indeterminate state
   */
  indeterminate: {
    type: Boolean,
    default: false
  },

  /**
   * Rounded corners
   */
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  },

  /**
   * Animation speed
   */
  speed: {
    type: String,
    default: 'normal',
    validator: (value) => ['slow', 'normal', 'fast'].includes(value)
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
const progressContainerClasses = computed(() => [
  'progress-container',
  `progress-container--${props.size}`,
  props.class
])

const progressBarClasses = computed(() => [
  'progress-bar',
  `progress-bar--${props.size}`,
  `progress-bar--${props.rounded}`,
  {
    'progress-bar--indeterminate': props.indeterminate
  }
])

const progressFillClasses = computed(() => [
  'progress-fill',
  `progress-fill--${props.color}`,
  `progress-fill--${props.speed}`,
  {
    'progress-fill--striped': props.striped,
    'progress-fill--shimmer': props.shimmer,
    'progress-fill--indeterminate': props.indeterminate
  }
])

const progressFillStyle = computed(() => {
  if (props.indeterminate) {
    return {}
  }
  
  const percentage = Math.min(Math.max((props.value - props.min) / (props.max - props.min) * 100, 0), 100)
  return {
    width: `${percentage}%`
  }
})

const displayPercentage = computed(() => {
  if (props.indeterminate) return 0
  return Math.round((props.value - props.min) / (props.max - props.min) * 100)
})

const displayValue = computed(() => {
  return props.value.toLocaleString()
})

const displayMax = computed(() => {
  return props.max.toLocaleString()
})

const ariaLabel = computed(() => {
  if (props.label) return props.label
  if (props.indeterminate) return 'Loading in progress'
  return `Progress: ${displayPercentage.value}%`
})

// Methods
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
</script>

<style scoped>
/* Container Styles */
.progress-container {
  @apply w-full;
}

.progress-container--xs {
  @apply space-y-1;
}

.progress-container--sm {
  @apply space-y-1;
}

.progress-container--md {
  @apply space-y-2;
}

.progress-container--lg {
  @apply space-y-2;
}

.progress-container--xl {
  @apply space-y-3;
}

/* Progress Label */
.progress-label {
  @apply flex items-center justify-between;
}

.progress-label-content {
  @apply flex items-center justify-between w-full;
}

.progress-title {
  @apply text-sm font-medium text-neutral-700;
}

.progress-percentage {
  @apply text-sm font-semibold text-neutral-900;
}

/* Progress Bar */
.progress-bar {
  @apply w-full bg-neutral-200 overflow-hidden relative;
}

.progress-bar--xs {
  @apply h-1;
}

.progress-bar--sm {
  @apply h-2;
}

.progress-bar--md {
  @apply h-3;
}

.progress-bar--lg {
  @apply h-4;
}

.progress-bar--xl {
  @apply h-6;
}

/* Rounded Variants */
.progress-bar--none {
  @apply rounded-none;
}

.progress-bar--sm {
  @apply rounded-sm;
}

.progress-bar--md {
  @apply rounded;
}

.progress-bar--lg {
  @apply rounded-lg;
}

.progress-bar--full {
  @apply rounded-full;
}

/* Progress Fill */
.progress-fill {
  @apply h-full transition-all duration-300 ease-out relative overflow-hidden;
}

.progress-fill--slow {
  @apply transition-all duration-1000;
}

.progress-fill--normal {
  @apply transition-all duration-300;
}

.progress-fill--fast {
  @apply transition-all duration-150;
}

/* Color Variants */
.progress-fill--primary {
  @apply bg-primary-600;
}

.progress-fill--secondary {
  @apply bg-secondary-600;
}

.progress-fill--success {
  @apply bg-success-600;
}

.progress-fill--warning {
  @apply bg-warning-600;
}

.progress-fill--error {
  @apply bg-error-600;
}

.progress-fill--info {
  @apply bg-info-600;
}

/* Striped Effect */
.progress-stripes {
  @apply absolute inset-0 opacity-25;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-fill--striped .progress-stripes {
  animation: progress-stripes 1s linear infinite;
}

/* Shimmer Effect */
.progress-shimmer {
  @apply absolute inset-0 opacity-30;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: translateX(-100%);
}

.progress-fill--shimmer .progress-shimmer {
  animation: progress-shimmer 2s ease-in-out infinite;
}

/* Indeterminate State */
.progress-fill--indeterminate {
  @apply w-full;
  background: linear-gradient(
    90deg,
    transparent,
    currentColor,
    transparent
  );
  background-size: 50% 100%;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

/* Progress Info */
.progress-info {
  @apply flex items-center justify-between text-xs text-neutral-600;
}

.progress-info-content {
  @apply flex items-center justify-between w-full;
}

.progress-value {
  @apply font-medium;
}

.progress-time {
  @apply text-neutral-500;
}

/* Dark Theme */
.theme-dark .progress-bar {
  @apply bg-neutral-700;
}

.theme-dark .progress-title {
  @apply text-neutral-300;
}

.theme-dark .progress-percentage {
  @apply text-neutral-100;
}

.theme-dark .progress-info {
  @apply text-neutral-400;
}

.theme-dark .progress-value {
  @apply text-neutral-300;
}

.theme-dark .progress-time {
  @apply text-neutral-500;
}

.theme-dark .progress-fill--primary {
  @apply bg-primary-500;
}

.theme-dark .progress-fill--secondary {
  @apply bg-secondary-500;
}

.theme-dark .progress-fill--success {
  @apply bg-success-500;
}

.theme-dark .progress-fill--warning {
  @apply bg-warning-500;
}

.theme-dark .progress-fill--error {
  @apply bg-error-500;
}

.theme-dark .progress-fill--info {
  @apply bg-info-500;
}

/* Animations */
@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 1rem 0;
  }
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes progress-indeterminate {
  0% {
    background-position: -50% 0;
  }
  100% {
    background-position: 150% 0;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    @apply transition-none;
  }
  
  .progress-stripes,
  .progress-shimmer,
  .progress-fill--indeterminate {
    animation: none;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .progress-title,
  .progress-percentage {
    @apply text-xs;
  }
  
  .progress-info {
    @apply text-xs;
  }
  
  .progress-container--lg,
  .progress-container--xl {
    @apply space-y-2;
  }
}

/* Focus States for Accessibility */
.progress-bar:focus-within {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .progress-bar {
    @apply border border-neutral-900;
  }
  
  .progress-fill {
    @apply border-r border-neutral-900;
  }
}

/* Enhanced Visual States */
.progress-fill--primary {
  background: linear-gradient(90deg, #4f46e5, #6366f1);
}

.progress-fill--secondary {
  background: linear-gradient(90deg, #0891b2, #06b6d4);
}

.progress-fill--success {
  background: linear-gradient(90deg, #059669, #10b981);
}

.progress-fill--warning {
  background: linear-gradient(90deg, #d97706, #f59e0b);
}

.progress-fill--error {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.progress-fill--info {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

/* Pulse Effect for Indeterminate */
.progress-bar--indeterminate {
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>