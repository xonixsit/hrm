import { conflictDetector } from '@/services/NavigationConflictDetector.js'
import { navigationMonitor } from '@/services/NavigationMonitor.js'

/**
 * Navigation Debugging Utilities
 * Provides comprehensive debugging tools for navigation issues
 */
class NavigationDebugger {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development'
    this.debugLevel = 'info' // 'error', 'warn', 'info', 'debug', 'verbose'
    this.autoDebug = true
    this.debugHistory = []
    this.maxHistorySize = 100
    
    // Debug categories
    this.DEBUG_CATEGORIES = {
      CONFLICT: 'conflict',
      PERFORMANCE: 'performance',
      COMPONENT: 'component',
      BREAKPOINT: 'breakpoint',
      ERROR: 'error',
      STATE: 'state',
      LIFECYCLE: 'lifecycle'
    }
    
    this.setupDebugTools()
  }
  
  /**
   * Main debug function - analyzes current navigation state
   */
  debug(category = null, detailed = false) {
    if (!this.isEnabled) return
    
    const debugInfo = this.gatherDebugInfo()
    
    console.group('🧭 Navigation System Debug Report')
    
    if (!category || category === this.DEBUG_CATEGORIES.STATE) {
      this.debugNavigationState(debugInfo, detailed)
    }
    
    if (!category || category === this.DEBUG_CATEGORIES.CONFLICT) {
      this.debugConflicts(debugInfo, detailed)
    }
    
    if (!category || category === this.DEBUG_CATEGORIES.COMPONENT) {
      this.debugComponents(debugInfo, detailed)
    }
    
    if (!category || category === this.DEBUG_CATEGORIES.BREAKPOINT) {
      this.debugBreakpoints(debugInfo, detailed)
    }
    
    if (!category || category === this.DEBUG_CATEGORIES.PERFORMANCE) {
      this.debugPerformance(debugInfo, detailed)
    }
    
    if (!category || category === this.DEBUG_CATEGORIES.ERROR) {
      this.debugErrors(debugInfo, detailed)
    }
    
    if (detailed) {
      this.debugDetailed(debugInfo)
    }
    
    console.groupEnd()
    
    // Add to debug history
    this.addToHistory('debug_report', { category, detailed, debugInfo })
    
    return debugInfo
  }
  
  /**
   * Gather comprehensive debug information
   */
  gatherDebugInfo() {
    const now = Date.now()
    
    return {
      timestamp: now,
      window: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent
      },
      location: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      },
      conflicts: conflictDetector.getStatus(),
      monitoring: navigationMonitor.getStats(),
      dom: this.analyzeDOMState(),
      components: this.analyzeComponents(),
      breakpoints: this.analyzeBreakpoints(),
      performance: this.analyzePerformance(),
      errors: this.analyzeErrors()
    }
  }
  
  /**
   * Debug navigation state
   */
  debugNavigationState(debugInfo, detailed) {
    console.group('📊 Navigation State')
    
    //console.log('Window Size:', `${debugInfo.window.width}x${debugInfo.window.height}`)
    //console.log('Current URL:', debugInfo.location.href)
    //console.log('Active Components:', debugInfo.components.active)
    //console.log('Conflicts:', debugInfo.conflicts.hasConflicts ? '❌ YES' : '✅ NO')
    //console.log('Monitoring Enabled:', debugInfo.monitoring.totalEvents > 0 ? '✅ YES' : '❌ NO')
    
    if (detailed) {
      //console.log('Full Window Info:', debugInfo.window)
      //console.log('Full Location Info:', debugInfo.location)
      //console.log('DOM Analysis:', debugInfo.dom)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug conflicts
   */
  debugConflicts(debugInfo, detailed) {
    console.group('⚠️ Conflict Analysis')
    
    const conflicts = debugInfo.conflicts
    
    if (conflicts.hasConflicts) {
      console.error(`Found ${conflicts.conflictCount} conflicts:`)
      conflicts.conflicts.forEach((conflict, index) => {
        console.error(`${index + 1}. ${conflict.type}: ${conflict.message}`)
        if (detailed) {
          //console.log('Conflict Details:', conflict)
        }
      })
    } else {
      //console.log('✅ No conflicts detected')
    }
    
    //console.log('Active Components:', conflicts.activeComponents.length)
    conflicts.activeComponents.forEach(component => {
      //console.log(`- ${component.type}: ${component.id}`)
    })
    
    if (detailed) {
      //console.log('Full Conflict Status:', conflicts)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug components
   */
  debugComponents(debugInfo, detailed) {
    console.group('🧩 Component Analysis')
    
    const components = debugInfo.components
    
    //console.log('Active Components:', components.active.length)
    //console.log('Desktop Components:', components.desktop.length)
    //console.log('Mobile Components:', components.mobile.length)
    //console.log('Fallback Components:', components.fallback.length)
    
    if (components.duplicates.length > 0) {
      console.warn('⚠️ Duplicate Components Found:')
      components.duplicates.forEach(dup => {
        console.warn(`- ${dup.type}: ${dup.count} instances`)
      })
    }
    
    if (detailed) {
      //console.log('Component Details:')
      //console.log('- Active:', components.active)
      //console.log('- Desktop:', components.desktop)
      //console.log('- Mobile:', components.mobile)
      //console.log('- Fallback:', components.fallback)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug breakpoints
   */
  debugBreakpoints(debugInfo, detailed) {
    console.group('📱 Breakpoint Analysis')
    
    const breakpoints = debugInfo.breakpoints
    
    //console.log('Current Width:', breakpoints.currentWidth)
    //console.log('Expected Type:', breakpoints.expectedType)
    //console.log('Actual Type:', breakpoints.actualType)
    //console.log('Match:', breakpoints.matches ? '✅ YES' : '❌ NO')
    
    if (!breakpoints.matches) {
      console.warn('⚠️ Breakpoint mismatch detected!')
      console.warn(`Expected: ${breakpoints.expectedType}, Actual: ${breakpoints.actualType}`)
    }
    
    if (detailed) {
      //console.log('Breakpoint Details:', breakpoints)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug performance
   */
  debugPerformance(debugInfo, detailed) {
    console.group('⏱️ Performance Analysis')
    
    const performance = debugInfo.performance
    
    //console.log('Average Load Time:', `${performance.averageLoadTime.toFixed(2)}ms`)
    //console.log('Total Events:', performance.totalEvents)
    //console.log('Error Rate:', `${performance.errorRate}%`)
    //console.log('Events/Minute:', performance.eventsPerMinute)
    
    if (performance.slowComponents.length > 0) {
      console.warn('⚠️ Slow Components:')
      performance.slowComponents.forEach(comp => {
        console.warn(`- ${comp.name}: ${comp.loadTime}ms`)
      })
    }
    
    if (detailed) {
      //console.log('Performance Details:', performance)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug errors
   */
  debugErrors(debugInfo, detailed) {
    console.group('❌ Error Analysis')
    
    const errors = debugInfo.errors
    
    //console.log('Total Errors:', errors.totalErrors)
    //console.log('Recent Errors:', errors.recentErrors.length)
    //console.log('Error Types:', Object.keys(errors.errorsByType).join(', '))
    
    if (errors.recentErrors.length > 0) {
      console.warn('Recent Errors:')
      errors.recentErrors.forEach((error, index) => {
        console.warn(`${index + 1}. ${error.type}: ${error.message}`)
      })
    }
    
    if (detailed) {
      //console.log('Error Details:', errors)
    }
    
    console.groupEnd()
  }
  
  /**
   * Debug detailed information
   */
  debugDetailed(debugInfo) {
    console.group('🔍 Detailed Analysis')
    
    //console.log('Full Debug Info:', debugInfo)
    //console.log('Debug History:', this.debugHistory.slice(0, 10))
    
    // Check for common issues
    this.checkCommonIssues(debugInfo)
    
    console.groupEnd()
  }
  
  /**
   * Check for common navigation issues
   */
  checkCommonIssues(debugInfo) {
    console.group('🔧 Common Issues Check')
    
    const issues = []
    
    // Check for multiple components of same type
    if (debugInfo.components.duplicates.length > 0) {
      issues.push('Multiple navigation components of the same type detected')
    }
    
    // Check for breakpoint mismatches
    if (!debugInfo.breakpoints.matches) {
      issues.push('Navigation type does not match current breakpoint')
    }
    
    // Check for high error rate
    if (parseFloat(debugInfo.monitoring.errorRate) > 10) {
      issues.push('High error rate detected (>10%)')
    }
    
    // Check for slow performance
    if (debugInfo.performance.averageLoadTime > 1000) {
      issues.push('Slow navigation loading detected (>1000ms)')
    }
    
    // Check for conflicts
    if (debugInfo.conflicts.hasConflicts) {
      issues.push('Navigation conflicts detected')
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Issues Found:')
      issues.forEach((issue, index) => {
        console.warn(`${index + 1}. ${issue}`)
      })
    } else {
      //console.log('✅ No common issues detected')
    }
    
    console.groupEnd()
  }
  
  /**
   * Analyze DOM state
   */
  analyzeDOMState() {
    const navigationElements = document.querySelectorAll('[data-navigation-type]')
    const desktopNavs = document.querySelectorAll('[data-navigation-type="desktop"]')
    const mobileNavs = document.querySelectorAll('[data-navigation-type="mobile"]')
    const fallbackNavs = document.querySelectorAll('[data-navigation-type="fallback"]')
    
    return {
      totalNavigationElements: navigationElements.length,
      desktopElements: desktopNavs.length,
      mobileElements: mobileNavs.length,
      fallbackElements: fallbackNavs.length,
      visibleElements: Array.from(navigationElements).filter(el => 
        el.offsetWidth > 0 && el.offsetHeight > 0
      ).length,
      hiddenElements: Array.from(navigationElements).filter(el => 
        el.offsetWidth === 0 || el.offsetHeight === 0
      ).length
    }
  }
  
  /**
   * Analyze components
   */
  analyzeComponents() {
    const conflicts = conflictDetector.getStatus()
    const active = conflicts.activeComponents
    
    const desktop = active.filter(c => c.type === 'desktop')
    const mobile = active.filter(c => c.type === 'mobile')
    const fallback = active.filter(c => c.type === 'fallback')
    
    // Find duplicates
    const typeCounts = {}
    active.forEach(component => {
      typeCounts[component.type] = (typeCounts[component.type] || 0) + 1
    })
    
    const duplicates = Object.entries(typeCounts)
      .filter(([type, count]) => count > 1)
      .map(([type, count]) => ({ type, count }))
    
    return {
      active,
      desktop,
      mobile,
      fallback,
      duplicates
    }
  }
  
  /**
   * Analyze breakpoints
   */
  analyzeBreakpoints() {
    const currentWidth = window.innerWidth
    const expectedType = currentWidth >= 1024 ? 'desktop' : 'mobile'
    
    const conflicts = conflictDetector.getStatus()
    const activeComponents = conflicts.activeComponents
    
    const hasDesktop = activeComponents.some(c => c.type === 'desktop')
    const hasMobile = activeComponents.some(c => c.type === 'mobile')
    
    let actualType = 'none'
    if (hasDesktop && !hasMobile) actualType = 'desktop'
    else if (hasMobile && !hasDesktop) actualType = 'mobile'
    else if (hasDesktop && hasMobile) actualType = 'both'
    
    return {
      currentWidth,
      expectedType,
      actualType,
      matches: expectedType === actualType,
      hasDesktop,
      hasMobile
    }
  }
  
  /**
   * Analyze performance
   */
  analyzePerformance() {
    const stats = navigationMonitor.getStats()
    const events = navigationMonitor.events.value
    
    // Find slow components
    const loadEvents = events.filter(e => 
      e.type === 'navigation_load' && e.data.loadTime
    )
    
    const slowComponents = loadEvents
      .filter(e => e.data.loadTime > 500)
      .map(e => ({
        name: e.data.componentType,
        loadTime: e.data.loadTime
      }))
    
    return {
      ...stats,
      slowComponents
    }
  }
  
  /**
   * Analyze errors
   */
  analyzeErrors() {
    const events = navigationMonitor.events.value
    const errorEvents = events.filter(e => 
      e.type === 'navigation_error' || e.severity === 'high' || e.severity === 'critical'
    )
    
    const errorsByType = {}
    errorEvents.forEach(event => {
      const type = event.data.errorName || event.type
      errorsByType[type] = (errorsByType[type] || 0) + 1
    })
    
    return {
      totalErrors: errorEvents.length,
      recentErrors: errorEvents.slice(0, 5),
      errorsByType
    }
  }
  
  /**
   * Add entry to debug history
   */
  addToHistory(action, data) {
    this.debugHistory.unshift({
      timestamp: Date.now(),
      action,
      data
    })
    
    if (this.debugHistory.length > this.maxHistorySize) {
      this.debugHistory = this.debugHistory.slice(0, this.maxHistorySize)
    }
  }
  
  /**
   * Setup debug tools and global functions
   */
  setupDebugTools() {
    if (!this.isEnabled) return
    
    // Add global debug functions
    window.debugNavigation = (category, detailed) => this.debug(category, detailed)
    window.debugNavigationConflicts = () => this.debug(this.DEBUG_CATEGORIES.CONFLICT, true)
    window.debugNavigationPerformance = () => this.debug(this.DEBUG_CATEGORIES.PERFORMANCE, true)
    window.debugNavigationComponents = () => this.debug(this.DEBUG_CATEGORIES.COMPONENT, true)
    
    // Add debug shortcuts
    window.navDebug = {
      debug: (category, detailed) => this.debug(category, detailed),
      conflicts: () => this.debug(this.DEBUG_CATEGORIES.CONFLICT, true),
      performance: () => this.debug(this.DEBUG_CATEGORIES.PERFORMANCE, true),
      components: () => this.debug(this.DEBUG_CATEGORIES.COMPONENT, true),
      breakpoints: () => this.debug(this.DEBUG_CATEGORIES.BREAKPOINT, true),
      errors: () => this.debug(this.DEBUG_CATEGORIES.ERROR, true),
      export: () => this.exportDebugData(),
      reset: () => this.resetDebugData(),
      monitor: navigationMonitor,
      conflicts: conflictDetector
    }
    
    //console.log('🧭 Navigation Debug Tools Available:')
    //console.log('- debugNavigation() - Full debug report')
    //console.log('- debugNavigationConflicts() - Conflict analysis')
    //console.log('- debugNavigationPerformance() - Performance analysis')
    //console.log('- debugNavigationComponents() - Component analysis')
    //console.log('- navDebug.* - Debug shortcuts object')
  }
  
  /**
   * Export debug data
   */
  exportDebugData() {
    const debugInfo = this.gatherDebugInfo()
    const exportData = {
      timestamp: Date.now(),
      debugInfo,
      debugHistory: this.debugHistory,
      monitoringData: navigationMonitor.exportData(),
      conflictData: conflictDetector.getStatus()
    }
    
    //console.log('📤 Debug Data Export:', exportData)
    
    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => //console.log('✅ Debug data copied to clipboard'))
        .catch(() => //console.log('❌ Failed to copy to clipboard'))
    }
    
    return exportData
  }
  
  /**
   * Reset debug data
   */
  resetDebugData() {
    this.debugHistory = []
    navigationMonitor.reset()
    conflictDetector.reset()
    
    //console.log('🔄 Debug data reset')
    this.addToHistory('debug_reset', { timestamp: Date.now() })
  }
  
  /**
   * Auto-debug on issues
   */
  autoDebugOnIssues() {
    if (!this.autoDebug) return
    
    try {
      // Monitor for conflicts with error handling
      const originalDetectConflicts = conflictDetector.detectConflicts.bind(conflictDetector)
      conflictDetector.detectConflicts = (...args) => {
        try {
          const conflicts = originalDetectConflicts(...args)
          if (conflicts && Array.isArray(conflicts) && conflicts.length > 0) {
            console.warn('🚨 Auto-debug triggered by conflicts')
            this.debug(this.DEBUG_CATEGORIES.CONFLICT, true)
          }
          return conflicts || []
        } catch (error) {
          console.warn('[NAVIGATION DEBUGGER] Error in detectConflicts wrapper:', error)
          return []
        }
      }
    } catch (error) {
      console.warn('[NAVIGATION DEBUGGER] Error setting up conflict detector monitoring:', error)
    }
    
    // Monitor for errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message.toLowerCase().includes('navigation')) {
        console.warn('🚨 Auto-debug triggered by navigation error')
        this.debug(this.DEBUG_CATEGORIES.ERROR, true)
      }
    })
  }
}

// Create singleton instance
const navigationDebugger = new NavigationDebugger()

// Auto-setup in development
if (process.env.NODE_ENV === 'development') {
  navigationDebugger.autoDebugOnIssues()
}

export { navigationDebugger }
export default NavigationDebugger