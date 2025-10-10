/**
 * Navigation Conflict Detection Service
 * Detects and resolves conflicts between navigation components
 */
class NavigationConflictDetector {
  constructor() {
    this.activeComponents = []
    this.conflicts = []
    this.isEnabled = true
    this.lastCheck = Date.now()

    // Conflict types
    this.CONFLICT_TYPES = {
      MULTIPLE_SAME_TYPE: 'multiple_same_type',
      BREAKPOINT_MISMATCH: 'breakpoint_mismatch',
      VISIBILITY_CONFLICT: 'visibility_conflict',
      DUPLICATE_ID: 'duplicate_id',
      MISSING_COMPONENT: 'missing_component'
    }

    // Severity levels
    this.SEVERITY_LEVELS = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low'
    }
  }

  /**
   * Register a navigation component
   */
  registerComponent(id, type, metadata = {}) {
    if (!this.isEnabled) return

    const component = {
      id,
      type,
      metadata,
      registeredAt: Date.now(),
      lastSeen: Date.now()
    }

    // Remove existing component with same ID
    this.activeComponents = this.activeComponents.filter(c => c.id !== id)

    // Add new component
    this.activeComponents.push(component)

    // Check for conflicts after registration
    this.detectConflicts()

    return component
  }

  /**
   * Unregister a navigation component
   */
  unregisterComponent(id) {
    if (!this.isEnabled) return

    this.activeComponents = this.activeComponents.filter(c => c.id !== id)

    // Check for conflicts after unregistration
    this.detectConflicts()
  }

  /**
   * Update component metadata
   */
  updateComponent(id, metadata = {}) {
    if (!this.isEnabled) return

    const component = this.activeComponents.find(c => c.id === id)
    if (component) {
      component.metadata = { ...component.metadata, ...metadata }
      component.lastSeen = Date.now()
    }

    return component
  }

  /**
   * Detect navigation conflicts
   */
  detectConflicts() {
    if (!this.isEnabled) return []

    this.conflicts = []
    this.lastCheck = Date.now()

    // Ensure activeComponents is always an array
    if (!Array.isArray(this.activeComponents)) {
      this.activeComponents = []
    }

    // Check for multiple components of same type
    this.checkMultipleSameType()

    // Check for breakpoint mismatches
    this.checkBreakpointMismatches()

    // Check for visibility conflicts
    this.checkVisibilityConflicts()

    // Check for duplicate IDs
    this.checkDuplicateIds()

    // Check for missing required components
    this.checkMissingComponents()

    return this.conflicts
  }

  /**
   * Check for multiple components of the same type
   */
  checkMultipleSameType() {
    const typeCounts = {}

    this.activeComponents.forEach(component => {
      typeCounts[component.type] = (typeCounts[component.type] || 0) + 1
    })

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > 1) {
        this.addConflict({
          type: this.CONFLICT_TYPES.MULTIPLE_SAME_TYPE,
          severity: this.SEVERITY_LEVELS.HIGH,
          message: `Multiple ${type} navigation components detected (${count})`,
          affectedComponents: this.activeComponents.filter(c => c.type === type),
          data: { type, count }
        })
      }
    })
  }

  /**
   * Check for breakpoint mismatches
   */
  checkBreakpointMismatches() {
    const currentWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const expectedType = currentWidth >= 1024 ? 'desktop' : 'mobile'

    const hasDesktop = this.activeComponents.some(c => c.type === 'desktop')
    const hasMobile = this.activeComponents.some(c => c.type === 'mobile')

    if (expectedType === 'desktop' && hasMobile && !hasDesktop) {
      this.addConflict({
        type: this.CONFLICT_TYPES.BREAKPOINT_MISMATCH,
        severity: this.SEVERITY_LEVELS.MEDIUM,
        message: 'Mobile navigation active on desktop breakpoint',
        affectedComponents: this.activeComponents.filter(c => c.type === 'mobile'),
        data: { expectedType, currentWidth }
      })
    }

    if (expectedType === 'mobile' && hasDesktop && !hasMobile) {
      this.addConflict({
        type: this.CONFLICT_TYPES.BREAKPOINT_MISMATCH,
        severity: this.SEVERITY_LEVELS.MEDIUM,
        message: 'Desktop navigation active on mobile breakpoint',
        affectedComponents: this.activeComponents.filter(c => c.type === 'desktop'),
        data: { expectedType, currentWidth }
      })
    }
  }

  /**
   * Check for visibility conflicts
   */
  checkVisibilityConflicts() {
    if (typeof window === 'undefined') return

    const visibleComponents = this.activeComponents.filter(component => {
      const element = document.getElementById(component.id)
      return element && element.offsetWidth > 0 && element.offsetHeight > 0
    })

    // Check if multiple navigation types are visible simultaneously
    const visibleTypes = [...new Set(visibleComponents.map(c => c.type))]

    if (visibleTypes.length > 1) {
      this.addConflict({
        type: this.CONFLICT_TYPES.VISIBILITY_CONFLICT,
        severity: this.SEVERITY_LEVELS.HIGH,
        message: `Multiple navigation types visible: ${visibleTypes.join(', ')}`,
        affectedComponents: visibleComponents,
        data: { visibleTypes }
      })
    }
  }

  /**
   * Check for duplicate component IDs
   */
  checkDuplicateIds() {
    const idCounts = {}

    this.activeComponents.forEach(component => {
      idCounts[component.id] = (idCounts[component.id] || 0) + 1
    })

    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) {
        this.addConflict({
          type: this.CONFLICT_TYPES.DUPLICATE_ID,
          severity: this.SEVERITY_LEVELS.CRITICAL,
          message: `Duplicate component ID detected: ${id}`,
          affectedComponents: this.activeComponents.filter(c => c.id === id),
          data: { id, count }
        })
      }
    })
  }

  /**
   * Check for missing required components
   */
  checkMissingComponents() {
    if (typeof window === 'undefined') return

    const currentWidth = window.innerWidth
    const expectedType = currentWidth >= 1024 ? 'desktop' : 'mobile'

    const hasExpectedType = this.activeComponents.some(c => c.type === expectedType)

    if (!hasExpectedType && this.activeComponents.length === 0) {
      this.addConflict({
        type: this.CONFLICT_TYPES.MISSING_COMPONENT,
        severity: this.SEVERITY_LEVELS.HIGH,
        message: `No ${expectedType} navigation component found`,
        affectedComponents: [],
        data: { expectedType, currentWidth }
      })
    }
  }

  /**
   * Add a conflict to the list
   */
  addConflict(conflict) {
    const conflictWithId = {
      ...conflict,
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: Date.now()
    }

    this.conflicts.push(conflictWithId)

    return conflictWithId
  }

  /**
   * Resolve conflicts automatically where possible
   */
  resolveConflicts() {
    if (!this.isEnabled) return []

    const resolutions = []

    this.conflicts.forEach(conflict => {
      const resolution = this.attemptResolution(conflict)
      if (resolution) {
        resolutions.push(resolution)
      }
    })

    // Remove resolved conflicts
    this.conflicts = this.conflicts.filter(c =>
      !resolutions.some(r => r.conflictId === c.id)
    )

    return resolutions
  }

  /**
   * Attempt to resolve a specific conflict
   */
  attemptResolution(conflict) {
    switch (conflict.type) {
      case this.CONFLICT_TYPES.MULTIPLE_SAME_TYPE:
        return this.resolveMultipleSameType(conflict)

      case this.CONFLICT_TYPES.BREAKPOINT_MISMATCH:
        return this.resolveBreakpointMismatch(conflict)

      case this.CONFLICT_TYPES.VISIBILITY_CONFLICT:
        return this.resolveVisibilityConflict(conflict)

      default:
        return null
    }
  }

  /**
   * Resolve multiple same type conflict
   */
  resolveMultipleSameType(conflict) {
    const components = conflict.affectedComponents
    if (components.length <= 1) return null

    // Keep the most recently registered component
    const mostRecent = components.reduce((latest, current) =>
      current.registeredAt > latest.registeredAt ? current : latest
    )

    // Remove older components
    const toRemove = components.filter(c => c.id !== mostRecent.id)
    toRemove.forEach(component => {
      this.unregisterComponent(component.id)
    })

    return {
      conflictId: conflict.id,
      type: 'multiple_same_type_resolved',
      action: 'removed_older_components',
      kept: mostRecent.id,
      removed: toRemove.map(c => c.id)
    }
  }

  /**
   * Resolve breakpoint mismatch
   */
  resolveBreakpointMismatch(conflict) {
    const currentWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const expectedType = currentWidth >= 1024 ? 'desktop' : 'mobile'

    // This would typically trigger a navigation type switch
    // For now, just log the recommended action
    return {
      conflictId: conflict.id,
      type: 'breakpoint_mismatch_detected',
      action: 'switch_navigation_type_recommended',
      recommendedType: expectedType,
      currentWidth
    }
  }

  /**
   * Resolve visibility conflict
   */
  resolveVisibilityConflict(conflict) {
    if (typeof window === 'undefined') return null

    const currentWidth = window.innerWidth
    const expectedType = currentWidth >= 1024 ? 'desktop' : 'mobile'

    // Hide components that don't match current breakpoint
    const toHide = conflict.affectedComponents.filter(c => c.type !== expectedType)

    toHide.forEach(component => {
      const element = document.getElementById(component.id)
      if (element) {
        element.style.display = 'none'
      }
    })

    return {
      conflictId: conflict.id,
      type: 'visibility_conflict_resolved',
      action: 'hid_mismatched_components',
      hidden: toHide.map(c => c.id),
      expectedType
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      activeComponents: this.activeComponents || [],
      conflicts: this.conflicts || [],
      hasConflicts: (this.conflicts || []).length > 0,
      conflictCount: (this.conflicts || []).length,
      lastCheck: this.lastCheck,
      componentCount: (this.activeComponents || []).length
    }
  }

  /**
   * Reset detector state
   */
  reset() {
    this.activeComponents = []
    this.conflicts = []
    this.lastCheck = Date.now()
  }

  /**
   * Enable/disable conflict detection
   */
  setEnabled(enabled) {
    this.isEnabled = enabled

    if (!enabled) {
      this.conflicts = []
    }
  }

  /**
   * Get conflicts by type
   */
  getConflictsByType(type) {
    return (this.conflicts || []).filter(c => c.type === type)
  }

  /**
   * Get conflicts by severity
   */
  getConflictsBySeverity(severity) {
    return (this.conflicts || []).filter(c => c.severity === severity)
  }

  /**
   * Get component by ID
   */
  getComponent(id) {
    return (this.activeComponents || []).find(c => c.id === id)
  }

  /**
   * Get components by type
   */
  getComponentsByType(type) {
    return (this.activeComponents || []).filter(c => c.type === type)
  }
}

// Create singleton instance
const conflictDetector = new NavigationConflictDetector()

export { conflictDetector }
export default NavigationConflictDetector