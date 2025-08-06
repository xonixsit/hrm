<template>
  <div class="base-radio-wrapper" :class="wrapperClasses">
    <div class="flex items-start">
      <!-- Radio Input -->
      <div class="flex items-center h-5">
        <input
          :id="radioId"
          ref="inputRef"
          type="radio"
          :name="name"
          :value="value"
          :checked="isChecked"
          :disabled="disabled"
          :required="required"
          :class="radioClasses"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <!-- Custom Radio Visual -->
        <div :class="customRadioClasses">
          <!-- Radio Dot -->
          <div
            v-if="isChecked"
            :class="radioDotClasses"
          />
        </div>
      </div>

      <!-- Label and Description -->
      <div v-if="label || description || $slots.default" class="ml-3 text-sm">
        <label
          :for="radioId"
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
    type: [String, Number, Boolean],
    default: null
  },
  
  // Radio value
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  
  // Radio group name
  name: {
    type: String,
    required: true
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
const radioId = computed(() => `radio-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties
const isChecked = computed(() => {
  return props.modelValue === props.value;
});

// Styling
const wrapperClasses = computed(() => [
  'base-radio-wrapper',
  props.class
]);

const radioClasses = computed(() => [
  // Hide the default radio
  'sr-only'
]);

const customRadioClasses = computed(() => {
  const baseClasses = [
    'absolute flex items-center justify-center rounded-full border-2 transition-all duration-200',
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
        'border-neutral-300 bg-neutral-100 cursor-not-allowed'
      ];
    }
    
    if (props.errorMessage) {
      return [
        'border-error-300 focus-within:ring-error-500',
        isChecked.value 
          ? 'bg-error-50 border-error-500' 
          : 'bg-white hover:border-error-400'
      ];
    }
    
    // Default state
    return [
      'border-neutral-300 focus-within:ring-primary-500',
      isChecked.value
        ? 'bg-primary-50 border-primary-500'
        : 'bg-white hover:border-neutral-400'
    ];
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...getStateClasses()
  ];
});

const radioDotClasses = computed(() => {
  const baseClasses = [
    'rounded-full transition-all duration-200'
  ];
  
  // Size classes for the dot
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };
  
  // Color classes
  const colorClasses = () => {
    if (props.disabled) {
      return 'bg-neutral-400';
    }
    
    if (props.errorMessage) {
      return 'bg-error-500';
    }
    
    return 'bg-primary-500';
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    colorClasses()
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
  
  if (event.target.checked) {
    emit('update:modelValue', props.value);
    emit('change', props.value);
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
/* Ensure proper positioning for custom radio */
.base-radio-wrapper .flex.items-center.h-5 {
  position: relative;
}

/* Focus ring enhancement */
.base-radio-wrapper input:focus + div {
  ring-width: 2px;
  ring-offset-width: 2px;
}

/* Smooth transitions */
.base-radio-wrapper div[class*="absolute"] {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.base-radio-wrapper:hover:not([disabled]) div[class*="absolute"] {
  transform: scale(1.05);
}

.base-radio-wrapper input:disabled + div {
  cursor: not-allowed;
}

/* Radio dot animation */
.base-radio-wrapper div[class*="rounded-full"]:not([class*="absolute"]) {
  animation: radioCheck 0.2s ease-in-out;
}

@keyframes radioCheck {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>