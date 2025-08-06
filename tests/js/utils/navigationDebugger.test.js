import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { navigationDebugger } from '@/utils/navigationDebugger.js'
import { conflictDetector } from '@/services/NavigationConflictDetector.js'
import { navigationMonitor } from '@/services/NavigationMonitor.js'

describe('NavigationDebugger', () => {
  let mockWindow
  let mockDocument
  let mockConsole

  beforeEach(() => {
    // Reset services
    conflictDetector.reset()
    navigationMonitor.reset()
    
    // Mock global objects
    mockWindow = {
      innerWidth: 1200,
      innerHeight: 800,
      devicePixelRatio: 1,
      location: {
        href: 'http://localhost/dashboard',
        pathname: '/dashboard',
        search: '',
        hash: ''
      }
    }
    
    mockDocument = {
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(() => null)
    }
    
    mockConsole = {
      group: vi.fn(),
      groupEnd: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
    
    global.window = mockWindow
    global.document = mockDocument
    global.console = { ...console, ...mockConsole }
    global.navigator = {
      userAgent: 'test-user-agent'
    }
    global.performance = {
      now: vi.fn(() => Date.now())
    }
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    conflictDetector.reset()
    navigationMonitor.reset()
  })

  describe('Debug Information Gathering', () => {
    it('should gather comprehensive debug information', () => {
      // Set up some navigation state
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      navigationMonitor.logNavigationLoad('desktop', 'test-component', 150)
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      
      expect(debugInfo).toHaveProperty('timestamp')
      expect(debugInfo).toHaveProperty('window')
      expect(debugInfo).toHaveProperty('location')
      expect(debugInfo).toHaveProperty('conflicts')
      expect(debugInfo).toHaveProperty('monitoring')
      expect(debugInfo).toHaveProperty('dom')
      expect(debugInfo).toHaveProperty('components')
      expect(debugInfo).toHaveProperty('breakpoints')
      expect(debugInfo).toHaveProperty('performance')
      expect(debugInfo).toHaveProperty('errors')
      
      // Verify window information
      expect(debugInfo.window.width).toBe(1200)
      expect(debugInfo.window.height).toBe(800)
      expect(debugInfo.window.userAgent).toBe('test-user-agent')
      
      // Verify location information
      expect(debugInfo.location.href).toBe('http://localhost/dashboard')
      expect(debugInfo.location.pathname).toBe('/dashboard')
    })

    it('should analyze DOM state correctly', () => {
      // Mock DOM elements
      const desktopElement = { 
        offsetWidth: 200, 
        offsetHeight: 50,
        getAttribute: vi.fn(() => 'desktop')
      }
      const mobileElement = { 
        offsetWidth: 0, 
        offsetHeight: 0,
        getAttribute: vi.fn(() => 'mobile')
      }
      
      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('[data-navigation-type]')) {
          return [desktopElement, mobileElement]
        }
        if (selector.includes('desktop')) return [desktopElement]
        if (selector.includes('mobile')) return [mobileElement]
        return []
      })
      
      const domAnalysis = navigationDebugger.analyzeDOMState()
      
      expect(domAnalysis.totalNavigationElements).toBe(2)
      expect(domAnalysis.desktopElements).toBe(1)
      expect(domAnalysis.mobileElements).toBe(1)
      expect(domAnalysis.visibleElements).toBe(1) // Only desktop is visible
      expect(domAnalysis.hiddenElements).toBe(1) // Mobile is hidden
    })

    it('should analyze component state correctly', () => {
      // Register various components
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop') // Duplicate
      conflictDetector.registerComponent('mobile-1', 'mobile')
      conflictDetector.registerComponent('fallback-1', 'fallback')
      
      const componentAnalysis = navigationDebugger.analyzeComponents()
      
      expect(componentAnalysis.active.length).toBe(4)
      expect(componentAnalysis.desktop.length).toBe(2)
      expect(componentAnalysis.mobile.length).toBe(1)
      expect(componentAnalysis.fallback.length).toBe(1)
      expect(componentAnalysis.duplicates.length).toBe(1)
      expect(componentAnalysis.duplicates[0].type).toBe('desktop')
      expect(componentAnalysis.duplicates[0].count).toBe(2)
    })

    it('should analyze breakpoint state correctly', () => {
      // Test desktop breakpoint
      mockWindow.innerWidth = 1200
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      
      let breakpointAnalysis = navigationDebugger.analyzeBreakpoints()
      
      expect(breakpointAnalysis.currentWidth).toBe(1200)
      expect(breakpointAnalysis.expectedType).toBe('desktop')
      expect(breakpointAnalysis.actualType).toBe('desktop')
      expect(breakpointAnalysis.matches).toBe(true)
      
      // Test breakpoint mismatch
      mockWindow.innerWidth = 768 // Mobile size
      // Keep desktop component registered
      
      breakpointAnalysis = navigationDebugger.analyzeBreakpoints()
      
      expect(breakpointAnalysis.currentWidth).toBe(768)
      expect(breakpointAnalysis.expectedType).toBe('mobile')
      expect(breakpointAnalysis.actualType).toBe('desktop')
      expect(breakpointAnalysis.matches).toBe(false)
    })

    it('should analyze performance metrics', () => {
      // Generate some performance data
      navigationMonitor.logNavigationLoad('desktop', 'fast-component', 100)
      navigationMonitor.logNavigationLoad('mobile', 'slow-component', 800)
      navigationMonitor.logNavigationError(new Error('Test error'))
      
      const performanceAnalysis = navigationDebugger.analyzePerformance()
      
      expect(performanceAnalysis).toHaveProperty('totalEvents')
      expect(performanceAnalysis).toHaveProperty('errorRate')
      expect(performanceAnalysis).toHaveProperty('averageLoadTime')
      expect(performanceAnalysis).toHaveProperty('slowComponents')
      
      // Should identify slow components (>500ms)
      expect(performanceAnalysis.slowComponents.length).toBe(1)
      expect(performanceAnalysis.slowComponents[0].name).toBe('mobile')
      expect(performanceAnalysis.slowComponents[0].loadTime).toBe(800)
    })

    it('should analyze error patterns', () => {
      // Generate various errors
      navigationMonitor.logNavigationError(new Error('Network error'))
      navigationMonitor.logNavigationError(new Error('Permission denied'))
      navigationMonitor.logEvent('navigation_error', { errorName: 'ChunkLoadError' }, 'high')
      
      const errorAnalysis = navigationDebugger.analyzeErrors()
      
      expect(errorAnalysis.totalErrors).toBe(3)
      expect(errorAnalysis.recentErrors.length).toBe(3)
      expect(errorAnalysis.errorsByType).toHaveProperty('Error')
      expect(errorAnalysis.errorsByType).toHaveProperty('ChunkLoadError')
    })
  })

  describe('Debug Reporting', () => {
    it('should generate comprehensive debug reports', () => {
      // Set up navigation state with issues
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop') // Conflict
      navigationMonitor.logNavigationError(new Error('Test error'))
      
      const debugInfo = navigationDebugger.debug('conflict', true)
      
      expect(mockConsole.group).toHaveBeenCalledWith('🧭 Navigation System Debug Report')
      expect(mockConsole.groupEnd).toHaveBeenCalled()
      expect(debugInfo).toBeDefined()
      expect(debugInfo.conflicts.hasConflicts).toBe(true)
    })

    it('should debug specific categories', () => {
      // Test conflict debugging
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      navigationDebugger.debug('conflict', false)
      
      expect(mockConsole.group).toHaveBeenCalledWith('⚠️ Conflict Analysis')
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Found 1 conflicts:')
      )
    })

    it('should debug performance issues', () => {
      // Generate slow performance data
      navigationMonitor.logNavigationLoad('slow-component', 'id-1', 1200)
      
      navigationDebugger.debug('performance', true)
      
      expect(mockConsole.group).toHaveBeenCalledWith('⏱️ Performance Analysis')
      expect(mockConsole.warn).toHaveBeenCalledWith('⚠️ Slow Components:')
    })

    it('should debug component issues', () => {
      // Create component duplicates
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      navigationDebugger.debug('component', true)
      
      expect(mockConsole.group).toHaveBeenCalledWith('🧩 Component Analysis')
      expect(mockConsole.warn).toHaveBeenCalledWith('⚠️ Duplicate Components Found:')
    })

    it('should debug breakpoint issues', () => {
      // Create breakpoint mismatch
      mockWindow.innerWidth = 768
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      
      navigationDebugger.debug('breakpoint', true)
      
      expect(mockConsole.group).toHaveBeenCalledWith('📱 Breakpoint Analysis')
      expect(mockConsole.warn).toHaveBeenCalledWith('⚠️ Breakpoint mismatch detected!')
    })
  })

  describe('Common Issues Detection', () => {
    it('should detect multiple components of same type', () => {
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.warn).toHaveBeenCalledWith('⚠️ Issues Found:')
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Multiple navigation components of the same type detected')
      )
    })

    it('should detect breakpoint mismatches', () => {
      mockWindow.innerWidth = 768 // Mobile
      conflictDetector.registerComponent('desktop-nav', 'desktop') // Desktop component
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Navigation type does not match current breakpoint')
      )
    })

    it('should detect high error rates', () => {
      // Generate many errors to create high error rate
      for (let i = 0; i < 15; i++) {
        navigationMonitor.logNavigationError(new Error(`Error ${i}`))
      }
      
      // Generate some normal events to establish baseline
      for (let i = 0; i < 100; i++) {
        navigationMonitor.logNavigationLoad('component', `id-${i}`)
      }
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('High error rate detected (>10%)')
      )
    })

    it('should detect slow performance', () => {
      // Set up slow average load time
      navigationMonitor.logNavigationLoad('slow-component-1', 'id-1', 1500)
      navigationMonitor.logNavigationLoad('slow-component-2', 'id-2', 1200)
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow navigation loading detected (>1000ms)')
      )
    })

    it('should detect navigation conflicts', () => {
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Navigation conflicts detected')
      )
    })

    it('should report no issues when everything is working correctly', () => {
      // Set up clean state
      mockWindow.innerWidth = 1200
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      navigationMonitor.logNavigationLoad('desktop', 'nav-component', 150)
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      navigationDebugger.checkCommonIssues(debugInfo)
      
      expect(mockConsole.log).toHaveBeenCalledWith('✅ No common issues detected')
    })
  })

  describe('Debug History and Export', () => {
    it('should maintain debug history', () => {
      navigationDebugger.debug('conflict', false)
      navigationDebugger.debug('performance', false)
      
      expect(navigationDebugger.debugHistory.length).toBe(2)
      expect(navigationDebugger.debugHistory[0].action).toBe('debug_report')
      expect(navigationDebugger.debugHistory[1].action).toBe('debug_report')
    })

    it('should limit debug history size', () => {
      // Generate more than max history size
      for (let i = 0; i < 150; i++) {
        navigationDebugger.addToHistory(`action_${i}`, { data: i })
      }
      
      expect(navigationDebugger.debugHistory.length).toBeLessThanOrEqual(100)
    })

    it('should export debug data', () => {
      // Generate some debug state
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      navigationMonitor.logNavigationLoad('desktop', 'test-component')
      navigationDebugger.debug('conflict', false)
      
      const exportData = navigationDebugger.exportDebugData()
      
      expect(exportData).toHaveProperty('timestamp')
      expect(exportData).toHaveProperty('debugInfo')
      expect(exportData).toHaveProperty('debugHistory')
      expect(exportData).toHaveProperty('monitoringData')
      expect(exportData).toHaveProperty('conflictData')
      
      expect(exportData.debugHistory.length).toBeGreaterThan(0)
      expect(exportData.monitoringData.events.length).toBeGreaterThan(0)
      expect(exportData.conflictData.activeComponentCount).toBeGreaterThan(0)
    })

    it('should reset debug data', () => {
      // Generate some data
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      navigationMonitor.logNavigationLoad('desktop', 'test-component')
      navigationDebugger.debug('conflict', false)
      
      expect(navigationDebugger.debugHistory.length).toBeGreaterThan(0)
      expect(navigationMonitor.getStats().totalEvents).toBeGreaterThan(0)
      expect(conflictDetector.getStatus().activeComponentCount).toBeGreaterThan(0)
      
      navigationDebugger.resetDebugData()
      
      expect(navigationDebugger.debugHistory.length).toBe(1) // Reset event added
      expect(navigationMonitor.getStats().totalEvents).toBe(1) // Reset event
      expect(conflictDetector.getStatus().activeComponentCount).toBe(0)
    })
  })

  describe('Global Debug Tools', () => {
    it('should set up global debug functions in development', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Re-import to trigger setup
      delete require.cache[require.resolve('@/utils/navigationDebugger.js')]
      const { navigationDebugger: devDebugger } = require('@/utils/navigationDebugger.js')
      
      expect(typeof global.window.debugNavigation).toBe('function')
      expect(typeof global.window.debugNavigationConflicts).toBe('function')
      expect(typeof global.window.debugNavigationPerformance).toBe('function')
      expect(typeof global.window.debugNavigationComponents).toBe('function')
      expect(typeof global.window.navDebug).toBe('object')
      
      // Test global functions
      global.window.debugNavigation('conflict', true)
      expect(mockConsole.group).toHaveBeenCalled()
      
      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('should provide debug shortcuts object', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      delete require.cache[require.resolve('@/utils/navigationDebugger.js')]
      require('@/utils/navigationDebugger.js')
      
      const navDebug = global.window.navDebug
      
      expect(typeof navDebug.debug).toBe('function')
      expect(typeof navDebug.conflicts).toBe('function')
      expect(typeof navDebug.performance).toBe('function')
      expect(typeof navDebug.components).toBe('function')
      expect(typeof navDebug.breakpoints).toBe('function')
      expect(typeof navDebug.errors).toBe('function')
      expect(typeof navDebug.export).toBe('function')
      expect(typeof navDebug.reset).toBe('function')
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Auto-Debug Functionality', () => {
    it('should auto-debug on conflicts', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const debugSpy = vi.spyOn(navigationDebugger, 'debug')
      
      // Trigger auto-debug setup
      navigationDebugger.autoDebugOnIssues()
      
      // Create conflicts to trigger auto-debug
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      conflictDetector.detectConflicts()
      
      expect(debugSpy).toHaveBeenCalledWith('conflict', true)
      
      debugSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })

    it('should auto-debug on navigation errors', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const debugSpy = vi.spyOn(navigationDebugger, 'debug')
      
      navigationDebugger.autoDebugOnIssues()
      
      // Simulate navigation error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Navigation component failed to load'),
        message: 'Navigation component failed to load'
      })
      
      global.window.dispatchEvent(errorEvent)
      
      expect(debugSpy).toHaveBeenCalledWith('error', true)
      
      debugSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Performance and Efficiency', () => {
    it('should gather debug info efficiently', () => {
      const startTime = performance.now()
      
      // Set up complex navigation state
      for (let i = 0; i < 20; i++) {
        conflictDetector.registerComponent(`component-${i}`, i % 2 === 0 ? 'desktop' : 'mobile')
        navigationMonitor.logNavigationLoad(`component-${i}`, `id-${i}`, Math.random() * 200)
      }
      
      const debugInfo = navigationDebugger.gatherDebugInfo()
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(50) // Should complete within 50ms
      expect(debugInfo).toBeDefined()
      expect(debugInfo.components.active.length).toBe(20)
    })

    it('should handle debug operations without memory leaks', () => {
      // Generate many debug operations
      for (let i = 0; i < 100; i++) {
        navigationDebugger.addToHistory(`test_action_${i}`, { data: i })
      }
      
      // History should be limited
      expect(navigationDebugger.debugHistory.length).toBeLessThanOrEqual(100)
      
      // Reset should clean up properly
      navigationDebugger.resetDebugData()
      expect(navigationDebugger.debugHistory.length).toBe(1) // Only reset event
    })
  })
})