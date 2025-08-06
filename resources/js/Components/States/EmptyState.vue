<template>
  <div :class="emptyStateClasses">
    <div class="empty-content">
      <!-- Icon -->
      <div class="empty-icon">
        <slot name="icon">
          <Icon
            v-if="iconName"
            :name="iconName"
            :size="iconSize"
            :color="iconColor"
            class="empty-icon-component"
          />
          <div v-else class="default-icon">
            <Icon 
              name="document-text" 
              :size="iconSize" 
              color="neutral" 
              class="empty-icon-component"
            />
          </div>
        </slot>
      </div>

      <!-- Illustration (for illustration variant) -->
      <div v-if="variant === 'illustration' && illustration" class="empty-illustration">
        <slot name="illustration">
          <img 
            :src="illustration" 
            :alt="title"
            class="empty-illustration-image"
          />
        </slot>
      </div>

      <!-- Title -->
      <h3 class="empty-title">{{ displayTitle }}</h3>

      <!-- Description -->
      <p v-if="displayDescription" class="empty-description">{{ displayDescription }}</p>

      <!-- Custom Content -->
      <div v-if="$slots.default" class="empty-custom-content">
        <slot />
      </div>

      <!-- Actions -->
      <div v-if="hasActions" class="empty-actions">
        <slot name="actions">
          <button
            v-for="action in actions"
            :key="action.id"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :class="getActionClasses(action)"
            type="button"
          >
            <Icon 
              v-if="action.icon" 
              :name="action.icon" 
              size="sm" 
              class="action-icon" 
            />
            <span>{{ action.label }}</span>
          </button>
        </slot>
      </div>

      <!-- Help Text -->
      <div v-if="helpText" class="empty-help">
        <p class="help-text">{{ helpText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import Icon from '@/Components/Base/Icon.vue'

const props = defineProps({
  // Content
  title: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Icon (using semantic icon names)
  icon: {
    type: String,
    default: ''
  },
  
  // Illustration for illustration variant
  illustration: {
    type: String,
    default: ''
  },
  
  // Help text
  helpText: {
    type: String,
    default: ''
  },
  
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  // Empty state type for contextual defaults
  emptyType: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'no-data', 'no-results', 'no-permissions', 
      'error', 'loading', 'maintenance', 'search'
    ].includes(value)
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'illustration'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Layout
  centered: {
    type: Boolean,
    default: true
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const emit = defineEmits(['action'])

// Composables
const slots = useSlots()

// Computed properties
const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions
})

const emptyStateClasses = computed(() => [
  'empty-state',
  `empty-state--${props.variant}`,
  `empty-state--${props.size}`,
  `empty-state--${props.emptyType}`,
  {
    'empty-state--centered': props.centered
  },
  props.class
])

const iconName = computed(() => {
  if (props.icon) return props.icon
  
  // Default icons based on empty type
  const defaultIcons = {
    'no-data': 'document-text',
    'no-results': 'magnifying-glass',
    'no-permissions': 'shield-exclamation',
    'error': 'exclamation-triangle',
    'loading': 'loading',
    'maintenance': 'wrench-screwdriver',
    'search': 'magnifying-glass',
    'default': 'document-text'
  }
  
  return defaultIcons[props.emptyType] || defaultIcons.default
})

const iconSize = computed(() => {
  const sizeMap = {
    sm: 'lg',
    md: 'xl',
    lg: '2xl',
    xl: '2xl'
  }
  
  return sizeMap[props.size] || 'xl'
})

const iconColor = computed(() => {
  const colorMap = {
    'error': 'error',
    'no-permissions': 'warning',
    'maintenance': 'info',
    'loading': 'primary'
  }
  
  return colorMap[props.emptyType] || 'neutral'
})

const displayTitle = computed(() => {
  if (props.title) return props.title
  
  // Default titles based on empty type
  const defaultTitles = {
    'no-data': 'No data available',
    'no-results': 'No results found',
    'no-permissions': 'Access restricted',
    'error': 'Something went wrong',
    'loading': 'Loading...',
    'maintenance': 'Under maintenance',
    'search': 'No search results',
    'default': 'No data available'
  }
  
  return defaultTitles[props.emptyType] || defaultTitles.default
})

const displayDescription = computed(() => {
  if (props.description) return props.description
  
  // Default descriptions based on empty type
  const defaultDescriptions = {
    'no-data': 'There is no data to display at the moment.',
    'no-results': 'Try adjusting your search or filter criteria.',
    'no-permissions': 'You don\'t have permission to view this content.',
    'error': 'An error occurred while loading the content.',
    'loading': 'Please wait while we load your content.',
    'maintenance': 'This feature is temporarily unavailable.',
    'search': 'Try different keywords or check your spelling.',
    'default': ''
  }
  
  return defaultDescriptions[props.emptyType] || ''
})

// Methods
const handleAction = (action) => {
  if (action.disabled) return
  
  emit('action', action)
  
  if (action.handler) {
    action.handler()
  }
}

const getActionClasses = (action) => [
  'empty-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-3 py-2 text-sm': action.size === 'sm' || !action.size,
    'px-4 py-2 text-base': action.size === 'md',
    'px-6 py-3 text-lg': action.size === 'lg',
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500 shadow-sm': action.variant === 'secondary' || !action.variant,
    'text-primary-600 hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500': action.variant === 'ghost',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm hover:shadow-md': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled,
    'space-x-2': action.icon && action.label
  }
]
</script>

<style scoped>
/* Base Empty State Styles */
.empty-state {
  @apply flex items-center justify-center;
}

.empty-state--centered {
  @apply text-center;
}

.empty-content {
  @apply max-w-md mx-auto;
}

/* Size Variants */
.empty-state--sm {
  @apply py-8;
}

.empty-state--md {
  @apply py-12;
}

.empty-state--lg {
  @apply py-16;
}

.empty-state--xl {
  @apply py-20;
}

/* Variant Styles */
.empty-state--default .empty-content {
  @apply space-y-4;
}

.empty-state--minimal .empty-content {
  @apply space-y-2;
}

.empty-state--illustration .empty-content {
  @apply space-y-6;
}

/* Icon */
.empty-icon {
  @apply flex justify-center mb-4;
}

.empty-state--sm .empty-icon {
  @apply mb-2;
}

.empty-state--lg .empty-icon,
.empty-state--xl .empty-icon {
  @apply mb-6;
}

.default-icon {
  @apply flex items-center justify-center;
}

/* Title */
.empty-title {
  @apply font-semibold text-neutral-900;
}

.empty-state--sm .empty-title {
  @apply text-base;
}

.empty-state--md .empty-title {
  @apply text-lg;
}

.empty-state--lg .empty-title {
  @apply text-xl;
}

.empty-state--xl .empty-title {
  @apply text-2xl;
}

/* Description */
.empty-description {
  @apply text-neutral-600 leading-relaxed;
}

.empty-state--sm .empty-description {
  @apply text-sm;
}

.empty-state--md .empty-description {
  @apply text-base;
}

.empty-state--lg .empty-description,
.empty-state--xl .empty-description {
  @apply text-lg;
}

/* Custom Content */
.empty-custom-content {
  @apply mt-4;
}

/* Actions */
.empty-actions {
  @apply flex flex-wrap items-center justify-center gap-3 mt-6;
}

.empty-state--sm .empty-actions {
  @apply mt-4 gap-2;
}

.empty-state--lg .empty-actions,
.empty-state--xl .empty-actions {
  @apply mt-8 gap-4;
}

.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .empty-content {
    @apply px-4;
  }
  
  .empty-actions {
    @apply flex-col w-full;
  }
  
  .empty-action-button {
    @apply w-full justify-center;
  }
}

/* Dark Theme Adjustments */
.theme-dark .empty-title {
  @apply text-neutral-100;
}

.theme-dark .empty-description {
  @apply text-neutral-400;
}

.theme-dark .empty-icon-component {
  @apply text-neutral-500;
}

.theme-dark .default-icon svg {
  @apply text-neutral-500;
}

/* Variant-specific Adjustments */
.empty-state--minimal .empty-icon {
  @apply mb-2;
}

.empty-state--minimal .empty-title {
  @apply text-base font-medium;
}

.empty-state--minimal .empty-description {
  @apply text-sm;
}

.empty-state--minimal .empty-actions {
  @apply mt-3;
}

.empty-state--illustration .empty-icon {
  @apply mb-6;
}

.empty-state--illustration .empty-title {
  @apply text-xl font-bold;
}

.empty-state--illustration .empty-description {
  @apply text-base;
}

.empty-state--illustration .empty-actions {
  @apply mt-8;
}

/* Animation for better UX */
.empty-content {
  @apply animate-fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Focus States */
.empty-action-button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* Hover Effects */
.empty-action-button {
  @apply transition-all duration-200;
}

.empty-action-button:hover:not(:disabled) {
  @apply transform -translate-y-0.5;
}

/* Illustration */
.empty-illustration {
  @apply flex justify-center mb-6;
}

.empty-illustration-image {
  @apply max-w-xs max-h-48 object-contain;
}

.empty-state--sm .empty-illustration-image {
  @apply max-w-32 max-h-32;
}

.empty-state--lg .empty-illustration-image,
.empty-state--xl .empty-illustration-image {
  @apply max-w-sm max-h-64;
}

/* Help Text */
.empty-help {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

.help-text {
  @apply text-sm text-neutral-500 italic;
}

.theme-dark .empty-help {
  @apply border-neutral-700;
}

.theme-dark .help-text {
  @apply text-neutral-400;
}

/* Empty Type Specific Styles */
.empty-state--error .empty-title {
  @apply text-error-700;
}

.empty-state--no-permissions .empty-title {
  @apply text-warning-700;
}

.empty-state--maintenance .empty-title {
  @apply text-info-700;
}

.theme-dark .empty-state--error .empty-title {
  @apply text-error-400;
}

.theme-dark .empty-state--no-permissions .empty-title {
  @apply text-warning-400;
}

.theme-dark .empty-state--maintenance .empty-title {
  @apply text-info-400;
}

/* Loading State Support */
.empty-state--loading .empty-content {
  @apply animate-pulse;
}

.empty-state--loading .empty-title,
.empty-state--loading .empty-description {
  @apply bg-neutral-200 text-transparent rounded;
}

.theme-dark .empty-state--loading .empty-title,
.theme-dark .empty-state--loading .empty-description {
  @apply bg-neutral-600;
}

/* Enhanced hover effects */
.empty-action-button:hover:not(:disabled) {
  @apply transform -translate-y-0.5 shadow-lg;
}

/* Focus improvements */
.empty-action-button:focus-visible {
  @apply ring-2 ring-offset-2 ring-primary-500;
}
</style>