import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NavigationSection from '@/Components/Navigation/NavigationSection.vue';

// Mock NavigationItem component
const mockNavigationItem = {
  name: 'NavigationItem',
  template: '<div class="mock-navigation-item" :data-item-id="item.id">{{ item.label }}</div>',
  props: ['item', 'currentRoute', 'userRoles', 'isCollapsed'],
  emits: ['navigate']
};

describe('NavigationSection', () => {
  let wrapper;

  const defaultProps = {
    section: {
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
          roles: ['Admin', 'Manager']
        },
        {
          id: 'departments',
          label: 'Departments',
          icon: 'building-office',
          route: 'departments.index',
          roles: ['Admin']
        }
      ]
    },
    currentRoute: 'employees.index',
    userRoles: ['Manager']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(NavigationSection, {
      props: { ...defaultProps, ...props },
      global: {
        components: {
          NavigationItem: mockNavigationItem
        }
      }
    });
  };

  describe('Basic Rendering', () => {
    it('renders section with label when not collapsed', () => {
      wrapper = createWrapper();
      
      expect(wrapper.text()).toContain('People Management');
      expect(wrapper.find('.navigation-section').exists()).toBe(true);
    });

    it('hides section label when collapsed', () => {
      wrapper = createWrapper({
        isCollapsed: true
      });
      
      // Section should still render but label should be hidden
      expect(wrapper.find('.navigation-section').exists()).toBe(true);
      // Label div should not be rendered when collapsed
      expect(wrapper.find('.px-3.py-2.text-xs').exists()).toBe(false);
    });

    it('does not render section when user has no accessible items', () => {
      wrapper = createWrapper({
        section: {
          id: 'admin-only',
          label: 'Admin Only',
          icon: 'cog',
          roles: ['Admin'],
          children: [
            {
              id: 'admin-settings',
              label: 'Admin Settings',
              icon: 'cog',
              route: 'admin.settings',
              roles: ['Admin']
            }
          ]
        },
        userRoles: ['Employee'] // Employee doesn't have access
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });
  });

  describe('Children Filtering', () => {
    it('shows only accessible children based on user roles', () => {
      wrapper = createWrapper({
        userRoles: ['Manager'] // Manager can see employees but not departments
      });
      
      const navigationItems = wrapper.findAllComponents(mockNavigationItem);
      expect(navigationItems).toHaveLength(1);
      expect(navigationItems[0].props('item').id).toBe('employees');
    });

    it('shows all children when user has admin role', () => {
      wrapper = createWrapper({
        userRoles: ['Admin']
      });
      
      const navigationItems = wrapper.findAllComponents(mockNavigationItem);
      expect(navigationItems).toHaveLength(2);
      expect(navigationItems[0].props('item').id).toBe('employees');
      expect(navigationItems[1].props('item').id).toBe('departments');
    });

    it('shows no children when user has no required roles', () => {
      wrapper = createWrapper({
        userRoles: ['Employee']
      });
      
      const navigationItems = wrapper.findAllComponents(mockNavigationItem);
      expect(navigationItems).toHaveLength(0);
    });
  });

  describe('Direct Route Sections', () => {
    it('renders section as direct navigation item when it has a route', () => {
      wrapper = createWrapper({
        section: {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          route: 'dashboard',
          roles: ['Admin', 'Manager', 'Employee']
        },
        userRoles: ['Employee']
      });
      
      const navigationItems = wrapper.findAllComponents(mockNavigationItem);
      expect(navigationItems).toHaveLength(1);
      expect(navigationItems[0].props('item').id).toBe('dashboard');
      expect(navigationItems[0].props('item').route).toBe('dashboard');
    });

    it('does not render direct route section when user lacks permission', () => {
      wrapper = createWrapper({
        section: {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          icon: 'cog',
          route: 'admin.dashboard',
          roles: ['Admin']
        },
        userRoles: ['Employee']
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });
  });

  describe('Section Divider', () => {
    it('shows divider when not last section and not collapsed', () => {
      wrapper = createWrapper({
        isLast: false,
        isCollapsed: false
      });
      
      expect(wrapper.find('.border-t.border-neutral-200').exists()).toBe(true);
    });

    it('hides divider when last section', () => {
      wrapper = createWrapper({
        isLast: true,
        isCollapsed: false
      });
      
      expect(wrapper.find('.border-t.border-neutral-200').exists()).toBe(false);
    });

    it('hides divider when collapsed', () => {
      wrapper = createWrapper({
        isLast: false,
        isCollapsed: true
      });
      
      expect(wrapper.find('.border-t.border-neutral-200').exists()).toBe(false);
    });
  });

  describe('Navigation Event Handling', () => {
    it('forwards navigate events from child items', async () => {
      wrapper = createWrapper();
      
      const navigationItem = wrapper.findComponent(mockNavigationItem);
      await navigationItem.vm.$emit('navigate', {
        item: { id: 'employees' },
        route: 'employees.index'
      });
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({
        item: { id: 'employees' },
        route: 'employees.index'
      });
    });
  });

  describe('Props Passing', () => {
    it('passes correct props to NavigationItem components', () => {
      wrapper = createWrapper();
      
      const navigationItem = wrapper.findComponent(mockNavigationItem);
      expect(navigationItem.props('currentRoute')).toBe('employees.index');
      expect(navigationItem.props('userRoles')).toEqual(['Manager']);
      expect(navigationItem.props('isCollapsed')).toBe(false);
      expect(navigationItem.props('item')).toEqual(defaultProps.section.children[0]);
    });

    it('passes collapsed state to child items', () => {
      wrapper = createWrapper({
        isCollapsed: true
      });
      
      const navigationItem = wrapper.findComponent(mockNavigationItem);
      expect(navigationItem.props('isCollapsed')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles section with empty children array', () => {
      wrapper = createWrapper({
        section: {
          id: 'empty-section',
          label: 'Empty Section',
          icon: 'folder',
          roles: ['Employee'],
          children: []
        }
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });

    it('handles section with null children', () => {
      wrapper = createWrapper({
        section: {
          id: 'null-children',
          label: 'Null Children',
          icon: 'folder',
          roles: ['Employee'],
          children: null
        }
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });

    it('handles section with undefined children', () => {
      wrapper = createWrapper({
        section: {
          id: 'undefined-children',
          label: 'Undefined Children',
          icon: 'folder',
          roles: ['Employee']
          // children is undefined
        }
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });

    it('handles empty user roles array', () => {
      wrapper = createWrapper({
        userRoles: []
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });

    it('handles null user roles', () => {
      wrapper = createWrapper({
        userRoles: null
      });
      
      expect(wrapper.find('.navigation-section').exists()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.navigation-section').exists()).toBe(true);
      expect(wrapper.find('.space-y-1').exists()).toBe(true);
    });

    it('applies proper spacing classes', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.space-y-1').exists()).toBe(true);
      expect(wrapper.find('.px-3.py-2').exists()).toBe(true);
    });
  });
});