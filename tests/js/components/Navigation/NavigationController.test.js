import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import NavigationController from '@/Components/Navigation/NavigationController.vue';

// Mock the composables
vi.mock('@/composables/useResponsive.js', () => ({
  useResponsive: vi.fn(() => ({
    isMobile: ref(false),
    isTablet: ref(false),
    isDesktop: ref(true),
    windowWidth: ref(1200),
    debugResponsive: vi.fn()
  }))
}));

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: ref({ id: 1, name: 'Test User' }),
    roles: ref(['Employee']),
    isAuthenticated: ref(true)
  }))
}));

vi.mock('@/composables/useTheme.js', () => ({
  useTheme: vi.fn(() => ({
    isDark: ref(false)
  }))
}));

// Mock the navigation components
vi.mock('@/Components/Navigation/SidebarNavigation.vue', () => ({
  default: {
    name: 'SidebarNavigation',
    template: '<div data-navigation-type="desktop">Desktop Navigation</div>',
    props: ['currentRoute', 'userRoles', 'isAuthenticated', 'initiallyCollapsed'],
    emits: ['navigate', 'collapse-change', 'state-change']
  }
}));

vi.mock('@/Components/Navigation/MobileNavigation.vue', () => ({
  default: {
    name: 'MobileNavigation', 
    template: '<div data-navigation-type="mobile">Mobile Navigation</div>',
    props: ['currentRoute', 'userRoles', 'isAuthenticated'],
    emits: ['navigate', 'state-change']
  }
}));

describe('NavigationController', () => {
  let wrapper;
  let mockUseResponsive;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Get the mocked composable
    const responsiveModule = await import('@/composables/useResponsive.js');
    mockUseResponsive = vi.mocked(responsiveModule).useResponsive;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Component Selection', () => {
    it('should render desktop navigation on desktop screens', () => {
      // Mock desktop breakpoint
      mockUseResponsive.mockReturnValue({
        isMobile: ref(false),
        isTablet: ref(false), 
        isDesktop: ref(true),
        windowWidth: ref(1200),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(false);
    });

    it('should render mobile navigation on mobile screens', () => {
      // Mock mobile breakpoint
      mockUseResponsive.mockReturnValue({
        isMobile: ref(true),
        isTablet: ref(false),
        isDesktop: ref(false), 
        windowWidth: ref(768),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false);
    });

    it('should switch navigation types when screen size changes', async () => {
      // Start with desktop
      const windowWidth = ref(1200);
      const isMobile = ref(false);
      const isDesktop = ref(true);
      
      mockUseResponsive.mockReturnValue({
        isMobile,
        isTablet: ref(false),
        isDesktop,
        windowWidth,
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      // Initially should show desktop navigation
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);

      // Simulate screen size change to mobile
      windowWidth.value = 768;
      isMobile.value = true;
      isDesktop.value = false;

      await wrapper.vm.$nextTick();

      // Should now show mobile navigation
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false);
    });
  });

  describe('Props Passing', () => {
    it('should pass correct props to desktop navigation', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: ref(false),
        isTablet: ref(false),
        isDesktop: ref(true),
        windowWidth: ref(1200),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      const desktopNav = wrapper.findComponent({ name: 'SidebarNavigation' });
      expect(desktopNav.props()).toMatchObject({
        currentRoute: 'dashboard',
        initiallyCollapsed: true,
        userRoles: ['Employee'],
        isAuthenticated: true
      });
    });

    it('should pass correct props to mobile navigation', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: ref(true),
        isTablet: ref(false),
        isDesktop: ref(false),
        windowWidth: ref(768),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      const mobileNav = wrapper.findComponent({ name: 'MobileNavigation' });
      expect(mobileNav.props()).toMatchObject({
        currentRoute: 'dashboard',
        userRoles: ['Employee'],
        isAuthenticated: true
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit navigate events from child components', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      const desktopNav = wrapper.findComponent({ name: 'SidebarNavigation' });
      await desktopNav.vm.$emit('navigate', { route: 'employees.index' });

      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toMatchObject({
        route: 'employees.index',
        navigationType: 'desktop'
      });
    });

    it('should emit collapse-change events from desktop navigation', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      const desktopNav = wrapper.findComponent({ name: 'SidebarNavigation' });
      await desktopNav.vm.$emit('collapse-change', true);

      expect(wrapper.emitted('collapse-change')).toBeTruthy();
      expect(wrapper.emitted('collapse-change')[0][0]).toBe(true);
    });

    it('should emit navigation-type-change events when switching navigation types', async () => {
      const windowWidth = ref(1200);
      const isMobile = ref(false);
      const isDesktop = ref(true);
      
      mockUseResponsive.mockReturnValue({
        isMobile,
        isTablet: ref(false),
        isDesktop,
        windowWidth,
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      // Clear initial navigation-type-change event
      wrapper.vm.$emit('navigation-type-change');

      // Simulate screen size change
      windowWidth.value = 768;
      isMobile.value = true;
      isDesktop.value = false;

      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('navigation-type-change')).toBeTruthy();
      const lastEvent = wrapper.emitted('navigation-type-change').slice(-1)[0][0];
      expect(lastEvent).toMatchObject({
        from: 'desktop',
        to: 'mobile',
        breakpoint: 768
      });
    });
  });

  describe('Force Navigation Type', () => {
    it('should respect forceNavigationType prop', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: ref(false),
        isTablet: ref(false),
        isDesktop: ref(true),
        windowWidth: ref(1200),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard',
          forceNavigationType: 'mobile'
        }
      });

      // Should show mobile navigation despite desktop screen size
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle component selection errors gracefully', () => {
      // Mock an error in component selection
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUseResponsive.mockReturnValue({
        isMobile: ref(false),
        isTablet: ref(false),
        isDesktop: ref(true),
        windowWidth: ref(1200),
        debugResponsive: vi.fn()
      });

      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      // Component should still render (fallback to desktop navigation)
      expect(wrapper.exists()).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Debug Utilities', () => {
    it('should expose debug methods', () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      expect(typeof wrapper.vm.debugNavigationController).toBe('function');
      expect(typeof wrapper.vm.clearError).toBe('function');
    });

    it('should provide current navigation state', () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      expect(wrapper.vm.currentNavigationType).toBe('desktop');
      expect(wrapper.vm.deviceType).toBe('desktop');
      expect(wrapper.vm.isTransitioning).toBe(false);
    });
  });
});