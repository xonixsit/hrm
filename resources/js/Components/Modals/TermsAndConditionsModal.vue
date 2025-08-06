<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
        tabindex="-1"
      >
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="isOpen"
            class="modal-container"
            @click.stop
            ref="modalRef"
          >
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="header-content">
                <h2 :id="titleId" class="modal-title">
                  {{ title }}
                </h2>
                <p v-if="subtitle" class="modal-subtitle">
                  {{ subtitle }}
                </p>
              </div>
              
              <button
                @click="handleClose"
                class="close-button"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Content -->
            <div class="modal-content" :id="contentId">
              <div class="terms-content">
                <!-- Last Updated -->
                <div v-if="lastUpdated" class="last-updated">
                  <p class="text-sm text-neutral-600">
                    Last updated: {{ formatDate(lastUpdated) }}
                  </p>
                </div>

                <!-- Terms Sections -->
                <div class="terms-sections">
                  <section
                    v-for="(section, index) in termsSections"
                    :key="section.id || index"
                    class="terms-section"
                  >
                    <h3 class="section-title">{{ section.title }}</h3>
                    <div class="section-content">
                      <div
                        v-if="section.content"
                        v-html="section.content"
                        class="prose prose-sm max-w-none"
                      ></div>
                      <div v-else-if="section.items" class="section-items">
                        <ul class="terms-list">
                          <li
                            v-for="(item, itemIndex) in section.items"
                            :key="itemIndex"
                            class="terms-list-item"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>

                <!-- Contact Information -->
                <div v-if="contactInfo" class="contact-info">
                  <h3 class="section-title">Contact Information</h3>
                  <div class="contact-details">
                    <p v-if="contactInfo.email" class="contact-item">
                      <strong>Email:</strong> 
                      <a :href="`mailto:${contactInfo.email}`" class="contact-link">
                        {{ contactInfo.email }}
                      </a>
                    </p>
                    <p v-if="contactInfo.phone" class="contact-item">
                      <strong>Phone:</strong> {{ contactInfo.phone }}
                    </p>
                    <p v-if="contactInfo.address" class="contact-item">
                      <strong>Address:</strong> {{ contactInfo.address }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="modal-actions">
              <div class="actions-content">
                <!-- Agreement Checkbox -->
                <div v-if="requiresAgreement" class="agreement-section">
                  <label class="agreement-label">
                    <input
                      v-model="hasAgreed"
                      type="checkbox"
                      class="agreement-checkbox"
                      :disabled="isProcessing"
                    />
                    <span class="checkbox-text">
                      {{ agreementText }}
                    </span>
                  </label>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <BaseButton
                    variant="secondary"
                    @click="handleClose"
                    :disabled="isProcessing"
                  >
                    {{ cancelButtonText }}
                  </BaseButton>

                  <BaseButton
                    v-if="requiresAgreement"
                    variant="primary"
                    @click="handleAccept"
                    :disabled="!hasAgreed || isProcessing"
                    :loading="isProcessing"
                  >
                    {{ acceptButtonText }}
                  </BaseButton>

                  <BaseButton
                    v-else
                    variant="primary"
                    @click="handleClose"
                    :disabled="isProcessing"
                  >
                    {{ closeButtonText }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const props = defineProps({
  // Modal state
  isOpen: {
    type: Boolean,
    default: false
  },
  
  // Content
  title: {
    type: String,
    default: 'Terms and Conditions'
  },
  
  subtitle: {
    type: String,
    default: 'Please read and accept our terms and conditions to continue'
  },
  
  termsSections: {
    type: Array,
    required: true,
    default: () => []
  },
  
  lastUpdated: {
    type: [String, Date],
    default: null
  },
  
  contactInfo: {
    type: Object,
    default: null
  },
  
  // Agreement
  requiresAgreement: {
    type: Boolean,
    default: true
  },
  
  agreementText: {
    type: String,
    default: 'I have read and agree to the Terms and Conditions'
  },
  
  // Button text
  acceptButtonText: {
    type: String,
    default: 'Accept and Continue'
  },
  
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  
  closeButtonText: {
    type: String,
    default: 'Close'
  },
  
  // State
  isProcessing: {
    type: Boolean,
    default: false
  },
  
  // Behavior
  closeOnOverlayClick: {
    type: Boolean,
    default: false
  },
  
  closeOnEscape: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'accept', 'cancel']);

// Local state
const hasAgreed = ref(false);
const modalRef = ref(null);

// Generate unique IDs for accessibility
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);
const contentId = computed(() => `modal-content-${Math.random().toString(36).substr(2, 9)}`);

// Methods
const handleClose = () => {
  emit('close');
};

const handleAccept = () => {
  if (!hasAgreed.value) return;
  emit('accept');
};

const handleCancel = () => {
  emit('cancel');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose();
  }
};

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.isOpen) {
    handleClose();
  }
};

const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const focusModal = async () => {
  await nextTick();
  if (modalRef.value) {
    modalRef.value.focus();
  }
};

const trapFocus = (event) => {
  if (!modalRef.value) return;
  
  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    hasAgreed.value = false;
    focusModal();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
  document.addEventListener('keydown', trapFocus);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  document.removeEventListener('keydown', trapFocus);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Modal overlay */
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
  @apply bg-black bg-opacity-50 backdrop-blur-sm;
}

/* Modal container */
.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col;
  @apply focus:outline-none;
}

/* Modal header */
.modal-header {
  @apply flex items-start justify-between p-6 border-b border-neutral-200 flex-shrink-0;
}

.header-content {
  @apply flex-1 min-w-0 pr-4;
}

.modal-title {
  @apply text-xl font-semibold text-neutral-900 leading-tight;
}

.modal-subtitle {
  @apply mt-1 text-sm text-neutral-600;
}

.close-button {
  @apply p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 rounded;
}

/* Modal content */
.modal-content {
  @apply flex-1 overflow-y-auto p-6;
}

.terms-content {
  @apply space-y-6;
}

.last-updated {
  @apply pb-4 border-b border-neutral-200;
}

.terms-sections {
  @apply space-y-6;
}

.terms-section {
  @apply space-y-3;
}

.section-title {
  @apply text-lg font-semibold text-neutral-900;
}

.section-content {
  @apply text-neutral-700 leading-relaxed;
}

.section-items {
  @apply space-y-2;
}

.terms-list {
  @apply list-disc list-inside space-y-1 ml-4;
}

.terms-list-item {
  @apply text-neutral-700;
}

.contact-info {
  @apply pt-6 border-t border-neutral-200 space-y-3;
}

.contact-details {
  @apply space-y-2;
}

.contact-item {
  @apply text-neutral-700;
}

.contact-link {
  @apply text-primary-600 hover:text-primary-700 underline;
}

/* Modal actions */
.modal-actions {
  @apply border-t border-neutral-200 p-6 flex-shrink-0;
}

.actions-content {
  @apply space-y-4;
}

.agreement-section {
  @apply flex items-start space-x-3;
}

.agreement-label {
  @apply flex items-start space-x-3 cursor-pointer;
}

.agreement-checkbox {
  @apply w-4 h-4 text-primary-600 border-neutral-300 rounded;
  @apply focus:ring-primary-500 focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply mt-0.5 flex-shrink-0;
}

.checkbox-text {
  @apply text-sm text-neutral-700 leading-relaxed;
}

.action-buttons {
  @apply flex items-center justify-end space-x-3;
}

/* Prose styles for HTML content */
.prose {
  @apply text-neutral-700;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-neutral-900 font-semibold;
}

.prose p {
  @apply mb-4;
}

.prose ul,
.prose ol {
  @apply mb-4 ml-6;
}

.prose li {
  @apply mb-1;
}

.prose a {
  @apply text-primary-600 hover:text-primary-700 underline;
}

.prose strong {
  @apply font-semibold text-neutral-900;
}

.prose em {
  @apply italic;
}

.prose blockquote {
  @apply border-l-4 border-neutral-300 pl-4 italic text-neutral-600;
}

.prose code {
  @apply bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded text-sm;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modal-container {
    @apply max-w-full m-2 max-h-[95vh];
  }
  
  .modal-header {
    @apply p-4;
  }
  
  .modal-content {
    @apply p-4;
  }
  
  .modal-actions {
    @apply p-4;
  }
  
  .action-buttons {
    @apply flex-col-reverse space-x-0 space-y-3 space-y-reverse;
  }
  
  .agreement-section {
    @apply items-start;
  }
}

/* Dark theme adjustments */
.theme-dark .modal-container {
  @apply bg-neutral-800 border border-neutral-700;
}

.theme-dark .modal-header {
  @apply border-neutral-700;
}

.theme-dark .modal-title {
  @apply text-neutral-100;
}

.theme-dark .modal-subtitle {
  @apply text-neutral-400;
}

.theme-dark .close-button {
  @apply text-neutral-500 hover:text-neutral-300;
}

.theme-dark .modal-actions {
  @apply border-neutral-700;
}

.theme-dark .last-updated {
  @apply border-neutral-700;
}

.theme-dark .contact-info {
  @apply border-neutral-700;
}

.theme-dark .section-title {
  @apply text-neutral-100;
}

.theme-dark .section-content,
.theme-dark .terms-list-item,
.theme-dark .contact-item {
  @apply text-neutral-300;
}

.theme-dark .checkbox-text {
  @apply text-neutral-300;
}

.theme-dark .agreement-checkbox {
  @apply border-neutral-600 bg-neutral-700;
}

.theme-dark .prose {
  @apply text-neutral-300;
}

.theme-dark .prose h1,
.theme-dark .prose h2,
.theme-dark .prose h3,
.theme-dark .prose h4,
.theme-dark .prose h5,
.theme-dark .prose h6 {
  @apply text-neutral-100;
}

.theme-dark .prose strong {
  @apply text-neutral-100;
}

.theme-dark .prose blockquote {
  @apply border-neutral-600 text-neutral-400;
}

.theme-dark .prose code {
  @apply bg-neutral-700 text-neutral-200;
}

/* Scrollbar styling */
.modal-content::-webkit-scrollbar {
  @apply w-2;
}

.modal-content::-webkit-scrollbar-track {
  @apply bg-neutral-100 rounded;
}

.modal-content::-webkit-scrollbar-thumb {
  @apply bg-neutral-300 rounded hover:bg-neutral-400;
}

.theme-dark .modal-content::-webkit-scrollbar-track {
  @apply bg-neutral-700;
}

.theme-dark .modal-content::-webkit-scrollbar-thumb {
  @apply bg-neutral-600 hover:bg-neutral-500;
}

/* Animation enhancements */
.modal-overlay {
  backdrop-filter: blur(4px);
}

/* Focus trap styling */
.modal-container:focus {
  @apply outline-none;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-container {
    transition: none;
  }
}
</style>