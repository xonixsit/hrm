<template>
  <nav 
    :class="['breadcrumb-navigation', `breadcrumb-navigation--${mobileMode}`, props.class]" 
    aria-label="Breadcrumb"
    role="navigation"
    ref="breadcrumbNav"
  >
    <!-- Structured Data for SEO will be injected via head management -->

    <!-- Mobile Current-Only Mode -->
    <div v-if="mobileMode === 'current-only'" class="breadcrumb-mobile-current sm:hidden">
      <button
        v-if="hasParentItems"
        @click="toggleMobileExpanded"
        @keydown="handleMobileToggleKeydown"
        class="breadcrumb-back-button"
        :aria-expanded="mobileExpanded"
        aria-label="Show full breadcrumb navigation"
        ref="mobileToggleButton"
      >
        <Icon name="chevron-left" class="w-4 h-4" />
        <span class="sr-only">Back</span>
      </button>
      
      <span class="breadcrumb-current-label">
        <Icon
          v-if="currentItem?.icon"
          :name="currentItem.icon"
          class="breadcrumb-icon"
          aria-hidden="true"
        />
        {{ currentItem?.label }}
      </span>
    </div>

    <!-- Full Breadcrumb List -->
    <ol 
      :class="[
        'breadcrumb-list',
        {
          'hidden sm:flex': mobileMode === 'current-only' && !mobileExpanded,
          'flex': mobileMode !== 'current-only' || mobileExpanded
        }
      ]" 
      role="list"
      ref="breadcrumbList"
    >
      <li
        v-for="(item, index) in displayItems"
        :key="item.href || item.label || index"
        class="breadcrumb-item"
        role="listitem"
        :itemscope="structuredData"
        :itemtype="structuredData ? 'https://schema.org/ListItem' : undefined"
      >
        <!-- Structured Data Properties -->
        <meta v-if="structuredData" :content="index + 1" itemprop="position">
        
        <!-- Separator -->
        <Icon
          v-if="index > 0"
          :name="separatorIcon"
          class="breadcrumb-separator"
          aria-hidden="true"
        />

        <!-- Breadcrumb Link/Text -->
        <component
          :is="getComponentType(item)"
          :href="item.href"
          :to="item.to"
          :class="getBreadcrumbClasses(item, index)"
          :aria-current="item.current ? 'page' : undefined"
          :tabindex="getTabIndex(item, index)"
          :role="getRole(item)"
          :aria-label="getAriaLabel(item, index)"
          :itemprop="structuredData ? 'item' : undefined"
          :ref="el => setBreadcrumbRef(el, index)"
          @click="handleClick(item, $event)"
          @keydown="handleKeydown(item, $event, index)"
          @focus="handleFocus(item, index)"
          @blur="handleBlur(item, index)"
        >
          <!-- Icon -->
          <Icon
            v-if="item.icon"
            :name="item.icon"
            class="breadcrumb-icon"
            aria-hidden="true"
          />
          
          <!-- Label -->
          <span 
            class="breadcrumb-label"
            :itemprop="structuredData ? 'name' : undefined"
          >
            {{ item.label }}
          </span>
        </component>
      </li>
    </ol>

    <!-- History Dropdown (if enabled) -->
    <div v-if="showHistory && breadcrumbHistory.length > 0" class="breadcrumb-history">
      <button
        @click="toggleHistoryDropdown"
        @keydown="handleHistoryToggleKeydown"
        class="breadcrumb-history-toggle"
        :aria-expanded="historyDropdownOpen"
        aria-label="Show breadcrumb history"
        ref="historyToggleButton"
      >
        <Icon name="clock" class="w-4 h-4" />
      </button>
      
      <div
        v-if="historyDropdownOpen"
        class="breadcrumb-history-dropdown"
        role="menu"
        ref="historyDropdown"
        @keydown="handleHistoryDropdownKeydown"
      >
        <div class="breadcrumb-history-header">Recent Navigation</div>
        <button
          v-for="(historyItem, index) in breadcrumbHistory.slice(0, 5)"
          :key="index"
          @click="navigateToHistoryItem(historyItem)"
          @keydown="handleHistoryItemKeydown($event, index)"
          class="breadcrumb-history-item"
          role="menuitem"
          :ref="el => setHistoryItemRef(el, index)"
          :tabindex="index === focusedHistoryIndex ? 0 : -1"
        >
          <div class="breadcrumb-history-path">
            <span
              v-for="(breadcrumb, bIndex) in historyItem.breadcrumbs"
              :key="bIndex"
              class="breadcrumb-history-segment"
            >
              {{ breadcrumb.label }}
              <Icon
                v-if="bIndex < historyItem.breadcrumbs.length - 1"
                name="chevron-right"
                class="w-3 h-3 inline"
              />
            </span>
          </div>
          <div class="breadcrumb-history-time">
            {{ formatHistoryTime(historyItem.timestamp) }}
          </div>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import Icon from '@/Components/Base/Icon.vue';

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
  
  // Maximum number of items to show before truncating
  maxItems: {
    type: Number,
    default: 5
  },
  
  // Show home icon for first item
  showHomeIcon: {
    type: Boolean,
    default: true
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  },

  // Enable keyboard navigation
  keyboardNavigation: {
    type: Boolean,
    default: true
  },

  // Mobile display mode: 'full', 'compact', 'current-only'
  mobileMode: {
    type: String,
    default: 'compact',
    validator: (value) => ['full', 'compact', 'current-only'].includes(value)
  },

  // Enable breadcrumb history dropdown
  showHistory: {
    type: Boolean,
    default: false
  },

  // Custom separator icon
  separatorIcon: {
    type: String,
    default: 'chevron-right'
  },

  // Enable structured data markup
  structuredData: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click', 'focus', 'blur', 'keydown']);

// Reactive state
const focusedIndex = ref(-1);
const focusedHistoryIndex = ref(0);
const mobileExpanded = ref(false);
const historyDropdownOpen = ref(false);
const breadcrumbHistory = ref([]);

// Template refs
const breadcrumbNav = ref(null);
const breadcrumbList = ref(null);
const mobileToggleButton = ref(null);
const historyToggleButton = ref(null);
const historyDropdown = ref(null);
const breadcrumbRefs = ref([]);
const historyItemRefs = ref([]);

// Computed properties
const processedItems = computed(() => {
  let items = [...props.items];
  
  // Add home icon to first item if enabled
  if (props.showHomeIcon && items.length > 0 && !items[0].icon) {
    items[0] = {
      ...items[0],
      icon: 'home'
    };
  }
  
  // Truncate items if necessary
  if (items.length > props.maxItems) {
    const firstItem = items[0];
    const lastItems = items.slice(-(props.maxItems - 2));
    const ellipsisItem = {
      label: '...',
      ellipsis: true
    };
    
    items = [firstItem, ellipsisItem, ...lastItems];
  }
  
  return items;
});

// Methods
const handleClick = (item, event) => {
  if (item.ellipsis) {
    event.preventDefault();
    return;
  }
  
  emit('click', { item, event });
  
  // Handle custom click handler
  if (item.onClick) {
    event.preventDefault();
    item.onClick(item);
  }
};



const handleFocus = (item, index) => {
  focusedIndex.value = index;
  emit('focus', { item, index });
};

const handleBlur = (item, index) => {
  focusedIndex.value = -1;
  emit('blur', { item, index });
};

const navigateToPrevious = () => {
  const currentIndex = focusedIndex.value;
  const clickableItems = getClickableItems();
  const currentClickableIndex = clickableItems.findIndex(item => item.index === currentIndex);
  
  if (currentClickableIndex > 0) {
    const previousItem = clickableItems[currentClickableIndex - 1];
    focusItem(previousItem.index);
  }
};

const navigateToNext = () => {
  const currentIndex = focusedIndex.value;
  const clickableItems = getClickableItems();
  const currentClickableIndex = clickableItems.findIndex(item => item.index === currentIndex);
  
  if (currentClickableIndex < clickableItems.length - 1) {
    const nextItem = clickableItems[currentClickableIndex + 1];
    focusItem(nextItem.index);
  }
};

const navigateToFirst = () => {
  const clickableItems = getClickableItems();
  if (clickableItems.length > 0) {
    focusItem(clickableItems[0].index);
  }
};

const navigateToLast = () => {
  const clickableItems = getClickableItems();
  if (clickableItems.length > 0) {
    focusItem(clickableItems[clickableItems.length - 1].index);
  }
};

const getClickableItems = () => {
  return processedItems.value
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.ellipsis && !item.current && (item.href || item.to || item.onClick));
};

const focusItem = (index) => {
  const breadcrumbItems = document.querySelectorAll('.breadcrumb-link');
  if (breadcrumbItems[index]) {
    breadcrumbItems[index].focus();
  }
};

const getComponentType = (item) => {
  if (item.ellipsis || item.current) {
    return 'span';
  }
  
  if (item.to) {
    return Link;
  }
  
  if (item.href) {
    return 'a';
  }
  
  if (item.onClick) {
    return 'button';
  }
  
  return 'span';
};

// getTabIndex function moved to line 664 with enhanced functionality

const getRole = (item) => {
  if (item.ellipsis) {
    return 'presentation';
  }
  
  if (item.onClick && !item.href && !item.to) {
    return 'button';
  }
  
  return undefined;
};

const getAriaLabel = (item, index) => {
  if (item.ellipsis) {
    return 'More breadcrumb items';
  }
  
  if (item.current) {
    return `Current page: ${item.label}`;
  }
  
  if (index === 0) {
    return `Go to ${item.label}`;
  }
  
  return `Go to ${item.label}`;
};

const getBreadcrumbClasses = (item, index) => [
  'breadcrumb-link',
  {
    'breadcrumb-link--active': item.current,
    'breadcrumb-link--clickable': !item.ellipsis && !item.current && (item.href || item.to || item.onClick),
    'breadcrumb-link--ellipsis': item.ellipsis,
    'breadcrumb-link--first': index === 0,
    'breadcrumb-link--last': index === processedItems.value.length - 1,
    'breadcrumb-link--focused': focusedIndex.value === index
  }
];

// New computed properties for enhanced features
const currentItem = computed(() => {
  return processedItems.value.find(item => item.current);
});

const hasParentItems = computed(() => {
  return processedItems.value.length > 1;
});

const displayItems = computed(() => {
  if (props.mobileMode === 'compact' && processedItems.value.length > 3) {
    // On mobile, show first, ellipsis, and current
    const first = processedItems.value[0];
    const current = processedItems.value.find(item => item.current);
    const beforeCurrent = processedItems.value[processedItems.value.length - 2];
    
    if (processedItems.value.length > 3) {
      return [
        first,
        { label: '...', ellipsis: true },
        ...(beforeCurrent && !beforeCurrent.current ? [beforeCurrent] : []),
        current
      ].filter(Boolean);
    }
  }
  
  return processedItems.value;
});

const structuredDataJson = computed(() => {
  if (!props.structuredData) return '';
  
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": processedItems.value
      .filter(item => !item.ellipsis)
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": item.href || item.to || window.location.href
      }))
  };
  
  return JSON.stringify(breadcrumbList);
});

// New methods for enhanced features
const toggleMobileExpanded = () => {
  mobileExpanded.value = !mobileExpanded.value;
};

const toggleHistoryDropdown = () => {
  historyDropdownOpen.value = !historyDropdownOpen.value;
};

const navigateToHistoryItem = (historyItem) => {
  if (historyItem.url) {
    window.location.href = historyItem.url;
  }
  historyDropdownOpen.value = false;
};

const formatHistoryTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Enhanced keyboard navigation methods
const setBreadcrumbRef = (el, index) => {
  if (el) {
    breadcrumbRefs.value[index] = el;
  }
};

const setHistoryItemRef = (el, index) => {
  if (el) {
    historyItemRefs.value[index] = el;
  }
};

const handleKeydown = (item, event, index) => {
  if (!props.keyboardNavigation) return;

  emit('keydown', { item, event, index });

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleClick(item, event);
      break;
    
    case 'ArrowLeft':
      event.preventDefault();
      navigateToPrevious();
      break;
    
    case 'ArrowRight':
      event.preventDefault();
      navigateToNext();
      break;
    
    case 'Home':
      event.preventDefault();
      navigateToFirst();
      break;
    
    case 'End':
      event.preventDefault();
      navigateToLast();
      break;
      
    case 'Escape':
      if (historyDropdownOpen.value) {
        event.preventDefault();
        historyDropdownOpen.value = false;
        historyToggleButton.value?.focus();
      }
      break;
  }
};

const handleMobileToggleKeydown = (event) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      toggleMobileExpanded();
      break;
    case 'Escape':
      if (mobileExpanded.value) {
        event.preventDefault();
        mobileExpanded.value = false;
      }
      break;
  }
};

const handleHistoryToggleKeydown = (event) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      toggleHistoryDropdown();
      if (historyDropdownOpen.value && historyItemRefs.value[0]) {
        focusedHistoryIndex.value = 0;
        historyItemRefs.value[0].focus();
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!historyDropdownOpen.value) {
        toggleHistoryDropdown();
      }
      if (historyItemRefs.value[0]) {
        focusedHistoryIndex.value = 0;
        historyItemRefs.value[0].focus();
      }
      break;
    case 'Escape':
      if (historyDropdownOpen.value) {
        event.preventDefault();
        historyDropdownOpen.value = false;
      }
      break;
  }
};

const handleHistoryDropdownKeydown = (event) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      historyDropdownOpen.value = false;
      historyToggleButton.value?.focus();
      break;
    case 'Tab':
      if (event.shiftKey && focusedHistoryIndex.value === 0) {
        event.preventDefault();
        historyDropdownOpen.value = false;
        historyToggleButton.value?.focus();
      } else if (!event.shiftKey && focusedHistoryIndex.value === Math.min(4, breadcrumbHistory.value.length - 1)) {
        event.preventDefault();
        historyDropdownOpen.value = false;
      }
      break;
  }
};

const handleHistoryItemKeydown = (event, index) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      navigateToHistoryItem(breadcrumbHistory.value[index]);
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (index > 0) {
        focusedHistoryIndex.value = index - 1;
        historyItemRefs.value[index - 1]?.focus();
      } else {
        historyDropdownOpen.value = false;
        historyToggleButton.value?.focus();
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      const maxIndex = Math.min(4, breadcrumbHistory.value.length - 1);
      if (index < maxIndex) {
        focusedHistoryIndex.value = index + 1;
        historyItemRefs.value[index + 1]?.focus();
      }
      break;
    case 'Home':
      event.preventDefault();
      focusedHistoryIndex.value = 0;
      historyItemRefs.value[0]?.focus();
      break;
    case 'End':
      event.preventDefault();
      const lastIndex = Math.min(4, breadcrumbHistory.value.length - 1);
      focusedHistoryIndex.value = lastIndex;
      historyItemRefs.value[lastIndex]?.focus();
      break;
    case 'Escape':
      event.preventDefault();
      historyDropdownOpen.value = false;
      historyToggleButton.value?.focus();
      break;
  }
};

const getTabIndex = (item, index) => {
  if (item.ellipsis || item.current) {
    return -1;
  }
  
  if (item.href || item.to || item.onClick) {
    return focusedIndex.value === index ? 0 : 0; // All interactive items should be focusable
  }
  
  return -1;
};
</script>

<style scoped>
.breadcrumb-navigation {
  @apply text-sm;
}

.breadcrumb-list {
  @apply flex items-center space-x-1 flex-wrap;
}

.breadcrumb-item {
  @apply flex items-center;
}

.breadcrumb-separator {
  @apply w-4 h-4 text-gray-400 mx-2 flex-shrink-0;
}

.breadcrumb-link {
  @apply inline-flex items-center space-x-1 px-2 py-1 rounded-md transition-colors;
  @apply text-gray-600 hover:text-teal-700;
  @apply max-w-xs truncate;
}

.breadcrumb-link--clickable {
  @apply hover:bg-teal-50 cursor-pointer;
}

.breadcrumb-link--active {
  @apply text-teal-700 font-medium;
  @apply cursor-default;
}

.breadcrumb-link--ellipsis {
  @apply cursor-default hover:bg-transparent hover:text-neutral-600;
  @apply font-bold;
}

.breadcrumb-link--first .breadcrumb-icon {
  @apply text-neutral-500;
}

.breadcrumb-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.breadcrumb-label {
  @apply truncate;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .breadcrumb-navigation {
    @apply text-xs;
  }
  
  .breadcrumb-separator {
    @apply w-3 h-3 mx-1;
  }
  
  .breadcrumb-link {
    @apply px-1 py-0.5 max-w-24;
  }
  
  .breadcrumb-icon {
    @apply w-3 h-3;
  }
}

/* Focus styles for keyboard navigation */
.breadcrumb-link:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}

.breadcrumb-link--focused {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

.breadcrumb-link--clickable:focus {
  @apply bg-neutral-100;
}

/* Mobile current-only mode */
.breadcrumb-mobile-current {
  @apply flex items-center space-x-2 py-2;
}

.breadcrumb-back-button {
  @apply p-1 rounded-md hover:bg-neutral-100 transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.breadcrumb-current-label {
  @apply flex items-center space-x-1 font-medium text-neutral-900;
}

/* History dropdown */
.breadcrumb-history {
  @apply relative ml-2;
}

.breadcrumb-history-toggle {
  @apply p-1 rounded-md hover:bg-neutral-100 transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply text-neutral-500 hover:text-neutral-700;
}

.breadcrumb-history-dropdown {
  @apply absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-neutral-200;
  @apply py-2 z-50 max-h-96 overflow-y-auto;
}

.breadcrumb-history-header {
  @apply px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-100;
}

.breadcrumb-history-item {
  @apply w-full px-3 py-2 text-left hover:bg-neutral-50 transition-colors;
  @apply focus:outline-none focus:bg-neutral-50;
}

.breadcrumb-history-path {
  @apply text-sm text-neutral-900 mb-1;
}

.breadcrumb-history-segment {
  @apply inline-flex items-center space-x-1;
}

.breadcrumb-history-time {
  @apply text-xs text-neutral-500;
}

/* Mobile mode variations */
.breadcrumb-navigation--compact .breadcrumb-list {
  @apply sm:flex;
}

.breadcrumb-navigation--current-only .breadcrumb-list {
  @apply hidden sm:flex;
}

.breadcrumb-navigation--full .breadcrumb-list {
  @apply flex;
}

/* Enhanced responsive behavior */
@media (max-width: 640px) {
  .breadcrumb-navigation--compact .breadcrumb-item:not(:first-child):not(:last-child):not(.breadcrumb-item--ellipsis) {
    @apply hidden;
  }
  
  .breadcrumb-history-dropdown {
    @apply w-screen max-w-sm right-0;
  }
}

/* Dark theme adjustments */
.theme-dark .breadcrumb-link {
  @apply text-neutral-400 hover:text-neutral-200;
}

.theme-dark .breadcrumb-link--active {
  @apply text-neutral-200;
}

.theme-dark .breadcrumb-link--clickable {
  @apply hover:bg-neutral-800;
}

.theme-dark .breadcrumb-link--clickable:focus {
  @apply bg-neutral-800;
}

.theme-dark .breadcrumb-separator {
  @apply text-neutral-600;
}

.theme-dark .breadcrumb-link:focus {
  @apply ring-blue-400;
}

.theme-dark .breadcrumb-link--focused {
  @apply ring-blue-400;
}

.theme-dark .breadcrumb-back-button {
  @apply hover:bg-neutral-800;
}

.theme-dark .breadcrumb-current-label {
  @apply text-neutral-200;
}

.theme-dark .breadcrumb-history-toggle {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800;
}

.theme-dark .breadcrumb-history-dropdown {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .breadcrumb-history-header {
  @apply text-neutral-400 border-neutral-700;
}

.theme-dark .breadcrumb-history-item {
  @apply hover:bg-neutral-700 focus:bg-neutral-700;
}

.theme-dark .breadcrumb-history-path {
  @apply text-neutral-200;
}

.theme-dark .breadcrumb-history-time {
  @apply text-neutral-400;
}
</style>