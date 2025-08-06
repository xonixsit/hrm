<template>
  <aside :class="sidebarClasses">
    <!-- Sidebar Header -->
    <div v-if="$slots.header || title" class="sidebar-header">
      <slot name="header">
        <h3 v-if="title" class="sidebar-title">{{ title }}</h3>
      </slot>
      
      <!-- Collapse Toggle -->
      <button
        v-if="collapsible"
        @click="handleToggle"
        class="collapse-toggle"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg
          :class="['w-4 h-4 transition-transform', { 'rotate-180': collapsed }]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <slot>
        <!-- Default Navigation Items -->
        <nav v-if="items?.length" class="sidebar-nav">
          <ul class="nav-list">
            <li
              v-for="item in items"
              :key="item.id || item.label"
              class="nav-item"
            >
              <component
                :is="item.href ? 'a' : 'button'"
                :href="item.href"
                @click="handleItemClick(item)"
                :class="getItemClasses(item)"
                :disabled="item.disabled"
              >
                <component
                  v-if="item.icon"
                  :is="item.icon"
                  class="nav-icon"
                />
                <span v-if="!collapsed || !collapsible" class="nav-label">
                  {{ item.label }}
                </span>
                <span
                  v-if="item.badge && (!collapsed || !collapsible)"
                  :class="getBadgeClasses(item.badge)"
                >
                  {{ item.badge.text || item.badge }}
                </span>
              </component>
              
              <!-- Sub-items -->
              <ul v-if="item.children?.length && (!collapsed || !collapsible)" class="nav-sublist">
                <li
                  v-for="child in item.children"
                  :key="child.id || child.label"
                  class="nav-subitem"
                >
                  <component
                    :is="child.href ? 'a' : 'button'"
                    :href="child.href"
                    @click="handleItemClick(child)"
                    :class="getItemClasses(child, true)"
                    :disabled="child.disabled"
                  >
                    <component
                      v-if="child.icon"
                      :is="child.icon"
                      class="nav-icon nav-icon--small"
                    />
                    <span class="nav-label">{{ child.label }}</span>
                    <span
                      v-if="child.badge"
                      :class="getBadgeClasses(child.badge)"
                    >
                      {{ child.badge.text || child.badge }}
                    </span>
                  </component>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </slot>
    </div>

    <!-- Sidebar Footer -->
    <div v-if="$slots.footer" class="sidebar-footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Navigation items
  items: {
    type: Array,
    default: () => []
  },
  
  // Sidebar title
  title: {
    type: String,
    default: ''
  },
  
  // Collapsible behavior
  collapsible: {
    type: Boolean,
    default: true
  },
  
  collapsed: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['toggle', 'item-click']);

// Computed properties
const sidebarClasses = computed(() => [
  'page-sidebar',
  `sidebar--${props.variant}`,
  {
    'sidebar--collapsed': props.collapsed,
    'sidebar--collapsible': props.collapsible
  },
  props.class
]);

// Methods
const handleToggle = () => {
  emit('toggle');
};

const handleItemClick = (item) => {
  if (item.disabled) return;
  
  emit('item-click', item);
  
  // Handle custom click handler
  if (item.onClick) {
    item.onClick(item);
  }
};

const getItemClasses = (item, isChild = false) => [
  'nav-link',
  {
    'nav-link--active': item.active,
    'nav-link--disabled': item.disabled,
    'nav-link--child': isChild
  }
];

const getBadgeClasses = (badge) => {
  const variant = typeof badge === 'object' ? badge.variant : 'default';
  
  return [
    'nav-badge',
    {
      'nav-badge--primary': variant === 'primary' || variant === 'default',
      'nav-badge--secondary': variant === 'secondary',
      'nav-badge--success': variant === 'success',
      'nav-badge--warning': variant === 'warning',
      'nav-badge--error': variant === 'error'
    }
  ];
};
</script>

<style scoped>
.page-sidebar {
  @apply bg-white border-r border-neutral-200 h-full;
  @apply transition-all duration-300 ease-in-out;
}

.sidebar--minimal {
  @apply bg-transparent border-none;
}

.sidebar--bordered {
  @apply border-2 border-neutral-200 rounded-lg;
}

.sidebar--collapsed {
  @apply overflow-hidden;
}

/* Sidebar Header */
.sidebar-header {
  @apply flex items-center justify-between p-4 border-b border-neutral-200;
}

.sidebar-title {
  @apply text-lg font-semibold text-neutral-900 truncate;
}

.collapse-toggle {
  @apply p-1 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.sidebar--collapsed .sidebar-header {
  @apply justify-center;
}

.sidebar--collapsed .sidebar-title {
  @apply hidden;
}

/* Sidebar Content */
.sidebar-content {
  @apply flex-1 overflow-y-auto p-2;
}

/* Navigation */
.sidebar-nav {
  @apply space-y-1;
}

.nav-list {
  @apply space-y-1;
}

.nav-item {
  @apply relative;
}

.nav-link {
  @apply w-full flex items-center px-3 py-2 rounded-md text-sm font-medium;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply transition-colors duration-150;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.nav-link--active {
  @apply bg-primary-100 text-primary-700;
}

.nav-link--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.nav-link--child {
  @apply ml-4 text-xs;
}

.nav-icon {
  @apply w-5 h-5 mr-3 flex-shrink-0;
}

.nav-icon--small {
  @apply w-4 h-4 mr-2;
}

.nav-label {
  @apply flex-1 truncate;
}

.nav-badge {
  @apply ml-2 inline-flex items-center justify-center;
  @apply px-2 py-0.5 text-xs font-medium rounded-full;
}

.nav-badge--primary {
  @apply bg-primary-100 text-primary-800;
}

.nav-badge--secondary {
  @apply bg-neutral-100 text-neutral-800;
}

.nav-badge--success {
  @apply bg-success-100 text-success-800;
}

.nav-badge--warning {
  @apply bg-warning-100 text-warning-800;
}

.nav-badge--error {
  @apply bg-error-100 text-error-800;
}

/* Sub-navigation */
.nav-sublist {
  @apply mt-1 space-y-1;
}

.nav-subitem {
  @apply relative;
}

/* Collapsed State */
.sidebar--collapsed .nav-icon {
  @apply mr-0;
}

.sidebar--collapsed .nav-link {
  @apply justify-center px-2;
}

.sidebar--collapsed .nav-sublist {
  @apply hidden;
}

/* Sidebar Footer */
.sidebar-footer {
  @apply p-4 border-t border-neutral-200;
}

/* Dark Theme Adjustments */
.theme-dark .page-sidebar {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .sidebar-header {
  @apply border-neutral-700;
}

.theme-dark .sidebar-title {
  @apply text-neutral-200;
}

.theme-dark .collapse-toggle {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .nav-link {
  @apply text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700;
}

.theme-dark .nav-link--active {
  @apply bg-primary-900 text-primary-200;
}

.theme-dark .sidebar-footer {
  @apply border-neutral-700;
}
</style>