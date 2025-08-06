/**
 * Keyboard Navigation Helper Component
 * Provides keyboard navigation functionality for lists, grids, and other interactive elements
 */
<template>
  <div
    ref="containerRef"
    :class="containerClass"
    :role="role"
    :aria-label="ariaLabel"
    :aria-orientation="orientation"
    @keydown="handleKeyDown"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot
      :current-index="currentIndex"
      :is-active="isActive"
      :set-current-index="setCurrentIndex"
      :activate="activate"
      :deactivate="deactivate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useKeyboardNavigation, useScreenReader } from '@/composables/useAccessibility.js';

const props = defineProps({
  /**
   * Navigation orientation
   */
  orientation: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', 'grid'].includes(value)
  },
  
  /**
   * Whether navigation should wrap around
   */
  wrap: {
    type: Boolean,
    default: true
  },
  
  /**
   * Number of columns for grid navigation
   */
  columns: {
    type: Number,
    default: 1
  },
  
  /**
   * CSS selector for navigable elements
   */
  itemSelector: {
    type: String,
    default: '[role="option"], [role="menuitem"], [role="tab"], button, a[href]'
  },
  
  /**
   * Whether to enable type-ahead search
   */
  enableTypeAhead: {
    type: Boolean,
    default: true
  },
  
  /**
   * Function to get text for type-ahead search
   */
  getItemText: {
    type: Function,
    default: (element) => element.textContent || element.getAttribute('aria-label') || ''
  },
  
  /**
   * ARIA role for the container
   */
  role: {
    type: String,
    default: 'listbox'
  },
  
  /**
   * ARIA label for the container
   */
  ariaLabel: {
    type: String,
    default: ''
  },
  
  /**
   * Additional CSS classes for the container
   */
  containerClass: {
    type: [String, Array, Object],
    default: ''
  },
  
  /**
   * Whether to auto-activate on mount
   */
  autoActivate: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'navigate',
  'select',
  'activate',
  'deactivate',
  'type-ahead'
]);

// Refs
const containerRef = ref(null);
const elements = ref([]);

// Composables
const { announce } = useScreenReader();
const {
  currentIndex,
  isActive,
  handleKeyDown: handleNavKeyDown,
  handleTypeAhead,
  activate,
  deactivate,
  setCurrentIndex
} = useKeyboardNavigation(elements, {
  orientation: props.orientation,
  wrap: props.wrap,
  columns: props.columns
});

// Methods
const updateElements = () => {
  if (!containerRef.value) return;
  
  const foundElements = Array.from(
    containerRef.value.querySelectorAll(props.itemSelector)
  ).filter(el => {
    // Only include visible and enabled elements
    const style = getComputedStyle(el);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           !el.disabled &&
           el.offsetWidth > 0 && 
           el.offsetHeight > 0;
  });
  
  elements.value = foundElements;
};

const handleKeyDown = (event) => {
  updateElements();
  
  if (elements.value.length === 0) return;
  
  // Handle type-ahead search
  if (props.enableTypeAhead && event.key.length === 1 && 
      !event.ctrlKey && !event.altKey && !event.metaKey) {
    const newIndex = handleTypeAhead(event, props.getItemText);
    if (newIndex !== -1) {
      emit('type-ahead', {
        index: newIndex,
        element: elements.value[newIndex],
        searchChar: event.key
      });
      return;
    }
  }
  
  // Handle arrow navigation
  const previousIndex = currentIndex.value;
  const handled = handleNavKeyDown(event);
  
  if (handled && currentIndex.value !== previousIndex) {
    const currentElement = elements.value[currentIndex.value];
    
    // Announce navigation to screen readers
    const itemText = props.getItemText(currentElement);
    if (itemText) {
      announce(`${itemText}, ${currentIndex.value + 1} of ${elements.value.length}`, 'polite');
    }
    
    emit('navigate', {
      index: currentIndex.value,
      previousIndex,
      element: currentElement,
      event
    });
  }
  
  // Handle selection (Enter or Space)
  if ((event.key === 'Enter' || event.key === ' ') && 
      currentIndex.value >= 0 && currentIndex.value < elements.value.length) {
    event.preventDefault();
    const currentElement = elements.value[currentIndex.value];
    
    emit('select', {
      index: currentIndex.value,
      element: currentElement,
      event
    });
    
    // Trigger click on the element
    currentElement.click();
  }
};

const handleFocus = (event) => {
  // Auto-activate when container receives focus
  if (!isActive.value && props.autoActivate) {
    activate();
    emit('activate');
  }
  
  // Update current index based on focused element
  updateElements();
  const focusedIndex = elements.value.indexOf(event.target);
  if (focusedIndex !== -1) {
    setCurrentIndex(focusedIndex);
  }
};

const handleBlur = (event) => {
  // Check if focus is moving outside the container
  if (!containerRef.value?.contains(event.relatedTarget)) {
    deactivate();
    emit('deactivate');
  }
};

// Watch for changes that might affect elements
const observer = ref(null);

onMounted(() => {
  updateElements();
  
  if (props.autoActivate) {
    activate();
    emit('activate');
  }
  
  // Set up mutation observer to watch for DOM changes
  if (containerRef.value) {
    observer.value = new MutationObserver(() => {
      updateElements();
    });
    
    observer.value.observe(containerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'style']
    });
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
  
  if (isActive.value) {
    deactivate();
  }
});

// Watch for prop changes
watch(() => props.itemSelector, updateElements);
watch(() => props.orientation, () => {
  // Re-initialize navigation with new orientation
  if (isActive.value) {
    deactivate();
    activate();
  }
});

// Expose methods for parent components
defineExpose({
  updateElements,
  activate,
  deactivate,
  setCurrentIndex,
  getCurrentElement: () => elements.value[currentIndex.value],
  getElements: () => elements.value,
  currentIndex,
  isActive
});
</script>

<style scoped>
/* Container styles */
.keyboard-navigation {
  position: relative;
}

/* Focus management */
.keyboard-navigation:focus {
  outline: none;
}

.keyboard-navigation:focus-visible {
  outline: 2px solid var(--color-focus, #0066cc);
  outline-offset: 2px;
}

/* High contrast mode support */
.high-contrast .keyboard-navigation {
  border: 1px solid var(--color-border);
}

.high-contrast .keyboard-navigation:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
</style>