import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthErrorHandler, setupGlobalAuthErrorHandler } from '@/composables/useAuthErrorHandler'

// Mock useAuth composable
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/composables/useAuth.js'

describe('useAuthErrorHandler', () => {
  let mockAuth
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock useAuth
    mockAuth = {
      getAuthError: vi.fn(() => null),
      debugAuthState: vi.fn(),
      validateAuthState: vi.fn(() => true)
    }
    
    useAuth.mockReturnValue(mockAuth)
    
    // Mock navigator
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Test User Agent',
      writable: true
    })
    
    Object.defineProperty(navigator, 'cookieEnabled', {
      value: true,
      writable: true
    })
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/test' },
      writable: true
    })
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Error Report Creation', () => {
    it('should create structured error reports', () => {
      const { createErrorReport, ERROR_LEVELS, ERROR_CATEGORIES } = useAuthErrorHandler()
      const error = new Error('Test error')
      const context = {
        component: 'TestComponent',
        operation: 'test operation',
        level: ERROR_LEVELS.WARNING,
        category: ERROR_CATEGORIES.COMPONENT
      }
      
      const report = createErrorReport(error, context)
      
      expect(report).toMatchObject({
        level: ERROR_LEVELS.WARNING,
        category: ERROR_CATEGORIES.COMPONENT,
        message: 'Test error',
        error: {
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String)
        },
        context: {
          component: 'TestComponent',
          operation: 'test operation',
          userAgent: 'Test User Agent',
          url: 'http://localhost/test'
        }
      })
      
      expect(report.id).toMatch(/^auth_error_\d+_[a-z0-9]+$/)
      expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
    
    it('should include auth state in error reports', () => {
      const authError = { type: 'critical', message: 'Auth data missing' }
      mockAuth.getAuthError.mockReturnValue(authError)
      
      const { createErrorReport } = useAuthErrorHandler()
      const error = new Error('Test error')
      
      const report = createErrorReport(error)
      
      expect(report.authState).toEqual(authError)
    })
    
    it('should include session info in error reports', () => {
      const { createErrorReport } = useAuthErrorHandler()
      const error = new Error('Test error')
      
      const report = createErrorReport(error)
      
      expect(report.sessionInfo).toEqual({
        hasLocalStorage: true,
        hasSessionStorage: true,
        cookiesEnabled: true
      })
    })
  })

  describe('Error Handling Methods', () => {
    it('should handle general auth errors', () => {
      const { handleAuthError, errorHistory } = useAuthErrorHandler()
      const error = new Error('Auth error')
      const context = { component: 'TestComponent' }
      
      const report = handleAuthError(error, context)
      
      expect(report.message).toBe('Auth error')
      expect(report.context.component).toBe('TestComponent')
      expect(errorHistory.value).toHaveLength(1)
      expect(errorHistory.value[0]).toEqual(report)
    })
    
    it('should handle role errors with specific context', () => {
      const { handleRoleError, ERROR_CATEGORIES, ERROR_LEVELS } = useAuthErrorHandler()
      const error = new Error('Role check failed')
      
      const report = handleRoleError(error, 'Admin', { component: 'RoleGuard' })
      
      expect(report.category).toBe(ERROR_CATEGORIES.ROLE_CHECK)
      expect(report.level).toBe(ERROR_LEVELS.WARNING)
      expect(report.context.operation).toBe('checking role: Admin')
      expect(report.context.component).toBe('RoleGuard')
    })
    
    it('should handle navigation errors with critical level', () => {
      const { handleNavigationError, ERROR_CATEGORIES, ERROR_LEVELS } = useAuthErrorHandler()
      const error = new Error('Navigation failed')
      
      const report = handleNavigationError(error, '/dashboard', { component: 'Router' })
      
      expect(report.category).toBe(ERROR_CATEGORIES.NAVIGATION)
      expect(report.level).toBe(ERROR_LEVELS.CRITICAL)
      expect(report.context.operation).toBe('navigating to: /dashboard')
    })
    
    it('should handle component errors', () => {
      const { handleComponentError, ERROR_CATEGORIES, ERROR_LEVELS } = useAuthErrorHandler()
      const error = new Error('Component mount failed')
      
      const report = handleComponentError(error, 'AuthLayout')
      
      expect(report.category).toBe(ERROR_CATEGORIES.COMPONENT)
      expect(report.level).toBe(ERROR_LEVELS.CRITICAL)
      expect(report.context.component).toBe('AuthLayout')
      expect(report.context.operation).toBe('component initialization')
    })
    
    it('should handle network errors', () => {
      const { handleNetworkError, ERROR_CATEGORIES, ERROR_LEVELS } = useAuthErrorHandler()
      const error = new Error('API request failed')
      
      const report = handleNetworkError(error, '/api/user', { component: 'UserService' })
      
      expect(report.category).toBe(ERROR_CATEGORIES.NETWORK)
      expect(report.level).toBe(ERROR_LEVELS.WARNING)
      expect(report.context.operation).toBe('API request to: /api/user')
    })
    
    it('should trigger debug state for critical errors', () => {
      const { handleAuthError, ERROR_LEVELS } = useAuthErrorHandler()
      const error = new Error('Critical error')
      
      handleAuthError(error, { level: ERROR_LEVELS.CRITICAL })
      
      expect(mockAuth.debugAuthState).toHaveBeenCalled()
    })
  })

  describe('Safe Execution', () => {
    it('should execute operations successfully', async () => {
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => 'success')
      
      const result = await safeExecute(operation)
      
      expect(operation).toHaveBeenCalled()
      expect(result).toBe('success')
    })
    
    it('should validate auth state before execution', async () => {
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => 'success')
      
      await safeExecute(operation)
      
      expect(mockAuth.validateAuthState).toHaveBeenCalled()
    })
    
    it('should skip auth validation when requireAuth is false', async () => {
      mockAuth.validateAuthState.mockReturnValue(false)
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => 'success')
      
      const result = await safeExecute(operation, { requireAuth: false })
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalled()
    })
    
    it('should throw error when auth state is invalid', async () => {
      mockAuth.validateAuthState.mockReturnValue(false)
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => 'success')
      
      await expect(safeExecute(operation)).rejects.toThrow('Authentication state is invalid')
      expect(operation).not.toHaveBeenCalled()
    })
    
    it('should return fallback value on error', async () => {
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => {
        throw new Error('Operation failed')
      })
      
      const result = await safeExecute(operation, { fallback: 'fallback-value' })
      
      expect(result).toBe('fallback-value')
    })
    
    it('should suppress errors when requested', async () => {
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => {
        throw new Error('Operation failed')
      })
      
      const result = await safeExecute(operation, { suppressError: true })
      
      expect(result).toBeNull()
    })
    
    it('should re-throw errors by default', async () => {
      const { safeExecute } = useAuthErrorHandler()
      const operation = vi.fn(() => {
        throw new Error('Operation failed')
      })
      
      await expect(safeExecute(operation)).rejects.toThrow('Operation failed')
    })
  })

  describe('Error History Management', () => {
    it('should maintain error history', () => {
      const { handleAuthError, errorHistory } = useAuthErrorHandler()
      
      handleAuthError(new Error('Error 1'))
      handleAuthError(new Error('Error 2'))
      handleAuthError(new Error('Error 3'))
      
      expect(errorHistory.value).toHaveLength(3)
      expect(errorHistory.value[0].message).toBe('Error 3') // Most recent first
      expect(errorHistory.value[2].message).toBe('Error 1') // Oldest last
    })
    
    it('should limit error history size', () => {
      const { handleAuthError, errorHistory } = useAuthErrorHandler()
      
      // Add more than 50 errors
      for (let i = 0; i < 55; i++) {
        handleAuthError(new Error(`Error ${i}`))
      }
      
      expect(errorHistory.value).toHaveLength(50)
      expect(errorHistory.value[0].message).toBe('Error 54') // Most recent
      expect(errorHistory.value[49].message).toBe('Error 5') // 50th from most recent
    })
    
    it('should clear error history', () => {
      const { handleAuthError, errorHistory, clearErrorHistory } = useAuthErrorHandler()
      
      handleAuthError(new Error('Error 1'))
      handleAuthError(new Error('Error 2'))
      
      expect(errorHistory.value).toHaveLength(2)
      
      clearErrorHistory()
      
      expect(errorHistory.value).toHaveLength(0)
    })
  })

  describe('Error Statistics', () => {
    it('should provide error statistics', () => {
      const { handleAuthError, getErrorStats, ERROR_LEVELS, ERROR_CATEGORIES } = useAuthErrorHandler()
      
      handleAuthError(new Error('Critical error'), { level: ERROR_LEVELS.CRITICAL })
      handleAuthError(new Error('Warning error'), { level: ERROR_LEVELS.WARNING })
      handleAuthError(new Error('Component error'), { category: ERROR_CATEGORIES.COMPONENT })
      
      const stats = getErrorStats.value
      
      expect(stats.total).toBe(3)
      expect(stats.byLevel[ERROR_LEVELS.CRITICAL]).toBe(1)
      expect(stats.byLevel[ERROR_LEVELS.WARNING]).toBe(2) // Default level is WARNING
      expect(stats.byCategory[ERROR_CATEGORIES.COMPONENT]).toBe(3) // Default category is COMPONENT
      expect(stats.recent).toHaveLength(3)
      expect(stats.newestError.message).toBe('Component error')
      expect(stats.oldestError.message).toBe('Critical error')
    })
  })

  describe('Error Export', () => {
    it('should export error history with metadata', () => {
      const { handleAuthError, exportErrorHistory } = useAuthErrorHandler()
      
      handleAuthError(new Error('Test error'))
      
      const exportData = exportErrorHistory()
      
      expect(exportData).toMatchObject({
        timestamp: expect.any(String),
        userAgent: 'Test User Agent',
        url: 'http://localhost/test',
        stats: expect.any(Object),
        errors: expect.any(Array)
      })
      
      expect(exportData.errors).toHaveLength(1)
      expect(exportData.errors[0].message).toBe('Test error')
    })
  })
})

describe('setupGlobalAuthErrorHandler', () => {
  let addEventListenerSpy
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useAuth
    const mockAuth = {
      getAuthError: vi.fn(() => null),
      debugAuthState: vi.fn(),
      validateAuthState: vi.fn(() => true)
    }
    
    useAuth.mockReturnValue(mockAuth)
    
    // Spy on addEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  it('should set up global error handlers', () => {
    setupGlobalAuthErrorHandler()
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
  })
  
  it('should handle auth-related global errors', () => {
    setupGlobalAuthErrorHandler()
    
    // Get the error handler function
    const errorHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'error'
    )[1]
    
    // Create a mock error event with auth-related error
    const errorEvent = {
      error: new Error('Cannot read properties of undefined (reading auth)'),
      filename: 'test.js',
      lineno: 10,
      colno: 5
    }
    
    expect(() => errorHandler(errorEvent)).not.toThrow()
  })
  
  it('should handle auth-related promise rejections', () => {
    setupGlobalAuthErrorHandler()
    
    // Get the rejection handler function
    const rejectionHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'unhandledrejection'
    )[1]
    
    // Create a mock rejection event with auth-related error
    const rejectionEvent = {
      reason: new Error('Authentication failed')
    }
    
    expect(() => rejectionHandler(rejectionEvent)).not.toThrow()
  })
  
  it('should ignore non-auth-related errors', () => {
    setupGlobalAuthErrorHandler()
    
    const errorHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'error'
    )[1]
    
    const errorEvent = {
      error: new Error('Some other error'),
      filename: 'test.js',
      lineno: 10,
      colno: 5
    }
    
    // Should not throw and should handle gracefully
    expect(() => errorHandler(errorEvent)).not.toThrow()
  })
})