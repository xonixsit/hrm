import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useTabs } from '@/composables/useTabs';

// Mock Inertia router
const mockRouter = {
  get: vi.fn()
};

vi.mock('@inertiajs/vue3', () => ({
  router: mockRouter
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
const mockLocation = {
  search: '',
  pathname: '/test',
  toString: () => '/test'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock URL constructor
global.URL = class URL {
  constructor(url) {
    this.pathname = mockLocation.pathname;
    this.search = mockLocation.search;
    this.searchParams = new URLSearchParams(mockLocation.search);
  }
  
  toString() {
    return this.pathname + this.search;
  }
};

// Mock history API
const mockHistory = {
  replaceState: vi.fn()
};

Object.defineProperty(window, 'history', {
  value: mockHistory
});

describe('useTabs', () => {
  const defaultTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3', disabled: true },
    { id: 'tab4', label: 'Tab 4', hidden: true }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('initializes with default tab', async () => {
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab2'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab2');
    });

    it('initializes with first available tab when no default', async () => {
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab1');
    });

    it('skips disabled tabs when finding first available', async () => {
      const tabsWithFirstDisabled = [
        { id: 'tab1', label: 'Tab 1', disabled: true },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' }
      ];

      const { activeTab, initializeActiveTab } = useTabs({
        tabs: tabsWithFirstDisabled
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab2');
    });

    it('computes current tab correctly', async () => {
      const { currentTab, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab2');

      expect(currentTab.value).toEqual({ id: 'tab2', label: 'Tab 2' });
    });

    it('computes available tabs excluding hidden ones', () => {
      const { availableTabs } = useTabs({
        tabs: defaultTabs
      });

      expect(availableTabs.value).toHaveLength(3);
      expect(availableTabs.value.find(tab => tab.id === 'tab4')).toBeUndefined();
    });

    it('computes enabled tabs excluding disabled ones', () => {
      const { enabledTabs } = useTabs({
        tabs: defaultTabs
      });

      expect(enabledTabs.value).toHaveLength(2);
      expect(enabledTabs.value.find(tab => tab.id === 'tab3')).toBeUndefined();
    });
  });

  describe('Tab Navigation', () => {
    it('sets active tab successfully', async () => {
      const { activeTab, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      const result = await setActiveTab('tab2');

      expect(result).toBe(true);
      expect(activeTab.value).toBe('tab2');
    });

    it('prevents navigation to disabled tabs', async () => {
      const { activeTab, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      const result = await setActiveTab('tab3'); // disabled tab

      expect(result).toBe(false);
      expect(activeTab.value).toBe('tab1');
    });

    it('prevents navigation to hidden tabs', async () => {
      const { activeTab, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      const result = await setActiveTab('tab4'); // hidden tab

      expect(result).toBe(false);
      expect(activeTab.value).toBe('tab1');
    });

    it('allows forced navigation to disabled tabs', async () => {
      const { activeTab, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      const result = await setActiveTab('tab3', { force: true });

      expect(result).toBe(true);
      expect(activeTab.value).toBe('tab3');
    });

    it('maintains tab history', async () => {
      const { tabHistory, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab2');
      await setActiveTab('tab1');

      expect(tabHistory.value).toEqual(['tab1', 'tab2']);
    });

    it('limits tab history size', async () => {
      const { tabHistory, setActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      // Add more than 10 items to history
      for (let i = 0; i < 12; i++) {
        await setActiveTab(i % 2 === 0 ? 'tab1' : 'tab2');
      }

      expect(tabHistory.value.length).toBeLessThanOrEqual(10);
    });

    it('navigates to previous tab', async () => {
      const { activeTab, setActiveTab, goToPreviousTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab2');
      const result = goToPreviousTab();

      expect(result).toBe(true);
      expect(activeTab.value).toBe('tab1');
    });

    it('returns false when no previous tab', () => {
      const { goToPreviousTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1'
      });

      const result = goToPreviousTab();

      expect(result).toBe(false);
    });
  });

  describe('Tab Navigation Helpers', () => {
    it('gets correct tab index', () => {
      const { getTabIndex } = useTabs({
        tabs: defaultTabs
      });

      expect(getTabIndex('tab2')).toBe(1);
      expect(getTabIndex('nonexistent')).toBe(-1);
    });

    it('gets next available tab', () => {
      const { getNextTab } = useTabs({
        tabs: defaultTabs
      });

      const nextTab = getNextTab('tab1');
      expect(nextTab?.id).toBe('tab2');
    });

    it('skips disabled tabs when getting next tab', () => {
      const tabsWithDisabled = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
        { id: 'tab3', label: 'Tab 3' }
      ];

      const { getNextTab } = useTabs({
        tabs: tabsWithDisabled
      });

      const nextTab = getNextTab('tab1');
      expect(nextTab?.id).toBe('tab3');
    });

    it('wraps around when getting next tab', () => {
      const { getNextTab } = useTabs({
        tabs: defaultTabs
      });

      const nextTab = getNextTab('tab2'); // tab3 is disabled, should wrap to tab1
      expect(nextTab?.id).toBe('tab1');
    });

    it('gets previous available tab', () => {
      const { getPreviousTab } = useTabs({
        tabs: defaultTabs
      });

      const prevTab = getPreviousTab('tab2');
      expect(prevTab?.id).toBe('tab1');
    });

    it('wraps around when getting previous tab', () => {
      const { getPreviousTab } = useTabs({
        tabs: defaultTabs
      });

      const prevTab = getPreviousTab('tab1');
      expect(prevTab?.id).toBe('tab2');
    });
  });

  describe('URL Synchronization', () => {
    it('initializes from URL parameter', async () => {
      mockLocation.search = '?tab=tab2';
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab2');
    });

    it('uses custom URL parameter name', async () => {
      mockLocation.search = '?activeTab=tab2';
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        urlParam: 'activeTab',
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab2');
    });

    it('ignores invalid URL parameter', async () => {
      mockLocation.search = '?tab=nonexistent';
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab1');
    });

    it('updates URL when tab changes', async () => {
      const { setActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab2');

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/test?tab=tab2',
        {},
        {
          preserveState: true,
          preserveScroll: true,
          replace: true
        }
      );
    });

    it('removes URL parameter when setting to default tab', async () => {
      const { setActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab1');

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/test',
        {},
        {
          preserveState: true,
          preserveScroll: true,
          replace: true
        }
      );
    });

    it('falls back to history API when router is not available', async () => {
      // Temporarily remove router
      const originalRouter = mockRouter;
      vi.doMock('@inertiajs/vue3', () => ({}));

      const { setActiveTab } = useTabs({
        tabs: defaultTabs,
        urlSync: true,
        defaultTab: 'tab1'
      });

      await setActiveTab('tab2');

      expect(mockHistory.replaceState).toHaveBeenCalled();

      // Restore router
      vi.doMock('@inertiajs/vue3', () => ({ router: originalRouter }));
    });
  });

  describe('Persistence', () => {
    it('initializes from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('tab2');
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        persist: true,
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab2');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tab-state');
    });

    it('uses custom storage key', async () => {
      localStorageMock.getItem.mockReturnValue('tab2');
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        persist: true,
        storageKey: 'my-tabs',
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('my-tabs');
    });

    it('ignores invalid stored tab', async () => {
      localStorageMock.getItem.mockReturnValue('nonexistent');
      
      const { activeTab, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        persist: true,
        defaultTab: 'tab1'
      });

      await nextTick();
      initializeActiveTab();

      expect(activeTab.value).toBe('tab1');
    });

    it('saves to localStorage when tab changes', async () => {
      const { setActiveTab } = useTabs({
        tabs: defaultTabs,
        persist: true,
        storageKey: 'my-tabs'
      });

      await setActiveTab('tab2');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('my-tabs', 'tab2');
    });

    it('handles localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { setActiveTab } = useTabs({
        tabs: defaultTabs,
        persist: true
      });

      await setActiveTab('tab2');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to persist tab state:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('clears localStorage when resetting', () => {
      const { resetTabState } = useTabs({
        tabs: defaultTabs,
        persist: true,
        storageKey: 'my-tabs'
      });

      resetTabState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('my-tabs');
    });
  });

  describe('Lazy Loading', () => {
    it('marks initial tab as loaded when not lazy', async () => {
      const { loadedTabs, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1',
        lazy: false
      });

      await nextTick();
      initializeActiveTab();

      expect(loadedTabs.value.has('tab1')).toBe(true);
    });

    it('does not mark initial tab as loaded when lazy', async () => {
      const { loadedTabs, initializeActiveTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1',
        lazy: true
      });

      await nextTick();
      initializeActiveTab();

      expect(loadedTabs.value.has('tab1')).toBe(false);
    });

    it('marks tab as loaded when activated with lazy loading', async () => {
      const { loadedTabs, setActiveTab } = useTabs({
        tabs: defaultTabs,
        lazy: true
      });

      await setActiveTab('tab2');

      expect(loadedTabs.value.has('tab2')).toBe(true);
    });

    it('preloads specific tab', () => {
      const { loadedTabs, preloadTab } = useTabs({
        tabs: defaultTabs,
        lazy: true
      });

      preloadTab('tab2');

      expect(loadedTabs.value.has('tab2')).toBe(true);
    });

    it('preloads all enabled tabs', () => {
      const { loadedTabs, preloadAllTabs } = useTabs({
        tabs: defaultTabs,
        lazy: true
      });

      preloadAllTabs();

      expect(loadedTabs.value.has('tab1')).toBe(true);
      expect(loadedTabs.value.has('tab2')).toBe(true);
      expect(loadedTabs.value.has('tab3')).toBe(false); // disabled
      expect(loadedTabs.value.has('tab4')).toBe(false); // hidden
    });

    it('checks if tab is loaded correctly', () => {
      const { isTabLoaded, preloadTab } = useTabs({
        tabs: defaultTabs,
        lazy: true
      });

      expect(isTabLoaded.value('tab1')).toBe(false);
      
      preloadTab('tab1');
      
      expect(isTabLoaded.value('tab1')).toBe(true);
    });

    it('always returns true for isTabLoaded when not lazy', () => {
      const { isTabLoaded } = useTabs({
        tabs: defaultTabs,
        lazy: false
      });

      expect(isTabLoaded.value('tab1')).toBe(true);
      expect(isTabLoaded.value('tab2')).toBe(true);
    });
  });

  describe('Tab Validation', () => {
    it('validates tab navigation capability', () => {
      const { canNavigateToTab } = useTabs({
        tabs: defaultTabs
      });

      expect(canNavigateToTab.value('tab1')).toBe(true);
      expect(canNavigateToTab.value('tab2')).toBe(true);
      expect(canNavigateToTab.value('tab3')).toBe(false); // disabled
      expect(canNavigateToTab.value('tab4')).toBe(false); // hidden
      expect(canNavigateToTab.value('nonexistent')).toBe(false);
    });
  });

  describe('State Reset', () => {
    it('resets all state', async () => {
      const { activeTab, loadedTabs, tabHistory, setActiveTab, preloadTab, resetTabState } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1',
        lazy: true
      });

      // Set up some state
      await setActiveTab('tab2');
      preloadTab('tab1');

      // Reset
      resetTabState();

      expect(activeTab.value).toBe('tab1');
      expect(loadedTabs.value.size).toBe(0);
      expect(tabHistory.value).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tabs array', () => {
      const { activeTab, availableTabs } = useTabs({
        tabs: []
      });

      expect(activeTab.value).toBeNull();
      expect(availableTabs.value).toEqual([]);
    });

    it('handles tabs without IDs', () => {
      const tabsWithoutIds = [
        { label: 'Tab 1' },
        { label: 'Tab 2' }
      ];

      const { canNavigateToTab } = useTabs({
        tabs: tabsWithoutIds
      });

      expect(canNavigateToTab.value(undefined)).toBe(false);
    });

    it('handles server-side rendering gracefully', () => {
      // Mock window as undefined
      const originalWindow = global.window;
      delete global.window;

      const { activeTab } = useTabs({
        tabs: defaultTabs,
        defaultTab: 'tab1',
        urlSync: true,
        persist: true
      });

      expect(activeTab.value).toBe('tab1');

      // Restore window
      global.window = originalWindow;
    });
  });
});