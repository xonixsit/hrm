<template>
  <header :class="headerClasses">
    <!-- Breadcrumbs -->
    <BreadcrumbNavigation
      v-if="breadcrumbs?.length"
      :items="breadcrumbs"
      class="breadcrumbs"
    />

    <!-- Main Header Content -->
    <div class="header-main">
      <div class="header-content">
        <!-- Custom Header Slot -->
        <div v-if="$slots.header" class="custom-header">
          <slot name="header" />
        </div>
        
        <!-- Default Header Content -->
        <div v-else class="default-header">
          <div class="title-section">
            <h1 class="page-title">{{ title }}</h1>
            <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Header Actions -->
      <div v-if="hasActions" class="header-actions">
        <slot name="actions">
          <div class="action-buttons">
            <button
              v-for="action in visibleActions"
              :key="action.id"
              @click="handleAction(action)"
              :disabled="action.disabled"
              :class="getActionClasses(action)"
              :title="action.tooltip"
            >
              <component v-if="action.icon" :is="action.icon" class="action-icon" />
              <span v-if="action.label && !action.iconOnly" class="action-label">{{ action.label }}</span>
            </button>
            
            <!-- Overflow Menu -->
            <div v-if="overflowActions.length" class="overflow-menu" ref="overflowMenuRef">
              <button
                @click="toggleOverflowMenu"
                :class="overflowButtonClasses"
                :aria-expanded="showOverflowMenu"
                aria-haspopup="true"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <Transition name="dropdown">
                <div v-if="showOverflowMenu" class="overflow-dropdown">
                  <button
                    v-for="action in overflowActions"
                    :key="action.id"
                    @click="handleAction(action)"
                    :disabled="action.disabled"
                    class="overflow-action"
                  >
                    <component v-if="action.icon" :is="action.icon" class="w-4 h-4" />
                    <span>{{ action.label }}</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- Tab Navigation -->
    <TabNavigation
      v-if="tabs?.length"
      :items="tabs"
      :active-tab="activeTab"
      @tab-change="handleTabChange"
      class="header-tabs"
    />
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, useSlots } from 'vue';
import { router } from '@inertiajs/vue3';
import { useResponsive } from '@/composables/useResponsive';
import BreadcrumbNavigation from './BreadcrumbNavigation.vue';
import TabNavigation from './TabNavigation.vue';

const props = defineProps({
  // Content
  title: {
    type: String,
    required: true
  },
  
  subtitle: {
    type: String,
    default: ''
  },
  
  // Navigation
  breadcrumbs: {
    type: Array,
    default: () => []
  },
  
  // Actions
  actions: {
    type: Array,
    default: () => []
  },
  
  maxVisibleActions: {
    type: Number,
    default: 3
  },
  
  // Tabs
  tabs: {
    type: Array,
    default: () => []
  },
  
  activeTab: {
    type: String,
    default: ''
  },
  
  // Styling
  sticky: {
    type: Boolean,
    default: false
  },
  
  background: {
    type: String,
    default: 'white',
    validator: (value) => ['white', 'neutral', 'transparent'].includes(value)
  },
  
  border: {
    type: Boolean,
    default: true
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['action', 'tab-change']);

// Composables
const { isMobile, isTablet } = useResponsive();
const slots = useSlots();

// Local state
const showOverflowMenu = ref(false);
const overflowMenuRef = ref(null);

// Computed properties
const headerClasses = computed(() => [
  'page-header',
  {
    'sticky top-0 z-sticky': props.sticky,
    'bg-white': props.background === 'white',
    'bg-neutral-50': props.background === 'neutral',
    'bg-transparent': props.background === 'transparent',
    'border-b border-neutral-200': props.border,
    'shadow-sm': props.sticky
  },
  props.class
]);

const hasActions = computed(() => {
  return props.actions?.length > 0 || !!slots.actions;
});

const visibleActions = computed(() => {
  if (isMobile.value) {
    return props.actions.slice(0, 1); // Show only 1 action on mobile
  }
  if (isTablet.value) {
    return props.actions.slice(0, 2); // Show 2 actions on tablet
  }
  return props.actions.slice(0, props.maxVisibleActions);
});

const overflowActions = computed(() => {
  const visibleCount = visibleActions.value.length;
  return props.actions.slice(visibleCount);
});

const overflowButtonClasses = computed(() => [
  'overflow-button',
  'inline-flex items-center justify-center',
  'p-2 rounded-md',
  'text-neutral-600 hover:text-neutral-900',
  'hover:bg-neutral-100',
  'focus:outline-none focus:ring-2 focus:ring-primary-500',
  {
    'bg-neutral-100 text-neutral-900': showOverflowMenu.value
  }
]);

// Methods
const handleAction = (action) => {
  if (action.disabled) return;
  
  showOverflowMenu.value = false;
  emit('action', action);
  
  // Handle built-in action types
  if (action.handler) {
    action.handler();
  } else if (action.href) {
    // Handle navigation with Inertia for SPA behavior
    router.visit(action.href);
  }
};

const handleTabChange = (tab) => {
  emit('tab-change', tab);
};

const toggleOverflowMenu = () => {
  showOverflowMenu.value = !showOverflowMenu.value;
};

const getActionClasses = (action) => [
  'action-button',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    // Size classes
    'px-3 py-2 text-sm': action.size === 'sm' || !action.size,
    'px-4 py-2 text-base': action.size === 'md',
    'px-6 py-3 text-lg': action.size === 'lg',
    
    // Variant classes
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': action.variant === 'primary',
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500': action.variant === 'secondary' || !action.variant,
    'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500': action.variant === 'ghost',
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': action.variant === 'danger',
    
    // State classes
    'opacity-50 cursor-not-allowed': action.disabled,
    'space-x-2': action.icon && action.label && !action.iconOnly,
    'p-2': action.iconOnly
  }
];

// Click outside handler
const handleClickOutside = (event) => {
  if (overflowMenuRef.value && !overflowMenuRef.value.contains(event.target)) {
    showOverflowMenu.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.page-header {
  @apply py-6 bg-white border-b border-neutral-200;
}

.page-header > * {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

/* Breadcrumbs */
.breadcrumbs {
  @apply mb-4;
}

/* Header Main */
.header-main {
  @apply flex items-center justify-between gap-6 mb-6;
}

.header-content {
  @apply flex-1 min-w-0;
}

.title-section {
  @apply space-y-2;
}

.page-title {
  @apply text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight;
  @apply mb-0;
}

.page-subtitle {
  @apply text-base text-neutral-600 leading-relaxed;
  @apply mt-1;
}

/* Header Actions */
.header-actions {
  @apply flex-shrink-0;
}

.action-buttons {
  @apply flex items-center space-x-3;
}

.action-icon {
  @apply w-4 h-4;
}

.action-label {
  @apply truncate;
}

/* Overflow Menu */
.overflow-menu {
  @apply relative;
}

.overflow-dropdown {
  @apply absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-md shadow-lg z-dropdown;
  @apply py-1;
}

.overflow-action {
  @apply w-full flex items-center space-x-2 px-3 py-2 text-sm text-neutral-700;
  @apply hover:bg-neutral-100 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Header Tabs */
.header-tabs {
  @apply -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8;
  @apply border-t border-neutral-200;
  @apply pt-4;
}

/* Dropdown Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-200;
}

.dropdown-enter-from,
.dropdown-leave-to {
  @apply opacity-0 scale-95 transform;
}

.dropdown-enter-to,
.dropdown-leave-from {
  @apply opacity-100 scale-100 transform;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .header-main {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply flex-shrink-0;
  }
  
  .action-buttons {
    @apply justify-end;
  }
  
  .page-title {
    @apply text-xl;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .action-buttons {
    @apply space-x-2;
  }
}

/* Dark theme adjustments */
.theme-dark .page-header {
  @apply border-neutral-700;
}

.theme-dark .overflow-dropdown {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .overflow-action {
  @apply text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .header-tabs {
  @apply border-neutral-700;
}
</style>