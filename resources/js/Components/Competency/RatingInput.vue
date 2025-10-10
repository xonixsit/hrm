<template>
  <div class="rating-input-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <!-- Rating Guidelines Display -->
    <div v-if="guidelines && showGuidelines" class="rating-guidelines mb-4">
      <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h4 class="text-sm font-medium text-neutral-900 mb-3">Rating Guidelines</h4>
        <div class="space-y-2">
          <div
            v-for="(guideline, index) in formattedGuidelines"
            :key="index"
            class="flex items-start space-x-3"
          >
            <div class="flex-shrink-0">
              <span :class="getGuidelineRatingClasses(guideline.rating)" class="rating-badge">
                {{ guideline.rating }}
              </span>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-neutral-900">{{ guideline.label }}</div>
              <div v-if="guideline.description" class="text-xs text-neutral-600 mt-1">
                {{ guideline.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Scale Input -->
    <div class="rating-scale" :class="scaleClasses">
      <div class="rating-options">
        <div
          v-for="rating in ratingOptions"
          :key="rating.value"
          class="rating-option"
          :class="getOptionClasses(rating.value)"
        >
          <!-- Radio Input -->
          <input
            :id="`${inputId}-${rating.value}`"
            ref="inputRefs"
            type="radio"
            :name="inputId"
            :value="rating.value"
            :checked="modelValue === rating.value"
            :disabled="disabled"
            :required="required"
            :aria-describedby="ariaDescribedBy"
            :aria-invalid="hasError"
            class="sr-only"
            @change="handleRatingChange(rating.value)"
            @focus="handleFocus"
            @blur="handleBlur"
          />
          
          <!-- Visual Rating Button -->
          <label
            :for="`${inputId}-${rating.value}`"
            class="rating-button"
            :class="getButtonClasses(rating.value)"
            :title="rating.label"
            @mouseenter="handleHover(rating.value)"
            @mouseleave="handleHoverEnd"
          >
            <!-- Star Icon -->
            <StarIcon
              v-if="displayType === 'stars'"
              :class="getStarClasses(rating.value)"
              class="rating-icon"
            />
            
            <!-- Number Display -->
            <span
              v-else
              class="rating-number"
              :class="getNumberClasses(rating.value)"
            >
              {{ rating.value }}
            </span>
          </label>
          
          <!-- Rating Label -->
          <div class="rating-label" :class="getLabelClasses(rating.value)">
            <span class="rating-text">{{ rating.label }}</span>
            <span v-if="showValues" class="rating-value">({{ rating.value }})</span>
          </div>
        </div>
      </div>
      
      <!-- Selected Rating Display -->
      <div v-if="modelValue && showSelectedRating" class="selected-rating-display mt-4">
        <div class="flex items-center justify-center space-x-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <StarIcon class="w-5 h-5 text-primary-600" />
          <span class="text-sm font-medium text-primary-900">
            Selected: {{ getSelectedRatingLabel() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Comments Requirement Notice -->
    <div v-if="requiresComments && modelValue" class="comments-notice mt-3">
      <div class="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-900">Comments Required</p>
          <p class="text-xs text-amber-700 mt-1">
            {{ getCommentsRequirementText() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-2">
      <p :id="`${inputId}-error`" class="text-sm text-error-500" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>
    </div>

    <!-- Help Text -->
    <div v-if="helpText && !errorMessage" class="mt-2">
      <p :id="`${inputId}-help`" class="text-sm text-neutral-500">
        {{ helpText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { StarIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  /**
   * v-model value
   */
  modelValue: {
    type: [Number, String],
    default: null
  },

  /**
   * Input label
   */
  label: {
    type: String,
    default: ''
  },

  /**
   * Rating guidelines object or array
   */
  guidelines: {
    type: [Object, Array],
    default: null
  },

  /**
   * Whether to show guidelines
   */
  showGuidelines: {
    type: Boolean,
    default: true
  },

  /**
   * Display type for rating scale
   */
  displayType: {
    type: String,
    default: 'stars',
    validator: (value) => ['stars', 'numbers', 'both'].includes(value)
  },

  /**
   * Size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Layout orientation
   */
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },

  /**
   * Whether input is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * Whether input is required
   */
  required: {
    type: Boolean,
    default: false
  },

  /**
   * Error message
   */
  errorMessage: {
    type: String,
    default: ''
  },

  /**
   * Help text
   */
  helpText: {
    type: String,
    default: ''
  },

  /**
   * Whether to show rating values
   */
  showValues: {
    type: Boolean,
    default: false
  },

  /**
   * Whether to show selected rating display
   */
  showSelectedRating: {
    type: Boolean,
    default: false
  },

  /**
   * Whether comments are required for extreme ratings
   */
  requireCommentsForExtremes: {
    type: Boolean,
    default: true
  },

  /**
   * Custom rating options (overrides default 5-point scale)
   */
  customRatingOptions: {
    type: Array,
    default: null
  },

  /**
   * Additional CSS classes
   */
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'hover'])

// Refs
const inputRefs = ref([])
const hoveredRating = ref(null)
const isFocused = ref(false)

// Generate unique ID for accessibility
const inputId = computed(() => `rating-input-${Math.random().toString(36).substr(2, 9)}`)

// Default 5-point rating scale
const defaultRatingOptions = [
  { value: 1, label: 'Poor', description: 'Performance significantly below expectations' },
  { value: 2, label: 'Needs Improvement', description: 'Performance below expectations, requires development' },
  { value: 3, label: 'Meets Expectations', description: 'Performance meets job requirements and standards' },
  { value: 4, label: 'Exceeds Expectations', description: 'Performance consistently above expectations' },
  { value: 5, label: 'Outstanding', description: 'Exceptional performance, significantly exceeds expectations' }
]

// Computed properties
const ratingOptions = computed(() => {
  return props.customRatingOptions || defaultRatingOptions
})

const formattedGuidelines = computed(() => {
  if (!props.guidelines) return []
  
  if (Array.isArray(props.guidelines)) {
    return props.guidelines
  }
  
  // Convert object to array format
  return Object.entries(props.guidelines).map(([rating, data]) => ({
    rating: parseInt(rating),
    label: data.label || data,
    description: data.description || null
  })).sort((a, b) => a.rating - b.rating)
})

const requiresComments = computed(() => {
  if (!props.requireCommentsForExtremes || !props.modelValue) return false
  const rating = parseInt(props.modelValue)
  return rating <= 2 || rating >= 4
})

const hasError = computed(() => !!props.errorMessage)

const ariaDescribedBy = computed(() => {
  const ids = []
  if (hasError.value) ids.push(`${inputId.value}-error`)
  if (props.helpText && !hasError.value) ids.push(`${inputId.value}-help`)
  return ids.length > 0 ? ids.join(' ') : null
})

// Styling computed properties
const wrapperClasses = computed(() => [
  'rating-input-wrapper',
  `rating-input--${props.size}`,
  `rating-input--${props.orientation}`,
  {
    'rating-input--disabled': props.disabled,
    'rating-input--error': hasError.value,
    'rating-input--focused': isFocused.value
  },
  props.class
])

const labelClasses = computed(() => [
  'block text-sm font-medium mb-2',
  {
    'text-neutral-700': !hasError.value && !props.disabled,
    'text-error-500': hasError.value,
    'text-neutral-500': props.disabled
  }
])

const scaleClasses = computed(() => [
  'rating-scale',
  {
    'rating-scale--horizontal': props.orientation === 'horizontal',
    'rating-scale--vertical': props.orientation === 'vertical'
  }
])

// Methods
const getOptionClasses = (rating) => [
  'rating-option',
  {
    'rating-option--selected': props.modelValue === rating,
    'rating-option--hovered': hoveredRating.value === rating,
    'rating-option--disabled': props.disabled
  }
]

const getButtonClasses = (rating) => {
  const baseClasses = [
    'rating-button',
    'flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
  ]
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  const stateClasses = () => {
    if (props.disabled) {
      return ['bg-neutral-100 cursor-not-allowed']
    }
    
    const isSelected = props.modelValue === rating
    const isHovered = hoveredRating.value === rating
    
    if (isSelected) {
      return ['bg-primary-100 border-2 border-primary-500 text-primary-700']
    }
    
    if (isHovered) {
      return ['bg-primary-50 border-2 border-primary-300 text-primary-600']
    }
    
    return ['bg-white border-2 border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50']
  }
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...stateClasses()
  ]
}

const getStarClasses = (rating) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const isSelected = props.modelValue === rating
  const isHovered = hoveredRating.value === rating
  
  return [
    sizeClasses[props.size],
    'transition-colors duration-200',
    {
      'text-primary-600': isSelected || isHovered,
      'text-neutral-400': !isSelected && !isHovered && !props.disabled,
      'text-neutral-300': props.disabled
    }
  ]
}

const getNumberClasses = (rating) => [
  'font-semibold transition-colors duration-200',
  {
    'text-primary-700': props.modelValue === rating,
    'text-primary-600': hoveredRating.value === rating,
    'text-neutral-600': props.modelValue !== rating && hoveredRating.value !== rating && !props.disabled,
    'text-neutral-400': props.disabled
  }
]

const getLabelClasses = (rating) => [
  'rating-label',
  'text-center mt-2',
  {
    'text-primary-700 font-medium': props.modelValue === rating,
    'text-neutral-600': props.modelValue !== rating && !props.disabled,
    'text-neutral-400': props.disabled
  }
]

const getGuidelineRatingClasses = (rating) => {
  const baseClasses = 'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold'
  
  const colorClasses = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-emerald-100 text-emerald-800'
  }
  
  return `${baseClasses} ${colorClasses[rating] || 'bg-neutral-100 text-neutral-800'}`
}

const getSelectedRatingLabel = () => {
  const option = ratingOptions.value.find(opt => opt.value === props.modelValue)
  return option ? `${option.value} - ${option.label}` : ''
}

const getCommentsRequirementText = () => {
  const rating = parseInt(props.modelValue)
  if (rating <= 2) {
    return 'Please provide detailed comments explaining areas for improvement and specific examples.'
  }
  if (rating >= 4) {
    return 'Please provide detailed comments highlighting exceptional performance and specific achievements.'
  }
  return 'Please provide detailed comments to support this rating.'
}

// Event handlers
const handleRatingChange = (rating) => {
  if (props.disabled) return
  
  const numericRating = parseInt(rating)
  emit('update:modelValue', numericRating)
  emit('change', numericRating)
}

const handleHover = (rating) => {
  if (props.disabled) return
  hoveredRating.value = rating
  emit('hover', rating)
}

const handleHoverEnd = () => {
  hoveredRating.value = null
  emit('hover', null)
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

// Public methods
const focus = () => {
  const firstInput = inputRefs.value?.[0]
  if (firstInput) {
    firstInput.focus()
  }
}

const blur = () => {
  const activeInput = inputRefs.value?.find(input => input === document.activeElement)
  if (activeInput) {
    activeInput.blur()
  }
}

// Expose methods
defineExpose({
  focus,
  blur,
  requiresComments
})
</script>

<style scoped>
.rating-input-wrapper {
  @apply w-full;
}

.rating-scale--horizontal .rating-options {
  @apply flex items-start justify-center space-x-4;
}

.rating-scale--vertical .rating-options {
  @apply flex flex-col space-y-4;
}

.rating-option {
  @apply flex flex-col items-center transition-all duration-200;
}

.rating-button {
  @apply relative;
}

.rating-button:hover:not(:disabled) {
  @apply transform scale-105;
}

.rating-button:active:not(:disabled) {
  @apply transform scale-95;
}

.rating-label {
  @apply transition-all duration-200;
}

.rating-text {
  @apply text-xs font-medium block;
}

.rating-value {
  @apply text-xs text-neutral-500 block mt-0.5;
}

.rating-badge {
  @apply inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold;
}

.rating-icon {
  @apply transition-transform duration-200;
}

.rating-option--selected .rating-icon {
  @apply transform scale-110;
}

.rating-option--hovered .rating-icon {
  @apply transform scale-105;
}

/* Size variants */
.rating-input--sm .rating-text {
  @apply text-xs;
}

.rating-input--md .rating-text {
  @apply text-sm;
}

.rating-input--lg .rating-text {
  @apply text-base;
}

.rating-input--sm .rating-options {
  @apply space-x-3;
}

.rating-input--lg .rating-options {
  @apply space-x-6;
}

/* Vertical layout adjustments */
.rating-scale--vertical .rating-option {
  @apply flex-row items-center space-x-3;
}

.rating-scale--vertical .rating-label {
  @apply text-left mt-0 ml-3;
}

/* Disabled state */
.rating-input--disabled .rating-button {
  @apply cursor-not-allowed opacity-60;
}

.rating-input--disabled .rating-button:hover {
  @apply transform-none;
}

/* Error state */
.rating-input--error .rating-button {
  @apply border-error-300;
}

.rating-input--error .rating-option--selected .rating-button {
  @apply border-error-500 bg-error-50;
}

/* Focus state */
.rating-input--focused .rating-option--selected .rating-button {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

/* Guidelines styling */
.rating-guidelines {
  @apply mb-4;
}

.rating-guidelines h4 {
  @apply text-sm font-medium text-neutral-900 mb-3;
}

/* Comments notice styling */
.comments-notice {
  @apply mt-3;
}

/* Selected rating display */
.selected-rating-display {
  @apply mt-4;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .rating-scale--horizontal .rating-options {
    @apply space-x-2;
  }
  
  .rating-input--md .rating-button {
    @apply w-8 h-8;
  }
  
  .rating-input--lg .rating-button {
    @apply w-10 h-10;
  }
  
  .rating-text {
    @apply text-xs;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .rating-button,
  .rating-icon,
  .rating-label {
    @apply transition-none;
  }
  
  .rating-button:hover {
    @apply transform-none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .rating-button {
    @apply border-2;
  }
  
  .rating-option--selected .rating-button {
    @apply border-4;
  }
}

/* Dark theme support */
.theme-dark .rating-guidelines {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .rating-guidelines h4 {
  @apply text-neutral-100;
}

.theme-dark .rating-button {
  @apply bg-neutral-800 border-neutral-600 text-neutral-300;
}

.theme-dark .rating-option--selected .rating-button {
  @apply bg-primary-900 border-primary-400 text-primary-200;
}

.theme-dark .comments-notice {
  @apply bg-amber-900 border-amber-700;
}

.theme-dark .selected-rating-display {
  @apply bg-primary-900 border-primary-700;
}
</style>