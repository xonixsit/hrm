<template>
  <div class="base-input-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative" :class="containerClasses">
      <!-- Left Icon -->
      <div
        v-if="iconLeft"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <component
          :is="iconLeft"
          :class="iconClasses"
        />
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="computedPlaceholder"
        :disabled="computedDisabled"
        :readonly="readonly"
        :required="computedRequired"
        :autocomplete="autocomplete"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError"
        :aria-required="computedRequired"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Right Icon / Clear Button -->
      <div
        v-if="iconRight || (clearable && modelValue)"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          class="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          @click="handleClear"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Right Icon -->
        <component
          v-else-if="iconRight"
          :is="iconRight"
          :class="iconClasses"
        />
      </div>
    </div>

    <!-- Help Text / Error Message (only show if not using FormField wrapper) -->
    <div v-if="!fieldContext && (computedHelpText || computedErrorMessage)" class="mt-1">
      <p
        v-if="computedErrorMessage"
        :id="`${inputId}-error`"
        class="text-sm text-error-500"
        role="alert"
        aria-live="polite"
      >
        {{ computedErrorMessage }}
      </p>
      <p
        v-else-if="computedHelpText"
        :id="`${inputId}-help`"
        class="text-sm text-neutral-500"
      >
        {{ computedHelpText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, inject } from 'vue';

const props = defineProps({
  // v-model
  modelValue: {
    type: [String, Number],
    default: ''
  },
  
  // Basic props
  label: {
    type: String,
    default: ''
  },
  
  placeholder: {
    type: String,
    default: ''
  },
  
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'email', 'password', 'number', 'tel', 'url', 'search'
    ].includes(value)
  },
  
  // Size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // States
  disabled: {
    type: Boolean,
    default: false
  },
  
  readonly: {
    type: Boolean,
    default: false
  },
  
  required: {
    type: Boolean,
    default: false
  },
  
  // Validation
  errorMessage: {
    type: String,
    default: ''
  },
  
  helpText: {
    type: String,
    default: ''
  },
  
  // Icons
  iconLeft: {
    type: [String, Object],
    default: null
  },
  
  iconRight: {
    type: [String, Object],
    default: null
  },
  
  // Features
  clearable: {
    type: Boolean,
    default: false
  },
  
  floatingLabel: {
    type: Boolean,
    default: true
  },
  
  // HTML attributes
  autocomplete: {
    type: String,
    default: 'off'
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  },
  
  // Accessibility props
  ariaLabel: {
    type: String,
    default: null
  },
  
  ariaLabelledby: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'keydown']);

// Inject field context if available
const fieldContext = inject('fieldContext', null);

// Refs
const inputRef = ref(null);
const isFocused = ref(false);

// Generate unique ID for accessibility
const inputId = computed(() => {
  if (fieldContext?.fieldId) return fieldContext.fieldId;
  return `input-${Math.random().toString(36).substr(2, 9)}`;
});

// Computed properties
const hasValue = computed(() => {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined;
});

const isFloating = computed(() => {
  return props.floatingLabel && (isFocused.value || hasValue.value);
});

const computedPlaceholder = computed(() => {
  if (props.floatingLabel && !isFocused.value) {
    return '';
  }
  return props.placeholder;
});

// Use field context values when available
const computedErrorMessage = computed(() => {
  return props.errorMessage || fieldContext?.errorMessage || '';
});

const computedHelpText = computed(() => {
  return props.helpText || fieldContext?.helpText || '';
});

const computedRequired = computed(() => {
  return props.required || fieldContext?.required || false;
});

const computedDisabled = computed(() => {
  return props.disabled || fieldContext?.disabled || false;
});

const computedSize = computed(() => {
  return fieldContext?.size || props.size;
});

// Accessibility computed properties
const hasError = computed(() => {
  return !!computedErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  const ids = [];
  
  if (fieldContext?.ariaDescribedBy) {
    ids.push(fieldContext.ariaDescribedBy);
  }
  
  if (hasError.value) {
    ids.push(`${inputId.value}-error`);
  }
  
  if (computedHelpText.value) {
    ids.push(`${inputId.value}-help`);
  }
  
  return ids.length > 0 ? ids.join(' ') : null;
});

// Wrapper classes
const wrapperClasses = computed(() => [
  'base-input-wrapper',
  props.class
]);

// Container classes
const containerClasses = computed(() => [
  {
    'mt-1': props.label && !props.floatingLabel,
    'relative': true
  }
]);

// Label classes
const labelClasses = computed(() => [
  'block text-sm font-medium transition-all duration-200',
  {
    // Floating label styles
    'absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10': props.floatingLabel,
    'text-xs -translate-y-6 bg-white px-1 left-2': props.floatingLabel && isFloating.value,
    
    // Static label styles
    'text-neutral-700 mb-1': !props.floatingLabel,
    
    // State colors
    'text-error-500': props.errorMessage,
    'text-neutral-500': props.floatingLabel && !isFloating.value && !props.errorMessage,
    'text-primary-600': props.floatingLabel && isFocused.value && !props.errorMessage,
    
    // Icon padding
    'left-10': props.floatingLabel && props.iconLeft && !isFloating.value,
    'left-9': props.floatingLabel && props.iconLeft && isFloating.value
  }
]);

// Input classes
const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset transition-all duration-200',
    'placeholder:text-neutral-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
    'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
    'read-only:bg-neutral-50 read-only:text-neutral-500'
  ];
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-8',
    md: 'px-3 py-2.5 text-base h-10',
    lg: 'px-4 py-3 text-lg h-12'
  };
  
  // State classes
  const stateClasses = {
    default: 'ring-neutral-300 focus:ring-teal-600 bg-white text-neutral-900',
    error: 'ring-error-300 focus:ring-error-600 bg-error-50 text-error-900',
    disabled: 'ring-neutral-200 bg-neutral-50 text-neutral-500',
    readonly: 'ring-neutral-200 bg-neutral-50 text-neutral-500'
  };
  
  // Icon padding
  const iconPadding = {
    left: props.iconLeft ? 'pl-10' : '',
    right: (props.iconRight || props.clearable) ? 'pr-10' : ''
  };
  
  // Floating label padding
  const floatingPadding = props.floatingLabel ? 'pt-6 pb-2' : '';
  
  let currentState = 'default';
  if (computedDisabled.value) currentState = 'disabled';
  else if (props.readonly) currentState = 'readonly';
  else if (computedErrorMessage.value) currentState = 'error';
  
  return [
    ...baseClasses,
    sizeClasses[computedSize.value],
    stateClasses[currentState],
    iconPadding.left,
    iconPadding.right,
    floatingPadding
  ];
});

// Icon classes
const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return [
    sizes[props.size],
    'flex-shrink-0',
    {
      'text-neutral-400': !props.errorMessage,
      'text-error-400': props.errorMessage
    }
  ];
});

// Event handlers
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleKeydown = (event) => {
  emit('keydown', event);
};

// Public methods
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const select = () => {
  inputRef.value?.select();
};

// Expose methods
defineExpose({
  focus,
  blur,
  select,
  inputRef
});

// Initialize focus state on mount if input has value
onMounted(() => {
  if (hasValue.value) {
    // Ensure floating label is positioned correctly
    nextTick();
  }
});
</script>

<style scoped>
/* Ensure floating labels have proper background */
.base-input-wrapper label {
  background-color: inherit;
}

/* Smooth transitions for floating labels */
.base-input-wrapper label {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus ring enhancement */
.base-input-wrapper input:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Custom scrollbar for number inputs */
.base-input-wrapper input[type="number"]::-webkit-outer-spin-button,
.base-input-wrapper input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.base-input-wrapper input[type="number"] {
  -moz-appearance: textfield;
}
</style>