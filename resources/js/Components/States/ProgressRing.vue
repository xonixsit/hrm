<template>
  <div :class="progressRingClasses">
    <!-- Progress Ring SVG -->
    <div class="progress-ring-container">
      <svg
        :width="size"
        :height="size"
        class="progress-ring-svg"
        :class="{ 'animate-spin': indeterminate }"
      >
        <!-- Background Circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          class="progress-ring-background"
          :stroke-width="strokeWidth"
          fill="none"
        />
        
        <!-- Progress Circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          class="progress-ring-progress"
          :class="progressCircleClasses"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          fill="none"
          :style="progressCircleStyle"
        />
        
        <!-- Gradient Definitions -->
        <defs v-if="gradient">
          <linearGradient :id="`gradient-${uniqueId}`" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" :stop-color="gradientStart" />
            <stop offset="100%" :stop-color="gradientEnd" />
          </linearGradient>
        </defs>
      </svg>
      
      <!-- Center Content -->
      <div class="progress-ring-content">
        <slot>
          <!-- Default Content -->
          <div v-if="showPercentage || showValue" class="progress-ring-text">
            <div v-if="showPercentage" class="progress-percentage">
              {{ displayPercentage }}%
            </div>
            <div v-if="showValue" class="progress-value">
              {{ displayValue }}
            </div>
            <div v-if="label" class="progress-label">
              {{ label }}
            </div>
          </div>
          
          <!-- Icon Content -->
          <div v-else-if="icon" class="progress-ring-icon">
            <component :is="icon" :class="iconClasses" />
          </div>
          
          <!-- Loading Content -->
          <div v-else-if="indeterminate" class="progress-ring-loading">
            <component :is="loadingIcon" class="w-6 h-6 animate-spin text-current" />
          </div>
        </slot>
      </div>
    </div>
    
    <!-- External Label -->
    <div v-if="externalLabel && (showLabel || $slots.label)" class="progress-ring-external-label">
      <slot name="label">
        <div class="external-label-content">
          <span class="external-label-text">{{ label }}</span>
          <span v-if="showPercentage" class="external-label-percentage">{{ displayPercentage }}%</span>
        </div>
      </slot>
    </div>
    
    <!-- Progress Info -->
    <div v-if="showInfo || $slots.info" class="progress-ring-info">
      <slot name="info">
        <div class="progress-info-content">
          <span v-if="showValue" class="info-value">{{ displayValue }} / {{ displayMax }}</span>
          <span v-if="showTime && estimatedTime" class="info-time">{{ formatTime(estimatedTime) }} remaining</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getIcon } from '@/config/icons';

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
   * Progress ring size in pixels
   */
  size: {
    type: Number,
    default: 120
  },

  /**
   * Stroke width
   */
  strokeWidth: {
    type: Number,
    default: 8
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
   * Progress ring label
   */
  label: {
    type: String,
    default: ''
  },

  /**
   * Show percentage
   */
  showPercentage: {
    type: Boolean,
    default: true
  },

  /**
   * Show current/max values
   */
  showValue: {
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
   * Show external label (below the ring)
   */
  externalLabel: {
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
   * Icon to display in center
   */
  icon: {
    type: [String, Object],
    default: null
  },

  /**
   * Icon size
   */
  iconSize: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },

  /**
   * Indeterminate state
   */
  indeterminate: {
    type: Boolean,
    default: false
  },

  /**
   * Use gradient colors
   */
  gradient: {
    type: Boolean,
    default: false
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
   * Ring thickness variant
   */
  thickness: {
    type: String,
    default: 'normal',
    validator: (value) => ['thin', 'normal', 'thick'].includes(value)
  },

  /**
   * Additional CSS classes
   */
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

// Generate unique ID for gradients
const uniqueId = ref(Math.random().toString(36).substr(2, 9));

// Icons
const loadingIcon = computed(() => getIcon('loading') || getIcon('refresh'));

// Computed properties
const progressRingClasses = computed(() => [
  'progress-ring',
  `progress-ring--${props.color}`,
  `progress-ring--${props.thickness}`,
  {
    'progress-ring--indeterminate': props.indeterminate,
    'progress-ring--with-external-label': props.externalLabel
  },
  props.class
]);

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const displayPercentage = computed(() => {
  if (props.indeterminate) return 0;
  const percentage = ((props.value - props.min) / (props.max - props.min)) * 100;
  return Math.round(Math.min(Math.max(percentage, 0), 100));
});

const displayValue = computed(() => {
  return props.value.toLocaleString();
});

const displayMax = computed(() => {
  return props.max.toLocaleString();
});

const strokeDashoffset = computed(() => {
  if (props.indeterminate) {
    return circumference.value * 0.75; // Show 25% of the circle
  }
  
  const percentage = (props.value - props.min) / (props.max - props.min);
  return circumference.value * (1 - Math.min(Math.max(percentage, 0), 1));
});

const progressCircleClasses = computed(() => [
  `progress-ring-progress--${props.color}`,
  `progress-ring-progress--${props.speed}`,
  {
    'progress-ring-progress--gradient': props.gradient,
    'progress-ring-progress--indeterminate': props.indeterminate
  }
]);

const progressCircleStyle = computed(() => {
  const style = {};
  
  if (props.gradient) {
    style.stroke = `url(#gradient-${uniqueId.value})`;
  }
  
  return style;
});

const iconClasses = computed(() => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return [
    sizeMap[props.iconSize],
    'text-current'
  ];
});

// Gradient colors
const gradientStart = computed(() => {
  const colorMap = {
    primary: '#6366f1',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };
  return colorMap[props.color];
});

const gradientEnd = computed(() => {
  const colorMap = {
    primary: '#8b5cf6',
    secondary: '#0ea5e9',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa'
  };
  return colorMap[props.color];
});

// Methods
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
</script>

<style scoped>
/* Container Styles */
.progress-ring {
  @apply inline-flex flex-col items-center;
}

.progress-ring--with-external-label {
  @apply space-y-2;
}

.progress-ring-container {
  @apply relative inline-flex items-center justify-center;
}

.progress-ring-svg {
  @apply transform -rotate-90;
}

/* Background Circle */
.progress-ring-background {
  @apply stroke-neutral-200;
}

/* Progress Circle */
.progress-ring-progress {
  @apply transition-all duration-300 ease-out;
  stroke-linecap: round;
}

.progress-ring-progress--slow {
  @apply transition-all duration-1000;
}

.progress-ring-progress--normal {
  @apply transition-all duration-300;
}

.progress-ring-progress--fast {
  @apply transition-all duration-150;
}

/* Color Variants */
.progress-ring-progress--primary {
  @apply stroke-primary-600;
}

.progress-ring-progress--secondary {
  @apply stroke-secondary-600;
}

.progress-ring-progress--success {
  @apply stroke-success-600;
}

.progress-ring-progress--warning {
  @apply stroke-warning-600;
}

.progress-ring-progress--error {
  @apply stroke-error-600;
}

.progress-ring-progress--info {
  @apply stroke-info-600;
}

/* Thickness Variants */
.progress-ring--thin .progress-ring-progress,
.progress-ring--thin .progress-ring-background {
  stroke-width: 4;
}

.progress-ring--normal .progress-ring-progress,
.progress-ring--normal .progress-ring-background {
  stroke-width: 8;
}

.progress-ring--thick .progress-ring-progress,
.progress-ring--thick .progress-ring-background {
  stroke-width: 12;
}

/* Center Content */
.progress-ring-content {
  @apply absolute inset-0 flex items-center justify-center;
}

.progress-ring-text {
  @apply text-center;
}

.progress-percentage {
  @apply text-lg font-bold text-neutral-900;
}

.progress-value {
  @apply text-sm font-medium text-neutral-700;
}

.progress-label {
  @apply text-xs text-neutral-500 mt-1;
}

.progress-ring-icon {
  @apply flex items-center justify-center text-neutral-600;
}

.progress-ring-loading {
  @apply flex items-center justify-center text-neutral-400;
}

/* External Label */
.progress-ring-external-label {
  @apply text-center;
}

.external-label-content {
  @apply flex flex-col items-center space-y-1;
}

.external-label-text {
  @apply text-sm font-medium text-neutral-700;
}

.external-label-percentage {
  @apply text-xs text-neutral-500;
}

/* Progress Info */
.progress-ring-info {
  @apply text-center text-xs text-neutral-600 mt-2;
}

.progress-info-content {
  @apply space-y-1;
}

.info-value {
  @apply block font-medium;
}

.info-time {
  @apply block text-neutral-500;
}

/* Indeterminate Animation */
.progress-ring-progress--indeterminate {
  animation: progress-ring-rotate 2s linear infinite;
}

.progress-ring--indeterminate .progress-ring-svg {
  animation: progress-ring-spin 2s linear infinite;
}

/* Size Variants */
.progress-ring--sm {
  --ring-size: 80px;
}

.progress-ring--md {
  --ring-size: 120px;
}

.progress-ring--lg {
  --ring-size: 160px;
}

.progress-ring--xl {
  --ring-size: 200px;
}

/* Dark Theme */
.theme-dark .progress-ring-background {
  @apply stroke-neutral-700;
}

.theme-dark .progress-percentage {
  @apply text-neutral-100;
}

.theme-dark .progress-value {
  @apply text-neutral-300;
}

.theme-dark .progress-label {
  @apply text-neutral-400;
}

.theme-dark .external-label-text {
  @apply text-neutral-300;
}

.theme-dark .external-label-percentage {
  @apply text-neutral-400;
}

.theme-dark .progress-ring-info {
  @apply text-neutral-400;
}

.theme-dark .info-value {
  @apply text-neutral-300;
}

.theme-dark .info-time {
  @apply text-neutral-500;
}

.theme-dark .progress-ring-icon {
  @apply text-neutral-400;
}

.theme-dark .progress-ring-loading {
  @apply text-neutral-500;
}

.theme-dark .progress-ring-progress--primary {
  @apply stroke-primary-500;
}

.theme-dark .progress-ring-progress--secondary {
  @apply stroke-secondary-500;
}

.theme-dark .progress-ring-progress--success {
  @apply stroke-success-500;
}

.theme-dark .progress-ring-progress--warning {
  @apply stroke-warning-500;
}

.theme-dark .progress-ring-progress--error {
  @apply stroke-error-500;
}

.theme-dark .progress-ring-progress--info {
  @apply stroke-info-500;
}

/* Animations */
@keyframes progress-ring-rotate {
  0% {
    stroke-dashoffset: 283; /* Circumference for typical ring */
  }
  50% {
    stroke-dashoffset: 71;
  }
  100% {
    stroke-dashoffset: 283;
  }
}

@keyframes progress-ring-spin {
  0% {
    transform: rotate(-90deg);
  }
  100% {
    transform: rotate(270deg);
  }
}

/* Hover Effects */
.progress-ring:hover .progress-ring-progress {
  @apply opacity-80;
}

.progress-ring:hover .progress-percentage {
  @apply scale-105;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .progress-ring-progress {
    @apply transition-none;
  }
  
  .progress-ring-progress--indeterminate,
  .progress-ring--indeterminate .progress-ring-svg {
    animation: none;
  }
  
  .progress-ring:hover .progress-percentage {
    @apply scale-100;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .progress-percentage {
    @apply text-base;
  }
  
  .progress-value {
    @apply text-xs;
  }
  
  .external-label-text {
    @apply text-xs;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .progress-ring-background {
    @apply stroke-neutral-900;
  }
  
  .progress-ring-progress {
    stroke-width: 10;
  }
}

/* Focus States for Accessibility */
.progress-ring:focus-within {
  @apply ring-2 ring-primary-500 ring-offset-2 rounded-full;
}

/* Enhanced Visual States */
.progress-ring-progress--gradient {
  filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.3));
}

.progress-ring--success .progress-ring-progress--gradient {
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.3));
}

.progress-ring--warning .progress-ring-progress--gradient {
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.3));
}

.progress-ring--error .progress-ring-progress--gradient {
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.3));
}

/* Pulse Effect for Indeterminate */
.progress-ring--indeterminate {
  animation: progress-ring-pulse 2s ease-in-out infinite;
}

@keyframes progress-ring-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Custom Properties for Dynamic Sizing */
.progress-ring {
  --ring-stroke-width: 8px;
}

.progress-ring-svg {
  width: var(--ring-size, 120px);
  height: var(--ring-size, 120px);
}

/* Completion Animation */
.progress-ring--completed .progress-ring-progress {
  animation: progress-ring-complete 0.6s ease-out;
}

@keyframes progress-ring-complete {
  0% {
    stroke-dashoffset: var(--initial-offset);
  }
  50% {
    stroke-dashoffset: calc(var(--initial-offset) * 0.5);
    stroke-width: calc(var(--ring-stroke-width) * 1.2);
  }
  100% {
    stroke-dashoffset: 0;
    stroke-width: var(--ring-stroke-width);
  }
}
</style>