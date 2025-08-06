import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

// Mock route helper
const mockRoute = vi.fn();
global.route = mockRoute;

// Mock composables
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    hasRole: vi.fn(() => false),
    getUserProperty: vi.fn((prop, fallback) => {
      const user = { name: 'Test User', email: 'test@example.com' };
      return user[prop] || fallback;
    }),
    getAuthError: vi.fn(() => null)
  })
}));

vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isDesktop: true
  })
}));

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: false
  })
}));

// Mock NavigationController component
vi.mock('@/Components/Navigation/NavigationController.vue', () => ({
  default: {
    name: 'NavigationController',
    props: ['currentRoute', 'initiallyCollapsed'],
    emits: ['navigate', 'collapse-change', 'navigation-type-change', 'state-change'],
    template: '<div data-testid="navigation-controller" />'
  }
}));

// Mock other components
vi.mock('@/Components/Dropdown.vue', () => ({
  default: {
    name: 'Dropdown',
    props: ['align', 'width'],
    template: '<div data-testid="dropdown"><slot name="trigger" /><slot name="content" /></div>'
  }
}));

vi.mock('@/Components/DropdownLink.vue', () => ({
  default: {
    name: 'DropdownLink',
    props: ['href', 'method', 'as'],
    template: '<a data-testid="dropdown-link"><slot /></a>'
  }
}));

vi.mock('@/Components/NavigationErrorDisplay.vue', () => ({
  default: { name: 'NavigationErrorDisplay', template: '<div data-testid="navigation-error" />' }
}));

vi.mock('@/Components/Notifications/NotificationContainer.vue', () => ({
  default: { name: 'NotificationContainer', template: '<div data-testid="notifications" />' }
}));

vi.mock('@/Components/Accessibility/SkipLinks.vue', () => ({
  default: { name: 'SkipLinks', template: '<div data-testid="skip-links" />' }
}));

vi.mock('@/Components/Accessibility/LiveRegion.vue', () => ({
  default: { name: 'LiveRegion', template: '<div data-testid="live-region" />' }
}));

describe('AuthenticatedLayout Integration', () => {
  let wrapper;

  beforeEach(() => {
    mockRoute.mockReturnValue({ current: () => 'dashboard' });
    
    // Clear console warnings for tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('NavigationController Integration', () => {
    it('should render NavigationController with correct props', () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      const navigationController = wrapper.findComponent(NavigationController);
      expect(navigationController.exists()).toBe(true);
      expect(navigationController.props('currentRoute')).toBe('dashboard');
      expect(navigationController.props('initiallyCollapsed')).toBe(false);
    });

    it('should handle navigation type changes from desktop to mobile', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      const navigationController = wrapper.findComponent(NavigationController);
      
      // Simulate navigation type change from desktop to mobile
      await navigationController.vm.$emit('navigation-type-change', {
        from: 'desktop',
        to: 'mobile',
        breakpoint: 768,
        timestamp: Date.now()
      });

      await nextTick();

      // Check that currentNavigationType is updated
      expect(wrapper.vm.currentNavigationType).toBe('mobile');
    });

    it('should handle navigation type changes from mobile to desktop', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      const navigationController = wrapper.findComponent(NavigationController);
      
      // Start with mobile navigation
      await navigationController.vm.$emit('navigation-type-change', {
        from: null,
        to: 'mobile',
        breakpoint: 768,
        timestamp: Date.now()
      });

      await nextTick();
      expect(wrapper.vm.currentNavigationType).toBe('mobile');

      // Switch to desktop navigation
      await navigationController.vm.$emit('navigation-type-change', {
        from: 'mobile',
        to: 'desktop',
        breakpoint: 1024,
        timestamp: Date.now()
      });

      await nextTick();
      expect(wrapper.vm.currentNavigationType).toBe('desktop');
    });

    it('should handle sidebar collapse changes', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      const navigationController = wrapper.findComponent(NavigationController);
      
      // Simulate sidebar collapse
      await navigationController.vm.$emit('collapse-change', true);
      await nextTick();

      expect(wrapper.vm.sidebarCollapsed).toBe(true);

      // Simulate sidebar expand
      await navigationController.vm.$emit('collapse-change', false);
      await nextTick();

      expect(wrapper.vm.sidebarCollapsed).toBe(false);
    });

    it('should handle navigation state changes', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      const navigationController = wrapper.findComponent(NavigationController);
      
      // Simulate navigation state change
      await navigationController.vm.$emit('state-change', {
        sidebarCollapsed: true,
        navigationType: 'desktop'
      });

      await nextTick();

      expect(wrapper.vm.sidebarCollapsed).toBe(true);
    });
  });

  describe('Dynamic Layout Classes', () => {
    it('should apply correct layout classes for desktop navigation', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation type
      wrapper.vm.currentNavigationType = 'desktop';
      await nextTick();

      const layoutDiv = wrapper.find('[data-testid="main-layout"]').exists() 
        ? wrapper.find('[data-testid="main-layout"]')
        : wrapper.find('div').at(1); // Second div is the main layout

      const classes = layoutDiv.classes();
      expect(classes).toContain('desktop-layout');
      expect(classes).toContain('min-h-screen');
      expect(classes).toContain('bg-neutral-50'); // Light theme
    });

    it('should apply correct layout classes for mobile navigation', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set mobile navigation type
      wrapper.vm.currentNavigationType = 'mobile';
      await nextTick();

      const layoutDiv = wrapper.find('[data-testid="main-layout"]').exists() 
        ? wrapper.find('[data-testid="main-layout"]')
        : wrapper.find('div').at(1); // Second div is the main layout

      const classes = layoutDiv.classes();
      expect(classes).toContain('mobile-layout');
      expect(classes).toContain('min-h-screen');
    });

    it('should apply dark theme classes when isDark is true', async () => {
      // Mock dark theme for this test
      vi.doMock('@/composables/useTheme', () => ({
        useTheme: () => ({
          isDark: true
        })
      }));
      
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      await nextTick();

      const layoutDiv = wrapper.find('[data-testid="main-layout"]').exists() 
        ? wrapper.find('[data-testid="main-layout"]')
        : wrapper.find('div').at(1); // Second div is the main layout

      const classes = layoutDiv.classes();
      expect(classes).toContain('bg-neutral-900'); // Dark theme
    });
  });

  describe('Main Content Area Spacing', () => {
    it('should apply correct spacing for desktop with expanded sidebar', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation with expanded sidebar
      wrapper.vm.currentNavigationType = 'desktop';
      wrapper.vm.sidebarCollapsed = false;
      await nextTick();

      const contentArea = wrapper.find('[data-testid="main-content"]').exists()
        ? wrapper.find('[data-testid="main-content"]')
        : wrapper.find('div').at(2); // Content area div

      const classes = contentArea.classes();
      expect(classes).toContain('desktop-content');
      expect(classes).toContain('ml-64'); // Expanded sidebar margin
    });

    it('should apply correct spacing for desktop with collapsed sidebar', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation with collapsed sidebar
      wrapper.vm.currentNavigationType = 'desktop';
      wrapper.vm.sidebarCollapsed = true;
      await nextTick();

      const contentArea = wrapper.find('[data-testid="main-content"]').exists()
        ? wrapper.find('[data-testid="main-content"]')
        : wrapper.find('div').at(2); // Content area div

      const classes = contentArea.classes();
      expect(classes).toContain('desktop-content');
      expect(classes).toContain('ml-16'); // Collapsed sidebar margin
    });

    it('should apply correct spacing for mobile navigation', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set mobile navigation
      wrapper.vm.currentNavigationType = 'mobile';
      await nextTick();

      const contentArea = wrapper.find('[data-testid="main-content"]').exists()
        ? wrapper.find('[data-testid="main-content"]')
        : wrapper.find('div').at(2); // Content area div

      const classes = contentArea.classes();
      expect(classes).toContain('mobile-content');
      expect(classes).toContain('ml-0'); // No left margin on mobile
      expect(classes).toContain('pt-16'); // Top padding for mobile header
      expect(classes).toContain('pb-16'); // Bottom padding for mobile nav
    });
  });

  describe('Header Rendering', () => {
    it('should render desktop header when navigation type is desktop and header slot exists', async () => {
      wrapper = mount(AuthenticatedLayout, {
        slots: {
          header: 'Test Header'
        },
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation
      wrapper.vm.currentNavigationType = 'desktop';
      await nextTick();

      const desktopHeader = wrapper.find('header[aria-label="Page header"]');
      expect(desktopHeader.exists()).toBe(true);
      expect(desktopHeader.text()).toContain('Test Header');
    });

    it('should render mobile header when navigation type is mobile and header slot exists', async () => {
      wrapper = mount(AuthenticatedLayout, {
        slots: {
          header: 'Test Mobile Header'
        },
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set mobile navigation
      wrapper.vm.currentNavigationType = 'mobile';
      await nextTick();

      const mobileHeader = wrapper.find('header[aria-label="Page header"]');
      expect(mobileHeader.exists()).toBe(true);
      expect(mobileHeader.text()).toContain('Test Mobile Header');
    });

    it('should not render header when no header slot is provided', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      await nextTick();

      const headers = wrapper.findAll('header[aria-label="Page header"]');
      expect(headers.length).toBe(0);
    });
  });

  describe('Smooth Transitions', () => {
    it('should have transition classes for smooth navigation switching', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      await nextTick();

      // Check layout has transition classes
      const layoutDiv = wrapper.find('div').at(1); // Main layout div
      const classes = layoutDiv.classes();
      expect(classes).toContain('transition-colors');
      expect(classes).toContain('duration-200');

      // Check content area has transition classes
      const contentArea = wrapper.find('div').at(2); // Content area div
      const contentClasses = contentArea.classes();
      expect(contentClasses).toContain('transition-all');
      expect(contentClasses).toContain('duration-300');
      expect(contentClasses).toContain('ease-out');
    });
  });

  describe('Error Handling', () => {
    it('should display authentication error when present', async () => {
      // Mock auth with error for this test
      vi.doMock('@/composables/useAuth', () => ({
        useAuth: () => ({
          user: { name: 'Test User', email: 'test@example.com' },
          isAuthenticated: true,
          hasRole: vi.fn(() => false),
          getUserProperty: vi.fn((prop, fallback) => {
            const user = { name: 'Test User', email: 'test@example.com' };
            return user[prop] || fallback;
          }),
          getAuthError: vi.fn(() => 'Authentication failed')
        })
      }));

      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      await nextTick();

      const errorDiv = wrapper.find('.bg-red-100');
      expect(errorDiv.exists()).toBe(true);
      expect(errorDiv.text()).toContain('Authentication Error:');
      expect(errorDiv.text()).toContain('Authentication failed');
    });

    it('should not display authentication error when none present', async () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      await nextTick();

      const errorDiv = wrapper.find('.bg-red-100');
      expect(errorDiv.exists()).toBe(false);
    });
  });

  describe('User Menu Integration', () => {
    it('should render user menu with correct user data', async () => {
      wrapper = mount(AuthenticatedLayout, {
        slots: {
          header: 'Test Header'
        },
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation to show user menu
      wrapper.vm.currentNavigationType = 'desktop';
      await nextTick();

      const userMenuButton = wrapper.find('button[aria-label="User menu for Test User"]');
      expect(userMenuButton.exists()).toBe(true);
      expect(userMenuButton.text()).toContain('Test User');
    });

    it('should handle user menu interactions', async () => {
      wrapper = mount(AuthenticatedLayout, {
        slots: {
          header: 'Test Header'
        },
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation
      wrapper.vm.currentNavigationType = 'desktop';
      await nextTick();

      const dropdown = wrapper.findComponent({ name: 'Dropdown' });
      expect(dropdown.exists()).toBe(true);
      
      const dropdownLinks = wrapper.findAllComponents({ name: 'DropdownLink' });
      expect(dropdownLinks.length).toBe(2); // Profile Settings and Log Out
    });
  });

  describe('Accessibility Features', () => {
    it('should render accessibility components', () => {
      wrapper = mount(AuthenticatedLayout, {
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      expect(wrapper.find('[data-testid="skip-links"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="live-region"]').exists()).toBe(true);
    });

    it('should have proper ARIA labels and roles', async () => {
      wrapper = mount(AuthenticatedLayout, {
        slots: {
          header: 'Test Header'
        },
        global: {
          stubs: {
            NavigationController: true,
            Dropdown: true,
            DropdownLink: true,
            NavigationErrorDisplay: true,
            NotificationContainer: true,
            SkipLinks: true,
            LiveRegion: true
          }
        }
      });

      // Set desktop navigation
      wrapper.vm.currentNavigationType = 'desktop';
      await nextTick();

      const header = wrapper.find('header[role="banner"]');
      expect(header.exists()).toBe(true);
      expect(header.attributes('aria-label')).toBe('Page header');

      const main = wrapper.find('main[role="main"]');
      expect(main.exists()).toBe(true);
      expect(main.attributes('aria-label')).toBe('Main content');
      expect(main.attributes('tabindex')).toBe('-1');

      const userNav = wrapper.find('nav[aria-label="User account menu"]');
      expect(userNav.exists()).toBe(true);
    });
  });
});