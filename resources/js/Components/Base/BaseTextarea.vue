<template>
  <div class="base-textarea-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="textareaId"
      class="block text-sm font-medium text-neutral-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <!-- Textarea Container -->
    <div class="relative">
      <!-- Textarea Element -->
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="computedRows"
        :maxlength="maxLength"
        :class="textareaClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Resize Handle (when not auto-resize) -->
      <div
        v-if="!autoResize && resizable"
        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-75"
      >
        <svg
          class="w-4 h-4 text-neutral-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M14 18l4-4v4h-4zM10 18l4-4v4h-4zM6 18l4-4v4H6z"/>
        </svg>
      </div>
    </div>

    <!-- Character Count / Help Text / Error Message -->
    <div v-if="showCharacterCount || helpText || errorMessage" class="mt-1 flex justify-between items-start">
      <div class="flex-1">
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
      
      <!-- Character Count -->
      <div
        v-if="showCharacterCount"
        :class="characterCountClasses"
      >
        {{ characterCount }}{{ maxLength ? `/${maxLength}` : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted } from 'vue';

const props = defineProps({
  // v-model
  modelValue: {
    type: String,
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
  
  // Size and dimensions
  rows: {
    type: Number,
    default: 3
  },
  
  minRows: {
    type: Number,
    default: 2
  },
  
  maxRows: {
    type: Number,
    default: 10
  },
  
  // Character limits
  maxLength: {
    type: Number,
    default: null
  },
  
  showCharacterCount: {
    type: Boolean,
    default: false
  },
  
  // Features
  autoResize: {
    type: Boolean,
    default: true
  },
  
  resizable: {
    type: Boolean,
    default: true
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
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown', 'resize']);

// Refs
const textareaRef = ref(null);

// Generate unique ID for accessibility
const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties
const characterCount = computed(() => {
  return props.modelValue ? props.modelValue.length : 0;
});

const isNearLimit = computed(() => {
  if (!props.maxLength) return false;
  return characterCount.value > props.maxLength * 0.8;
});

const isOverLimit = computed(() => {
  if (!props.maxLength) return false;
  return characterCount.value > props.maxLength;
});

const computedRows = computed(() => {
  if (!props.autoResize) return props.rows;
  
  if (!textareaRef.value || !props.modelValue) {
    return Math.max(props.minRows, props.rows);
  }
  
  // Calculate rows based on content
  const lineHeight = 24; // Approximate line height in pixels
  const padding = 16; // Top and bottom padding
  const scrollHeight = textareaRef.value.scrollHeight;
  const calculatedRows = Math.ceil((scrollHeight - padding) / lineHeight);
  
  return Math.min(Math.max(calculatedRows, props.minRows), props.maxRows);
});

// Styling
const wrapperClasses = computed(() => [
  'base-textarea-wrapper',
  props.class
]);

const textareaClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset transition-all duration-200',
    'placeholder:text-neutral-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
    'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
    'read-only:bg-neutral-50 read-only:text-neutral-500'
  ];
  
  // Resize classes
  const resizeClasses = () => {
    if (!props.resizable) return 'resize-none';
    if (props.autoResize) return 'resize-none';
    return 'resize-y';
  };
  
  // State classes
  const stateClasses = {
    default: 'ring-neutral-300 focus:ring-primary-600 bg-white text-neutral-900',
    error: 'ring-error-300 focus:ring-error-600 bg-error-50 text-error-900',
    disabled: 'ring-neutral-200 bg-neutral-50 text-neutral-500',
    readonly: 'ring-neutral-200 bg-neutral-50 text-neutral-500'
  };
  
  let currentState = 'default';
  if (props.disabled) currentState = 'disabled';
  else if (props.readonly) currentState = 'readonly';
  else if (props.errorMessage) currentState = 'error';
  
  return [
    ...baseClasses,
    resizeClasses(),
    stateClasses[currentState]
  ];
});

const characterCountClasses = computed(() => [
  'text-xs font-medium ml-2 flex-shrink-0',
  {
    'text-neutral-500': !isNearLimit.value && !isOverLimit.value,
    'text-warning-600': isNearLimit.value && !isOverLimit.value,
    'text-error-600': isOverLimit.value
  }
]);

// Auto-resize functionality
const adjustHeight = async () => {
  if (!props.autoResize || !textareaRef.value) return;
  
  await nextTick();
  
  // Reset height to auto to get the correct scrollHeight
  textareaRef.value.style.height = 'auto';
  
  // Calculate new height
  const scrollHeight = textareaRef.value.scrollHeight;
  const lineHeight = 24;
  const padding = 16;
  const minHeight = props.minRows * lineHeight + padding;
  const maxHeight = props.maxRows * lineHeight + padding;
  
  const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
  
  textareaRef.value.style.height = `${newHeight}px`;
  
  emit('resize', {
    height: newHeight,
    rows: Math.ceil((newHeight - padding) / lineHeight)
  });
};

// Event handlers
const handleInput = (event) => {
  const value = event.target.value;
  
  // Enforce max length if specified
  if (props.maxLength && value.length > props.maxLength) {
    return; // Don't update if over limit
  }
  
  emit('update:modelValue', value);
  
  // Adjust height after input
  if (props.autoResize) {
    adjustHeight();
  }
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleKeydown = (event) => {
  // Handle tab key for indentation
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault();
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const value = event.target.value;
    const newValue = value.substring(0, start) + '  ' + value.substring(end);
    
    emit('update:modelValue', newValue);
    
    nextTick(() => {
      event.target.selectionStart = event.target.selectionEnd = start + 2;
    });
  }
  
  emit('keydown', event);
};

// Public methods
const focus = () => {
  textareaRef.value?.focus();
};

const blur = () => {
  textareaRef.value?.blur();
};

const select = () => {
  textareaRef.value?.select();
};

const insertText = (text, position = null) => {
  if (!textareaRef.value) return;
  
  const textarea = textareaRef.value;
  const start = position !== null ? position : textarea.selectionStart;
  const end = position !== null ? position : textarea.selectionEnd;
  const currentValue = props.modelValue || '';
  
  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
  
  emit('update:modelValue', newValue);
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  });
};

// Expose methods
defineExpose({
  focus,
  blur,
  select,
  insertText,
  adjustHeight,
  textareaRef
});

// Watch for value changes to adjust height
watch(() => props.modelValue, () => {
  if (props.autoResize) {
    nextTick(() => adjustHeight());
  }
});

// Initialize height on mount
onMounted(() => {
  if (props.autoResize) {
    adjustHeight();
  }
});
</script>

<style scoped>
/* Ensure smooth transitions */
.base-textarea-wrapper textarea {
  transition: height 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
}

/* Focus ring enhancement */
.base-textarea-wrapper textarea:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Custom scrollbar for textarea */
.base-textarea-wrapper textarea::-webkit-scrollbar {
  width: 8px;
}

.base-textarea-wrapper textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.base-textarea-wrapper textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.base-textarea-wrapper textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Resize handle styling */
.base-textarea-wrapper .cursor-se-resize {
  background: linear-gradient(
    -45deg,
    transparent 0%,
    transparent 25%,
    currentColor 25%,
    currentColor 50%,
    transparent 50%,
    transparent 75%,
    currentColor 75%
  );
  background-size: 4px 4px;
}
</style>