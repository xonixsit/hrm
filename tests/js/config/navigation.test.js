import { describe, it, expect } from 'vitest';
import {
  navigationStructure,
  getFilteredNavigation,
  isNavigationItemActive,
  getNavigationBreadcrumbs
} from '@/config/navigation.js';

describe('Navigation Configuration', () => {
  describe('navigationStructure', () => {
    it('has the correct structure', () => {
      expect(navigationStructure).toHaveProperty('sections');
      expect(Array.isArray(navigationStructure.sections)).toBe(true);
      expect(navigationStructure.sections.length).toBeGreaterThan(0);
    });

    it('contains required navigation sections', () => {
      const sectionIds = navigationStructure.sections.map(s => s.id);
      
      expect(sectionIds).toContain('dashboard');
      expect(sectionIds).toContain('people');
      expect(sectionIds).toContain('time');
      expect(sectionIds).toContain('projects');
      expect(sectionIds).toContain('communication');
      expect(sectionIds).toContain('settings');
    });

    it('has proper section structure', () => {
      const dashboardSection = navigationStructure.sections.find(s => s.id === 'dashboard');
      
      expect(dashboardSection).toHaveProperty('id');
      expect(dashboardSection).toHaveProperty('label');
      expect(dashboardSection).toHaveProperty('icon');
      expect(dashboardSection).toHaveProperty('route');
      expect(dashboardSection).toHaveProperty('roles');
      expect(dashboardSection).toHaveProperty('order');
    });

    it('has sections with children', () => {
      const peopleSection = navigationStructure.sections.find(s => s.id === 'people');
      
      expect(peopleSection).toHaveProperty('children');
      expect(Array.isArray(peopleSection.children)).toBe(true);
      expect(peopleSection.children.length).toBeGreaterThan(0);
    });

    it('has proper child structure', () => {
      const peopleSection = navigationStructure.sections.find(s => s.id === 'people');
      const employeesChild = peopleSection.children.find(c => c.id === 'employees');
      
      expect(employeesChild).toHaveProperty('id');
      expect(employeesChild).toHaveProperty('label');
      expect(employeesChild).toHaveProperty('icon');
      expect(employeesChild).toHaveProperty('route');
      expect(employeesChild).toHaveProperty('roles');
    });
  });

  describe('getFilteredNavigation', () => {
    it('returns empty array for empty roles', () => {
      const result = getFilteredNavigation([]);
      expect(result).toEqual([]);
    });

    it('returns empty array for null roles', () => {
      const result = getFilteredNavigation(null);
      expect(result).toEqual([]);
    });

    it('returns empty array for undefined roles', () => {
      const result = getFilteredNavigation();
      expect(result).toEqual([]);
    });

    it('filters sections based on user roles', () => {
      const result = getFilteredNavigation(['Employee']);
      
      // Employee should see dashboard, time, projects, communication
      const sectionIds = result.map(s => s.id);
      expect(sectionIds).toContain('dashboard');
      expect(sectionIds).toContain('time');
      expect(sectionIds).toContain('projects');
      expect(sectionIds).toContain('communication');
      
      // Employee should not see people management or settings
      expect(sectionIds).not.toContain('people');
      expect(sectionIds).not.toContain('settings');
    });

    it('shows admin-only sections for admin users', () => {
      const result = getFilteredNavigation(['Admin']);
      
      const sectionIds = result.map(s => s.id);
      expect(sectionIds).toContain('people');
      expect(sectionIds).toContain('settings');
    });

    it('filters children based on user roles', () => {
      const result = getFilteredNavigation(['Manager']);
      const peopleSection = result.find(s => s.id === 'people');
      
      expect(peopleSection).toBeDefined();
      expect(peopleSection.children).toBeDefined();
      
      const childIds = peopleSection.children.map(c => c.id);
      expect(childIds).toContain('employees'); // Manager can see employees
      expect(childIds).not.toContain('departments'); // Manager cannot see departments (Admin only)
    });

    it('includes sections with accessible children', () => {
      const result = getFilteredNavigation(['Manager']);
      const peopleSection = result.find(s => s.id === 'people');
      
      expect(peopleSection).toBeDefined();
      expect(peopleSection.children.length).toBeGreaterThan(0);
    });

    it('excludes sections with no accessible children', () => {
      const result = getFilteredNavigation(['Employee']);
      const peopleSection = result.find(s => s.id === 'people');
      
      expect(peopleSection).toBeUndefined();
    });

    it('sorts sections by order property', () => {
      const result = getFilteredNavigation(['Admin']);
      
      // Check that sections are in order
      for (let i = 1; i < result.length; i++) {
        const prevOrder = result[i - 1].order || 999;
        const currentOrder = result[i].order || 999;
        expect(currentOrder).toBeGreaterThanOrEqual(prevOrder);
      }
    });

    it('handles multiple roles correctly', () => {
      const result = getFilteredNavigation(['Manager', 'Employee']);
      
      const sectionIds = result.map(s => s.id);
      expect(sectionIds).toContain('dashboard');
      expect(sectionIds).toContain('people'); // Manager role gives access
      expect(sectionIds).toContain('time');
      expect(sectionIds).toContain('projects');
      expect(sectionIds).toContain('communication');
    });
  });

  describe('isNavigationItemActive', () => {
    it('returns false for null or undefined items', () => {
      expect(isNavigationItemActive(null, 'dashboard')).toBe(false);
      expect(isNavigationItemActive(undefined, 'dashboard')).toBe(false);
    });

    it('returns false for null or undefined route', () => {
      const item = { id: 'dashboard', route: 'dashboard' };
      expect(isNavigationItemActive(item, null)).toBe(false);
      expect(isNavigationItemActive(item, undefined)).toBe(false);
    });

    it('returns true for exact route match', () => {
      const item = { id: 'dashboard', route: 'dashboard' };
      expect(isNavigationItemActive(item, 'dashboard')).toBe(true);
    });

    it('returns true for route prefix match', () => {
      const item = { id: 'employees', route: 'employees.index' };
      expect(isNavigationItemActive(item, 'employees.index')).toBe(true);
      expect(isNavigationItemActive(item, 'employees.create')).toBe(true);
      expect(isNavigationItemActive(item, 'employees.edit')).toBe(true);
    });

    it('returns false for non-matching routes', () => {
      const item = { id: 'employees', route: 'employees.index' };
      expect(isNavigationItemActive(item, 'dashboard')).toBe(false);
      expect(isNavigationItemActive(item, 'departments.index')).toBe(false);
    });

    it('checks children for active state', () => {
      const item = {
        id: 'people',
        children: [
          { id: 'employees', route: 'employees.index' },
          { id: 'departments', route: 'departments.index' }
        ]
      };
      
      expect(isNavigationItemActive(item, 'employees.index')).toBe(true);
      expect(isNavigationItemActive(item, 'departments.create')).toBe(true);
      expect(isNavigationItemActive(item, 'projects.index')).toBe(false);
    });

    it('handles items without routes', () => {
      const item = { id: 'section', label: 'Section' };
      expect(isNavigationItemActive(item, 'dashboard')).toBe(false);
    });

    it('handles items with empty children', () => {
      const item = {
        id: 'empty-section',
        children: []
      };
      expect(isNavigationItemActive(item, 'dashboard')).toBe(false);
    });
  });

  describe('getNavigationBreadcrumbs', () => {
    it('returns empty array for no matching route', () => {
      const result = getNavigationBreadcrumbs('nonexistent.route', ['Admin']);
      expect(result).toEqual([]);
    });

    it('returns breadcrumb for direct route match', () => {
      const result = getNavigationBreadcrumbs('dashboard', ['Employee']);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        label: 'Dashboard',
        route: 'dashboard',
        icon: 'home'
      });
    });

    it('returns breadcrumb trail for child route', () => {
      const result = getNavigationBreadcrumbs('employees.index', ['Admin']);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        label: 'People Management',
        icon: 'users'
      });
      expect(result[1]).toEqual({
        label: 'Employees',
        route: 'employees.index',
        icon: 'user'
      });
    });

    it('handles route prefixes correctly', () => {
      const result = getNavigationBreadcrumbs('employees.create', ['Admin']);
      
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('People Management');
      expect(result[1].label).toBe('Employees');
    });

    it('respects user role filtering', () => {
      // Employee shouldn't see people management breadcrumbs
      const result = getNavigationBreadcrumbs('employees.index', ['Employee']);
      expect(result).toEqual([]);
    });

    it('returns empty array for empty roles', () => {
      const result = getNavigationBreadcrumbs('dashboard', []);
      expect(result).toEqual([]);
    });

    it('handles multiple matching sections correctly', () => {
      // Should return the first match
      const result = getNavigationBreadcrumbs('dashboard', ['Admin']);
      
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Dashboard');
    });
  });

  describe('Role-based Access Control', () => {
    it('defines correct roles for each section', () => {
      const dashboardSection = navigationStructure.sections.find(s => s.id === 'dashboard');
      expect(dashboardSection.roles).toContain('Admin');
      expect(dashboardSection.roles).toContain('Manager');
      expect(dashboardSection.roles).toContain('Employee');

      const settingsSection = navigationStructure.sections.find(s => s.id === 'settings');
      expect(settingsSection.roles).toContain('Admin');
      expect(settingsSection.roles).not.toContain('Employee');
    });

    it('defines correct roles for child items', () => {
      const peopleSection = navigationStructure.sections.find(s => s.id === 'people');
      const departmentsChild = peopleSection.children.find(c => c.id === 'departments');
      
      expect(departmentsChild.roles).toContain('Admin');
      expect(departmentsChild.roles).not.toContain('Employee');
      expect(departmentsChild.roles).not.toContain('Manager');
    });

    it('ensures all sections have role definitions', () => {
      navigationStructure.sections.forEach(section => {
        expect(section.roles).toBeDefined();
        expect(Array.isArray(section.roles)).toBe(true);
        expect(section.roles.length).toBeGreaterThan(0);
      });
    });

    it('ensures all children have role definitions', () => {
      navigationStructure.sections.forEach(section => {
        if (section.children) {
          section.children.forEach(child => {
            expect(child.roles).toBeDefined();
            expect(Array.isArray(child.roles)).toBe(true);
            expect(child.roles.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('Navigation Structure Validation', () => {
    it('has unique section IDs', () => {
      const sectionIds = navigationStructure.sections.map(s => s.id);
      const uniqueIds = [...new Set(sectionIds)];
      expect(sectionIds.length).toBe(uniqueIds.length);
    });

    it('has unique child IDs within each section', () => {
      navigationStructure.sections.forEach(section => {
        if (section.children) {
          const childIds = section.children.map(c => c.id);
          const uniqueChildIds = [...new Set(childIds)];
          expect(childIds.length).toBe(uniqueChildIds.length);
        }
      });
    });

    it('has valid icons for all items', () => {
      navigationStructure.sections.forEach(section => {
        expect(section.icon).toBeDefined();
        expect(typeof section.icon).toBe('string');
        expect(section.icon.length).toBeGreaterThan(0);

        if (section.children) {
          section.children.forEach(child => {
            expect(child.icon).toBeDefined();
            expect(typeof child.icon).toBe('string');
            expect(child.icon.length).toBeGreaterThan(0);
          });
        }
      });
    });

    it('has valid labels for all items', () => {
      navigationStructure.sections.forEach(section => {
        expect(section.label).toBeDefined();
        expect(typeof section.label).toBe('string');
        expect(section.label.length).toBeGreaterThan(0);

        if (section.children) {
          section.children.forEach(child => {
            expect(child.label).toBeDefined();
            expect(typeof child.label).toBe('string');
            expect(child.label.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });
});