<template>
  <form :class="formClasses" @submit="handleSubmit" novalidate>
    <!-- Form Header -->
    <div v-if="hasHeader" class="form-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h2 v-if="title" class="form-title">{{ title }}</h2>
            <p v-if="description" class="form-description">{{ description }}</p>
          </div>
          <div v-if="hasHeaderActions" class="header-actions">
            <slot name="header-actions">
              <button
                v-for="action in headerActions"
                :key="action.id"
                @click="handleHeaderAction(action)"
                :disabled="action.disabled"
                :class="getActionClasses(action)"
                type="button"
              >
                <component v-if="action.icon" :is="action.icon" class="action-icon" />
                <span v-if="action.label">{{ action.label }}</span>
              </button>
            </slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Progress Indicator (for multi-step forms) -->
    <div v-if="showProgress" class="form-progress">
      <slot name="progress">
        <div class="progress-container">
          <div class="progress-steps">
            <div
              v-for="(step, index) in steps"
              :key="step.id || index"
              :class="getStepClasses(step, index)"
              @click="handleStepClick(step, index)"
            >
              <div class="step-indicator">
                <span v-if="isStepCompleted(step, index)" class="step-check">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span v-else class="step-number">{{ index + 1 }}</span>
              </div>
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div v-if="step.description" class="step-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </slot>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <!-- Error Summary -->
      <div v-if="showErrorSummary && hasErrors" class="form-error-summary">
        <div class="error-summary-header">
          <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <h3 class="error-summary-title">Please correct the following errors:</h3>
        </div>
        <ul class="error-summary-list">
          <li v-for="error in formErrors" :key="error.field" class="error-summary-item">
            <button
              type="button"
              @click="focusField(error.field)"
              class="error-summary-link"
            >
              {{ error.message }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Form Sections -->
      <div class="form-sections">
        <slot />
      </div>
    </div>

    <!-- Form Actions -->
    <div v-if="hasActions" class="form-actions">
      <slot name="actions">
        <div class="actions-content">
          <!-- Secondary Actions -->
          <div class="secondary-actions">
            <button
              v-for="action in secondaryActions"
              :key="action.id"
              @click="handleAction(action)"
              :disabled="action.disabled || isSubmitting"
              :class="getActionClasses(action)"
              type="button"
            >
              <component v-if="action.icon" :is="action.icon" class="action-icon" />
              <span>{{ action.label }}</span>
            </button>
          </div>

          <!-- Primary Actions -->
          <div class="primary-actions">
            <button
              v-for="action in primaryActions"
              :key="action.id"
              @click="handleAction(action)"
              :disabled="action.disabled || isSubmitting"
              :class="getActionClasses(action)"
              :type="action.type || 'button'"
            >
              <component v-if="action.icon && !isSubmitting" :is="action.icon" class="action-icon" />
              <svg v-if="isSubmitting && action.type === 'submit'" class="action-icon animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSubmitting && action.type === 'submit' ? (action.loadingLabel || 'Submitting...') : action.label }}</span>
            </button>
          </div>
        </div>
      </slot>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, provide, useSlots } from 'vue';

const props = defineProps({
  // Form content
  title: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  headerActions: {
    type: Array,
    default: () => []
  },
  
  // Multi-step form
  steps: {
    type: Array,
    default: () => []
  },
  
  currentStep: {
    type: Number,
    default: 0
  },
  
  // Form state
  errors: {
    type: Object,
    default: () => ({})
  },
  
  isSubmitting: {
    type: Boolean,
    default: false
  },
  
  // Display options
  showErrorSummary: {
    type: Boolean,
    default: true
  },
  
  showProgress: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'modal', 'inline'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Layout
  spacing: {
    type: String,
    default: 'normal',
    validator: (value) => ['tight', 'normal', 'loose'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['submit', 'action', 'header-action', 'step-change', 'field-focus']);

// Composables
const slots = useSlots();

// Local state
const formRef = ref(null);

// Computed properties
const hasHeader = computed(() => {
  return props.title || props.description || hasHeaderActions.value || slots.header;
});

const hasHeaderActions = computed(() => {
  return props.headerActions?.length > 0 || !!slots['header-actions'];
});

const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions;
});

const primaryActions = computed(() => {
  return props.actions.filter(action => action.variant === 'primary' || action.type === 'submit');
});

const secondaryActions = computed(() => {
  return props.actions.filter(action => action.variant !== 'primary' && action.type !== 'submit');
});

const formErrors = computed(() => {
  return Object.entries(props.errors).map(([field, message]) => ({
    field,
    message: Array.isArray(message) ? message[0] : message
  }));
});

const hasErrors = computed(() => {
  return Object.keys(props.errors).length > 0;
});

const progressPercentage = computed(() => {
  if (!props.steps.length) return 0;
  return ((props.currentStep + 1) / props.steps.length) * 100;
});

const formClasses = computed(() => [
  'form-layout',
  `form-layout--${props.variant}`,
  `form-layout--${props.size}`,
  `form-layout--spacing-${props.spacing}`,
  {
    'form-layout--has-header': hasHeader.value,
    'form-layout--has-actions': hasActions.value,
    'form-layout--has-progress': props.showProgress,
    'form-layout--has-errors': hasErrors.value,
    'form-layout--submitting': props.isSubmitting
  },
  props.class
]);

// Provide form context to child components
provide('formContext', {
  errors: computed(() => props.errors),
  isSubmitting: computed(() => props.isSubmitting),
  variant: computed(() => props.variant),
  size: computed(() => props.size)
});

// Methods
const handleSubmit = (event) => {
  event.preventDefault();
  emit('submit', event);
};

const handleAction = (action) => {
  if (action.disabled || props.isSubmitting) return;
  emit('action', action);
};

const handleHeaderAction = (action) => {
  if (action.disabled) return;
  emit('header-action', action);
};

const handleStepClick = (step, index) => {
  if (step.disabled || index > props.currentStep) return;
  emit('step-change', { step, index });
};

const focusField = (fieldName) => {
  const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
  if (field) {
    field.focus();
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    emit('field-focus', fieldName);
  }
};

const isStepCompleted = (step, index) => {
  return index < props.currentStep;
};

const getStepClasses = (step, index) => [
  'progress-step',
  {
    'progress-step--current': index === props.currentStep,
    'progress-step--completed': index < props.currentStep,
    'progress-step--disabled': step.disabled || index > props.currentStep,
    'progress-step--clickable': !step.disabled && index <= props.currentStep
  }
];

const getActionClasses = (action) => [
  'form-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-3 py-2 text-sm': action.size === 'sm' || (!action.size && props.size === 'sm'),
    'px-4 py-2 text-base': action.size === 'md' || (!action.size && props.size === 'md'),
    'px-6 py-3 text-lg': action.size === 'lg' || (!action.size && props.size === 'lg'),
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary' || !action.variant,
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled || props.isSubmitting,
    'space-x-2': action.icon && action.label
  }
];

// Expose methods for parent components
defineExpose({
  focusField,
  formRef
});
</script>

<style scoped>
/* Base Form Styles */
.form-layout {
  @apply space-y-6;
}

/* Form Variants */
.form-layout--default {
  @apply bg-white;
}

.form-layout--card {
  @apply bg-white border border-neutral-200 rounded-lg p-6;
}

.form-layout--modal {
  @apply bg-white rounded-lg shadow-lg;
}

.form-layout--inline {
  @apply bg-transparent;
}

/* Size Variants */
.form-layout--sm {
  @apply space-y-4 text-sm;
}

.form-layout--md {
  @apply space-y-6 text-base;
}

.form-layout--lg {
  @apply space-y-8 text-lg;
}

.form-layout--xl {
  @apply space-y-10 text-xl;
}

/* Spacing Variants */
.form-layout--spacing-tight {
  @apply space-y-4;
}

.form-layout--spacing-normal {
  @apply space-y-6;
}

.form-layout--spacing-loose {
  @apply space-y-8;
}

/* Form Header */
.form-header {
  @apply pb-4 border-b border-neutral-200;
}

.form-layout--card .form-header {
  @apply -m-6 mb-6 p-6;
}

.header-content {
  @apply flex items-start justify-between gap-4;
}

.title-area {
  @apply flex-1 min-w-0;
}

.form-title {
  @apply text-2xl font-bold text-neutral-900 leading-tight;
}

.form-layout--sm .form-title {
  @apply text-xl;
}

.form-layout--lg .form-title {
  @apply text-3xl;
}

.form-description {
  @apply mt-2 text-neutral-600 leading-relaxed;
}

.header-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* Progress Indicator */
.form-progress {
  @apply pb-6 border-b border-neutral-200;
}

.progress-container {
  @apply relative;
}

.progress-steps {
  @apply flex items-center justify-between relative z-10;
}

.progress-step {
  @apply flex items-center space-x-3 flex-1;
}

.progress-step--clickable {
  @apply cursor-pointer;
}

.step-indicator {
  @apply flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors;
}

.progress-step--current .step-indicator {
  @apply bg-primary-600 border-primary-600 text-white;
}

.progress-step--completed .step-indicator {
  @apply bg-success-600 border-success-600 text-white;
}

.progress-step .step-indicator {
  @apply bg-white border-neutral-300 text-neutral-600;
}

.step-number,
.step-check {
  @apply text-sm font-medium;
}

.step-content {
  @apply flex-1 min-w-0;
}

.step-title {
  @apply font-medium text-neutral-900;
}

.progress-step--current .step-title {
  @apply text-primary-600;
}

.step-description {
  @apply text-sm text-neutral-600 mt-1;
}

.progress-bar {
  @apply absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -z-10;
}

.progress-fill {
  @apply h-full bg-primary-600 transition-all duration-300 ease-out;
}

/* Error Summary */
.form-error-summary {
  @apply bg-error-50 border border-error-200 rounded-lg p-4;
}

.error-summary-header {
  @apply flex items-center space-x-2 mb-3;
}

.error-icon {
  @apply w-5 h-5 text-error-600 flex-shrink-0;
}

.error-summary-title {
  @apply font-medium text-error-900;
}

.error-summary-list {
  @apply space-y-1;
}

.error-summary-item {
  @apply text-sm;
}

.error-summary-link {
  @apply text-error-700 hover:text-error-900 underline focus:outline-none focus:ring-2 focus:ring-error-500 rounded;
}

/* Form Content */
.form-content {
  @apply space-y-6;
}

.form-sections {
  @apply space-y-6;
}

.form-layout--spacing-tight .form-sections {
  @apply space-y-4;
}

.form-layout--spacing-loose .form-sections {
  @apply space-y-8;
}

/* Form Actions */
.form-actions {
  @apply pt-6 border-t border-neutral-200;
}

.form-layout--card .form-actions {
  @apply -m-6 mt-6 p-6;
}

.actions-content {
  @apply flex items-center justify-between gap-4;
}

.secondary-actions {
  @apply flex items-center space-x-3;
}

.primary-actions {
  @apply flex items-center space-x-3;
}

.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply justify-end;
  }
  
  .actions-content {
    @apply flex-col-reverse items-stretch gap-3;
  }
  
  .secondary-actions,
  .primary-actions {
    @apply justify-center;
  }
  
  .progress-steps {
    @apply flex-col space-y-4;
  }
  
  .progress-step {
    @apply flex-row space-x-3;
  }
}

/* Dark Theme Adjustments */
.theme-dark .form-layout--default,
.theme-dark .form-layout--card {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .form-header {
  @apply border-neutral-700;
}

.theme-dark .form-title {
  @apply text-neutral-100;
}

.theme-dark .form-description {
  @apply text-neutral-400;
}

.theme-dark .form-progress {
  @apply border-neutral-700;
}

.theme-dark .step-title {
  @apply text-neutral-200;
}

.theme-dark .step-description {
  @apply text-neutral-400;
}

.theme-dark .progress-bar {
  @apply bg-neutral-700;
}

.theme-dark .form-actions {
  @apply border-neutral-700;
}

.theme-dark .form-error-summary {
  @apply bg-error-900 border-error-700;
}

.theme-dark .error-summary-title {
  @apply text-error-100;
}

.theme-dark .error-summary-link {
  @apply text-error-300 hover:text-error-100;
}

/* Loading State */
.form-layout--submitting {
  @apply pointer-events-none;
}

.form-layout--submitting .form-action-button:not([type="submit"]) {
  @apply opacity-50;
}

/* Focus States */
.form-action-button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* Animation */
.progress-fill {
  transition: width 0.3s ease-out;
}

.step-indicator {
  transition: all 0.2s ease-out;
}
</style>