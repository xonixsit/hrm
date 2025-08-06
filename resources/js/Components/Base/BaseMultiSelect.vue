<template>
  <div class="base-multiselect">
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="selectClasses"
      multiple
      @change="handleChange"
    >
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
        :selected="isSelected(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="hint" class="hint-message">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  
  modelValue: {
    type: Array,
    default: () => []
  },
  
  options: {
    type: Array,
    default: () => []
  },
  
  placeholder: {
    type: String,
    default: 'Select options...'
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  required: {
    type: Boolean,
    default: false
  },
  
  error: {
    type: String,
    default: ''
  },
  
  hint: {
    type: String,
    default: ''
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

// Computed properties
const selectClasses = computed(() => [
  'base-multiselect-input',
  'w-full border rounded-md transition-colors focus:outline-none focus:ring-2',
  {
    // Size variants
    'px-3 py-2 text-sm': props.size === 'sm',
    'px-3 py-2 text-base': props.size === 'md',
    'px-4 py-3 text-lg': props.size === 'lg',
    
    // State variants
    'border-neutral-300 focus:border-primary-500 focus:ring-primary-500': !props.error && !props.disabled,
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'bg-neutral-100 border-neutral-200 cursor-not-allowed': props.disabled,
    
    // Style variants
    'bg-white': props.variant === 'default',
    'bg-neutral-50': props.variant === 'filled'
  }
]);

// Methods
const getOptionValue = (option) => {
  return typeof option === 'object' ? option.value : option;
};

const getOptionLabel = (option) => {
  return typeof option === 'object' ? option.label : option;
};

const isSelected = (option) => {
  const value = getOptionValue(option);
  return props.modelValue.includes(value);
};

const handleChange = (event) => {
  const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
  emit('update:modelValue', selectedValues);
};
</script>

<style scoped>
.base-multiselect {
  @apply relative;
}

.base-multiselect-input {
  @apply appearance-none;
  min-height: 2.5rem;
}

.error-message {
  @apply text-red-600 text-sm mt-1;
}

.hint-message {
  @apply text-neutral-500 text-sm mt-1;
}

/* Focus styles */
.base-multiselect-input:focus {
  @apply ring-2 ring-offset-0;
}

/* Disabled styles */
.base-multiselect-input:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Multiple select styling */
.base-multiselect-input[multiple] {
  @apply h-auto min-h-[2.5rem];
}

.base-multiselect-input[multiple] option {
  @apply py-1 px-2;
}

.base-multiselect-input[multiple] option:checked {
  @apply bg-primary-100 text-primary-900;
}
</style>