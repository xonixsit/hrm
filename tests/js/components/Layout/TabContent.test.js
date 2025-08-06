import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TabContent from '@/Components/Layout/TabContent.vue';

describe('TabContent', () => {
  let wrapper;

  const defaultTabs = [
    { 
      id: 'tab1', 
      label: 'Tab 1',
      content: '<p>Tab 1 content</p>',
      panelId: 'panel-1'
    },
    { 
      id: 'tab2', 
      label: 'Tab 2',
      content: '<p>Tab 2 content</p>',
      panelId: 'panel-2'
    },
    { 
      id: 'tab3', 
      label: 'Tab 3',
      component: 'CustomComponent',
      props: { message: 'Hello' }
    }
  ];

  beforeEach(() => {
    wrapper = mount(TabContent, {
      props: {
        tabs: defaultTabs,
        activeTab: 'tab1'
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.tab-content').exists()).toBe(true);
    });

    it('renders correct number of tab panels', () => {
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels).toHaveLength(3);
    });

    it('applies correct ARIA attributes to panels', () => {
      const panels = wrapper.findAll('[role="tabpanel"]');
      
      panels.forEach((panel, index) => {
        const tab = defaultTabs[index];
        expect(panel.attributes('role')).toBe('tabpanel');
        expect(panel.attributes('id')).toBe(tab.panelId || `panel-${tab.id}`);
        expect(panel.attributes('aria-labelledby')).toBe(tab.id);
      });
    });

    it('sets correct aria-hidden and tabindex for active/inactive panels', () => {
      const panels = wrapper.findAll('[role="tabpanel"]');
      
      expect(panels[0].attributes('aria-hidden')).toBe('false');
      expect(panels[0].attributes('tabindex')).toBe('0');
      
      expect(panels[1].attributes('aria-hidden')).toBe('true');
      expect(panels[1].attributes('tabindex')).toBe('-1');
    });

    it('applies correct panel classes', () => {
      const panels = wrapper.findAll('.tab-panel');
      
      expect(panels[0].classes()).toContain('tab-panel--active');
      expect(panels[1].classes()).toContain('tab-panel--hidden');
    });
  });

  describe('Content Rendering', () => {
    it('renders HTML content when provided', () => {
      const activePanel = wrapper.find('[aria-hidden="false"]');
      expect(activePanel.html()).toContain('<p>Tab 1 content</p>');
    });

    it('renders component when specified', async () => {
      await wrapper.setProps({ activeTab: 'tab3' });
      
      const activePanel = wrapper.find('[aria-hidden="false"]');
      expect(activePanel.html()).toContain('CustomComponent');
    });

    it('renders empty state when no content or component', async () => {
      const tabsWithoutContent = [
        { id: 'empty', label: 'Empty Tab' }
      ];

      await wrapper.setProps({ 
        tabs: tabsWithoutContent,
        activeTab: 'empty'
      });
      
      const activePanel = wrapper.find('[aria-hidden="false"]');
      expect(activePanel.find('.tab-panel-empty').exists()).toBe(true);
      expect(activePanel.text()).toContain('No content available');
    });

    it('provides slot props correctly', () => {
      const slotWrapper = mount(TabContent, {
        props: {
          tabs: defaultTabs,
          activeTab: 'tab1'
        },
        slots: {
          'tab-tab1': `
            <template #default="{ tab, isActive, isLoaded }">
              <div class="custom-content">
                {{ tab.label }} - Active: {{ isActive }} - Loaded: {{ isLoaded }}
              </div>
            </template>
          `
        }
      });

      const customContent = slotWrapper.find('.custom-content');
      expect(customContent.text()).toContain('Tab 1 - Active: true - Loaded: true');
    });
  });

  describe('Lazy Loading', () => {
    it('renders all tabs when lazy loading is disabled', () => {
      const panels = wrapper.findAll('.tab-panel');
      
      // All panels should have content
      panels.forEach(panel => {
        expect(panel.find('.tab-panel-loading').exists()).toBe(false);
      });
    });

    it('shows loading state for active unloaded tab when lazy loading is enabled', async () => {
      await wrapper.setProps({ 
        lazy: true,
        loadedTabs: new Set()
      });
      
      const activePanel = wrapper.find('[aria-hidden="false"]');
      expect(activePanel.find('.tab-panel-loading').exists()).toBe(true);
      expect(activePanel.text()).toContain('Loading Tab 1...');
    });

    it('renders content for loaded tabs', async () => {
      await wrapper.setProps({ 
        lazy: true,
        loadedTabs: new Set(['tab1'])
      });
      
      const activePanel = wrapper.find('[aria-hidden="false"]');
      expect(activePanel.find('.tab-panel-loading').exists()).toBe(false);
      expect(activePanel.html()).toContain('<p>Tab 1 content</p>');
    });

    it('does not render inactive unloaded tabs when lazy loading', async () => {
      await wrapper.setProps({ 
        lazy: true,
        loadedTabs: new Set(['tab1'])
      });
      
      const inactivePanels = wrapper.findAll('[aria-hidden="true"]');
      inactivePanels.forEach(panel => {
        expect(panel.text()).toBe('');
      });
    });

    it('emits tab-load event when tab becomes active', async () => {
      await wrapper.setProps({ 
        lazy: true,
        loadedTabs: new Set()
      });
      
      await wrapper.vm.loadTab('tab2');
      
      expect(wrapper.emitted('tab-load')).toBeTruthy();
      expect(wrapper.emitted('tab-load')[0]).toEqual([{
        tab: defaultTabs[1],
        tabId: 'tab2'
      }]);
    });

    it('calls tab onLoad function when loading', async () => {
      const onLoadSpy = vi.fn();
      const tabsWithOnLoad = [
        { 
          id: 'tab1', 
          label: 'Tab 1',
          onLoad: onLoadSpy
        }
      ];

      await wrapper.setProps({ 
        tabs: tabsWithOnLoad,
        lazy: true,
        loadedTabs: new Set()
      });
      
      await wrapper.vm.loadTab('tab1');
      
      expect(onLoadSpy).toHaveBeenCalledWith(tabsWithOnLoad[0]);
    });

    it('handles onLoad errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onLoadError = vi.fn(() => {
        throw new Error('Load failed');
      });

      const tabsWithError = [
        { 
          id: 'tab1', 
          label: 'Tab 1',
          onLoad: onLoadError
        }
      ];

      await wrapper.setProps({ 
        tabs: tabsWithError,
        lazy: true,
        loadedTabs: new Set()
      });
      
      await wrapper.vm.loadTab('tab1');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading tab tab1:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Keep Alive Functionality', () => {
    it('keeps loaded tabs rendered when keepAlive is enabled', async () => {
      await wrapper.setProps({ 
        lazy: true,
        keepAlive: true,
        loadedTabs: new Set(['tab1', 'tab2']),
        activeTab: 'tab2'
      });
      
      // Both tabs should be rendered
      const tab1Panel = wrapper.find('#panel-1');
      const tab2Panel = wrapper.find('#panel-2');
      
      expect(tab1Panel.html()).toContain('<p>Tab 1 content</p>');
      expect(tab2Panel.html()).toContain('<p>Tab 2 content</p>');
    });

    it('applies keep-alive classes correctly', async () => {
      await wrapper.setProps({ 
        lazy: true,
        keepAlive: true,
        loadedTabs: new Set(['tab1', 'tab2']),
        activeTab: 'tab2'
      });
      
      const tab1Panel = wrapper.find('#panel-1');
      expect(tab1Panel.classes()).toContain('tab-panel--keep-alive');
      expect(tab1Panel.classes()).toContain('tab-panel--hidden');
    });

    it('emits tab-unload event when unloading tabs', async () => {
      await wrapper.setProps({ 
        lazy: true,
        keepAlive: true,
        loadedTabs: new Set(['tab1'])
      });
      
      await wrapper.vm.unloadTab('tab1');
      
      expect(wrapper.emitted('tab-unload')).toBeTruthy();
      expect(wrapper.emitted('tab-unload')[0]).toEqual([{
        tab: defaultTabs[0],
        tabId: 'tab1'
      }]);
    });

    it('calls tab onUnload function when unloading', async () => {
      const onUnloadSpy = vi.fn();
      const tabsWithOnUnload = [
        { 
          id: 'tab1', 
          label: 'Tab 1',
          onUnload: onUnloadSpy
        }
      ];

      await wrapper.setProps({ 
        tabs: tabsWithOnUnload,
        lazy: true,
        keepAlive: true,
        loadedTabs: new Set(['tab1'])
      });
      
      await wrapper.vm.unloadTab('tab1');
      
      expect(onUnloadSpy).toHaveBeenCalledWith(tabsWithOnUnload[0]);
    });
  });

  describe('Transitions', () => {
    it('applies fade transition by default', () => {
      const panels = wrapper.findAll('.tab-panel');
      panels.forEach(panel => {
        expect(panel.classes()).toContain('tab-panel--fade');
      });
    });

    it('applies custom transition when specified', async () => {
      await wrapper.setProps({ transition: 'slide' });
      
      const panels = wrapper.findAll('.tab-panel');
      panels.forEach(panel => {
        expect(panel.classes()).toContain('tab-panel--slide');
      });
    });
  });

  describe('Active Tab Changes', () => {
    it('updates panel visibility when active tab changes', async () => {
      await wrapper.setProps({ activeTab: 'tab2' });
      
      const panels = wrapper.findAll('[role="tabpanel"]');
      
      expect(panels[0].attributes('aria-hidden')).toBe('true');
      expect(panels[1].attributes('aria-hidden')).toBe('false');
    });

    it('loads new active tab when lazy loading is enabled', async () => {
      const loadedTabs = new Set(['tab1']);
      
      await wrapper.setProps({ 
        lazy: true,
        loadedTabs,
        activeTab: 'tab1'
      });
      
      // Change to unloaded tab
      await wrapper.setProps({ activeTab: 'tab2' });
      await nextTick();
      
      expect(loadedTabs.has('tab2')).toBe(true);
    });

    it('unloads previous tab when keepAlive is disabled', async () => {
      const loadedTabs = new Set(['tab1', 'tab2']);
      
      await wrapper.setProps({ 
        lazy: true,
        keepAlive: false,
        loadedTabs,
        activeTab: 'tab1'
      });
      
      // Change active tab
      await wrapper.setProps({ activeTab: 'tab2' });
      await nextTick();
      
      expect(loadedTabs.has('tab1')).toBe(false);
    });

    it('keeps previous tab loaded when keepAlive is enabled', async () => {
      const loadedTabs = new Set(['tab1', 'tab2']);
      
      await wrapper.setProps({ 
        lazy: true,
        keepAlive: true,
        loadedTabs,
        activeTab: 'tab1'
      });
      
      // Change active tab
      await wrapper.setProps({ activeTab: 'tab2' });
      await nextTick();
      
      expect(loadedTabs.has('tab1')).toBe(true);
    });
  });

  describe('Custom Loading Slot', () => {
    it('renders custom loading content', async () => {
      const loadingWrapper = mount(TabContent, {
        props: {
          tabs: defaultTabs,
          activeTab: 'tab1',
          lazy: true,
          loadedTabs: new Set()
        },
        slots: {
          loading: `
            <template #default="{ tab }">
              <div class="custom-loading">Loading {{ tab.label }}...</div>
            </template>
          `
        }
      });

      const customLoading = loadingWrapper.find('.custom-loading');
      expect(customLoading.exists()).toBe(true);
      expect(customLoading.text()).toBe('Loading Tab 1...');
    });
  });

  describe('Exposed Methods', () => {
    it('exposes loadTab method', () => {
      expect(wrapper.vm.loadTab).toBeDefined();
      expect(typeof wrapper.vm.loadTab).toBe('function');
    });

    it('exposes unloadTab method', () => {
      expect(wrapper.vm.unloadTab).toBeDefined();
      expect(typeof wrapper.vm.unloadTab).toBe('function');
    });

    it('exposes isTabLoaded method', () => {
      expect(wrapper.vm.isTabLoaded).toBeDefined();
      expect(typeof wrapper.vm.isTabLoaded).toBe('function');
    });

    it('exposes shouldRenderTab method', () => {
      expect(wrapper.vm.shouldRenderTab).toBeDefined();
      expect(typeof wrapper.vm.shouldRenderTab).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tabs array', async () => {
      await wrapper.setProps({ tabs: [] });
      
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels).toHaveLength(0);
    });

    it('handles tabs without IDs gracefully', async () => {
      const tabsWithoutIds = [
        { label: 'Tab 1', content: 'Content 1' }
      ];

      await wrapper.setProps({ 
        tabs: tabsWithoutIds,
        activeTab: undefined
      });
      
      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing active tab gracefully', async () => {
      await wrapper.setProps({ activeTab: 'nonexistent' });
      
      const panels = wrapper.findAll('[role="tabpanel"]');
      panels.forEach(panel => {
        expect(panel.attributes('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Custom Classes', () => {
    it('accepts custom classes', async () => {
      await wrapper.setProps({ class: 'custom-tab-content' });
      
      expect(wrapper.classes()).toContain('custom-tab-content');
    });
  });

  describe('Prop Validation', () => {
    it('validates tabs prop structure', () => {
      const invalidTabs = [
        { label: 'Tab without ID' },
        { id: 123, label: 'Tab with numeric ID' }
      ];

      // This should trigger validation warning in development
      const validator = wrapper.vm.$options.props.tabs.validator;
      expect(validator(invalidTabs)).toBe(false);
      expect(validator(defaultTabs)).toBe(true);
    });
  });
});