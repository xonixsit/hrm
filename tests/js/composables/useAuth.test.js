import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { usePage } from '@inertiajs/vue3'

// Mock @inertiajs/vue3
vi.mock('@inertiajs/vue3', () => ({
  usePage: vi.fn()
}))

describe('useAuth composable', () => {
  let mockPage
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Default mock page structure
    mockPage = {
      props: {
        auth: {
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            roles: ['Admin', 'Manager']
          }
        }
      }
    }
    
    usePage.mockReturnValue(mockPage)
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('user property', () => {
    it('should return user data when available', () => {
      const { user } = useAuth()
      
      expect(user.value).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['Admin', 'Manager']
      })
    })
    
    it('should return null when auth data is missing', () => {
      mockPage.props = {}
      const { user } = useAuth()
      
      expect(user.value).toBeNull()
    })
    
    it('should return null when auth.user is missing', () => {
      mockPage.props.auth = {}
      const { user } = useAuth()
      
      expect(user.value).toBeNull()
    })
    
    it('should handle errors gracefully', () => {
      // Mock a page that throws an error when accessed
      usePage.mockReturnValue({
        get props() {
          throw new Error('Page props error')
        }
      })
      
      const { user } = useAuth()
      
      expect(user.value).toBeNull()
    })
  })

  describe('isAuthenticated property', () => {
    it('should return true when user is available', () => {
      const { isAuthenticated } = useAuth()
      
      expect(isAuthenticated.value).toBe(true)
    })
    
    it('should return false when user is null', () => {
      mockPage.props.auth.user = null
      const { isAuthenticated } = useAuth()
      
      expect(isAuthenticated.value).toBe(false)
    })
    
    it('should return false when auth data is missing', () => {
      mockPage.props = {}
      const { isAuthenticated } = useAuth()
      
      expect(isAuthenticated.value).toBe(false)
    })
    
    it('should handle errors gracefully', () => {
      usePage.mockReturnValue({
        get props() {
          throw new Error('Page props error')
        }
      })
      
      const { isAuthenticated } = useAuth()
      
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('roles property', () => {
    it('should return user roles when available', () => {
      const { roles } = useAuth()
      
      expect(roles.value).toEqual(['Admin', 'Manager'])
    })
    
    it('should return empty array when user has no roles', () => {
      mockPage.props.auth.user.roles = []
      const { roles } = useAuth()
      
      expect(roles.value).toEqual([])
    })
    
    it('should return empty array when roles property is missing', () => {
      delete mockPage.props.auth.user.roles
      const { roles } = useAuth()
      
      expect(roles.value).toEqual([])
    })
    
    it('should return empty array when user is null', () => {
      mockPage.props.auth.user = null
      const { roles } = useAuth()
      
      expect(roles.value).toEqual([])
    })
    
    it('should handle non-array roles gracefully', () => {
      mockPage.props.auth.user.roles = 'Admin'
      const { roles } = useAuth()
      
      expect(roles.value).toEqual([])
    })
    
    it('should handle errors gracefully', () => {
      usePage.mockReturnValue({
        get props() {
          throw new Error('Page props error')
        }
      })
      
      const { roles } = useAuth()
      
      expect(roles.value).toEqual([])
    })
  })

  describe('hasRole method', () => {
    it('should return true when user has the specified role', () => {
      const { hasRole } = useAuth()
      
      expect(hasRole('Admin')).toBe(true)
      expect(hasRole('Manager')).toBe(true)
    })
    
    it('should return false when user does not have the specified role', () => {
      const { hasRole } = useAuth()
      
      expect(hasRole('Employee')).toBe(false)
      expect(hasRole('Guest')).toBe(false)
    })
    
    it('should return false when user is not authenticated', () => {
      mockPage.props.auth.user = null
      const { hasRole } = useAuth()
      
      expect(hasRole('Admin')).toBe(false)
    })
    
    it('should handle invalid role parameter', () => {
      const { hasRole } = useAuth()
      
      expect(hasRole(null)).toBe(false)
      expect(hasRole(undefined)).toBe(false)
      expect(hasRole('')).toBe(false)
      expect(hasRole(123)).toBe(false)
    })
    
    it('should handle errors gracefully', () => {
      usePage.mockReturnValue({
        get props() {
          throw new Error('Page props error')
        }
      })
      
      const { hasRole } = useAuth()
      
      expect(hasRole('Admin')).toBe(false)
    })
  })

  describe('hasAnyRole method', () => {
    it('should return true when user has any of the specified roles', () => {
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole(['Admin', 'Employee'])).toBe(true)
      expect(hasAnyRole(['Manager', 'Guest'])).toBe(true)
      expect(hasAnyRole(['Admin'])).toBe(true)
    })
    
    it('should return false when user has none of the specified roles', () => {
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole(['Employee', 'Guest'])).toBe(false)
      expect(hasAnyRole(['HR'])).toBe(false)
    })
    
    it('should return false when user is not authenticated', () => {
      mockPage.props.auth.user = null
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole(['Admin', 'Manager'])).toBe(false)
    })
    
    it('should handle invalid roleList parameter', () => {
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole(null)).toBe(false)
      expect(hasAnyRole(undefined)).toBe(false)
      expect(hasAnyRole('Admin')).toBe(false)
      expect(hasAnyRole(123)).toBe(false)
    })
    
    it('should handle empty array', () => {
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole([])).toBe(false)
    })
    
    it('should handle errors gracefully', () => {
      usePage.mockReturnValue({
        get props() {
          throw new Error('Page props error')
        }
      })
      
      const { hasAnyRole } = useAuth()
      
      expect(hasAnyRole(['Admin'])).toBe(false)
    })
  })

  describe('hasAllRoles method', () => {
    it('should return true when user has all specified roles', () => {
      const { hasAllRoles } = useAuth()
      
      expect(hasAllRoles(['Admin', 'Manager'])).toBe(true)
      expect(hasAllRoles(['Admin'])).toBe(true)
    })
    
    it('should return false when user is missing some roles', () => {
      const { hasAllRoles } = useAuth()
      
      expect(hasAllRoles(['Admin', 'Manager', 'Employee'])).toBe(false)
      expect(hasAllRoles(['Employee'])).toBe(false)
    })
    
    it('should return false when user is not authenticated', () => {
      mockPage.props.auth.user = null
      const { hasAllRoles } = useAuth()
      
      expect(hasAllRoles(['Admin'])).toBe(false)
    })
    
    it('should handle invalid roleList parameter', () => {
      const { hasAllRoles } = useAuth()
      
      expect(hasAllRoles(null)).toBe(false)
      expect(hasAllRoles(undefined)).toBe(false)
      expect(hasAllRoles('Admin')).toBe(false)
      expect(hasAllRoles(123)).toBe(false)
    })
    
    it('should handle empty array', () => {
      const { hasAllRoles } = useAuth()
      
      // Empty array should return true (vacuous truth - all zero elements satisfy the condition)
      expect(hasAllRoles([])).toBe(true)
    })
  })

  describe('getUserProperty method', () => {
    it('should return user property when available', () => {
      const { getUserProperty } = useAuth()
      
      expect(getUserProperty('name')).toBe('John Doe')
      expect(getUserProperty('email')).toBe('john@example.com')
      expect(getUserProperty('id')).toBe(1)
    })
    
    it('should return default value when property is missing', () => {
      const { getUserProperty } = useAuth()
      
      expect(getUserProperty('nonexistent')).toBeNull()
      expect(getUserProperty('nonexistent', 'default')).toBe('default')
    })
    
    it('should return default value when user is null', () => {
      mockPage.props.auth.user = null
      const { getUserProperty } = useAuth()
      
      expect(getUserProperty('name')).toBeNull()
      expect(getUserProperty('name', 'default')).toBe('default')
    })
    
    it('should handle invalid property parameter', () => {
      const { getUserProperty } = useAuth()
      
      expect(getUserProperty(null)).toBeNull()
      expect(getUserProperty(undefined)).toBeNull()
      expect(getUserProperty('')).toBeNull()
      expect(getUserProperty(123)).toBeNull()
    })
  })

  describe('validateAuthState method', () => {
    it('should return true when auth state is valid', () => {
      const { validateAuthState } = useAuth()
      
      expect(validateAuthState()).toBe(true)
    })
    
    it('should return false when page props are missing', () => {
      usePage.mockReturnValue({})
      const { validateAuthState } = useAuth()
      
      expect(validateAuthState()).toBe(false)
    })
    
    it('should return false when auth data is missing', () => {
      mockPage.props = {}
      const { validateAuthState } = useAuth()
      
      expect(validateAuthState()).toBe(false)
    })
    
    it('should return false when user data is missing', () => {
      mockPage.props.auth = {}
      const { validateAuthState } = useAuth()
      
      expect(validateAuthState()).toBe(false)
    })
  })

  describe('getAuthError method', () => {
    it('should return null when auth state is valid', () => {
      const { getAuthError } = useAuth()
      
      expect(getAuthError()).toBeNull()
    })
    
    it('should return error when page props are missing', () => {
      usePage.mockReturnValue({})
      const { getAuthError } = useAuth()
      
      const error = getAuthError()
      expect(error).toEqual({
        type: 'critical',
        message: 'Page props not available',
        code: 'NO_PAGE_PROPS'
      })
    })
    
    it('should return error when auth data is missing', () => {
      mockPage.props = { someOtherProp: 'value' }
      const { getAuthError } = useAuth()
      
      const error = getAuthError()
      expect(error).toEqual({
        type: 'critical',
        message: 'Auth data not shared from server',
        code: 'NO_AUTH_DATA',
        context: { availableProps: ['someOtherProp'] }
      })
    })
    
    it('should return error when user data is missing', () => {
      mockPage.props.auth = { someAuthProp: 'value' }
      const { getAuthError } = useAuth()
      
      const error = getAuthError()
      expect(error).toEqual({
        type: 'critical',
        message: 'User data not available in auth object',
        code: 'NO_USER_DATA',
        context: { authKeys: ['someAuthProp'] }
      })
    })
    
    it('should return warning when roles are invalid', () => {
      mockPage.props.auth.user.roles = 'invalid'
      const { getAuthError } = useAuth()
      
      const error = getAuthError()
      expect(error).toEqual({
        type: 'warning',
        message: 'User roles data is invalid or missing',
        code: 'INVALID_ROLES',
        context: { 
          rolesType: 'string',
          rolesValue: 'invalid'
        }
      })
    })
  })

  describe('withAuthCheck method', () => {
    it('should execute operation when auth state is valid', () => {
      const { withAuthCheck } = useAuth()
      const operation = vi.fn(() => 'success')
      
      const result = withAuthCheck(operation)
      
      expect(operation).toHaveBeenCalled()
      expect(result).toBe('success')
    })
    
    it('should return fallback when auth state is invalid', () => {
      mockPage.props = {}
      const { withAuthCheck } = useAuth()
      const operation = vi.fn(() => 'success')
      
      const result = withAuthCheck(operation, 'fallback')
      
      expect(operation).not.toHaveBeenCalled()
      expect(result).toBe('fallback')
    })
    
    it('should handle operation errors gracefully', () => {
      const { withAuthCheck } = useAuth()
      const operation = vi.fn(() => {
        throw new Error('Operation failed')
      })
      
      const result = withAuthCheck(operation, 'fallback')
      
      expect(result).toBe('fallback')
    })
  })

  describe('error handling and debugging', () => {
    it('should dispatch auth-error events when errors occur', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
      
      usePage.mockReturnValue({
        get props() {
          throw new Error('Test error')
        }
      })
      
      const { user } = useAuth()
      // Access the computed property to trigger the error
      user.value
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth-error',
          detail: expect.objectContaining({
            error: expect.any(Error),
            context: 'accessing user data',
            timestamp: expect.any(String)
          })
        })
      )
    })
    
    it('should provide debug information in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const { debugAuthState } = useAuth()
      
      expect(() => debugAuthState()).not.toThrow()
      
      process.env.NODE_ENV = originalEnv
    })
  })
})