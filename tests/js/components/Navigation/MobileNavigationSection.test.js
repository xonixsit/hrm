import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MobileNavigationSection from '@/Components/Navigation/MobileNavigationSection.vue';

describe('MobileNavigationSection', () => {
  let wrapper;

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(MobileNavigationSection, {
      props: {
        section: {
          id: 'test-section',
          label: 'Test Section',
          icon: 'folder',
          children: []
        },
        currentRoute: 'dashboard',
        userRoles: ['Admin'],
        ...props
      },
      global: {
        stubs: {
          Icon: true,
          MobileNavigationItem: true
        }
      }
    });
  };

  describe('Component Rendering', () => {
    it('renders section without children as navigation item', () => {
      const section = {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        route: 'dashboard'
      };
      
      wrapper = createWrapper({ section });
      
      expect(wrapper.find('mobilenavigationitem-stub').exists()).toBe(true);
      expect(wrapper.find('.section-header').exists()).toBe(false);
    });

    it('renders section with children as expandable section', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          }
        ]
      };
      
      wrapper = createWrapper({ section });
      
      expect(wrapper.find('.section-header').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toContain('People Management');
    });

    it('displays section icon and label correctly', () => {
      const section = {
        id: 'projects',
        label: 'Project Management',
        icon: 'folder-open',
        children: []
      };
      
      wrapper = createWrapper({ section });
      
      const iconStub = wrapper.find('icon-stub');
      expect(iconStub.attributes('name')).toBe('folder-open');
    });
  });

  describe('Section Expansion', () => {
    it('toggles section expansion when header is clicked', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          }
        ]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      
      // Initially collapsed
      expect(wrapper.find('.section-children').exists()).toBe(false);
      expect(headerButton.attributes('aria-expanded')).toBe('false');
      
      // Click to expand
      await headerButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('.section-children').exists()).toBe(true);
      expect(headerButton.attributes('aria-expanded')).toBe('true');
    });

    it('rotates chevron icon when section is expanded', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const chevronIcon = wrapper.find('icon-stub[name="chevron-down"]');
      
      // Initially not rotated
      expect(chevronIcon.classes()).not.toContain('rotate-180');
      
      // Click to expand
      await wrapper.find('.section-header button').trigger('click');
      await nextTick();
      
      expect(chevronIcon.classes()).toContain('rotate-180');
    });

    it('persists expansion state in localStorage', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      await headerButton.trigger('click');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mobile-nav-section-people',
        'true'
      );
    });
  });

  describe('Role-based Filtering', () => {
    it('filters children based on user roles', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          },
          {
            id: 'departments',
            label: 'Departments',
            icon: 'building',
            route: 'departments.index',
            roles: ['SuperAdmin'] // User doesn't have this role
          }
        ]
      };
      
      wrapper = createWrapper({ 
        section,
        userRoles: ['Admin'] // Only Admin role
      });
      
      // Should only show one child (employees) since user doesn't have SuperAdmin role
      expect(wrapper.vm.filteredChildren).toHaveLength(1);
      expect(wrapper.vm.filteredChildren[0].id).toBe('employees');
    });

    it('shows all children when no role restrictions', () => {
      const section = {
        id: 'general',
        label: 'General',
        icon: 'home',
        children: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'home',
            route: 'dashboard'
            // No roles specified - should be visible to all
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: 'user',
            route: 'profile.edit',
            roles: [] // Empty roles array - should be visible to all
          }
        ]
      };
      
      wrapper = createWrapper({ 
        section,
        userRoles: ['Employee'] // Limited role
      });
      
      expect(wrapper.vm.filteredChildren).toHaveLength(2);
    });
  });

  describe('Auto-expansion for Active Routes', () => {
    it('auto-expands section when it contains active child route', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          }
        ]
      };
      
      wrapper = createWrapper({ 
        section,
        currentRoute: 'employees.show' // Active route matches child
      });
      
      // Should auto-expand because it has active child
      expect(wrapper.vm.hasActiveChild).toBe(true);
    });

    it('does not auto-expand when no active children', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          }
        ]
      };
      
      wrapper = createWrapper({ 
        section,
        currentRoute: 'dashboard' // Different route
      });
      
      expect(wrapper.vm.hasActiveChild).toBe(false);
    });
  });

  describe('Navigation Events', () => {
    it('emits navigate event when child navigation item is clicked', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [
          {
            id: 'employees',
            label: 'Employees',
            icon: 'user',
            route: 'employees.index',
            roles: ['Admin']
          }
        ]
      };
      
      wrapper = createWrapper({ section });
      
      // Expand section first
      await wrapper.find('.section-header button').trigger('click');
      await nextTick();
      
      // Find child navigation item and emit navigate event
      const childItem = wrapper.find('mobilenavigationitem-stub');
      await childItem.vm.$emit('navigate', {
        route: 'employees.index',
        item: { id: 'employees' }
      });
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({
        route: 'employees.index',
        item: { id: 'employees' }
      });
    });

    it('emits navigate event for direct navigation item', async () => {
      const section = {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        route: 'dashboard'
      };
      
      wrapper = createWrapper({ section });
      
      const navItem = wrapper.find('mobilenavigationitem-stub');
      await navItem.vm.$emit('navigate', {
        route: 'dashboard',
        item: { id: 'dashboard' }
      });
      
      expect(wrapper.emitted('navigate')).toBeTruthy();
    });
  });

  describe('Touch-friendly Design', () => {
    it('has minimum touch target size for section header', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      expect(headerButton.attributes('style')).toContain('min-height: 44px');
    });

    it('has touch-manipulation class for better touch handling', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      expect(headerButton.classes()).toContain('touch-manipulation');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for expandable sections', () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      expect(headerButton.attributes('aria-expanded')).toBe('false');
    });

    it('updates ARIA expanded state correctly', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      const headerButton = wrapper.find('.section-header button');
      
      await headerButton.trigger('click');
      await nextTick();
      
      expect(headerButton.attributes('aria-expanded')).toBe('true');
    });
  });

  describe('Animation and Transitions', () => {
    it('applies transition classes for section expansion', async () => {
      const section = {
        id: 'people',
        label: 'People Management',
        icon: 'users',
        children: [{ id: 'child', label: 'Child', roles: ['Admin'] }]
      };
      
      wrapper = createWrapper({ section });
      
      await wrapper.find('.section-header button').trigger('click');
      await nextTick();
      
      const sectionChildren = wrapper.find('.section-children');
      expect(sectionChildren.exists()).toBe(true);
      expect(sectionChildren.classes()).toContain('overflow-hidden');
    });
  });
});