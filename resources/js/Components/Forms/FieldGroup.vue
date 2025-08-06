<template>
  <fieldset class="field-group" :class="groupClasses">
    <!-- Group Legend/Title -->
    <legend
      v-if="title"
      class="field-group__legend"
      :class="legendClasses"
    >
      {{ title }}
      <span v-if="required" class="text-error-500 ml-1" aria-label="required">*</span>
    </legend>

    <!-- Group Description -->
    <div
      v-if="description"
      class="field-group__description"
      :class="descriptionClasses"
    >
      {{ description }}
    </div>

    <!-- Group Content -->
    <div class="field-group__content" :class="contentClasses">
      <slot
        :group-id="groupId"
        :has-error="hasGroupError"
        :error-messages="groupErrorMessages"
      />
    </div>

    <!-- Group Error Messages -->
    <div
      v-if="hasGroupError && showGroupErrors"
      class="field-group__errors"
      :class="errorsClasses"
      role="alert"
      aria-live="polite"
    >
      <div
        v-for="(error, index) in groupErrorMessages"
        :key="index"
        class="flex items-start"
      >
        <Icon name="exclamation-circle" class="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Group Help Text -->
    <div
      v-if="helpText && !hasGroupError"
      class="field-group__help"
      :class="helpClasses"
    >
      <Icon v-if="helpIcon" :name="helpIcon" class="w-4 h-4 mr-2 flex-shrink-0" />
      <span>{{ helpText }}</span>
    </div>
  </fieldset>
</template>

<script setup>
import { computed, provide, ref, onMounted, onUnmounted } from 'vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // Group identification
  name: {
    type: String,
    default: ''
  },
  
  id: {
    type: String,
    default: ''
  },
  
  // Content
  title: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
  },
  
  helpText: {
    type: String,
    default: ''
  },
  
  helpIcon: {
    type: String,
    default: ''
  },
  
  // State
  required: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Error handling
  errorMessages: {
    type: [String, Array],
    default: () => []
  },
  
  showGroupErrors: {
    type: Boolean,
    default: true
  },
  
  // Layout
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', 'grid', 'inline'].includes(value)
  },
  
  columns: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 6
  },
  
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'bordered', 'minimal'].includes(value)
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

// Generate unique group ID
const groupId = computed(() => {
  if (props.id) return props.id;
  if (props.name) return `group-${props.name}`;
  return `group-${Math.random().toString(36).substr(2, 9)}`;
});

// Track child field errors
const childErrors = ref(new Map());

// Computed properties
const hasGroupError = computed(() => {
  const hasDirectErrors = Array.isArray(props.errorMessages) 
    ? props.errorMessages.length > 0 
    : Boolean(props.errorMessages);
  
  const hasChildErrors = Array.from(childErrors.value.values()).some(error => Boolean(error));
  
  return hasDirectErrors || hasChildErrors;
});

const groupErrorMessages = computed(() => {
  const errors = [];
  
  // Add direct error messages
  if (Array.isArray(props.errorMessages)) {
    errors.push(...props.errorMessages.filter(Boolean));
  } else if (props.errorMessages) {
    errors.push(props.errorMessages);
  }
  
  return errors;
});

// Styling classes
const groupClasses = computed(() => [
  'field-group',
  `field-group--${props.layout}`,
  `field-group--${props.variant}`,
  `field-group--${props.size}`,
  {
    'field-group--required': props.required,
    'field-group--disabled': props.disabled,
    'field-group--error': hasGroupError.value
  },
  props.class
]);

const legendClasses = computed(() => [
  'field-group__legend',
  'font-medium text-neutral-900 mb-2',
  {
    // Size classes
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
    
    // State classes
    'text-error-600': hasGroupError.value,
    'text-neutral-500': props.disabled
  }
]);

const descriptionClasses = computed(() => [
  'field-group__description',
  'text-neutral-600 mb-3',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md',
    'text-base': props.size === 'lg'
  }
]);

const contentClasses = computed(() => {
  const baseClasses = ['field-group__content'];
  
  // Layout classes
  switch (props.layout) {
    case 'horizontal':
      baseClasses.push('flex flex-wrap');
      break;
    case 'grid':
      baseClasses.push('grid');
      baseClasses.push(`grid-cols-1 md:grid-cols-${Math.min(props.columns, 3)}`);
      break;
    case 'inline':
      baseClasses.push('flex flex-wrap items-end');
      break;
    default:
      baseClasses.push('space-y-4');
  }
  
  // Gap classes
  const gapClasses = {
    sm: props.layout === 'grid' ? 'gap-3' : 'space-x-3',
    md: props.layout === 'grid' ? 'gap-4' : 'space-x-4',
    lg: props.layout === 'grid' ? 'gap-6' : 'space-x-6',
    xl: props.layout === 'grid' ? 'gap-8' : 'space-x-8'
  };
  
  if (props.layout !== 'vertical') {
    baseClasses.push(gapClasses[props.gap]);
  }
  
  return baseClasses;
});

const errorsClasses = computed(() => [
  'field-group__errors',
  'mt-2 space-y-1 text-error-600',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md' || props.size === 'lg'
  }
]);

const helpClasses = computed(() => [
  'field-group__help',
  'mt-2 flex items-start text-neutral-600',
  {
    'text-xs': props.size === 'sm',
    'text-sm': props.size === 'md' || props.size === 'lg'
  }
]);

// Methods for child field error tracking
const registerFieldError = (fieldName, error) => {
  childErrors.value.set(fieldName, error);
};

const unregisterFieldError = (fieldName) => {
  childErrors.value.delete(fieldName);
};

// Provide group context to child components
provide('fieldGroupContext', {
  groupId: groupId.value,
  layout: props.layout,
  size: props.size,
  disabled: props.disabled,
  registerFieldError,
  unregisterFieldError
});

// Cleanup on unmount
onUnmounted(() => {
  childErrors.value.clear();
});
</script>

<style scoped>
/* Base group styles */
.field-group {
  @apply border-0 p-0 m-0;
}

/* Variant styles */
.field-group--card {
  @apply bg-white border border-neutral-200 rounded-lg p-6 shadow-sm;
}

.field-group--bordered {
  @apply border border-neutral-200 rounded-md p-4;
}

.field-group--minimal .field-group__legend {
  @apply text-neutral-600 font-normal text-sm;
}

/* Layout adjustments */
.field-group--horizontal .field-group__content > * {
  @apply flex-1 min-w-0;
}

.field-group--inline .field-group__content > * {
  @apply flex-shrink-0;
}

/* State styles */
.field-group--error .field-group__legend {
  @apply text-error-600;
}

.field-group--disabled {
  @apply opacity-60 pointer-events-none;
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .field-group--grid .field-group__content {
    @apply grid-cols-1;
  }
  
  .field-group--horizontal .field-group__content {
    @apply flex-col space-x-0 space-y-4;
  }
  
  .field-group--inline .field-group__content {
    @apply flex-col items-stretch space-x-0 space-y-3;
  }
}

/* Animation for error messages */
.field-group__errors {
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

/* Focus styles */
.field-group:focus-within .field-group__legend {
  @apply text-primary-600;
}

.field-group--error:focus-within .field-group__legend {
  @apply text-error-600;
}
</style>