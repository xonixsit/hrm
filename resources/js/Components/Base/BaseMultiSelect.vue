<template>
  <div class="base-multiselect" ref="dropdownRef">
    <div class="relative">
      <button
        type="button"
        :class="selectClasses"
        :disabled="disabled"
        @click="toggleDropdown"
        aria-haspopup="listbox"
        :aria-expanded="showDropdown"
      >
        <span v-if="selectedLabels.length === 0" class="text-neutral-500">{{ placeholder }}</span>
        <span v-else>{{ selectedLabels.join(', ') }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>

      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="showDropdown" class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
          <ul role="listbox" class="py-1 text-sm text-neutral-700">
            <li
              v-for="option in options"
              :key="getOptionValue(option)"
              class="px-3 py-2 hover:bg-neutral-100 cursor-pointer flex items-center"
              @click="toggleSelection(option)"
            >
              <input
                type="checkbox"
                :checked="isSelected(option)"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mr-2"
                @click.stop
              />
              {{ getOptionLabel(option) }}
            </li>
          </ul>
        </div>
      </transition>
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
import { computed, onMounted, onUnmounted } from 'vue';

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

import { ref } from 'vue';
const emit = defineEmits(['update:modelValue']);
const showDropdown = ref(false);
const dropdownRef = ref(null);

// Computed properties
const selectClasses = computed(() => [
  'base-multiselect-input',
  'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 text-left flex items-center justify-between px-3 py-2',
  {
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
    'border-neutral-300 focus:border-primary-500 focus:ring-primary-500': !props.error && !props.disabled,
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'bg-neutral-100 border-neutral-200 cursor-not-allowed opacity-50': props.disabled,
    'bg-white': props.variant === 'default',
    'bg-neutral-50': props.variant === 'filled'
  }
]);

const selectedLabels = computed(() => {
  return props.modelValue.map(value => {
    const option = props.options.find(opt => getOptionValue(opt) === value);
    return option ? getOptionLabel(option) : '';
  }).filter(Boolean);
});

// Methods
const getOptionValue = (option) => typeof option === 'object' ? option.value : option;
const getOptionLabel = (option) => typeof option === 'object' ? option.label : option;
const isSelected = (option) => props.modelValue.includes(getOptionValue(option));
const toggleDropdown = () => {
  if (!props.disabled) showDropdown.value = !showDropdown.value;
};
const toggleSelection = (option) => {
  const value = getOptionValue(option);
  const newValue = isSelected(option)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value];
  emit('update:modelValue', newValue);
};

// Click outside handler
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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

</style>