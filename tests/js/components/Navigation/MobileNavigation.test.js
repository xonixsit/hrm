import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MobileNavigation from '@/Components/Navigation/MobileNavigation.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';
import { useResponsive } from '@/composables/useResponsive.js';

// Mock dependencies
vi.mock('@/composables/useAuth.js');
vi.mock('@/composables/useTheme.js');
vi.mock('@/composables/useResponsive.js');
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

describe('MobileNavigation', () => {
  let wrapper;
  let mockAuth;
  let mockTheme;
  let mockResponsive;

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

    // Setup responsive mock - default to mobile
    mockResponsive = {
      isMobile: { value: true },
      isTablet: { value: false },
      isDesktop: { value: false },
      windowWidth: { value: 768 }
    };
    useResponsive.mockReturnValue(mockResponsive);

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
          ApplicationLogo: {
            template: '<div class="application-logo"></div>'
          },
          Dropdown: {
            template: '<div class="dropdown"><slot name="trigger"></slot><slot name="content"></slot></div>',
            props: ['align', 'width']
          },
          DropdownLink: {
            template: '<a class="dropdown-link"><slot /></a>',
            props: ['href', 'method', 'as']
          },
          Icon: {
            template: '<span class="icon"></span>',
            props: ['name', 'size']
          },
          MobileNavigationSection: {
            template: '<div class="mobile-nav-section"></div>',
            props: ['section', 'currentRoute', 'userRoles'],
            emits: ['navigate']
          },
          Link: {
            template: '<a class="link"><slot /></a>',
            props: ['href']
          }
        },
        mocks: {
          route: vi.fn((name) => `/${name.replace('.', '/')}`)
        }
      }
    });
  };

  describe('Component Rendering', () => {
    it('renders mobile navigation correctly on mobile screens', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.mobile-top-bar').exists()).toBe(true);
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
    });

    it('does not render on desktop screens (≥1024px)', () => {
      // Mock desktop screen
      mockResponsive.isMobile.value = false;
      mockResponsive.isDesktop.value = true;
      mockResponsive.windowWidth.value = 1024;
      
      wrapper = createWrapper();
      
      expect(wrapper.find('.mobile-navigation').exists()).toBe(false);
      expect(wrapper.html()).toBe('<!--v-if-->');
    });

    it('renders on tablet screens (<1024px)', () => {
      // Mock tablet screen
      mockResponsive.isMobile.value = true;
      mockResponsive.isTablet.value = true;
      mockResponsive.windowWidth.value = 768;
      
      wrapper = createWrapper();
      
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
    });

    it('renders on small mobile screens', () => {
      // Mock small mobile screen
      mockResponsive.isMobile.value = true;
      mockResponsive.windowWidth.value = 320;
      
      wrapper = createWrapper();
      
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
    });

    it('displays hamburger menu button with proper touch sizing', () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.exists()).toBe(true);
      expect(hamburgerButton.attributes('style')).toContain('min-height: 44px');
      expect(hamburgerButton.attributes('style')).toContain('min-width: 44px');
    });

    it('displays app logo and name', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('ApplicationLogo-stub').exists()).toBe(true);
      expect(wrapper.text()).toContain('HR Management');
    });

    it('displays user menu with proper touch sizing', () => {
      wrapper = createWrapper();
      
      const userMenuButton = wrapper.find('Dropdown-stub button');
      expect(userMenuButton.exists()).toBe(true);
      expect(userMenuButton.attributes('style')).toContain('min-height: 44px');
    });
  });

  describe('Mobile Menu Toggle', () => {
    it('toggles mobile menu when hamburger button is clicked', async () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      
      // Initially closed
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
      
      // Click to open
      await hamburgerButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
      expect(hamburgerButton.classes()).toContain('active');
    });

    it('prevents body scroll when menu is open', async () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      await hamburgerButton.trigger('click');
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when menu is closed', async () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      
      // Open menu
      await hamburgerButton.trigger('click');
      expect(document.body.style.overflow).toBe('hidden');
      
      // Close menu
      await hamburgerButton.trigger('click');
      expect(document.body.style.overflow).toBe('');
    });

    it('closes menu when backdrop is clicked', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
      
      // Click backdrop
      await wrapper.find('.mobile-backdrop').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
    });
  });

  describe('Touch Gestures', () => {
    it('handles touch start event', async () => {
      wrapper = createWrapper();
      
      // Open menu first
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const drawer = wrapper.find('.mobile-drawer');
      
      // Simulate touch start with custom event
      await drawer.trigger('touchstart', {
        touches: [{ clientX: 100 }]
      });
      
      // Should not throw error
      expect(wrapper.vm).toBeDefined();
    });

    it('handles swipe gesture to close menu', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const drawer = wrapper.find('.mobile-drawer');
      
      // Simulate swipe left gesture
      await drawer.trigger('touchstart', {
        touches: [{ clientX: 200 }]
      });
      
      await drawer.trigger('touchend', {
        changedTouches: [{ clientX: 50 }] // Swipe left 150px
      });
      
      // Menu should close after significant left swipe
      await nextTick();
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
    });
  });

  describe('Bottom Navigation', () => {
    it('renders bottom navigation with touch-friendly sizing', () => {
      wrapper = createWrapper();
      
      const bottomNav = wrapper.find('.mobile-bottom-nav');
      expect(bottomNav.exists()).toBe(true);
      
      const navItems = wrapper.findAll('.bottom-nav-item');
      navItems.forEach(item => {
        expect(item.attributes('style')).toContain('min-height: 44px');
        expect(item.attributes('style')).toContain('min-width: 44px');
      });
    });

    it('filters bottom navigation items based on user roles', () => {
      wrapper = createWrapper();
      
      const bottomNavItems = wrapper.findAll('.bottom-nav-item');
      expect(bottomNavItems.length).toBeGreaterThan(0);
      
      // Should show items appropriate for Admin role
      expect(wrapper.text()).toContain('Home');
      expect(wrapper.text()).toContain('Time');
      expect(wrapper.text()).toContain('Projects');
    });

    it('highlights active bottom navigation item', () => {
      wrapper = createWrapper({ currentRoute: 'dashboard' });
      
      const activeItem = wrapper.find('.bottom-nav-item.text-primary-600');
      expect(activeItem.exists()).toBe(true);
    });
  });

  describe('Navigation Events', () => {
    it('emits navigate event when navigation item is clicked', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      // Find and click a navigation section
      const navSection = wrapper.find('MobileNavigationSection-stub');
      await navSection.vm.$emit('navigate', {
        route: 'dashboard',
        item: { id: 'dashboard' }
      });
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({
        route: 'dashboard',
        item: { id: 'dashboard' }
      });
    });

    it('closes menu after navigation', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
      
      // Trigger navigation
      const navSection = wrapper.find('MobileNavigationSection-stub');
      await navSection.vm.$emit('navigate', { route: 'dashboard' });
      
      // Menu should close
      await nextTick();
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
    });
  });

  describe('Theme Integration', () => {
    it('displays theme toggle button', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const themeButton = wrapper.find('.drawer-footer button');
      expect(themeButton.exists()).toBe(true);
      expect(themeButton.text()).toContain('Light Mode');
    });

    it('calls theme toggle when button is clicked', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const themeButton = wrapper.find('.drawer-footer button');
      await themeButton.trigger('click');
      
      expect(mockTheme.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on hamburger button', () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.attributes('aria-expanded')).toBe('false');
      expect(hamburgerButton.attributes('aria-label')).toBe('Toggle navigation menu');
    });

    it('updates ARIA expanded state when menu opens', async () => {
      wrapper = createWrapper();
      
      const hamburgerButton = wrapper.find('.hamburger-button');
      
      await hamburgerButton.trigger('click');
      await nextTick();
      
      expect(hamburgerButton.attributes('aria-expanded')).toBe('true');
    });

    it('handles escape key to close menu', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
      
      // Press escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      await nextTick();
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false);
    });
  });

  describe('Responsive Behavior', () => {
    it('applies safe area padding for mobile devices', () => {
      wrapper = createWrapper();
      
      const bottomNav = wrapper.find('.mobile-bottom-nav');
      expect(bottomNav.classes()).toContain('safe-area-pb');
    });

    it('has touch manipulation class on interactive elements', () => {
      wrapper = createWrapper();
      
      const touchElements = wrapper.findAll('.touch-manipulation');
      expect(touchElements.length).toBeGreaterThan(0);
      
      touchElements.forEach(element => {
        expect(element.classes()).toContain('touch-manipulation');
      });
    });
  });

  describe('User Information Display', () => {
    it('displays user name and role in drawer header', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const drawerHeader = wrapper.find('.drawer-header');
      expect(drawerHeader.text()).toContain('John Doe');
      expect(drawerHeader.text()).toContain('Administrator');
    });

    it('displays user information in mobile user menu', () => {
      wrapper = createWrapper();
      
      // Check dropdown content
      const dropdown = wrapper.find('dropdown-stub');
      expect(dropdown.exists()).toBe(true);
    });
  });

  describe('Touch Target Requirements', () => {
    it('ensures all interactive elements meet 44px minimum touch target size', () => {
      wrapper = createWrapper();
      
      // Check hamburger button
      const hamburgerButton = wrapper.find('.hamburger-button');
      expect(hamburgerButton.attributes('style')).toContain('min-height: 44px');
      expect(hamburgerButton.attributes('style')).toContain('min-width: 44px');
      
      // Check user menu button
      const userMenuButton = wrapper.find('Dropdown-stub button');
      expect(userMenuButton.attributes('style')).toContain('min-height: 44px');
      expect(userMenuButton.attributes('style')).toContain('min-width: 44px');
      
      // Check bottom navigation items
      const bottomNavItems = wrapper.findAll('.bottom-nav-item');
      bottomNavItems.forEach(item => {
        expect(item.attributes('style')).toContain('min-height: 44px');
        expect(item.attributes('style')).toContain('min-width: 44px');
      });
    });

    it('ensures drawer footer buttons meet touch target requirements', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      // Check theme toggle button
      const themeButton = wrapper.find('.drawer-footer button');
      expect(themeButton.attributes('style')).toContain('min-height: 44px');
      
      // Check settings link
      const settingsLink = wrapper.find('.drawer-footer a');
      expect(settingsLink.attributes('style')).toContain('min-height: 44px');
    });
  });

  describe('Mobile-Only Rendering', () => {
    it('does not render any desktop-specific elements', () => {
      wrapper = createWrapper();
      
      // Should not have desktop sidebar classes or elements
      expect(wrapper.find('.sidebar').exists()).toBe(false);
      expect(wrapper.find('.desktop-nav').exists()).toBe(false);
      expect(wrapper.find('.sidebar-toggle').exists()).toBe(false);
      
      // Should only have mobile-specific elements
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.mobile-top-bar').exists()).toBe(true);
      expect(wrapper.find('.mobile-drawer').exists()).toBe(false); // Initially closed
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
    });

    it('uses mobile-specific navigation patterns', () => {
      wrapper = createWrapper();
      
      // Should have hamburger menu
      expect(wrapper.find('.hamburger-button').exists()).toBe(true);
      
      // Should have bottom navigation
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
      
      // Should have mobile drawer (when opened)
      wrapper.find('.hamburger-button').trigger('click');
      expect(wrapper.find('.mobile-drawer').exists()).toBe(true);
    });

    it('provides equivalent functionality to desktop navigation', () => {
      wrapper = createWrapper();
      
      // Should have navigation sections
      expect(wrapper.find('MobileNavigationSection-stub').exists()).toBe(true);
      
      // Should have user menu
      expect(wrapper.find('Dropdown-stub').exists()).toBe(true);
      
      // Should have theme toggle (in drawer)
      wrapper.find('.hamburger-button').trigger('click');
      expect(wrapper.find('.drawer-footer button').exists()).toBe(true);
      
      // Should have settings link
      expect(wrapper.find('.drawer-footer a').exists()).toBe(true);
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode classes when dark mode is enabled', () => {
      mockTheme.isDarkMode.value = true;
      wrapper = createWrapper();
      
      // Check if dark mode classes are applied
      const topBar = wrapper.find('.mobile-top-bar');
      expect(topBar.classes()).toContain('dark:bg-neutral-900');
      
      const bottomNav = wrapper.find('.mobile-bottom-nav');
      expect(bottomNav.classes()).toContain('dark:bg-neutral-900');
    });

    it('shows correct theme toggle text based on current theme', async () => {
      wrapper = createWrapper();
      
      // Open menu
      await wrapper.find('.hamburger-button').trigger('click');
      await nextTick();
      
      const themeButton = wrapper.find('.drawer-footer button');
      expect(themeButton.text()).toContain('Dark Mode');
      
      // Switch to dark mode
      mockTheme.isDarkMode.value = true;
      await nextTick();
      
      expect(themeButton.text()).toContain('Light Mode');
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', async () => {
      wrapper = createWrapper();
      
      // Mock route function to throw error
      wrapper.vm.$options.global.mocks.route = vi.fn(() => {
        throw new Error('Route not found');
      });
      
      // Should not crash when clicking bottom nav item
      const bottomNavItem = wrapper.find('.bottom-nav-item');
      await bottomNavItem.trigger('click');
      
      expect(wrapper.vm).toBeDefined();
    });

    it('dispatches navigation error events', async () => {
      wrapper = createWrapper();
      
      const eventSpy = vi.spyOn(window, 'dispatchEvent');
      
      // Trigger navigation with invalid route
      const navSection = wrapper.find('MobileNavigationSection-stub');
      await navSection.vm.$emit('navigate', { route: 'invalid.route' });
      
      // Should dispatch error event
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigation-error'
        })
      );
    });
  });
});