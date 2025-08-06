<template>
  <button
    :class="[
      'relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
      {
        'bg-primary-600': checked,
        'bg-neutral-200': !checked,
        'opacity-50 cursor-not-allowed': disabled
      }
    ]"
    :disabled="disabled"
    :aria-checked="checked"
    :aria-label="ariaLabel"
    role="switch"
    @click="handleToggle"
  >
    <!-- Toggle thumb -->
    <span
      :class="[
        'inline-block w-4 h-4 transform bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out',
        {
          'translate-x-6': checked,
          'translate-x-1': !checked
        }
      ]"
    >
      <!-- Optional icons -->
      <span v-if="showIcons" class="flex items-center justify-center w-full h-full">
        <Icon
          v-if="checked && checkedIcon"
          :name="checkedIcon"
          size="xs"
          :class="checkedIconClass"
        />
        <Icon
          v-else-if="!checked && uncheckedIcon"
          :name="uncheckedIcon"
          size="xs"
          :class="uncheckedIconClass"
        />
      </span>
    </span>
    
    <!-- Screen reader text -->
    <span class="sr-only">
      {{ checked ? 'Enabled' : 'Disabled' }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
  /**
   * Whether the toggle is checked
   */
  checked: {
    type: Boolean,
    default: false
  },
  
  /**
   * Whether the toggle is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },
  
  /**
   * Aria label for accessibility
   */
  ariaLabel: {
    type: String,
    default: ''
  },
  
  /**
   * Show icons in the toggle thumb
   */
  showIcons: {
    type: Boolean,
    default: false
  },
  
  /**
   * Icon to show when checked
   */
  checkedIcon: {
    type: String,
    default: 'check'
  },
  
  /**
   * Icon to show when unchecked
   */
  uncheckedIcon: {
    type: String,
    default: 'x'
  },
  
  /**
   * CSS class for checked icon
   */
  checkedIconClass: {
    type: String,
    default: 'text-primary-600'
  },
  
  /**
   * CSS class for unchecked icon
   */
  uncheckedIconClass: {
    type: String,
    default: 'text-neutral-400'
  },
  
  /**
   * Size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits(['change', 'update:checked']);

// Methods
const handleToggle = () => {
  if (props.disabled) return;
  
  const newValue = !props.checked;
  emit('change', newValue);
  emit('update:checked', newValue);
};
</script>

<style scoped>
/* Size variants */
.toggle-sm {
  @apply h-4 w-8;
}

.toggle-sm .toggle-thumb {
  @apply w-3 h-3;
}

.toggle-sm .toggle-thumb.checked {
  @apply translate-x-4;
}

.toggle-lg {
  @apply h-8 w-14;
}

.toggle-lg .toggle-thumb {
  @apply w-6 h-6;
}

.toggle-lg .toggle-thumb.checked {
  @apply translate-x-8;
}

/* High contrast mode */
:global(.high-contrast) .toggle-switch {
  border: 2px solid currentColor;
}

/* Reduced motion */
:global(.reduce-motion) .toggle-switch,
:global(.reduce-motion) .toggle-thumb {
  transition: none !important;
}

/* Focus styles for better accessibility */
.toggle-switch:focus {
  box-shadow: 0 0 0 2px theme('colors.primary.500');
}

/* Dark theme adjustments */
:global(.theme-dark) .toggle-switch {
  @apply bg-neutral-600;
}

:global(.theme-dark) .toggle-switch.checked {
  @apply bg-primary-500;
}
</style>