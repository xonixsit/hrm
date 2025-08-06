<template>
  <div :class="gridClasses">
    <!-- Grid Header -->
    <div v-if="hasHeader" class="grid-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h3 v-if="title" class="grid-title">{{ title }}</h3>
            <p v-if="subtitle" class="grid-subtitle">{{ subtitle }}</p>
          </div>
          <div v-if="hasActions" class="header-actions">
            <slot name="actions">
              <button
                v-for="action in actions"
                :key="action.id"
                @click="handleAction(action)"
                :disabled="action.disabled"
                :class="getActionClasses(action)"
              >
                <component v-if="action.icon" :is="action.icon" class="action-icon" />
                <span v-if="action.label">{{ action.label }}</span>
              </button>
            </slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Grid Content -->
    <div class="grid-content">
      <!-- Loading State -->
      <div v-if="loading" :class="gridLayoutClasses">
        <div
          v-for="n in skeletonCount"
          :key="n"
          class="grid-item-skeleton"
        >
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line skeleton-line--subtitle"></div>
            <div class="skeleton-line skeleton-line--description"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!items?.length" class="grid-empty">
        <slot name="empty">
          <EmptyState
            :icon="emptyIcon"
            :title="emptyTitle"
            :description="emptyDescription"
            :actions="emptyActions"
            @action="handleEmptyAction"
          />
        </slot>
      </div>

      <!-- Grid Items -->
      <div v-else :class="gridLayoutClasses">
        <div
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          :class="getItemClasses(item, index)"
          @click="handleItemClick(item, index)"
        >
          <slot name="item" :item="item" :index="index">
            <!-- Default Card Layout -->
            <div class="card-content">
              <!-- Card Image/Media -->
              <div v-if="showImage" class="card-image">
                <slot name="image" :item="item" :index="index">
                  <div class="default-image">
                    <img
                      v-if="getItemImage(item)"
                      :src="getItemImage(item)"
                      :alt="getItemTitle(item)"
                      class="image"
                      loading="lazy"
                    />
                    <div v-else class="image-placeholder">
                      <component
                        v-if="item.icon"
                        :is="item.icon"
                        class="placeholder-icon"
                      />
                      <div v-else class="placeholder-bg"></div>
                    </div>
                  </div>
                </slot>
              </div>

              <!-- Card Header -->
              <div class="card-header">
                <div class="header-main">
                  <h4 class="card-title">{{ getItemTitle(item) }}</h4>
                  <span v-if="getItemMeta(item)" class="card-meta">{{ getItemMeta(item) }}</span>
                </div>
                <div v-if="getItemActions(item)?.length" class="card-actions">
                  <slot name="item-actions" :item="item" :index="index">
                    <button
                      v-for="action in getItemActions(item)"
                      :key="action.id"
                      @click.stop="handleItemAction(action, item, index)"
                      :disabled="action.disabled"
                      :class="getItemActionClasses(action)"
                      :title="action.tooltip"
                    >
                      <component v-if="action.icon" :is="action.icon" class="action-icon" />
                      <span v-if="action.label && !action.iconOnly">{{ action.label }}</span>
                    </button>
                  </slot>
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body">
                <p v-if="getItemDescription(item)" class="card-description">
                  {{ getItemDescription(item) }}
                </p>
                
                <!-- Custom Content Slot -->
                <div v-if="$slots['item-content']" class="card-custom-content">
                  <slot name="item-content" :item="item" :index="index" />
                </div>
                
                <!-- Tags -->
                <div v-if="getItemTags(item)?.length" class="card-tags">
                  <span
                    v-for="tag in getItemTags(item)"
                    :key="tag"
                    class="card-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Card Footer -->
              <div v-if="$slots['item-footer']" class="card-footer">
                <slot name="item-footer" :item="item" :index="index" />
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- Grid Footer -->
    <div v-if="$slots.footer" class="grid-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import EmptyState from '@/Components/States/EmptyState.vue';

const props = defineProps({
  // Data
  items: {
    type: Array,
    default: () => []
  },
  
  // Header
  title: {
    type: String,
    default: ''
  },
  
  subtitle: {
    type: String,
    default: ''
  },
  
  actions: {
    type: Array,
    default: () => []
  },
  
  // Item configuration
  itemKey: {
    type: [String, Function],
    default: 'id'
  },
  
  itemTitle: {
    type: [String, Function],
    default: 'title'
  },
  
  itemDescription: {
    type: [String, Function],
    default: 'description'
  },
  
  itemImage: {
    type: [String, Function],
    default: 'image'
  },
  
  itemMeta: {
    type: [String, Function],
    default: ''
  },
  
  itemTags: {
    type: [String, Function],
    default: 'tags'
  },
  
  itemActions: {
    type: [String, Function],
    default: 'actions'
  },
  
  // Display options
  showImage: {
    type: Boolean,
    default: true
  },
  
  clickable: {
    type: Boolean,
    default: false
  },
  
  // Grid layout
  columns: {
    type: Object,
    default: () => ({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    })
  },
  
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Card styling
  cardVariant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated', 'flat'].includes(value)
  },
  
  cardSize: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  skeletonCount: {
    type: Number,
    default: 12
  },
  
  // Empty state
  emptyIcon: {
    type: String,
    default: 'ViewGridIcon'
  },
  
  emptyTitle: {
    type: String,
    default: 'No items found'
  },
  
  emptyDescription: {
    type: String,
    default: 'There are no items to display at the moment.'
  },
  
  emptyActions: {
    type: Array,
    default: () => []
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['item-click', 'item-action', 'action', 'empty-action']);

// Composables
const slots = useSlots();

// Computed properties
const hasHeader = computed(() => {
  return props.title || props.subtitle || hasActions.value || slots.header;
});

const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions;
});

const gridClasses = computed(() => [
  'data-grid',
  {
    'data-grid--loading': props.loading,
    'data-grid--has-header': hasHeader.value,
    'data-grid--has-footer': !!slots.footer
  },
  props.class
]);

const gridLayoutClasses = computed(() => [
  'grid-layout',
  `grid-layout--gap-${props.gap}`,
  // Responsive grid classes
  `grid-cols-${props.columns.xs || 1}`,
  `sm:grid-cols-${props.columns.sm || 2}`,
  `md:grid-cols-${props.columns.md || 3}`,
  `lg:grid-cols-${props.columns.lg || 4}`,
  `xl:grid-cols-${props.columns.xl || 5}`
]);

// Methods
const getItemKey = (item, index) => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item, index);
  }
  return item[props.itemKey] || index;
};

const getItemTitle = (item) => {
  if (typeof props.itemTitle === 'function') {
    return props.itemTitle(item);
  }
  return item[props.itemTitle] || '';
};

const getItemDescription = (item) => {
  if (typeof props.itemDescription === 'function') {
    return props.itemDescription(item);
  }
  return item[props.itemDescription] || '';
};

const getItemImage = (item) => {
  if (typeof props.itemImage === 'function') {
    return props.itemImage(item);
  }
  return item[props.itemImage] || '';
};

const getItemMeta = (item) => {
  if (typeof props.itemMeta === 'function') {
    return props.itemMeta(item);
  }
  return item[props.itemMeta] || '';
};

const getItemTags = (item) => {
  if (typeof props.itemTags === 'function') {
    return props.itemTags(item);
  }
  return item[props.itemTags] || [];
};

const getItemActions = (item) => {
  if (typeof props.itemActions === 'function') {
    return props.itemActions(item);
  }
  return item[props.itemActions] || [];
};

const getItemClasses = (item, index) => [
  'grid-item',
  `grid-item--${props.cardVariant}`,
  `grid-item--${props.cardSize}`,
  {
    'grid-item--clickable': props.clickable,
    'grid-item--selected': item.selected,
    'grid-item--disabled': item.disabled
  }
];

const handleItemClick = (item, index) => {
  if (!props.clickable || item.disabled) return;
  emit('item-click', { item, index });
};

const handleItemAction = (action, item, index) => {
  if (action.disabled) return;
  emit('item-action', { action, item, index });
};

const handleAction = (action) => {
  emit('action', action);
};

const handleEmptyAction = (action) => {
  emit('empty-action', action);
};

const getActionClasses = (action) => [
  'header-action-button',
  'inline-flex items-center justify-center',
  'px-3 py-1.5 text-sm font-medium rounded-md',
  'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary' || !action.variant,
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost',
    'opacity-50 cursor-not-allowed': action.disabled
  }
];

const getItemActionClasses = (action) => [
  'item-action-button',
  'inline-flex items-center justify-center',
  'p-1.5 rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost' || !action.variant,
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    'opacity-50 cursor-not-allowed': action.disabled
  }
];
</script>

<style scoped>
/* Base Grid Styles */
.data-grid {
  @apply bg-white rounded-lg border border-neutral-200;
}

/* Grid Header */
.grid-header {
  @apply p-4 border-b border-neutral-200;
}

.header-content {
  @apply flex items-start justify-between gap-4;
}

.title-area {
  @apply flex-1 min-w-0;
}

.grid-title {
  @apply text-lg font-semibold text-neutral-900;
}

.grid-subtitle {
  @apply text-sm text-neutral-600 mt-1;
}

.header-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* Grid Content */
.grid-content {
  @apply p-4;
}

/* Grid Layout */
.grid-layout {
  @apply grid;
}

.grid-layout--gap-sm {
  @apply gap-3;
}

.grid-layout--gap-md {
  @apply gap-4;
}

.grid-layout--gap-lg {
  @apply gap-6;
}

.grid-layout--gap-xl {
  @apply gap-8;
}

/* Grid Items */
.grid-item {
  @apply bg-white rounded-lg transition-all duration-200;
}

.grid-item--default {
  @apply border border-neutral-200;
}

.grid-item--outlined {
  @apply border-2 border-neutral-300;
}

.grid-item--elevated {
  @apply border border-neutral-100 shadow-md;
}

.grid-item--flat {
  @apply bg-neutral-50;
}

.grid-item--clickable {
  @apply cursor-pointer;
}

.grid-item--clickable:hover {
  @apply shadow-lg transform -translate-y-0.5;
}

.grid-item--selected {
  @apply ring-2 ring-primary-500 border-primary-300;
}

.grid-item--disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Card Content */
.card-content {
  @apply h-full flex flex-col;
}

/* Card Image */
.card-image {
  @apply relative overflow-hidden;
}

.grid-item--sm .card-image {
  @apply h-32;
}

.grid-item--md .card-image {
  @apply h-40;
}

.grid-item--lg .card-image {
  @apply h-48;
}

.default-image {
  @apply w-full h-full;
}

.image {
  @apply w-full h-full object-cover;
}

.image-placeholder {
  @apply w-full h-full bg-neutral-200 flex items-center justify-center;
}

.placeholder-icon {
  @apply w-8 h-8 text-neutral-400;
}

.placeholder-bg {
  @apply w-8 h-8 bg-neutral-300 rounded;
}

/* Card Header */
.card-header {
  @apply p-4 flex items-start justify-between gap-2;
}

.grid-item--sm .card-header {
  @apply p-3;
}

.grid-item--lg .card-header {
  @apply p-6;
}

.header-main {
  @apply flex-1 min-w-0;
}

.card-title {
  @apply font-semibold text-neutral-900 line-clamp-2 mb-1;
}

.grid-item--sm .card-title {
  @apply text-sm;
}

.grid-item--md .card-title {
  @apply text-base;
}

.grid-item--lg .card-title {
  @apply text-lg;
}

.card-meta {
  @apply text-sm text-neutral-500;
}

.card-actions {
  @apply flex items-center space-x-1 flex-shrink-0;
}

/* Card Body */
.card-body {
  @apply px-4 pb-4 flex-1;
}

.grid-item--sm .card-body {
  @apply px-3 pb-3;
}

.grid-item--lg .card-body {
  @apply px-6 pb-6;
}

.card-description {
  @apply text-sm text-neutral-600 line-clamp-3 mb-3;
}

.card-custom-content {
  @apply mb-3;
}

.card-tags {
  @apply flex flex-wrap gap-1 mt-auto;
}

.card-tag {
  @apply inline-flex items-center px-2 py-0.5 text-xs font-medium;
  @apply bg-neutral-100 text-neutral-800 rounded-full;
}

/* Card Footer */
.card-footer {
  @apply px-4 pb-4 border-t border-neutral-200 pt-3 mt-auto;
}

.grid-item--sm .card-footer {
  @apply px-3 pb-3;
}

.grid-item--lg .card-footer {
  @apply px-6 pb-6;
}

/* Loading State */
.grid-item-skeleton {
  @apply bg-white border border-neutral-200 rounded-lg overflow-hidden animate-pulse;
}

.skeleton-image {
  @apply h-40 bg-neutral-200;
}

.skeleton-content {
  @apply p-4 space-y-3;
}

.skeleton-line {
  @apply bg-neutral-200 rounded;
}

.skeleton-line--title {
  @apply h-4 w-3/4;
}

.skeleton-line--subtitle {
  @apply h-3 w-1/2;
}

.skeleton-line--description {
  @apply h-3 w-full;
}

/* Empty State */
.grid-empty {
  @apply col-span-full py-12;
}

/* Grid Footer */
.grid-footer {
  @apply p-4 border-t border-neutral-200 bg-neutral-50;
}

/* Action Icons */
.action-icon {
  @apply w-4 h-4;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply justify-end;
  }
  
  .card-header {
    @apply flex-col items-start gap-2;
  }
  
  .card-actions {
    @apply justify-end w-full;
  }
}

/* Dark Theme Adjustments */
.theme-dark .data-grid {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .grid-header {
  @apply border-neutral-700;
}

.theme-dark .grid-title {
  @apply text-neutral-100;
}

.theme-dark .grid-subtitle {
  @apply text-neutral-400;
}

.theme-dark .grid-item--default,
.theme-dark .grid-item--outlined,
.theme-dark .grid-item--elevated {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .grid-item--flat {
  @apply bg-neutral-700;
}

.theme-dark .card-title {
  @apply text-neutral-100;
}

.theme-dark .card-description {
  @apply text-neutral-400;
}

.theme-dark .card-meta {
  @apply text-neutral-500;
}

.theme-dark .card-tag {
  @apply bg-neutral-700 text-neutral-300;
}

.theme-dark .card-footer {
  @apply border-neutral-700;
}

.theme-dark .image-placeholder {
  @apply bg-neutral-700;
}

.theme-dark .placeholder-icon {
  @apply text-neutral-500;
}

.theme-dark .grid-footer {
  @apply border-neutral-700 bg-neutral-700;
}

/* Line Clamp Utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>