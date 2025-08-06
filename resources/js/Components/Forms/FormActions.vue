<template>
  <div :class="actionsClasses">
    <div class="actions-content">
      <!-- Secondary Actions (Left side) -->
      <div v-if="secondaryActions.length || $slots.secondary" class="secondary-actions">
        <slot name="secondary">
          <button
            v-for="action in secondaryActions"
            :key="action.id"
            @click="handleAction(action)"
            :disabled="action.disabled || disabled"
            :class="getActionClasses(action)"
            :type="action.type || 'button'"
          >
            <component v-if="action.icon" :is="action.icon" class="action-icon" />
            <span>{{ action.label }}</span>
          </button>
        </slot>
      </div>

      <!-- Primary Actions (Right side) -->
      <div class="primary-actions">
        <slot name="primary">
          <button
            v-for="action in primaryActions"
            :key="action.id"
            @click="handleAction(action)"
            :disabled="action.disabled || disabled"
            :class="getActionClasses(action)"
            :type="action.type || 'button'"
          >
            <component 
              v-if="action.icon && !(loading && action.type === 'submit')" 
              :is="action.icon" 
              class="action-icon" 
            />
            <svg 
              v-if="loading && action.type === 'submit'" 
              class="action-icon animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>
              {{ loading && action.type === 'submit' ? (action.loadingLabel || loadingLabel) : action.label }}
            </span>
          </button>
        </slot>
      </div>
    </div>

    <!-- Help Text -->
    <div v-if="helpText || $slots.help" class="actions-help">
      <slot name="help">
        <p class="help-text">{{ helpText }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  // State
  loading: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Labels
  loadingLabel: {
    type: String,
    default: 'Processing...'
  },
  
  helpText: {
    type: String,
    default: ''
  },
  
  // Layout
  alignment: {
    type: String,
    default: 'between',
    validator: (value) => ['left', 'center', 'right', 'between', 'around'].includes(value)
  },
  
  direction: {
    type: String,
    default: 'row',
    validator: (value) => ['row', 'column', 'row-reverse'].includes(value)
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'sticky'].includes(value)
  },
  
  size: {
    type: String,
    default: '',
    validator: (value) => ['', 'sm', 'md', 'lg'].includes(value)
  },
  
  // Spacing
  spacing: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['action']);

// Inject form context
const formContext = inject('formContext', {});

// Computed properties
const effectiveSize = computed(() => {
  return props.size || formContext.size?.value || 'md';
});

const primaryActions = computed(() => {
  return props.actions.filter(action => 
    action.variant === 'primary' || 
    action.type === 'submit' || 
    (!action.variant && action.type === 'submit')
  );
});

const secondaryActions = computed(() => {
  return props.actions.filter(action => 
    action.variant !== 'primary' && 
    action.type !== 'submit'
  );
});

const actionsClasses = computed(() => [
  'form-actions',
  `form-actions--${props.variant}`,
  `form-actions--${effectiveSize.value}`,
  `form-actions--${props.alignment}`,
  `form-actions--${props.direction}`,
  `form-actions--spacing-${props.spacing}`,
  {
    'form-actions--loading': props.loading,
    'form-actions--disabled': props.disabled,
    'form-actions--has-help': props.helpText || !!props.$slots?.help
  },
  props.class
]);

// Methods
const handleAction = (action) => {
  if (action.disabled || props.disabled) return;
  emit('action', action);
};

const getActionClasses = (action) => [
  'form-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-3 py-2 text-sm': action.size === 'sm' || (!action.size && effectiveSize.value === 'sm'),
    'px-4 py-2 text-base': action.size === 'md' || (!action.size && effectiveSize.value === 'md'),
    'px-6 py-3 text-lg': action.size === 'lg' || (!action.size && effectiveSize.value === 'lg'),
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary' || (!action.variant && action.type !== 'submit'),
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm': action.variant === 'danger',
    'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm': action.variant === 'success',
    'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm': action.variant === 'warning',
    
    // Submit button default styling
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm': action.type === 'submit' && !action.variant,
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled || props.disabled,
    'space-x-2': action.icon && action.label,
    
    // Loading state
    'cursor-wait': props.loading && action.type === 'submit'
  }
];
</script>

<style scoped>
/* Base Actions Styles */
.form-actions {
  @apply relative;
}

/* Variant Styles */
.form-actions--default {
  @apply pt-6 border-t border-neutral-200;
}

.form-actions--minimal {
  @apply pt-4;
}

.form-actions--sticky {
  @apply sticky bottom-0 bg-white border-t border-neutral-200 p-4 shadow-lg;
}

/* Size Variants */
.form-actions--sm {
  @apply pt-4;
}

.form-actions--md {
  @apply pt-6;
}

.form-actions--lg {
  @apply pt-8;
}

/* Spacing Variants */
.form-actions--spacing-sm .actions-content {
  @apply gap-2;
}

.form-actions--spacing-md .actions-content {
  @apply gap-3;
}

.form-actions--spacing-lg .actions-content {
  @apply gap-4;
}

.form-actions--spacing-xl .actions-content {
  @apply gap-6;
}

/* Actions Content */
.actions-content {
  @apply flex items-center;
}

/* Alignment Variants */
.form-actions--left .actions-content {
  @apply justify-start;
}

.form-actions--center .actions-content {
  @apply justify-center;
}

.form-actions--right .actions-content {
  @apply justify-end;
}

.form-actions--between .actions-content {
  @apply justify-between;
}

.form-actions--around .actions-content {
  @apply justify-around;
}

/* Direction Variants */
.form-actions--row .actions-content {
  @apply flex-row;
}

.form-actions--column .actions-content {
  @apply flex-col;
}

.form-actions--row-reverse .actions-content {
  @apply flex-row-reverse;
}

/* Action Groups */
.secondary-actions {
  @apply flex items-center space-x-3;
}

.primary-actions {
  @apply flex items-center space-x-3;
}

.form-actions--column .secondary-actions,
.form-actions--column .primary-actions {
  @apply space-x-0 space-y-3 flex-col;
}

/* Action Icons */
.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

/* Help Text */
.actions-help {
  @apply mt-4;
}

.help-text {
  @apply text-sm text-neutral-600 leading-relaxed;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .form-actions--between .actions-content {
    @apply flex-col-reverse items-stretch gap-3;
  }
  
  .form-actions--around .actions-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .secondary-actions,
  .primary-actions {
    @apply justify-center;
  }
  
  .form-actions--sticky {
    @apply p-3;
  }
}

/* Dark Theme Adjustments */
.theme-dark .form-actions--default {
  @apply border-neutral-700;
}

.theme-dark .form-actions--sticky {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .help-text {
  @apply text-neutral-400;
}

/* Loading State */
.form-actions--loading .form-action-button:not([type="submit"]) {
  @apply opacity-50 pointer-events-none;
}

/* Disabled State */
.form-actions--disabled .form-action-button {
  @apply opacity-50 cursor-not-allowed;
}

/* Focus States */
.form-action-button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

.theme-dark .form-action-button:focus {
  @apply ring-offset-neutral-800;
}

/* Hover Effects */
.form-action-button:hover:not(:disabled) {
  @apply transform -translate-y-0.5 shadow-md;
}

.form-action-button:active:not(:disabled) {
  @apply transform translate-y-0;
}

/* Animation */
.form-action-button {
  transition: all 0.2s ease-out;
}

.action-icon {
  transition: transform 0.2s ease-out;
}

/* Loading Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Button States */
.form-action-button[aria-pressed="true"] {
  @apply bg-primary-700 text-white;
}

.form-action-button:disabled {
  @apply transform-none shadow-none;
}

/* Accessibility */
.form-action-button[aria-describedby] {
  @apply focus:ring-2 focus:ring-primary-500;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .form-action-button {
    @apply border-2 border-current;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .form-action-button {
    @apply transition-none;
  }
  
  .action-icon {
    @apply transition-none;
  }
  
  .animate-spin {
    animation: none;
  }
}
</style>