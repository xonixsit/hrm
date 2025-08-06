import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock global route function
global.route = vi.fn((name) => `/${name.replace('.', '/')}`);
global.window = { route: global.route };

// Mock composables
vi.mock('@/composables/useAuth.js', () => ({ 
  useAuth: () => ({
    user: { value: { name: 'Test User', email: 'test@example.com' } },
    roles: { value: ['Employee'] },
    getUserProperty: vi.fn((key, fallback) => fallback),
    hasRole: vi.fn(() => false)
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
    preferences: { value: { sidebarCollapsed: false } },
    setPreference: vi.fn(),
    getPreference: vi.fn((key) => key === 'sidebarCollapsed' ? false : undefined)
  })
}));

vi.mock('@/composables/useResponsive.js', () => ({ 
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true },
    windowWidth: { value: 1024 }
  })
}));

vi.mock('@/composables/useAccessibility.js', () => ({ 
  useAccessibility: () => ({
    announce: vi.fn(),
    announcePageChange: vi.fn()
  }),
  useKeyboardNavigation: () => ({
    currentIndex: { value: 0 },
    handleKeyDown: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn()
  }),
  useScreenReader: () => ({
    announcePageChange: vi.fn()
  })
}));

vi.mock('@inertiajs/vue3', () => ({ 
  router: {
    visit: vi.fn()
  }
}));

// Import component after mocks
import SidebarNavigation from '@/Components/Navigation/SidebarNavigation.vue';

describe('SidebarNavigation - Responsive Collapse/Expand', () => {
  let wrapper;
  let mockSetPreference;
  let mockAnnounce;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    mockSetPreference = vi.fn();
    mockAnnounce = vi.fn();

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

    // Mock document methods for tooltip management
    document.querySelectorAll = vi.fn(() => []);
    document.createElement = vi.fn(() => ({
      className: '',
      textContent: '',
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      },
      getBoundingClientRect: vi.fn(() => ({ width: 100, height: 20 })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    document.body = {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    };
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('Collapse/Expand Functionality', () => {
    it('should initialize with expanded state by default', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      expect(wrapper.find('.sidebar-navigation').classes()).toContain('w-64');
      expect(wrapper.find('.sidebar-navigation').classes()).not.toContain('w-16');
    });

    it('should initialize with collapsed state when initiallyCollapsed prop is true', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();

      expect(wrapper.find('.sidebar-navigation').classes()).toContain('w-16');
      expect(wrapper.find('.sidebar-navigation').classes()).not.toContain('w-64');
    });

    it('should toggle collapse state when collapse button is clicked', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Find and click the collapse toggle button
      const collapseButton = wrapper.find('[aria-label="Collapse sidebar"]');
      expect(collapseButton.exists()).toBe(true);

      await collapseButton.trigger('click');
      await nextTick();

      // Should emit collapse-change event
      expect(wrapper.emitted('collapse-change')).toBeTruthy();
      expect(wrapper.emitted('collapse-change')[0]).toEqual([true]);

      // Should save preference
      expect(mockSetPreference).toHaveBeenCalledWith('sidebarCollapsed', true);

      // Should update localStorage for backward compatibility
      expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });

    it('should show appropriate aria-label for collapse button based on state', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Initially expanded - should show "Collapse sidebar"
      let collapseButton = wrapper.find('[aria-label="Collapse sidebar"]');
      expect(collapseButton.exists()).toBe(true);

      // Click to collapse
      await collapseButton.trigger('click');
      await nextTick();

      // Now collapsed - should show "Expand sidebar"
      collapseButton = wrapper.find('[aria-label="Expand sidebar"]');
      expect(collapseButton.exists()).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should auto-collapse on smaller screens', async () => {
      // Mock smaller screen size
      mockUseResponsive.mockReturnValue({
        isMobile: { value: false },
        isTablet: { value: true },
        isDesktop: { value: false },
        windowWidth: { value: 768 } // Below lg breakpoint (1024px)
      });

      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should auto-collapse on smaller screens
      expect(wrapper.find('.sidebar-navigation').classes()).toContain('w-16');
    });

    it('should remain expanded on larger screens', async () => {
      // Mock larger screen size
      mockUseResponsive.mockReturnValue({
        isMobile: { value: false },
        isTablet: { value: false },
        isDesktop: { value: true },
        windowWidth: { value: 1200 } // Above lg breakpoint
      });

      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should remain expanded on larger screens
      expect(wrapper.find('.sidebar-navigation').classes()).toContain('w-64');
    });
  });

  describe('State Persistence', () => {
    it('should load collapse state from user preferences', async () => {
      mockUseUserPreferences.mockReturnValue({
        preferences: { value: { sidebarCollapsed: true } },
        setPreference: mockSetPreference,
        getPreference: vi.fn((key) => key === 'sidebarCollapsed' ? true : undefined)
      });

      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should initialize as collapsed based on preferences
      expect(wrapper.find('.sidebar-navigation').classes()).toContain('w-16');
    });

    it('should fallback to localStorage if preferences not available', async () => {
      mockUseUserPreferences.mockReturnValue({
        preferences: { value: {} },
        setPreference: mockSetPreference,
        getPreference: vi.fn(() => undefined)
      });

      localStorage.getItem.mockReturnValue('true');

      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Should check localStorage
      expect(localStorage.getItem).toHaveBeenCalledWith('sidebar-collapsed');
    });
  });

  describe('Navigation Items in Collapsed State', () => {
    beforeEach(async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();
    });

    it('should show only icons in collapsed state', async () => {
      const navItems = wrapper.findAll('.nav-item button');
      expect(navItems.length).toBeGreaterThan(0);

      // Navigation items should have tooltip-trigger class in collapsed state
      navItems.forEach(item => {
        expect(item.classes()).toContain('tooltip-trigger');
      });
    });

    it('should have proper tooltip attributes in collapsed state', async () => {
      const navItems = wrapper.findAll('.nav-item button');
      
      navItems.forEach(item => {
        expect(item.attributes('data-tooltip')).toBeDefined();
        expect(item.attributes('title')).toBeDefined();
      });
    });

    it('should show badge indicators in collapsed state', async () => {
      // This would test if navigation items with badges show small indicators
      // The actual implementation would depend on having navigation items with badges
      const navItems = wrapper.findAll('.nav-item button');
      
      // Check that the structure supports badge indicators
      navItems.forEach(item => {
        const badgeIndicator = item.find('.absolute.-top-1.-right-1');
        // Badge indicator should exist if the item has a badge
      });
    });
  });

  describe('Footer Actions in Collapsed State', () => {
    beforeEach(async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();
    });

    it('should show footer actions with tooltips in collapsed state', async () => {
      const settingsButton = wrapper.find('[data-tooltip="Settings"]');
      const logoutButton = wrapper.find('[data-tooltip="Logout"]');

      expect(settingsButton.exists()).toBe(true);
      expect(logoutButton.exists()).toBe(true);

      // Should have tooltip-trigger class
      expect(settingsButton.classes()).toContain('tooltip-trigger');
      expect(logoutButton.classes()).toContain('tooltip-trigger');
    });

    it('should have proper accessibility attributes for footer actions', async () => {
      const settingsButton = wrapper.find('[data-tooltip="Settings"]');
      const logoutButton = wrapper.find('[data-tooltip="Logout"]');

      expect(settingsButton.attributes('aria-label')).toBe('Settings');
      expect(logoutButton.attributes('aria-label')).toBe('Logout');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard shortcut for toggle (Ctrl+B)', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Simulate Ctrl+B keydown event
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keydownEvent);
      await nextTick();

      // Should announce the state change
      expect(mockAnnounce).toHaveBeenCalled();
    });

    it('should maintain keyboard navigation in collapsed state', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();

      const navItems = wrapper.findAll('.nav-item button[role="menuitem"]');
      
      // All navigation items should still be focusable
      navItems.forEach(item => {
        expect(item.attributes('role')).toBe('menuitem');
        expect(item.attributes('aria-label')).toBeDefined();
      });
    });
  });

  describe('Smooth Animations', () => {
    it('should have transition classes for smooth animations', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const sidebar = wrapper.find('.sidebar-navigation');
      expect(sidebar.classes()).toContain('transition-all');
      expect(sidebar.classes()).toContain('duration-300');
      expect(sidebar.classes()).toContain('ease-in-out');
    });

    it('should have proper transition components for content', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      // Check for transition components
      const transitions = wrapper.findAllComponents({ name: 'Transition' });
      expect(transitions.length).toBeGreaterThan(0);

      // Should have sidebar-text and sidebar-content transitions
      const transitionNames = transitions.map(t => t.props('name'));
      expect(transitionNames).toContain('sidebar-text');
      expect(transitionNames).toContain('sidebar-content');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes for sidebar', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const sidebar = wrapper.find('.sidebar-navigation');
      expect(sidebar.attributes('role')).toBe('navigation');
      expect(sidebar.attributes('aria-label')).toBe('Main navigation');
      expect(sidebar.attributes('aria-expanded')).toBe('true');
    });

    it('should update aria-expanded when collapsed', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard',
          initiallyCollapsed: true
        }
      });

      await nextTick();

      const sidebar = wrapper.find('.sidebar-navigation');
      expect(sidebar.attributes('aria-expanded')).toBe('false');
    });

    it('should announce state changes to screen readers', async () => {
      wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });

      await nextTick();

      const collapseButton = wrapper.find('[aria-label="Collapse sidebar"]');
      await collapseButton.trigger('click');
      await nextTick();

      // Should announce the change
      expect(mockAnnounce).toHaveBeenCalled();
    });
  });
});