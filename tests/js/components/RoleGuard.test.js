import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RoleGuard from '@/Components/RoleGuard.vue'

// Mock all composables
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/composables/usePermissions.js', () => ({
  usePermissions: vi.fn()
}))

vi.mock('@/composables/useNavigation.js', () => ({
  useNavigation: vi.fn()
}))

vi.mock('@/composables/useAuthErrorBoundary.js', () => ({
  useAuthErrorBoundary: vi.fn()
}))

vi.mock('@/composables/useAuthErrorHandler.js', () => ({
  useAuthErrorHandler: vi.fn()
}))

// Mock AuthErrorFallback component
vi.mock('@/Components/AuthErrorFallback.vue', () => ({
  default: {
    name: 'AuthErrorFallback',
    template: '<div data-testid="auth-error-fallback"><slot name="fallback" /></div>',
    props: ['errorInfo', 'customMessage'],
    emits: ['retry', 'continue']
  }
}))

import { useAuth } from '@/composables/useAuth.js'
import { usePermissions } from '@/composables/usePermissions.js'
import { useNavigation } from '@/composables/useNavigation.js'
import { useAuthErrorBoundary } from '@/composables/useAuthErrorBoundary.js'
import { useAuthErrorHandler } from '@/composables/useAuthErrorHandler.js'

describe('RoleGuard Component', () => {
  let mockAuth, mockPermissions, mockNavigation, mockErrorBoundary, mockErrorHandler
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Default mock implementations
    mockAuth = {
      isAuthenticated: { value: true },
      roles: { value: ['Admin', 'Manager'] },
      hasRole: vi.fn((role) => ['Admin', 'Manager'].includes(role)),
      hasAnyRole: vi.fn((roles) => roles.some(role => ['Admin', 'Manager'].includes(role))),
      hasAllRoles: vi.fn((roles) => roles.every(role => ['Admin', 'Manager'].includes(role))),
      debugAuthState: vi.fn()
    }
    
    mockPermissions = {
      userPermissions: { value: ['read', 'write', 'delete'] },
      hasPermission: vi.fn((perm) => ['read', 'write', 'delete'].includes(perm)),
      hasAnyPermission: vi.fn((perms) => perms.some(perm => ['read', 'write', 'delete'].includes(perm))),
      hasAllPermissions: vi.fn((perms) => perms.every(perm => ['read', 'write', 'delete'].includes(perm)))
    }
    
    mockNavigation = {
      navigateToLogin: vi.fn()
    }
    
    mockErrorBoundary = {
      hasError: { value: false },
      errorInfo: { value: null },
      resetError: vi.fn()
    }
    
    mockErrorHandler = {
      handleAuthError: vi.fn(),
      safeExecute: vi.fn((fn, options) => {
        try {
          return fn()
        } catch (error) {
          return options?.fallback !== undefined ? options.fallback : false
        }
      }),
      ERROR_LEVELS: { WARNING: 'warning', ERROR: 'error' }
    }
    
    // Setup mock returns
    useAuth.mockReturnValue(mockAuth)
    usePermissions.mockReturnValue(mockPermissions)
    useNavigation.mockReturnValue(mockNavigation)
    useAuthErrorBoundary.mockReturnValue(mockErrorBoundary)
    useAuthErrorHandler.mockReturnValue(mockErrorHandler)
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Access Control', () => {
    it('should grant access when user has required roles', () => {
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockAuth.hasAnyRole).toHaveBeenCalledWith(['Admin'])
    })
    
    it('should deny access when user lacks required roles', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(false)
      expect(wrapper.find('.access-denied').exists()).toBe(true)
      expect(wrapper.text()).toContain("You don't have permission to access this content")
    })
    
    it('should grant access when user has required permissions', () => {
      const wrapper = mount(RoleGuard, {
        props: {
          permissions: ['read']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockPermissions.hasAnyPermission).toHaveBeenCalledWith(['read'])
    })
    
    it('should deny access when user lacks required permissions', () => {
      mockPermissions.hasAnyPermission.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          permissions: ['admin'],
          showFallback: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(false)
      expect(wrapper.find('.access-denied').exists()).toBe(true)
    })
    
    it('should grant access to authenticated users when no roles/permissions specified', () => {
      const wrapper = mount(RoleGuard, {
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
    })
    
    it('should deny access to unauthenticated users', () => {
      mockAuth.isAuthenticated.value = false
      
      const wrapper = mount(RoleGuard, {
        props: {
          showFallback: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(false)
      expect(wrapper.find('.access-denied').exists()).toBe(true)
    })
  })

  describe('Match Types', () => {
    it('should use "any" match type by default for roles', () => {
      mockAuth.hasAnyRole.mockReturnValue(true)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin', 'SuperAdmin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockAuth.hasAnyRole).toHaveBeenCalledWith(['Admin', 'SuperAdmin'])
      expect(mockAuth.hasAllRoles).not.toHaveBeenCalled()
    })
    
    it('should use "all" match type when specified for roles', () => {
      mockAuth.hasAllRoles.mockReturnValue(true)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin', 'Manager'],
          matchType: 'all'
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockAuth.hasAllRoles).toHaveBeenCalledWith(['Admin', 'Manager'])
      expect(mockAuth.hasAnyRole).not.toHaveBeenCalled()
    })
    
    it('should use "any" match type by default for permissions', () => {
      mockPermissions.hasAnyPermission.mockReturnValue(true)
      
      const wrapper = mount(RoleGuard, {
        props: {
          permissions: ['read', 'admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockPermissions.hasAnyPermission).toHaveBeenCalledWith(['read', 'admin'])
      expect(mockPermissions.hasAllPermissions).not.toHaveBeenCalled()
    })
    
    it('should use "all" match type when specified for permissions', () => {
      mockPermissions.hasAllPermissions.mockReturnValue(true)
      
      const wrapper = mount(RoleGuard, {
        props: {
          permissions: ['read', 'write'],
          matchType: 'all'
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(true)
      expect(mockPermissions.hasAllPermissions).toHaveBeenCalledWith(['read', 'write'])
      expect(mockPermissions.hasAnyPermission).not.toHaveBeenCalled()
    })
  })

  describe('UI Behavior', () => {
    it('should show custom denied message when provided', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: true,
          customDeniedMessage: 'Custom access denied message'
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.text()).toContain('Custom access denied message')
      expect(wrapper.text()).not.toContain("You don't have permission to access this content")
    })
    
    it('should hide fallback when showFallback is false', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: false
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(false)
      expect(wrapper.find('.access-denied').exists()).toBe(false)
      expect(wrapper.text().trim()).toBe('')
    })
    
    it('should show login button for unauthenticated users', () => {
      mockAuth.isAuthenticated.value = false
      
      const wrapper = mount(RoleGuard, {
        props: {
          showFallback: true,
          showActions: true,
          showLoginButton: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('.login-btn').exists()).toBe(true)
      expect(wrapper.find('.login-btn').text()).toBe('Sign In')
    })
    
    it('should hide login button when showLoginButton is false', () => {
      mockAuth.isAuthenticated.value = false
      
      const wrapper = mount(RoleGuard, {
        props: {
          showFallback: true,
          showActions: true,
          showLoginButton: false
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('.login-btn').exists()).toBe(false)
    })
    
    it('should show contact button when enabled', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: true,
          showActions: true,
          showContactButton: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('.contact-btn').exists()).toBe(true)
      expect(wrapper.find('.contact-btn').text()).toBe('Request Access')
    })
  })

  describe('Events', () => {
    it('should emit access-granted event when access is allowed', () => {
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.emitted('access-granted')).toBeTruthy()
      expect(wrapper.emitted('access-granted')[0][0]).toEqual({
        roles: ['Admin'],
        permissions: [],
        userRoles: ['Admin', 'Manager'],
        userPermissions: ['read', 'write', 'delete']
      })
    })
    
    it('should emit access-denied event when access is denied', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.emitted('access-denied')).toBeTruthy()
      expect(wrapper.emitted('access-denied')[0][0]).toEqual({
        roles: ['SuperAdmin'],
        permissions: [],
        userRoles: ['Admin', 'Manager'],
        userPermissions: ['read', 'write', 'delete'],
        reason: 'insufficient_roles'
      })
    })
    
    it('should emit login event when login button is clicked', async () => {
      mockAuth.isAuthenticated.value = false
      
      const wrapper = mount(RoleGuard, {
        props: {
          showFallback: true,
          showActions: true,
          showLoginButton: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      await wrapper.find('.login-btn').trigger('click')
      
      expect(wrapper.emitted('login')).toBeTruthy()
      expect(mockNavigation.navigateToLogin).toHaveBeenCalled()
    })
    
    it('should emit contact event when contact button is clicked', async () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: true,
          showActions: true,
          showContactButton: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      await wrapper.find('.contact-btn').trigger('click')
      
      expect(wrapper.emitted('contact')).toBeTruthy()
      expect(wrapper.emitted('contact')[0][0]).toEqual({
        requiredRoles: ['SuperAdmin'],
        requiredPermissions: [],
        userRoles: ['Admin', 'Manager']
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error fallback when hasError is true', () => {
      mockErrorBoundary.hasError.value = true
      mockErrorBoundary.errorInfo.value = { message: 'Test error' }
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="auth-error-fallback"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="protected-content"]').exists()).toBe(false)
    })
    
    it('should emit error event when error occurs', () => {
      mockErrorBoundary.hasError.value = true
      mockErrorBoundary.errorInfo.value = { message: 'Test error' }
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toEqual({ message: 'Test error' })
    })
    
    it('should use safeExecute for access checks', () => {
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['Admin']
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>'
        }
      })
      
      expect(mockErrorHandler.safeExecute).toHaveBeenCalled()
    })
  })

  describe('Custom Slots', () => {
    it('should render custom denied slot when provided', () => {
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const wrapper = mount(RoleGuard, {
        props: {
          roles: ['SuperAdmin'],
          showFallback: true
        },
        slots: {
          default: '<div data-testid="protected-content">Protected Content</div>',
          denied: '<div data-testid="custom-denied">Custom denied message</div>'
        }
      })
      
      expect(wrapper.find('[data-testid="custom-denied"]').exists()).toBe(true)
      expect(wrapper.find('.access-denied').exists()).toBe(false)
    })
  })
})