/**
 * Navigation Configuration
 * 
 * This file defines the navigation structure with role-based access control
 * for the sidebar navigation system.
 */

export const navigationStructure = {
  sections: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      route: 'dashboard',
      roles: ['Admin', 'Manager', 'Employee'],
      order: 1
    },
    {
      id: 'people',
      label: 'People Management',
      icon: 'users',
      roles: ['Admin', 'Manager'],
      order: 2,
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
    {
      id: 'time',
      label: 'Time Management',
      icon: 'clock',
      roles: ['Admin', 'Manager', 'Employee'],
      order: 3,
      children: [
        {
          id: 'attendance',
          label: 'Attendance',
          icon: 'calendar-check',
          route: 'attendances.index',
          roles: ['Admin', 'Manager', 'Employee']
        },
        {
          id: 'timesheets',
          label: 'Timesheets',
          icon: 'document-text',
          route: 'timesheets.index',
          roles: ['Admin', 'Manager', 'Employee']
        },
        {
          id: 'leaves',
          label: 'Leaves',
          icon: 'calendar-x',
          route: 'leaves.index',
          roles: ['Admin', 'Manager', 'Employee']
        },
        {
          id: 'pending-approvals',
          label: 'Pending Approvals',
          icon: 'check-circle',
          route: 'timesheets.pending-approvals',
          roles: ['Admin', 'Manager']
        }
      ]
    },
    {
      id: 'projects',
      label: 'Project Management',
      icon: 'folder-open',
      roles: ['Admin', 'Manager', 'Employee'],
      order: 4,
      children: [
        {
          id: 'projects',
          label: 'Projects',
          icon: 'folder',
          route: 'projects.index',
          roles: ['Admin', 'Manager', 'Employee']
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: 'clipboard',
          route: 'tasks.index',
          roles: ['Admin', 'Manager', 'Employee']
        }
      ]
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: 'chat',
      roles: ['Admin', 'Manager', 'Employee'],
      order: 5,
      children: [
        {
          id: 'feedbacks',
          label: 'Feedbacks',
          icon: 'message-square',
          route: 'feedbacks.index',
          roles: ['Admin', 'Manager', 'Employee']
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'bell',
          route: 'notifications.index',
          roles: ['Admin', 'Manager', 'Employee']
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'cog',
      roles: ['Admin'],
      order: 6,
      children: [
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: 'cog',
          route: 'settings.index',
          roles: ['Admin']
        },
        {
          id: 'user-management',
          label: 'User Management',
          icon: 'users',
          route: 'users.index',
          roles: ['Admin']
        }
      ]
    }
  ]
};

/**
 * Filter navigation items based on user roles
 * @param {Array} userRoles - Array of user role names
 * @returns {Array} - Filtered navigation structure
 */
export function getFilteredNavigation(userRoles = []) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return [];
  }

  return navigationStructure.sections
    .filter(section => {
      // Check if user has any of the required roles for this section
      return section.roles.some(role => userRoles.includes(role));
    })
    .map(section => {
      // If section has children, filter them too
      if (section.children) {
        const filteredChildren = section.children.filter(child => 
          child.roles.some(role => userRoles.includes(role))
        );
        
        // Only include section if it has accessible children or is a direct route
        if (filteredChildren.length > 0 || section.route) {
          return {
            ...section,
            children: filteredChildren
          };
        }
        return null;
      }
      
      return section;
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => (a.order || 999) - (b.order || 999)); // Sort by order
}

/**
 * Check if a navigation item is active based on current route
 * @param {Object} item - Navigation item
 * @param {String} currentRoute - Current route name
 * @returns {Boolean} - Whether the item is active
 */
export function isNavigationItemActive(item, currentRoute) {
  if (!item || !currentRoute) return false;
  
  // Direct route match - check if current route starts with item route
  if (item.route) {
    // For exact match or prefix match (e.g., 'employees.index' matches 'employees.create')
    const routeParts = item.route.split('.');
    const currentParts = currentRoute.split('.');
    
    // Check if the route matches at the beginning
    // For 'employees.index' to match 'employees.create', we check the first part
    if (routeParts.length > 0 && currentParts.length > 0) {
      // If item route is 'employees.index' and current is 'employees.create'
      // We want to match on the 'employees' part
      const itemBase = routeParts[0];
      const currentBase = currentParts[0];
      
      if (itemBase === currentBase) {
        return true;
      }
    }
    
    // Also check for exact match
    if (item.route === currentRoute) {
      return true;
    }
  }
  
  // Check children for active state
  if (item.children) {
    return item.children.some(child => 
      isNavigationItemActive(child, currentRoute)
    );
  }
  
  return false;
}

/**
 * Get breadcrumb trail for current navigation item
 * @param {String} currentRoute - Current route name
 * @param {Array} userRoles - User roles for filtering
 * @returns {Array} - Breadcrumb trail
 */
export function getNavigationBreadcrumbs(currentRoute, userRoles = []) {
  const filteredNav = getFilteredNavigation(userRoles);
  const breadcrumbs = [];
  
  for (const section of filteredNav) {
    if (section.route && isNavigationItemActive(section, currentRoute)) {
      breadcrumbs.push({
        label: section.label,
        route: section.route,
        icon: section.icon
      });
      break;
    }
    
    if (section.children) {
      for (const child of section.children) {
        if (child.route && isNavigationItemActive(child, currentRoute)) {
          breadcrumbs.push({
            label: section.label,
            icon: section.icon
          });
          breadcrumbs.push({
            label: child.label,
            route: child.route,
            icon: child.icon
          });
          break;
        }
      }
    }
  }
  
  return breadcrumbs;
}

export default {
  navigationStructure,
  getFilteredNavigation,
  isNavigationItemActive,
  getNavigationBreadcrumbs
};