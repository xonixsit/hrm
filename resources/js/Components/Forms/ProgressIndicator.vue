<template>
  <div class="progress-indicator" :class="indicatorClasses">
    <!-- Progress Steps -->
    <div class="progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id || index"
        :class="getStepClasses(step, index)"
        @click="handleStepClick(step, index)"
      >
        <!-- Step Connector Line (before step) -->
        <div
          v-if="index > 0"
          :class="getConnectorClasses(index)"
        ></div>

        <!-- Step Circle -->
        <div class="step-circle">
          <!-- Completed Step Icon -->
          <svg
            v-if="isStepCompleted(index)"
            class="step-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Current/Future Step Number -->
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>

        <!-- Step Label -->
        <div v-if="showLabels" class="step-label">
          <div class="step-title">{{ step.title || step.label }}</div>
          <div v-if="step.description && showDescriptions" class="step-description">
            {{ step.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar (alternative layout) -->
    <div v-if="variant === 'bar'" class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ currentStep + 1 }} of {{ steps.length }}
        <span v-if="showPercentage" class="progress-percentage">
          ({{ Math.round(progressPercentage) }}%)
        </span>
      </div>
    </div>

    <!-- Breadcrumb Style (alternative layout) -->
    <nav v-if="variant === 'breadcrumb'" class="progress-breadcrumb" aria-label="Registration progress">
      <ol class="breadcrumb-list">
        <li
          v-for="(step, index) in steps"
          :key="step.id || index"
          :class="getBreadcrumbItemClasses(index)"
        >
          <button
            v-if="isStepClickable(index)"
            @click="handleStepClick(step, index)"
            class="breadcrumb-button"
          >
            {{ step.title || step.label }}
          </button>
          <span v-else class="breadcrumb-text">
            {{ step.title || step.label }}
          </span>
          
          <!-- Breadcrumb Separator -->
          <svg
            v-if="index < steps.length - 1"
            class="breadcrumb-separator"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Steps configuration
  steps: {
    type: Array,
    required: true,
    default: () => []
  },
  
  // Current state
  currentStep: {
    type: Number,
    default: 0
  },
  
  // Display options
  variant: {
    type: String,
    default: 'steps',
    validator: (value) => ['steps', 'bar', 'breadcrumb'].includes(value)
  },
  
  showLabels: {
    type: Boolean,
    default: true
  },
  
  showDescriptions: {
    type: Boolean,
    default: false
  },
  
  showPercentage: {
    type: Boolean,
    default: false
  },
  
  // Interaction
  allowClickNavigation: {
    type: Boolean,
    default: false
  },
  
  // Styling
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['step-click']);

// Computed properties
const progressPercentage = computed(() => {
  if (props.steps.length === 0) return 0;
  return ((props.currentStep + 1) / props.steps.length) * 100;
});

const indicatorClasses = computed(() => [
  'progress-indicator',
  `progress-indicator--${props.variant}`,
  `progress-indicator--${props.size}`,
  `progress-indicator--${props.orientation}`,
  {
    'progress-indicator--clickable': props.allowClickNavigation,
    'progress-indicator--with-labels': props.showLabels,
    'progress-indicator--with-descriptions': props.showDescriptions
  },
  props.class
]);

// Methods
const isStepCompleted = (index) => {
  return index < props.currentStep;
};

const isStepCurrent = (index) => {
  return index === props.currentStep;
};

const isStepClickable = (index) => {
  return props.allowClickNavigation && index <= props.currentStep;
};

const getStepClasses = (step, index) => [
  'progress-step',
  {
    'progress-step--completed': isStepCompleted(index),
    'progress-step--current': isStepCurrent(index),
    'progress-step--future': index > props.currentStep,
    'progress-step--clickable': isStepClickable(index),
    'progress-step--disabled': step.disabled
  }
];

const getConnectorClasses = (index) => [
  'step-connector',
  {
    'step-connector--completed': index <= props.currentStep,
    'step-connector--future': index > props.currentStep
  }
];

const getBreadcrumbItemClasses = (index) => [
  'breadcrumb-item',
  {
    'breadcrumb-item--completed': isStepCompleted(index),
    'breadcrumb-item--current': isStepCurrent(index),
    'breadcrumb-item--future': index > props.currentStep
  }
];

const handleStepClick = (step, index) => {
  if (!isStepClickable(index) || step.disabled) return;
  
  emit('step-click', {
    step,
    index,
    stepId: step.id
  });
};
</script>

<style scoped>
/* Base indicator styles */
.progress-indicator {
  @apply w-full;
}

/* Steps variant */
.progress-indicator--steps.progress-indicator--horizontal .progress-steps {
  @apply flex items-center justify-between relative;
}

.progress-indicator--steps.progress-indicator--vertical .progress-steps {
  @apply flex flex-col space-y-4;
}

/* Progress step */
.progress-step {
  @apply relative flex items-center;
}

.progress-indicator--horizontal .progress-step {
  @apply flex-col text-center;
}

.progress-indicator--vertical .progress-step {
  @apply flex-row space-x-3;
}

.progress-step--clickable {
  @apply cursor-pointer;
}

.progress-step--disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Step circle */
.step-circle {
  @apply flex items-center justify-center rounded-full border-2 transition-all duration-200 relative z-10;
}

/* Size variants for step circle */
.progress-indicator--sm .step-circle {
  @apply w-6 h-6 text-xs;
}

.progress-indicator--md .step-circle {
  @apply w-8 h-8 text-sm;
}

.progress-indicator--lg .step-circle {
  @apply w-10 h-10 text-base;
}

/* Step circle states */
.progress-step--completed .step-circle {
  @apply bg-success-600 border-success-600 text-white;
}

.progress-step--current .step-circle {
  @apply bg-primary-600 border-primary-600 text-white;
}

.progress-step .step-circle {
  @apply bg-white border-neutral-300 text-neutral-600;
}

.progress-step--future .step-circle {
  @apply bg-neutral-100 border-neutral-300 text-neutral-400;
}

/* Step icon and number */
.step-icon {
  @apply w-3 h-3;
}

.progress-indicator--sm .step-icon {
  @apply w-2.5 h-2.5;
}

.progress-indicator--lg .step-icon {
  @apply w-4 h-4;
}

.step-number {
  @apply font-medium;
}

/* Step connector lines */
.step-connector {
  @apply absolute bg-neutral-300 transition-colors duration-200;
}

.progress-indicator--horizontal .step-connector {
  @apply h-0.5 w-full top-1/2 transform -translate-y-1/2 -left-1/2 -z-10;
}

.progress-indicator--vertical .step-connector {
  @apply w-0.5 h-full left-1/2 transform -translate-x-1/2 -top-1/2 -z-10;
}

.step-connector--completed {
  @apply bg-success-600;
}

/* Step labels */
.step-label {
  @apply mt-2;
}

.progress-indicator--vertical .step-label {
  @apply mt-0 flex-1 min-w-0;
}

.step-title {
  @apply font-medium text-neutral-900;
}

.progress-step--current .step-title {
  @apply text-primary-600;
}

.progress-step--completed .step-title {
  @apply text-success-600;
}

.progress-step--future .step-title {
  @apply text-neutral-500;
}

.step-description {
  @apply text-sm text-neutral-600 mt-1;
}

/* Size variants for labels */
.progress-indicator--sm .step-title {
  @apply text-xs;
}

.progress-indicator--sm .step-description {
  @apply text-xs;
}

.progress-indicator--md .step-title {
  @apply text-sm;
}

.progress-indicator--lg .step-title {
  @apply text-base;
}

.progress-indicator--lg .step-description {
  @apply text-base;
}

/* Progress bar variant */
.progress-bar-container {
  @apply space-y-2;
}

.progress-bar {
  @apply w-full bg-neutral-200 rounded-full overflow-hidden;
}

.progress-indicator--sm .progress-bar {
  @apply h-1;
}

.progress-indicator--md .progress-bar {
  @apply h-2;
}

.progress-indicator--lg .progress-bar {
  @apply h-3;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out;
}

.progress-text {
  @apply text-center text-neutral-600 font-medium;
}

.progress-indicator--sm .progress-text {
  @apply text-xs;
}

.progress-indicator--md .progress-text {
  @apply text-sm;
}

.progress-indicator--lg .progress-text {
  @apply text-base;
}

.progress-percentage {
  @apply text-neutral-500;
}

/* Breadcrumb variant */
.progress-breadcrumb {
  @apply w-full;
}

.breadcrumb-list {
  @apply flex items-center space-x-1 flex-wrap;
}

.breadcrumb-item {
  @apply flex items-center;
}

.breadcrumb-button {
  @apply text-neutral-600 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1;
}

.breadcrumb-item--current .breadcrumb-button,
.breadcrumb-item--current .breadcrumb-text {
  @apply text-primary-600 font-medium;
}

.breadcrumb-item--completed .breadcrumb-button {
  @apply text-success-600;
}

.breadcrumb-text {
  @apply text-neutral-600 px-1;
}

.breadcrumb-separator {
  @apply w-4 h-4 text-neutral-400 mx-1 flex-shrink-0;
}

/* Size variants for breadcrumb */
.progress-indicator--sm .breadcrumb-button,
.progress-indicator--sm .breadcrumb-text {
  @apply text-xs;
}

.progress-indicator--sm .breadcrumb-separator {
  @apply w-3 h-3;
}

.progress-indicator--md .breadcrumb-button,
.progress-indicator--md .breadcrumb-text {
  @apply text-sm;
}

.progress-indicator--lg .breadcrumb-button,
.progress-indicator--lg .breadcrumb-text {
  @apply text-base;
}

.progress-indicator--lg .breadcrumb-separator {
  @apply w-5 h-5;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .progress-indicator--horizontal .progress-steps {
    @apply flex-col space-y-4;
  }
  
  .progress-indicator--horizontal .progress-step {
    @apply flex-row text-left space-x-3;
  }
  
  .progress-indicator--horizontal .step-label {
    @apply mt-0 flex-1;
  }
  
  .breadcrumb-list {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  
  .breadcrumb-separator {
    @apply hidden;
  }
}

/* Dark theme adjustments */
.theme-dark .progress-step .step-circle {
  @apply bg-neutral-800 border-neutral-600 text-neutral-400;
}

.theme-dark .progress-step--future .step-circle {
  @apply bg-neutral-700 border-neutral-600 text-neutral-500;
}

.theme-dark .step-title {
  @apply text-neutral-200;
}

.theme-dark .progress-step--future .step-title {
  @apply text-neutral-400;
}

.theme-dark .step-description {
  @apply text-neutral-400;
}

.theme-dark .step-connector {
  @apply bg-neutral-600;
}

.theme-dark .progress-bar {
  @apply bg-neutral-700;
}

.theme-dark .progress-text {
  @apply text-neutral-300;
}

.theme-dark .progress-percentage {
  @apply text-neutral-400;
}

.theme-dark .breadcrumb-button {
  @apply text-neutral-400 hover:text-primary-400;
}

.theme-dark .breadcrumb-text {
  @apply text-neutral-400;
}

.theme-dark .breadcrumb-separator {
  @apply text-neutral-500;
}

/* Hover effects */
.progress-step--clickable:hover .step-circle {
  @apply scale-110;
}

.progress-step--clickable:hover .step-title {
  @apply text-primary-600;
}

/* Focus states */
.progress-step--clickable:focus-within .step-circle {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

/* Animation */
.progress-fill {
  transition: width 0.5s ease-out;
}

.step-circle {
  transition: all 0.2s ease-out;
}

.step-title {
  transition: color 0.2s ease-out;
}
</style>