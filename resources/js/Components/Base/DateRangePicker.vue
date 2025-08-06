<template>
  <div class="date-range-picker">
    <div class="flex items-center space-x-2">
      <input
        :id="`${id}-start`"
        type="date"
        :value="startDate"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        :placeholder="startPlaceholder"
        @input="handleStartDateChange"
      />
      <span class="text-neutral-500">to</span>
      <input
        :id="`${id}-end`"
        type="date"
        :value="endDate"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        :placeholder="endPlaceholder"
        @input="handleEndDateChange"
      />
    </div>
    
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
    type: Object,
    default: () => ({ start: '', end: '' })
  },
  
  startPlaceholder: {
    type: String,
    default: 'Start date'
  },
  
  endPlaceholder: {
    type: String,
    default: 'End date'
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
  }
});

const emit = defineEmits(['update:modelValue']);

// Computed properties
const startDate = computed(() => props.modelValue?.start || '');
const endDate = computed(() => props.modelValue?.end || '');

const inputClasses = computed(() => [
  'date-input',
  'border rounded-md transition-colors focus:outline-none focus:ring-2',
  {
    // Size variants
    'px-3 py-2 text-sm': props.size === 'sm',
    'px-3 py-2 text-base': props.size === 'md',
    'px-4 py-3 text-lg': props.size === 'lg',
    
    // State variants
    'border-neutral-300 focus:border-primary-500 focus:ring-primary-500': !props.error && !props.disabled,
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'bg-neutral-100 border-neutral-200 cursor-not-allowed': props.disabled
  }
]);

// Methods
const handleStartDateChange = (event) => {
  const newValue = {
    ...props.modelValue,
    start: event.target.value
  };
  emit('update:modelValue', newValue);
};

const handleEndDateChange = (event) => {
  const newValue = {
    ...props.modelValue,
    end: event.target.value
  };
  emit('update:modelValue', newValue);
};
</script>

<style scoped>
.date-range-picker {
  @apply relative;
}

.date-input {
  @apply bg-white;
  min-width: 140px;
}

.error-message {
  @apply text-red-600 text-sm mt-1;
}

.hint-message {
  @apply text-neutral-500 text-sm mt-1;
}

/* Focus styles */
.date-input:focus {
  @apply ring-2 ring-offset-0;
}

/* Disabled styles */
.date-input:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>