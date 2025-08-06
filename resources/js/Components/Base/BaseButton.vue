<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :style="buttonStyle"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-pressed="ariaPressed"
    :aria-expanded="ariaExpanded"
    :aria-controls="ariaControls"
    :aria-haspopup="ariaHaspopup"
    :aria-disabled="disabled || loading"
    :role="role"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
    ref="buttonRef"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Icon (left side) -->
    <component
      v-if="iconLeft && !loading"
      :is="iconLeft"
      :class="iconClasses"
    />

    <!-- Button Content -->
    <span v-if="$slots.default || label" :class="contentClasses">
      <slot>{{ label }}</slot>
    </span>

    <!-- Icon (right side) -->
    <component
      v-if="iconRight && !loading"
      :is="iconRight"
      :class="iconClasses"
    />
  </component>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { prefersReducedMotion, createRippleEffect } from '@/utils/animations';
import { useAccessibility } from '@/composables/useAccessibility.js';

const props = defineProps({
  // Content
  label: {
    type: String,
    default: ''
  },
  
  // Variants
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'icon'].includes(value)
  },
  
  // Sizes
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
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
  
  // HTML attributes
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  
  // Link attributes
  href: {
    type: String,
    default: null
  },
  
  to: {
    type: [String, Object],
    default: null
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  },
  
  // Full width
  fullWidth: {
    type: Boolean,
    default: false
  },
  
  // Rounded
  rounded: {
    type: String,
    default: 'base',
    validator: (value) => ['none', 'sm', 'base', 'lg', 'xl', 'full'].includes(value)
  },
  
  // Accessibility props
  ariaLabel: {
    type: String,
    default: null
  },
  
  ariaLabelledby: {
    type: String,
    default: null
  },
  
  ariaDescribedby: {
    type: String,
    default: null
  },
  
  ariaPressed: {
    type: [Boolean, String],
    default: null
  },
  
  ariaExpanded: {
    type: [Boolean, String],
    default: null
  },
  
  ariaControls: {
    type: String,
    default: null
  },
  
  ariaHaspopup: {
    type: [Boolean, String],
    default: null
  },
  
  role: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['click', 'focus', 'blur', 'keydown']);

// Accessibility composable
const { announce, prefersReducedMotion: prefersReducedMotionRef } = useAccessibility();

// Refs and reactive state
const buttonRef = ref(null);
const isPressed = ref(false);
const rippleCleanup = ref(null);

// Determine the component tag
const tag = computed(() => {
  if (props.href) return 'a';
  if (props.to) return 'router-link';
  return 'button';
});

// Base button classes
const baseClasses = computed(() => [
  'btn-base',
  'inline-flex',
  'items-center',
  'justify-center',
  'font-medium',
  'transition-all',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
  'disabled:pointer-events-none',
  {
    'w-full': props.fullWidth,
    'opacity-75': props.loading,
    'cursor-wait': props.loading,
    'opacity-50': props.disabled,
    'cursor-not-allowed': props.disabled
  }
]);

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: props.variant === 'icon' ? 'p-1.5' : 'px-3 py-1.5 text-sm h-8',
    md: props.variant === 'icon' ? 'p-2' : 'px-4 py-2 text-base h-10',
    lg: props.variant === 'icon' ? 'p-2.5' : 'px-6 py-3 text-lg h-12',
    xl: props.variant === 'icon' ? 'p-3' : 'px-8 py-4 text-xl h-14'
  };
  return sizes[props.size];
});

// Variant classes
const variantClasses = computed(() => {
  const variants = {
    primary: [
      'bg-gradient-to-r',
      'from-primary-500',
      'to-primary-600',
      'text-white',
      'shadow-sm',
      'hover:from-primary-600',
      'hover:to-primary-700',
      'hover:shadow-md',
      'active:from-primary-700',
      'active:to-primary-800',
      'focus:ring-primary-500'
    ],
    secondary: [
      'border',
      'border-neutral-300',
      'bg-white',
      'text-neutral-700',
      'shadow-sm',
      'hover:bg-neutral-50',
      'hover:border-neutral-400',
      'hover:shadow-md',
      'active:bg-neutral-100',
      'focus:ring-neutral-500'
    ],
    ghost: [
      'text-neutral-600',
      'bg-transparent',
      'hover:bg-neutral-100',
      'hover:text-neutral-900',
      'active:bg-neutral-200',
      'focus:ring-neutral-500'
    ],
    icon: [
      'text-neutral-600',
      'bg-transparent',
      'hover:bg-neutral-100',
      'hover:text-neutral-900',
      'active:bg-neutral-200',
      'focus:ring-neutral-500',
      'rounded-full'
    ]
  };
  return variants[props.variant] || variants.primary;
});

// Rounded classes
const roundedClasses = computed(() => {
  if (props.variant === 'icon') return 'rounded-full';
  
  const rounded = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  return rounded[props.rounded];
});

// Icon classes
const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };
  
  return [
    sizes[props.size],
    'flex-shrink-0'
  ];
});

// Content classes for proper spacing
const contentClasses = computed(() => {
  if (props.variant === 'icon') return '';
  
  const hasLeftIcon = props.iconLeft && !props.loading;
  const hasRightIcon = props.iconRight;
  const hasLoadingIcon = props.loading;
  
  return [
    {
      'ml-2': hasLeftIcon || hasLoadingIcon,
      'mr-2': hasRightIcon
    }
  ];
});

// Combined button classes
const buttonClasses = computed(() => [
  ...baseClasses.value,
  sizeClasses.value,
  ...variantClasses.value,
  roundedClasses.value,
  props.class,
  {
    'btn-pressed': isPressed.value && !prefersReducedMotion(),
    'btn-ripple': !prefersReducedMotion()
  }
]);

// Button style for dynamic animations
const buttonStyle = computed(() => {
  if (prefersReducedMotion()) return {};
  
  return {
    position: 'relative',
    overflow: 'hidden',
    transform: isPressed.value ? 'scale(0.98)' : 'scale(1)',
    transition: 'transform 0.1s ease-out'
  };
});

// Animation event handlers
const handleMouseDown = (event) => {
  if (props.loading || props.disabled) return;
  isPressed.value = true;
  
  // Create ripple effect
  if (!prefersReducedMotion() && buttonRef.value) {
    createRippleEffect(buttonRef.value, event);
  }
};

const handleMouseUp = () => {
  isPressed.value = false;
};

const handleMouseLeave = () => {
  isPressed.value = false;
};

// Handle click events
const handleClick = (event) => {
  if (props.loading || props.disabled) {
    event.preventDefault();
    return;
  }
  
  // Add click feedback animation
  if (!prefersReducedMotion() && buttonRef.value) {
    buttonRef.value.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (buttonRef.value) {
        buttonRef.value.style.transform = '';
      }
    }, 100);
  }
  
  emit('click', event);
};

// Handle keyboard events
const handleKeydown = (event) => {
  // Handle Enter and Space keys for accessibility
  if (event.key === 'Enter' || event.key === ' ') {
    if (props.loading || props.disabled) {
      event.preventDefault();
      return;
    }
    
    // Prevent default space behavior (scrolling)
    if (event.key === ' ') {
      event.preventDefault();
    }
    
    // Trigger click event
    handleClick(event);
  }
  
  emit('keydown', event);
};

// Handle focus events
const handleFocus = (event) => {
  emit('focus', event);
};

// Handle blur events
const handleBlur = (event) => {
  isPressed.value = false;
  emit('blur', event);
};

// Setup ripple effect on mount
onMounted(() => {
  if (buttonRef.value && !prefersReducedMotion()) {
    rippleCleanup.value = createRippleEffect(buttonRef.value);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (rippleCleanup.value) {
    rippleCleanup.value();
  }
});
</script>

<style scoped>
/* Additional button-specific styles if needed */
.btn-base {
  /* Ensure consistent line-height for all button sizes */
  line-height: 1;
}

/* Loading animation enhancement */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus ring enhancement for better accessibility */
.btn-base:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Hover and active state transitions */
.btn-base {
  transform: translateY(0);
}

.btn-base:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-base:active:not(:disabled) {
  transform: translateY(0);
}

/* Ripple effect styles */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-pressed {
  transform: scale(0.98);
}

/* Ripple animation keyframes */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Enhanced focus states for accessibility */
.btn-base:focus-visible {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn-base,
  .btn-base:hover,
  .btn-base:active,
  .btn-pressed {
    transform: none !important;
    transition: none !important;
  }
  
  .animate-spin {
    animation: none !important;
  }
}
</style>