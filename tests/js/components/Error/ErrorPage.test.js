import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorPage from '@/Components/Error/ErrorPage.vue'

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

describe('ErrorPage', () => {
  let wrapper
  let consoleErrorSpy

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock window methods
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/test',
        reload: vi.fn()
      },
      writable: true
    })
    
    Object.defineProperty(window, 'history', {
      value: {
        length: 2,
        back: vi.fn()
      },
      writable: true
    })
    
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(ErrorPage)

      expect(wrapper.find('.error-page').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toBe('Something Went Wrong')
      expect(wrapper.find('.error-description').text()).toContain('unexpected error occurred')
    })

    it('displays custom title and description', () => {
      const title = 'Custom Error Title'
      const description = 'Custom error description'
      
      wrapper = mount(ErrorPage, {
        props: { title, description }
      })

      expect(wrapper.find('.error-title').text()).toBe(title)
      expect(wrapper.find('.error-description').text()).toBe(description)
    })

    it('displays error code when provided', () => {
      wrapper = mount(ErrorPage, {
        props: { errorCode: '404' }
      })

      expect(wrapper.find('.error-code-text').text()).toBe('404')
    })

    it('displays additional info when provided', () => {
      const additionalInfo = 'Additional error information'
      
      wrapper = mount(ErrorPage, {
        props: { additionalInfo }
      })

      expect(wrapper.find('.error-additional-info').exists()).toBe(true)
      expect(wrapper.find('.info-text').text()).toBe(additionalInfo)
    })
  })

  describe('Error Type Handling', () => {
    it('displays correct content for not-found error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'not-found' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Page Not Found')
      expect(wrapper.find('.error-description').text()).toContain('doesn\'t exist or has been moved')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('document-magnifying-glass')
      expect(icon.attributes('data-color')).toBe('info')
    })

    it('displays correct content for network error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'network' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Connection Problem')
      expect(wrapper.find('.error-description').text()).toContain('Unable to connect to our servers')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('wifi-slash')
      expect(icon.attributes('data-color')).toBe('warning')
    })

    it('displays correct content for permission error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'permission' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Access Denied')
      expect(wrapper.find('.error-description').text()).toContain('don\'t have permission')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('shield-exclamation')
      expect(icon.attributes('data-color')).toBe('error')
    })

    it('displays correct content for authentication error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'authentication' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Authentication Required')
      expect(wrapper.find('.error-description').text()).toContain('log in to access')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('lock-closed')
      expect(icon.attributes('data-color')).toBe('warning')
    })

    it('displays correct content for server error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'server' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Server Error')
      expect(wrapper.find('.error-description').text()).toContain('servers are experiencing issues')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('server-stack')
      expect(icon.attributes('data-color')).toBe('error')
    })

    it('displays correct content for maintenance error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'maintenance' }
      })

      expect(wrapper.find('.error-title').text()).toBe('Under Maintenance')
      expect(wrapper.find('.error-description').text()).toContain('performing maintenance')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('wrench-screwdriver')
      expect(icon.attributes('data-color')).toBe('info')
    })
  })

  describe('HTTP Error Codes', () => {
    it('displays correct content for 404 error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorCode: 404 }
      })

      expect(wrapper.find('.error-title').text()).toBe('Page Not Found')
      expect(wrapper.find('.error-description').text()).toContain('doesn\'t exist')
    })

    it('displays correct content for 500 error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorCode: 500 }
      })

      expect(wrapper.find('.error-title').text()).toBe('Internal Server Error')
      expect(wrapper.find('.error-description').text()).toContain('internal error')
    })

    it('displays correct content for 403 error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorCode: 403 }
      })

      expect(wrapper.find('.error-title').text()).toBe('Forbidden')
      expect(wrapper.find('.error-description').text()).toContain('don\'t have permission')
    })

    it('displays correct content for 401 error', () => {
      wrapper = mount(ErrorPage, {
        props: { errorCode: 401 }
      })

      expect(wrapper.find('.error-title').text()).toBe('Unauthorized')
      expect(wrapper.find('.error-description').text()).toContain('need to log in')
    })
  })

  describe('Action Buttons', () => {
    it('displays retry button for appropriate error types', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'network' }
      })

      const retryButton = wrapper.find('.error-action--primary')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Try Again')
    })

    it('does not display retry button for permission errors', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'permission' }
      })

      const retryButton = wrapper.find('.error-action--primary')
      expect(retryButton.exists()).toBe(false)
    })

    it('displays home button with correct text for authentication errors', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'authentication' }
      })

      const homeButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go to Login'))
      expect(homeButton).toBeTruthy()
    })

    it('displays home button with correct text for other errors', () => {
      wrapper = mount(ErrorPage, {
        props: { errorType: 'server' }
      })

      const homeButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go to Dashboard'))
      expect(homeButton).toBeTruthy()
    })

    it('displays back button when history is available', () => {
      wrapper = mount(ErrorPage)

      const backButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go Back'))
      expect(backButton).toBeTruthy()
    })

    it('does not display back button when no history', () => {
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true
      })

      wrapper = mount(ErrorPage, {
        props: { showBack: true }
      })

      const backButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go Back'))
      expect(backButton).toBeFalsy()
    })

    it('displays reload button when enabled', () => {
      wrapper = mount(ErrorPage, {
        props: { showReload: true }
      })

      const reloadButton = wrapper.findAll('.error-action--ghost').find(btn => 
        btn.text().includes('Reload Page'))
      expect(reloadButton).toBeTruthy()
    })
  })

  describe('Help Links', () => {
    it('displays help links when enabled and URLs provided', () => {
      wrapper = mount(ErrorPage, {
        props: {
          showHelp: true,
          supportEmail: 'support@example.com',
          documentationUrl: 'https://docs.example.com',
          statusPageUrl: 'https://status.example.com'
        }
      })

      expect(wrapper.find('.error-help-links').exists()).toBe(true)
      
      const supportLink = wrapper.find('a[href="mailto:support@example.com"]')
      expect(supportLink.exists()).toBe(true)
      expect(supportLink.text()).toContain('Contact Support')
      
      const docsLink = wrapper.find('a[href="https://docs.example.com"]')
      expect(docsLink.exists()).toBe(true)
      expect(docsLink.text()).toContain('Documentation')
      
      const statusLink = wrapper.find('a[href="https://status.example.com"]')
      expect(statusLink.exists()).toBe(true)
      expect(statusLink.text()).toContain('System Status')
    })

    it('does not display help links when disabled', () => {
      wrapper = mount(ErrorPage, {
        props: {
          showHelp: false,
          supportEmail: 'support@example.com'
        }
      })

      expect(wrapper.find('.error-help-links').exists()).toBe(false)
    })

    it('does not display help links when no URLs provided', () => {
      wrapper = mount(ErrorPage, {
        props: { showHelp: true }
      })

      expect(wrapper.find('.error-help-links').exists()).toBe(false)
    })
  })

  describe('Error Details (Development)', () => {
    it('shows error details in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      const errorDetails = { message: 'Test error', stack: 'Error stack' }
      
      wrapper = mount(ErrorPage, {
        props: { errorDetails }
      })

      expect(wrapper.find('.error-details').exists()).toBe(true)
      expect(wrapper.find('.details-toggle').exists()).toBe(true)
    })

    it('hides error details in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      const errorDetails = { message: 'Test error', stack: 'Error stack' }
      
      wrapper = mount(ErrorPage, {
        props: { errorDetails }
      })

      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('toggles error details visibility', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      const errorDetails = { message: 'Test error', stack: 'Error stack' }
      
      wrapper = mount(ErrorPage, {
        props: { errorDetails }
      })

      const toggleButton = wrapper.find('.details-toggle')
      expect(wrapper.find('.details-content').exists()).toBe(false)

      await toggleButton.trigger('click')
      expect(wrapper.find('.details-content').exists()).toBe(true)

      await toggleButton.trigger('click')
      expect(wrapper.find('.details-content').exists()).toBe(false)
    })

    it('displays formatted error details', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      const errorDetails = { message: 'Test error', stack: 'Error stack' }
      
      wrapper = mount(ErrorPage, {
        props: { errorDetails }
      })

      const toggleButton = wrapper.find('.details-toggle')
      await toggleButton.trigger('click')

      const detailsText = wrapper.find('.details-text')
      expect(detailsText.text()).toContain('Test error')
      expect(detailsText.text()).toContain('Error stack')
    })

    it('displays request information when provided', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      const requestInfo = { url: '/test', method: 'GET' }
      
      wrapper = mount(ErrorPage, {
        props: { 
          errorDetails: { message: 'Test error' },
          requestInfo 
        }
      })

      const toggleButton = wrapper.find('.details-toggle')
      await toggleButton.trigger('click')

      const detailsSections = wrapper.findAll('.details-section')
      expect(detailsSections.length).toBe(2)
      
      const requestSection = detailsSections.find(section => 
        section.find('.details-heading').text().includes('Request Information'))
      expect(requestSection).toBeTruthy()
    })
  })

  describe('Action Handlers', () => {
    it('handles retry action', async () => {
      const onRetry = vi.fn().mockResolvedValue()
      
      wrapper = mount(ErrorPage, {
        props: { 
          errorType: 'network',
          onRetry 
        }
      })

      const retryButton = wrapper.find('.error-action--primary')
      await retryButton.trigger('click')

      expect(onRetry).toHaveBeenCalled()
      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('shows loading state during retry', async () => {
      const onRetry = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      wrapper = mount(ErrorPage, {
        props: { 
          errorType: 'network',
          onRetry 
        }
      })

      const retryButton = wrapper.find('.error-action--primary')
      await retryButton.trigger('click')

      expect(wrapper.vm.isRetrying).toBe(true)
      expect(retryButton.text()).toContain('Retrying...')
    })

    it('handles go home action', async () => {
      const { router } = await import('@inertiajs/vue3')
      
      wrapper = mount(ErrorPage)

      const homeButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go to Dashboard'))
      
      if (homeButton) {
        await homeButton.trigger('click')
        expect(router.visit).toHaveBeenCalledWith('/dashboard')
        expect(wrapper.emitted('go-home')).toBeTruthy()
      }
    })

    it('handles go back action', async () => {
      const backSpy = vi.spyOn(window.history, 'back')
      
      wrapper = mount(ErrorPage)

      const backButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go Back'))
      
      if (backButton) {
        await backButton.trigger('click')
        expect(backSpy).toHaveBeenCalled()
        expect(wrapper.emitted('go-back')).toBeTruthy()
      }
    })

    it('handles reload action', async () => {
      const reloadSpy = vi.spyOn(window.location, 'reload')
      
      wrapper = mount(ErrorPage, {
        props: { showReload: true }
      })

      const reloadButton = wrapper.findAll('.error-action--ghost').find(btn => 
        btn.text().includes('Reload Page'))
      
      if (reloadButton) {
        await reloadButton.trigger('click')
        expect(reloadSpy).toHaveBeenCalled()
        expect(wrapper.emitted('reload')).toBeTruthy()
      }
    })

    it('uses custom home handler when provided', async () => {
      const onGoHome = vi.fn()
      
      wrapper = mount(ErrorPage, {
        props: { onGoHome }
      })

      const homeButton = wrapper.findAll('.error-action--secondary').find(btn => 
        btn.text().includes('Go to Dashboard'))
      
      if (homeButton) {
        await homeButton.trigger('click')
        expect(onGoHome).toHaveBeenCalled()
      }
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      wrapper = mount(ErrorPage)

      expect(wrapper.find('.error-page').classes()).toContain('min-h-screen')
      expect(wrapper.find('.error-page').classes()).toContain('px-4')
      expect(wrapper.find('.error-page').classes()).toContain('sm:px-6')
      expect(wrapper.find('.error-page').classes()).toContain('lg:px-8')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      wrapper = mount(ErrorPage)

      expect(wrapper.find('h1.error-title').exists()).toBe(true)
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('type')).toBe('button')
      })
    })

    it('has proper link attributes for external links', () => {
      wrapper = mount(ErrorPage, {
        props: {
          showHelp: true,
          documentationUrl: 'https://docs.example.com',
          statusPageUrl: 'https://status.example.com'
        }
      })

      const externalLinks = wrapper.findAll('a[target="_blank"]')
      externalLinks.forEach(link => {
        expect(link.attributes('rel')).toBe('noopener noreferrer')
      })
    })
  })

  describe('Custom Slots', () => {
    it('renders custom illustration slot', () => {
      wrapper = mount(ErrorPage, {
        slots: {
          illustration: '<div data-testid="custom-illustration">Custom Illustration</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-illustration"]').exists()).toBe(true)
    })

    it('renders custom actions slot', () => {
      wrapper = mount(ErrorPage, {
        slots: {
          actions: '<button data-testid="custom-action">Custom Action</button>'
        }
      })

      expect(wrapper.find('[data-testid="custom-action"]').exists()).toBe(true)
    })
  })
})