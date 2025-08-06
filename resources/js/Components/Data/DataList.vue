<template>
  <div :class="listClasses">
    <!-- List Header -->
    <div v-if="hasHeader" class="list-header">
      <slot name="header">
        <div class="header-content">
          <div class="title-area">
            <h3 v-if="title" class="list-title">{{ title }}</h3>
            <p v-if="subtitle" class="list-subtitle">{{ subtitle }}</p>
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

    <!-- List Content -->
    <div class="list-content">
      <!-- Loading State -->
      <div v-if="loading" class="list-loading">
        <div v-for="n in skeletonCount" :key="n" class="list-item-skeleton">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line skeleton-line--subtitle"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!items?.length" class="list-empty">
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

      <!-- List Items -->
      <div v-else class="list-items">
        <div
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          :class="getItemClasses(item, index)"
          @click="handleItemClick(item, index)"
        >
          <slot name="item" :item="item" :index="index">
            <!-- Default Item Layout -->
            <div class="item-content">
              <!-- Avatar/Icon -->
              <div v-if="showAvatar" class="item-avatar">
                <slot name="avatar" :item="item" :index="index">
                  <div class="default-avatar">
                    <component v-if="item.icon" :is="item.icon" class="avatar-icon" />
                    <span v-else-if="item.avatar" class="avatar-text">{{ item.avatar }}</span>
                    <div v-else class="avatar-placeholder"></div>
                  </div>
                </slot>
              </div>

              <!-- Main Content -->
              <div class="item-main">
                <div class="item-header">
                  <h4 class="item-title">{{ getItemTitle(item) }}</h4>
                  <span v-if="getItemMeta(item)" class="item-meta">{{ getItemMeta(item) }}</span>
                </div>
                <p v-if="getItemDescription(item)" class="item-description">
                  {{ getItemDescription(item) }}
                </p>
                <div v-if="getItemTags(item)?.length" class="item-tags">
                  <span
                    v-for="tag in getItemTags(item)"
                    :key="tag"
                    class="item-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="getItemActions(item)?.length" class="item-actions">
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
          </slot>
        </div>
      </div>
    </div>

    <!-- List Footer -->
    <div v-if="$slots.footer" class="list-footer">
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
  showAvatar: {
    type: Boolean,
    default: true
  },
  
  clickable: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'divided', 'compact'].includes(value)
  },
  
  size: {
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
    default: 5
  },
  
  // Empty state
  emptyIcon: {
    type: String,
    default: 'DocumentIcon'
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

const listClasses = computed(() => [
  'data-list',
  `data-list--${props.variant}`,
  `data-list--${props.size}`,
  {
    'data-list--clickable': props.clickable,
    'data-list--loading': props.loading,
    'data-list--has-header': hasHeader.value,
    'data-list--has-footer': !!slots.footer
  },
  props.class
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
  'list-item',
  {
    'list-item--clickable': props.clickable,
    'list-item--selected': item.selected,
    'list-item--disabled': item.disabled
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
/* Base List Styles */
.data-list {
  @apply bg-white rounded-lg border border-neutral-200;
}

/* List Header */
.list-header {
  @apply p-4 border-b border-neutral-200;
}

.header-content {
  @apply flex items-start justify-between gap-4;
}

.title-area {
  @apply flex-1 min-w-0;
}

.list-title {
  @apply text-lg font-semibold text-neutral-900;
}

.list-subtitle {
  @apply text-sm text-neutral-600 mt-1;
}

.header-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* List Content */
.list-content {
  @apply relative;
}

/* List Items */
.list-items {
  @apply divide-y divide-neutral-200;
}

.list-item {
  @apply relative transition-colors;
}

.data-list--default .list-item {
  @apply p-4;
}

.data-list--compact .list-item {
  @apply p-3;
}

.data-list--bordered .list-item {
  @apply p-4 border border-neutral-200 rounded-lg m-2;
}

.data-list--divided .list-item {
  @apply p-4 border-b border-neutral-200 last:border-b-0;
}

.list-item--clickable {
  @apply cursor-pointer hover:bg-neutral-50;
}

.list-item--selected {
  @apply bg-primary-50 border-primary-200;
}

.list-item--disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Item Content */
.item-content {
  @apply flex items-start space-x-3;
}

.item-avatar {
  @apply flex-shrink-0;
}

.default-avatar {
  @apply w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center;
}

.data-list--sm .default-avatar {
  @apply w-8 h-8;
}

.data-list--lg .default-avatar {
  @apply w-12 h-12;
}

.avatar-icon {
  @apply w-5 h-5 text-neutral-600;
}

.avatar-text {
  @apply text-sm font-medium text-neutral-700;
}

.avatar-placeholder {
  @apply w-5 h-5 bg-neutral-300 rounded;
}

.item-main {
  @apply flex-1 min-w-0;
}

.item-header {
  @apply flex items-start justify-between gap-2 mb-1;
}

.item-title {
  @apply font-medium text-neutral-900 truncate;
}

.data-list--sm .item-title {
  @apply text-sm;
}

.data-list--lg .item-title {
  @apply text-lg;
}

.item-meta {
  @apply text-sm text-neutral-500 flex-shrink-0;
}

.item-description {
  @apply text-sm text-neutral-600 line-clamp-2 mb-2;
}

.item-tags {
  @apply flex flex-wrap gap-1;
}

.item-tag {
  @apply inline-flex items-center px-2 py-0.5 text-xs font-medium;
  @apply bg-neutral-100 text-neutral-800 rounded-full;
}

.item-actions {
  @apply flex items-center space-x-1 flex-shrink-0;
}

.action-icon {
  @apply w-4 h-4;
}

/* Loading State */
.list-loading {
  @apply p-4 space-y-4;
}

.list-item-skeleton {
  @apply flex items-start space-x-3 animate-pulse;
}

.skeleton-avatar {
  @apply w-10 h-10 bg-neutral-200 rounded-full flex-shrink-0;
}

.skeleton-content {
  @apply flex-1 space-y-2;
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

/* Empty State */
.list-empty {
  @apply p-8;
}

/* List Footer */
.list-footer {
  @apply p-4 border-t border-neutral-200 bg-neutral-50;
}

/* Size Variants */
.data-list--sm .list-item {
  @apply py-2;
}

.data-list--sm .item-title {
  @apply text-sm;
}

.data-list--sm .item-description {
  @apply text-xs;
}

.data-list--lg .list-item {
  @apply py-6;
}

.data-list--lg .item-title {
  @apply text-lg;
}

.data-list--lg .item-description {
  @apply text-base;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply justify-end;
  }
  
  .item-content {
    @apply space-x-2;
  }
  
  .item-header {
    @apply flex-col items-start gap-1;
  }
  
  .item-meta {
    @apply text-xs;
  }
}

/* Dark Theme Adjustments */
.theme-dark .data-list {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .list-header {
  @apply border-neutral-700;
}

.theme-dark .list-items {
  @apply divide-neutral-700;
}

.theme-dark .list-item--clickable:hover {
  @apply bg-neutral-700;
}

.theme-dark .list-title {
  @apply text-neutral-100;
}

.theme-dark .list-subtitle {
  @apply text-neutral-400;
}

.theme-dark .item-title {
  @apply text-neutral-100;
}

.theme-dark .item-description {
  @apply text-neutral-400;
}

.theme-dark .item-meta {
  @apply text-neutral-500;
}

.theme-dark .default-avatar {
  @apply bg-neutral-700;
}

.theme-dark .avatar-text {
  @apply text-neutral-300;
}

.theme-dark .item-tag {
  @apply bg-neutral-700 text-neutral-300;
}

.theme-dark .list-footer {
  @apply border-neutral-700 bg-neutral-700;
}

/* Line Clamp Utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>