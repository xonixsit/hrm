<template>
  <div :class="sectionClasses" class="relative z-0">
    <!-- Section Header -->
    <div v-if="hasHeader" class="section-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h3 v-if="title" :class="titleClasses">{{ title }}</h3>
            <p v-if="description" class="section-description">{{ description }}</p>
          </div>
          <div v-if="hasActions" class="section-actions">
            <slot name="actions">
              <button
                v-for="action in actions"
                :key="action.id"
                @click="handleAction(action)"
                :disabled="action.disabled"
                :class="getActionClasses(action)"
                type="button"
              >
                <component v-if="action.icon" :is="action.icon" class="action-icon" />
                <span v-if="action.label">{{ action.label }}</span>
              </button>
            </slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Section Content -->
    <div :class="contentClasses">
      <!-- Field Grid -->
      <div v-if="useGrid" :class="gridClasses">
        <slot />
      </div>
      
      <!-- Default Layout -->
      <div v-else class="section-fields">
        <slot />
      </div>
    </div>

    <!-- Section Footer -->
    <div v-if="$slots.footer" class="section-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, useSlots } from 'vue';

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
  
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  // Layout
  useGrid: {
    type: Boolean,
    default: false
  },
  
  columns: {
    type: Object,
    default: () => ({
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 3
    })
  },
  
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'bordered', 'minimal'].includes(value)
  },
  
  size: {
    type: String,
    default: '',
    validator: (value) => ['', 'sm', 'md', 'lg'].includes(value)
  },
  
  // Accessibility
  headingLevel: {
    type: Number,
    default: 3,
    validator: (value) => value >= 1 && value <= 6
  },
  
  // State
  collapsible: {
    type: Boolean,
    default: false
  },
  
  collapsed: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['action', 'toggle']);

// Composables
const slots = useSlots();
const formContext = inject('formContext', {});

// Computed properties
const hasHeader = computed(() => {
  return props.title || props.description || hasActions.value || slots.header;
});

const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions;
});

const effectiveSize = computed(() => {
  return props.size || formContext.size?.value || 'md';
});

const sectionClasses = computed(() => [
  'form-section',
  `form-section--${props.variant}`,
  `form-section--${effectiveSize.value}`,
  {
    'form-section--collapsible': props.collapsible,
    'form-section--collapsed': props.collapsed,
    'form-section--has-header': hasHeader.value,
    'form-section--has-footer': !!slots.footer,
    'form-section--grid': props.useGrid
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
    'section-content--collapsed': props.collapsed,
    'section-content--with-header': hasHeader.value,
    'section-content--with-footer': !!slots.footer
  }
]);

const gridClasses = computed(() => [
  'section-grid',
  `section-grid--gap-${props.gap}`,
  // Responsive grid classes
  `grid-cols-${props.columns.xs || 1}`,
  `sm:grid-cols-${props.columns.sm || 1}`,
  `md:grid-cols-${props.columns.md || 2}`,
  `lg:grid-cols-${props.columns.lg || 2}`,
  `xl:grid-cols-${props.columns.xl || 3}`
]);

// Methods
const handleAction = (action) => {
  if (action.disabled) return;
  emit('action', action);
};

const getActionClasses = (action) => [
  'section-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-2 py-1 text-xs': action.size === 'xs',
    'px-3 py-1.5 text-sm': action.size === 'sm' || !action.size,
    'px-4 py-2 text-base': action.size === 'md',
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary',
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost' || !action.variant,
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled,
    'space-x-1': action.icon && action.label
  }
];
</script>

<style scoped>
/* Base Section Styles */
.form-section {
  @apply relative z-0;
}

/* Section Variants */
.form-section--default {
  @apply space-y-4;
}

.form-section--card {
  @apply bg-white border border-neutral-200 rounded-lg p-6 space-y-4;
}

.form-section--bordered {
  @apply border border-neutral-200 rounded-lg p-4 space-y-4;
}

.form-section--minimal {
  @apply space-y-3;
}

/* Size Variants */
.form-section--sm {
  @apply text-sm;
}

.form-section--sm.form-section--default {
  @apply space-y-3;
}

.form-section--md {
  @apply text-base;
}

.form-section--lg {
  @apply text-lg;
}

.form-section--lg.form-section--default {
  @apply space-y-6;
}

/* Section Header */
.section-header {
  @apply relative z-0 mb-4;
}

.form-section--card .section-header,
.form-section--bordered .section-header {
  @apply pb-4 border-b border-neutral-200;
}

.form-section--minimal .section-header {
  @apply mb-3;
}

.header-content {
  @apply flex items-start justify-between gap-4;
}

.title-area {
  @apply flex-1 min-w-0;
}

.section-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* Section Titles */
.section-title {
  @apply font-semibold text-neutral-900 leading-tight;
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

.section-title--h4 {
  @apply text-base;
}

.section-title--h5 {
  @apply text-sm;
}

.section-title--h6 {
  @apply text-xs;
}

.section-title--with-description {
  @apply mb-2;
}

.section-description {
  @apply text-neutral-600 leading-relaxed;
}

.form-section--sm .section-description {
  @apply text-xs;
}

.form-section--lg .section-description {
  @apply text-base;
}

/* Section Content */
.section-content {
  @apply relative z-0 transition-all duration-200;
}

.section-content--collapsed {
  @apply hidden;
}

/* Field Layouts */
.section-fields {
  @apply space-y-4;
}

.form-section--sm .section-fields {
  @apply space-y-3;
}

.form-section--lg .section-fields {
  @apply space-y-6;
}

.section-grid {
  @apply grid;
}

.section-grid--gap-sm {
  @apply gap-3;
}

.section-grid--gap-md {
  @apply gap-4;
}

.section-grid--gap-lg {
  @apply gap-6;
}

.section-grid--gap-xl {
  @apply gap-8;
}

/* Section Footer */
.section-footer {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

.form-section--card .section-footer,
.form-section--bordered .section-footer {
  @apply mt-6 pt-4;
}

.form-section--minimal .section-footer {
  @apply mt-3 pt-3;
}

/* Collapsible Sections */
.form-section--collapsible .section-header {
  @apply cursor-pointer;
}

.form-section--collapsible .section-title::before {
  @apply inline-block w-4 h-4 mr-2 transition-transform;
  content: '';
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'/%3e%3c/svg%3e");
}

.form-section--collapsed .section-title::before {
  @apply rotate-90;
}

/* Action Icons */
.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .section-actions {
    @apply justify-end;
  }
  
  .section-grid {
    @apply grid-cols-1;
  }
  
  .form-section--card,
  .form-section--bordered {
    @apply p-4;
  }
}

/* Dark Theme Adjustments */
.theme-dark .form-section--card,
.theme-dark .form-section--bordered {
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

/* Focus States */
.section-action-button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* Animation for collapsible sections */
.section-content {
  overflow: hidden;
}

.form-section--collapsible .section-content {
  transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
}

.form-section--collapsed .section-content {
  max-height: 0;
  opacity: 0;
}

/* Grid responsive utilities */
@media (min-width: 640px) {
  .section-grid.sm\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .section-grid.sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .section-grid.md\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .section-grid.md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .section-grid.md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .section-grid.lg\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .section-grid.lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .section-grid.lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .section-grid.xl\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .section-grid.xl\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .section-grid.xl\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .section-grid.xl\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>