import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { navigationMonitor } from '@/services/NavigationMonitor.js'

describe('NavigationMonitor', () => {
  let mockWindow
  let mockDocument
  let mockPerformance

  beforeEach(() => {
    // Reset the monitor
    navigationMonitor.reset()
    navigationMonitor.setEnabled(true)
    
    // Mock global objects
    mockWindow = {
      innerWidth: 1200,
      location: {
        href: 'http://localhost/dashboard'
      },
      reportError: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
    
    mockDocument = {
      hidden: false,
      visibilityState: 'visible',
      addEventListener: vi.fn()
    }
    
    mockPerformance = {
      now: vi.fn(() => Date.now())
    }
    
    global.window = mockWindow
    global.document = mockDocument
    global.performance = mockPerformance
    global.navigator = {
      userAgent: 'test-user-agent'
    }
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    navigationMonitor.reset()
  })

  describe('Event Logging', () => {
    it('should log navigation events with proper structure', () => {
      const eventData = {
        componentType: 'desktop',
        componentId: 'test-component'
      }
      
      const event = navigationMonitor.logEvent(
        navigationMonitor.EVENT_TYPES.NAVIGATION_LOAD,
        eventData,
        navigationMonitor.SEVERITY_LEVELS.INFO
      )
      
      expect(event).toBeDefined()
      expect(event.id).toBeDefined()
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.NAVIGATION_LOAD)
      expect(event.severity).toBe(navigationMonitor.SEVERITY_LEVELS.INFO)
      expect(event.timestamp).toBeDefined()
      expect(event.data).toMatchObject(eventData)
      expect(event.data.windowWidth).toBe(1200)
      expect(event.data.url).toBe('http://localhost/dashboard')
      expect(event.sessionId).toBeDefined()
      expect(event.sequence).toBe(1)
    })

    it('should maintain event history with size limit', () => {
      // Generate more events than the limit
      for (let i = 0; i < 1200; i++) {
        navigationMonitor.logEvent('test_event', { index: i })
      }
      
      const events = navigationMonitor.events.value
      expect(events.length).toBeLessThanOrEqual(1000) // maxEventHistory
      
      // Most recent events should be at the beginning
      expect(events[0].data.index).toBe(1199)
      expect(events[events.length - 1].data.index).toBe(200) // 1199 - 999
    })

    it('should update metrics correctly', () => {
      navigationMonitor.logNavigationLoad('desktop', 'comp-1', 150)
      navigationMonitor.logNavigationError(new Error('Test error'))
      navigationMonitor.logConflict([{ type: 'test_conflict' }], false)
      navigationMonitor.logFallback(true, 'test reason')
      navigationMonitor.logRetryAttempt(1, 3)
      navigationMonitor.logNavigationSwitch('desktop', 'mobile')
      
      const metrics = navigationMonitor.metrics.value
      
      expect(metrics.totalEvents).toBe(6)
      expect(metrics.errorCount).toBe(1)
      expect(metrics.conflictCount).toBe(1)
      expect(metrics.fallbackActivations).toBe(1)
      expect(metrics.retryAttempts).toBe(1)
      expect(metrics.navigationSwitches).toBe(1)
    })

    it('should not log events when disabled', () => {
      navigationMonitor.setEnabled(false)
      
      navigationMonitor.logEvent('test_event', { test: 'data' })
      
      expect(navigationMonitor.events.value.length).toBe(0)
      expect(navigationMonitor.metrics.value.totalEvents).toBe(0)
    })
  })

  describe('Specific Event Types', () => {
    it('should log navigation load events', () => {
      const event = navigationMonitor.logNavigationLoad('desktop', 'test-component', 200)
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.NAVIGATION_LOAD)
      expect(event.data.componentType).toBe('desktop')
      expect(event.data.componentId).toBe('test-component')
      expect(event.data.loadTime).toBe(200)
      expect(event.severity).toBe(navigationMonitor.SEVERITY_LEVELS.INFO)
    })

    it('should log navigation errors with context', () => {
      const error = new Error('Test navigation error')
      const context = {
        componentId: 'test-component',
        navigationType: 'desktop'
      }
      
      const event = navigationMonitor.logNavigationError(error, context)
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.NAVIGATION_ERROR)
      expect(event.data.errorMessage).toBe('Test navigation error')
      expect(event.data.errorName).toBe('Error')
      expect(event.data.context).toMatchObject(context)
      expect(event.severity).toBe(navigationMonitor.SEVERITY_LEVELS.HIGH)
    })

    it('should log conflicts with resolution status', () => {
      const conflicts = [
        {
          id: 'conflict-1',
          type: 'multiple_desktop',
          severity: 'critical',
          message: 'Multiple desktop components'
        }
      ]
      
      // Log unresolved conflict
      const unresolvedEvent = navigationMonitor.logConflict(conflicts, false)
      expect(unresolvedEvent.type).toBe(navigationMonitor.EVENT_TYPES.CONFLICT_DETECTED)
      expect(unresolvedEvent.data.resolved).toBe(false)
      expect(unresolvedEvent.severity).toBe(navigationMonitor.SEVERITY_LEVELS.HIGH)
      
      // Log resolved conflict
      const resolvedEvent = navigationMonitor.logConflict(conflicts, true)
      expect(resolvedEvent.type).toBe(navigationMonitor.EVENT_TYPES.CONFLICT_RESOLVED)
      expect(resolvedEvent.data.resolved).toBe(true)
      expect(resolvedEvent.severity).toBe(navigationMonitor.SEVERITY_LEVELS.MEDIUM)
    })

    it('should log fallback activation and deactivation', () => {
      const errorContext = { errorType: 'component_loading' }
      
      // Log activation
      const activationEvent = navigationMonitor.logFallback(true, 'Component failed', errorContext)
      expect(activationEvent.type).toBe(navigationMonitor.EVENT_TYPES.FALLBACK_ACTIVATED)
      expect(activationEvent.data.activated).toBe(true)
      expect(activationEvent.data.reason).toBe('Component failed')
      expect(activationEvent.data.errorContext).toMatchObject(errorContext)
      expect(activationEvent.severity).toBe(navigationMonitor.SEVERITY_LEVELS.HIGH)
      
      // Log deactivation
      const deactivationEvent = navigationMonitor.logFallback(false, 'Recovery successful')
      expect(deactivationEvent.type).toBe(navigationMonitor.EVENT_TYPES.FALLBACK_DEACTIVATED)
      expect(deactivationEvent.data.activated).toBe(false)
      expect(deactivationEvent.severity).toBe(navigationMonitor.SEVERITY_LEVELS.MEDIUM)
    })

    it('should log component lifecycle events', () => {
      const metadata = { route: '/dashboard' }
      
      // Log registration
      const registrationEvent = navigationMonitor.logComponentLifecycle(
        true, 'comp-1', 'desktop', metadata
      )
      expect(registrationEvent.type).toBe(navigationMonitor.EVENT_TYPES.COMPONENT_REGISTERED)
      expect(registrationEvent.data.registered).toBe(true)
      expect(registrationEvent.data.componentId).toBe('comp-1')
      expect(registrationEvent.data.componentType).toBe('desktop')
      expect(registrationEvent.data.metadata).toMatchObject(metadata)
      
      // Log unregistration
      const unregistrationEvent = navigationMonitor.logComponentLifecycle(
        false, 'comp-1', 'desktop'
      )
      expect(unregistrationEvent.type).toBe(navigationMonitor.EVENT_TYPES.COMPONENT_UNREGISTERED)
      expect(unregistrationEvent.data.registered).toBe(false)
    })

    it('should log navigation type switches', () => {
      const preservedData = { currentRoute: '/dashboard' }
      
      const event = navigationMonitor.logNavigationSwitch(
        'desktop', 'mobile', 'breakpoint_change', preservedData
      )
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.NAVIGATION_SWITCH)
      expect(event.data.fromType).toBe('desktop')
      expect(event.data.toType).toBe('mobile')
      expect(event.data.reason).toBe('breakpoint_change')
      expect(event.data.preservedData).toMatchObject(preservedData)
      expect(event.data.windowWidth).toBe(1200)
    })

    it('should log retry attempts', () => {
      const context = { source: 'fallback' }
      
      const event = navigationMonitor.logRetryAttempt(2, 3, context)
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.RETRY_ATTEMPT)
      expect(event.data.attempt).toBe(2)
      expect(event.data.maxAttempts).toBe(3)
      expect(event.data.context).toMatchObject(context)
      expect(event.severity).toBe(navigationMonitor.SEVERITY_LEVELS.MEDIUM)
      
      // Test max attempts reached
      const maxEvent = navigationMonitor.logRetryAttempt(3, 3, context)
      expect(maxEvent.severity).toBe(navigationMonitor.SEVERITY_LEVELS.HIGH)
    })

    it('should log user actions', () => {
      const context = { route: '/employees' }
      
      const event = navigationMonitor.logUserAction('navigate', 'employees_link', context)
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.USER_ACTION)
      expect(event.data.action).toBe('navigate')
      expect(event.data.target).toBe('employees_link')
      expect(event.data.context).toMatchObject(context)
      expect(event.severity).toBe(navigationMonitor.SEVERITY_LEVELS.INFO)
    })

    it('should log breakpoint changes', () => {
      const event = navigationMonitor.logBreakpointChange(1200, 768, 'desktop', 'mobile')
      
      expect(event.type).toBe(navigationMonitor.EVENT_TYPES.BREAKPOINT_CHANGE)
      expect(event.data.oldWidth).toBe(1200)
      expect(event.data.newWidth).toBe(768)
      expect(event.data.oldType).toBe('desktop')
      expect(event.data.newType).toBe('mobile')
    })
  })

  describe('Performance Monitoring', () => {
    it('should track performance marks', () => {
      const markName = 'test_navigation_load'
      
      const startTime = navigationMonitor.startPerformanceMark(markName)
      expect(startTime).toBeDefined()
      expect(navigationMonitor.performanceMarks.has(markName)).toBe(true)
      
      // Simulate some work
      const duration = navigationMonitor.endPerformanceMark(markName, { 
        componentType: 'desktop' 
      })
      
      expect(duration).toBeGreaterThanOrEqual(0)
      expect(navigationMonitor.performanceMarks.has(markName)).toBe(false)
      
      // Should have logged performance event
      const events = navigationMonitor.events.value
      const perfEvent = events.find(e => e.type === navigationMonitor.EVENT_TYPES.PERFORMANCE_MARK)
      expect(perfEvent).toBeDefined()
      expect(perfEvent.data.markName).toBe(markName)
      expect(perfEvent.data.duration).toBe(duration)
    })

    it('should handle missing performance marks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = navigationMonitor.endPerformanceMark('non_existent_mark')
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance mark not found: non_existent_mark')
      )
      
      consoleSpy.mockRestore()
    })

    it('should update load time metrics', () => {
      navigationMonitor.updateLoadTimeMetrics(100)
      expect(navigationMonitor.metrics.value.averageLoadTime).toBe(100)
      
      navigationMonitor.updateLoadTimeMetrics(200)
      expect(navigationMonitor.metrics.value.averageLoadTime).toBe(150) // (100 + 200) / 2
      
      navigationMonitor.updateLoadTimeMetrics(300)
      expect(navigationMonitor.metrics.value.averageLoadTime).toBe(200) // (100 + 200 + 300) / 3
    })
  })

  describe('Statistics and Analysis', () => {
    it('should provide comprehensive statistics', () => {
      // Generate various events
      navigationMonitor.logNavigationLoad('desktop', 'comp-1', 150)
      navigationMonitor.logNavigationError(new Error('Test error'))
      navigationMonitor.logConflict([{ type: 'test' }], false)
      navigationMonitor.logFallback(true, 'test')
      navigationMonitor.logRetryAttempt(1, 3)
      navigationMonitor.logNavigationSwitch('desktop', 'mobile')
      
      const stats = navigationMonitor.getStats()
      
      expect(stats).toHaveProperty('totalEvents')
      expect(stats).toHaveProperty('errorCount')
      expect(stats).toHaveProperty('conflictCount')
      expect(stats).toHaveProperty('fallbackActivations')
      expect(stats).toHaveProperty('retryAttempts')
      expect(stats).toHaveProperty('navigationSwitches')
      expect(stats).toHaveProperty('averageLoadTime')
      expect(stats).toHaveProperty('timeRange')
      expect(stats).toHaveProperty('eventsPerMinute')
      expect(stats).toHaveProperty('errorRate')
      expect(stats).toHaveProperty('conflictRate')
      expect(stats).toHaveProperty('recentEvents')
      expect(stats).toHaveProperty('eventsByType')
      expect(stats).toHaveProperty('eventsBySeverity')
      
      expect(stats.totalEvents).toBe(6)
      expect(stats.errorCount).toBe(1)
      expect(stats.errorRate).toBe('16.67') // 1/6 * 100
      expect(stats.recentEvents.length).toBeLessThanOrEqual(10)
    })

    it('should group events by type', () => {
      navigationMonitor.logNavigationLoad('desktop', 'comp-1')
      navigationMonitor.logNavigationLoad('mobile', 'comp-2')
      navigationMonitor.logNavigationError(new Error('Test'))
      
      const eventsByType = navigationMonitor.getEventsByType()
      
      expect(eventsByType[navigationMonitor.EVENT_TYPES.NAVIGATION_LOAD]).toBe(2)
      expect(eventsByType[navigationMonitor.EVENT_TYPES.NAVIGATION_ERROR]).toBe(1)
    })

    it('should group events by severity', () => {
      navigationMonitor.logEvent('test1', {}, navigationMonitor.SEVERITY_LEVELS.INFO)
      navigationMonitor.logEvent('test2', {}, navigationMonitor.SEVERITY_LEVELS.HIGH)
      navigationMonitor.logEvent('test3', {}, navigationMonitor.SEVERITY_LEVELS.HIGH)
      
      const eventsBySeverity = navigationMonitor.getEventsBySeverity()
      
      expect(eventsBySeverity[navigationMonitor.SEVERITY_LEVELS.INFO]).toBe(1)
      expect(eventsBySeverity[navigationMonitor.SEVERITY_LEVELS.HIGH]).toBe(2)
    })
  })

  describe('Data Export and Management', () => {
    it('should export comprehensive monitoring data', () => {
      // Generate some data
      navigationMonitor.logNavigationLoad('desktop', 'comp-1', 150)
      navigationMonitor.logNavigationError(new Error('Test error'))
      
      const exportData = navigationMonitor.exportData()
      
      expect(exportData).toHaveProperty('sessionId')
      expect(exportData).toHaveProperty('exportTime')
      expect(exportData).toHaveProperty('metrics')
      expect(exportData).toHaveProperty('events')
      expect(exportData).toHaveProperty('stats')
      expect(exportData).toHaveProperty('systemInfo')
      
      expect(exportData.events.length).toBe(2)
      expect(exportData.metrics.totalEvents).toBe(2)
      expect(exportData.systemInfo.userAgent).toBe('test-user-agent')
      expect(exportData.systemInfo.windowSize.width).toBe(1200)
    })

    it('should reset monitoring data', () => {
      // Generate some data
      navigationMonitor.logNavigationLoad('desktop', 'comp-1')
      navigationMonitor.logNavigationError(new Error('Test'))
      
      expect(navigationMonitor.events.value.length).toBe(2)
      expect(navigationMonitor.metrics.value.totalEvents).toBe(2)
      
      navigationMonitor.reset()
      
      // Should have one event (the reset event)
      expect(navigationMonitor.events.value.length).toBe(1)
      expect(navigationMonitor.events.value[0].type).toBe('monitor_reset')
      expect(navigationMonitor.metrics.value.totalEvents).toBe(1)
      expect(navigationMonitor.metrics.value.errorCount).toBe(0)
    })

    it('should maintain session ID consistency', () => {
      const sessionId1 = navigationMonitor.getSessionId()
      const sessionId2 = navigationMonitor.getSessionId()
      
      expect(sessionId1).toBe(sessionId2)
      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/)
    })
  })

  describe('Error Reporting', () => {
    it('should report events to external services', () => {
      const event = navigationMonitor.logNavigationError(new Error('Test error'))
      
      expect(mockWindow.reportError).toHaveBeenCalledWith({
        type: 'navigation_monitor_event',
        category: 'navigation_monitoring',
        ...event
      })
    })

    it('should report critical events immediately', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
      
      navigationMonitor.logEvent(
        'critical_test',
        { test: 'data' },
        navigationMonitor.SEVERITY_LEVELS.CRITICAL
      )
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL EVENT: critical_test')
      )
      
      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })

    it('should handle reporting errors gracefully', () => {
      mockWindow.reportError = vi.fn(() => {
        throw new Error('Reporting failed')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should not throw error
      expect(() => {
        navigationMonitor.logNavigationError(new Error('Test error'))
      }).not.toThrow()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to report event:')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Console Logging', () => {
    it('should log events to console with appropriate methods', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Test different severity levels
      navigationMonitor.logEvent('info_event', {}, navigationMonitor.SEVERITY_LEVELS.INFO)
      navigationMonitor.logEvent('high_event', {}, navigationMonitor.SEVERITY_LEVELS.HIGH)
      navigationMonitor.logEvent('critical_event', {}, navigationMonitor.SEVERITY_LEVELS.CRITICAL)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO_EVENT'),
        expect.any(Object)
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('HIGH_EVENT'),
        expect.any(Object)
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL_EVENT'),
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
      consoleWarnSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('should use appropriate emojis for different event types', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      navigationMonitor.logNavigationLoad('desktop', 'comp-1')
      navigationMonitor.logNavigationError(new Error('Test'))
      navigationMonitor.logConflict([{ type: 'test' }], false)
      navigationMonitor.logFallback(true, 'test')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀'),
        expect.any(Object)
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌'),
        expect.any(Object)
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️'),
        expect.any(Object)
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄'),
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Monitoring Control', () => {
    it('should enable and disable monitoring', () => {
      expect(navigationMonitor.isEnabled.value).toBe(true)
      
      navigationMonitor.setEnabled(false)
      expect(navigationMonitor.isEnabled.value).toBe(false)
      
      // Should not log events when disabled
      navigationMonitor.logEvent('test_event', {})
      expect(navigationMonitor.events.value.length).toBe(1) // Only the disable event
      
      navigationMonitor.setEnabled(true)
      expect(navigationMonitor.isEnabled.value).toBe(true)
      
      // Should log events when enabled
      navigationMonitor.logEvent('test_event', {})
      expect(navigationMonitor.events.value.length).toBe(3) // disable, enable, test events
    })
  })

  describe('Performance and Memory Management', () => {
    it('should handle large numbers of events efficiently', () => {
      const startTime = performance.now()
      
      // Generate many events
      for (let i = 0; i < 500; i++) {
        navigationMonitor.logEvent(`event_${i}`, { index: i })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(100) // 100ms
      
      // Should maintain event limit
      expect(navigationMonitor.events.value.length).toBeLessThanOrEqual(1000)
    })

    it('should clean up performance marks properly', () => {
      const markName = 'test_mark'
      
      navigationMonitor.startPerformanceMark(markName)
      expect(navigationMonitor.performanceMarks.has(markName)).toBe(true)
      
      navigationMonitor.endPerformanceMark(markName)
      expect(navigationMonitor.performanceMarks.has(markName)).toBe(false)
    })

    it('should limit event history to prevent memory leaks', () => {
      // Generate more events than the limit
      for (let i = 0; i < 1500; i++) {
        navigationMonitor.logEvent(`event_${i}`, { index: i })
      }
      
      // Should not exceed maximum
      expect(navigationMonitor.events.value.length).toBe(1000)
      
      // Should keep most recent events
      const firstEvent = navigationMonitor.events.value[0]
      expect(firstEvent.data.index).toBe(1499) // Most recent
    })
  })
})