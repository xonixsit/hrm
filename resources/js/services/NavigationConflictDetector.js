import { ref, computed } from 'vue'

/**
 * Navigation Conflict Detection and Prevention Service
 * Monitors and prevents navigation component conflicts
 */
class NavigationConflictDetector {
  constructor() {
    this.conflicts = ref([])
    this.activeComponents = ref(new Map())
    this.monitoringEnabled = ref(true)
    this.conflictHistory = ref([])
    this.maxHistorySize = 100
    
    // Conflict types
    this.CONFLICT_TYPES = {
      MULTIPLE_DESKTOP: 'multiple_desktop',
      MULTIPLE_MOBILE: 'multiple_mobile',
      SIMULTANEOUS_RENDER: 'simultaneous_render',
      COMPONENT_LEAK: 'component_leak',
      STATE_MISMATCH: 'state_mismatch',
      BREAKPOINT_CONFLICT: 'breakpoint_conflict'
    }
    
    // Severity levels
    this.SEVERITY_LEVELS = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low'
    }
    
    this.setupMonitoring()
  }
  
  /**
   * Register a navigation component
   */
  registerComponent(componentId, type, metadata = {}) {
    const timestamp = Date.now()
    const componentInfo = {
      id: componentId,
      type,
      registeredAt: timestamp,
      metadata: {
        ...metadata,
        windowWidth: window.innerWidth,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
    
    this.activeComponents.value.set(componentId, componentInfo)
    
    // Check for conflicts after registration
    this.detectConflicts()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CONFLICT DETECTOR] Registered ${type} navigation:`, componentId)
    }
    
    return componentInfo
  }
  
  /**
   * Unregister a navigation component
   */
  unregisterComponent(componentId) {
    const component = this.activeComponents.value.get(componentId)
    if (component) {
      this.activeComponents.value.delete(componentId)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CONFLICT DETECTOR] Unregistered ${component.type} navigation:`, componentId)
      }
    }
    
    // Check if conflicts are resolved
    this.detectConflicts()
  }
  
  /**
   * Detect navigation conflicts
   */
  detectConflicts() {
    if (!this.monitoringEnabled.value) return
    
    const currentConflicts = []
    const components = Array.from(this.activeComponents.value.values())
    
    // Check for multiple desktop components
    const desktopComponents = components.filter(c => c.type === 'desktop')
    if (desktopComponents.length > 1) {
      currentConflicts.push(this.createConflict(
        this.CONFLICT_TYPES.MULTIPLE_DESKTOP,
        this.SEVERITY_LEVELS.CRITICAL,
        'Multiple desktop navigation components detected',
        { components: desktopComponents }
      ))
    }
    
    // Check for multiple mobile components
    const mobileComponents = components.filter(c => c.type === 'mobile')
    if (mobileComponents.length > 1) {
      currentConflicts.push(this.createConflict(
        this.CONFLICT_TYPES.MULTIPLE_MOBILE,
        this.SEVERITY_LEVELS.CRITICAL,
        'Multiple mobile navigation components detected',
        { components: mobileComponents }
      ))
    }
    
    // Check for simultaneous desktop and mobile rendering
    if (desktopComponents.length > 0 && mobileComponents.length > 0) {
      currentConflicts.push(this.createConflict(
        this.CONFLICT_TYPES.SIMULTANEOUS_RENDER,
        this.SEVERITY_LEVELS.HIGH,
        'Both desktop and mobile navigation components are active',
        { 
          desktopComponents,
          mobileComponents,
          windowWidth: window.innerWidth
        }
      ))
    }
    
    // Check for component leaks (components registered too long ago)
    const now = Date.now()
    const staleComponents = components.filter(c => 
      now - c.registeredAt > 30000 // 30 seconds
    )
    
    if (staleComponents.length > 0) {
      currentConflicts.push(this.createConflict(
        this.CONFLICT_TYPES.COMPONENT_LEAK,
        this.SEVERITY_LEVELS.MEDIUM,
        'Navigation components may have leaked',
        { components: staleComponents }
      ))
    }
    
    // Check for breakpoint conflicts
    const currentWidth = window.innerWidth
    const shouldBeDesktop = currentWidth >= 1024
    const hasDesktop = desktopComponents.length > 0
    const hasMobile = mobileComponents.length > 0
    
    if ((shouldBeDesktop && !hasDesktop && hasMobile) || 
        (!shouldBeDesktop && hasDesktop && !hasMobile)) {
      currentConflicts.push(this.createConflict(
        this.CONFLICT_TYPES.BREAKPOINT_CONFLICT,
        this.SEVERITY_LEVELS.HIGH,
        'Navigation type does not match current breakpoint',
        {
          windowWidth: currentWidth,
          shouldBeDesktop,
          hasDesktop,
          hasMobile
        }
      ))
    }
    
    // Update conflicts
    this.conflicts.value = currentConflicts
    
    // Add to history if conflicts changed
    if (currentConflicts.length > 0) {
      this.addToHistory(currentConflicts)
    }
    
    // Log conflicts in development
    if (process.env.NODE_ENV === 'development' && currentConflicts.length > 0) {
      console.warn('[CONFLICT DETECTOR] Navigation conflicts detected:', currentConflicts)
    }
    
    return currentConflicts
  }
  
  /**
   * Create a conflict object
   */
  createConflict(type, severity, message, data = {}) {
    return {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      data,
      resolved: false
    }
  }
  
  /**
   * Add conflicts to history
   */
  addToHistory(conflicts) {
    const historyEntry = {
      timestamp: Date.now(),
      conflicts: conflicts.map(c => ({ ...c })),
      windowWidth: window.innerWidth,
      activeComponents: Array.from(this.activeComponents.value.values())
    }
    
    this.conflictHistory.value.unshift(historyEntry)
    
    // Limit history size
    if (this.conflictHistory.value.length > this.maxHistorySize) {
      this.conflictHistory.value = this.conflictHistory.value.slice(0, this.maxHistorySize)
    }
  }
  
  /**
   * Resolve conflicts automatically
   */
  resolveConflicts() {
    const conflicts = this.conflicts.value
    const resolutionActions = []
    
    for (const conflict of conflicts) {
      const action = this.getResolutionAction(conflict)
      if (action) {
        resolutionActions.push(action)
      }
    }
    
    // Execute resolution actions
    for (const action of resolutionActions) {
      try {
        action.execute()
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[CONFLICT DETECTOR] Executed resolution:`, action.description)
        }
      } catch (error) {
        console.error('[CONFLICT DETECTOR] Failed to execute resolution:', error)
      }
    }
    
    // Re-detect conflicts after resolution
    setTimeout(() => this.detectConflicts(), 100)
    
    return resolutionActions
  }
  
  /**
   * Get resolution action for a conflict
   */
  getResolutionAction(conflict) {
    switch (conflict.type) {
      case this.CONFLICT_TYPES.MULTIPLE_DESKTOP:
        return {
          description: 'Remove duplicate desktop navigation components',
          execute: () => {
            const components = conflict.data.components
            // Keep the most recently registered component
            const latest = components.reduce((latest, current) => 
              current.registeredAt > latest.registeredAt ? current : latest
            )
            
            components.forEach(component => {
              if (component.id !== latest.id) {
                this.forceUnregisterComponent(component.id)
              }
            })
          }
        }
        
      case this.CONFLICT_TYPES.MULTIPLE_MOBILE:
        return {
          description: 'Remove duplicate mobile navigation components',
          execute: () => {
            const components = conflict.data.components
            // Keep the most recently registered component
            const latest = components.reduce((latest, current) => 
              current.registeredAt > latest.registeredAt ? current : latest
            )
            
            components.forEach(component => {
              if (component.id !== latest.id) {
                this.forceUnregisterComponent(component.id)
              }
            })
          }
        }
        
      case this.CONFLICT_TYPES.SIMULTANEOUS_RENDER:
        return {
          description: 'Hide inappropriate navigation component based on breakpoint',
          execute: () => {
            const shouldBeDesktop = window.innerWidth >= 1024
            const componentsToRemove = shouldBeDesktop 
              ? conflict.data.mobileComponents 
              : conflict.data.desktopComponents
            
            componentsToRemove.forEach(component => {
              this.forceUnregisterComponent(component.id)
            })
          }
        }
        
      case this.CONFLICT_TYPES.COMPONENT_LEAK:
        return {
          description: 'Clean up stale navigation components',
          execute: () => {
            conflict.data.components.forEach(component => {
              this.forceUnregisterComponent(component.id)
            })
          }
        }
        
      default:
        return null
    }
  }
  
  /**
   * Force unregister a component (for conflict resolution)
   */
  forceUnregisterComponent(componentId) {
    this.unregisterComponent(componentId)
    
    // Also try to hide the component in DOM
    const element = document.querySelector(`[data-navigation-id="${componentId}"]`)
    if (element) {
      element.style.display = 'none'
      element.setAttribute('data-conflict-hidden', 'true')
    }
    
    // Dispatch custom event for component cleanup
    window.dispatchEvent(new CustomEvent('navigation-conflict-cleanup', {
      detail: { componentId, reason: 'conflict_resolution' }
    }))
  }
  
  /**
   * Setup DOM monitoring
   */
  setupMonitoring() {
    if (typeof window === 'undefined') return
    
    // Monitor DOM changes for navigation components
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if navigation components were added/removed
          const addedNodes = Array.from(mutation.addedNodes)
          const removedNodes = Array.from(mutation.removedNodes)
          
          const hasNavigationChanges = [...addedNodes, ...removedNodes].some(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false
            return node.matches('[data-navigation-type]') || 
                   node.querySelector('[data-navigation-type]')
          })
          
          if (hasNavigationChanges) {
            shouldCheck = true
          }
        }
      })
      
      if (shouldCheck) {
        // Debounce conflict detection
        clearTimeout(this.domCheckTimeout)
        this.domCheckTimeout = setTimeout(() => {
          this.detectConflicts()
        }, 100)
      }
    })
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Periodic conflict detection
    this.periodicCheck = setInterval(() => {
      this.detectConflicts()
    }, 5000)
    
    // Window resize monitoring
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        this.detectConflicts()
      }, 250)
    })
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      hasConflicts: this.conflicts.value.length > 0,
      conflictCount: this.conflicts.value.length,
      activeComponentCount: this.activeComponents.value.size,
      conflicts: this.conflicts.value,
      activeComponents: Array.from(this.activeComponents.value.values()),
      monitoringEnabled: this.monitoringEnabled.value
    }
  }
  
  /**
   * Enable/disable monitoring
   */
  setMonitoring(enabled) {
    this.monitoringEnabled.value = enabled
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CONFLICT DETECTOR] Monitoring ${enabled ? 'enabled' : 'disabled'}`)
    }
  }
  
  /**
   * Clear all data
   */
  reset() {
    this.conflicts.value = []
    this.activeComponents.value.clear()
    this.conflictHistory.value = []
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[CONFLICT DETECTOR] Reset completed')
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    if (this.periodicCheck) {
      clearInterval(this.periodicCheck)
    }
    
    if (this.domCheckTimeout) {
      clearTimeout(this.domCheckTimeout)
    }
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    
    this.reset()
  }
}

// Create singleton instance
const conflictDetector = new NavigationConflictDetector()

export { conflictDetector }
export default NavigationConflictDetector