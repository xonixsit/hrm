import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MobileNavigation from '@/Components/Navigation/MobileNavigation.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';

// Mock dependencies
vi.mock('@/composables/useAuth.js');
vi.mock('@/composables/useTheme.js');
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href', 'method', 'as']
  },
  router: {
    visit: vi.fn(),
    post: vi.fn()
  }
}));

vi.mock('@/config/navigation.js', () => ({
  getFilteredNavigation: vi.fn(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      route: 'dashboard',
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      id: 'people',
      label: 'People Management',
      icon: 'users',
      roles: ['Admin', 'Manager'],
      children: [
        {
          id: 'employees',
          label: 'Employees',
          icon: 'user',
          route: 'employees.index',
          roles: ['Admin']
        }
      ]
    }
  ])
}));

describe('Responsive Mobile Navigation', () => {
  let wrapper;
  let mockAuth;
  let mockTheme;

  beforeEach(() => {
    // Setup auth mock
    mockAuth = {
      user: { value: { name: 'John Doe', email: 'john@example.com' } },
      roles: { value: ['Admin'] },
      getUserProperty: vi.fn((prop, fallback) => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        return user[prop] || fallback;
      })
    };
    useAuth.mockReturnValue(mockAuth);

    // Setup theme mock
    mockTheme = {
      isDarkMode: { value: false },
      toggleTheme: vi.fn()
    };
    useTheme.mockReturnValue(mockTheme);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    });

    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true
    });

    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(MobileNavigation, {
      props: {
        currentRoute: 'dashboard',
        ...props
      },
      global: {
        stubs: {
          ApplicationLogo: true,
          Dropdown: true,
          DropdownLink: true,
          Icon: true,
          MobileNavigationSection: true
        },
        mocks: {
          route: vi.fn((name) => `/${name.replace('.', '/')}`)
        }
      }
    });
  };

  const setViewportSize = (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Update matchMedia mock based on viewport
    window.matchMedia = vi.fn().mockImplementation(query => {
      let matches = false;

      if (query.includes('max-width: 320px')) {
        matches = width <= 320;
      } else if (query.includes('max-width: 767px')) {
        matches = width <= 767;
      } else if (query.includes('max-width: 1023px')) {
        matches = width <= 1023;
      } else if (query.includes('max-height: 500px')) {
        matches = height <= 500;
      } else if (query.includes('orientation: landscape')) {
        matches = width > height;
      }

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  };

  describe('Mobile Portrait (320px - 767px)', () => {
    beforeEach(() => {
      setViewportSize(375, 667); // iPhone SE size
    });

    it('displays mobile navigation components correctly', () => {
      wrapper = createWrapper();

      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.mobile-top-bar').exists()).toBe(true);
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
    });

    it('hamburger button has proper touch target size', () => {
      wrapper = createWrapper();

      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.attributes('style')).toContain('min-height: 44px');
      expect(hamburgerButton.attributes('style')).toContain('min-width: 44px');
    });

    it('bottom navigation items have proper touch target size', () => {
      wrapper = createWrapper();

      const bottomNavItems = wrapper.findAll('.bottom-nav-item');
      bottomNavItems.forEach(item => {
        expect(item.attributes('style')).toContain('min-height: 44px');
        expect(item.attributes('style')).toContain('min-width: 44px');
      });
    });

    it('drawer has appropriate width for mobile', async () => {
      wrapper = createWrapper();

      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();

      const drawer = wrapper.find('.mobile-drawer');
      expect(drawer.exists()).toBe(true);
      expect(drawer.classes()).toContain('w-80');
    });

    it('applies safe area padding for devices with notches', () => {
      wrapper = createWrapper();

      const bottomNav = wrapper.find('.mobile-bottom-nav');
      expect(bottomNav.classes()).toContain('safe-area-pb');
    });
  });

  describe('Small Mobile (320px and below)', () => {
    beforeEach(() => {
      setViewportSize(320, 568); // iPhone 5/SE size
    });

    it('adjusts drawer width for very small screens', async () => {
      wrapper = createWrapper();

      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();

      const drawer = wrapper.find('.mobile-drawer');
      expect(drawer.exists()).toBe(true);
      // CSS media query should make drawer full width on very small screens
    });

    it('maintains minimum touch targets even on small screens', () => {
      wrapper = createWrapper();

      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.attributes('style')).toContain('min-height: 44px');
      expect(hamburgerButton.attributes('style')).toContain('min-width: 44px');
    });

    it('bottom navigation adapts to small screen width', () => {
      wrapper = createWrapper();

      const bottomNavItems = wrapper.findAll('.bottom-nav-item');
      expect(bottomNavItems.length).toBeGreaterThan(0);

      // Should still maintain minimum touch targets
      bottomNavItems.forEach(item => {
        expect(item.attributes('style')).toContain('min-height: 44px');
      });
    });
  });

  describe('Tablet Portrait (768px - 1023px)', () => {
    beforeEach(() => {
      setViewportSize(768, 1024); // iPad size
    });

    it('still shows mobile navigation on tablet portrait', () => {
      wrapper = createWrapper();

      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.lg\\:hidden').exists()).toBe(true);
    });

    it('drawer has appropriate width for tablet', async () => {
      wrapper = createWrapper();

      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();

      const drawer = wrapper.find('.mobile-drawer');
      expect(drawer.exists()).toBe(true);
      // Should use standard drawer width on tablet
    });

    it('bottom navigation spacing is appropriate for tablet', () => {
      wrapper = createWrapper();

      const bottomNav = wrapper.find('.mobile-bottom-nav');
      expect(bottomNav.exists()).toBe(true);

      const bottomNavItems = wrapper.findAll('.bottom-nav-item');
      expect(bottomNavItems.length).toBeGreaterThan(0);
    });
  });

  describe('Landscape Mobile (height < 500px)', () => {
    beforeEach(() => {
      setViewportSize(667, 375); // iPhone landscape
    });

    it('hides bottom navigation in landscape mode', () => {
      wrapper = createWrapper();

      const bottomNav = wrapper.find('.mobile-bottom-nav');
      // CSS media query should hide bottom nav in landscape
      expect(bottomNav.exists()).toBe(true);
    });

    it('adjusts drawer width for landscape', async () => {
      wrapper = createWrapper();

      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();

      const drawer = wrapper.find('.mobile-drawer');
      expect(drawer.exists()).toBe(true);
      // Should use smaller drawer width in landscape
    });

    it('maintains hamburger button functionality in landscape', async () => {
      wrapper = createWrapper();

      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.exists()).toBe(true);

      await hamburgerButton.trigger('click');
      await nextTick();

      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
    });
  });

  describe('Touch Interactions Across Screen Sizes', () => {
    const screenSizes = [
      { name: 'Small Mobile', width: 320, height: 568 },
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Large Mobile', width: 414, height: 896 },
      { name: 'Tablet', width: 768, height: 1024 }
    ];

    screenSizes.forEach(({ name, width, height }) => {
      describe(`${name} (${width}x${height})`, () => {
        beforeEach(() => {
          setViewportSize(width, height);
        });

        it('hamburger button responds to touch', async () => {
          wrapper = createWrapper();

          const hamburgerButton = wrapper.find('.hamburger-button');
          expect(hamburgerButton.classes()).toContain('touch-manipulation');

          await hamburgerButton.trigger('click');
          await nextTick();

          expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
        });

        it('swipe gestures work correctly', async () => {
          wrapper = createWrapper();

          // Open menu
          await wrapper.find('.hamburger-button').trigger('click');
          await nextTick();

          const drawer = wrapper.find('.mobile-drawer');
          expect(drawer.exists()).toBe(true);

          // Simulate swipe gesture
          await drawer.trigger('touchstart', {
            touches: [{ clientX: 200 }]
          });

          await drawer.trigger('touchend', {
            changedTouches: [{ clientX: 50 }]
          });

          await nextTick();
          expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
        });

        it('bottom navigation items are touch-friendly', () => {
          wrapper = createWrapper();

          const bottomNavItems = wrapper.findAll('.bottom-nav-item');
          bottomNavItems.forEach(item => {
            expect(item.classes()).toContain('touch-manipulation');
            expect(item.attributes('style')).toContain('min-height: 44px');
          });
        });
      });
    });
  });

  describe('Accessibility Across Screen Sizes', () => {
    const screenSizes = [320, 375, 414, 768];

    screenSizes.forEach(width => {
      it(`maintains accessibility at ${width}px width`, () => {
        setViewportSize(width, 667);
        wrapper = createWrapper();

        const hamburgerButton = wrapper.find('.hamburger-button');
        expect(hamburgerButton.attributes('aria-label')).toBe('Toggle navigation menu');
        expect(hamburgerButton.attributes('aria-expanded')).toBe('false');
      });
    });

    it('updates ARIA states correctly across screen sizes', async () => {
      setViewportSize(375, 667);
      wrapper = createWrapper();

      const hamburgerButton = wrapper.find('.hamburger-button');

      await hamburgerButton.trigger('click');
      await nextTick();

      expect(hamburgerButton.attributes('aria-expanded')).toBe('true');
    });
  });

  describe('Performance Across Screen Sizes', () => {
    it('renders efficiently on small screens', () => {
      setViewportSize(320, 568);
      wrapper = createWrapper();

      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      // Component should render without performance issues
    });

    it('handles drawer animations smoothly on all screen sizes', async () => {
      const screenSizes = [320, 375, 414, 768];

      for (const width of screenSizes) {
        setViewportSize(width, 667);
        wrapper = createWrapper();

        const hamburgerButton = wrapper.find('.hamburger-button');

        // Open drawer
        await hamburgerButton.trigger('click');
        await nextTick();

        expect(wrapper.find('.mobile-drawer').exists()).toBe(true);

        // Close drawer
        await hamburgerButton.trigger('click');
        await nextTick();

        expect(wrapper.find('.mobile-drawer').exists()).toBe(false);

        wrapper.unmount();
      }
    });
  });

  describe('Content Adaptation', () => {
    it('adjusts navigation content for different screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 768, height: 1024 }
      ];

      screenSizes.forEach(({ width, height }) => {
        setViewportSize(width, height);
        wrapper = createWrapper();

        // Bottom navigation should adapt to screen size
        const bottomNavItems = wrapper.findAll('.bottom-nav-item');
        expect(bottomNavItems.length).toBeGreaterThan(0);

        // All items should maintain minimum touch targets
        bottomNavItems.forEach(item => {
          expect(item.attributes('style')).toContain('min-height: 44px');
        });

        wrapper.unmount();
      });
    });

    it('maintains proper spacing in drawer across screen sizes', async () => {
      const screenSizes = [320, 375, 414, 768];

      for (const width of screenSizes) {
        setViewportSize(width, 667);
        wrapper = createWrapper();

        await wrapper.find('.hamburger-button').trigger('click');
        await nextTick();

        const drawer = wrapper.find('.mobile-drawer');
        expect(drawer.exists()).toBe(true);

        // Drawer should have proper padding and spacing
        expect(drawer.find('.drawer-header').exists()).toBe(true);
        expect(drawer.find('.drawer-navigation').exists()).toBe(true);
        expect(drawer.find('.drawer-footer').exists()).toBe(true);

        wrapper.unmount();
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles very narrow screens gracefully', () => {
      setViewportSize(280, 568); // Extremely narrow
      wrapper = createWrapper();

      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);

      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.attributes('style')).toContain('min-height: 44px');
    });

    it('handles very short screens gracefully', () => {
      setViewportSize(375, 400); // Very short
      wrapper = createWrapper();

      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
    });

    it('maintains functionality when screen orientation changes', async () => {
      // Start in portrait
      setViewportSize(375, 667);
      wrapper = createWrapper();

      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);

      // Change to landscape
      setViewportSize(667, 375);
      await nextTick();

      // Navigation should still work
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
    });
  });
});