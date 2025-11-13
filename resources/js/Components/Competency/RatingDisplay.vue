<template>
  <div class="rating-display" :class="displayClasses">
    <!-- Stars Display -->
    <div v-if="displayType === 'stars'" class="rating-stars">
      <StarIcon
        v-for="star in maxRating"
        :key="star"
        :class="getStarClasses(star)"
        class="rating-star"
      />
    </div>

    <!-- Numbers Display -->
    <div v-else-if="displayType === 'numbers'" class="rating-numbers">
      <span class="rating-value">{{ rating }}</span>
      <span class="rating-separator">/</span>
      <span class="rating-max">{{ max }}</span>
    </div>

    <!-- Both Display -->
    <div v-else class="rating-both">
      <div class="rating-stars">
        <StarIcon
          v-for="star in maxRating"
          :key="star"
          :class="getStarClasses(star)"
          class="rating-star"
        />
      </div>
      <span class="rating-text">{{ rating }}/{{ max }}</span>
    </div>

    <!-- Rating Label -->
    <span v-if="showLabel" class="rating-label">
      {{ getRatingLabel() }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { StarIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  // Rating value
  rating: {
    type: [Number, String],
    default: 0
  },
  
  // Maximum rating
  max: {
    type: Number,
    default: 5
  },
  
  // Display options
  displayType: {
    type: String,
    default: 'stars',
    validator: (value) => ['stars', 'numbers', 'both'].includes(value)
  },
  
  // Size variant
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Show rating label
  showLabel: {
    type: Boolean,
    default: false
  },
  
  // Color variant
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'colorful', 'minimal'].includes(value)
  },
  
  // Custom labels
  labels: {
    type: Object,
    default: () => ({
      1: 'Poor',
      2: 'Needs Improvement', 
      3: 'Meets Expectations',
      4: 'Exceeds Expectations',
      5: 'Outstanding'
    })
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

// Computed properties
const numericRating = computed(() => {
  return parseFloat(props.rating) || 0
})

const maxRating = computed(() => {
  return Math.max(props.max, 1)
})

const displayClasses = computed(() => [
  'rating-display',
  `rating-display--${props.size}`,
  `rating-display--${props.variant}`,
  `rating-display--${props.displayType}`,
  {
    'rating-display--with-label': props.showLabel
  },
  props.class
])

const getStarClasses = (starNumber) => {
  const baseClasses = ['rating-star', 'transition-colors', 'duration-200']
  
  const isActive = starNumber <= numericRating.value
  const isPartial = starNumber === Math.ceil(numericRating.value) && numericRating.value % 1 !== 0
  
  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  
  // Color classes based on variant and rating
  let colorClasses = []
  
  if (props.variant === 'colorful') {
    if (isActive) {
      if (numericRating.value <= 2) {
        colorClasses = ['text-red-500']
      } else if (numericRating.value <= 3) {
        colorClasses = ['text-yellow-500']
      } else if (numericRating.value <= 4) {
        colorClasses = ['text-teal-500']
      } else {
        colorClasses = ['text-green-500']
      }
    } else {
      colorClasses = ['text-neutral-300']
    }
  } else if (props.variant === 'minimal') {
    colorClasses = isActive ? ['text-neutral-600'] : ['text-neutral-300']
  } else {
    // Default variant
    colorClasses = isActive ? ['text-yellow-400'] : ['text-neutral-300']
  }
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...colorClasses,
    {
      'rating-star--active': isActive,
      'rating-star--partial': isPartial
    }
  ]
}

const getRatingLabel = () => {
  const roundedRating = Math.round(numericRating.value)
  return props.labels[roundedRating] || `${numericRating.value}/${props.max}`
}
</script>

<style scoped>
/* Base styles */
.rating-display {
  @apply inline-flex items-center;
}

.rating-display--with-label {
  @apply space-x-2;
}

/* Stars display */
.rating-stars {
  @apply flex items-center;
}

.rating-star {
  @apply flex-shrink-0;
}

/* Numbers display */
.rating-numbers {
  @apply flex items-baseline;
}

.rating-value {
  @apply font-semibold;
}

.rating-separator {
  @apply mx-0.5 text-neutral-400;
}

.rating-max {
  @apply text-neutral-500;
}

/* Both display */
.rating-both {
  @apply flex items-center space-x-2;
}

.rating-text {
  @apply text-sm font-medium text-neutral-600;
}

/* Rating label */
.rating-label {
  @apply text-sm font-medium text-neutral-700;
}

/* Size variants */
.rating-display--xs .rating-text,
.rating-display--xs .rating-label {
  @apply text-xs;
}

.rating-display--sm .rating-text,
.rating-display--sm .rating-label {
  @apply text-xs;
}

.rating-display--md .rating-text,
.rating-display--md .rating-label {
  @apply text-sm;
}

.rating-display--lg .rating-text,
.rating-display--lg .rating-label {
  @apply text-base;
}

.rating-display--xl .rating-text,
.rating-display--xl .rating-label {
  @apply text-lg;
}

/* Numbers size variants */
.rating-display--xs .rating-value {
  @apply text-sm;
}

.rating-display--sm .rating-value {
  @apply text-base;
}

.rating-display--md .rating-value {
  @apply text-lg;
}

.rating-display--lg .rating-value {
  @apply text-xl;
}

.rating-display--xl .rating-value {
  @apply text-2xl;
}

/* Variant styles */
.rating-display--minimal .rating-label {
  @apply text-neutral-600;
}

.rating-display--colorful .rating-label {
  @apply font-semibold;
}

/* Hover effects for interactive displays */
.rating-display:hover .rating-star--active {
  @apply scale-110;
}

/* Partial star effect (for future fractional ratings) */
.rating-star--partial {
  @apply relative overflow-hidden;
}

.rating-star--partial::after {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-current to-transparent;
  width: 50%; /* Adjust based on actual partial value */
}

/* Dark theme support */
.theme-dark .rating-text {
  @apply text-neutral-400;
}

.theme-dark .rating-label {
  @apply text-neutral-300;
}

.theme-dark .rating-separator {
  @apply text-neutral-500;
}

.theme-dark .rating-max {
  @apply text-neutral-400;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .rating-star {
    @apply transition-none;
  }
  
  .rating-display:hover .rating-star--active {
    @apply scale-100;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .rating-star--active {
    @apply text-yellow-600;
  }
  
  .rating-display--colorful .rating-star--active {
    @apply text-teal-700;
  }
}
</style>