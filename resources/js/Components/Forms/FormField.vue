<template>
  <div class="form-field" :class="fieldClasses">
    <!-- Field Label -->
    <label
      v-if="label && !hideLabel"
      :for="fieldId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1" aria-label="required">*</span>
      <span v-if="optional && !required" class="text-neutral-400 ml-1 text-xs">(optional)</span>
    </label>

    <!-- Field Content -->
    <div class="field-content" :class="contentClasses">
      <slot
        :field-id="fieldId"
        :has-error="hasError"
        :error-message="computedErrorMessage"
        :help-text="computedHelpText"
        :aria-describedby="ariaDescribedBy"
      />
    </div>

    <!-- Help Text -->
    <div
      v-if="computedHelpText && !hasError"
      :id="`${fieldId}-help`"
      class="field-help"
      :class="helpClasses"
    >
      <Icon v-if="helpIcon" :name="helpIcon" class="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{{ computedHelpText }}</span>
    </div>

    <!-- Error Message -->
    <div
      v-if="hasError"
      :id="`${fieldId}-error`"
      class="field-error"
      :class="errorClasses"
      role="alert"
      aria-live="polite"
    >
      <Icon name="exclamation-circle" class="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{{ computedErrorMessage }}</span>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      :id="`${fieldId}-success`"
      class="field-success"
      :class="successClasses"
      role="status"
      aria-live="polite"
    >
      <Icon name="check-circle" class="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, provide } from 'vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // Field identification
  name: {
    type: String,
    default: ''
  },
  
  id: {
    type: String,
    default: ''
  },
  
  // Label
  label: {
    type: String,
    default: ''
  },
  
  hideLabel: {
    type: Boolean,
    default: false
  },
  
  // Field state
  required: {
    type: Boolean,
    default: false
  },
  
  optional: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Messages
  helpText: {
    type: String,
    default: ''
  },
  
  helpIcon: {
    type: String,
    default: ''
  },
  
  errorMessage: {
    type: [String, Array],
    default: ''
  },
  
  successMessage: {
    type: String,
    default: ''
  },
  
  // Layout
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', 'inline'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'floating', 'minimal'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  },
  
  labelClass: {
    type: [String, Array, Object],
    default: ''
  },
  
  contentClass: {
    type: [String, Array, Object],
    default: ''
  }
});

// Inject form context if available
const formContext = inject('formContext', null);

// Generate unique field ID
const fieldId = computed(() => {
  if (props.id) return props.id;
  if (props.name) return `field-${props.name}`;
  return `field-${Math.random().toString(36).substr(2, 9)}`;
});

// Computed properties
const hasError = computed(() => {
  if (Array.isArray(props.errorMessage)) {
    return props.errorMessage.length > 0;
  }
  return Boolean(props.errorMessage);
});

const computedErrorMessage = computed(() => {
  if (Array.isArray(props.errorMessage)) {
    return props.errorMessage[0] || '';
  }
  return props.errorMessage || '';
});

const computedHelpText = computed(() => {
  // Use form context help text if available and no local help text
  if (!props.helpText && formContext?.getFieldHelp) {
    return formContext.getFieldHelp(props.name);
  }
  return props.helpText;
});

const ariaDescribedBy = computed(() => {
  const describedBy = [];
  
  if (computedHelpText.value && !hasError.value) {
    describedBy.push(`${fieldId.value}-help`);
  }
  
  if (hasError.value) {
    describedBy.push(`${fieldId.value}-error`);
  }
  
  if (props.successMessage) {
    describedBy.push(`${fieldId.value}-success`);
  }
  
  return describedBy.length > 0 ? describedBy.join(' ') : undefined;
});

// Styling classes
const fieldClasses = computed(() => [
  'form-field',
  `form-field--${props.layout}`,
  `form-field--${props.size}`,
  `form-field--${props.variant}`,
  {
    'form-field--required': props.required,
    'form-field--optional': props.optional && !props.required,
    'form-field--disabled': props.disabled,
    'form-field--error': hasError.value,
    'form-field--success': props.successMessage
  },
  props.class
]);

const labelClasses = computed(() => [
  'form-field__label',
  'block font-medium transition-colors duration-200',
  {
    // Size classes
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md',
    'text-base': props.size === 'lg',
    
    // Layout classes
    'mb-1': props.layout === 'vertical',
    'mb-0 mr-3 flex-shrink-0': props.layout === 'horizontal',
    'mb-0 mr-2': props.layout === 'inline',
    
    // State classes
    'text-neutral-700': !hasError.value && !props.disabled,
    'text-error-600': hasError.value,
    'text-neutral-500': props.disabled,
    
    // Variant classes
    'sr-only': props.hideLabel
  },
  props.labelClass
]);

const contentClasses = computed(() => [
  'form-field__content',
  {
    // Layout classes
    'flex-1': props.layout === 'horizontal' || props.layout === 'inline'
  },
  props.contentClass
]);

const helpClasses = computed(() => [
  'form-field__help',
  'flex items-start mt-1 text-neutral-600',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md' || props.size === 'lg'
  }
]);

const errorClasses = computed(() => [
  'form-field__error',
  'flex items-start mt-1 text-error-600',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md' || props.size === 'lg'
  }
]);

const successClasses = computed(() => [
  'form-field__success',
  'flex items-start mt-1 text-success-600',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md' || props.size === 'lg'
  }
]);

// Provide field context to child components
provide('fieldContext', {
  fieldId: fieldId.value,
  hasError: hasError.value,
  errorMessage: computedErrorMessage.value,
  helpText: computedHelpText.value,
  ariaDescribedBy: ariaDescribedBy.value,
  required: props.required,
  disabled: props.disabled,
  size: props.size,
  variant: props.variant
});
</script>

<style scoped>
/* Base field styles */
.form-field {
  @apply relative;
}

/* Layout variants */
.form-field--horizontal {
  @apply flex items-start;
}

.form-field--horizontal .form-field__label {
  @apply w-1/3 pt-2;
}

.form-field--horizontal .form-field__content {
  @apply w-2/3;
}

.form-field--inline {
  @apply flex items-center;
}

/* Size variants */
.form-field--sm {
  @apply space-y-1;
}

.form-field--md {
  @apply space-y-1.5;
}

.form-field--lg {
  @apply space-y-2;
}

/* Variant styles */
.form-field--floating .form-field__label {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10;
  @apply transition-all duration-200 ease-out;
}

.form-field--floating.form-field--focused .form-field__label,
.form-field--floating.form-field--has-value .form-field__label {
  @apply text-xs -translate-y-6 bg-white px-1 left-2;
}

.form-field--minimal .form-field__label {
  @apply text-neutral-500 font-normal;
}

/* State styles */
.form-field--error .form-field__label {
  @apply text-error-600;
}

.form-field--disabled {
  @apply opacity-60 pointer-events-none;
}

/* Focus styles */
.form-field:focus-within .form-field__label {
  @apply text-primary-600;
}

.form-field--error:focus-within .form-field__label {
  @apply text-error-600;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .form-field--horizontal {
    @apply flex-col;
  }
  
  .form-field--horizontal .form-field__label {
    @apply w-full mb-1 pt-0;
  }
  
  .form-field--horizontal .form-field__content {
    @apply w-full;
  }
}

/* Animation for messages */
.field-help,
.field-error,
.field-success {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>