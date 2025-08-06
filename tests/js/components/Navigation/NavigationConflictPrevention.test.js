import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavigationController from '@/Components/Navigation/NavigationController.vue'
import NavigationErrorBoundary from '@/Components/Navigation/NavigationErrorBoundary.vue'
import NavigationFallback from '@/Components/Navigation/NavigationFallback.vue'
import { conflictDetector } from '@/services/NavigationConflictDetector.js'
import { navigationMonitor } from '@/services/NavigationMonitor.js'

// Mock the composables
vi.mock('@/composables/useResponsive.js', () => ({
  useResponsive: vi.fn(() => ({
    isMobile: vi.fn().mockReturnValue(false),
    isTablet: vi.fn().mockReturnValue(false),
    isDesktop: vi.fn().mockReturnValue(true),
    windowWidth: vi.fn().mockReturnValue(1200),
    debugResponsive: vi.fn()
  }))
}))

vi.mock('@/composables/useBreakpointManager.js', () => ({
  useBreakpointManager: vi.fn(() => ({
    windowWidth: vi.fn().mockReturnValue(1200),
    navigationMode: vi.fn().mockReturnValue('desktop'),
    isTransitioning: vi.fn().mockReturnValue(false),
    preserveCurrentState: vi.fn(),
    restorePreservedState: vi.fn(),
    getBreakpointInfo: vi.fn(() => ({ current: 'desktop', width: 1200 })),
    debugBreakpointManager: vi.fn(),
    NAVIGATION_BREAKPOINT: 1024
  }))
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: vi.fn().mockReturnValue({ id: 1, name: 'Test User' }),
    roles: vi.fn().mockReturnValue(['Employee']),
    isAuthenticated: vi.fn().mockReturnValue(true)
  }))
}))

vi.mock('@/composables/useTheme.js', () => ({
  useTheme: vi.fn(() => ({
    isDark: vi.fn().mockReturnValue(false)
  }))
}))

vi.mock('@/composables/useAuthErrorHandler.js', () => ({
  useAuthErrorHandler: vi.fn(() => ({
    handleNavigationError: vi.fn(),
    handleComponentError: vi.fn(),
    safeExecute: vi.fn(),
    ERROR_LEVELS: {
      CRITICAL: 'critical',
      HIGH: 'high',
      WARNING: 'warning',
      INFO: 'info'
    },
    ERROR_CATEGORIES: {
      NAVIGATION: 'navigation',
      COMPONENT: 'component'
    }
  }))
}))

// Mock navigation components
vi.mock('@/Components/Navigation/SidebarNavigation.vue', () => ({
  default: {
    name: 'SidebarNavigation',
    template: '<div data-navigation-type="desktop" data-navigation-id="sidebar">Desktop Navigation</div>',
    props: ['currentRoute', 'userRoles', 'isAuthenticated', 'initiallyCollapsed'],
    emits: ['navigate', 'collapse-change', 'state-change']
  }
}))

vi.mock('@/Components/Navigation/MobileNavigation.vue', () => ({
  default: {
    name: 'MobileNavigation',
    template: '<div data-navigation-type="mobile" data-navigation-id="mobile">Mobile Navigation</div>',
    props: ['currentRoute', 'userRoles', 'isAuthenticated'],
    emits: ['navigate', 'state-change', 'mobile-drawer-toggle']
  }
}))

vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="icon">{{ name }}</span>',
    props: ['name', 'size', 'class']
  }
}))

describe('Navigation Conflict Prevention', () => {
  let wrapper
  let mockWindow
  let mockDocument

  beforeEach(() => {
    // Reset all services
    conflictDetector.reset()
    navigationMonitor.reset()
    
    // Mock global objects
    mockWindow = {
      innerWidth: 1200,
      innerHeight: 800,
      devicePixelRatio: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      location: {
        href: 'http://localhost/dashboard',
        pathname: '/dashboard',
        search: '',
        hash: ''
      },
      reportError: vi.fn(),
      URL: vi.fn().mockImplementation((url) => ({
        href: url,
        origin: 'http://localhost',
        pathname: '/dashboard'
      }))
    }
    
    mockDocument = {
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(() => null),
      body: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      },
      hidden: false,
      visibilityState: 'visible',
      addEventListener: vi.fn()
    }
    
    global.window = mockWindow
    global.document = mockDocument
    global.navigator = {
      userAgent: 'test-user-agent'
    }
    global.performance = {
      now: vi.fn(() => Date.now())
    }
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    conflictDetector.reset()
    navigationMonitor.reset()
  })

  describe('Conflict Detection and Prevention', () => {
    it('should prevent multiple navigation components of the same type', async () => {
      // Register multiple desktop components
      const comp1Id = conflictDetector.registerComponent('desktop-1', 'desktop')
      const comp2Id = conflictDetector.registerComponent('desktop-2', 'desktop')
      
      // Detect conflicts
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('multiple_desktop')
      expect(conflicts[0].severity).toBe('critical')
      
      // Resolve conflicts automatically
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      // Verify only one component remains
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
    })

    it('should prevent simultaneous desktop and mobile navigation rendering', async () => {
      // Register both desktop and mobile components
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('simultaneous_render')
      expect(conflicts[0].severity).toBe('high')
      
      // Resolve based on current breakpoint (desktop)
      mockWindow.innerWidth = 1200
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      // Mobile component should be removed
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      expect(status.activeComponents[0].type).toBe('desktop')
    })

    it('should detect and resolve breakpoint conflicts', async () => {
      // Set mobile screen size but register desktop component
      mockWindow.innerWidth = 768
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('breakpoint_conflict')
      expect(conflicts[0].severity).toBe('high')
      expect(conflicts[0].data.shouldBeDesktop).toBe(false)
      expect(conflicts[0].data.hasDesktop).toBe(true)
    })

    it('should detect component leaks (stale components)', async () => {
      // Register component with old timestamp
      const componentInfo = conflictDetector.registerComponent('old-nav', 'desktop')
      componentInfo.registeredAt = Date.now() - 35000 // 35 seconds ago
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('component_leak')
      expect(conflicts[0].severity).toBe('medium')
      
      // Resolve by cleaning up stale components
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(0)
    })

    it('should handle DOM-based conflict detection', async () => {
      // Mock DOM elements
      const desktopElement = { 
        getAttribute: vi.fn(() => 'desktop'),
        style: {},
        setAttribute: vi.fn()
      }
      const mobileElement = { 
        getAttribute: vi.fn(() => 'mobile'),
        style: {},
        setAttribute: vi.fn()
      }
      
      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('desktop')) return [desktopElement, desktopElement] // Duplicate
        if (selector.includes('mobile')) return [mobileElement]
        return [desktopElement, desktopElement, mobileElement]
      })
      
      // Register components
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      conflictDetector.registerComponent('mobile-1', 'mobile')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts.length).toBeGreaterThan(0)
      expect(conflicts.some(c => c.type === 'multiple_desktop')).toBe(true)
      expect(conflicts.some(c => c.type === 'simultaneous_render')).toBe(true)
    })
  })

  describe('Error Boundary Functionality', () => {
    it('should catch and handle navigation component errors', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary',
          maxRetries: 3
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate an error in the child component
      const error = new Error('Navigation component failed to load')
      wrapper.vm.handleError(error, null, 'test error info')
      
      await nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.errorInfo).toBeDefined()
      expect(wrapper.vm.errorInfo.message).toBe('Navigation component failed to load')
      
      errorSpy.mockRestore()
    })

    it('should activate fallback navigation on critical errors', async () => {
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary'
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate critical error
      const criticalError = new Error('Critical navigation failure')
      criticalError.severity = 'critical'
      
      wrapper.vm.handleError(criticalError, null, 'critical error')
      
      await nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.emitted('fallback-activated')).toBeTruthy()
    })

    it('should retry failed navigation components', async () => {
      const mockOnRecover = vi.fn().mockResolvedValue(true)
      
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary',
          maxRetries: 3,
          onRecover: mockOnRecover
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate error
      const error = new Error('Temporary navigation failure')
      wrapper.vm.handleError(error, null, 'temporary error')
      
      await nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.retryCount).toBe(0)
      
      // Trigger retry
      await wrapper.vm.handleRetry()
      
      expect(mockOnRecover).toHaveBeenCalled()
      expect(wrapper.vm.retryCount).toBe(1)
      expect(wrapper.vm.hasError).toBe(false)
    })

    it('should handle maximum retry attempts', async () => {
      const mockOnRecover = vi.fn().mockRejectedValue(new Error('Recovery failed'))
      
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary',
          maxRetries: 2,
          onRecover: mockOnRecover
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate error
      const error = new Error('Persistent navigation failure')
      wrapper.vm.handleError(error, null, 'persistent error')
      
      await nextTick()
      
      // Retry until max attempts
      await wrapper.vm.handleRetry() // Attempt 1
      await wrapper.vm.handleRetry() // Attempt 2
      
      expect(wrapper.vm.retryCount).toBe(2)
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.emitted('fallback-activated')).toBeTruthy()
    })

    it('should classify different types of navigation errors', async () => {
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary'
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Test different error types
      const testCases = [
        { message: 'Navigation conflict detected', expectedType: 'navigation_conflict' },
        { message: 'Chunk loading failed', expectedType: 'component_loading' },
        { message: 'Permission denied', expectedType: 'authorization_error' },
        { message: 'Network error occurred', expectedType: 'network_error' },
        { message: 'Breakpoint mismatch', expectedType: 'responsive_error' }
      ]
      
      for (const testCase of testCases) {
        const error = new Error(testCase.message)
        const errorType = wrapper.vm.classifyNavigationError(error)
        expect(errorType).toBe(testCase.expectedType)
      }
    })
  })

  describe('Fallback Navigation', () => {
    it('should render fallback navigation when primary navigation fails', async () => {
      wrapper = mount(NavigationFallback, {
        props: {
          fallbackReason: 'Navigation component failed to load',
          errorDetails: { type: 'component_loading' },
          currentRoute: 'dashboard',
          failedNavigationType: 'desktop',
          showErrorIndicator: true,
          showDebugInfo: true
        }
      })
      
      expect(wrapper.find('.navigation-fallback').exists()).toBe(true)
      expect(wrapper.find('.fallback-error-indicator').exists()).toBe(true)
      expect(wrapper.text()).toContain('HR Management')
    })

    it('should provide essential navigation items in fallback mode', async () => {
      wrapper = mount(NavigationFallback, {
        props: {
          fallbackReason: 'Navigation component failed',
          currentRoute: 'dashboard',
          failedNavigationType: 'desktop'
        }
      })
      
      const menuItems = wrapper.findAll('.fallback-menu-item')
      expect(menuItems.length).toBeGreaterThan(0)
      
      // Check for essential navigation items
      const menuText = wrapper.text()
      expect(menuText).toContain('Dashboard')
      expect(menuText).toContain('Projects')
      expect(menuText).toContain('Leaves')
    })

    it('should handle fallback navigation clicks', async () => {
      const mockRouter = {
        visit: vi.fn()
      }
      
      // Mock Inertia router
      vi.doMock('@inertiajs/vue3', () => ({
        router: mockRouter
      }))
      
      wrapper = mount(NavigationFallback, {
        props: {
          fallbackReason: 'Navigation component failed',
          currentRoute: 'dashboard',
          failedNavigationType: 'desktop'
        }
      })
      
      const firstMenuItem = wrapper.find('.fallback-menu-link')
      await firstMenuItem.trigger('click')
      
      expect(wrapper.emitted('navigate')).toBeTruthy()
    })

    it('should handle retry attempts in fallback mode', async () => {
      const mockOnRetry = vi.fn().mockResolvedValue(true)
      
      wrapper = mount(NavigationFallback, {
        props: {
          fallbackReason: 'Navigation component failed',
          currentRoute: 'dashboard',
          failedNavigationType: 'desktop',
          onRetry: mockOnRetry
        }
      })
      
      const retryButton = wrapper.find('.fallback-action--primary')
      await retryButton.trigger('click')
      
      expect(mockOnRetry).toHaveBeenCalled()
      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('should show debug information in development mode', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      wrapper = mount(NavigationFallback, {
        props: {
          fallbackReason: 'Navigation component failed',
          errorDetails: { type: 'component_loading', stack: 'Error stack trace' },
          currentRoute: 'dashboard',
          failedNavigationType: 'desktop',
          showDebugInfo: true
        }
      })
      
      expect(wrapper.find('.fallback-debug').exists()).toBe(true)
      
      const debugToggle = wrapper.find('.debug-toggle')
      await debugToggle.trigger('click')
      
      expect(wrapper.find('.debug-details').exists()).toBe(true)
      
      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Navigation Monitoring and Logging', () => {
    it('should log navigation conflicts', async () => {
      const logSpy = vi.spyOn(navigationMonitor, 'logConflict')
      
      // Create conflicts
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      navigationMonitor.logConflict(conflicts, false)
      
      expect(logSpy).toHaveBeenCalledWith(conflicts, false)
      expect(logSpy).toHaveBeenCalledTimes(1)
      
      logSpy.mockRestore()
    })

    it('should log navigation errors with context', async () => {
      const logSpy = vi.spyOn(navigationMonitor, 'logNavigationError')
      
      const error = new Error('Navigation test error')
      const context = {
        componentId: 'test-component',
        navigationType: 'desktop',
        currentRoute: 'dashboard'
      }
      
      navigationMonitor.logNavigationError(error, context)
      
      expect(logSpy).toHaveBeenCalledWith(error, context)
      
      logSpy.mockRestore()
    })

    it('should track fallback activations', async () => {
      const logSpy = vi.spyOn(navigationMonitor, 'logFallback')
      
      navigationMonitor.logFallback(true, 'Component loading failed', { 
        componentType: 'desktop',
        errorType: 'loading_error'
      })
      
      expect(logSpy).toHaveBeenCalledWith(
        true, 
        'Component loading failed', 
        { componentType: 'desktop', errorType: 'loading_error' }
      )
      
      logSpy.mockRestore()
    })

    it('should monitor performance metrics', async () => {
      const startTime = navigationMonitor.startPerformanceMark('test_navigation_load')
      expect(startTime).toBeDefined()
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const duration = navigationMonitor.endPerformanceMark('test_navigation_load', {
        componentType: 'desktop'
      })
      
      expect(duration).toBeGreaterThan(0)
    })

    it('should export monitoring data', async () => {
      // Generate some events
      navigationMonitor.logNavigationLoad('desktop', 'test-component', 150)
      navigationMonitor.logNavigationError(new Error('Test error'))
      
      const exportData = navigationMonitor.exportData()
      
      expect(exportData).toHaveProperty('sessionId')
      expect(exportData).toHaveProperty('metrics')
      expect(exportData).toHaveProperty('events')
      expect(exportData).toHaveProperty('stats')
      expect(exportData.events.length).toBeGreaterThan(0)
    })
  })

  describe('Integration with NavigationController', () => {
    it('should integrate conflict detection with NavigationController', async () => {
      const { useResponsive } = await import('@/composables/useResponsive.js')
      const mockUseResponsive = vi.mocked(useResponsive)
      
      mockUseResponsive.mockReturnValue({
        isMobile: vi.fn().mockReturnValue(false),
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop: vi.fn().mockReturnValue(true),
        windowWidth: vi.fn().mockReturnValue(1200),
        debugResponsive: vi.fn()
      })
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      // Controller should register itself with conflict detector
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBeGreaterThan(0)
      
      // Should have controller and navigation component registered
      const controllerComponents = status.activeComponents.filter(c => 
        c.type === 'controller' || c.type === 'desktop'
      )
      expect(controllerComponents.length).toBeGreaterThan(0)
    })

    it('should handle conflict events in NavigationController', async () => {
      const { useResponsive } = await import('@/composables/useResponsive.js')
      const mockUseResponsive = vi.mocked(useResponsive)
      
      mockUseResponsive.mockReturnValue({
        isMobile: vi.fn().mockReturnValue(false),
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop: vi.fn().mockReturnValue(true),
        windowWidth: vi.fn().mockReturnValue(1200),
        debugResponsive: vi.fn()
      })
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      // Simulate conflict detection
      const conflictEvent = {
        conflicts: [{
          id: 'test-conflict',
          type: 'multiple_desktop',
          severity: 'critical',
          message: 'Multiple desktop components detected'
        }]
      }
      
      wrapper.vm.handleConflictDetected(conflictEvent)
      
      expect(wrapper.vm.activeConflicts).toHaveLength(1)
      expect(wrapper.vm.hasActiveConflicts).toBe(true)
    })

    it('should activate fallback when navigation fails', async () => {
      const { useResponsive } = await import('@/composables/useResponsive.js')
      const mockUseResponsive = vi.mocked(useResponsive)
      
      mockUseResponsive.mockReturnValue({
        isMobile: vi.fn().mockReturnValue(false),
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop: vi.fn().mockReturnValue(true),
        windowWidth: vi.fn().mockReturnValue(1200),
        debugResponsive: vi.fn()
      })
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      // Simulate navigation error that triggers fallback
      const errorReport = {
        severity: 'critical',
        type: 'component_loading',
        message: 'Navigation component failed to load'
      }
      
      await wrapper.vm.handleNavigationError(errorReport)
      
      expect(wrapper.vm.fallbackActive).toBe(true)
      expect(wrapper.vm.fallbackReason).toBe('Navigation component error')
    })
  })

  describe('Debugging Tools', () => {
    it('should provide comprehensive debug information', async () => {
      const { navigationDebugger } = await import('@/utils/navigationDebugger.js')
      
      // Generate some navigation state
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      navigationMonitor.logNavigationLoad('desktop', 'test-component')
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      
      expect(debugInfo).toHaveProperty('timestamp')
      expect(debugInfo).toHaveProperty('window')
      expect(debugInfo).toHaveProperty('conflicts')
      expect(debugInfo).toHaveProperty('monitoring')
      expect(debugInfo).toHaveProperty('components')
      expect(debugInfo).toHaveProperty('breakpoints')
    })

    it('should detect common navigation issues', async () => {
      const { navigationDebugger } = await import('@/utils/navigationDebugger.js')
      
      // Create multiple desktop components (issue)
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      // Create breakpoint mismatch (issue)
      mockWindow.innerWidth = 768 // Mobile size
      conflictDetector.registerComponent('desktop-nav', 'desktop') // Desktop component
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      
      // Check for detected issues
      expect(debugInfo.components.duplicates.length).toBeGreaterThan(0)
      expect(debugInfo.breakpoints.matches).toBe(false)
    })

    it('should export debug data for analysis', async () => {
      const { navigationDebugger } = await import('@/utils/navigationDebugger.js')
      
      const exportData = navigationDebugger.exportDebugData()
      
      expect(exportData).toHaveProperty('timestamp')
      expect(exportData).toHaveProperty('debugInfo')
      expect(exportData).toHaveProperty('monitoringData')
      expect(exportData).toHaveProperty('conflictData')
    })
  })

  describe('Performance and Stress Testing', () => {
    it('should handle rapid navigation type switching', async () => {
      const { useResponsive } = await import('@/composables/useResponsive.js')
      const { useBreakpointManager } = await import('@/composables/useBreakpointManager.js')
      
      const mockUseResponsive = vi.mocked(useResponsive)
      const mockUseBreakpointManager = vi.mocked(useBreakpointManager)
      
      const isMobile = vi.fn()
      const isDesktop = vi.fn()
      const windowWidth = vi.fn()
      const navigationMode = vi.fn()
      
      mockUseResponsive.mockReturnValue({
        isMobile,
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop,
        windowWidth,
        debugResponsive: vi.fn()
      })
      
      mockUseBreakpointManager.mockReturnValue({
        windowWidth,
        navigationMode,
        isTransitioning: vi.fn().mockReturnValue(false),
        preserveCurrentState: vi.fn(),
        restorePreservedState: vi.fn(),
        getBreakpointInfo: vi.fn(() => ({ current: 'desktop', width: 1200 })),
        debugBreakpointManager: vi.fn(),
        NAVIGATION_BREAKPOINT: 1024
      })
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      // Rapidly switch between desktop and mobile
      for (let i = 0; i < 10; i++) {
        const isDesktopMode = i % 2 === 0
        const width = isDesktopMode ? 1200 : 768
        
        windowWidth.mockReturnValue(width)
        navigationMode.mockReturnValue(isDesktopMode ? 'desktop' : 'mobile')
        isMobile.mockReturnValue(!isDesktopMode)
        isDesktop.mockReturnValue(isDesktopMode)
        
        await nextTick()
      }
      
      // Should not have excessive conflicts or errors
      const status = conflictDetector.getStatus()
      expect(status.conflictCount).toBeLessThan(5) // Some conflicts expected during rapid switching
    })

    it('should handle large numbers of navigation events', async () => {
      const startTime = performance.now()
      
      // Generate many navigation events
      for (let i = 0; i < 100; i++) {
        navigationMonitor.logNavigationLoad(`component-${i}`, `id-${i}`, Math.random() * 100)
        navigationMonitor.logUserAction('navigate', `route-${i}`)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(100) // 100ms
      
      const stats = navigationMonitor.getStats()
      expect(stats.totalEvents).toBeGreaterThanOrEqual(200) // At least 200 events
    })

    it('should maintain performance with many registered components', async () => {
      const startTime = performance.now()
      
      // Register many components
      for (let i = 0; i < 50; i++) {
        conflictDetector.registerComponent(`component-${i}`, i % 2 === 0 ? 'desktop' : 'mobile')
      }
      
      // Detect conflicts
      const conflicts = conflictDetector.detectConflicts()
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(50) // 50ms
      
      // Should detect conflicts for multiple components
      expect(conflicts.length).toBeGreaterThan(0)
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary network errors', async () => {
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary',
          maxRetries: 3
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate network error
      const networkError = new Error('Network error while loading navigation')
      wrapper.vm.handleError(networkError, null, 'network error')
      
      await nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.errorInfo.type).toBe('network_error')
      
      // Simulate successful retry
      const mockOnRecover = vi.fn().mockResolvedValue(true)
      wrapper.setProps({ onRecover: mockOnRecover })
      
      await wrapper.vm.handleRetry()
      
      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.emitted('recover')).toBeTruthy()
    })

    it('should handle component loading failures gracefully', async () => {
      wrapper = mount(NavigationErrorBoundary, {
        props: {
          currentRoute: 'dashboard',
          navigationType: 'desktop',
          componentId: 'test-boundary'
        },
        slots: {
          default: '<div>Navigation Content</div>'
        }
      })
      
      // Simulate component loading failure
      const loadingError = new Error('Chunk loading failed for navigation component')
      wrapper.vm.handleError(loadingError, null, 'loading error')
      
      await nextTick()
      
      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.errorInfo.type).toBe('component_loading')
      
      // Should automatically retry for loading errors
      expect(wrapper.vm.retryCount).toBeGreaterThanOrEqual(0)
    })

    it('should maintain navigation functionality during partial failures', async () => {
      // Simulate scenario where desktop navigation fails but mobile works
      const { useResponsive } = await import('@/composables/useResponsive.js')
      const mockUseResponsive = vi.mocked(useResponsive)
      
      mockUseResponsive.mockReturnValue({
        isMobile: vi.fn().mockReturnValue(false),
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop: vi.fn().mockReturnValue(true),
        windowWidth: vi.fn().mockReturnValue(1200),
        debugResponsive: vi.fn()
      })
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      // Simulate desktop navigation failure
      const errorReport = {
        severity: 'critical',
        type: 'component_loading',
        message: 'Desktop navigation failed to load'
      }
      
      await wrapper.vm.handleNavigationError(errorReport)
      
      // Should activate fallback navigation
      expect(wrapper.vm.fallbackActive).toBe(true)
      
      // Fallback should provide basic navigation functionality
      const fallbackComponent = wrapper.findComponent(NavigationFallback)
      expect(fallbackComponent.exists()).toBe(true)
    })
  })
})