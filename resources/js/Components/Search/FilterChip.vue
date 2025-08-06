<template>
  <div class="filter-chip" :class="chipClasses">
    <div class="flex items-center space-x-2">
      <!-- Filter Icon -->
      <Icon 
        v-if="icon" 
        :name="icon" 
        :class="iconClasses"
      />
      
      <!-- Filter Label and Value -->
      <div class="flex items-center space-x-1">
        <span v-if="label" class="filter-label">{{ label }}:</span>
        <span class="filter-value">{{ displayValue }}</span>
      </div>
      
      <!-- Remove Button -->
      <button
        v-if="removable && !disabled"
        type="button"
        class="filter-remove-btn"
        :class="removeButtonClasses"
        @click="handleRemove"
        :aria-label="`Remove ${label || 'filter'}`"
      >
        <Icon name="x" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // Filter data
  label: {
    type: String,
    default: ''
  },
  
  value: {
    type: [String, Number, Array, Object],
    required: true
  },
  
  // Display options
  icon: {
    type: String,
    default: null
  },
  
  // Behavior
  removable: {
    type: Boolean,
    default: true
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'success', 'warning', 'error'].includes(value)
  },
  
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['remove']);

// Computed properties
const displayValue = computed(() => {
  if (Array.isArray(props.value)) {
    if (props.value.length === 0) return 'None';
    if (props.value.length === 1) return props.value[0];
    return `${props.value.length} items`;
  }
  
  if (typeof props.value === 'object' && props.value !== null) {
    return props.value.label || props.value.name || JSON.stringify(props.value);
  }
  
  return String(props.value);
});

const chipClasses = computed(() => {
  const baseClasses = [
    'filter-chip',
    'inline-flex items-center rounded-full border transition-all duration-200',
    'focus-within:ring-2 focus-within:ring-offset-1'
  ];
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    default: [
      'bg-neutral-100 border-neutral-200 text-neutral-700',
      'hover:bg-neutral-200 focus-within:ring-neutral-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ],
    primary: [
      'bg-primary-100 border-primary-200 text-primary-700',
      'hover:bg-primary-200 focus-within:ring-primary-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ],
    secondary: [
      'bg-secondary-100 border-secondary-200 text-secondary-700',
      'hover:bg-secondary-200 focus-within:ring-secondary-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ],
    success: [
      'bg-success-100 border-success-200 text-success-700',
      'hover:bg-success-200 focus-within:ring-success-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ],
    warning: [
      'bg-warning-100 border-warning-200 text-warning-700',
      'hover:bg-warning-200 focus-within:ring-warning-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ],
    error: [
      'bg-error-100 border-error-200 text-error-700',
      'hover:bg-error-200 focus-within:ring-error-500',
      props.disabled && 'opacity-50 cursor-not-allowed'
    ]
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...(variantClasses[props.variant] || []).filter(Boolean),
    props.class
  ];
});

const iconClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };
  
  return [
    sizes[props.size],
    'flex-shrink-0'
  ];
});

const removeButtonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center rounded-full transition-colors duration-200',
    'hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-current'
  ];
  
  const sizeClasses = {
    xs: 'w-4 h-4 ml-1',
    sm: 'w-5 h-5 ml-1',
    md: 'w-6 h-6 ml-2'
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size]
  ];
});

// Event handlers
const handleRemove = () => {
  if (!props.disabled) {
    emit('remove', {
      label: props.label,
      value: props.value
    });
  }
};
</script>

<style scoped>
.filter-chip {
  max-width: 200px;
}

.filter-label {
  font-weight: 500;
  white-space: nowrap;
}

.filter-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.filter-remove-btn {
  flex-shrink: 0;
}

/* Ensure proper spacing and alignment */
.filter-chip .flex {
  min-width: 0; /* Allow flex items to shrink */
}

/* Hover effects */
.filter-chip:not(.opacity-50):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Focus styles */
.filter-remove-btn:focus {
  outline: none;
}

/* Disabled state */
.filter-chip.opacity-50 {
  pointer-events: none;
}
</style>