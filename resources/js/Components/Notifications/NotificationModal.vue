<template>
  <Teleport to="body">
    <Transition
      name="modal"
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="notification-modal-overlay"
        :class="overlayClasses"
        @click="handleOverlayClick"
      >
        <Transition
          name="modal-content"
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="visible"
            :class="modalClasses"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            @click.stop
          >
            <!-- Modal Header -->
            <div v-if="showHeader" class="modal-header">
              <div class="modal-header-content">
                <!-- Icon -->
                <div v-if="showIcon" class="modal-icon">
                  <div :class="iconContainerClasses">
                    <component :is="iconComponent" :class="iconClasses" />
                  </div>
                </div>

                <!-- Title and Description -->
                <div class="modal-text">
                  <h3 v-if="title" :id="titleId" class="modal-title">
                    {{ title }}
                  </h3>
                  <p v-if="description" :id="descriptionId" class="modal-description">
                    {{ description }}
                  </p>
                </div>

                <!-- Close Button -->
                <button
                  v-if="closable && showCloseButton"
                  @click="close"
                  class="modal-close-button"
                  :aria-label="closeLabel"
                >
                  <component :is="closeIcon" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div v-if="$slots.default" class="modal-content">
              <slot />
            </div>

            <!-- Modal Actions -->
            <div v-if="showActions" class="modal-actions">
              <div class="modal-actions-content">
                <!-- Custom Actions Slot -->
                <slot name="actions">
                  <!-- Cancel Button -->
                  <button
                    v-if="showCancel"
                    @click="handleCancel"
                    :class="cancelButtonClasses"
                    :disabled="loading"
                  >
                    {{ cancelText }}
                  </button>

                  <!-- Confirm Button -->
                  <button
                    v-if="showConfirm"
                    @click="handleConfirm"
                    :class="confirmButtonClasses"
                    :disabled="loading"
                  >
                    <component
                      v-if="loading"
                      :is="loadingIcon"
                      class="w-4 h-4 animate-spin mr-2"
                    />
                    {{ confirmText }}
                  </button>
                </slot>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { getIcon } from '@/config/icons'

const props = defineProps({
  /**
   * Modal visibility
   */
  visible: {
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
   * Modal description
   */
  description: {
    type: String,
    default: ''
  },

  /**
   * Modal type/variant
   */
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info', 'confirm'].includes(value)
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
   * Show header section
   */
  showHeader: {
    type: Boolean,
    default: true
  },

  /**
   * Show icon
   */
  showIcon: {
    type: Boolean,
    default: true
  },

  /**
   * Custom icon
   */
  icon: {
    type: String,
    default: ''
  },

  /**
   * Show close button
   */
  closable: {
    type: Boolean,
    default: true
  },

  /**
   * Show close button in header
   */
  showCloseButton: {
    type: Boolean,
    default: true
  },

  /**
   * Close on overlay click
   */
  closeOnOverlay: {
    type: Boolean,
    default: true
  },

  /**
   * Close on escape key
   */
  closeOnEscape: {
    type: Boolean,
    default: true
  },

  /**
   * Show actions section
   */
  showActions: {
    type: Boolean,
    default: true
  },

  /**
   * Show cancel button
   */
  showCancel: {
    type: Boolean,
    default: true
  },

  /**
   * Show confirm button
   */
  showConfirm: {
    type: Boolean,
    default: true
  },

  /**
   * Cancel button text
   */
  cancelText: {
    type: String,
    default: 'Cancel'
  },

  /**
   * Confirm button text
   */
  confirmText: {
    type: String,
    default: 'Confirm'
  },

  /**
   * Loading state
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * Persistent modal (no auto-close)
   */
  persistent: {
    type: Boolean,
    default: false
  },

  /**
   * Z-index for stacking
   */
  zIndex: {
    type: Number,
    default: 1050
  },

  /**
   * Close button label for accessibility
   */
  closeLabel: {
    type: String,
    default: 'Close modal'
  },

  /**
   * Auto-focus element selector
   */
  autoFocus: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm', 'cancel', 'update:visible'])

// Local state
const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = ref(`modal-description-${Math.random().toString(36).substr(2, 9)}`)
const previousActiveElement = ref(null)

// Icons
const closeIcon = computed(() => getIcon('x-mark'))
const loadingIcon = computed(() => getIcon('loading') || getIcon('refresh'))
const iconComponent = computed(() => {
  if (props.icon) return getIcon(props.icon)
  
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'exclamation-triangle',
    info: 'information-circle',
    confirm: 'question-mark-circle'
  }
  
  return getIcon(iconMap[props.type] || iconMap.info)
})

// Computed properties
const overlayClasses = computed(() => [
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4',
  {
    'backdrop-blur-sm': props.type === 'error' || props.type === 'warning'
  }
])

const modalClasses = computed(() => [
  'notification-modal',
  `notification-modal--${props.type}`,
  `notification-modal--${props.size}`,
  'bg-white rounded-lg shadow-xl max-h-full overflow-hidden',
  {
    'notification-modal--loading': props.loading
  }
])

const iconContainerClasses = computed(() => [
  'w-12 h-12 rounded-full flex items-center justify-center',
  {
    'bg-success-100': props.type === 'success',
    'bg-error-100': props.type === 'error',
    'bg-warning-100': props.type === 'warning',
    'bg-info-100': props.type === 'info',
    'bg-primary-100': props.type === 'confirm'
  }
])

const iconClasses = computed(() => [
  'w-6 h-6',
  {
    'text-success-600': props.type === 'success',
    'text-error-600': props.type === 'error',
    'text-warning-600': props.type === 'warning',
    'text-info-600': props.type === 'info',
    'text-primary-600': props.type === 'confirm'
  }
])

const cancelButtonClasses = computed(() => [
  'px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
])

const confirmButtonClasses = computed(() => [
  'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center',
  {
    'bg-success-600 hover:bg-success-700 focus:ring-success-500': props.type === 'success',
    'bg-error-600 hover:bg-error-700 focus:ring-error-500': props.type === 'error',
    'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500': props.type === 'warning',
    'bg-info-600 hover:bg-info-700 focus:ring-info-500': props.type === 'info',
    'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500': props.type === 'confirm'
  }
])

// Methods
const close = () => {
  if (!props.persistent) {
    emit('update:visible', false)
    emit('close')
    restoreFocus()
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  if (!props.persistent) {
    close()
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && props.closable) {
    close()
  }
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.closable && props.visible) {
    close()
  }
}

const trapFocus = (event) => {
  if (!props.visible) return
  
  const modal = event.currentTarget
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

const setInitialFocus = async () => {
  await nextTick()
  
  if (!props.visible) return
  
  // Store the previously focused element
  previousActiveElement.value = document.activeElement
  
  // Set focus to specified element or first focusable element
  const modal = document.querySelector('.notification-modal')
  if (!modal) return
  
  let targetElement = null
  
  if (props.autoFocus) {
    targetElement = modal.querySelector(props.autoFocus)
  }
  
  if (!targetElement) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    targetElement = focusableElements[0]
  }
  
  if (targetElement) {
    targetElement.focus()
  }
}

const restoreFocus = () => {
  if (previousActiveElement.value && typeof previousActiveElement.value.focus === 'function') {
    previousActiveElement.value.focus()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', trapFocus)
  
  if (props.visible) {
    setInitialFocus()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', trapFocus)
  restoreFocus()
})

// Watch for visibility changes
watch(() => props.visible, (newValue) => {
  if (newValue) {
    setInitialFocus()
  } else {
    restoreFocus()
  }
})
</script>

<style scoped>
/* Modal Overlay */
.notification-modal-overlay {
  z-index: v-bind(zIndex);
}

/* Modal Container */
.notification-modal {
  @apply w-full max-w-md mx-auto;
}

/* Size Variants */
.notification-modal--sm {
  @apply max-w-sm;
}

.notification-modal--md {
  @apply max-w-md;
}

.notification-modal--lg {
  @apply max-w-lg;
}

.notification-modal--xl {
  @apply max-w-2xl;
}

.notification-modal--full {
  @apply max-w-none w-full h-full rounded-none;
}

/* Modal Header */
.modal-header {
  @apply p-6 pb-4;
}

.modal-header-content {
  @apply flex items-start space-x-4;
}

.modal-icon {
  @apply flex-shrink-0;
}

.modal-text {
  @apply flex-1 min-w-0;
}

.modal-title {
  @apply text-lg font-semibold text-neutral-900 mb-2;
}

.modal-description {
  @apply text-sm text-neutral-600 leading-relaxed;
}

.modal-close-button {
  @apply flex-shrink-0 text-neutral-400 hover:text-neutral-600 p-1 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Modal Content */
.modal-content {
  @apply px-6 py-4 max-h-96 overflow-y-auto;
}

/* Modal Actions */
.modal-actions {
  @apply px-6 py-4 bg-neutral-50 border-t border-neutral-200;
}

.modal-actions-content {
  @apply flex justify-end space-x-3;
}

/* Type-specific Styles */
.notification-modal--success .modal-title {
  @apply text-success-900;
}

.notification-modal--error .modal-title {
  @apply text-error-900;
}

.notification-modal--warning .modal-title {
  @apply text-warning-900;
}

.notification-modal--info .modal-title {
  @apply text-info-900;
}

.notification-modal--confirm .modal-title {
  @apply text-primary-900;
}

/* Loading State */
.notification-modal--loading {
  @apply pointer-events-none;
}

.notification-modal--loading .modal-actions-content button:not(:disabled) {
  @apply opacity-50;
}

/* Dark Theme */
.theme-dark .notification-modal {
  @apply bg-neutral-800;
}

.theme-dark .modal-title {
  @apply text-neutral-100;
}

.theme-dark .modal-description {
  @apply text-neutral-300;
}

.theme-dark .modal-close-button {
  @apply text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700;
}

.theme-dark .modal-actions {
  @apply bg-neutral-900 border-neutral-700;
}

.theme-dark .notification-modal--success .modal-title {
  @apply text-success-100;
}

.theme-dark .notification-modal--error .modal-title {
  @apply text-error-100;
}

.theme-dark .notification-modal--warning .modal-title {
  @apply text-warning-100;
}

.theme-dark .notification-modal--info .modal-title {
  @apply text-info-100;
}

.theme-dark .notification-modal--confirm .modal-title {
  @apply text-primary-100;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-modal {
    @apply mx-4;
  }
  
  .notification-modal--full {
    @apply mx-0 h-full;
  }
  
  .modal-header {
    @apply p-4 pb-3;
  }
  
  .modal-content {
    @apply px-4 py-3;
  }
  
  .modal-actions {
    @apply px-4 py-3;
  }
  
  .modal-actions-content {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .modal-actions-content button {
    @apply w-full;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .notification-modal-overlay,
  .notification-modal {
    @apply transition-none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .notification-modal {
    @apply border-2 border-neutral-900;
  }
  
  .modal-actions {
    @apply border-t-2;
  }
}

/* Focus Styles */
.modal-close-button:focus,
.modal-actions-content button:focus {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

/* Animation Classes */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}

@media (min-width: 640px) {
  .modal-content-enter-from,
  .modal-content-leave-to {
    transform: translateY(0) scale(0.95);
  }
}
</style>