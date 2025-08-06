<template>
  <div 
    :class="cardClasses"
    :tabindex="clickable && !disabled ? 0 : undefined"
    @click="handleCardClick"
  >
    <!-- Card Header -->
    <header v-if="hasHeader" class="card-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h3 v-if="title" class="card-title">{{ title }}</h3>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>
          <div v-if="hasActions" class="card-actions">
            <slot name="actions">
              <button
                v-for="action in actions"
                :key="action.id"
                @click="handleAction(action)"
                :disabled="action.disabled"
                :class="getActionClasses(action)"
                :title="action.tooltip"
              >
                <component v-if="action.icon" :is="action.icon" class="action-icon" />
                <span v-if="action.label && !action.iconOnly" class="action-label">{{ action.label }}</span>
              </button>
            </slot>
          </div>
        </div>
      </slot>
    </header>

    <!-- Card Media -->
    <div v-if="$slots.media" class="card-media">
      <slot name="media" />
    </div>

    <!-- Card Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Card Footer -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  // Content
  title: {
    type: String,
    default: ''
  },
  
  subtitle: {
    type: String,
    default: ''
  },
  
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated', 'flat'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Layout
  clickable: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['click', 'action']);

// Composables
const slots = useSlots();

// Computed properties
const hasHeader = computed(() => {
  return props.title || props.subtitle || slots.header || hasActions.value;
});

const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions;
});

const cardClasses = computed(() => [
  'content-card',
  `content-card--${props.variant}`,
  `content-card--${props.size}`,
  {
    'content-card--clickable': props.clickable,
    'content-card--disabled': props.disabled,
    'content-card--has-header': hasHeader.value,
    'content-card--has-media': !!slots.media,
    'content-card--has-footer': !!slots.footer
  },
  props.class
]);

const contentClasses = computed(() => [
  'card-content',
  {
    'card-content--with-header': hasHeader.value,
    'card-content--with-media': !!slots.media,
    'card-content--with-footer': !!slots.footer
  }
]);

// Methods
const handleAction = (action) => {
  if (action.disabled || props.disabled) return;
  
  emit('action', action);
  
  if (action.handler) {
    action.handler();
  }
};

const handleCardClick = (event) => {
  if (props.disabled || !props.clickable) return;
  
  // Don't trigger card click if clicking on an action button
  if (event.target.closest('.card-actions')) return;
  
  emit('click', event);
};

const getActionClasses = (action) => [
  'card-action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'p-1': action.iconOnly && (action.size === 'xs' || !action.size),
    'p-1.5': action.iconOnly && action.size === 'sm',
    'p-2': action.iconOnly && action.size === 'md',
    'px-2 py-1 text-xs': !action.iconOnly && (action.size === 'xs' || !action.size),
    'px-3 py-1.5 text-sm': !action.iconOnly && action.size === 'sm',
    'px-4 py-2 text-base': !action.iconOnly && action.size === 'md',
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary',
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost' || !action.variant,
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled || props.disabled,
    'space-x-1': action.icon && action.label && !action.iconOnly
  }
];
</script>

<style scoped>
/* Base Card Styles */
.content-card {
  @apply relative overflow-hidden transition-all duration-200;
}

/* Card Variants */
.content-card--default {
  @apply bg-white border border-neutral-200 rounded-lg;
}

.content-card--outlined {
  @apply bg-white border-2 border-neutral-300 rounded-lg;
}

.content-card--elevated {
  @apply bg-white border border-neutral-100 rounded-lg shadow-md;
}

.content-card--flat {
  @apply bg-neutral-50 rounded-lg;
}

/* Size Variants */
.content-card--xs {
  @apply text-sm;
}

.content-card--sm {
  @apply text-sm;
}

.content-card--md {
  @apply text-base;
}

.content-card--lg {
  @apply text-lg;
}

.content-card--xl {
  @apply text-xl;
}

/* Clickable Cards */
.content-card--clickable {
  @apply cursor-pointer;
}

.content-card--clickable:hover {
  @apply shadow-lg transform -translate-y-0.5;
}

.content-card--clickable.content-card--outlined:hover {
  @apply border-primary-300;
}

.content-card--clickable.content-card--elevated:hover {
  @apply shadow-xl;
}

/* Disabled Cards */
.content-card--disabled {
  @apply opacity-60 cursor-not-allowed;
}

.content-card--disabled:hover {
  @apply shadow-none transform-none;
}

/* Card Header */
.card-header {
  @apply p-4 border-b border-neutral-200;
}

.content-card--xs .card-header,
.content-card--sm .card-header {
  @apply p-3;
}

.content-card--lg .card-header,
.content-card--xl .card-header {
  @apply p-6;
}

.header-content {
  @apply flex items-start justify-between gap-3;
}

.title-area {
  @apply flex-1 min-w-0;
}

.card-actions {
  @apply flex items-center space-x-1 flex-shrink-0;
}

.card-title {
  @apply font-semibold text-neutral-900 leading-tight;
}

.content-card--xs .card-title,
.content-card--sm .card-title {
  @apply text-base;
}

.content-card--md .card-title {
  @apply text-lg;
}

.content-card--lg .card-title {
  @apply text-xl;
}

.content-card--xl .card-title {
  @apply text-2xl;
}

.card-subtitle {
  @apply text-neutral-600 mt-1 leading-relaxed;
}

.content-card--xs .card-subtitle,
.content-card--sm .card-subtitle {
  @apply text-xs;
}

.content-card--md .card-subtitle {
  @apply text-sm;
}

.content-card--lg .card-subtitle,
.content-card--xl .card-subtitle {
  @apply text-base;
}

/* Card Media */
.card-media {
  @apply relative overflow-hidden;
}

.content-card--has-header .card-media {
  @apply border-t-0;
}

/* Card Content */
.card-content {
  @apply p-4;
}

.content-card--xs .card-content,
.content-card--sm .card-content {
  @apply p-3;
}

.content-card--lg .card-content,
.content-card--xl .card-content {
  @apply p-6;
}

.card-content--with-header {
  @apply pt-4;
}

.card-content--with-media {
  @apply pt-4;
}

.card-content--with-footer {
  @apply pb-0;
}

/* Card Footer */
.card-footer {
  @apply p-4 border-t border-neutral-200 bg-neutral-50;
}

.content-card--xs .card-footer,
.content-card--sm .card-footer {
  @apply p-3;
}

.content-card--lg .card-footer,
.content-card--xl .card-footer {
  @apply p-6;
}

/* Action Buttons */
.action-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.action-label {
  @apply truncate;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-2;
  }
  
  .card-actions {
    @apply justify-end;
  }
  
  .card-header,
  .card-content,
  .card-footer {
    @apply p-3;
  }
  
  .content-card--lg .card-header,
  .content-card--lg .card-content,
  .content-card--lg .card-footer,
  .content-card--xl .card-header,
  .content-card--xl .card-content,
  .content-card--xl .card-footer {
    @apply p-4;
  }
}

/* Dark Theme Adjustments */
.theme-dark .content-card--default,
.theme-dark .content-card--outlined,
.theme-dark .content-card--elevated {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .content-card--flat {
  @apply bg-neutral-700;
}

.theme-dark .card-header {
  @apply border-neutral-700;
}

.theme-dark .card-footer {
  @apply border-neutral-700 bg-neutral-700;
}

.theme-dark .card-title {
  @apply text-neutral-100;
}

.theme-dark .card-subtitle {
  @apply text-neutral-400;
}

/* Focus States */
.content-card--clickable:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* Loading State */
.content-card--loading {
  @apply animate-pulse;
}

.content-card--loading .card-title,
.content-card--loading .card-subtitle {
  @apply bg-neutral-200 text-transparent rounded;
}

.theme-dark .content-card--loading .card-title,
.theme-dark .content-card--loading .card-subtitle {
  @apply bg-neutral-600;
}
</style>