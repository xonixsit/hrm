import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavigationController from '@/Components/Navigation/NavigationController.vue'
import { conflictDetector } from '@/services/NavigationConflictDetector.js'
import { navigationMonitor } from '@/services/NavigationMonitor.js'
import { navigationDebugger } from '@/utils/navigationDebugger.js'

// Mock all the composables and components
vi.mock('@/composables/useResponsive.js', () => ({
  useResponsive: vi.fn()
}))

vi.mock('@/composables/useBreakpointManager.js', () => ({
  useBreakpointManager: vi.fn()
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

describe('Navigation Conflict Prevention Integration', () => {
  let wrapper
  let mockUseResponsive
  let mockUseBreakpointManager
  let mockWindow
  let mockDocument

  beforeEach(async () => {
    // Reset all services
    conflictDetector.reset()
    navigationMonitor.reset()
    
    // Set up mocks
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
      reportError: vi.fn()
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
    
    // Set up composable mocks
    const responsiveModule = await import('@/composables/useResponsive.js')
    const breakpointModule = await import('@/composables/useBreakpointManager.js')
    
    mockUseResponsive = vi.mocked(responsiveModule.useResponsive)
    mockUseBreakpointManager = vi.mocked(breakpointModule.useBreakpointManager)
    
    // Default to desktop mode
    mockUseResponsive.mockReturnValue({
      isMobile: vi.fn().mockReturnValue(false),
      isTablet: vi.fn().mockReturnValue(false),
      isDesktop: vi.fn().mockReturnValue(true),
      windowWidth: vi.fn().mockReturnValue(1200),
      debugResponsive: vi.fn()
    })
    
    mockUseBreakpointManager.mockReturnValue({
      windowWidth: vi.fn().mockReturnValue(1200),
      navigationMode: vi.fn().mockReturnValue('desktop'),
      isTransitioning: vi.fn().mockReturnValue(false),
      preserveCurrentState: vi.fn(),
      restorePreservedState: vi.fn(),
      getBreakpointInfo: vi.fn(() => ({ current: 'desktop', width: 1200 })),
      debugBreakpointManager: vi.fn(),
      NAVIGATION_BREAKPOINT: 1024
    })
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    conflictDetector.reset()
    navigationMonitor.reset()
  })

  describe('Complete Conflict Prevention Workflow', () => {
    it('should prevent conflicts from desktop to mobile navigation switch', async () => {
      // Start with desktop navigation
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Verify desktop navigation is active
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(true)
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(false)
      
      // Check that components are registered with conflict detector
      const initialStatus = conflictDetector.getStatus()
      expect(initialStatus.activeComponentCount).toBeGreaterThan(0)
      
      // Switch to mobile breakpoint
      mockWindow.innerWidth = 768
      mockUseResponsive.mockReturnValue({
        isMobile: vi.fn().mockReturnValue(true),
        isTablet: vi.fn().mockReturnValue(false),
        isDesktop: vi.fn().mockReturnValue(false),
        windowWidth: vi.fn().mockReturnValue(768),
        debugResponsive: vi.fn()
      })
      
      mockUseBreakpointManager.mockReturnValue({
        windowWidth: vi.fn().mockReturnValue(768),
        navigationMode: vi.fn().mockReturnValue('mobile'),
        isTransitioning: vi.fn().mockReturnValue(false),
        preserveCurrentState: vi.fn(),
        restorePreservedState: vi.fn(),
        getBreakpointInfo: vi.fn(() => ({ current: 'mobile', width: 768 })),
        debugBreakpointManager: vi.fn(),
        NAVIGATION_BREAKPOINT: 1024
      })
      
      // Force component update
      await wrapper.vm.$forceUpdate()
      await nextTick()
      
      // Verify mobile navigation is now active
      expect(wrapper.find('[data-navigation-type="mobile"]').exists()).toBe(true)
      expect(wrapper.find('[data-navigation-type="desktop"]').exists()).toBe(false)
      
      // Verify no conflicts are detected
      const finalStatus = conflictDetector.getStatus()
      expect(finalStatus.hasConflicts).toBe(false)
      
      // Verify navigation switch was logged
      const events = navigationMonitor.events.value
      const switchEvents = events.filter(e => e.type === 'navigation_switch')
      expect(switchEvents.length).toBeGreaterThan(0)
    })

    it('should detect and resolve multiple component conflicts', async () => {
      // Manually register multiple desktop components to simulate conflict
      const comp1 = conflictDetector.registerComponent('desktop-1', 'desktop', {
        currentRoute: 'dashboard'
      })
      const comp2 = conflictDetector.registerComponent('desktop-2', 'desktop', {
        currentRoute: 'dashboard'
      })
      
      // Make comp2 more recent
      comp2.registeredAt = comp1.registeredAt + 1000
      
      // Detect conflicts
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('multiple_desktop')
      
      // Verify conflict was logged
      const conflictEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'conflict_detected'
      )
      expect(conflictEvents.length).toBeGreaterThan(0)
      
      // Resolve conflicts automatically
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      // Verify only one component remains (the more recent one)
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      expect(status.activeComponents[0].id).toBe('desktop-2')
      
      // Verify resolution was logged
      const resolutionEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'conflict_resolved'
      )
      expect(resolutionEvents.length).toBeGreaterThan(0)
    })

    it('should handle navigation component errors with fallback', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Simulate navigation component error
      const errorReport = {
        severity: 'critical',
        type: 'component_loading',
        message: 'Navigation component failed to load',
        componentId: 'test-component'
      }
      
      await wrapper.vm.handleNavigationError(errorReport)
      
      // Verify fallback is activated
      expect(wrapper.vm.fallbackActive).toBe(true)
      expect(wrapper.vm.fallbackReason).toBe('Navigation component error')
      
      // Verify error was logged
      const errorEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'navigation_error'
      )
      expect(errorEvents.length).toBeGreaterThan(0)
      
      // Verify fallback activation was logged
      const fallbackEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'fallback_activated'
      )
      expect(fallbackEvents.length).toBeGreaterThan(0)
    })

    it('should provide comprehensive debugging information', async () => {
      // Set up complex navigation state
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Create some conflicts
      conflictDetector.registerComponent('extra-desktop', 'desktop')
      conflictDetector.registerComponent('extra-mobile', 'mobile')
      
      // Generate some errors
      navigationMonitor.logNavigationError(new Error('Test navigation error'))
      
      // Get debug information
      const debugInfo = navigationDebugger.gatherDebugInfo()
      
      expect(debugInfo).toHaveProperty('conflicts')
      expect(debugInfo).toHaveProperty('monitoring')
      expect(debugInfo).toHaveProperty('components')
      expect(debugInfo).toHaveProperty('breakpoints')
      expect(debugInfo).toHaveProperty('performance')
      expect(debugInfo).toHaveProperty('errors')
      
      // Verify conflicts are detected
      expect(debugInfo.conflicts.hasConflicts).toBe(true)
      expect(debugInfo.conflicts.conflictCount).toBeGreaterThan(0)
      
      // Verify components are analyzed
      expect(debugInfo.components.active.length).toBeGreaterThan(0)
      expect(debugInfo.components.duplicates.length).toBeGreaterThan(0)
      
      // Verify errors are tracked
      expect(debugInfo.errors.totalErrors).toBeGreaterThan(0)
      
      // Verify monitoring data is available
      expect(debugInfo.monitoring.totalEvents).toBeGreaterThan(0)
    })

    it('should handle rapid navigation type switching without conflicts', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Rapidly switch between desktop and mobile multiple times
      for (let i = 0; i < 5; i++) {
        const isDesktopMode = i % 2 === 0
        const width = isDesktopMode ? 1200 : 768
        
        mockWindow.innerWidth = width
        
        mockUseResponsive.mockReturnValue({
          isMobile: vi.fn().mockReturnValue(!isDesktopMode),
          isTablet: vi.fn().mockReturnValue(false),
          isDesktop: vi.fn().mockReturnValue(isDesktopMode),
          windowWidth: vi.fn().mockReturnValue(width),
          debugResponsive: vi.fn()
        })
        
        mockUseBreakpointManager.mockReturnValue({
          windowWidth: vi.fn().mockReturnValue(width),
          navigationMode: vi.fn().mockReturnValue(isDesktopMode ? 'desktop' : 'mobile'),
          isTransitioning: vi.fn().mockReturnValue(false),
          preserveCurrentState: vi.fn(),
          restorePreservedState: vi.fn(),
          getBreakpointInfo: vi.fn(() => ({ 
            current: isDesktopMode ? 'desktop' : 'mobile', 
            width 
          })),
          debugBreakpointManager: vi.fn(),
          NAVIGATION_BREAKPOINT: 1024
        })
        
        await wrapper.vm.$forceUpdate()
        await nextTick()
        
        // Small delay to simulate real switching
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // After rapid switching, should not have excessive conflicts
      const status = conflictDetector.getStatus()
      expect(status.conflictCount).toBeLessThan(3) // Some conflicts expected during rapid switching
      
      // Should have logged navigation switches
      const switchEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'navigation_switch'
      )
      expect(switchEvents.length).toBeGreaterThan(0)
    })

    it('should maintain performance during stress testing', async () => {
      const startTime = performance.now()
      
      // Create multiple navigation controllers
      const wrappers = []
      for (let i = 0; i < 5; i++) {
        const w = mount(NavigationController, {
          props: {
            currentRoute: 'dashboard'
          }
        })
        wrappers.push(w)
        await nextTick()
      }
      
      // Generate many navigation events
      for (let i = 0; i < 50; i++) {
        navigationMonitor.logNavigationLoad(`component-${i}`, `id-${i}`, Math.random() * 200)
        navigationMonitor.logUserAction('navigate', `route-${i}`)
      }
      
      // Detect conflicts multiple times
      for (let i = 0; i < 10; i++) {
        conflictDetector.detectConflicts()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(200) // 200ms
      
      // Clean up
      wrappers.forEach(w => w.unmount())
    })

    it('should recover from navigation failures gracefully', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Simulate navigation failure
      const error = new Error('Navigation component crashed')
      await wrapper.vm.handleNavigationError({
        severity: 'critical',
        type: 'component_error',
        message: error.message
      })
      
      // Should activate fallback
      expect(wrapper.vm.fallbackActive).toBe(true)
      
      // Simulate recovery
      const recoverySuccess = await wrapper.vm.handleNavigationRecover()
      expect(recoverySuccess).toBe(true)
      
      // Should deactivate fallback
      expect(wrapper.vm.fallbackActive).toBe(false)
      
      // Should have logged recovery
      const recoveryEvents = navigationMonitor.events.value.filter(e => 
        e.type === 'navigation_recovery_success'
      )
      expect(recoveryEvents.length).toBeGreaterThan(0)
    })

    it('should provide real-time monitoring and alerting', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Generate critical error
      navigationMonitor.logEvent(
        'critical_navigation_failure',
        { 
          componentId: 'test-component',
          errorType: 'complete_failure'
        },
        navigationMonitor.SEVERITY_LEVELS.CRITICAL
      )
      
      // Should trigger immediate reporting
      expect(mockWindow.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigation_monitor_event',
          category: 'navigation_monitoring',
          severity: 'critical'
        })
      )
      
      // Should log critical event to console
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should export comprehensive system state for analysis', async () => {
      wrapper = mount(NavigationController, {
        props: {
          currentRoute: 'dashboard'
        }
      })
      
      await nextTick()
      
      // Generate various system events
      conflictDetector.registerComponent('test-desktop', 'desktop')
      conflictDetector.registerComponent('test-mobile', 'mobile')
      navigationMonitor.logNavigationLoad('desktop', 'test-component', 150)
      navigationMonitor.logNavigationError(new Error('Test error'))
      navigationMonitor.logConflict([{ type: 'test_conflict' }], false)
      
      // Export all system data
      const monitoringData = navigationMonitor.exportData()
      const conflictData = conflictDetector.getStatus()
      const debugData = navigationDebugger.exportDebugData()
      
      // Verify comprehensive data export
      expect(monitoringData).toHaveProperty('sessionId')
      expect(monitoringData).toHaveProperty('metrics')
      expect(monitoringData).toHaveProperty('events')
      expect(monitoringData.events.length).toBeGreaterThan(0)
      
      expect(conflictData).toHaveProperty('hasConflicts')
      expect(conflictData).toHaveProperty('activeComponents')
      expect(conflictData.activeComponents.length).toBeGreaterThan(0)
      
      expect(debugData).toHaveProperty('debugInfo')
      expect(debugData).toHaveProperty('monitoringData')
      expect(debugData).toHaveProperty('conflictData')
      
      // Verify data consistency across services
      expect(debugData.monitoringData.sessionId).toBe(monitoringData.sessionId)
      expect(debugData.conflictData.activeComponentCount).toBe(conflictData.activeComponentCount)
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle DOM manipulation conflicts', async () => {
      // Mock DOM elements that conflict
      const desktopElement = {
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => 'desktop'),
        offsetWidth: 200,
        offsetHeight: 50
      }
      const mobileElement = {
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => 'mobile'),
        offsetWidth: 200,
        offsetHeight: 50
      }
      
      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('[data-navigation-type]')) {
          return [desktopElement, mobileElement] // Both visible
        }
        if (selector.includes('desktop')) return [desktopElement]
        if (selector.includes('mobile')) return [mobileElement]
        return []
      })
      
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector.includes('desktop')) return desktopElement
        if (selector.includes('mobile')) return mobileElement
        return null
      })
      
      // Register components
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      // Detect conflicts
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts.length).toBeGreaterThan(0)
      
      // Resolve conflicts
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions.length).toBeGreaterThan(0)
      
      // Verify DOM elements were hidden
      expect(desktopElement.style.display).toBe('none')
      expect(desktopElement.setAttribute).toHaveBeenCalledWith('data-conflict-hidden', 'true')
    })

    it('should handle component registration failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Try to register component with invalid data
      expect(() => {
        conflictDetector.registerComponent(null, 'desktop')
      }).not.toThrow()
      
      expect(() => {
        conflictDetector.registerComponent('test', null)
      }).not.toThrow()
      
      // System should remain stable
      const status = conflictDetector.getStatus()
      expect(status).toBeDefined()
      
      consoleSpy.mockRestore()
    })

    it('should handle monitoring service failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Disable monitoring
      navigationMonitor.setEnabled(false)
      
      // Try to log events
      navigationMonitor.logNavigationError(new Error('Test error'))
      navigationMonitor.logConflict([{ type: 'test' }], false)
      
      // Should not crash
      expect(navigationMonitor.events.value.length).toBe(1) // Only disable event
      
      // Re-enable monitoring
      navigationMonitor.setEnabled(true)
      
      // Should work normally
      navigationMonitor.logNavigationLoad('desktop', 'test-component')
      expect(navigationMonitor.events.value.length).toBe(3) // disable, enable, load events
      
      consoleSpy.mockRestore()
    })

    it('should handle debug tool failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Try to debug with corrupted state
      conflictDetector.activeComponents.value.set('bad-component', null)
      
      // Should not crash
      expect(() => {
        navigationDebugger.debug('conflict', true)
      }).not.toThrow()
      
      expect(() => {
        navigationDebugger.gatherDebugInfo()
      }).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})