<template>
  <div class="registration-step" :class="stepClasses">
    <!-- Step Header -->
    <div v-if="showHeader" class="step-header">
      <div class="step-info">
        <h3 :id="`step-title-${stepId}`" class="step-title">{{ title }}</h3>
        <p v-if="description" class="step-description">{{ description }}</p>
      </div>
      <div v-if="showStepNumber" class="step-number-badge">
        {{ stepNumber }}
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <slot
        :errors="stepErrors"
        :is-valid="isStepValid"
        :validate="validateStep"
        :reset-validation="resetValidation"
      />
    </div>

    <!-- Step Actions -->
    <div v-if="showActions" class="step-actions">
      <div class="secondary-actions">
        <BaseButton
          v-if="showBackButton"
          variant="secondary"
          @click="handleBack"
          :disabled="isSubmitting"
        >
          {{ backButtonText }}
        </BaseButton>
      </div>

      <div class="primary-actions">
        <BaseButton
          v-if="showSkipButton"
          variant="ghost"
          @click="handleSkip"
          :disabled="isSubmitting"
        >
          {{ skipButtonText }}
        </BaseButton>

        <BaseButton
          v-if="showNextButton"
          variant="primary"
          @click="handleNext"
          :disabled="!canProceed || isSubmitting"
          :loading="isSubmitting"
        >
          {{ nextButtonText }}
        </BaseButton>

        <BaseButton
          v-if="showSubmitButton"
          variant="primary"
          type="submit"
          @click="handleSubmit"
          :disabled="!canProceed || isSubmitting"
          :loading="isSubmitting"
        >
          {{ submitButtonText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const props = defineProps({
  // Step identification
  stepId: {
    type: String,
    required: true
  },
  
  stepNumber: {
    type: Number,
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Step state
  isActive: {
    type: Boolean,
    default: false
  },
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  isValid: {
    type: Boolean,
    default: false
  },
  
  // Validation
  validationRules: {
    type: Object,
    default: () => ({})
  },
  
  errors: {
    type: Object,
    default: () => ({})
  },
  
  // Form data
  formData: {
    type: Object,
    default: () => ({})
  },
  
  // Step configuration
  isOptional: {
    type: Boolean,
    default: false
  },
  
  canSkip: {
    type: Boolean,
    default: false
  },
  
  requiresValidation: {
    type: Boolean,
    default: true
  },
  
  // Button configuration
  showBackButton: {
    type: Boolean,
    default: true
  },
  
  showNextButton: {
    type: Boolean,
    default: true
  },
  
  showSkipButton: {
    type: Boolean,
    default: false
  },
  
  showSubmitButton: {
    type: Boolean,
    default: false
  },
  
  // Button text
  backButtonText: {
    type: String,
    default: 'Back'
  },
  
  nextButtonText: {
    type: String,
    default: 'Next'
  },
  
  skipButtonText: {
    type: String,
    default: 'Skip'
  },
  
  submitButtonText: {
    type: String,
    default: 'Complete Registration'
  },
  
  // Display options
  showHeader: {
    type: Boolean,
    default: true
  },
  
  showStepNumber: {
    type: Boolean,
    default: true
  },
  
  showActions: {
    type: Boolean,
    default: true
  },
  
  // State
  isSubmitting: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'minimal'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits([
  'next',
  'back', 
  'skip',
  'submit',
  'validate',
  'update:isValid',
  'update:formData'
]);

// Local state
const localErrors = ref({});
const validationAttempted = ref(false);

// Computed properties
const stepErrors = computed(() => {
  // Combine prop errors with local validation errors
  return {
    ...props.errors,
    ...localErrors.value
  };
});

const hasErrors = computed(() => {
  return Object.keys(stepErrors.value).length > 0;
});

const isStepValid = computed(() => {
  if (!props.requiresValidation) return true;
  if (!validationAttempted.value) return props.isValid;
  return !hasErrors.value && props.isValid;
});

const canProceed = computed(() => {
  if (props.isOptional || props.canSkip) return true;
  return isStepValid.value;
});

const stepClasses = computed(() => [
  'registration-step',
  `registration-step--${props.variant}`,
  `registration-step--${props.size}`,
  {
    'registration-step--active': props.isActive,
    'registration-step--completed': props.isCompleted,
    'registration-step--optional': props.isOptional,
    'registration-step--has-errors': hasErrors.value,
    'registration-step--submitting': props.isSubmitting
  }
]);

// Methods
const validateStep = async () => {
  validationAttempted.value = true;
  localErrors.value = {};
  
  // Emit validation event to parent
  const result = await new Promise((resolve) => {
    emit('validate', {
      stepId: props.stepId,
      formData: props.formData,
      resolve
    });
  });
  
  if (result && result.errors) {
    localErrors.value = result.errors;
  }
  
  const isValid = !Object.keys(localErrors.value).length && (result ? result.isValid : true);
  emit('update:isValid', isValid);
  
  return isValid;
};

const resetValidation = () => {
  validationAttempted.value = false;
  localErrors.value = {};
  emit('update:isValid', true);
};

const handleNext = async () => {
  if (props.requiresValidation) {
    const isValid = await validateStep();
    if (!isValid) return;
  }
  
  emit('next', {
    stepId: props.stepId,
    stepNumber: props.stepNumber,
    formData: props.formData
  });
};

const handleBack = () => {
  emit('back', {
    stepId: props.stepId,
    stepNumber: props.stepNumber,
    formData: props.formData
  });
};

const handleSkip = () => {
  emit('skip', {
    stepId: props.stepId,
    stepNumber: props.stepNumber,
    formData: props.formData
  });
};

const handleSubmit = async () => {
  if (props.requiresValidation) {
    const isValid = await validateStep();
    if (!isValid) return;
  }
  
  emit('submit', {
    stepId: props.stepId,
    stepNumber: props.stepNumber,
    formData: props.formData
  });
};

// Watch for prop changes
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    resetValidation();
  }
});

// Auto-validate when form data changes (debounced)
let validationTimeout;
watch(() => props.formData, () => {
  if (validationAttempted.value && props.requiresValidation) {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      validateStep();
    }, 500);
  }
}, { deep: true });

// Expose methods for parent component
defineExpose({
  validateStep,
  resetValidation,
  isStepValid
});

onMounted(() => {
  // Initialize validation state
  emit('update:isValid', isStepValid.value);
});
</script>

<style scoped>
/* Base step styles */
.registration-step {
  @apply relative;
}

/* Variant styles */
.registration-step--default {
  @apply space-y-6;
}

.registration-step--card {
  @apply bg-white border border-neutral-200 rounded-lg p-6 space-y-6;
}

.registration-step--minimal {
  @apply space-y-4;
}

/* Size variants */
.registration-step--sm {
  @apply space-y-4 text-sm;
}

.registration-step--md {
  @apply space-y-6 text-base;
}

.registration-step--lg {
  @apply space-y-8 text-lg;
}

/* Step header */
.step-header {
  @apply flex items-start justify-between gap-4;
}

.step-info {
  @apply flex-1 min-w-0;
}

.step-title {
  @apply text-xl font-semibold text-neutral-900 leading-tight;
}

.registration-step--sm .step-title {
  @apply text-lg;
}

.registration-step--lg .step-title {
  @apply text-2xl;
}

.step-description {
  @apply mt-2 text-neutral-600 leading-relaxed;
}

.step-number-badge {
  @apply flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-medium text-sm flex-shrink-0;
}

.registration-step--active .step-number-badge {
  @apply bg-primary-600 text-white;
}

.registration-step--completed .step-number-badge {
  @apply bg-success-600 text-white;
}

/* Step content */
.step-content {
  @apply space-y-4;
}

.registration-step--sm .step-content {
  @apply space-y-3;
}

.registration-step--lg .step-content {
  @apply space-y-6;
}

/* Step actions */
.step-actions {
  @apply flex items-center justify-between gap-4 pt-4 border-t border-neutral-200;
}

.registration-step--card .step-actions {
  @apply -m-6 mt-6 p-6;
}

.secondary-actions {
  @apply flex items-center space-x-3;
}

.primary-actions {
  @apply flex items-center space-x-3;
}

/* State styles */
.registration-step--has-errors {
  @apply border-error-200;
}

.registration-step--has-errors .step-title {
  @apply text-error-900;
}

.registration-step--submitting {
  @apply pointer-events-none opacity-75;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .step-header {
    @apply flex-col items-stretch gap-3;
  }
  
  .step-number-badge {
    @apply self-start;
  }
  
  .step-actions {
    @apply flex-col-reverse items-stretch gap-3;
  }
  
  .secondary-actions,
  .primary-actions {
    @apply justify-center;
  }
}

/* Dark theme adjustments */
.theme-dark .registration-step--card {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .step-title {
  @apply text-neutral-100;
}

.theme-dark .step-description {
  @apply text-neutral-400;
}

.theme-dark .step-actions {
  @apply border-neutral-700;
}

/* Animation for step transitions */
.registration-step {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus states */
.step-actions button:focus {
  @apply outline-none ring-2 ring-offset-2 ring-primary-500;
}
</style>