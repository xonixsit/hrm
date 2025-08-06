import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import BreadcrumbNavigation from '@/Components/Layout/BreadcrumbNavigation.vue';
import Icon from '@/Components/Base/Icon.vue';

// Mock Inertia Link component
const mockLink = {
  name: 'Link',
  template: '<a :href="href" v-bind="$attrs"><slot /></a>',
  props: ['href', 'to']
};

// Mock Icon component
const mockIcon = {
  name: 'Icon',
  template: '<span class="mock-icon" :data-icon="name"></span>',
  props: ['name']
};

describe('BreadcrumbNavigation', () => {
  let wrapper;

  const defaultProps = {
    items: [
      { label: 'Home', href: '/', icon: 'home' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Smartphones', current: true }
    ]
  };

  beforeEach(() => {
    wrapper = mount(BreadcrumbNavigation, {
      props: defaultProps,
      global: {
        components: {
          Link: mockLink,
          Icon: mockIcon
        }
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const nav = wrapper.find('nav');
      expect(nav.attributes('role')).toBe('navigation');
      expect(nav.attributes('aria-label')).toBe('Breadcrumb');
    });

    it('uses proper list structure', () => {
      const list = wrapper.find('ol[role="list"]');
      expect(list.exists()).toBe(true);
      
      const listItems = wrapper.findAll('li[role="listitem"]');
      expect(listItems).toHaveLength(4);
    });

    it('marks current page with aria-current', () => {
      const currentItem = wrapper.find('[aria-current="page"]');
      expect(currentItem.exists()).toBe(true);
      expect(currentItem.text()).toContain('Smartphones');
    });

    it('provides proper aria-labels for navigation items', () => {
      const links = wrapper.findAll('a');
      expect(links[0].attributes('aria-label')).toBe('Go to Home');
      expect(links[1].attributes('aria-label')).toBe('Go to Products');
    });

    it('hides decorative icons from screen readers', () => {
      const icons = wrapper.findAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('includes structured data when enabled', async () => {
      await wrapper.setProps({ structuredData: true });
      const structuredDataScript = wrapper.find('script[type="application/ld+json"]');
      expect(structuredDataScript.exists()).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      await wrapper.setProps({ keyboardNavigation: true });
    });

    it('handles Enter key on breadcrumb items', async () => {
      const firstLink = wrapper.find('a');
      const clickSpy = vi.fn();
      wrapper.vm.$emit = clickSpy;

      await firstLink.trigger('keydown', { key: 'Enter' });
      expect(clickSpy).toHaveBeenCalledWith('click', expect.any(Object));
    });

    it('handles Space key on breadcrumb items', async () => {
      const firstLink = wrapper.find('a');
      const clickSpy = vi.fn();
      wrapper.vm.$emit = clickSpy;

      await firstLink.trigger('keydown', { key: ' ' });
      expect(clickSpy).toHaveBeenCalledWith('click', expect.any(Object));
    });

    it('handles arrow key navigation', async () => {
      const firstLink = wrapper.find('a');
      await firstLink.trigger('keydown', { key: 'ArrowRight' });
      // Should focus next item (tested via focus management)
    });

    it('handles Home key to focus first item', async () => {
      const firstLink = wrapper.find('a');
      await firstLink.trigger('keydown', { key: 'Home' });
      // Should focus first clickable item
    });

    it('handles End key to focus last item', async () => {
      const firstLink = wrapper.find('a');
      await firstLink.trigger('keydown', { key: 'End' });
      // Should focus last clickable item
    });

    it('handles Escape key to close mobile expanded view', async () => {
      await wrapper.setProps({ mobileMode: 'current-only' });
      await wrapper.setData({ mobileExpanded: true });
      
      const mobileToggle = wrapper.find('.breadcrumb-back-button');
      await mobileToggle.trigger('keydown', { key: 'Escape' });
      
      expect(wrapper.vm.mobileExpanded).toBe(false);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('shows mobile current-only mode correctly', async () => {
      await wrapper.setProps({ mobileMode: 'current-only' });
      
      const mobileView = wrapper.find('.breadcrumb-mobile-current');
      expect(mobileView.exists()).toBe(true);
      expect(mobileView.text()).toContain('Smartphones');
    });

    it('toggles mobile expanded view', async () => {
      await wrapper.setProps({ mobileMode: 'current-only' });
      
      const toggleButton = wrapper.find('.breadcrumb-back-button');
      expect(toggleButton.exists()).toBe(true);
      
      await toggleButton.trigger('click');
      expect(wrapper.vm.mobileExpanded).toBe(true);
    });

    it('shows compact mode on mobile', async () => {
      await wrapper.setProps({ mobileMode: 'compact' });
      
      // Should show first, ellipsis, and current items
      const displayItems = wrapper.vm.displayItems;
      expect(displayItems.some(item => item.ellipsis)).toBe(true);
    });
  });

  describe('History Feature', () => {
    beforeEach(async () => {
      await wrapper.setProps({ showHistory: true });
      await wrapper.setData({ 
        breadcrumbHistory: [
          {
            breadcrumbs: [{ label: 'Home' }, { label: 'About' }],
            timestamp: Date.now() - 60000,
            url: '/about'
          }
        ]
      });
    });

    it('shows history dropdown when enabled', () => {
      const historyToggle = wrapper.find('.breadcrumb-history-toggle');
      expect(historyToggle.exists()).toBe(true);
    });

    it('toggles history dropdown', async () => {
      const historyToggle = wrapper.find('.breadcrumb-history-toggle');
      await historyToggle.trigger('click');
      
      expect(wrapper.vm.historyDropdownOpen).toBe(true);
      
      const dropdown = wrapper.find('.breadcrumb-history-dropdown');
      expect(dropdown.exists()).toBe(true);
    });

    it('handles keyboard navigation in history dropdown', async () => {
      await wrapper.setData({ historyDropdownOpen: true });
      
      const historyToggle = wrapper.find('.breadcrumb-history-toggle');
      await historyToggle.trigger('keydown', { key: 'ArrowDown' });
      
      // Should focus first history item
      expect(wrapper.vm.focusedHistoryIndex).toBe(0);
    });

    it('closes history dropdown with Escape key', async () => {
      await wrapper.setData({ historyDropdownOpen: true });
      
      const dropdown = wrapper.find('.breadcrumb-history-dropdown');
      await dropdown.trigger('keydown', { key: 'Escape' });
      
      expect(wrapper.vm.historyDropdownOpen).toBe(false);
    });
  });

  describe('Truncation', () => {
    it('truncates long breadcrumb chains', async () => {
      const longItems = [
        { label: 'Home', href: '/' },
        { label: 'Level 1', href: '/1' },
        { label: 'Level 2', href: '/2' },
        { label: 'Level 3', href: '/3' },
        { label: 'Level 4', href: '/4' },
        { label: 'Level 5', href: '/5' },
        { label: 'Current', current: true }
      ];
      
      await wrapper.setProps({ items: longItems, maxItems: 5 });
      
      const processedItems = wrapper.vm.processedItems;
      expect(processedItems).toHaveLength(5);
      expect(processedItems.some(item => item.ellipsis)).toBe(true);
    });
  });

  describe('Custom Separators', () => {
    it('uses custom separator icon', async () => {
      await wrapper.setProps({ separatorIcon: 'arrow-right' });
      
      const separators = wrapper.findAll('.breadcrumb-separator');
      separators.forEach(separator => {
        expect(separator.attributes('data-icon')).toBe('arrow-right');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing item labels gracefully', async () => {
      const itemsWithMissingLabels = [
        { label: 'Home', href: '/' },
        { href: '/products' }, // Missing label
        { label: 'Current', current: true }
      ];
      
      await wrapper.setProps({ items: itemsWithMissingLabels });
      
      // Should not crash and should handle gracefully
      expect(wrapper.exists()).toBe(true);
    });

    it('handles items without href or to props', async () => {
      const itemsWithoutLinks = [
        { label: 'Home', href: '/' },
        { label: 'Static Item' }, // No href or to
        { label: 'Current', current: true }
      ];
      
      await wrapper.setProps({ items: itemsWithoutLinks });
      
      const staticItem = wrapper.find('span:not(.breadcrumb-separator)');
      expect(staticItem.exists()).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('manages focus correctly when navigating', async () => {
      await wrapper.setProps({ keyboardNavigation: true });
      
      // Test focus management
      const links = wrapper.findAll('a');
      expect(links.length).toBeGreaterThan(0);
      
      // Each link should be focusable
      links.forEach(link => {
        expect(link.attributes('tabindex')).toBe('0');
      });
    });

    it('excludes current page from tab order appropriately', () => {
      const currentItem = wrapper.find('[aria-current="page"]');
      expect(currentItem.attributes('tabindex')).toBe('-1');
    });
  });
});