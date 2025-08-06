import { computed } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * Enhanced permissions composable with comprehensive error handling
 * Provides safe access to user permissions and role-based access control
 */
export function usePermissions() {
  const { 
    user, 
    isAuthenticated, 
    roles, 
    hasRole, 
    hasAnyRole, 
    hasAllRoles,
    validateAuthState 
  } = useAuth()
  
  // Simple error handling without circular dependency
  const handleError = (error, context) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[PERMISSIONS] ${context}:`, error)
    }
  }
  
  const safeExecute = (operation, options = {}) => {
    try {
      if (options.requireAuth !== false && !isAuthenticated.value) {
        return options.fallback !== undefined ? options.fallback : false
      }
      return operation()
    } catch (error) {
      handleError(error, options.operation || 'unknown operation')
      return options.fallback !== undefined ? options.fallback : false
    }
  }
  
  // Permission definitions for the HR system
  const PERMISSIONS = {
    // Employee Management
    EMPLOYEE_VIEW: 'employee.view',
    EMPLOYEE_CREATE: 'employee.create',
    EMPLOYEE_EDIT: 'employee.edit',
    EMPLOYEE_DELETE: 'employee.delete',
    
    // Department Management
    DEPARTMENT_VIEW: 'department.view',
    DEPARTMENT_CREATE: 'department.create',
    DEPARTMENT_EDIT: 'department.edit',
    DEPARTMENT_DELETE: 'department.delete',
    
    // Leave Management
    LEAVE_VIEW: 'leave.view',
    LEAVE_CREATE: 'leave.create',
    LEAVE_APPROVE: 'leave.approve',
    LEAVE_DELETE: 'leave.delete',
    
    // Attendance Management
    ATTENDANCE_VIEW: 'attendance.view',
    ATTENDANCE_EDIT: 'attendance.edit',
    ATTENDANCE_REPORT: 'attendance.report',
    
    // Project Management
    PROJECT_VIEW: 'project.view',
    PROJECT_CREATE: 'project.create',
    PROJECT_EDIT: 'project.edit',
    PROJECT_DELETE: 'project.delete',
    
    // Task Management
    TASK_VIEW: 'task.view',
    TASK_CREATE: 'task.create',
    TASK_EDIT: 'task.edit',
    TASK_ASSIGN: 'task.assign',
    
    // Feedback System
    FEEDBACK_VIEW: 'feedback.view',
    FEEDBACK_CREATE: 'feedback.create',
    FEEDBACK_RESPOND: 'feedback.respond',
    
    // System Administration
    ADMIN_USERS: 'admin.users',
    ADMIN_ROLES: 'admin.roles',
    ADMIN_SETTINGS: 'admin.settings'
  }
  
  // Role-based permission mapping
  const ROLE_PERMISSIONS = {
    'Admin': Object.values(PERMISSIONS),
    'HR': [
      PERMISSIONS.EMPLOYEE_VIEW,
      PERMISSIONS.EMPLOYEE_CREATE,
      PERMISSIONS.EMPLOYEE_EDIT,
      PERMISSIONS.DEPARTMENT_VIEW,
      PERMISSIONS.DEPARTMENT_CREATE,
      PERMISSIONS.DEPARTMENT_EDIT,
      PERMISSIONS.LEAVE_VIEW,
      PERMISSIONS.LEAVE_APPROVE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.ATTENDANCE_REPORT,
      PERMISSIONS.FEEDBACK_VIEW,
      PERMISSIONS.FEEDBACK_RESPOND
    ],
    'Manager': [
      PERMISSIONS.EMPLOYEE_VIEW,
      PERMISSIONS.LEAVE_VIEW,
      PERMISSIONS.LEAVE_APPROVE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_EDIT,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.FEEDBACK_VIEW
    ],
    'Employee': [
      PERMISSIONS.LEAVE_VIEW,
      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.FEEDBACK_CREATE
    ]
  }
  
  /**
   * Get all permissions for the current user based on their roles
   */
  const userPermissions = computed(() => {
    return safeExecute(
      () => {
        if (!isAuthenticated.value || !roles.value.length) {
          return []
        }
        
        const permissions = new Set()
        
        roles.value.forEach(role => {
          const rolePermissions = ROLE_PERMISSIONS[role] || []
          rolePermissions.forEach(permission => permissions.add(permission))
        })
        
        return Array.from(permissions)
      },
      {
        fallback: [],
        operation: 'getting user permissions',
        component: 'usePermissions',
        requireAuth: false
      }
    )
  })
  
  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission) => {
    return safeExecute(
      () => {
        if (!permission || typeof permission !== 'string') {
          console.warn('[PERMISSIONS] Invalid permission parameter:', permission)
          return false
        }
        
        if (!isAuthenticated.value) {
          return false
        }
        
        return userPermissions.value.includes(permission)
      },
      {
        fallback: false,
        operation: `checking permission: ${permission}`,
        component: 'usePermissions'
      }
    )
  }
  
  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList) => {
    return safeExecute(
      () => {
        if (!Array.isArray(permissionList)) {
          console.warn('[PERMISSIONS] hasAnyPermission expects an array:', permissionList)
          return false
        }
        
        if (!isAuthenticated.value) {
          return false
        }
        
        return permissionList.some(permission => hasPermission(permission))
      },
      {
        fallback: false,
        operation: `checking any permissions: ${permissionList}`,
        component: 'usePermissions'
      }
    )
  }
  
  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList) => {
    return safeExecute(
      () => {
        if (!Array.isArray(permissionList)) {
          console.warn('[PERMISSIONS] hasAllPermissions expects an array:', permissionList)
          return false
        }
        
        if (!isAuthenticated.value) {
          return false
        }
        
        return permissionList.every(permission => hasPermission(permission))
      },
      {
        fallback: false,
        operation: `checking all permissions: ${permissionList}`,
        component: 'usePermissions'
      }
    )
  }
  
  /**
   * Enhanced role checking with error handling
   */
  const canAccessRole = (roleName) => {
    try {
      return hasRole(roleName)
    } catch (error) {
      handleError(error, `checking role access: ${roleName}`)
      return false
    }
  }
  
  /**
   * Check if user can access employee management features
   */
  const canManageEmployees = computed(() => {
    return safeExecute(
      () => hasAnyRole(['Admin', 'HR']),
      {
        fallback: false,
        operation: 'checking employee management access',
        component: 'usePermissions'
      }
    )
  })
  
  /**
   * Check if user can access HR operations
   */
  const canAccessHROperations = computed(() => {
    return safeExecute(
      () => hasAnyRole(['Admin', 'HR', 'Manager']),
      {
        fallback: false,
        operation: 'checking HR operations access',
        component: 'usePermissions'
      }
    )
  })
  
  /**
   * Check if user can approve leaves
   */
  const canApproveLeaves = computed(() => {
    return safeExecute(
      () => hasAnyRole(['Admin', 'HR', 'Manager']),
      {
        fallback: false,
        operation: 'checking leave approval access',
        component: 'usePermissions'
      }
    )
  })
  
  /**
   * Check if user can manage projects
   */
  const canManageProjects = computed(() => {
    return safeExecute(
      () => hasAnyRole(['Admin', 'Manager']),
      {
        fallback: false,
        operation: 'checking project management access',
        component: 'usePermissions'
      }
    )
  })
  
  /**
   * Check if user has administrative privileges
   */
  const isAdmin = computed(() => {
    return safeExecute(
      () => hasRole('Admin'),
      {
        fallback: false,
        operation: 'checking admin privileges',
        component: 'usePermissions'
      }
    )
  })
  
  /**
   * Get permission summary for debugging
   */
  const getPermissionSummary = () => {
    if (process.env.NODE_ENV !== 'development') return {}
    
    return {
      isAuthenticated: isAuthenticated.value,
      userRoles: roles.value,
      userPermissions: userPermissions.value,
      accessLevels: {
        canManageEmployees: canManageEmployees.value,
        canAccessHROperations: canAccessHROperations.value,
        canApproveLeaves: canApproveLeaves.value,
        canManageProjects: canManageProjects.value,
        isAdmin: isAdmin.value
      },
      authStateValid: validateAuthState()
    }
  }
  
  /**
   * Debug permissions (development only)
   */
  const debugPermissions = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔐 Permission Debug Info')
      console.log('Permission Summary:', getPermissionSummary())
      console.groupEnd()
    }
  }
  
  return {
    // Permission constants
    PERMISSIONS,
    ROLE_PERMISSIONS,
    
    // Core permission checking
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checking with error handling
    canAccessRole,
    
    // Computed access levels
    canManageEmployees,
    canAccessHROperations,
    canApproveLeaves,
    canManageProjects,
    isAdmin,
    
    // Utilities
    getPermissionSummary,
    debugPermissions
  }
}