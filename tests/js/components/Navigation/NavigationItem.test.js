import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createInertiaApp } from '@inertiajs/vue3';
import NavigationItem from '@/Components/Navigation/NavigationItem.vue';

// Mock the composables
vi.mock('@/composables/usePermissions.js', () => ({
  usePermissions: () => ({
    hasAnyRole: vi.fn(() => true)
  })
}));

// Mock the navigation config
vi.mock('@/config/navigation.js', () => ({
  isNavigationItemActive: vi.fn(() => false)
}));

// Mock Inertia Link component
const mockLink = {
  name: 'Link',
  template: '<a :href="href"><slot /></a>',
  props: ['href', 'method', 'as']
};

// Mock Icon component
const mockIcon = {
  name: 'Icon',
  template: '<span class="mock-icon" :data-name="name" :data-size="size" :class="class"></span>',
  props: ['name', 'size', 'class']
};

// Mock route helper
global.route = vi.fn((name) => `/${name.replace('.', '/')}`);

describe('NavigationItem', () => {
  let wrapper;

  const defaultProps = {
    item: {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      route: 'dashboard',
      roles: ['Admin', 'Manager', 'Employee']
    },
    currentRoute: 'dashboard',
    userRoles: ['Employee']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(NavigationItem, {
      props: { ...defaultProps, ...props },
      global: {
        components: {
          Link: mockLink,
          Icon: mockIcon
        },
        stubs: {
          NavigationItem: true // Prevent infinite recursion for children
        }
      }
    });
  };

  describe('Basic Rendering', () => {
    it('renders navigation item with label and icon', () => {
      wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('Dashboard');
      expect(wrapper.find('[data-name="home"]').exists()).toBe(true);
    });

    it('renders as Link component when item has route and permission', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('a').exists()).toBe(true);
      expect(wrapper.find('a').attributes('href')).toBe('/dashboard');
    });

    it('renders as div when item has no route', () => {
      wrapper = createWrapper({
        item: {
          id: 'section',
          label: 'Section',
          icon: 'folder',
          roles: ['Employee']
        }
      });
      
      expect(wrapper.find('a').exists()).toBe(false);
      expect(wrapper.find('.navigation-item-link').element.tagName).toBe('DIV');
    });
  });

  describe('Permission Checking', () => {
    it('shows item when user has required role', () => {
      wrapper = createWrapper({
        item: {
          id: 'admin-panel',
          label: 'Admin Panel',
          icon: 'cog',
          route: 'admin.index',
          roles: ['Employee'] // User has Employee role
        },
        userRoles: ['Employee']
      });
      
      expect(wrapper.find('.navigation-item-link').classes()).not.toContain('cursor-not-allowed');
      expect(wrapper.find('.navigation-item-link').classes()).not.toContain('opacity-50');
    });

    it('disables item when user lacks required role', () => {
      wrapper = createWrapper({
        item: {
          id: 'admin-panel',
          label: 'Admin Panel',
          icon: 'cog',
          route: 'admin.index',
          roles: ['Admin'] // User doesn't have Admin role
        },
        userRoles: ['Employee']
      });
      
      expect(wrapper.find('.navigation-item-link').classes()).toContain('cursor-not-allowed');
      expect(wrapper.find('.navigation-item-link').classes()).toContain('opacity-50');
    });

    it('allows access when no roles specified', () => {
      wrapper = createWrapper({
        item: {
          id: 'public-item',
          label: 'Public Item',
          icon: 'home',
          route: 'public',
          roles: []
        }
      });
      
      expect(wrapper.find('.navigation-item-link').classes()).not.toContain('cursor-not-allowed');
    });
  });

  describe('Active State', () => {
    it('applies active styles when item is active', async () => {
      const { isNavigationItemActive } = await import('@/config/navigation.js');
      isNavigationItemActive.mockReturnValue(true);
      
      wrapper = createWrapper();
      
      expect(wrapper.find('.navigation-item-link').classes()).toContain('bg-primary-50');
      expect(wrapper.find('.navigation-item-link').classes()).toContain('text-primary-700');
    });

    it('applies inactive styles when item is not active', async () => {
      const { isNavigationItemActive } = await import('@/config/navigation.js');
      isNavigationItemActive.mockReturnValue(false);
      
      wrapper = createWrapper();
      
      expect(wrapper.find('.navigation-item-link').classes()).toContain('text-neutral-600');
      expect(wrapper.find('.navigation-item-link').classes()).not.toContain('bg-primary-50');
    });
  });

  describe('Children Handling', () => {
    it('shows chevron icon when item has children', () => {
      wrapper = createWrapper({
        item: {
          id: 'parent',
          label: 'Parent Item',
          icon: 'folder',
          roles: ['Employee'],
          children: [
            {
              id: 'child',
              label: 'Child Item',
              icon: 'file',
              route: 'child',
              roles: ['Employee']
            }
          ]
        }
      });
      
      expect(wrapper.find('[data-name="chevron-right"]').exists()).toBe(true);
    });

    it('does not show chevron for child items', () => {
      wrapper = createWrapper({
        isChild: true
      });
      
      expect(wrapper.find('[data-name="chevron-right"]').exists()).toBe(false);
    });

    it('filters children based on user roles', () => {
      wrapper = createWrapper({
        item: {
          id: 'parent',
          label: 'Parent Item',
          icon: 'folder',
          roles: ['Employee'],
          children: [
            {
              id: 'admin-child',
              label: 'Admin Child',
              icon: 'cog',
              route: 'admin.child',
              roles: ['Admin']
            },
            {
              id: 'employee-child',
              label: 'Employee Child',
              icon: 'user',
              route: 'employee.child',
              roles: ['Employee']
            }
          ]
        },
        userRoles: ['Employee']
      });
      
      // Should only have access to employee child
      expect(wrapper.vm.accessibleChildren).toHaveLength(1);
      expect(wrapper.vm.accessibleChildren[0].id).toBe('employee-child');
    });
  });

  describe('Click Handling', () => {
    it('emits navigate event when item is clicked', async () => {
      wrapper = createWrapper();
      
      await wrapper.find('.navigation-item-link').trigger('click');
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({
        item: defaultProps.item,
        route: 'dashboard',
        event: expect.any(Object)
      });
    });

    it('prevents click when user lacks permission', async () => {
      wrapper = createWrapper({
        item: {
          id: 'admin-panel',
          label: 'Admin Panel',
          icon: 'cog',
          route: 'admin.index',
          roles: ['Admin']
        },
        userRoles: ['Employee']
      });
      
      const clickEvent = { preventDefault: vi.fn() };
      await wrapper.vm.handleClick(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(wrapper.emitted('navigate')).toBeFalsy();
    });

    it('toggles expansion for items with children but no route', async () => {
      wrapper = createWrapper({
        item: {
          id: 'parent',
          label: 'Parent Item',
          icon: 'folder',
          roles: ['Employee'],
          children: [
            {
              id: 'child',
              label: 'Child Item',
              icon: 'file',
              route: 'child',
              roles: ['Employee']
            }
          ]
        }
      });
      
      expect(wrapper.vm.isExpanded).toBe(false);
      
      const clickEvent = { preventDefault: vi.fn() };
      await wrapper.vm.handleClick(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(wrapper.vm.isExpanded).toBe(true);
    });
  });

  describe('Badge Display', () => {
    it('displays badge when item has badge property', () => {
      wrapper = createWrapper({
        item: {
          ...defaultProps.item,
          badge: '5',
          badgeType: 'primary'
        }
      });
      
      const badge = wrapper.find('span:last-child');
      expect(badge.text()).toBe('5');
      expect(badge.classes()).toContain('bg-primary-100');
      expect(badge.classes()).toContain('text-primary-700');
    });

    it('uses neutral badge style by default', () => {
      wrapper = createWrapper({
        item: {
          ...defaultProps.item,
          badge: '3'
        }
      });
      
      const badge = wrapper.find('span:last-child');
      expect(badge.classes()).toContain('bg-neutral-100');
      expect(badge.classes()).toContain('text-neutral-700');
    });
  });

  describe('Child Item Styling', () => {
    it('applies child-specific styling when isChild is true', () => {
      wrapper = createWrapper({
        isChild: true
      });
      
      expect(wrapper.find('.navigation-item-link').classes()).toContain('pl-6');
      expect(wrapper.find('[data-size="sm"]').exists()).toBe(true);
    });

    it('applies parent styling when isChild is false', () => {
      wrapper = createWrapper({
        isChild: false
      });
      
      expect(wrapper.find('.navigation-item-link').classes()).toContain('pl-3');
      expect(wrapper.find('[data-size="md"]').exists()).toBe(true);
    });
  });

  describe('Route Generation', () => {
    it('generates correct href for valid routes', () => {
      wrapper = createWrapper();
      
      expect(wrapper.vm.computedHref).toBe('/dashboard');
    });

    it('returns undefined for items without routes', () => {
      wrapper = createWrapper({
        item: {
          id: 'section',
          label: 'Section',
          icon: 'folder',
          roles: ['Employee']
        }
      });
      
      expect(wrapper.vm.computedHref).toBeUndefined();
    });

    it('returns undefined when user lacks permission', () => {
      wrapper = createWrapper({
        item: {
          id: 'admin-panel',
          label: 'Admin Panel',
          icon: 'cog',
          route: 'admin.index',
          roles: ['Admin']
        },
        userRoles: ['Employee']
      });
      
      expect(wrapper.vm.computedHref).toBeUndefined();
    });
  });
});