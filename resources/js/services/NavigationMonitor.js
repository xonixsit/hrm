import { ref, computed } from 'vue'
import { conflictDetector } from './NavigationConflictDetector.js'

/**
 * Navigation Monitoring and Logging Service
 * Provides comprehensive monitoring, logging, and analytics for navigation system
 */
class NavigationMonitor {
  constructor() {
    this.isEnabled = ref(true)
    this.events = ref([])
    this.metrics = ref({
      totalEvents: 0,
      errorCount: 0,
      conflictCount: 0,
      fallbackActivations: 0,
      retryAttempts: 0,
      navigationSwitches: 0,
      averageLoadTime: 0,
      lastResetTime: Date.now()
    })
    
    this.maxEventHistory = 1000
    this.performanceMarks = new Map()
    
    // Event types for categorization
    this.EVENT_TYPES = {
      NAVIGATION_LOAD: 'navigation_load',
      NAVIGATION_ERROR: 'navigation_error',
      CONFLICT_DETECTED: 'conflict_detected',
      CONFLICT_RESOLVED: 'conflict_resolved',
      FALLBACK_ACTIVATED: 'fallback_activated',
      FALLBACK_DEACTIVATED: 'fallback_deactivated',
      COMPONENT_REGISTERED: 'component_registered',
      COMPONENT_UNREGISTERED: 'component_unregistered',
      NAVIGATION_SWITCH: 'navigation_switch',
      RETRY_ATTEMPT: 'retry_attempt',
      PERFORMANCE_MARK: 'performance_mark',
      USER_ACTION: 'user_action',
      BREAKPOINT_CHANGE: 'breakpoint_change'
    }
    
    // Severity levels
    this.SEVERITY_LEVELS = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
      INFO: 'info'
    }
    
    this.setupMonitoring()
  }
  
  /**
   * Log a navigation event
   */
  logEvent(type, data = {}, severity = this.SEVERITY_LEVELS.INFO) {
    if (!this.isEnabled.value) return
    
    const timestamp = Date.now()
    const event = {
      id: `event_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      timestamp,
      data: {
        ...data,
        windowWidth: window.innerWidth,
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      sessionId: this.getSessionId(),
      sequence: this.metrics.value.totalEvents + 1
    }
    
    // Add to event history
    this.events.value.unshift(event)
    if (this.events.value.length > this.maxEventHistory) {
      this.events.value = this.events.value.slice(0, this.maxEventHistory)
    }
    
    // Update metrics
    this.updateMetrics(event)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(event)
    }
    
    // Report to external services
    this.reportEvent(event)
    
    return event
  }
  
  /**
   * Log navigation component loading
   */
  logNavigationLoad(componentType, componentId, loadTime = null) {
    const data = {
      componentType,
      componentId,
      loadTime,
      timestamp: Date.now()
    }
    
    if (loadTime) {
      this.updateLoadTimeMetrics(loadTime)
    }
    
    return this.logEvent(
      this.EVENT_TYPES.NAVIGATION_LOAD,
      data,
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Log navigation error
   */
  logNavigationError(error, context = {}) {
    const data = {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      this.EVENT_TYPES.NAVIGATION_ERROR,
      data,
      this.SEVERITY_LEVELS.HIGH
    )
  }
  
  /**
   * Log navigation conflict
   */
  logConflict(conflicts, resolved = false) {
    const eventType = resolved 
      ? this.EVENT_TYPES.CONFLICT_RESOLVED 
      : this.EVENT_TYPES.CONFLICT_DETECTED
    
    const data = {
      conflicts: conflicts.map(c => ({
        id: c.id,
        type: c.type,
        severity: c.severity,
        message: c.message
      })),
      conflictCount: conflicts.length,
      resolved,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      eventType,
      data,
      resolved ? this.SEVERITY_LEVELS.MEDIUM : this.SEVERITY_LEVELS.HIGH
    )
  }
  
  /**
   * Log fallback activation/deactivation
   */
  logFallback(activated, reason = '', errorContext = {}) {
    const eventType = activated 
      ? this.EVENT_TYPES.FALLBACK_ACTIVATED 
      : this.EVENT_TYPES.FALLBACK_DEACTIVATED
    
    const data = {
      activated,
      reason,
      errorContext,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      eventType,
      data,
      activated ? this.SEVERITY_LEVELS.HIGH : this.SEVERITY_LEVELS.MEDIUM
    )
  }
  
  /**
   * Log component registration/unregistration
   */
  logComponentLifecycle(registered, componentId, componentType, metadata = {}) {
    const eventType = registered 
      ? this.EVENT_TYPES.COMPONENT_REGISTERED 
      : this.EVENT_TYPES.COMPONENT_UNREGISTERED
    
    const data = {
      registered,
      componentId,
      componentType,
      metadata,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      eventType,
      data,
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Log navigation type switch
   */
  logNavigationSwitch(fromType, toType, reason = '', preservedData = {}) {
    const data = {
      fromType,
      toType,
      reason,
      preservedData,
      windowWidth: window.innerWidth,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      this.EVENT_TYPES.NAVIGATION_SWITCH,
      data,
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Log retry attempt
   */
  logRetryAttempt(attempt, maxAttempts, context = {}) {
    const data = {
      attempt,
      maxAttempts,
      context,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      this.EVENT_TYPES.RETRY_ATTEMPT,
      data,
      attempt >= maxAttempts ? this.SEVERITY_LEVELS.HIGH : this.SEVERITY_LEVELS.MEDIUM
    )
  }
  
  /**
   * Log user action
   */
  logUserAction(action, target, context = {}) {
    const data = {
      action,
      target,
      context,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      this.EVENT_TYPES.USER_ACTION,
      data,
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Log breakpoint change
   */
  logBreakpointChange(oldWidth, newWidth, oldType, newType) {
    const data = {
      oldWidth,
      newWidth,
      oldType,
      newType,
      timestamp: Date.now()
    }
    
    return this.logEvent(
      this.EVENT_TYPES.BREAKPOINT_CHANGE,
      data,
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Start performance measurement
   */
  startPerformanceMark(markName) {
    const startTime = performance.now()
    this.performanceMarks.set(markName, { startTime })
    
    if (process.env.NODE_ENV === 'development') {
      console.time(`[NAV MONITOR] ${markName}`)
    }
    
    return startTime
  }
  
  /**
   * End performance measurement
   */
  endPerformanceMark(markName, context = {}) {
    const mark = this.performanceMarks.get(markName)
    if (!mark) {
      console.warn(`[NAVIGATION MONITOR] Performance mark not found: ${markName}`)
      return null
    }
    
    const endTime = performance.now()
    const duration = endTime - mark.startTime
    
    this.performanceMarks.delete(markName)
    
    const data = {
      markName,
      duration,
      startTime: mark.startTime,
      endTime,
      context,
      timestamp: Date.now()
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`[NAV MONITOR] ${markName}`)
      //console.log(`[NAV MONITOR] ${markName}: ${duration.toFixed(2)}ms`)
    }
    
    this.logEvent(
      this.EVENT_TYPES.PERFORMANCE_MARK,
      data,
      this.SEVERITY_LEVELS.INFO
    )
    
    return duration
  }
  
  /**
   * Update metrics based on event
   */
  updateMetrics(event) {
    this.metrics.value.totalEvents++
    
    switch (event.type) {
      case this.EVENT_TYPES.NAVIGATION_ERROR:
        this.metrics.value.errorCount++
        break
      case this.EVENT_TYPES.CONFLICT_DETECTED:
        this.metrics.value.conflictCount++
        break
      case this.EVENT_TYPES.FALLBACK_ACTIVATED:
        this.metrics.value.fallbackActivations++
        break
      case this.EVENT_TYPES.RETRY_ATTEMPT:
        this.metrics.value.retryAttempts++
        break
      case this.EVENT_TYPES.NAVIGATION_SWITCH:
        this.metrics.value.navigationSwitches++
        break
    }
  }
  
  /**
   * Update load time metrics
   */
  updateLoadTimeMetrics(loadTime) {
    const currentAverage = this.metrics.value.averageLoadTime
    const totalLoads = this.events.value.filter(e => 
      e.type === this.EVENT_TYPES.NAVIGATION_LOAD && e.data.loadTime
    ).length
    
    if (totalLoads === 1) {
      this.metrics.value.averageLoadTime = loadTime
    } else {
      this.metrics.value.averageLoadTime = 
        (currentAverage * (totalLoads - 1) + loadTime) / totalLoads
    }
  }
  
  /**
   * Get session ID for event correlation
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    return this.sessionId
  }
  
  /**
   * Log event to console with appropriate formatting
   */
  logToConsole(event) {
    const logMethod = {
      [this.SEVERITY_LEVELS.CRITICAL]: console.error,
      [this.SEVERITY_LEVELS.HIGH]: console.warn,
      [this.SEVERITY_LEVELS.MEDIUM]: console.warn,
      [this.SEVERITY_LEVELS.LOW]: console.info,
      [this.SEVERITY_LEVELS.INFO]: //console.log
    }[event.severity] || //console.log
    
    const emoji = {
      [this.EVENT_TYPES.NAVIGATION_LOAD]: '🚀',
      [this.EVENT_TYPES.NAVIGATION_ERROR]: '❌',
      [this.EVENT_TYPES.CONFLICT_DETECTED]: '⚠️',
      [this.EVENT_TYPES.CONFLICT_RESOLVED]: '✅',
      [this.EVENT_TYPES.FALLBACK_ACTIVATED]: '🔄',
      [this.EVENT_TYPES.FALLBACK_DEACTIVATED]: '✅',
      [this.EVENT_TYPES.COMPONENT_REGISTERED]: '📝',
      [this.EVENT_TYPES.COMPONENT_UNREGISTERED]: '🗑️',
      [this.EVENT_TYPES.NAVIGATION_SWITCH]: '🔄',
      [this.EVENT_TYPES.RETRY_ATTEMPT]: '🔄',
      [this.EVENT_TYPES.PERFORMANCE_MARK]: '⏱️',
      [this.EVENT_TYPES.USER_ACTION]: '👆',
      [this.EVENT_TYPES.BREAKPOINT_CHANGE]: '📱'
    }[event.type] || '📊'
    
    logMethod(
      `${emoji} [NAV MONITOR] ${event.type.toUpperCase()}`,
      event.data
    )
  }
  
  /**
   * Report event to external services
   */
  reportEvent(event) {
    // Only report in development mode to console, don't throw events
    if (process.env.NODE_ENV === 'development') {
      // Just log to console, don't throw or report to non-existent services
      if (event.severity === this.SEVERITY_LEVELS.CRITICAL || event.severity === this.SEVERITY_LEVELS.HIGH) {
        console.warn('[NAVIGATION MONITOR] High severity event:', event)
      }
    }
    
    // Report high-severity events immediately
    if ([this.SEVERITY_LEVELS.CRITICAL, this.SEVERITY_LEVELS.HIGH].includes(event.severity)) {
      this.reportCriticalEvent(event)
    }
  }
  
  /**
   * Report critical events for immediate attention
   */
  reportCriticalEvent(event) {
    // This could integrate with services like Sentry, DataDog, etc.
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 [NAV MONITOR] CRITICAL EVENT: ${event.type}`)
      console.error('Event:', event)
      //console.log('Current Metrics:', this.metrics.value)
      //console.log('Recent Events:', this.events.value.slice(0, 5))
      console.groupEnd()
    }
  }
  
  /**
   * Setup automatic monitoring
   */
  setupMonitoring() {
    if (typeof window === 'undefined') return
    
    try {
      // Monitor conflict detector events with error handling
      const originalDetectConflicts = conflictDetector.detectConflicts.bind(conflictDetector)
      conflictDetector.detectConflicts = (...args) => {
        try {
          const conflicts = originalDetectConflicts(...args)
          if (conflicts && Array.isArray(conflicts) && conflicts.length > 0) {
            this.logConflict(conflicts, false)
          }
          return conflicts || []
        } catch (error) {
          console.warn('[NAVIGATION MONITOR] Error in detectConflicts wrapper:', error)
          return []
        }
      }
      
      const originalResolveConflicts = conflictDetector.resolveConflicts.bind(conflictDetector)
      conflictDetector.resolveConflicts = (...args) => {
        try {
          const resolutions = originalResolveConflicts(...args)
          if (resolutions && Array.isArray(resolutions) && resolutions.length > 0) {
            this.logConflict([], true) // Log as resolved
          }
          return resolutions || []
        } catch (error) {
          console.warn('[NAVIGATION MONITOR] Error in resolveConflicts wrapper:', error)
          return []
        }
      }
    } catch (error) {
      console.warn('[NAVIGATION MONITOR] Error setting up conflict detector monitoring:', error)
    }
    
    // Monitor window resize for breakpoint changes
    let lastWidth = window.innerWidth
    let lastType = lastWidth >= 1024 ? 'desktop' : 'mobile'
    
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth
      const newType = newWidth >= 1024 ? 'desktop' : 'mobile'
      
      if (newType !== lastType) {
        this.logBreakpointChange(lastWidth, newWidth, lastType, newType)
        lastWidth = newWidth
        lastType = newType
      }
    })
    
    // Monitor navigation events
    window.addEventListener('navigation-conflict', (event) => {
      this.logConflict([{
        id: 'custom_conflict',
        type: 'custom',
        severity: 'high',
        message: event.detail.message
      }], false)
    })
    
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.logUserAction(
        document.hidden ? 'page_hidden' : 'page_visible',
        'document',
        { visibility: document.visibilityState }
      )
    })
  }
  
  /**
   * Get monitoring statistics
   */
  getStats() {
    const now = Date.now()
    const timeRange = now - this.metrics.value.lastResetTime
    
    return {
      ...this.metrics.value,
      timeRange,
      eventsPerMinute: (this.metrics.value.totalEvents / (timeRange / 60000)).toFixed(2),
      errorRate: ((this.metrics.value.errorCount / this.metrics.value.totalEvents) * 100).toFixed(2),
      conflictRate: ((this.metrics.value.conflictCount / this.metrics.value.totalEvents) * 100).toFixed(2),
      recentEvents: this.events.value.slice(0, 10),
      eventsByType: this.getEventsByType(),
      eventsBySeverity: this.getEventsBySeverity()
    }
  }
  
  /**
   * Get events grouped by type
   */
  getEventsByType() {
    const grouped = {}
    this.events.value.forEach(event => {
      grouped[event.type] = (grouped[event.type] || 0) + 1
    })
    return grouped
  }
  
  /**
   * Get events grouped by severity
   */
  getEventsBySeverity() {
    const grouped = {}
    this.events.value.forEach(event => {
      grouped[event.severity] = (grouped[event.severity] || 0) + 1
    })
    return grouped
  }
  
  /**
   * Export monitoring data
   */
  exportData() {
    return {
      sessionId: this.getSessionId(),
      exportTime: Date.now(),
      metrics: this.metrics.value,
      events: this.events.value,
      stats: this.getStats(),
      conflictStatus: conflictDetector.getStatus(),
      systemInfo: {
        userAgent: navigator.userAgent,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        url: window.location.href,
        timestamp: Date.now()
      }
    }
  }
  
  /**
   * Reset monitoring data
   */
  reset() {
    this.events.value = []
    this.metrics.value = {
      totalEvents: 0,
      errorCount: 0,
      conflictCount: 0,
      fallbackActivations: 0,
      retryAttempts: 0,
      navigationSwitches: 0,
      averageLoadTime: 0,
      lastResetTime: Date.now()
    }
    this.performanceMarks.clear()
    
    this.logEvent(
      'monitor_reset',
      { reason: 'manual_reset' },
      this.SEVERITY_LEVELS.INFO
    )
  }
  
  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled.value = enabled
    
    this.logEvent(
      'monitor_toggle',
      { enabled },
      this.SEVERITY_LEVELS.INFO
    )
  }
}

// Create singleton instance
const navigationMonitor = new NavigationMonitor()

export { navigationMonitor }
export default NavigationMonitor