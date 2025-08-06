import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NavigationGuardService } from '@/services/NavigationGuardService'

// Mock composables
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: vi.fn()
}))

import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'

describe('NavigationGuardService', () => {
  let service
  let mockAuth
  let mockPermissions
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Mock window methods
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true
    })
    
    // Default mock implementations
    mockAuth = {
      isAuthenticated: { value: true },
      validateAuthState: vi.fn(() => true),
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(() => true)
    }
    
    mockPermissions = {
      canAccessRoute: vi.fn(() => true)
    }
    
    useAuth.mockReturnValue(mockAuth)
    usePermissions.mockReturnValue(mockPermissions)
    
    // Create fresh service instance
    service = new NavigationGuardService()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default guards', () => {
      service.initialize()
      
      expect(service.isInitialized).toBe(true)
      expect(service.guards.size).toBeGreaterThan(0)
    })
    
    it('should not initialize twice', () => {
      service.initialize()
      const guardCount = service.guards.size
      
      service.initialize()
      
      expect(service.guards.size).toBe(guardCount)
    })
    
    it('should register default guards with correct priorities', () => {
      service.initialize()
      
      const guards = Array.from(service.guards.entries())
      const authGuard = guards.find(([name]) => name === 'authentication')
      const permissionGuard = guards.find(([name]) => name === 'permissions')
      
      expect(authGuard).toBeTruthy()
      expect(permissionGuard).toBeTruthy()
      expect(authGuard[1].priority).toBeLessThan(permissionGuard[1].priority)
    })
  })

  describe('Guard Registration', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should register custom guards', () => {
      const customGuard = vi.fn(() => ({ allowed: true }))
      
      service.registerGuard('custom', customGuard, {
        priority: 50,
        description: 'Custom test guard'
      })
      
      expect(service.guards.has('custom')).toBe(true)
      expect(service.guards.get('custom').priority).toBe(50)
      expect(service.guards.get('custom').description).toBe('Custom test guard')
    })
    
    it('should throw error for non-function guards', () => {
      expect(() => {
        service.registerGuard('invalid', 'not a function')
      }).toThrow("Guard 'invalid' must be a function")
    })
    
    it('should unregister guards', () => {
      const customGuard = vi.fn(() => ({ allowed: true }))
      service.registerGuard('custom', customGuard)
      
      expect(service.guards.has('custom')).toBe(true)
      
      const removed = service.unregisterGuard('custom')
      
      expect(removed).toBe(true)
      expect(service.guards.has('custom')).toBe(false)
    })
    
    it('should return false when unregistering non-existent guard', () => {
      const removed = service.unregisterGuard('nonexistent')
      
      expect(removed).toBe(false)
    })
  })

  describe('Guard Execution', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should execute guards in priority order', async () => {
      const executionOrder = []
      
      service.registerGuard('low-priority', () => {
        executionOrder.push('low')
        return { allowed: true }
      }, { priority: 100 })
      
      service.registerGuard('high-priority', () => {
        executionOrder.push('high')
        return { allowed: true }
      }, { priority: 10 })
      
      await service.executeGuards('/test', '/')
      
      expect(executionOrder[0]).toBe('high')
      expect(executionOrder[1]).toBe('low')
    })
    
    it('should stop execution when guard blocks navigation', async () => {
      const secondGuard = vi.fn(() => ({ allowed: true }))
      
      service.registerGuard('blocker', () => ({ allowed: false, reason: 'Blocked' }), { priority: 10 })
      service.registerGuard('second', secondGuard, { priority: 20 })
      
      const result = await service.executeGuards('/test', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.blockedBy).toBe('blocker')
      expect(result.reason).toBe('Blocked')
      expect(secondGuard).not.toHaveBeenCalled()
    })
    
    it('should handle guard errors gracefully', async () => {
      service.registerGuard('error-guard', () => {
        throw new Error('Guard error')
      }, { priority: 10 })
      
      const result = await service.executeGuards('/test', '/')
      
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].guard).toBe('error-guard')
      expect(result.errors[0].error).toBe('Guard error')
    })
    
    it('should block navigation in strict mode when guard errors occur', async () => {
      service.registerGuard('error-guard', () => {
        throw new Error('Guard error')
      }, { priority: 10 })
      
      const result = await service.executeGuards('/test', '/', { strictMode: true })
      
      expect(result.allowed).toBe(false)
      expect(result.blockedBy).toBe('error-guard')
      expect(result.reason).toContain('Guard error')
    })
    
    it('should skip disabled guards', async () => {
      const disabledGuard = vi.fn(() => ({ allowed: false }))
      
      service.registerGuard('disabled', disabledGuard, { enabled: false })
      
      const result = await service.executeGuards('/test', '/')
      
      expect(disabledGuard).not.toHaveBeenCalled()
      expect(result.allowed).toBe(true)
    })
  })

  describe('Authentication Guard', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should allow access for authenticated users', async () => {
      mockAuth.isAuthenticated.value = true
      
      const result = await service.executeGuards('/dashboard', '/')
      
      expect(result.allowed).toBe(true)
    })
    
    it('should block access for unauthenticated users on protected routes', async () => {
      mockAuth.isAuthenticated.value = false
      
      const result = await service.executeGuards('/dashboard', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/login')
    })
    
    it('should allow access to public routes for unauthenticated users', async () => {
      mockAuth.isAuthenticated.value = false
      
      const result = await service.executeGuards('/login', '/', { requiresAuth: false })
      
      expect(result.allowed).toBe(true)
    })
    
    it('should block access when auth state is invalid', async () => {
      mockAuth.isAuthenticated.value = true
      mockAuth.validateAuthState.mockReturnValue(false)
      
      const result = await service.executeGuards('/dashboard', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/login')
    })
  })

  describe('Permission Guard', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should allow access when user has required permissions', async () => {
      mockAuth.isAuthenticated.value = true
      mockAuth.hasAnyRole.mockReturnValue(true)
      
      const result = await service.executeGuards('/employees', '/')
      
      expect(result.allowed).toBe(true)
    })
    
    it('should block access when user lacks required permissions', async () => {
      mockAuth.isAuthenticated.value = true
      mockAuth.hasAnyRole.mockReturnValue(false)
      
      const result = await service.executeGuards('/employees', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.redirect).toBe('/dashboard')
    })
    
    it('should skip permission check for unauthenticated users', async () => {
      mockAuth.isAuthenticated.value = false
      
      // This should be handled by auth guard, not permission guard
      const result = await service.executeGuards('/employees', '/')
      
      // The auth guard should block this, not the permission guard
      expect(result.allowed).toBe(false)
      expect(result.blockedBy).toBe('authentication')
    })
  })

  describe('Route Permission Checking', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should check permissions for employee routes', async () => {
      mockAuth.hasAnyRole.mockImplementation((roles) => 
        roles.includes('Admin') || roles.includes('HR')
      )
      
      const hasPermission = await service.checkRoutePermissions('/employees')
      
      expect(hasPermission).toBe(true)
      expect(mockAuth.hasAnyRole).toHaveBeenCalledWith(['Admin', 'HR'])
    })
    
    it('should check permissions for department routes', async () => {
      mockAuth.hasAnyRole.mockImplementation((roles) => 
        roles.includes('Admin') || roles.includes('HR')
      )
      
      const hasPermission = await service.checkRoutePermissions('/departments')
      
      expect(hasPermission).toBe(true)
      expect(mockAuth.hasAnyRole).toHaveBeenCalledWith(['Admin', 'HR'])
    })
    
    it('should allow access to general routes for all authenticated users', async () => {
      const hasPermission = await service.checkRoutePermissions('/projects')
      
      expect(hasPermission).toBe(true)
    })
    
    it('should handle nested routes correctly', async () => {
      mockAuth.hasAnyRole.mockImplementation((roles) => 
        roles.includes('Admin') || roles.includes('HR')
      )
      
      const hasPermission = await service.checkRoutePermissions('/employees/123/edit')
      
      expect(hasPermission).toBe(true)
      expect(mockAuth.hasAnyRole).toHaveBeenCalledWith(['Admin', 'HR'])
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      service.initialize()
      // Mock localStorage to return empty array initially
      window.localStorage.getItem.mockReturnValue('[]')
    })
    
    it('should allow navigation under rate limit', async () => {
      const result = await service.executeGuards('/test', '/')
      
      expect(result.allowed).toBe(true)
    })
    
    it('should block navigation when rate limit exceeded', async () => {
      // Mock localStorage to return many recent navigations
      const recentNavigations = Array(35).fill(null).map(() => ({
        timestamp: new Date().toISOString(),
        to: '/test'
      }))
      window.localStorage.getItem.mockReturnValue(JSON.stringify(recentNavigations))
      
      const result = await service.executeGuards('/test', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Too many navigation requests')
    })
  })

  describe('Error Recovery', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should allow navigation to routes without recent errors', async () => {
      window.localStorage.getItem.mockReturnValue('[]')
      
      const result = await service.executeGuards('/test', '/')
      
      expect(result.allowed).toBe(true)
    })
    
    it('should block navigation to routes with many recent errors', async () => {
      const recentErrors = Array(5).fill(null).map(() => ({
        to: '/test',
        timestamp: new Date().toISOString()
      }))
      window.localStorage.getItem.mockReturnValue(JSON.stringify(recentErrors))
      
      const result = await service.executeGuards('/test', '/')
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('failed multiple times recently')
      expect(result.redirect).toBe('/dashboard')
    })
  })

  describe('Utility Methods', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should identify protected routes correctly', () => {
      expect(service.isProtectedRoute('/dashboard')).toBe(true)
      expect(service.isProtectedRoute('/employees')).toBe(true)
      expect(service.isProtectedRoute('/login')).toBe(false)
      expect(service.isProtectedRoute('/register')).toBe(false)
    })
    
    it('should identify navigation errors correctly', () => {
      const navError = new Error('navigation failed')
      const authError = new Error('Cannot read properties of undefined')
      const otherError = new Error('some other error')
      
      expect(service.isNavigationError(navError)).toBe(true)
      expect(service.isNavigationError(authError)).toBe(true)
      expect(service.isNavigationError(otherError)).toBe(false)
    })
    
    it('should provide guard statistics', () => {
      const stats = service.getGuardStats()
      
      expect(stats.totalGuards).toBeGreaterThan(0)
      expect(stats.enabledGuards).toBeGreaterThan(0)
      expect(Array.isArray(stats.guards)).toBe(true)
    })
    
    it('should toggle guard enabled state', () => {
      const guardName = 'authentication'
      
      service.toggleGuard(guardName, false)
      expect(service.guards.get(guardName).enabled).toBe(false)
      
      service.toggleGuard(guardName, true)
      expect(service.guards.get(guardName).enabled).toBe(true)
    })
    
    it('should clear error history', () => {
      service.clearErrorHistory()
      
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('navigation_errors')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('navigation_history')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      service.initialize()
    })
    
    it('should handle navigation errors and store them', () => {
      const error = new Error('Navigation failed')
      const context = { route: '/test' }
      
      service.handleNavigationError(error, context)
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'navigation_errors',
        expect.stringContaining('Navigation failed')
      )
    })
    
    it('should set up global error handlers', () => {
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })
})