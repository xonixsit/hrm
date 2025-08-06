import { ref, computed, watch, nextTick } from 'vue';

/**
 * Composable for managing tab state, content, and URL synchronization
 * @param {Object} options - Configuration options
 * @param {Array} options.tabs - Array of tab objects
 * @param {String} options.defaultTab - Default active tab ID
 * @param {Boolean} options.urlSync - Whether to sync with URL parameters
 * @param {String} options.urlParam - URL parameter name for tab state
 * @param {Boolean} options.lazy - Whether to enable lazy loading
 * @param {Boolean} options.persist - Whether to persist tab state
 * @param {String} options.storageKey - Local storage key for persistence
 */
export function useTabs(options = {}) {
  const {
    tabs = [],
    defaultTab = null,
    urlSync = false,
    urlParam = 'tab',
    lazy = false,
    persist = false,
    storageKey = 'tab-state'
  } = options;

  // Reactive state
  const activeTab = ref(defaultTab);
  const loadedTabs = ref(new Set());
  const tabHistory = ref([]);

  // Initialize active tab from various sources
  const initializeActiveTab = () => {
    let initialTab = defaultTab;

    // 1. Check URL parameter if URL sync is enabled
    if (urlSync && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get(urlParam);
      if (urlTab && tabs.some(tab => tab.id === urlTab)) {
        initialTab = urlTab;
      }
    }

    // 2. Check localStorage if persistence is enabled
    if (persist && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && tabs.some(tab => tab.id === stored)) {
          initialTab = stored;
        }
      } catch (error) {
        console.warn('Failed to read tab state from localStorage:', error);
      }
    }

    // 3. Fall back to first available tab
    if (!initialTab && tabs.length > 0) {
      const firstAvailable = tabs.find(tab => !tab.disabled);
      initialTab = firstAvailable?.id || tabs[0]?.id;
    }

    activeTab.value = initialTab;
    
    // Mark initial tab as loaded if not lazy
    if (!lazy && initialTab) {
      loadedTabs.value.add(initialTab);
    }
  };

  // Computed properties
  const currentTab = computed(() => {
    return tabs.find(tab => tab.id === activeTab.value);
  });

  const availableTabs = computed(() => {
    return tabs.filter(tab => !tab.hidden);
  });

  const enabledTabs = computed(() => {
    return availableTabs.value.filter(tab => !tab.disabled);
  });

  const isTabLoaded = computed(() => {
    return (tabId) => {
      if (!lazy) return true;
      return loadedTabs.value.has(tabId);
    };
  });

  const canNavigateToTab = computed(() => {
    return (tabId) => {
      if (!tabId) return false;
      const tab = tabs.find(t => t.id === tabId);
      return Boolean(tab && !tab.disabled && !tab.hidden);
    };
  });

  // Methods
  const setActiveTab = async (tabId, options = {}) => {
    const { force = false, addToHistory = true } = options;

    // Validate tab exists and is navigable
    if (!force && !canNavigateToTab.value(tabId)) {
      console.warn(`Cannot navigate to tab: ${tabId}`);
      return false;
    }

    const previousTab = activeTab.value;
    
    // Add to history before changing active tab
    if (addToHistory && previousTab && previousTab !== tabId) {
      tabHistory.value.push(previousTab);
      // Limit history size
      if (tabHistory.value.length > 10) {
        tabHistory.value.shift();
      }
    }

    // Set the active tab
    activeTab.value = tabId;

    // Mark tab as loaded for lazy loading
    if (lazy && tabId) {
      loadedTabs.value.add(tabId);
    }

    // Update URL if sync is enabled
    if (urlSync && typeof window !== 'undefined') {
      await updateUrl(tabId);
    }

    // Persist to localStorage if enabled
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, tabId);
      } catch (error) {
        console.warn('Failed to persist tab state:', error);
      }
    }

    return true;
  };

  const updateUrl = async (tabId) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location);
    
    if (tabId && tabId !== defaultTab) {
      url.searchParams.set(urlParam, tabId);
    } else {
      url.searchParams.delete(urlParam);
    }

    // Try to use Inertia router if available, otherwise use history API
    try {
      const { router } = await import('@inertiajs/vue3');
      if (router) {
        router.get(url.pathname + url.search, {}, {
          preserveState: true,
          preserveScroll: true,
          replace: true
        });
        return;
      }
    } catch (error) {
      // Inertia not available, fall back to history API
    }
    
    window.history.replaceState({}, '', url.toString());
  };

  const goToPreviousTab = () => {
    if (tabHistory.value.length > 0) {
      const previousTab = tabHistory.value.pop();
      setActiveTab(previousTab, { addToHistory: false });
      return true;
    }
    return false;
  };

  const preloadTab = (tabId) => {
    if (lazy && canNavigateToTab.value(tabId)) {
      loadedTabs.value.add(tabId);
    }
  };

  const preloadAllTabs = () => {
    if (lazy) {
      enabledTabs.value.forEach(tab => {
        loadedTabs.value.add(tab.id);
      });
    }
  };

  const resetTabState = () => {
    activeTab.value = defaultTab;
    loadedTabs.value.clear();
    tabHistory.value = [];
    
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear persisted tab state:', error);
      }
    }
  };

  const getTabIndex = (tabId) => {
    return availableTabs.value.findIndex(tab => tab.id === tabId);
  };

  const getNextTab = (currentTabId = activeTab.value) => {
    const currentIndex = getTabIndex(currentTabId);
    if (currentIndex === -1) return null;

    for (let i = 1; i < availableTabs.value.length; i++) {
      const nextIndex = (currentIndex + i) % availableTabs.value.length;
      const nextTab = availableTabs.value[nextIndex];
      if (canNavigateToTab.value(nextTab.id)) {
        return nextTab;
      }
    }
    return null;
  };

  const getPreviousTab = (currentTabId = activeTab.value) => {
    const currentIndex = getTabIndex(currentTabId);
    if (currentIndex === -1) return null;

    for (let i = 1; i < availableTabs.value.length; i++) {
      const prevIndex = (currentIndex - i + availableTabs.value.length) % availableTabs.value.length;
      const prevTab = availableTabs.value[prevIndex];
      if (canNavigateToTab.value(prevTab.id)) {
        return prevTab;
      }
    }
    return null;
  };

  // Watchers
  watch(() => tabs, () => {
    // Re-initialize if tabs change
    if (tabs.length > 0 && !activeTab.value) {
      initializeActiveTab();
    }
  }, { immediate: true });

  // Initialize on mount
  if (typeof window !== 'undefined') {
    nextTick(() => {
      initializeActiveTab();
    });
  }

  return {
    // State
    activeTab,
    loadedTabs,
    tabHistory,
    
    // Computed
    currentTab,
    availableTabs,
    enabledTabs,
    isTabLoaded,
    canNavigateToTab,
    
    // Methods
    setActiveTab,
    goToPreviousTab,
    preloadTab,
    preloadAllTabs,
    resetTabState,
    getTabIndex,
    getNextTab,
    getPreviousTab,
    
    // Utilities
    initializeActiveTab
  };
}