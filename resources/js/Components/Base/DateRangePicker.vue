<template>
  <div class="date-range-picker">
    <div class="flex flex-col space-y-2">
     
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
import { computed, ref, watch } from 'vue';
const selectedPreset = ref('custom');
const presets = [
  { value: 'custom', label: 'Custom' },
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'thisMonth', label: 'This Month' }
];
watch(selectedPreset, (newPreset) => {
  if (newPreset === 'custom') return;
  applyPreset(newPreset);
});
const applyPreset = (preset) => {
  const today = new Date();
  let start, end;
  switch (preset) {
    case 'today':
      start = end = today.toISOString().split('T')[0];
      break;
    case 'last7':
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      start = start.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      break;
  }
  emit('update:modelValue', { start, end });
};
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
  if (selectedPreset.value !== 'custom') selectedPreset.value = 'custom';
};

const handleEndDateChange = (event) => {
  const newValue = {
    ...props.modelValue,
    end: event.target.value
  };
  emit('update:modelValue', newValue);
  if (selectedPreset.value !== 'custom') selectedPreset.value = 'custom';
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