/**
 * Accessible Modal Component
 * Fully accessible modal dialog with focus management, ARIA attributes, and keyboard navigation
 */
<template>
  <Teleport to="body">
    <Transition
      name="modal"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="isOpen"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
      >
        <FocusTrap
          :active="isOpen"
          :restore-focus="true"
          :auto-focus="true"
          @escape="handleEscape"
        >
          <div
            ref="modalRef"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            :class="modalClasses"
            @click.stop
          >
            <!-- Modal Header -->
            <header v-if="$slots.header || title" class="modal-header">
              <div class="flex items-center justify-between">
                <h2
                  :id="titleId"
                  class="modal-title text-xl font-semibold text-neutral-900"
                >
                  <slot name="header">{{ title }}</slot>
                </h2>
                
                <button
                  v-if="showCloseButton"
                  type="button"
                  class="modal-close-button p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                  :aria-label="closeButtonLabel"
                  @click="handleClose"
                >
                  <Icon name="x" size="md" />
                </button>
              </div>
            </header>
            
            <!-- Modal Body -->
            <main class="modal-body">
              <div
                v-if="description"
                :id="descriptionId"
                class="modal-description text-neutral-600 mb-4"
              >
                {{ description }}
              </div>
              
              <slot />
            </main>
            
            <!-- Modal Footer -->
            <footer v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </footer>
          </div>
        </FocusTrap>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useModalAccessibility, useScreenReader } from '@/composables/useAccessibility.js';
import FocusTrap from './FocusTrap.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  /**
   * Whether the modal is open
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  
  /**
   * Modal title
   */
  title: {
    type: String,
    default: ''
  },
  
  /**
   * Modal description for screen readers
   */
  description: {
    type: String,
    default: ''
  },
  
  /**
   * Whether to show the close button
   */
  showCloseButton: {
    type: Boolean,
    default: true
  },
  
  /**
   * Close button aria-label
   */
  closeButtonLabel: {
    type: String,
    default: 'Close modal'
  },
  
  /**
   * Whether clicking the overlay closes the modal
   */
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether pressing Escape closes the modal
   */
  closeOnEscape: {
    type: Boolean,
    default: true
  },
  
  /**
   * Modal size
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  
  /**
   * Additional CSS classes for the modal
   */
  modalClass: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'open']);

// Composables
const { announce } = useScreenReader();

// Refs
const modalRef = ref(null);

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substr(2, 9)}`);

const modalClasses = computed(() => [
  'modal-dialog',
  'bg-white rounded-xl shadow-2xl transform transition-all duration-300 ease-out',
  'max-h-[90vh] overflow-y-auto',
  {
    // Size classes
    'max-w-sm': props.size === 'sm',
    'max-w-md': props.size === 'md',
    'max-w-2xl': props.size === 'lg',
    'max-w-4xl': props.size === 'xl',
    'max-w-full h-full': props.size === 'full',
  },
  props.modalClass
]);

// Methods
const handleClose = () => {
  isOpen.value = false;
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose();
  }
};

const handleEscape = () => {
  if (props.closeOnEscape) {
    handleClose();
  }
};

const onEnter = async () => {
  // Announce modal opening to screen readers
  await nextTick();
  const announcement = props.title 
    ? `Dialog opened: ${props.title}` 
    : 'Dialog opened';
  announce(announcement, 'assertive');
  
  emit('open');
};

const onLeave = () => {
  // Announce modal closing to screen readers
  announce('Dialog closed', 'assertive');
};

// Watch for modal state changes
watch(isOpen, (newValue) => {
  if (newValue) {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    // Restore body scroll when modal is closed
    document.body.style.overflow = '';
  }
});

// Cleanup on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Modal overlay */
.modal-overlay {
  backdrop-filter: blur(4px);
}

/* Modal dialog */
.modal-dialog {
  width: 100%;
  margin: auto;
}

/* Modal sections */
.modal-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid theme('colors.neutral.200');
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.modal-body {
  padding: 0 24px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px 24px 24px;
  border-top: 1px solid theme('colors.neutral.200');
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Modal title */
.modal-title {
  margin: 0;
  line-height: 1.4;
}

/* Modal description */
.modal-description {
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* Close button */
.modal-close-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transitions */
.modal-enter-active .modal-dialog {
  transform: scale(0.95);
}

.modal-enter-to .modal-dialog {
  transform: scale(1);
}

.modal-leave-from .modal-dialog {
  transform: scale(1);
}

.modal-leave-to .modal-dialog {
  transform: scale(0.95);
}

/* High contrast mode support */
.high-contrast .modal-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}

.high-contrast .modal-dialog {
  border: 3px solid var(--color-border);
}

.high-contrast .modal-header,
.high-contrast .modal-footer {
  border-color: var(--color-border);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-dialog {
    transition: none !important;
    transform: none !important;
  }
  
  .modal-overlay {
    backdrop-filter: none;
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .modal-dialog {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>