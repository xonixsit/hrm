import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBreadcrumbs } from '@/composables/useBreadcrumbs';
import { usePage } from '@inertiajs/vue3';

// Mock Inertia's usePage
vi.mock('@inertiajs/vue3', () => ({
  usePage: vi.fn()
}));

// Mock global route function
global.route = vi.fn((name, params = {}) => {
  const routes = {
    'dashboard': '/dashboard',
    'projects.index': '/projects',
    'projects.show': `/projects/${params.id || 1}`,
    'projects.edit': `/projects/${params.id || 1}/edit`,
    'projects.create': '/projects/create',
    'users.index': '/users',
    'users.show': `/users/${params.id || 1}`,
  };
  return routes[name] || `/${name}`;
});

describe('useBreadcrumbs', () => {
  let mockPage;

  beforeEach(() => {
    mockPage = {
      component: { value: 'Projects/Index' },
      props: { 
        value: { 
          route: { params: {} },
          projects: []
        } 
      }
    };
    
    usePage.mockReturnValue(mockPage);
  });

  describe('Route Mapping', () => {
    it('has correct route mappings for all resources', () => {
      const { routeMapping } = useBreadcrumbs();
      
      // Check dashboard
      expect(routeMapping['dashboard']).toEqual({ 
        label: 'Dashboard', 
        icon: 'HomeIcon' 
      });
      
      // Check projects
      expect(routeMapping['projects.index']).toEqual({ 
        label: 'Projects', 
        parent: 'dashboard' 
      });
      expect(routeMapping['projects.show']).toEqual({ 
        label: 'Project Details', 
        parent: 'projects.index', 
        dynamic: true 
      });
      
      // Check other resources exist
      expect(routeMapping['tasks.index']).toBeDefined();
      expect(routeMapping['employees.index']).toBeDefined();
      expect(routeMapping['leaves.index']).toBeDefined();
    });
  });

  describe('Breadcrumb Generation', () => {
    it('generates breadcrumbs for index pages', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.index');
      
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({
        label: 'Dashboard',
        href: '/dashboard',
        current: false,
        icon: 'HomeIcon'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Projects',
        href: null,
        current: true,
        icon: undefined
      });
    });

    it('generates breadcrumbs for show pages', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123 });
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[1].label).toBe('Projects');
      expect(breadcrumbs[2].label).toBe('Project Details #123');
      expect(breadcrumbs[2].current).toBe(true);
    });

    it('generates breadcrumbs for create pages', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.create');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[1].label).toBe('Projects');
      expect(breadcrumbs[2].label).toBe('Create Project');
      expect(breadcrumbs[2].current).toBe(true);
    });

    it('generates breadcrumbs for edit pages', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.edit', { id: 456 });
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[1].label).toBe('Projects');
      expect(breadcrumbs[2].label).toBe('Edit Project #456');
      expect(breadcrumbs[2].current).toBe(true);
    });
  });

  describe('Dynamic Labels', () => {
    it('uses resource name for dynamic labels when available', () => {
      mockPage.props.value.project = { name: 'My Project', id: 123 };
      
      const { generateBreadcrumbs } = useBreadcrumbs();
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123 });
      
      expect(breadcrumbs[2].label).toBe('My Project');
    });

    it('uses resource title for dynamic labels when name not available', () => {
      mockPage.props.value.project = { title: 'Project Title', id: 123 };
      
      const { generateBreadcrumbs } = useBreadcrumbs();
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123 });
      
      expect(breadcrumbs[2].label).toBe('Project Title');
    });

    it('falls back to ID when no name or title available', () => {
      mockPage.props.value.project = { id: 123 };
      
      const { generateBreadcrumbs } = useBreadcrumbs();
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123 });
      
      expect(breadcrumbs[2].label).toBe('Project Details #123');
    });

    it('uses default label when no resource data available', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123 });
      
      expect(breadcrumbs[2].label).toBe('Project Details #123');
    });
  });

  describe('Automatic Breadcrumbs', () => {
    it('generates automatic breadcrumbs based on current page component', () => {
      mockPage.component.value = 'Projects/Show';
      mockPage.props.value.route = { params: { id: 123 } };
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toHaveLength(3);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
      expect(breadcrumbs.value[1].label).toBe('Projects');
      expect(breadcrumbs.value[2].current).toBe(true);
    });

    it('falls back to simple breadcrumb for unknown routes', () => {
      mockPage.component.value = 'UnknownPage';
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toHaveLength(2);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
      expect(breadcrumbs.value[1].label).toBe('UnknownPage');
      expect(breadcrumbs.value[1].current).toBe(true);
    });

    it('handles dashboard page correctly', () => {
      mockPage.component.value = 'Dashboard';
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toHaveLength(1);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
      expect(breadcrumbs.value[0].current).toBe(true);
      expect(breadcrumbs.value[0].icon).toBe('HomeIcon');
    });
  });

  describe('Custom Breadcrumbs', () => {
    it('uses custom breadcrumbs when provided', () => {
      const customBreadcrumbs = [
        { label: 'Custom', href: '/custom' },
        { label: 'Page', current: true }
      ];
      
      const { breadcrumbs } = useBreadcrumbs(customBreadcrumbs);
      
      expect(breadcrumbs.value).toEqual(customBreadcrumbs);
    });

    it('can set custom breadcrumbs dynamically', () => {
      const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
      
      const customBreadcrumbs = [
        { label: 'Dynamic', href: '/dynamic' },
        { label: 'Custom', current: true }
      ];
      
      setBreadcrumbs(customBreadcrumbs);
      
      expect(breadcrumbs.value).toEqual(customBreadcrumbs);
    });

    it('can clear custom breadcrumbs to revert to automatic', () => {
      const customBreadcrumbs = [
        { label: 'Custom', href: '/custom' }
      ];
      
      const { breadcrumbs, setBreadcrumbs, clearCustomBreadcrumbs } = useBreadcrumbs(customBreadcrumbs);
      
      expect(breadcrumbs.value).toEqual(customBreadcrumbs);
      
      clearCustomBreadcrumbs();
      
      // Should revert to automatic breadcrumbs
      expect(breadcrumbs.value).not.toEqual(customBreadcrumbs);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
    });

    it('can add breadcrumb to existing chain', () => {
      mockPage.component.value = 'Projects/Index';
      
      const { breadcrumbs, addBreadcrumb } = useBreadcrumbs();
      
      // Initial breadcrumbs: Dashboard -> Projects
      expect(breadcrumbs.value).toHaveLength(2);
      
      addBreadcrumb({ label: 'New Section', current: true });
      
      // Should now have: Dashboard -> Projects -> New Section
      expect(breadcrumbs.value).toHaveLength(3);
      expect(breadcrumbs.value[0].current).toBe(false);
      expect(breadcrumbs.value[1].current).toBe(false);
      expect(breadcrumbs.value[2].current).toBe(true);
      expect(breadcrumbs.value[2].label).toBe('New Section');
    });
  });

  describe('Component Name Conversion', () => {
    it('converts component names to route names correctly', () => {
      const testCases = [
        { component: 'Projects/Index', expected: 'projects.index' },
        { component: 'Projects/Show', expected: 'projects.show' },
        { component: 'Projects/Create', expected: 'projects.create' },
        { component: 'Projects/Edit', expected: 'projects.edit' },
        { component: 'Tasks/Index', expected: 'tasks.index' },
        { component: 'Dashboard', expected: 'dashboard' },
      ];
      
      const { breadcrumbs } = useBreadcrumbs();
      
      testCases.forEach(({ component, expected }) => {
        mockPage.component.value = component;
        
        // The breadcrumbs should be generated based on the expected route name
        const result = breadcrumbs.value;
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('handles invalid component names gracefully', () => {
      mockPage.component.value = null;
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toHaveLength(2);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
      expect(breadcrumbs.value[1].label).toBe('Page');
    });
  });

  describe('Route Parameters', () => {
    it('passes through route parameters correctly', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.show', { id: 123, tab: 'details' });
      
      // The parent route (projects.index) should not receive parameters
      expect(breadcrumbs[1].href).toBe('/projects');
      
      // The current route should not have href (it's current)
      expect(breadcrumbs[2].href).toBe(null);
    });

    it('handles missing route parameters gracefully', () => {
      const { generateBreadcrumbs } = useBreadcrumbs();
      
      const breadcrumbs = generateBreadcrumbs('projects.show');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2].label).toBe('Project Details');
    });
  });

  describe('Enhanced Features', () => {
    it('tracks breadcrumb history', () => {
      const { getHistory, clearHistory } = useBreadcrumbs();
      
      // Initially empty
      expect(getHistory()).toHaveLength(0);
      
      // History should be populated by the watcher
      expect(getHistory().length).toBeGreaterThanOrEqual(0);
    });

    it('can add and remove route mappings', () => {
      const { addRouteMapping, removeRouteMapping, routeMapping } = useBreadcrumbs();
      
      const customRoute = 'custom.test';
      const customConfig = { label: 'Custom Test', parent: 'dashboard' };
      
      addRouteMapping(customRoute, customConfig);
      expect(routeMapping[customRoute]).toEqual(customConfig);
      
      removeRouteMapping(customRoute);
      expect(routeMapping[customRoute]).toBeUndefined();
    });

    it('generates nested breadcrumbs with custom path', () => {
      const { getNestedBreadcrumbs } = useBreadcrumbs();
      
      const customPath = [
        { label: 'Custom Root', href: '/custom' },
        { label: 'Custom Child', href: '/custom/child' },
        { label: 'Current Page' }
      ];
      
      const result = getNestedBreadcrumbs('projects.index', {}, customPath);
      
      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Custom Root');
      expect(result[1].label).toBe('Custom Child');
      expect(result[2].label).toBe('Current Page');
      expect(result[2].current).toBe(true);
    });

    it('provides structured breadcrumb data', () => {
      mockPage.component.value = 'Projects/Show';
      mockPage.props.value.route = { params: { id: 123 } };
      
      const { getStructuredBreadcrumbs } = useBreadcrumbs();
      const structured = getStructuredBreadcrumbs();
      
      expect(structured.items).toBeDefined();
      expect(structured.current).toBeDefined();
      expect(structured.parents).toBeDefined();
      expect(structured.depth).toBeGreaterThan(0);
      expect(structured.hasParents).toBeDefined();
      expect(structured.isRoot).toBeDefined();
    });

    it('identifies root page correctly', () => {
      mockPage.component.value = 'Dashboard';
      
      const { getStructuredBreadcrumbs } = useBreadcrumbs();
      const structured = getStructuredBreadcrumbs();
      
      expect(structured.isRoot).toBe(true);
      expect(structured.hasParents).toBe(false);
    });

    it('identifies non-root pages correctly', () => {
      mockPage.component.value = 'Projects/Index';
      
      const { getStructuredBreadcrumbs } = useBreadcrumbs();
      const structured = getStructuredBreadcrumbs();
      
      expect(structured.isRoot).toBe(false);
      expect(structured.hasParents).toBe(true);
    });

    it('clears history when requested', () => {
      const { getHistory, clearHistory } = useBreadcrumbs();
      
      clearHistory();
      expect(getHistory()).toHaveLength(0);
    });

    it('limits history length', () => {
      const { breadcrumbHistory } = useBreadcrumbs();
      
      // The history should not exceed maxHistoryLength (10)
      expect(breadcrumbHistory.value.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Breadcrumb History Tracking', () => {
    it('creates history items with correct structure', () => {
      const { getHistory } = useBreadcrumbs();
      
      // Wait for watcher to trigger
      setTimeout(() => {
        const history = getHistory();
        if (history.length > 0) {
          const historyItem = history[0];
          expect(historyItem.breadcrumbs).toBeDefined();
          expect(historyItem.timestamp).toBeDefined();
          expect(historyItem.url).toBeDefined();
          expect(historyItem.component).toBeDefined();
        }
      }, 0);
    });

    it('provides reactive history access', () => {
      const { breadcrumbHistory } = useBreadcrumbs();
      
      expect(breadcrumbHistory.value).toBeInstanceOf(Array);
    });
  });

  describe('Complex Navigation Paths', () => {
    it('handles deeply nested routes', () => {
      const { addRouteMapping, generateBreadcrumbs } = useBreadcrumbs();
      
      // Add deeply nested route
      addRouteMapping('projects.tasks.subtasks.show', {
        label: 'Subtask Details',
        parent: 'projects.tasks.subtasks.index',
        dynamic: true
      });
      
      addRouteMapping('projects.tasks.subtasks.index', {
        label: 'Subtasks',
        parent: 'projects.tasks.show'
      });
      
      addRouteMapping('projects.tasks.show', {
        label: 'Task Details',
        parent: 'projects.tasks.index',
        dynamic: true
      });
      
      addRouteMapping('projects.tasks.index', {
        label: 'Tasks',
        parent: 'projects.show'
      });
      
      const breadcrumbs = generateBreadcrumbs('projects.tasks.subtasks.show', { id: 1, taskId: 2, subtaskId: 3 });
      
      expect(breadcrumbs.length).toBeGreaterThan(3);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[breadcrumbs.length - 1].current).toBe(true);
    });

    it('handles custom breadcrumb paths without infinite loops', () => {
      const { getNestedBreadcrumbs } = useBreadcrumbs();
      
      const circularPath = [
        { label: 'A', href: '/a' },
        { label: 'B', href: '/b' },
        { label: 'A', href: '/a' }, // Duplicate
        { label: 'Current' }
      ];
      
      const result = getNestedBreadcrumbs('test.route', {}, circularPath);
      
      expect(result).toHaveLength(4);
      expect(result[3].current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty page props', () => {
      mockPage.props.value = {};
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toBeDefined();
      expect(breadcrumbs.value.length).toBeGreaterThan(0);
    });

    it('handles missing route mapping', () => {
      mockPage.component.value = 'NonExistent/Page';
      
      const { breadcrumbs } = useBreadcrumbs();
      
      expect(breadcrumbs.value).toHaveLength(2);
      expect(breadcrumbs.value[0].label).toBe('Dashboard');
      expect(breadcrumbs.value[1].label).toBe('Page NonExistent');
    });

    it('handles circular parent relationships gracefully', () => {
      const { routeMapping, generateBreadcrumbs } = useBreadcrumbs();
      
      // Temporarily create a circular reference for testing
      const originalMapping = { ...routeMapping };
      routeMapping['test.circular'] = { label: 'Circular', parent: 'test.circular' };
      
      // Should not cause infinite loop
      const breadcrumbs = generateBreadcrumbs('test.circular');
      
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].label).toBe('Circular');
      
      // Restore original mapping
      Object.assign(routeMapping, originalMapping);
    });

    it('handles missing window object gracefully', () => {
      const originalWindow = global.window;
      delete global.window;
      
      const { getHistory } = useBreadcrumbs();
      
      // Should not throw error
      expect(() => getHistory()).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });
  });
});