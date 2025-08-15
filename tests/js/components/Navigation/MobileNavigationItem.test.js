import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileNavigationItem from '@/Components/Navigation/MobileNavigationItem.vue';

// Mock dependencies
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href', 'method', 'as']
  }
}));

describe('MobileNavigationItem', () => {
  let wrapper;

  beforeEach(() => {
    // Mock navigator.vibrate for haptic feedback
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
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
    return mount(MobileNavigationItem, {
      props: {
        item: {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          route: 'dashboard'
        },
        currentRoute: 'projects',
        userRoles: ['Admin'],
        ...props
      },
      global: {
        stubs: {
          Icon: true
        },
        mocks: {
          route: vi.fn((name) => `/${name.replace('.', '/')}`)
        }
      }
    });
  };

  describe('Component Rendering', () => {
    it('renders navigation item with link when route is provided', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.mobile-navigation-item').exists()).toBe(true);
      expect(wrapper.find('Link-stub').exists()).toBe(true);
      expect(wrapper.text()).toContain('Dashboard');
    });

    it('renders navigation item without link when no route is provided', () => {
      const item = {
        id: 'section',
        label: 'Section Header',
        icon: 'folder'
        // No route property
      };
      
      wrapper = createWrapper({ item });
      
      expect(wrapper.find('.nav-item').exists()).toBe(true);
      expect(wrapper.find('Link-stub').exists()).toBe(false);
      expect(wrapper.text()).toContain('Section Header');
    });

    it('displays icon with correct size for regular items', () => {
      wrapper = createWrapper();
      
      const icon = wrapper.find('Icon-stub');
      expect(icon.exists()).toBe(true);
      expect(icon.attributes('name')).toBe('home');
      expect(icon.attributes('size')).toBe('md');
    });

    it('displays icon with smaller size for child items', () => {
      wrapper = createWrapper({ isChild: true });
      
      const icon = wrapper.find('Icon-stub');
      expect(icon.attributes('size')).toBe('sm');
    });

    it('has proper touch-friendly sizing', () => {
      wrapper = createWrapper();
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.attributes('style')).toContain('min-height: 44px');
      expect(navLink.classes()).toContain('touch-manipulation');
    });
  });

  describe('Active State', () => {
    it('applies active styling when route matches current route', () => {
      wrapper = createWrapper({
        item: {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          route: 'dashboard'
        },
        currentRoute: 'dashboard'
      });
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.classes()).toContain('bg-primary-50');
      expect(navLink.classes()).toContain('text-primary-700');
    });

    it('applies active styling when current route starts with item route prefix', () => {
      wrapper = createWrapper({
        item: {
          id: 'projects',
          label: 'Projects',
          icon: 'folder',
          route: 'projects.index'
        },
        currentRoute: 'projects.show'
      });
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.classes()).toContain('bg-primary-50');
    });

    it('does not apply active styling for non-matching routes', () => {
      wrapper = createWrapper({
        currentRoute: 'leaves.index'
      });
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.classes()).not.toContain('bg-primary-50');
      expect(navLink.classes()).toContain('text-neutral-600');
    });
  });

  describe('Navigation Events', () => {
    it('emits navigate event when clicked', async () => {
      wrapper = createWrapper();
      
      const navLink = wrapper.find('.nav-link');
      await navLink.trigger('click');
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({
        item: expect.objectContaining({
          id: 'dashboard',
          label: 'Dashboard'
        }),
        route: 'dashboard',
        event: expect.any(Object)
      });
    });

    it('triggers haptic feedback on supported devices when clicked', async () => {
      wrapper = createWrapper();
      
      const navLink = wrapper.find('.nav-link');
      await navLink.trigger('click');
      
      expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });
  });

  describe('Touch-friendly Design', () => {
    it('maintains minimum touch target size', () => {
      wrapper = createWrapper();
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.attributes('style')).toContain('min-height: 44px');
    });

    it('has touch-manipulation class for better touch handling', () => {
      wrapper = createWrapper();
      
      const navLink = wrapper.find('.nav-link');
      expect(navLink.classes()).toContain('touch-manipulation');
    });
  });
});