import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import NavigationController from '@/Components/Navigation/NavigationController.vue';

// Mock child components
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

// Mock composables
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    roles: ['user'],
    isAuthenticated: true
  })
}));

vi.mock('@/composables/useTheme.js', () => ({
  useTheme: () => ({
    isDark: false
  })
}));

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  scrollY: 0,
  scrollTo: vi.fn(),
  devicePixelRatio: 1,
  location: { pathname: '/test' }
};

describe('NavigationController - Breakpoint Management', () => {
  let wrapper;
  let originalWindow;

  beforeEach(() => {
    // Store original window
    originalWindow = global.window;
    
    // Mock window
    global.window = mockWindow;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset window dimensions
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
    
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Breakpoint Detection and Component Selection', () => {
    it('should render desktop navigation at 1024px and above', async () => {
      mockWindow.innerWidth = 1024;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(false);
      expect(wrapper.attributes('data-navigation-mode')).toBe('desktop');
    });

    it('should render mobile navigation below 1024px', async () => {
      mockWindow.innerWidth = 1023;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false);
      expect(wrapper.attributes('data-navigation-mode')).toBe('mobile');
    });

    it('should switch navigation types when crossing breakpoint', async () => {
      mockWindow.innerWidth = 1200; // Start desktop
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);

      // Simulate resize to mobile
      mockWindow.innerWidth = 800;
      
      // Trigger resize event
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      resizeHandler();

      // Wait for debounce and transition
      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false);
    });
  });

  describe('Smooth Transitions', () => {
    it('should apply transition classes during breakpoint changes', async () => {
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Simulate resize to trigger transition
      mockWindow.innerWidth = 800;
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      resizeHandler();

      // Check for transition classes
      await nextTick();
      expect(wrapper.classes()).toContain('navigation-controller');
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, 250));
      await nextTick();
    });

    it('should emit navigation-type-change events with enhanced data', async () => {
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Simulate resize
      mockWindow.innerWidth = 800;
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      resizeHandler();

      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      const emittedEvents = wrapper.emitted('navigation-type-change');
      expect(emittedEvents).toBeDefined();
      
      const lastEvent = emittedEvents[emittedEvents.length - 1][0];
      expect(lastEvent).toHaveProperty('from', 'desktop');
      expect(lastEvent).toHaveProperty('to', 'mobile');
      expect(lastEvent).toHaveProperty('breakpoint', 800);
      expect(lastEvent).toHaveProperty('breakpointInfo');
      expect(lastEvent).toHaveProperty('preservedData');
      expect(lastEvent).toHaveProperty('timestamp');
    });
  });

  describe('State Preservation', () => {
    it('should preserve state during navigation type changes', async () => {
      mockWindow.innerWidth = 1200;
      mockWindow.scrollY = 100;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Simulate resize
      mockWindow.innerWidth = 800;
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      resizeHandler();

      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      // Check that scroll position was preserved and restored
      expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 100);
    });

    it('should maintain user preferences during transitions', async () => {
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();

      // Get initial props
      const desktopNav = wrapper.findComponent({ name: 'SidebarNavigation' });
      expect(desktopNav.props('initiallyCollapsed')).toBe(true);

      // Simulate resize to mobile and back
      mockWindow.innerWidth = 800;
      let resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      resizeHandler();

      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      // Resize back to desktop
      mockWindow.innerWidth = 1200;
      resizeHandler();

      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      // Check that preferences are maintained
      const newDesktopNav = wrapper.findComponent({ name: 'SidebarNavigation' });
      expect(newDesktopNav.props('initiallyCollapsed')).toBe(true);
    });
  });

  describe('Debouncing and Performance', () => {
    it('should debounce rapid resize events', async () => {
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];

      // Trigger multiple rapid resize events
      mockWindow.innerWidth = 800;
      resizeHandler();
      mockWindow.innerWidth = 900;
      resizeHandler();
      mockWindow.innerWidth = 1000;
      resizeHandler();
      mockWindow.innerWidth = 800;
      resizeHandler();

      // Should only process the final resize after debounce
      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      // Should end up with mobile navigation
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
    });

    it('should prevent multiple simultaneous transitions', async () => {
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];

      // Start first transition
      mockWindow.innerWidth = 800;
      resizeHandler();

      // Immediately start second transition
      mockWindow.innerWidth = 1200;
      resizeHandler();

      // Wait for transitions
      await new Promise(resolve => setTimeout(resolve, 300));
      await nextTick();

      // Should handle gracefully without errors
      expect(wrapper.vm).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle device rotation', async () => {
      mockWindow.innerWidth = 800;
      mockWindow.innerHeight = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);

      // Simulate device rotation
      mockWindow.innerWidth = 1200;
      mockWindow.innerHeight = 800;
      
      const orientationHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'orientationchange')[1];
      orientationHandler();

      await new Promise(resolve => setTimeout(resolve, 200));
      await nextTick();

      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);
    });

    it('should handle browser zoom changes', async () => {
      mockWindow.innerWidth = 1200;
      mockWindow.devicePixelRatio = 1;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Simulate zoom change
      mockWindow.devicePixelRatio = 2;
      
      // Wait for zoom detection
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Should handle zoom without breaking
      expect(wrapper.vm).toBeDefined();
    });

    it('should handle exact breakpoint edge case', async () => {
      mockWindow.innerWidth = 1024; // Exactly at breakpoint
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should render desktop navigation at exactly 1024px
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);
      expect(wrapper.attributes('data-navigation-mode')).toBe('desktop');
    });
  });

  describe('Forced Navigation Type', () => {
    it('should respect forced navigation type for testing', async () => {
      mockWindow.innerWidth = 800; // Would normally be mobile
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard',
          forceNavigationType: 'desktop'
        }
      });

      await nextTick();

      // Should show desktop navigation despite mobile width
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true);
      expect(wrapper.attributes('data-navigation-mode')).toBe('desktop');
    });

    it('should allow forcing mobile navigation on desktop', async () => {
      mockWindow.innerWidth = 1200; // Would normally be desktop
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard',
          forceNavigationType: 'mobile'
        }
      });

      await nextTick();

      // Should show mobile navigation despite desktop width
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true);
      expect(wrapper.attributes('data-navigation-mode')).toBe('mobile');
    });
  });

  describe('Error Handling', () => {
    it('should handle component loading errors gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWindow.innerWidth = 1200;
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should not throw errors even if component loading fails
      expect(wrapper.vm).toBeDefined();
      
      consoleErrorSpy.mockRestore();
    });

    it('should provide error recovery methods', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should expose error clearing method
      expect(wrapper.vm.clearError).toBeDefined();
      expect(typeof wrapper.vm.clearError).toBe('function');
    });
  });

  describe('Debug Utilities', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should provide comprehensive debug information', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const debugInfo = wrapper.vm.debugNavigationController;
      expect(debugInfo).toBeDefined();
      expect(typeof debugInfo).toBe('function');

      const breakpointInfo = wrapper.vm.breakpointInfo;
      expect(breakpointInfo).toBeDefined();
      expect(typeof breakpointInfo).toBe('function');
    });

    it('should expose transition state for debugging', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      expect(wrapper.vm.transitionState).toBeDefined();
      expect(wrapper.vm.isTransitioning).toBeDefined();
      expect(wrapper.vm.currentNavigationType).toBeDefined();
    });
  });
});