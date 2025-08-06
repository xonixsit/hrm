import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import errorHandlerService, { ErrorHandlerService } from '@/services/ErrorHandlerService.js'

describe('ErrorHandlerService', () => {
  let service
  let consoleWarnSpy
  let consoleErrorSpy

  beforeEach(() => {
    service = new ErrorHandlerService()
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock fetch
    global.fetch = vi.fn()
    
    // Mock navigator
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })
    
    // Mock window location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/test',
        reload: vi.fn()
      },
      writable: true
    })
    
    // Mock window history
    Object.defineProperty(window, 'history', {
      value: {
        length: 2,
        back: vi.fn()
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    service.clearErrorHistory()
  })

  describe('Error Classification', () => {
    it('classifies network errors correctly', () => {
      const networkError = new Error('Network connection failed')
      expect(service.classifyError(networkError)).toBe('network')
      
      const fetchError = new Error('fetch failed')
      expect(service.classifyError(fetchError)).toBe('network')
      
      const timeoutError = new Error('Request timeout')
      expect(service.classifyError(timeoutError)).toBe('network')
    })

    it('classifies authentication errors correctly', () => {
      const authError = new Error('Authentication failed')
      expect(service.classifyError(authError)).toBe('authentication')
      
      const loginError = new Error('Please login')
      expect(service.classifyError(loginError)).toBe('authentication')
      
      const sessionError = new Error('Session expired')
      expect(service.classifyError(sessionError)).toBe('authentication')
      
      const tokenError = new Error('Invalid token')
      expect(service.classifyError(tokenError)).toBe('authentication')
      
      const unauthorizedError = new Error('Unauthorized access')
      expect(service.classifyError(unauthorizedError)).toBe('authentication')
    })

    it('classifies permission errors correctly', () => {
      const permissionError = new Error('Permission denied')
      expect(service.classifyError(permissionError)).toBe('permission')
      
      const forbiddenError = new Error('Forbidden access')
      expect(service.classifyError(forbiddenError)).toBe('permission')
      
      const accessError = new Error('Access denied')
      expect(service.classifyError(accessError)).toBe('permission')
    })

    it('classifies validation errors correctly', () => {
      const validationError = new Error('Validation failed')
      expect(service.classifyError(validationError)).toBe('validation')
      
      const invalidError = new Error('Invalid input')
      expect(service.classifyError(invalidError)).toBe('validation')
      
      const requiredError = new Error('Field is required')
      expect(service.classifyError(requiredError)).toBe('validation')
      
      const formatError = new Error('Invalid format')
      expect(service.classifyError(formatError)).toBe('validation')
    })

    it('classifies server errors correctly', () => {
      const serverError = new Error('Internal server error')
      expect(service.classifyError(serverError)).toBe('server')
      
      const internalError = new Error('Server internal error')
      expect(service.classifyError(internalError)).toBe('server')
    })

    it('classifies client errors correctly', () => {
      const undefinedError = new Error('Cannot read properties of undefined')
      expect(service.classifyError(undefinedError)).toBe('client')
      
      const nullError = new Error('Cannot read property of null')
      expect(service.classifyError(nullError)).toBe('client')
      
      const functionError = new Error('x is not a function')
      expect(service.classifyError(functionError)).toBe('client')
    })

    it('classifies errors by HTTP status codes', () => {
      const error401 = new Error('Unauthorized')
      error401.status = 401
      expect(service.classifyError(error401)).toBe('authentication')
      
      const error403 = new Error('Forbidden')
      error403.status = 403
      expect(service.classifyError(error403)).toBe('permission')
      
      const error400 = new Error('Bad Request')
      error400.status = 400
      expect(service.classifyError(error400)).toBe('validation')
      
      const error422 = new Error('Unprocessable Entity')
      error422.status = 422
      expect(service.classifyError(error422)).toBe('validation')
      
      const error500 = new Error('Internal Server Error')
      error500.status = 500
      expect(service.classifyError(error500)).toBe('server')
    })

    it('defaults to unknown for unclassified errors', () => {
      const unknownError = new Error('Some random error')
      expect(service.classifyError(unknownError)).toBe('unknown')
      
      expect(service.classifyError(null)).toBe('unknown')
      expect(service.classifyError(undefined)).toBe('unknown')
    })
  })

  describe('Error Handling', () => {
    it('handles errors and returns result object', async () => {
      const error = new Error('Test error')
      const context = { component: 'TestComponent' }
      
      const result = await service.handleError(error, context)
      
      expect(result).toHaveProperty('errorInfo')
      expect(result).toHaveProperty('recovered')
      expect(result).toHaveProperty('attempts')
      expect(result).toHaveProperty('strategy')
      
      expect(result.errorInfo.message).toBe('Test error')
      expect(result.errorInfo.type).toBe('unknown')
      expect(result.errorInfo.context).toEqual(context)
      expect(result.errorInfo.handled).toBe(true)
    })

    it('adds errors to history', async () => {
      const error = new Error('Test error')
      
      expect(service.getErrorHistory()).toHaveLength(0)
      
      await service.handleError(error)
      
      expect(service.getErrorHistory()).toHaveLength(1)
      expect(service.getErrorHistory()[0].message).toBe('Test error')
    })

    it('generates unique error IDs', async () => {
      const error1 = new Error('Error 1')
      const error2 = new Error('Error 2')
      
      const result1 = await service.handleError(error1)
      const result2 = await service.handleError(error2)
      
      expect(result1.errorInfo.id).toBeDefined()
      expect(result2.errorInfo.id).toBeDefined()
      expect(result1.errorInfo.id).not.toBe(result2.errorInfo.id)
    })

    it('includes environment information in error info', async () => {
      const error = new Error('Test error')
      
      const result = await service.handleError(error)
      
      expect(result.errorInfo.url).toBe('http://localhost/test')
      expect(result.errorInfo.userAgent).toBeDefined()
      expect(result.errorInfo.timestamp).toBeDefined()
    })
  })

  describe('Recovery Strategies', () => {
    it('attempts network error recovery', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true })
      
      const networkError = new Error('Network connection failed')
      const result = await service.handleError(networkError)
      
      expect(result.recovered).toBe(true)
      expect(result.attempts).toBe(1)
      expect(result.strategy).toBe('network')
    })

    it('retries network errors with exponential backoff', async () => {
      vi.useFakeTimers()
      
      // Mock fetch to fail twice, then succeed
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })
      
      const networkError = new Error('Network connection failed')
      const resultPromise = service.handleError(networkError)
      
      // Fast-forward through the retry delays
      await vi.runAllTimersAsync()
      
      const result = await resultPromise
      
      expect(result.recovered).toBe(true)
      expect(result.attempts).toBe(3)
      
      vi.useRealTimers()
    })

    it('fails network recovery when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })
      
      const networkError = new Error('Network connection failed')
      const result = await service.handleError(networkError)
      
      expect(result.recovered).toBe(false)
      expect(result.error).toContain('No internet connection')
    })

    it('attempts authentication error recovery', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true })
      
      const authError = new Error('Authentication failed')
      const result = await service.handleError(authError)
      
      expect(result.recovered).toBe(true)
      expect(result.attempts).toBe(1)
      expect(result.strategy).toBe('authentication')
    })

    it('redirects on authentication recovery failure', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false })
      
      const authError = new Error('Authentication failed')
      const result = await service.handleError(authError)
      
      expect(result.recovered).toBe(false)
      expect(window.location.href).toBe('/login')
    })

    it('handles permission errors without retry', async () => {
      const permissionError = new Error('Permission denied')
      const result = await service.handleError(permissionError)
      
      expect(result.recovered).toBe(false)
      expect(result.attempts).toBe(0)
      expect(result.strategy).toBe('permission')
    })

    it('attempts server error recovery', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true })
      
      const serverError = new Error('Internal server error')
      const result = await service.handleError(serverError)
      
      expect(result.recovered).toBe(true)
      expect(result.attempts).toBe(1)
      expect(result.strategy).toBe('server')
    })

    it('attempts client error recovery by cleaning localStorage', async () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      
      localStorageMock.getItem.mockReturnValue('{"invalid": json}')
      
      const clientError = new Error('Cannot read properties of undefined')
      const result = await service.handleError(clientError)
      
      expect(result.recovered).toBe(true)
      expect(result.attempts).toBe(1)
      expect(result.strategy).toBe('client')
    })

    it('does not retry validation errors', async () => {
      const validationError = new Error('Validation failed')
      const result = await service.handleError(validationError)
      
      expect(result.recovered).toBe(false)
      expect(result.attempts).toBe(0)
      expect(result.strategy).toBe('validation')
    })
  })

  describe('Error Reporting', () => {
    it('calls registered error reporters', async () => {
      const reporter1 = vi.fn()
      const reporter2 = vi.fn()
      
      service.addErrorReporter(reporter1)
      service.addErrorReporter(reporter2)
      
      const error = new Error('Test error')
      await service.handleError(error)
      
      expect(reporter1).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          type: 'unknown'
        })
      )
      expect(reporter2).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          type: 'unknown'
        })
      )
    })

    it('handles reporter failures gracefully', async () => {
      const failingReporter = vi.fn().mockRejectedValue(new Error('Reporter failed'))
      const workingReporter = vi.fn()
      
      service.addErrorReporter(failingReporter)
      service.addErrorReporter(workingReporter)
      
      const error = new Error('Test error')
      await service.handleError(error)
      
      expect(failingReporter).toHaveBeenCalled()
      expect(workingReporter).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR HANDLER] Failed to report error:',
        expect.any(Error)
      )
    })

    it('removes error reporters', () => {
      const reporter = vi.fn()
      
      service.addErrorReporter(reporter)
      expect(service.errorReporters).toContain(reporter)
      
      service.removeErrorReporter(reporter)
      expect(service.errorReporters).not.toContain(reporter)
    })
  })

  describe('Error History Management', () => {
    it('maintains error history with size limit', async () => {
      service.maxHistorySize = 3
      
      for (let i = 0; i < 5; i++) {
        await service.handleError(new Error(`Error ${i}`))
      }
      
      const history = service.getErrorHistory()
      expect(history).toHaveLength(3)
      expect(history[0].message).toBe('Error 4') // Most recent first
      expect(history[2].message).toBe('Error 2')
    })

    it('returns limited error history', async () => {
      for (let i = 0; i < 5; i++) {
        await service.handleError(new Error(`Error ${i}`))
      }
      
      const limitedHistory = service.getErrorHistory(2)
      expect(limitedHistory).toHaveLength(2)
      expect(limitedHistory[0].message).toBe('Error 4')
      expect(limitedHistory[1].message).toBe('Error 3')
    })

    it('clears error history', async () => {
      await service.handleError(new Error('Test error'))
      expect(service.getErrorHistory()).toHaveLength(1)
      
      service.clearErrorHistory()
      expect(service.getErrorHistory()).toHaveLength(0)
    })
  })

  describe('Error Statistics', () => {
    it('calculates error statistics correctly', async () => {
      await service.handleError(new Error('Network error'))
      await service.handleError(new Error('Permission denied'))
      await service.handleError(new Error('Network timeout'))
      
      const stats = service.getErrorStatistics()
      
      expect(stats.total).toBe(3)
      expect(stats.byType.network).toBe(2)
      expect(stats.byType.permission).toBe(1)
      expect(stats.unrecovered).toBe(1) // Permission error doesn't recover
    })

    it('tracks recent errors', async () => {
      // Mock Date.now to control timestamps
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      
      await service.handleError(new Error('Recent error'))
      
      // Move time forward by 2 hours
      vi.spyOn(Date, 'now').mockReturnValue(now + (2 * 60 * 60 * 1000))
      
      await service.handleError(new Error('Old error'))
      
      const stats = service.getErrorStatistics()
      expect(stats.recentErrors).toBe(1) // Only the "old error" is within the last hour from current time
    })

    it('detects high error rates', async () => {
      expect(service.isErrorRateTooHigh(5)).toBe(false)
      
      // Add 6 errors within the last hour
      for (let i = 0; i < 6; i++) {
        await service.handleError(new Error(`Error ${i}`))
      }
      
      expect(service.isErrorRateTooHigh(5)).toBe(true)
    })
  })

  describe('Custom Recovery Strategies', () => {
    it('adds custom recovery strategies', async () => {
      const customStrategy = {
        maxRetries: 1,
        recovery: vi.fn().mockResolvedValue(true)
      }
      
      service.addRecoveryStrategy('custom', customStrategy)
      
      const customError = new Error('Custom error')
      // Mock classifyError to return 'custom'
      vi.spyOn(service, 'classifyError').mockReturnValue('custom')
      
      const result = await service.handleError(customError)
      
      expect(customStrategy.recovery).toHaveBeenCalled()
      expect(result.recovered).toBe(true)
      expect(result.strategy).toBe('custom')
    })

    it('removes recovery strategies', () => {
      service.addRecoveryStrategy('test', { recovery: vi.fn() })
      expect(service.errorRecoveryStrategies.has('test')).toBe(true)
      
      service.removeRecoveryStrategy('test')
      expect(service.errorRecoveryStrategies.has('test')).toBe(false)
    })

    it('lists available strategies', () => {
      const strategies = service.getAvailableStrategies()
      
      expect(strategies).toContain('network')
      expect(strategies).toContain('authentication')
      expect(strategies).toContain('permission')
      expect(strategies).toContain('server')
      expect(strategies).toContain('client')
      expect(strategies).toContain('validation')
    })
  })

  describe('Singleton Instance', () => {
    it('exports a singleton instance', () => {
      expect(errorHandlerService).toBeInstanceOf(ErrorHandlerService)
    })

    it('maintains state across imports', async () => {
      await errorHandlerService.handleError(new Error('Test error'))
      
      // Import again to test singleton behavior
      const { default: anotherInstance } = await import('@/services/ErrorHandlerService.js')
      
      expect(anotherInstance.getErrorHistory()).toHaveLength(1)
      expect(anotherInstance).toBe(errorHandlerService)
    })
  })

  describe('Edge Cases', () => {
    it('handles null/undefined errors gracefully', async () => {
      const result1 = await service.handleError(null)
      expect(result1.errorInfo.type).toBe('unknown')
      
      const result2 = await service.handleError(undefined)
      expect(result2.errorInfo.type).toBe('unknown')
    })

    it('handles errors without messages', async () => {
      const error = new Error()
      error.message = ''
      
      const result = await service.handleError(error)
      expect(result.errorInfo.message).toBe('')
      expect(result.errorInfo.type).toBe('unknown')
    })

    it('handles recovery strategy failures', async () => {
      const failingStrategy = {
        maxRetries: 1,
        recovery: vi.fn().mockRejectedValue(new Error('Recovery failed'))
      }
      
      service.addRecoveryStrategy('failing', failingStrategy)
      
      const error = new Error('Test error')
      vi.spyOn(service, 'classifyError').mockReturnValue('failing')
      
      const result = await service.handleError(error)
      
      expect(result.recovered).toBe(false)
      expect(result.error).toBe('Recovery failed')
    })
  })
})