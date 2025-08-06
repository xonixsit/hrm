<template>
  <section :class="sectionClasses">
    <!-- Section Header -->
    <header v-if="hasHeader" class="section-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h2 v-if="title" :class="titleClasses">{{ title }}</h2>
            <p v-if="description" class="section-description">{{ description }}</p>
          </div>
          <div v-if="hasHeaderActions" class="header-actions">
            <slot name="header-actions">
              <button
                v-for="action in headerActions"
                :key="action.id"
                @click="handleHeaderAction(action)"
                :disabled="action.disabled"
                :class="getActionClasses(action)"
                :title="action.tooltip"
              >
                <component v-if="action.icon" :is="action.icon" class="action-icon" />
                <span v-if="action.label" class="action-label">{{ action.label }}</span>
              </button>
            </slot>
          </div>
        </div>
      </slot>
    </header>

    <!-- Section Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Section Footer -->
    <footer v-if="$slots.footer" class="section-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue';

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
  
  // Header actions
  headerActions: {
    type: Array,
    default: () => []
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'bordered', 'elevated'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  spacing: {
    type: String,
    default: 'normal',
    validator: (value) => ['tight', 'normal', 'loose'].includes(value)
  },
  
  // Layout
  fullWidth: {
    type: Boolean,
    default: false
  },
  
  // Accessibility
  headingLevel: {
    type: Number,
    default: 2,
    validator: (value) => value >= 1 && value <= 6
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['header-action']);

// Composables
const slots = useSlots();

// Computed properties
const hasHeader = computed(() => {
  return !!(props.title || props.description || slots.header || hasHeaderActions.value);
});

const hasHeaderActions = computed(() => {
  return props.headerActions?.length > 0 || !!slots['header-actions'];
});

const sectionClasses = computed(() => [
  'content-section',
  `content-section--${props.variant}`,
  `content-section--${props.size}`,
  `content-section--spacing-${props.spacing}`,
  {
    'content-section--full-width': props.fullWidth,
    'content-section--has-header': hasHeader.value,
    'content-section--has-footer': !!slots.footer
  },
  props.class
]);

const titleClasses = computed(() => [
  'section-title',
  `section-title--h${props.headingLevel}`,
  {
    'section-title--with-description': !!props.description
  }
]);

const contentClasses = computed(() => [
  'section-content',
  {
    'section-content--with-header': hasHeader.value,
    'section-content--with-footer': !!slots.footer
  }
]);

// Methods
const handleHeaderAction = (action) => {
  if (action.disabled) return;
  
  emit('header-action', action);
  
  if (action.handler) {
    action.handler();
  }
};

const getActionClasses = (action) => [
  'header-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-2 py-1 text-xs': action.size === 'xs',
    'px-3 py-1.5 text-sm': action.size === 'sm' || !action.size,
    'px-4 py-2 text-base': action.size === 'md',
    'px-6 py-3 text-lg': action.size === 'lg',
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary' || !action.variant,
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled,
    'space-x-1': action.icon && action.label
  }
];
</script>

<style scoped>
/* Base Section Styles */
.content-section {
  @apply relative;
}

/* Section Variants */
.content-section--default {
  @apply space-y-4;
}

.content-section--card {
  @apply bg-white rounded-lg border border-neutral-200 shadow-sm;
}

.content-section--bordered {
  @apply border border-neutral-200 rounded-lg;
}

.content-section--elevated {
  @apply bg-white rounded-lg shadow-md border border-neutral-100;
}

/* Size Variants */
.content-section--sm {
  @apply text-sm;
}

.content-section--sm .section-content {
  @apply space-y-3;
}

.content-section--md {
  @apply text-base;
}

.content-section--md .section-content {
  @apply space-y-4;
}

.content-section--lg {
  @apply text-lg;
}

.content-section--lg .section-content {
  @apply space-y-6;
}

.content-section--xl {
  @apply text-xl;
}

.content-section--xl .section-content {
  @apply space-y-8;
}

/* Spacing Variants */
.content-section--spacing-tight .section-content {
  @apply space-y-2;
}

.content-section--spacing-normal .section-content {
  @apply space-y-4;
}

.content-section--spacing-loose .section-content {
  @apply space-y-6;
}

/* Card and Bordered Variants Padding */
.content-section--card,
.content-section--bordered,
.content-section--elevated {
  @apply p-6;
}

.content-section--card.content-section--sm,
.content-section--bordered.content-section--sm,
.content-section--elevated.content-section--sm {
  @apply p-4;
}

.content-section--card.content-section--lg,
.content-section--bordered.content-section--lg,
.content-section--elevated.content-section--lg {
  @apply p-8;
}

.content-section--card.content-section--xl,
.content-section--bordered.content-section--xl,
.content-section--elevated.content-section--xl {
  @apply p-10;
}

/* Full Width */
.content-section--full-width {
  @apply w-full;
}

/* Section Header */
.section-header {
  @apply mb-4;
}

.content-section--card .section-header,
.content-section--bordered .section-header,
.content-section--elevated .section-header {
  @apply mb-6 pb-4 border-b border-neutral-200;
}

.header-content {
  @apply flex items-start justify-between gap-4;
}

.title-area {
  @apply flex-1 min-w-0;
}

.header-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* Section Titles */
.section-title {
  @apply font-semibold text-neutral-900 leading-tight;
}

.section-title--h1 {
  @apply text-3xl;
}

.section-title--h2 {
  @apply text-2xl;
}

.section-title--h3 {
  @apply text-xl;
}

.section-title--h4 {
  @apply text-lg;
}

.section-title--h5 {
  @apply text-base;
}

.section-title--h6 {
  @apply text-sm;
}

.section-title--with-description {
  @apply mb-2;
}

.section-description {
  @apply text-neutral-600 leading-relaxed;
}

/* Section Content */
.section-content {
  @apply relative;
}

.section-content--with-header {
  @apply mt-0;
}

.section-content--with-footer {
  @apply mb-0;
}

/* Section Footer */
.section-footer {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

.content-section--card .section-footer,
.content-section--bordered .section-footer,
.content-section--elevated .section-footer {
  @apply mt-6 pt-4;
}

/* Header Action Buttons */
.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.action-label {
  @apply truncate;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply justify-end;
  }
  
  .content-section--card,
  .content-section--bordered,
  .content-section--elevated {
    @apply p-4;
  }
  
  .section-title--h1 {
    @apply text-2xl;
  }
  
  .section-title--h2 {
    @apply text-xl;
  }
  
  .section-title--h3 {
    @apply text-lg;
  }
}

/* Dark Theme Adjustments */
.theme-dark .content-section--card,
.theme-dark .content-section--bordered,
.theme-dark .content-section--elevated {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .section-header {
  @apply border-neutral-700;
}

.theme-dark .section-footer {
  @apply border-neutral-700;
}

.theme-dark .section-title {
  @apply text-neutral-100;
}

.theme-dark .section-description {
  @apply text-neutral-400;
}
</style>