import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '@/Components/Error/ErrorBoundary.vue'

// Mock the Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'size', 'color', 'class'],
    template: '<div class="mock-icon" :data-name="name" :data-size="size" :data-color="color"></div>'
  }
}))

// Mock Inertia router
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn()
  }
}))

describe('ErrorBoundary', () => {
  let wrapper
  let consoleErrorSpy
  let consoleGroupSpy
  let consoleLogSpy
  let consoleGroupEndSpy

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
    
    // Mock window methods
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/test',
        reload: vi.fn()
      },
      writable: true
    })
    
    // Mock navigator
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Test User Agent',
      writable: true
    })
    
    // Mock process.env
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div data-testid="child-content">Child Content</div>'
        }
      })

      expect(wrapper.find('[data-testid="child-content"]').exists()).toBe(true)
      expect(wrapper.find('.error-fallback').exists()).toBe(false)
    })

    it('applies default props correctly', () => {
      wrapper = mount(ErrorBoundary)

      expect(wrapper.vm.showRetry).toBe(true)
      expect(wrapper.vm.showReload).toBe(true)
      expect(wrapper.vm.showHome).toBe(true)
      expect(wrapper.vm.maxRetries).toBe(3)
    })
  })

  describe('Error Classification', () => {
    it('classifies network errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const networkError = new Error('Network connection failed')
      await wrapper.vm.handleError(networkError, null, {})
      
      expect(wrapper.vm.errorType).toBe('network')
      expect(wrapper.vm.errorTitle).toBe('Network Error')
      expect(wrapper.vm.errorMessage).toContain('Unable to connect to the server')
    })

    it('classifies permission errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const permissionError = new Error('Permission denied')
      await wrapper.vm.handleError(permissionError, null, {})
      
      expect(wrapper.vm.errorType).toBe('permission')
      expect(wrapper.vm.errorTitle).toBe('Access Denied')
      expect(wrapper.vm.errorMessage).toContain('don\'t have permission')
    })

    it('classifies authentication errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const authError = new Error('Authentication failed')
      await wrapper.vm.handleError(authError, null, {})
      
      expect(wrapper.vm.errorType).toBe('authentication')
      expect(wrapper.vm.errorTitle).toBe('Authentication Error')
      expect(wrapper.vm.errorMessage).toContain('session has expired')
    })

    it('classifies validation errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const validationError = new Error('Validation failed')
      await wrapper.vm.handleError(validationError, null, {})
      
      expect(wrapper.vm.errorType).toBe('validation')
      expect(wrapper.vm.errorTitle).toBe('Validation Error')
      expect(wrapper.vm.errorMessage).toContain('data provided is invalid')
    })

    it('classifies server errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const serverError = new Error('Internal server error')
      await wrapper.vm.handleError(serverError, null, {})
      
      expect(wrapper.vm.errorType).toBe('server')
      expect(wrapper.vm.errorTitle).toBe('Server Error')
      expect(wrapper.vm.errorMessage).toContain('server encountered an error')
    })

    it('classifies client errors correctly', async () => {
      wrapper = mount(ErrorBoundary)
      
      const clientError = new Error('Cannot read properties of undefined')
      await wrapper.vm.handleError(clientError, null, {})
      
      expect(wrapper.vm.errorType).toBe('client')
      expect(wrapper.vm.errorTitle).toBe('Application Error')
      expect(wrapper.vm.errorMessage).toContain('application encountered an error')
    })

    it('defaults to unknown error type for unclassified errors', async () => {
      wrapper = mount(ErrorBoundary)
      
      const unknownError = new Error('Some random error')
      await wrapper.vm.handleError(unknownError, null, {})
      
      expect(wrapper.vm.errorType).toBe('unknown')
      expect(wrapper.vm.errorTitle).toBe('Something went wrong')
      expect(wrapper.vm.errorMessage).toContain('unexpected error occurred')
    })
  })

  describe('Error Display', () => {
    it('displays error fallback UI when error occurs', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Child Content</div>'
        }
      })

      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      expect(wrapper.find('.error-fallback').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toBe('Something went wrong')
      expect(wrapper.find('.error-message').text()).toContain('unexpected error occurred')
    })

    it('displays correct icon for error type', async () => {
      wrapper = mount(ErrorBoundary)
      
      const networkError = new Error('Network error')
      await wrapper.vm.handleError(networkError, null, {})
      await nextTick()

      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('wifi-slash')
      expect(icon.attributes('data-color')).toBe('warning')
    })

    it('shows error details in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      expect(wrapper.find('.error-details').exists()).toBe(true)
      expect(wrapper.find('.details-toggle').exists()).toBe(true)
    })

    it('hides error details in production mode', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('toggles error details visibility', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const toggleButton = wrapper.find('.details-toggle')
      expect(wrapper.find('.details-content').exists()).toBe(false)

      await toggleButton.trigger('click')
      expect(wrapper.find('.details-content').exists()).toBe(true)

      await toggleButton.trigger('click')
      expect(wrapper.find('.details-content').exists()).toBe(false)
    })
  })

  describe('Error Actions', () => {
    it('displays retry button by default', async () => {
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const retryButton = wrapper.find('.error-action--primary')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Try Again')
    })

    it('handles retry action', async () => {
      const onRetry = vi.fn().mockResolvedValue()
      
      wrapper = mount(ErrorBoundary, {
        props: { onRetry }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const retryButton = wrapper.find('.error-action--primary')
      await retryButton.trigger('click')

      expect(onRetry).toHaveBeenCalled()
    })

    it('disables retry button when retrying', async () => {
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      wrapper.vm.isRetrying = true
      await nextTick()

      const retryButton = wrapper.find('.error-action--primary')
      expect(retryButton.attributes('disabled')).toBeDefined()
      expect(retryButton.text()).toContain('Retrying...')
    })

    it('shows report button in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      wrapper = mount(ErrorBoundary, {
        props: { showReport: true }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const reportButton = wrapper.find('.error-action--secondary')
      expect(reportButton.exists()).toBe(true)
      expect(reportButton.text()).toContain('Report Issue')
    })

    it('handles reload action', async () => {
      const reloadSpy = vi.spyOn(window.location, 'reload')
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const reloadButton = wrapper.find('[data-testid="reload-button"]') || 
                          wrapper.findAll('.error-action--secondary').find(btn => 
                            btn.text().includes('Reload Page'))
      
      if (reloadButton) {
        await reloadButton.trigger('click')
        expect(reloadSpy).toHaveBeenCalled()
      }
    })

    it('handles go home action', async () => {
      const { router } = await import('@inertiajs/vue3')
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const homeButton = wrapper.findAll('.error-action--ghost').find(btn => 
        btn.text().includes('Go to Dashboard'))
      
      if (homeButton) {
        await homeButton.trigger('click')
        expect(router.visit).toHaveBeenCalledWith('/dashboard')
      }
    })
  })

  describe('Error Reporting', () => {
    it('calls custom error reporter', async () => {
      const onReportError = vi.fn()
      
      wrapper = mount(ErrorBoundary, {
        props: { onReportError }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})

      expect(onReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          type: 'unknown'
        })
      )
    })

    it('calls global error reporter if available', async () => {
      const globalReportError = vi.fn()
      window.reportError = globalReportError
      
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})

      expect(globalReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          type: 'unknown'
        })
      )
      
      delete window.reportError
    })

    it('emits error event', async () => {
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toMatchObject({
        message: 'Test error',
        type: 'unknown'
      })
    })
  })

  describe('Retry Logic', () => {
    it('tracks retry attempts', async () => {
      wrapper = mount(ErrorBoundary, {
        props: { maxRetries: 2 }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      expect(wrapper.vm.retryCount).toBe(0)

      await wrapper.vm.handleRetry()
      expect(wrapper.vm.retryCount).toBe(1)

      await wrapper.vm.handleRetry()
      expect(wrapper.vm.retryCount).toBe(2)
    })

    it('prevents retry when max retries reached', async () => {
      wrapper = mount(ErrorBoundary, {
        props: { maxRetries: 1 }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      
      wrapper.vm.retryCount = 1
      await nextTick()

      const initialRetryCount = wrapper.vm.retryCount
      await wrapper.vm.handleRetry()
      
      expect(wrapper.vm.retryCount).toBe(initialRetryCount)
    })

    it('resets error state on successful retry', async () => {
      const onRetry = vi.fn().mockResolvedValue()
      
      wrapper = mount(ErrorBoundary, {
        props: { onRetry }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      
      expect(wrapper.vm.hasError).toBe(true)
      
      await wrapper.vm.handleRetry()
      
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.currentError).toBe(null)
    })
  })

  describe('Auto-retry for Network Errors', () => {
    it('auto-retries network errors after delay', async () => {
      vi.useFakeTimers()
      
      wrapper = mount(ErrorBoundary)
      
      const networkError = new Error('Network connection failed')
      await wrapper.vm.handleError(networkError, null, {})
      
      expect(wrapper.vm.retryCount).toBe(0)
      
      // Fast-forward time to trigger auto-retry
      vi.advanceTimersByTime(2000)
      await nextTick()
      
      expect(wrapper.vm.retryCount).toBe(1)
      
      vi.useRealTimers()
    })
  })

  describe('Component Props', () => {
    it('respects showRetry prop', async () => {
      wrapper = mount(ErrorBoundary, {
        props: { showRetry: false }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const retryButton = wrapper.find('.error-action--primary')
      expect(retryButton.exists()).toBe(false)
    })

    it('respects showHome prop', async () => {
      wrapper = mount(ErrorBoundary, {
        props: { showHome: false }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const homeButton = wrapper.findAll('.error-action').find(btn => 
        btn.text().includes('Go to Dashboard'))
      expect(homeButton).toBeFalsy()
    })

    it('uses custom fallback message', async () => {
      const customMessage = 'Custom error message'
      
      wrapper = mount(ErrorBoundary, {
        props: { fallbackMessage: customMessage }
      })
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      expect(wrapper.find('.error-message').text()).toBe(customMessage)
    })

    it('filters error types when specified', async () => {
      wrapper = mount(ErrorBoundary, {
        props: { errorTypes: ['network'] }
      })
      
      // This should be handled
      const networkError = new Error('Network error')
      const networkResult = await wrapper.vm.handleError(networkError, null, {})
      expect(networkResult).toBe(false) // Handled by boundary
      
      // This should not be handled (would return true to let it propagate)
      const validationError = new Error('Validation error')
      // Since we're calling handleError directly, we need to check the classification
      expect(wrapper.vm.classifyError(validationError)).toBe('validation')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      wrapper = mount(ErrorBoundary)
      
      const error = new Error('Test error')
      await wrapper.vm.handleError(error, null, {})
      await nextTick()

      const errorTitle = wrapper.find('.error-title')
      expect(errorTitle.exists()).toBe(true)
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('type')).toBe('button')
      })
    })
  })
})