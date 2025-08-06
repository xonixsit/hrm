import { computed, ref, watch } from 'vue';
import { usePage, router } from '@inertiajs/vue3';

/**
 * Composable for generating and managing breadcrumbs with enhanced features
 */
export function useBreadcrumbs(customBreadcrumbs = null) {
  const page = usePage();
  const customBreadcrumbsRef = ref(customBreadcrumbs);
  const breadcrumbHistory = ref([]);
  const maxHistoryLength = 10;

  // Route mapping for automatic breadcrumb generation
  const routeMapping = {
    // Dashboard
    'dashboard': { label: 'Dashboard', icon: 'HomeIcon' },
    
    // Projects
    'projects.index': { label: 'Projects', parent: 'dashboard' },
    'projects.create': { label: 'Create Project', parent: 'projects.index' },
    'projects.show': { label: 'Project Details', parent: 'projects.index', dynamic: true },
    'projects.edit': { label: 'Edit Project', parent: 'projects.index', dynamic: true },
    
    // Tasks
    'tasks.index': { label: 'Tasks', parent: 'dashboard' },
    'tasks.create': { label: 'Create Task', parent: 'tasks.index' },
    'tasks.show': { label: 'Task Details', parent: 'tasks.index', dynamic: true },
    'tasks.edit': { label: 'Edit Task', parent: 'tasks.index', dynamic: true },
    
    // Employees
    'employees.index': { label: 'Employees', parent: 'dashboard' },
    'employees.create': { label: 'Create Employee', parent: 'employees.index' },
    'employees.show': { label: 'Employee Details', parent: 'employees.index', dynamic: true },
    'employees.edit': { label: 'Edit Employee', parent: 'employees.index', dynamic: true },
    
    // Departments
    'departments.index': { label: 'Departments', parent: 'dashboard' },
    'departments.create': { label: 'Create Department', parent: 'departments.index' },
    'departments.show': { label: 'Department Details', parent: 'departments.index', dynamic: true },
    'departments.edit': { label: 'Edit Department', parent: 'departments.index', dynamic: true },
    
    // Leaves
    'leaves.index': { label: 'Leaves', parent: 'dashboard' },
    'leaves.create': { label: 'Request Leave', parent: 'leaves.index' },
    'leaves.show': { label: 'Leave Details', parent: 'leaves.index', dynamic: true },
    'leaves.edit': { label: 'Edit Leave', parent: 'leaves.index', dynamic: true },
    
    // Feedbacks
    'feedbacks.index': { label: 'Feedbacks', parent: 'dashboard' },
    'feedbacks.create': { label: 'Create Feedback', parent: 'feedbacks.index' },
    'feedbacks.show': { label: 'Feedback Details', parent: 'feedbacks.index', dynamic: true },
    'feedbacks.edit': { label: 'Edit Feedback', parent: 'feedbacks.index', dynamic: true },
    
    // Attendances
    'attendances.index': { label: 'Attendances', parent: 'dashboard' },
    'attendances.edit': { label: 'Edit Attendance', parent: 'attendances.index', dynamic: true },
    
    // Timesheets
    'timesheets.index': { label: 'Timesheets', parent: 'dashboard' },
    'timesheets.create': { label: 'Create Timesheet', parent: 'timesheets.index' },
    'timesheets.show': { label: 'Timesheet Details', parent: 'timesheets.index', dynamic: true },
    'timesheets.edit': { label: 'Edit Timesheet', parent: 'timesheets.index', dynamic: true },
    
    // Notifications
    'notifications.index': { label: 'Notifications', parent: 'dashboard' },
    
    // Profile
    'profile.edit': { label: 'Profile Settings', parent: 'dashboard' },
  };

  /**
   * Generate breadcrumbs based on current route
   */
  const generateBreadcrumbs = (routeName, routeParams = {}) => {
    const breadcrumbs = [];
    let currentRoute = routeName;
    
    // Build breadcrumb chain by following parent relationships
    while (currentRoute && routeMapping[currentRoute]) {
      const routeConfig = routeMapping[currentRoute];
      let label = routeConfig.label;
      
      // Handle dynamic labels for show/edit pages
      if (routeConfig.dynamic && routeParams) {
        label = getDynamicLabel(currentRoute, routeParams, label);
      }
      
      breadcrumbs.unshift({
        label,
        href: currentRoute === routeName ? null : route(currentRoute, getRouteParams(currentRoute, routeParams)),
        current: currentRoute === routeName,
        icon: routeConfig.icon
      });
      
      currentRoute = routeConfig.parent;
    }
    
    return breadcrumbs;
  };

  /**
   * Get dynamic label for show/edit pages
   */
  const getDynamicLabel = (routeName, routeParams, defaultLabel) => {
    const resourceName = routeName.split('.')[0];
    const action = routeName.split('.')[1];
    
    // Try to get resource name from page props
    const pageProps = page.props.value;
    
    if (action === 'show' || action === 'edit') {
      // Look for the resource in page props
      const resource = pageProps[resourceName.slice(0, -1)] || // singular form
                     pageProps[resourceName] || // plural form
                     pageProps.data;
      
      if (resource && resource.name) {
        return resource.name;
      } else if (resource && resource.title) {
        return resource.title;
      } else if (resource && resource.id) {
        return `${defaultLabel} #${resource.id}`;
      }
    }
    
    return defaultLabel;
  };

  /**
   * Get route parameters for parent routes
   */
  const getRouteParams = (routeName, currentParams) => {
    // For index routes, no parameters needed
    if (routeName.endsWith('.index')) {
      return {};
    }
    
    // For other routes, pass through relevant parameters
    return currentParams;
  };

  /**
   * Computed breadcrumbs based on current page or custom breadcrumbs
   */
  const breadcrumbs = computed(() => {
    // Use custom breadcrumbs if provided
    if (customBreadcrumbsRef.value) {
      return customBreadcrumbsRef.value;
    }
    
    // Generate automatic breadcrumbs
    const currentRoute = page.component.value;
    const routeParams = page.props.value.route?.params || {};
    
    // Convert component name to route name (e.g., "Projects/Show" -> "projects.show")
    const routeName = componentToRouteName(currentRoute);
    
    if (routeName && routeMapping[routeName]) {
      return generateBreadcrumbs(routeName, routeParams);
    }
    
    // Fallback to simple breadcrumb
    return [
      { label: 'Dashboard', href: route('dashboard'), icon: 'HomeIcon' },
      { label: getPageTitle(currentRoute), current: true }
    ];
  });

  /**
   * Convert component name to route name
   */
  const componentToRouteName = (componentName) => {
    if (!componentName) return null;
    
    // Handle special cases
    if (componentName === 'Dashboard') return 'dashboard';
    
    // Convert "Projects/Show" to "projects.show"
    const parts = componentName.split('/');
    if (parts.length === 2) {
      const resource = parts[0].toLowerCase();
      const action = parts[1].toLowerCase();
      return `${resource}.${action}`;
    }
    
    return null;
  };

  /**
   * Get page title from component name
   */
  const getPageTitle = (componentName) => {
    if (!componentName) return 'Page';
    
    const parts = componentName.split('/');
    if (parts.length === 2) {
      return `${parts[1]} ${parts[0]}`;
    }
    
    return componentName;
  };

  /**
   * Set custom breadcrumbs
   */
  const setBreadcrumbs = (newBreadcrumbs) => {
    customBreadcrumbsRef.value = newBreadcrumbs;
  };

  /**
   * Clear custom breadcrumbs (revert to automatic)
   */
  const clearCustomBreadcrumbs = () => {
    customBreadcrumbsRef.value = null;
  };

  /**
   * Add breadcrumb to the end of the chain
   */
  const addBreadcrumb = (breadcrumb) => {
    const current = breadcrumbs.value;
    // Remove current flag from existing breadcrumbs
    const updated = current.map(item => ({ ...item, current: false }));
    // Add new breadcrumb as current
    updated.push({ ...breadcrumb, current: true });
    setBreadcrumbs(updated);
  };

  /**
   * Track breadcrumb navigation history
   */
  const addToHistory = (breadcrumbChain) => {
    const historyItem = {
      breadcrumbs: [...breadcrumbChain],
      timestamp: Date.now(),
      url: window.location.href,
      component: page.component.value
    };
    
    breadcrumbHistory.value.unshift(historyItem);
    
    // Limit history size
    if (breadcrumbHistory.value.length > maxHistoryLength) {
      breadcrumbHistory.value = breadcrumbHistory.value.slice(0, maxHistoryLength);
    }
  };

  /**
   * Get breadcrumb navigation history
   */
  const getHistory = () => {
    return breadcrumbHistory.value;
  };

  /**
   * Clear breadcrumb history
   */
  const clearHistory = () => {
    breadcrumbHistory.value = [];
  };

  /**
   * Enhanced route mapping with complex navigation paths support
   */
  const addRouteMapping = (routeName, config) => {
    routeMapping[routeName] = config;
  };

  /**
   * Remove route mapping
   */
  const removeRouteMapping = (routeName) => {
    delete routeMapping[routeName];
  };

  /**
   * Get breadcrumb for complex nested routes
   */
  const getNestedBreadcrumbs = (routeName, routeParams = {}, customPath = []) => {
    if (customPath.length > 0) {
      return customPath.map((item, index) => ({
        ...item,
        current: index === customPath.length - 1
      }));
    }
    
    return generateBreadcrumbs(routeName, routeParams);
  };

  /**
   * Generate structured breadcrumb data for complex applications
   */
  const getStructuredBreadcrumbs = () => {
    const current = breadcrumbs.value;
    
    return {
      items: current,
      current: current.find(item => item.current),
      parents: current.filter(item => !item.current),
      depth: current.length,
      hasParents: current.length > 1,
      isRoot: current.length === 1 && current[0].label === 'Dashboard'
    };
  };

  /**
   * Watch for route changes and update history
   */
  watch(
    () => [page.component.value, page.url?.value || window?.location?.href],
    () => {
      const currentBreadcrumbs = breadcrumbs.value;
      if (currentBreadcrumbs.length > 0) {
        addToHistory(currentBreadcrumbs);
      }
    },
    { immediate: true }
  );

  return {
    breadcrumbs,
    setBreadcrumbs,
    clearCustomBreadcrumbs,
    addBreadcrumb,
    generateBreadcrumbs,
    routeMapping,
    addRouteMapping,
    removeRouteMapping,
    getNestedBreadcrumbs,
    getStructuredBreadcrumbs,
    getHistory,
    clearHistory,
    breadcrumbHistory: computed(() => breadcrumbHistory.value)
  };
}