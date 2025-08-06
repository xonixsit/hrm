<template>
  <div class="base-checkbox-wrapper" :class="wrapperClasses">
    <div class="flex items-start">
      <!-- Checkbox Input -->
      <div class="flex items-center h-5">
        <input
          :id="checkboxId"
          ref="inputRef"
          type="checkbox"
          :checked="isChecked"
          :disabled="disabled"
          :required="required"
          :class="checkboxClasses"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <!-- Custom Checkbox Visual -->
        <div :class="customCheckboxClasses">
          <!-- Checkmark Icon -->
          <svg
            v-if="isChecked"
            :class="checkmarkClasses"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
          
          <!-- Indeterminate Icon -->
          <svg
            v-else-if="indeterminate"
            :class="checkmarkClasses"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <rect x="4" y="9" width="12" height="2" rx="1" />
          </svg>
        </div>
      </div>

      <!-- Label and Description -->
      <div v-if="label || description || $slots.default" class="ml-3 text-sm">
        <label
          :for="checkboxId"
          :class="labelClasses"
        >
          <slot>{{ label }}</slot>
          <span v-if="required" class="text-error-500 ml-1">*</span>
        </label>
        
        <p
          v-if="description"
          :class="descriptionClasses"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-1">
      <p class="text-sm text-error-500" role="alert">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  // v-model
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  
  // Checkbox value (for array model)
  value: {
    type: [String, Number, Boolean],
    default: null
  },
  
  // Basic props
  label: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
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
  
  required: {
    type: Boolean,
    default: false
  },
  
  indeterminate: {
    type: Boolean,
    default: false
  },
  
  // Validation
  errorMessage: {
    type: String,
    default: ''
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

// Refs
const inputRef = ref(null);

// Generate unique ID for accessibility
const checkboxId = computed(() => `checkbox-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== null && props.modelValue.includes(props.value);
  }
  return Boolean(props.modelValue);
});

// Styling
const wrapperClasses = computed(() => [
  'base-checkbox-wrapper',
  props.class
]);

const checkboxClasses = computed(() => [
  // Hide the default checkbox
  'sr-only'
]);

const customCheckboxClasses = computed(() => {
  const baseClasses = [
    'absolute flex items-center justify-center rounded border-2 transition-all duration-200',
    'focus-within:ring-2 focus-within:ring-offset-2 cursor-pointer'
  ];
  
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  // State classes
  const getStateClasses = () => {
    if (props.disabled) {
      return [
        'border-neutral-300 bg-neutral-100 cursor-not-allowed',
        isChecked.value || props.indeterminate ? 'text-neutral-400' : ''
      ];
    }
    
    if (props.errorMessage) {
      return [
        'border-error-300 focus-within:ring-error-500',
        isChecked.value || props.indeterminate 
          ? 'bg-error-500 border-error-500 text-white' 
          : 'bg-white hover:border-error-400'
      ];
    }
    
    // Default state
    return [
      'border-neutral-300 focus-within:ring-primary-500',
      isChecked.value || props.indeterminate
        ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 hover:border-primary-600'
        : 'bg-white hover:border-neutral-400'
    ];
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...getStateClasses()
  ];
});

const checkmarkClasses = computed(() => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return [
    sizes[props.size],
    'transition-all duration-200'
  ];
});

const labelClasses = computed(() => [
  'font-medium cursor-pointer select-none',
  {
    'text-neutral-900': !props.disabled && !props.errorMessage,
    'text-neutral-500': props.disabled,
    'text-error-700': props.errorMessage && !props.disabled
  }
]);

const descriptionClasses = computed(() => [
  'mt-1 text-neutral-500',
  {
    'text-neutral-400': props.disabled,
    'text-error-600': props.errorMessage && !props.disabled
  }
]);

// Event handlers
const handleChange = (event) => {
  if (props.disabled) return;
  
  const checked = event.target.checked;
  
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];
    
    if (checked && props.value !== null) {
      if (!newValue.includes(props.value)) {
        newValue.push(props.value);
      }
    } else if (!checked && props.value !== null) {
      const index = newValue.indexOf(props.value);
      if (index > -1) {
        newValue.splice(index, 1);
      }
    }
    
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', checked);
    emit('change', checked);
  }
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleBlur = (event) => {
  emit('blur', event);
};

// Public methods
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

// Expose methods
defineExpose({
  focus,
  blur,
  inputRef
});
</script>

<style scoped>
/* Ensure proper positioning for custom checkbox */
.base-checkbox-wrapper .flex.items-center.h-5 {
  position: relative;
}

/* Focus ring enhancement */
.base-checkbox-wrapper input:focus + div {
  ring-width: 2px;
  ring-offset-width: 2px;
}

/* Smooth transitions */
.base-checkbox-wrapper div[class*="absolute"] {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.base-checkbox-wrapper:hover:not([disabled]) div[class*="absolute"] {
  transform: scale(1.05);
}

.base-checkbox-wrapper input:disabled + div {
  cursor: not-allowed;
}
</style>