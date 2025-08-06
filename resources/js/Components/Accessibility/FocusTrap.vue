/**
 * Focus Trap Component
 * Traps focus within a container for modal dialogs and other overlay components
 */
<template>
  <div
    ref="trapContainer"
    :class="containerClass"
    @keydown="handleKeyDown"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useFocusManagement } from '@/composables/useAccessibility.js';

const props = defineProps({
  /**
   * Whether the focus trap is active
   */
  active: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to restore focus when trap is deactivated
   */
  restoreFocus: {
    type: Boolean,
    default: true
  },
  
  /**
   * Additional CSS classes for the container
   */
  containerClass: {
    type: [String, Array, Object],
    default: ''
  },
  
  /**
   * Whether to focus the first element immediately
   */
  autoFocus: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['escape']);

const trapContainer = ref(null);
const { 
  storeFocus, 
  restoreFocus: restorePreviousFocus, 
  trapFocus, 
  removeFocusTrap,
  getFocusableElements 
} = useFocusManagement();

let trapCleanup = null;

const activateTrap = async () => {
  if (!trapContainer.value || !props.active) return;
  
  // Store current focus if we should restore it later
  if (props.restoreFocus) {
    storeFocus();
  }
  
  // Wait for DOM updates
  await nextTick();
  
  // Set up focus trap
  trapCleanup = trapFocus(trapContainer.value);
  
  // Auto-focus first element if requested
  if (props.autoFocus) {
    const focusableElements = getFocusableElements(trapContainer.value);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
};

const deactivateTrap = () => {
  if (trapCleanup) {
    trapCleanup();
    trapCleanup = null;
  }
  
  // Restore previous focus if requested
  if (props.restoreFocus) {
    restorePreviousFocus();
  }
};

const handleKeyDown = (event) => {
  // Handle Escape key
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('escape');
    return;
  }
  
  // Let the focus trap handle Tab navigation
  // The trap is already set up in activateTrap()
};

// Watch for active prop changes
watch(() => props.active, (newActive) => {
  if (newActive) {
    activateTrap();
  } else {
    deactivateTrap();
  }
}, { immediate: true });

onMounted(() => {
  if (props.active) {
    activateTrap();
  }
});

onUnmounted(() => {
  deactivateTrap();
});

// Expose methods for parent components
defineExpose({
  activateTrap,
  deactivateTrap,
  getFocusableElements: () => getFocusableElements(trapContainer.value)
});
</script>

<style scoped>
/* Focus trap container styles */
.focus-trap {
  position: relative;
}

/* Ensure focus trap works with various layouts */
.focus-trap:focus {
  outline: none;
}

/* High contrast mode support */
.high-contrast .focus-trap {
  border: 2px solid var(--color-focus);
}
</style>