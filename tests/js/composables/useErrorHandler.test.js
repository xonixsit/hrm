import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import useErrorHandler, { useGlobalErrorHandler } from '@/composables/useErrorHandler.js'

// Mock the error handler service
vi.mock('@/services/ErrorHandlerService.js', () => {
  const mockService = {
    handleError: vi.fn(),
    classifyError: vi.fn(),
    getErrorStatistics: vi.fn(),
    getErrorHistory: vi.fn(),
    clearErrorHistory: vi.fn(),
    addErrorReporter: vi.fn(),
    addRecoveryStrategy: vi.fn(),
    isErrorRateTooHigh: vi.fn()
  }
  
  return {
    default: mockService,
    ErrorHandlerService: vi.fn(() => mockService)
  }
})

describe('useErrorHandler', () => {
  let wrapper
  let mockErrorService

  beforeEach(async () => {
    const { default: errorHandlerService } = await import('@/services/ErrorHandlerService.js')
    mockErrorService = errorHandlerService
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock window methods
    Object.defineProperty(window, 'showNotification', {
      value: vi.fn(),
      writable: true
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('initializes with default state', () => {
      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      expect(vm.hasError).toBe(false)
      expect(vm.currentError).toBe(null)
      expect(vm.isRecovering).toBe(false)
      expect(vm.recoveryAttempts).toBe(0)
      expect(vm.errorHistory).toEqual([])
    })

    it('accepts configuration options', () => {
      const options = {
        componentName: 'TestComponent',
        errorTypes: ['network'],
        autoRecover: false,
        maxRetries: 5,
        showNotifications: false
      }

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler(options)
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      // Options are used internally, we can't directly test them
      // but we can test their effects in other tests
    })
  })

  describe('Error Handling', () => {
    it('handles errors and updates state', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: {
          id: 'error_1',
          type: 'network',
          message: 'Network error',
          handled: true,
          recovered: false
        },
        recovered: false,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const error = new Error('Network error')
      const result = await vm.handleError(error)

      expect(vm.hasError).toBe(true)
      expect(vm.currentError).toBe(error)
      expect(vm.isRecovering).toBe(false)
      expect(vm.recoveryAttempts).toBe(1)
      expect(vm.errorHistory).toHaveLength(1)
      expect(result.recovered).toBe(false)
    })

    it('handles successful error recovery', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: {
          id: 'error_1',
          type: 'network',
          message: 'Network error',
          handled: true,
          recovered: true
        },
        recovered: true,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const error = new Error('Network error')
      await vm.handleError(error)

      expect(vm.hasError).toBe(false)
      expect(vm.currentError).toBe(null)
      expect(vm.isRecovering).toBe(false)
    })

    it('calls custom error handler', async () => {
      const onError = vi.fn()
      
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: { type: 'network', recovered: false },
        recovered: false,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler({ onError })
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const error = new Error('Test error')
      await vm.handleError(error)

      expect(onError).toHaveBeenCalledWith(error, expect.any(Object))
    })

    it('calls recovery callbacks', async () => {
      const onRecovery = vi.fn()
      const onRecoveryFailed = vi.fn()
      
      // Test successful recovery
      mockErrorService.handleError.mockResolvedValueOnce({
        errorInfo: { type: 'network', recovered: true },
        recovered: true,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler({ onRecovery, onRecoveryFailed })
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      await vm.handleError(new Error('Test error'))
      expect(onRecovery).toHaveBeenCalled()
      expect(onRecoveryFailed).not.toHaveBeenCalled()

      // Test failed recovery
      mockErrorService.handleError.mockResolvedValueOnce({
        errorInfo: { type: 'network', recovered: false },
        recovered: false,
        attempts: 1
      })

      await vm.handleError(new Error('Another error'))
      expect(onRecoveryFailed).toHaveBeenCalled()
    })

    it('shows notifications when enabled', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: { type: 'network', recovered: true },
        recovered: true,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler({ showNotifications: true })
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      await vm.handleError(new Error('Test error'))

      expect(window.showNotification).toHaveBeenCalledWith(
        'Issue resolved automatically',
        'success'
      )
    })

    it('handles error handler service failures', async () => {
      mockErrorService.handleError.mockRejectedValue(new Error('Service failed'))

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const result = await vm.handleError(new Error('Test error'))

      expect(result.recovered).toBe(false)
      expect(vm.isRecovering).toBe(false)
    })
  })

  describe('Manual Retry', () => {
    it('retries error recovery manually', async () => {
      mockErrorService.handleError
        .mockResolvedValueOnce({
          errorInfo: { type: 'network', recovered: false },
          recovered: false,
          attempts: 1
        })
        .mockResolvedValueOnce({
          errorInfo: { type: 'network', recovered: true },
          recovered: true,
          attempts: 1
        })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler({ autoRecover: false })
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      // Initial error
      await vm.handleError(new Error('Test error'))
      expect(vm.hasError).toBe(true)

      // Manual retry
      const retryResult = await vm.retryRecovery()
      expect(retryResult).toBe(true)
      expect(vm.hasError).toBe(false)
    })

    it('prevents retry when already retrying', async () => {
      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      vm.isRecovering = true
      const result = await vm.retryRecovery()

      expect(result).toBe(false)
      expect(mockErrorService.handleError).not.toHaveBeenCalled()
    })

    it('prevents retry when no current error', async () => {
      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const result = await vm.retryRecovery()

      expect(result).toBe(false)
      expect(mockErrorService.handleError).not.toHaveBeenCalled()
    })
  })

  describe('Error State Management', () => {
    it('clears error state', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: { type: 'network', recovered: false },
        recovered: false,
        attempts: 1
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      await vm.handleError(new Error('Test error'))
      expect(vm.hasError).toBe(true)

      vm.clearError()
      expect(vm.hasError).toBe(false)
      expect(vm.currentError).toBe(null)
      expect(vm.recoveryAttempts).toBe(0)
    })

    it('gets user-friendly error messages', () => {
      mockErrorService.classifyError.mockReturnValue('network')

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const error = new Error('Network failed')
      const message = vm.getErrorMessage(error)

      expect(message).toContain('Connection problem')
    })
  })

  describe('Error Statistics', () => {
    it('calculates component error statistics', async () => {
      mockErrorService.handleError
        .mockResolvedValueOnce({
          errorInfo: { type: 'network', recovered: true, timestamp: new Date().toISOString() },
          recovered: true,
          attempts: 1
        })
        .mockResolvedValueOnce({
          errorInfo: { type: 'server', recovered: false, timestamp: new Date().toISOString() },
          recovered: false,
          attempts: 2
        })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      await vm.handleError(new Error('Network error'))
      await vm.handleError(new Error('Server error'))

      const stats = vm.getErrorStats()

      expect(stats.total).toBe(2)
      expect(stats.recovered).toBe(1)
      expect(stats.failed).toBe(1)
      expect(stats.byType.network).toBe(1)
      expect(stats.byType.server).toBe(1)
    })

    it('detects frequent errors', async () => {
      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      // Add recent errors
      for (let i = 0; i < 6; i++) {
        vm.errorHistory.push({
          type: 'network',
          timestamp: new Date().toISOString()
        })
      }

      expect(vm.hasFrequentErrors(5)).toBe(true)
      expect(vm.hasFrequentErrors(10)).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('wraps functions with error handling', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: { type: 'client', recovered: false },
        recovered: false,
        attempts: 0
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const throwingFunction = vi.fn().mockImplementation(() => {
        throw new Error('Function error')
      })

      const wrappedFunction = vm.withErrorHandling(throwingFunction)

      await expect(wrappedFunction()).rejects.toThrow('Function error')
      expect(mockErrorService.handleError).toHaveBeenCalled()
    })

    it('creates safe functions that don\'t throw', async () => {
      mockErrorService.handleError.mockResolvedValue({
        errorInfo: { type: 'client', recovered: false },
        recovered: false,
        attempts: 0
      })

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const vm = wrapper.vm

      const throwingFunction = vi.fn().mockImplementation(() => {
        throw new Error('Function error')
      })

      const safeFunction = vm.makeSafe(throwingFunction)

      const result = await safeFunction()
      expect(result).toBe(null)
      expect(mockErrorService.handleError).toHaveBeenCalled()
    })
  })

  describe('Global Error Handling', () => {
    it('sets up global error listeners by default', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)

      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('can disable global error handling', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler({ handleGlobalErrors: false })
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('cleans up global listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const TestComponent = defineComponent({
        setup() {
          return useErrorHandler()
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })
})

describe('useGlobalErrorHandler', () => {
  let wrapper
  let mockErrorService

  beforeEach(async () => {
    const { default: errorHandlerService } = await import('@/services/ErrorHandlerService.js')
    mockErrorService = errorHandlerService
    
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('initializes with global error statistics', () => {
    mockErrorService.getErrorStatistics.mockReturnValue({
      total: 5,
      byType: { network: 3, server: 2 },
      recovered: 3,
      unrecovered: 2,
      recentErrors: 1
    })

    mockErrorService.isErrorRateTooHigh.mockReturnValue(false)

    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const vm = wrapper.vm

    expect(vm.errorStats.total).toBe(5)
    expect(vm.errorStats.byType.network).toBe(3)
    expect(vm.isErrorRateHigh).toBe(false)
  })

  it('updates statistics periodically', () => {
    mockErrorService.getErrorStatistics.mockReturnValue({
      total: 0,
      byType: {},
      recovered: 0,
      unrecovered: 0,
      recentErrors: 0
    })

    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)

    expect(mockErrorService.getErrorStatistics).toHaveBeenCalledTimes(1)

    // Fast-forward 30 seconds
    vi.advanceTimersByTime(30000)

    expect(mockErrorService.getErrorStatistics).toHaveBeenCalledTimes(2)
  })

  it('provides global error history access', () => {
    const mockHistory = [
      { id: '1', type: 'network', message: 'Network error' },
      { id: '2', type: 'server', message: 'Server error' }
    ]

    mockErrorService.getErrorHistory.mockReturnValue(mockHistory)

    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const vm = wrapper.vm

    const history = vm.getGlobalErrorHistory(10)
    expect(history).toEqual(mockHistory)
    expect(mockErrorService.getErrorHistory).toHaveBeenCalledWith(10)
  })

  it('clears global error history', () => {
    mockErrorService.getErrorStatistics.mockReturnValue({
      total: 0,
      byType: {},
      recovered: 0,
      unrecovered: 0,
      recentErrors: 0
    })

    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const vm = wrapper.vm

    vm.clearGlobalErrorHistory()

    expect(mockErrorService.clearErrorHistory).toHaveBeenCalled()
    expect(mockErrorService.getErrorStatistics).toHaveBeenCalledTimes(2) // Once on mount, once after clear
  })

  it('adds error reporters', () => {
    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const vm = wrapper.vm

    const reporter = vi.fn()
    vm.addErrorReporter(reporter)

    expect(mockErrorService.addErrorReporter).toHaveBeenCalledWith(reporter)
  })

  it('adds recovery strategies', () => {
    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const vm = wrapper.vm

    const strategy = { maxRetries: 3, recovery: vi.fn() }
    vm.addRecoveryStrategy('custom', strategy)

    expect(mockErrorService.addRecoveryStrategy).toHaveBeenCalledWith('custom', strategy)
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const TestComponent = defineComponent({
      setup() {
        return useGlobalErrorHandler()
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    wrapper.unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})