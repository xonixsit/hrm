<template>
  <div :class="layoutClasses">
    <!-- Page Header -->
    <PageHeader
      v-if="showHeader"
      :title="title"
      :subtitle="subtitle"
      :breadcrumbs="breadcrumbs"
      :actions="actions"
      :tabs="tabs"
      :sticky="stickyHeader"
      @tab-change="handleTabChange"
      @action="handleAction"
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </PageHeader>

    <!-- Main Content Area -->
    <div :class="contentClasses">
      <!-- Sidebar -->
      <aside
        v-if="hasSidebar && sidebarItems?.length"
        :class="sidebarClasses"
      >
        <PageSidebar
          :items="sidebarItems"
          :collapsible="collapsibleSidebar"
          :collapsed="sidebarCollapsed"
          @toggle="handleSidebarToggle"
          @item-click="handleSidebarItemClick"
        >
          <template v-if="$slots.sidebar" #default>
            <slot name="sidebar" />
          </template>
        </PageSidebar>
      </aside>

      <!-- Main Content -->
      <main :class="mainContentClasses" role="main">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner" />
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-content">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="error-title">{{ error.title || 'Something went wrong' }}</h3>
            <p class="error-message">{{ error.message || 'Please try again later.' }}</p>
            <div v-if="error.actions" class="error-actions">
              <button
                v-for="action in error.actions"
                :key="action.label"
                @click="action.handler"
                :class="getErrorActionClasses(action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content Slot -->
        <div v-else :class="contentWrapperClasses">
          <slot />
        </div>
      </main>
    </div>

    <!-- App Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, ref, provide, onMounted, onUnmounted } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import PageHeader from './PageHeader.vue';
import PageSidebar from './PageSidebar.vue';
import AppFooter from './AppFooter.vue';

const props = defineProps({
  // Page content
  title: {
    type: String,
    required: true
  },
  
  subtitle: {
    type: String,
    default: ''
  },
  
  // Header configuration
  showHeader: {
    type: Boolean,
    default: true
  },
  
  stickyHeader: {
    type: Boolean,
    default: false
  },
  
  breadcrumbs: {
    type: Array,
    default: () => []
  },
  
  actions: {
    type: Array,
    default: () => []
  },
  
  tabs: {
    type: Array,
    default: () => []
  },
  
  // Sidebar configuration
  hasSidebar: {
    type: Boolean,
    default: false
  },
  
  sidebarItems: {
    type: Array,
    default: () => []
  },
  
  collapsibleSidebar: {
    type: Boolean,
    default: true
  },
  
  // Footer configuration
  hasFooter: {
    type: Boolean,
    default: false
  },
  
  footerLinks: {
    type: Array,
    default: () => []
  },
  
  footerCopyright: {
    type: String,
    default: ''
  },
  
  // Layout configuration
  maxWidth: {
    type: String,
    default: 'xl',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
  },
  
  padding: {
    type: String,
    default: 'responsive',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'responsive'].includes(value)
  },
  
  // State management
  loading: {
    type: Boolean,
    default: false
  },
  
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  
  error: {
    type: Object,
    default: null
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits([
  'tab-change',
  'action',
  'sidebar-toggle',
  'sidebar-item-click'
]);

// Composables
const { isMobile, isTablet, isDesktop } = useResponsive();

// Local state
const sidebarCollapsed = ref(false);

// Computed properties
const layoutClasses = computed(() => [
  'page-layout',
  'min-h-screen',
  'bg-neutral-50',
  {
    'has-sidebar': props.hasSidebar,
    'has-footer': props.hasFooter,
    'sidebar-collapsed': sidebarCollapsed.value,
    'mobile': isMobile.value,
    'tablet': isTablet.value,
    'desktop': isDesktop.value
  },
  props.class
]);

const contentClasses = computed(() => [
  'page-content',
  'flex',
  'flex-1',
  {
    'container-responsive': props.maxWidth !== 'full',
    [`container-responsive-${props.maxWidth}`]: props.maxWidth !== 'full' && props.maxWidth !== 'xl'
  }
]);

const sidebarClasses = computed(() => [
  'page-sidebar',
  'flex-shrink-0',
  {
    'sidebar-collapsed': sidebarCollapsed.value,
    'mobile-sidebar': isMobile.value
  }
]);

const mainContentClasses = computed(() => [
  'main-content',
  'flex-1',
  'min-w-0', // Prevent flex item from overflowing
  {
    'with-sidebar': props.hasSidebar && props.sidebarItems?.length,
    'full-width': !props.hasSidebar || !props.sidebarItems?.length
  }
]);

const contentWrapperClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    responsive: 'px-4 sm:px-6 lg:px-8 py-6'
  };
  
  return [
    'content-wrapper',
    'mx-auto max-w-7xl',
    paddingClasses[props.padding]
  ];
});

// Methods
const handleTabChange = (tab) => {
  emit('tab-change', tab);
};

const handleAction = (action) => {
  emit('action', action);
};

const handleSidebarToggle = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  emit('sidebar-toggle', sidebarCollapsed.value);
};

const handleSidebarItemClick = (item) => {
  emit('sidebar-item-click', item);
};

const getErrorActionClasses = (action) => [
  'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
  {
    'bg-primary-600 text-white hover:bg-primary-700': action.variant === 'primary',
    'bg-neutral-200 text-neutral-900 hover:bg-neutral-300': action.variant === 'secondary' || !action.variant
  }
];

// Auto-collapse sidebar on mobile
const handleResize = () => {
  if (isMobile.value && !sidebarCollapsed.value) {
    sidebarCollapsed.value = true;
  }
};

// Provide layout context to child components
provide('pageLayout', {
  title: computed(() => props.title),
  subtitle: computed(() => props.subtitle),
  hasSidebar: computed(() => props.hasSidebar),
  sidebarCollapsed: computed(() => sidebarCollapsed.value),
  isMobile,
  isTablet,
  isDesktop
});

// Lifecycle
onMounted(() => {
  // Auto-collapse sidebar on mobile
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Expose methods for parent components
defineExpose({
  toggleSidebar: handleSidebarToggle,
  collapseSidebar: () => {
    sidebarCollapsed.value = true;
  },
  expandSidebar: () => {
    sidebarCollapsed.value = false;
  }
});
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
}

.page-content {
  position: relative;
}

/* Sidebar Styles */
.page-sidebar {
  width: 280px;
  transition: width var(--duration-normal) var(--easing-ease-in-out);
}

.page-sidebar.sidebar-collapsed {
  width: 64px;
}

.page-sidebar.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-index-overlay);
  background: white;
  box-shadow: var(--shadow-lg);
  transform: translateX(-100%);
  transition: transform var(--duration-normal) var(--easing-ease-in-out);
}

.has-sidebar .page-sidebar.mobile-sidebar:not(.sidebar-collapsed) {
  transform: translateX(0);
}

/* Main Content Styles */
.main-content {
  position: relative;
  background: white;
  overflow: hidden;
}

.main-content.with-sidebar {
  /* Sidebar layout handled by flex */
}

.main-content.full-width {
  /* Full width layout */
}

/* Loading State */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-8);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-neutral-200);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-4);
}

.loading-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
}

/* Error State */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-8);
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--color-error-500);
  margin: 0 auto var(--spacing-4);
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-2);
}

.error-message {
  color: var(--color-neutral-600);
  margin-bottom: var(--spacing-6);
}

.error-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
}

/* Content Wrapper */
.content-wrapper {
  min-height: 100%;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .main-content {
    margin: var(--spacing-2);
    border-radius: var(--radius-base);
  }
  
  .main-content.with-sidebar {
    margin-left: var(--spacing-2);
  }
}

@media (min-width: 1024px) {
  .page-content {
    gap: var(--spacing-6);
  }
  
  .main-content {
    margin: var(--spacing-6);
  }
  
  .main-content.with-sidebar {
    margin-left: var(--spacing-3);
  }
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark theme adjustments */
.theme-dark .main-content {
  background: var(--color-neutral-800);
  border: 1px solid var(--color-neutral-700);
}

.theme-dark .page-sidebar.mobile-sidebar {
  background: var(--color-neutral-800);
  border-right: 1px solid var(--color-neutral-700);
}
</style>