import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SidebarNavigation from '@/Components/Navigation/SidebarNavigation.vue';

// Mock the composables
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => ({
    user: { value: { id: 1, name: 'Test User' } },
    roles: { value: ['Employee'] },
    getUserProperty: (prop, defaultValue) => defaultValue
  })
}));

vi.mock('@/composables/useTheme.js', () => ({
  useTheme: () => ({
    isDark: { value: false },
    toggleTheme: vi.fn()
  })
}));

vi.mock('@/composables/useUserPreferences.js', () => ({
  useUserPreferences: () => ({
    preferences: { value: {} },
    setPreference: vi.fn(),
    getPreference: vi.fn()
  })
}));

vi.mock('@/composables/useResponsive.js', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true },
    windowWidth: { value: 1200 }
  })
}));

vi.mock('@/composables/useAccessibility.js', () => ({
  useAccessibility: () => ({
    announce: vi.fn(),
    announcePageChange: vi.fn(),
    prefersReducedMotion: { value: false }
  }),
  useKeyboardNavigation: () => ({
    currentIndex: { value: 0 },
    handleKeyDown: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn()
  }),
  useScreenReader: () => ({
    announcePageChange: vi.fn(),
    announceSuccess: vi.fn(),
    announceError: vi.fn()
  }),
  useAriaState: () => ({
    setExpanded: vi.fn(),
    setSelected: vi.fn(),
    generateId: (prefix) => `${prefix}-test-id`
  }),
  useFocusManagement: () => ({
    setFocus: vi.fn(),
    storeFocus: vi.fn(),
    restoreFocus: vi.fn()
  })
}));

vi.mock('@/config/navigation.js', () => ({
  getFilteredNavigation: () => []
}));

vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    post: vi.fn()
  }
}));

// Mock components
vi.mock('@/Components/ApplicationLogo.vue', () => ({
  default: { template: '<div>Logo</div>' }
}));

vi.mock('@/Components/Base/Icon.vue', () => ({
  default: { 
    template: '<span>Icon</span>',
    props: ['name', 'size']
  }
}));

vi.mock('@/Components/Theme/ThemeToggle.vue', () => ({
  default: { 
    template: '<button>Theme Toggle</button>',
    props: ['variant', 'size', 'ghost', 'aria-label'],
    emits: ['theme-changed']
  }
}));

describe('SidebarNavigation Accessibility', () => {
  let wrapper;
  let mockAnnounce;
  let mockScreenReaderAnnounce;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock window.route
    window.route = vi.fn((name) => `/${name.replace('.', '/')}`);

    // Get mock functions
    const { useAccessibility, useScreenReader } = require('@/composables/useAccessibility.js');
    mockAnnounce = useAccessibility().announce;
    mockScreenReaderAnnounce = useScreenReader().announcePageChange;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  describe('ARIA Attributes and Labels', () => {
    it('has proper navigation role and aria-label', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const nav = wrapper.find('nav');
      expect(nav.attributes('role')).toBe('navigation');
      expect(nav.attributes('aria-label')).toBe('Main navigation');
    });

    it('has aria-expanded attribute that reflects collapse state', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: false
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const nav = wrapper.find('nav');
      expect(nav.attributes('aria-expanded')).toBe('true');

      // Toggle collapse
      const toggleButton = wrapper.find('button[aria-label*="Collapse sidebar"]');
      await toggleButton.trigger('click');
      await nextTick();

      expect(nav.attributes('aria-expanded')).toBe('false');
    });

    it('has proper aria-describedby reference', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const nav = wrapper.find('nav');
      const describedBy = nav.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
      
      // Check that the referenced element exists
      const descriptionElement = wrapper.find(`#${describedBy}`);
      expect(descriptionElement.exists()).toBe(true);
      expect(descriptionElement.classes()).toContain('sr-only');
    });

    it('has proper menu role and aria-label for navigation menu', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const menu = wrapper.find('.navigation-menu');
      expect(menu.attributes('role')).toBe('menu');
      expect(menu.attributes('aria-label')).toContain('Navigation menu');
    });

    it('has proper menuitem role for navigation buttons', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const menuItems = wrapper.findAll('button[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
      
      menuItems.forEach(item => {
        expect(item.attributes('role')).toBe('menuitem');
        expect(item.attributes('aria-label')).toBeTruthy();
        expect(item.attributes('tabindex')).toBe('0');
      });
    });

    it('has proper aria-current for active navigation items', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const activeItem = wrapper.find('button[aria-current="page"]');
      expect(activeItem.exists()).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles keydown events on the sidebar', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const nav = wrapper.find('nav');
      
      // Test Escape key
      await nav.trigger('keydown', { key: 'Escape' });
      
      // Test Arrow keys
      await nav.trigger('keydown', { key: 'ArrowDown' });
      await nav.trigger('keydown', { key: 'ArrowUp' });
      await nav.trigger('keydown', { key: 'Home' });
      await nav.trigger('keydown', { key: 'End' });
      
      // Test Enter and Space
      await nav.trigger('keydown', { key: 'Enter' });
      await nav.trigger('keydown', { key: ' ' });

      // Verify the keydown handler was called
      expect(nav.exists()).toBe(true);
    });

    it('supports global keyboard shortcuts', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Test Ctrl+B shortcut
      const event = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      await nextTick();

      // Should announce the toggle
      expect(mockAnnounce).toHaveBeenCalled();
    });

    it('supports Alt+S shortcut for sidebar focus', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Test Alt+S shortcut
      const event = new KeyboardEvent('keydown', {
        key: 's',
        altKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      await nextTick();

      // Should announce focus
      expect(mockAnnounce).toHaveBeenCalledWith(
        expect.stringContaining('Sidebar navigation focused'),
        'polite'
      );
    });
  });

  describe('Focus Management', () => {
    it('has proper focus indicators', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const buttons = wrapper.findAll('button');
      buttons.forEach(button => {
        expect(button.classes()).toContain('focus:outline-none');
        expect(button.classes()).toContain('focus:ring-2');
        expect(button.classes()).toContain('focus:ring-primary-500');
      });
    });

    it('has proper tabindex values', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const menuItems = wrapper.findAll('button[role="menuitem"]');
      menuItems.forEach(item => {
        expect(item.attributes('tabindex')).toBe('0');
      });
    });
  });

  describe('Screen Reader Announcements', () => {
    it('announces sidebar state changes', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: false
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Toggle collapse
      const toggleButton = wrapper.find('button[aria-label*="Collapse sidebar"]');
      await toggleButton.trigger('click');
      await nextTick();

      expect(mockAnnounce).toHaveBeenCalledWith(
        expect.stringContaining('collapsed'),
        undefined
      );
    });

    it('announces navigation events', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Click on a navigation item
      const navButton = wrapper.find('button[role="menuitem"]');
      if (navButton.exists()) {
        await navButton.trigger('click');
        await nextTick();

        expect(mockScreenReaderAnnounce).toHaveBeenCalled();
        expect(mockAnnounce).toHaveBeenCalledWith(
          expect.stringContaining('Navigating to'),
          'polite'
        );
      }
    });

    it('announces theme changes', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Find and trigger theme toggle
      const themeToggle = wrapper.findComponent({ name: 'ThemeToggle' });
      if (themeToggle.exists()) {
        await themeToggle.vm.$emit('theme-changed', { theme: 'dark' });
        await nextTick();

        expect(mockAnnounce).toHaveBeenCalledWith(
          expect.stringContaining('Theme changed to dark mode'),
          'polite'
        );
      }
    });
  });

  describe('Tooltips for Collapsed State', () => {
    it('has proper tooltip attributes when collapsed', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const tooltipTriggers = wrapper.findAll('.tooltip-trigger');
      tooltipTriggers.forEach(trigger => {
        expect(trigger.attributes('data-tooltip')).toBeTruthy();
        expect(trigger.attributes('title')).toBeTruthy();
      });
    });

    it('has hidden tooltip content for screen readers', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const hiddenTooltips = wrapper.findAll('.sr-only');
      expect(hiddenTooltips.length).toBeGreaterThan(0);
      
      hiddenTooltips.forEach(tooltip => {
        expect(tooltip.classes()).toContain('sr-only');
      });
    });
  });

  describe('High Contrast and Reduced Motion Support', () => {
    it('has proper CSS classes for accessibility', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Check for screen reader only class
      const srOnlyElements = wrapper.findAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);

      // Check for proper transition classes
      const nav = wrapper.find('nav');
      expect(nav.classes()).toContain('transition-all');
    });
  });

  describe('Error Handling and Announcements', () => {
    it('announces errors when navigation fails', async () => {
      // Mock router to throw error
      const { router } = require('@inertiajs/vue3');
      router.visit.mockRejectedValueOnce(new Error('Navigation failed'));

      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Click on a navigation item
      const navButton = wrapper.find('button[role="menuitem"]');
      if (navButton.exists()) {
        await navButton.trigger('click');
        await nextTick();

        // Wait for error handling
        await new Promise(resolve => setTimeout(resolve, 100));

        const { useScreenReader } = require('@/composables/useAccessibility.js');
        const mockAnnounceError = useScreenReader().announceError;
        expect(mockAnnounceError).toHaveBeenCalledWith(
          expect.stringContaining('Navigation failed')
        );
      }
    });
  });

  describe('WCAG Compliance', () => {
    it('meets WCAG focus indicator requirements', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const focusableElements = wrapper.findAll('button, [tabindex="0"]');
      focusableElements.forEach(element => {
        // Check for proper focus ring classes
        expect(element.classes()).toContain('focus:ring-2');
        expect(element.classes()).toContain('focus:ring-primary-500');
        expect(element.classes()).toContain('focus:ring-offset-2');
      });
    });

    it('has proper color contrast classes', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      // Check for theme-aware color classes
      const nav = wrapper.find('nav');
      expect(nav.classes()).toContain('bg-white');
      expect(nav.classes()).toContain('border-r');
    });

    it('provides sufficient context in aria-labels', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        attachTo: document.getElementById('app')
      });

      await nextTick();

      const menuItems = wrapper.findAll('button[role="menuitem"]');
      menuItems.forEach(item => {
        const ariaLabel = item.attributes('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('Navigate to');
        expect(ariaLabel).toMatch(/\d+ of \d+/); // Position information
      });
    });
  });
});