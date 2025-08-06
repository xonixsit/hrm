<template>
  <div :class="['tab-content', props.class]">
    <!-- Tab Panels -->
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :id="tab.panelId || `panel-${tab.id}`"
      :class="getPanelClasses(tab)"
      role="tabpanel"
      :aria-labelledby="tab.id"
      :aria-hidden="!isActive(tab)"
      :tabindex="isActive(tab) ? 0 : -1"
    >
      <!-- Lazy Loading Logic -->
      <template v-if="shouldRenderTab(tab)">
        <!-- Custom slot for tab content -->
        <slot
          :name="`tab-${tab.id}`"
          :tab="tab"
          :isActive="isActive(tab)"
          :isLoaded="isTabLoaded(tab.id)"
        >
          <!-- Fallback content -->
          <div v-if="tab.content" v-html="tab.content" />
          <div v-else-if="tab.component">
            <component
              :is="tab.component"
              v-bind="tab.props || {}"
              :tab="tab"
              :isActive="isActive(tab)"
            />
          </div>
          <div v-else class="tab-panel-empty">
            <p class="text-neutral-500">No content available for this tab.</p>
          </div>
        </slot>
      </template>
      
      <!-- Loading State -->
      <div v-else-if="isActive(tab) && lazy" class="tab-panel-loading">
        <slot name="loading" :tab="tab">
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span class="ml-3 text-neutral-600">Loading {{ tab.label }}...</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(tab => 
        typeof tab === 'object' && 
        tab.id && 
        typeof tab.id === 'string'
      );
    }
  },
  
  activeTab: {
    type: String,
    required: true
  },
  
  lazy: {
    type: Boolean,
    default: false
  },
  
  loadedTabs: {
    type: Set,
    default: () => new Set()
  },
  
  keepAlive: {
    type: Boolean,
    default: false
  },
  
  transition: {
    type: String,
    default: 'fade'
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['tab-load', 'tab-unload']);

// Computed properties
const isActive = (tab) => {
  return tab.id === props.activeTab;
};

const isTabLoaded = (tabId) => {
  if (!props.lazy) return true;
  return props.loadedTabs.has(tabId);
};

const shouldRenderTab = (tab) => {
  if (!props.lazy) return true;
  
  // Always render active tab
  if (isActive(tab)) return true;
  
  // Render if already loaded and keepAlive is enabled
  if (props.keepAlive && isTabLoaded(tab.id)) return true;
  
  // Don't render if not loaded
  return isTabLoaded(tab.id);
};

const getPanelClasses = (tab) => [
  'tab-panel',
  `tab-panel--${props.transition}`,
  {
    'tab-panel--active': isActive(tab),
    'tab-panel--hidden': !isActive(tab),
    'tab-panel--loading': isActive(tab) && props.lazy && !isTabLoaded(tab.id),
    'tab-panel--keep-alive': props.keepAlive && isTabLoaded(tab.id)
  }
];

// Methods
const loadTab = async (tabId) => {
  if (!props.lazy || isTabLoaded(tabId)) return;
  
  const tab = props.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  // Add to loaded tabs
  props.loadedTabs.add(tabId);
  
  // Emit load event
  emit('tab-load', { tab, tabId });
  
  // If tab has a load function, call it
  if (typeof tab.onLoad === 'function') {
    try {
      await tab.onLoad(tab);
    } catch (error) {
      console.error(`Error loading tab ${tabId}:`, error);
    }
  }
};

const unloadTab = (tabId) => {
  if (!props.lazy || !props.keepAlive) return;
  
  const tab = props.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  // Remove from loaded tabs
  props.loadedTabs.delete(tabId);
  
  // Emit unload event
  emit('tab-unload', { tab, tabId });
  
  // If tab has an unload function, call it
  if (typeof tab.onUnload === 'function') {
    try {
      tab.onUnload(tab);
    } catch (error) {
      console.error(`Error unloading tab ${tabId}:`, error);
    }
  }
};

// Watchers
watch(() => props.activeTab, async (newTabId, oldTabId) => {
  if (newTabId && props.lazy) {
    await nextTick();
    await loadTab(newTabId);
  }
  
  // Unload previous tab if not keeping alive
  if (oldTabId && !props.keepAlive && props.lazy) {
    unloadTab(oldTabId);
  }
}, { immediate: true });

// Expose methods for parent components
defineExpose({
  loadTab,
  unloadTab,
  isTabLoaded,
  shouldRenderTab
});
</script>

<style scoped>
.tab-content {
  @apply relative;
}

.tab-panel {
  @apply w-full;
}

.tab-panel--hidden {
  @apply hidden;
}

.tab-panel--active {
  @apply block;
}

.tab-panel--loading {
  @apply block;
}

.tab-panel-empty {
  @apply flex items-center justify-center py-12;
}

.tab-panel-loading {
  @apply flex items-center justify-center py-8;
}

/* Transition Styles */
.tab-panel--fade {
  @apply transition-opacity duration-200 ease-in-out;
}

.tab-panel--fade.tab-panel--hidden {
  @apply opacity-0;
}

.tab-panel--fade.tab-panel--active {
  @apply opacity-100;
}

.tab-panel--slide {
  @apply transition-transform duration-200 ease-in-out;
}

.tab-panel--slide.tab-panel--hidden {
  @apply transform translate-x-full;
}

.tab-panel--slide.tab-panel--active {
  @apply transform translate-x-0;
}

/* Keep Alive Styles */
.tab-panel--keep-alive.tab-panel--hidden {
  @apply absolute inset-0 invisible;
}

.tab-panel--keep-alive.tab-panel--active {
  @apply relative visible;
}

/* Loading Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>