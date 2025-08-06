<template>
  <div :class="['tab-navigation', props.class]">
    <div class="tab-container" ref="tabContainer">
      <!-- Tab List -->
      <div
        class="tab-list"
        role="tablist"
        :aria-label="ariaLabel"
      >
        <button
          v-for="(tab, index) in items"
          :key="tab.id || tab.label"
          :ref="el => setTabRef(el, index)"
          @click="handleTabClick(tab)"
          @keydown="handleKeydown($event, index)"
          @mouseenter="handleTabHover(tab)"
          :class="getTabClasses(tab)"
          :aria-selected="isActive(tab)"
          :aria-controls="tab.panelId"
          :disabled="tab.disabled"
          role="tab"
          :tabindex="isActive(tab) ? 0 : -1"
        >
          <!-- Tab Icon -->
          <component
            v-if="tab.icon"
            :is="tab.icon"
            class="tab-icon"
          />
          
          <!-- Tab Label -->
          <span class="tab-label">{{ tab.label }}</span>
          
          <!-- Tab Badge -->
          <span
            v-if="tab.badge"
            :class="getBadgeClasses(tab)"
          >
            {{ tab.badge }}
          </span>
          
          <!-- Close Button -->
          <button
            v-if="tab.closable"
            @click.stop="handleTabClose(tab)"
            class="tab-close"
            :aria-label="`Close ${tab.label} tab`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </button>
      </div>
      
      <!-- Active Tab Indicator -->
      <div
        class="tab-indicator"
        :style="indicatorStyle"
      />
    </div>
    
    <!-- Scroll Buttons -->
    <div v-if="showScrollButtons" class="scroll-buttons">
      <button
        @click="scrollLeft"
        :disabled="!canScrollLeft"
        class="scroll-button scroll-button--left"
        aria-label="Scroll tabs left"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        @click="scrollRight"
        :disabled="!canScrollRight"
        class="scroll-button scroll-button--right"
        aria-label="Scroll tabs right"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import { useTabs } from '@/composables/useTabs';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every(item => 
        typeof item === 'object' && 
        item.label && 
        typeof item.label === 'string'
      );
    }
  },
  
  activeTab: {
    type: String,
    default: ''
  },
  
  variant: {
    type: String,
    default: 'underline',
    validator: (value) => ['underline', 'pills', 'buttons'].includes(value)
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  ariaLabel: {
    type: String,
    default: 'Tab navigation'
  },
  
  // URL synchronization
  urlSync: {
    type: Boolean,
    default: false
  },
  
  urlParam: {
    type: String,
    default: 'tab'
  },
  
  // Persistence
  persist: {
    type: Boolean,
    default: false
  },
  
  storageKey: {
    type: String,
    default: 'tab-state'
  },
  
  // Lazy loading
  lazy: {
    type: Boolean,
    default: false
  },
  
  // Preloading
  preloadOnHover: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['tab-change', 'tab-close', 'tab-load', 'tab-preload']);

// Composables
const { isMobile } = useResponsive();

// Initialize tab management if URL sync or persistence is enabled
const tabManager = props.urlSync || props.persist || props.lazy ? useTabs({
  tabs: props.items,
  defaultTab: props.activeTab,
  urlSync: props.urlSync,
  urlParam: props.urlParam,
  lazy: props.lazy,
  persist: props.persist,
  storageKey: props.storageKey
}) : null;

// Template refs
const tabContainer = ref(null);
const tabRefs = ref([]);

// Local state
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const indicatorStyle = ref({});

// Computed properties
const showScrollButtons = computed(() => {
  return isMobile.value && props.items.length > 3;
});

const activeTabIndex = computed(() => {
  return props.items.findIndex(tab => isActive(tab));
});

// Methods
const setTabRef = (el, index) => {
  if (el) {
    tabRefs.value[index] = el;
  }
};

const isActive = (tab) => {
  // Use tab manager if available
  if (tabManager) {
    return tabManager.activeTab.value === tab.id;
  }
  
  if (props.activeTab) {
    return tab.id === props.activeTab || tab.value === props.activeTab;
  }
  return tab.active || false;
};

const handleTabClick = async (tab) => {
  if (tab.disabled) return;
  
  // Use tab manager if available
  if (tabManager) {
    const success = await tabManager.setActiveTab(tab.id);
    if (success) {
      emit('tab-change', tab);
    }
  } else {
    emit('tab-change', tab);
  }
  
  updateIndicator();
};

const handleTabHover = (tab) => {
  if (props.preloadOnHover && tabManager && !tabManager.isTabLoaded.value(tab.id)) {
    tabManager.preloadTab(tab.id);
    emit('tab-preload', tab);
  }
};

const handleTabClose = (tab) => {
  emit('tab-close', tab);
};

const handleKeydown = (event, index) => {
  const { key } = event;
  let newIndex = index;
  
  switch (key) {
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = index > 0 ? index - 1 : props.items.length - 1;
      break;
    case 'ArrowRight':
      event.preventDefault();
      newIndex = index < props.items.length - 1 ? index + 1 : 0;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = props.items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleTabClick(props.items[index]);
      return;
    default:
      return;
  }
  
  // Focus the new tab
  const newTab = tabRefs.value[newIndex];
  if (newTab) {
    newTab.focus();
  }
};

const getTabClasses = (tab) => [
  'tab-button',
  `tab-button--${props.variant}`,
  `tab-button--${props.size}`,
  {
    'tab-button--active': isActive(tab),
    'tab-button--disabled': tab.disabled,
    'tab-button--closable': tab.closable
  }
];

const getBadgeClasses = (tab) => [
  'tab-badge',
  {
    'tab-badge--primary': !tab.badgeVariant || tab.badgeVariant === 'primary',
    'tab-badge--secondary': tab.badgeVariant === 'secondary',
    'tab-badge--success': tab.badgeVariant === 'success',
    'tab-badge--warning': tab.badgeVariant === 'warning',
    'tab-badge--error': tab.badgeVariant === 'error'
  }
];

const updateIndicator = async () => {
  if (props.variant !== 'underline') return;
  
  await nextTick();
  
  const activeIndex = activeTabIndex.value;
  if (activeIndex === -1 || !tabRefs.value[activeIndex]) {
    indicatorStyle.value = { display: 'none' };
    return;
  }
  
  const activeTab = tabRefs.value[activeIndex];
  const tabList = activeTab.parentElement;
  
  const tabRect = activeTab.getBoundingClientRect();
  const listRect = tabList.getBoundingClientRect();
  
  indicatorStyle.value = {
    width: `${tabRect.width}px`,
    transform: `translateX(${tabRect.left - listRect.left}px)`,
    display: 'block'
  };
};

const scrollLeft = () => {
  if (tabContainer.value) {
    tabContainer.value.scrollBy({ left: -200, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (tabContainer.value) {
    tabContainer.value.scrollBy({ left: 200, behavior: 'smooth' });
  }
};

const updateScrollButtons = () => {
  if (!tabContainer.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = tabContainer.value;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth;
};

// Watchers
watch(() => props.activeTab, updateIndicator);
watch(() => props.items, updateIndicator);

// Watch tab manager active tab changes
if (tabManager) {
  watch(() => tabManager.activeTab.value, (newTab) => {
    updateIndicator();
    emit('tab-change', props.items.find(tab => tab.id === newTab));
  });
}

// Lifecycle
onMounted(() => {
  updateIndicator();
  updateScrollButtons();
  
  if (tabContainer.value) {
    tabContainer.value.addEventListener('scroll', updateScrollButtons);
  }
  
  window.addEventListener('resize', updateIndicator);
});

onUnmounted(() => {
  if (tabContainer.value) {
    tabContainer.value.removeEventListener('scroll', updateScrollButtons);
  }
  
  window.removeEventListener('resize', updateIndicator);
});

// Expose tab manager methods for parent components
defineExpose({
  tabManager,
  setActiveTab: tabManager?.setActiveTab,
  goToPreviousTab: tabManager?.goToPreviousTab,
  preloadTab: tabManager?.preloadTab,
  preloadAllTabs: tabManager?.preloadAllTabs,
  resetTabState: tabManager?.resetTabState,
  updateIndicator,
  scrollLeft,
  scrollRight
});
</script>

<style scoped>
.tab-navigation {
  @apply relative;
}

.tab-container {
  @apply relative overflow-x-auto scrollbar-hide;
}

.tab-list {
  @apply relative flex;
}

/* Tab Button Base Styles */
.tab-button {
  @apply relative inline-flex items-center justify-center;
  @apply font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply whitespace-nowrap;
}

/* Size Variants */
.tab-button--sm {
  @apply px-3 py-2 text-sm;
}

.tab-button--md {
  @apply px-4 py-3 text-base;
}

.tab-button--lg {
  @apply px-6 py-4 text-lg;
}

/* Style Variants */
.tab-button--underline {
  @apply border-b-2 border-transparent text-neutral-600;
  @apply hover:text-neutral-900 hover:border-neutral-300;
}

.tab-button--underline.tab-button--active {
  @apply text-primary-600 border-primary-600;
}

.tab-button--pills {
  @apply rounded-full text-neutral-600 bg-transparent;
  @apply hover:text-neutral-900 hover:bg-neutral-100;
}

.tab-button--pills.tab-button--active {
  @apply text-primary-600 bg-primary-100;
}

.tab-button--buttons {
  @apply rounded-md text-neutral-600 bg-transparent border border-transparent;
  @apply hover:text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300;
}

.tab-button--buttons.tab-button--active {
  @apply text-primary-600 bg-primary-50 border-primary-200;
}

/* Tab Elements */
.tab-icon {
  @apply w-4 h-4 mr-2 flex-shrink-0;
}

.tab-label {
  @apply truncate;
}

.tab-badge {
  @apply ml-2 inline-flex items-center justify-center;
  @apply px-2 py-0.5 text-xs font-medium rounded-full;
}

.tab-badge--primary {
  @apply bg-primary-100 text-primary-800;
}

.tab-badge--secondary {
  @apply bg-neutral-100 text-neutral-800;
}

.tab-badge--success {
  @apply bg-success-100 text-success-800;
}

.tab-badge--warning {
  @apply bg-warning-100 text-warning-800;
}

.tab-badge--error {
  @apply bg-error-100 text-error-800;
}

.tab-close {
  @apply ml-2 p-0.5 rounded-sm text-neutral-400;
  @apply hover:text-neutral-600 hover:bg-neutral-200;
  @apply focus:outline-none focus:ring-1 focus:ring-primary-500;
}

/* Tab Indicator */
.tab-indicator {
  @apply absolute bottom-0 left-0 h-0.5 bg-primary-600;
  @apply transition-all duration-200 ease-out;
  display: none;
}

.tab-navigation .tab-button--underline ~ .tab-indicator {
  display: block;
}

/* Scroll Buttons */
.scroll-buttons {
  @apply absolute right-0 top-0 bottom-0 flex items-center space-x-1;
  @apply bg-gradient-to-l from-white via-white to-transparent;
  @apply pl-4;
}

.scroll-button {
  @apply p-1 rounded-md text-neutral-600;
  @apply hover:text-neutral-900 hover:bg-neutral-100;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .tab-button--sm {
    @apply px-2 py-1.5 text-xs;
  }
  
  .tab-button--md {
    @apply px-3 py-2 text-sm;
  }
  
  .tab-button--lg {
    @apply px-4 py-3 text-base;
  }
  
  .tab-icon {
    @apply w-3 h-3 mr-1;
  }
}

/* Dark Theme Adjustments */
.theme-dark .tab-button--underline {
  @apply text-neutral-400 hover:text-neutral-200 hover:border-neutral-600;
}

.theme-dark .tab-button--pills {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800;
}

.theme-dark .tab-button--buttons {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600;
}

.theme-dark .tab-close {
  @apply text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700;
}

.theme-dark .scroll-buttons {
  @apply bg-gradient-to-l from-neutral-900 via-neutral-900 to-transparent;
}

.theme-dark .scroll-button {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800;
}

/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>