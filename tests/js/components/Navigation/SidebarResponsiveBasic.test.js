import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock global functions
global.route = vi.fn((name) => `/${name.replace('.', '/')}`);
global.window = { route: global.route };

// Mock Icon component
const MockIcon = {
  name: 'Icon',
  props: ['name', 'size'],
  template: '<span class="mock-icon" :data-name="name" :data-size="size"></span>'
};

// Mock composables with simple implementations
vi.mock('@/composables/useAuth.js', () => ({ 
  useAuth: () => ({
    user: { value: { name: 'Test User', email: 'test@example.com' } },
    roles: { value: ['Employee'] },
    getUserProperty: (key, fallback) => fallback,
    hasRole: () => false
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
    getPreference: () => false
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

describe('SidebarNavigation - Basic Responsive Tests', () => {
  let wrapper;

  beforeEach(() => {
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

    // Mock document methods
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
    document.querySelectorAll = vi.fn(() => []);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render with correct initial width classes', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard'
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const sidebar = wrapper.find('.sidebar-navigation');
    expect(sidebar.exists()).toBe(true);
    expect(sidebar.classes()).toContain('w-64'); // Expanded by default
    expect(sidebar.classes()).not.toContain('w-16');
  });

  it('should render with collapsed width when initiallyCollapsed is true', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard',
        initiallyCollapsed: true
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const sidebar = wrapper.find('.sidebar-navigation');
    expect(sidebar.classes()).toContain('w-16'); // Collapsed
    expect(sidebar.classes()).not.toContain('w-64');
  });

  it('should have proper ARIA attributes', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard'
      },
      global: {
        components: {
          Icon: MockIcon
        }
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
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const sidebar = wrapper.find('.sidebar-navigation');
    expect(sidebar.attributes('aria-expanded')).toBe('false');
  });

  it('should render navigation items', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard'
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const navItems = wrapper.findAll('.nav-item');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('should have transition classes for smooth animations', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard'
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const sidebar = wrapper.find('.sidebar-navigation');
    expect(sidebar.classes()).toContain('transition-all');
    expect(sidebar.classes()).toContain('duration-300');
    expect(sidebar.classes()).toContain('ease-in-out');
  });

  it('should render footer actions', async () => {
    wrapper = mount(SidebarNavigation, {
      props: {
        currentRoute: 'dashboard'
      },
      global: {
        components: {
          Icon: MockIcon
        }
      }
    });

    await nextTick();

    const footer = wrapper.find('.sidebar-footer');
    expect(footer.exists()).toBe(true);
    
    // Should have settings and logout buttons
    const buttons = footer.findAll('button');
    expect(buttons.length).toBe(2);
  });
});