import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TabNavigation from '@/Components/Layout/TabNavigation.vue';

// Mock the composables
vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true }
  })
}));

vi.mock('@/composables/useTabs', () => ({
  useTabs: vi.fn(() => ({
    activeTab: { value: 'tab2' },
    loadedTabs: { value: new Set(['tab1', 'tab2']) },
    tabHistory: { value: [] },
    currentTab: { value: { id: 'tab2', label: 'Tab 2' } },
    availableTabs: { value: [] },
    enabledTabs: { value: [] },
    isTabLoaded: { value: vi.fn(() => true) },
    canNavigateToTab: { value: vi.fn(() => true) },
    setActiveTab: vi.fn(() => Promise.resolve(true)),
    goToPreviousTab: vi.fn(),
    preloadTab: vi.fn(),
    preloadAllTabs: vi.fn(),
    resetTabState: vi.fn(),
    getTabIndex: vi.fn(),
    getNextTab: vi.fn(),
    getPreviousTab: vi.fn(),
    initializeActiveTab: vi.fn()
  }))
}));

describe('TabNavigation', () => {
  let wrapper;

  const defaultTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2', active: true },
    { id: 'tab3', label: 'Tab 3', disabled: true }
  ];

  beforeEach(() => {
    wrapper = mount(TabNavigation, {
      props: {
        items: defaultTabs
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.tab-navigation').exists()).toBe(true);
      expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
    });

    it('renders correct number of tabs', () => {
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(3);
    });

    it('applies correct ARIA attributes', () => {
      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.attributes('aria-label')).toBe('Tab navigation');
      
      const tabs = wrapper.findAll('[role="tab"]');
      tabs.forEach((tab, index) => {
        expect(tab.attributes('role')).toBe('tab');
        expect(tab.attributes('aria-selected')).toBeDefined();
      });
    });

    it('renders tab labels correctly', () => {
      const tabLabels = wrapper.findAll('.tab-label');
      expect(tabLabels[0].text()).toBe('Tab 1');
      expect(tabLabels[1].text()).toBe('Tab 2');
      expect(tabLabels[2].text()).toBe('Tab 3');
    });
  });

  describe('Tab States', () => {
    it('marks active tab correctly', () => {
      const tabs = wrapper.findAll('[role="tab"]');
      
      expect(tabs[0].attributes('aria-selected')).toBe('false');
      expect(tabs[1].attributes('aria-selected')).toBe('true');
      expect(tabs[2].attributes('aria-selected')).toBe('false');
      
      expect(tabs[1].classes()).toContain('tab-button--active');
    });

    it('handles disabled tabs correctly', () => {
      const tabs = wrapper.findAll('[role="tab"]');
      
      expect(tabs[2].attributes('disabled')).toBeDefined();
      expect(tabs[2].classes()).toContain('tab-button--disabled');
    });

    it('sets correct tabindex for keyboard navigation', () => {
      const tabs = wrapper.findAll('[role="tab"]');
      
      expect(tabs[0].attributes('tabindex')).toBe('-1');
      expect(tabs[1].attributes('tabindex')).toBe('0'); // Active tab
      expect(tabs[2].attributes('tabindex')).toBe('-1');
    });

    it('uses activeTab prop to determine active state', async () => {
      await wrapper.setProps({ activeTab: 'tab1' });
      
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[0].attributes('aria-selected')).toBe('true');
      expect(tabs[1].attributes('aria-selected')).toBe('false');
    });
  });

  describe('Tab Variants', () => {
    it('applies underline variant by default', () => {
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--underline');
      });
    });

    it('applies pills variant when specified', async () => {
      await wrapper.setProps({ variant: 'pills' });
      
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--pills');
      });
    });

    it('applies buttons variant when specified', async () => {
      await wrapper.setProps({ variant: 'buttons' });
      
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--buttons');
      });
    });

    it('shows tab indicator for underline variant', () => {
      expect(wrapper.find('.tab-indicator').exists()).toBe(true);
    });

    it('hides tab indicator for non-underline variants', async () => {
      await wrapper.setProps({ variant: 'pills' });
      
      const indicator = wrapper.find('.tab-indicator');
      expect(indicator.exists()).toBe(true);
      expect(indicator.attributes('style')).toContain('display: none');
    });
  });

  describe('Tab Sizes', () => {
    it('applies medium size by default', () => {
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--md');
      });
    });

    it('applies small size when specified', async () => {
      await wrapper.setProps({ size: 'sm' });
      
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--sm');
      });
    });

    it('applies large size when specified', async () => {
      await wrapper.setProps({ size: 'lg' });
      
      const tabs = wrapper.findAll('.tab-button');
      tabs.forEach(tab => {
        expect(tab.classes()).toContain('tab-button--lg');
      });
    });
  });

  describe('Tab Icons', () => {
    it('renders icons when provided', async () => {
      const tabsWithIcons = [
        { id: 'tab1', label: 'Home', icon: 'HomeIcon' },
        { id: 'tab2', label: 'Settings', icon: 'SettingsIcon' }
      ];

      await wrapper.setProps({ items: tabsWithIcons });
      
      const icons = wrapper.findAll('.tab-icon');
      expect(icons).toHaveLength(2);
    });

    it('does not render icons when not provided', () => {
      const icons = wrapper.findAll('.tab-icon');
      expect(icons).toHaveLength(0);
    });
  });

  describe('Tab Badges', () => {
    it('renders badges when provided', async () => {
      const tabsWithBadges = [
        { id: 'tab1', label: 'Messages', badge: '5' },
        { id: 'tab2', label: 'Notifications', badge: '12' }
      ];

      await wrapper.setProps({ items: tabsWithBadges });
      
      const badges = wrapper.findAll('.tab-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0].text()).toBe('5');
      expect(badges[1].text()).toBe('12');
    });

    it('applies correct badge variant classes', async () => {
      const tabsWithBadges = [
        { id: 'tab1', label: 'Tab 1', badge: '1', badgeVariant: 'primary' },
        { id: 'tab2', label: 'Tab 2', badge: '2', badgeVariant: 'success' },
        { id: 'tab3', label: 'Tab 3', badge: '3', badgeVariant: 'error' }
      ];

      await wrapper.setProps({ items: tabsWithBadges });
      
      const badges = wrapper.findAll('.tab-badge');
      expect(badges[0].classes()).toContain('tab-badge--primary');
      expect(badges[1].classes()).toContain('tab-badge--success');
      expect(badges[2].classes()).toContain('tab-badge--error');
    });

    it('defaults to primary badge variant', async () => {
      const tabsWithBadges = [
        { id: 'tab1', label: 'Tab 1', badge: '1' }
      ];

      await wrapper.setProps({ items: tabsWithBadges });
      
      const badge = wrapper.find('.tab-badge');
      expect(badge.classes()).toContain('tab-badge--primary');
    });
  });

  describe('Closable Tabs', () => {
    it('renders close buttons for closable tabs', async () => {
      const closableTabs = [
        { id: 'tab1', label: 'Tab 1', closable: true },
        { id: 'tab2', label: 'Tab 2' }
      ];

      await wrapper.setProps({ items: closableTabs });
      
      const closeButtons = wrapper.findAll('.tab-close');
      expect(closeButtons).toHaveLength(1);
    });

    it('emits tab-close event when close button is clicked', async () => {
      const closableTabs = [
        { id: 'tab1', label: 'Tab 1', closable: true }
      ];

      await wrapper.setProps({ items: closableTabs });
      
      const closeButton = wrapper.find('.tab-close');
      await closeButton.trigger('click');
      
      expect(wrapper.emitted('tab-close')).toBeTruthy();
      expect(wrapper.emitted('tab-close')[0]).toEqual([closableTabs[0]]);
    });

    it('prevents tab-change event when close button is clicked', async () => {
      const closableTabs = [
        { id: 'tab1', label: 'Tab 1', closable: true }
      ];

      await wrapper.setProps({ items: closableTabs });
      
      const closeButton = wrapper.find('.tab-close');
      await closeButton.trigger('click');
      
      expect(wrapper.emitted('tab-change')).toBeFalsy();
    });

    it('applies closable class to closable tabs', async () => {
      const closableTabs = [
        { id: 'tab1', label: 'Tab 1', closable: true }
      ];

      await wrapper.setProps({ items: closableTabs });
      
      const tab = wrapper.find('.tab-button');
      expect(tab.classes()).toContain('tab-button--closable');
    });
  });

  describe('Event Handling', () => {
    it('emits tab-change event when tab is clicked', async () => {
      const tab = wrapper.findAll('[role="tab"]')[0];
      await tab.trigger('click');
      
      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual([defaultTabs[0]]);
    });

    it('does not emit tab-change for disabled tabs', async () => {
      const disabledTab = wrapper.findAll('[role="tab"]')[2];
      await disabledTab.trigger('click');
      
      expect(wrapper.emitted('tab-change')).toBeFalsy();
    });

    it('handles keyboard navigation correctly', async () => {
      const tabs = wrapper.findAll('[role="tab"]');
      
      // Arrow right should move to next tab
      await tabs[1].trigger('keydown', { key: 'ArrowRight' });
      
      // Should focus the next non-disabled tab
      expect(wrapper.vm.tabRefs[2]).toBeDefined();
    });

    it('handles Home key to focus first tab', async () => {
      const activeTab = wrapper.findAll('[role="tab"]')[1];
      await activeTab.trigger('keydown', { key: 'Home' });
      
      // Should focus first tab
      expect(wrapper.vm.tabRefs[0]).toBeDefined();
    });

    it('handles End key to focus last tab', async () => {
      const activeTab = wrapper.findAll('[role="tab"]')[1];
      await activeTab.trigger('keydown', { key: 'End' });
      
      // Should focus last tab
      expect(wrapper.vm.tabRefs[2]).toBeDefined();
    });

    it('handles Enter key to activate tab', async () => {
      const tab = wrapper.findAll('[role="tab"]')[0];
      await tab.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('tab-change')).toBeTruthy();
    });

    it('handles Space key to activate tab', async () => {
      const tab = wrapper.findAll('[role="tab"]')[0];
      await tab.trigger('keydown', { key: ' ' });
      
      expect(wrapper.emitted('tab-change')).toBeTruthy();
    });
  });

  describe('Scroll Functionality', () => {
    it('shows scroll buttons on mobile with many tabs', async () => {
      // Mock mobile responsive state
      vi.mocked(vi.importActual('@/composables/useResponsive')).useResponsive = () => ({
        isMobile: { value: true },
        isTablet: { value: false },
        isDesktop: { value: false }
      });

      const manyTabs = Array.from({ length: 5 }, (_, i) => ({
        id: `tab${i + 1}`,
        label: `Tab ${i + 1}`
      }));

      await wrapper.setProps({ items: manyTabs });
      
      expect(wrapper.vm.showScrollButtons).toBe(true);
    });

    it('hides scroll buttons on desktop', () => {
      expect(wrapper.vm.showScrollButtons).toBe(false);
    });

    it('handles scroll left button click', async () => {
      // Mock mobile with many tabs
      const manyTabs = Array.from({ length: 5 }, (_, i) => ({
        id: `tab${i + 1}`,
        label: `Tab ${i + 1}`
      }));

      await wrapper.setProps({ items: manyTabs });
      
      // Mock scroll functionality
      const mockScrollBy = vi.fn();
      wrapper.vm.tabContainer = { scrollBy: mockScrollBy };
      
      await wrapper.vm.scrollLeft();
      
      expect(mockScrollBy).toHaveBeenCalledWith({ left: -200, behavior: 'smooth' });
    });

    it('handles scroll right button click', async () => {
      const manyTabs = Array.from({ length: 5 }, (_, i) => ({
        id: `tab${i + 1}`,
        label: `Tab ${i + 1}`
      }));

      await wrapper.setProps({ items: manyTabs });
      
      // Mock scroll functionality
      const mockScrollBy = vi.fn();
      wrapper.vm.tabContainer = { scrollBy: mockScrollBy };
      
      await wrapper.vm.scrollRight();
      
      expect(mockScrollBy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
    });
  });

  describe('Tab Indicator', () => {
    it('updates indicator position when active tab changes', async () => {
      await wrapper.setProps({ activeTab: 'tab1' });
      
      // Mock getBoundingClientRect for testing
      const mockGetBoundingClientRect = vi.fn(() => ({
        width: 100,
        left: 0
      }));
      
      wrapper.vm.tabRefs = [{
        getBoundingClientRect: mockGetBoundingClientRect,
        parentElement: {
          getBoundingClientRect: () => ({ left: 0 })
        }
      }];
      
      await wrapper.vm.updateIndicator();
      
      expect(wrapper.vm.indicatorStyle.width).toBe('100px');
      expect(wrapper.vm.indicatorStyle.transform).toBe('translateX(0px)');
    });

    it('hides indicator when no active tab', async () => {
      await wrapper.setProps({ activeTab: 'nonexistent' });
      
      await wrapper.vm.updateIndicator();
      
      expect(wrapper.vm.indicatorStyle.display).toBe('none');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for tablist', () => {
      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.attributes('aria-label')).toBe('Tab navigation');
    });

    it('has proper ARIA attributes for tabs', () => {
      const tabs = wrapper.findAll('[role="tab"]');
      
      tabs.forEach(tab => {
        expect(tab.attributes('role')).toBe('tab');
        expect(tab.attributes('aria-selected')).toBeDefined();
        expect(tab.attributes('tabindex')).toBeDefined();
      });
    });

    it('has proper aria-controls attributes when panelId is provided', async () => {
      const tabsWithPanels = [
        { id: 'tab1', label: 'Tab 1', panelId: 'panel1' },
        { id: 'tab2', label: 'Tab 2', panelId: 'panel2' }
      ];

      await wrapper.setProps({ items: tabsWithPanels });
      
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[0].attributes('aria-controls')).toBe('panel1');
      expect(tabs[1].attributes('aria-controls')).toBe('panel2');
    });

    it('has proper aria-label for close buttons', async () => {
      const closableTabs = [
        { id: 'tab1', label: 'Tab 1', closable: true }
      ];

      await wrapper.setProps({ items: closableTabs });
      
      const closeButton = wrapper.find('.tab-close');
      expect(closeButton.attributes('aria-label')).toBe('Close Tab 1 tab');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.tab-container').classes()).toContain('overflow-x-auto');
      expect(wrapper.find('.tab-container').classes()).toContain('scrollbar-hide');
    });

    it('handles mobile layout adjustments', async () => {
      // This would require more complex mocking of the responsive composable
      // for different test scenarios
      expect(wrapper.find('.tab-list').classes()).toContain('flex');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', async () => {
      await wrapper.setProps({ items: [] });
      
      expect(wrapper.findAll('[role="tab"]')).toHaveLength(0);
    });

    it('handles single tab', async () => {
      await wrapper.setProps({ items: [{ id: 'single', label: 'Single Tab' }] });
      
      expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    });

    it('handles tabs without IDs gracefully', async () => {
      const tabsWithoutIds = [
        { label: 'Tab 1' },
        { label: 'Tab 2' }
      ];

      await wrapper.setProps({ items: tabsWithoutIds });
      
      // Should still render tabs using labels as keys
      expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
    });
  });

  describe('Custom Classes', () => {
    it('accepts custom classes', async () => {
      await wrapper.setProps({ class: 'custom-tabs' });
      
      expect(wrapper.classes()).toContain('custom-tabs');
    });
  });

  describe('Tab Management Features', () => {
    describe('URL Synchronization', () => {
      it('initializes tab manager when urlSync is enabled', async () => {
        const { useTabs } = await import('@/composables/useTabs');
        
        await wrapper.setProps({ urlSync: true });
        
        expect(useTabs).toHaveBeenCalledWith(
          expect.objectContaining({
            urlSync: true,
            urlParam: 'tab'
          })
        );
      });

      it('uses custom URL parameter when specified', async () => {
        const { useTabs } = await import('@/composables/useTabs');
        
        await wrapper.setProps({ 
          urlSync: true, 
          urlParam: 'activeTab' 
        });
        
        expect(useTabs).toHaveBeenCalledWith(
          expect.objectContaining({
            urlParam: 'activeTab'
          })
        );
      });

      it('uses tab manager active state when URL sync is enabled', async () => {
        await wrapper.setProps({ urlSync: true });
        
        // The mock returns tab2 as active
        const tabs = wrapper.findAll('[role="tab"]');
        expect(tabs[1].attributes('aria-selected')).toBe('true');
      });
    });

    describe('Persistence', () => {
      it('initializes tab manager when persist is enabled', async () => {
        const { useTabs } = await import('@/composables/useTabs');
        
        await wrapper.setProps({ persist: true });
        
        expect(useTabs).toHaveBeenCalledWith(
          expect.objectContaining({
            persist: true,
            storageKey: 'tab-state'
          })
        );
      });

      it('uses custom storage key when specified', async () => {
        const { useTabs } = await import('@/composables/useTabs');
        
        await wrapper.setProps({ 
          persist: true, 
          storageKey: 'my-tabs' 
        });
        
        expect(useTabs).toHaveBeenCalledWith(
          expect.objectContaining({
            storageKey: 'my-tabs'
          })
        );
      });
    });

    describe('Lazy Loading', () => {
      it('initializes tab manager when lazy is enabled', async () => {
        const { useTabs } = await import('@/composables/useTabs');
        
        await wrapper.setProps({ lazy: true });
        
        expect(useTabs).toHaveBeenCalledWith(
          expect.objectContaining({
            lazy: true
          })
        );
      });

      it('uses tab manager for tab clicks when lazy loading is enabled', async () => {
        await wrapper.setProps({ lazy: true });
        
        const tab = wrapper.findAll('[role="tab"]')[0];
        await tab.trigger('click');
        
        // Should call tab manager's setActiveTab
        expect(wrapper.vm.tabManager.setActiveTab).toHaveBeenCalledWith('tab1');
      });
    });

    describe('Preloading', () => {
      it('preloads tabs on hover when preloadOnHover is enabled', async () => {
        await wrapper.setProps({ 
          lazy: true, 
          preloadOnHover: true 
        });
        
        const tab = wrapper.findAll('[role="tab"]')[0];
        await tab.trigger('mouseenter');
        
        expect(wrapper.vm.tabManager.preloadTab).toHaveBeenCalledWith('tab1');
        expect(wrapper.emitted('tab-preload')).toBeTruthy();
      });

      it('does not preload on hover when preloadOnHover is disabled', async () => {
        await wrapper.setProps({ 
          lazy: true, 
          preloadOnHover: false 
        });
        
        const tab = wrapper.findAll('[role="tab"]')[0];
        await tab.trigger('mouseenter');
        
        expect(wrapper.vm.tabManager?.preloadTab).not.toHaveBeenCalled();
        expect(wrapper.emitted('tab-preload')).toBeFalsy();
      });

      it('does not preload already loaded tabs', async () => {
        await wrapper.setProps({ 
          lazy: true, 
          preloadOnHover: true 
        });
        
        // Mock tab as already loaded
        wrapper.vm.tabManager.isTabLoaded.value = vi.fn(() => true);
        
        const tab = wrapper.findAll('[role="tab"]')[0];
        await tab.trigger('mouseenter');
        
        expect(wrapper.vm.tabManager.preloadTab).not.toHaveBeenCalled();
      });
    });

    describe('Tab Manager Integration', () => {
      it('exposes tab manager methods', async () => {
        await wrapper.setProps({ urlSync: true });
        
        expect(wrapper.vm.setActiveTab).toBeDefined();
        expect(wrapper.vm.goToPreviousTab).toBeDefined();
        expect(wrapper.vm.preloadTab).toBeDefined();
        expect(wrapper.vm.preloadAllTabs).toBeDefined();
        expect(wrapper.vm.resetTabState).toBeDefined();
      });

      it('does not initialize tab manager when no advanced features are enabled', () => {
        // Default props should not initialize tab manager
        expect(wrapper.vm.tabManager).toBeNull();
      });

      it('watches tab manager active tab changes', async () => {
        await wrapper.setProps({ urlSync: true });
        
        // Simulate tab manager active tab change
        const mockTab = { id: 'tab1', label: 'Tab 1' };
        wrapper.vm.tabManager.activeTab.value = 'tab1';
        
        await wrapper.vm.$nextTick();
        
        // Should emit tab-change event
        expect(wrapper.emitted('tab-change')).toBeTruthy();
      });
    });
  });

  describe('Enhanced Keyboard Navigation', () => {
    it('handles keyboard navigation with tab manager', async () => {
      await wrapper.setProps({ urlSync: true });
      
      const tabs = wrapper.findAll('[role="tab"]');
      
      // Arrow right should still work with tab manager
      await tabs[1].trigger('keydown', { key: 'ArrowRight' });
      
      expect(wrapper.vm.tabRefs[2]).toBeDefined();
    });

    it('activates tab through tab manager on Enter', async () => {
      await wrapper.setProps({ urlSync: true });
      
      const tab = wrapper.findAll('[role="tab"]')[0];
      await tab.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.vm.tabManager.setActiveTab).toHaveBeenCalledWith('tab1');
    });

    it('activates tab through tab manager on Space', async () => {
      await wrapper.setProps({ urlSync: true });
      
      const tab = wrapper.findAll('[role="tab"]')[0];
      await tab.trigger('keydown', { key: ' ' });
      
      expect(wrapper.vm.tabManager.setActiveTab).toHaveBeenCalledWith('tab1');
    });
  });
});