<template>
  <div class="base-select-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-neutral-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <!-- Select Container -->
    <div class="relative" ref="containerRef">
      <!-- Select Button -->
      <button
        :id="selectId"
        ref="buttonRef"
        type="button"
        :disabled="disabled"
        :class="selectClasses"
        @click="toggleDropdown"
        @keydown="handleKeydown"
        @blur="handleBlur"
      >
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

        <!-- Selected Value Display -->
        <span :class="valueDisplayClasses">
          {{ displayValue }}
        </span>

        <!-- Chevron Icon -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            :class="chevronClasses"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          :class="dropdownClasses"
          @click.stop
        >
          <!-- Search Input -->
          <div v-if="searchable" class="p-2 border-b border-neutral-200">
            <input
              ref="searchRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @keydown.stop="handleSearchKeydown"
            />
          </div>

          <!-- Options List -->
          <div class="max-h-60 overflow-auto py-1" role="listbox">
            <!-- No Results -->
            <div
              v-if="filteredOptions.length === 0"
              class="px-3 py-2 text-sm text-neutral-500 text-center"
            >
              {{ noResultsText }}
            </div>

            <!-- Options -->
            <button
              v-for="(option, index) in filteredOptions"
              :key="getOptionKey(option)"
              type="button"
              :class="getOptionClasses(option, index)"
              role="option"
              :aria-selected="isSelected(option)"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <!-- Option Content -->
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <!-- Option Icon -->
                  <component
                    v-if="option.icon"
                    :is="option.icon"
                    class="w-4 h-4 mr-2 flex-shrink-0"
                  />
                  
                  <!-- Option Text -->
                  <span class="block truncate">
                    {{ getOptionLabel(option) }}
                  </span>
                </div>

                <!-- Selected Checkmark -->
                <svg
                  v-if="isSelected(option)"
                  class="w-4 h-4 text-primary-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Help Text / Error Message -->
    <div v-if="helpText || errorMessage" class="mt-1">
      <p
        v-if="errorMessage"
        class="text-sm text-error-500"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="helpText"
        class="text-sm text-neutral-500"
      >
        {{ helpText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // v-model
  modelValue: {
    type: [String, Number, Object, Array],
    default: null
  },
  
  // Options
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  
  // Option configuration
  optionLabel: {
    type: String,
    default: 'label'
  },
  
  optionValue: {
    type: String,
    default: 'value'
  },
  
  // Basic props
  label: {
    type: String,
    default: ''
  },
  
  placeholder: {
    type: String,
    default: 'Select an option...'
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
  
  helpText: {
    type: String,
    default: ''
  },
  
  // Icons
  iconLeft: {
    type: [String, Object],
    default: null
  },
  
  // Search functionality
  searchable: {
    type: Boolean,
    default: false
  },
  
  searchPlaceholder: {
    type: String,
    default: 'Search options...'
  },
  
  noResultsText: {
    type: String,
    default: 'No results found'
  },
  
  // Multiple selection
  multiple: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'open', 'close', 'search']);

// Refs
const containerRef = ref(null);
const buttonRef = ref(null);
const searchRef = ref(null);

// State
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);

// Generate unique ID for accessibility
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties
const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  
  if (props.multiple) {
    return props.options.filter(option => 
      props.modelValue.includes(getOptionValue(option))
    );
  }
  
  return props.options.find(option => 
    getOptionValue(option) === props.modelValue
  );
});

const displayValue = computed(() => {
  if (!selectedOption.value) {
    return props.placeholder;
  }
  
  if (props.multiple) {
    if (selectedOption.value.length === 0) {
      return props.placeholder;
    }
    if (selectedOption.value.length === 1) {
      return getOptionLabel(selectedOption.value[0]);
    }
    return `${selectedOption.value.length} items selected`;
  }
  
  return getOptionLabel(selectedOption.value);
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase();
    return label.includes(query);
  });
});

// Helper functions
const getOptionLabel = (option) => {
  if (typeof option === 'string') return option;
  if (typeof option === 'object' && option !== null) {
    return option[props.optionLabel] || option.label || String(option);
  }
  return String(option);
};

const getOptionValue = (option) => {
  if (typeof option === 'string' || typeof option === 'number') return option;
  if (typeof option === 'object' && option !== null) {
    return option[props.optionValue] || option.value || option;
  }
  return option;
};

const getOptionKey = (option) => {
  return getOptionValue(option);
};

const isSelected = (option) => {
  if (!props.modelValue) return false;
  
  const optionValue = getOptionValue(option);
  
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(optionValue);
  }
  
  return props.modelValue === optionValue;
};

// Styling
const wrapperClasses = computed(() => [
  'base-select-wrapper',
  props.class
]);

const selectClasses = computed(() => {
  const baseClasses = [
    'relative w-full cursor-default rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset',
    'focus:outline-none focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
    'text-left transition-all duration-200'
  ];
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-8',
    md: 'px-3 py-2.5 text-base h-10',
    lg: 'px-4 py-3 text-lg h-12'
  };
  
  // State classes
  const stateClasses = {
    default: 'ring-neutral-300 focus:ring-primary-600 bg-white text-neutral-900',
    error: 'ring-error-300 focus:ring-error-600 bg-error-50 text-error-900',
    disabled: 'ring-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed'
  };
  
  // Icon padding
  const iconPadding = props.iconLeft ? 'pl-10' : '';
  
  let currentState = 'default';
  if (props.disabled) currentState = 'disabled';
  else if (props.errorMessage) currentState = 'error';
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    stateClasses[currentState],
    iconPadding,
    'pr-10' // Always have right padding for chevron
  ];
});

const valueDisplayClasses = computed(() => [
  'block truncate',
  {
    'text-neutral-400': !selectedOption.value,
    'text-neutral-900': selectedOption.value && !props.disabled,
    'text-neutral-500': props.disabled
  }
]);

const chevronClasses = computed(() => [
  'w-5 h-5 text-neutral-400 transition-transform duration-200',
  {
    'rotate-180': isOpen.value
  }
]);

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

const dropdownClasses = computed(() => [
  'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base',
  'ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
  'border border-neutral-200'
]);

const getOptionClasses = (option, index) => [
  'relative cursor-default select-none py-2 px-3 text-left w-full',
  'hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none',
  'transition-colors duration-150',
  {
    'bg-primary-50 text-primary-900': isSelected(option),
    'bg-neutral-100': highlightedIndex.value === index && !isSelected(option),
    'text-neutral-900': !isSelected(option)
  }
];

// Event handlers
const toggleDropdown = () => {
  if (props.disabled) return;
  
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = async () => {
  isOpen.value = true;
  highlightedIndex.value = -1;
  searchQuery.value = '';
  
  emit('open');
  
  await nextTick();
  
  if (props.searchable && searchRef.value) {
    searchRef.value.focus();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
  searchQuery.value = '';
  emit('close');
};

const selectOption = (option) => {
  const optionValue = getOptionValue(option);
  
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValue.indexOf(optionValue);
    
    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(optionValue);
    }
    
    emit('update:modelValue', currentValue);
    emit('change', currentValue);
  } else {
    emit('update:modelValue', optionValue);
    emit('change', optionValue);
    closeDropdown();
  }
};

const handleKeydown = (event) => {
  if (props.disabled) return;
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (!isOpen.value) {
        openDropdown();
      } else if (highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;
      
    case 'Escape':
      event.preventDefault();
      closeDropdown();
      buttonRef.value?.focus();
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value) {
        openDropdown();
      } else {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredOptions.value.length - 1
        );
      }
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      }
      break;
  }
};

const handleSearchKeydown = (event) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      closeDropdown();
      buttonRef.value?.focus();
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1
      );
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      break;
      
    case 'Enter':
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;
  }
};

const handleBlur = (event) => {
  // Close dropdown when focus leaves the component
  setTimeout(() => {
    if (!containerRef.value?.contains(document.activeElement)) {
      closeDropdown();
    }
  }, 100);
};

const handleClickOutside = (event) => {
  if (!containerRef.value?.contains(event.target)) {
    closeDropdown();
  }
};

// Public methods
const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

// Expose methods
defineExpose({
  focus,
  blur,
  open: openDropdown,
  close: closeDropdown
});

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Custom scrollbar for options list */
.base-select-wrapper .max-h-60::-webkit-scrollbar {
  width: 6px;
}

.base-select-wrapper .max-h-60::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.base-select-wrapper .max-h-60::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.base-select-wrapper .max-h-60::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus ring enhancement */
.base-select-wrapper button:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>