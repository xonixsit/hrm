import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { conflictDetector } from '@/services/NavigationConflictDetector.js'

describe('NavigationConflictDetector', () => {
  beforeEach(() => {
    // Reset the conflict detector before each test
    conflictDetector.reset()
    conflictDetector.setMonitoring(true)
    
    // Mock DOM methods
    global.document = {
      querySelectorAll: vi.fn(() => []),
      body: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }
    }
    
    global.window = {
      innerWidth: 1024,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      location: {
        href: 'http://localhost/dashboard',
        pathname: '/dashboard',
        search: '',
        hash: ''
      }
    }
    
    global.navigator = {
      userAgent: 'test-agent'
    }
  })
  
  afterEach(() => {
    conflictDetector.reset()
  })
  
  describe('Component Registration', () => {
    it('should register navigation components', () => {
      const componentId = 'test-desktop-nav'
      const componentInfo = conflictDetector.registerComponent(
        componentId, 
        'desktop', 
        { route: '/dashboard' }
      )
      
      expect(componentInfo).toBeDefined()
      expect(componentInfo.id).toBe(componentId)
      expect(componentInfo.type).toBe('desktop')
      expect(componentInfo.metadata.route).toBe('/dashboard')
      
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      expect(status.activeComponents[0].id).toBe(componentId)
    })
    
    it('should unregister navigation components', () => {
      const componentId = 'test-mobile-nav'
      conflictDetector.registerComponent(componentId, 'mobile')
      
      let status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      
      conflictDetector.unregisterComponent(componentId)
      
      status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(0)
    })
  })
  
  describe('Conflict Detection', () => {
    it('should detect multiple desktop components', () => {
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('multiple_desktop')
      expect(conflicts[0].severity).toBe('critical')
    })
    
    it('should detect multiple mobile components', () => {
      conflictDetector.registerComponent('mobile-1', 'mobile')
      conflictDetector.registerComponent('mobile-2', 'mobile')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts.length).toBeGreaterThan(0)
      const mobileConflict = conflicts.find(c => c.type === 'multiple_mobile')
      expect(mobileConflict).toBeDefined()
      expect(mobileConflict.severity).toBe('critical')
    })
    
    it('should detect simultaneous desktop and mobile rendering', () => {
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('simultaneous_render')
      expect(conflicts[0].severity).toBe('high')
    })
    
    it('should detect component leaks', () => {
      // Register a component with old timestamp
      const oldTimestamp = Date.now() - 35000 // 35 seconds ago
      const componentInfo = conflictDetector.registerComponent('old-nav', 'desktop')
      componentInfo.registeredAt = oldTimestamp
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('component_leak')
      expect(conflicts[0].severity).toBe('medium')
    })
    
    it('should detect breakpoint conflicts', () => {
      // Set window width to mobile size
      global.window.innerWidth = 800
      
      // Register desktop component (should be mobile)
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('breakpoint_conflict')
      expect(conflicts[0].severity).toBe('high')
    })
    
    it('should not detect conflicts when components are appropriate', () => {
      // Desktop width with desktop component
      global.window.innerWidth = 1200
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts).toHaveLength(0)
      
      // Reset and test mobile
      conflictDetector.reset()
      global.window.innerWidth = 800
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const conflicts2 = conflictDetector.detectConflicts()
      expect(conflicts2).toHaveLength(0)
    })
  })
  
  describe('Conflict Resolution', () => {
    it('should resolve multiple desktop component conflicts', () => {
      const comp1 = conflictDetector.registerComponent('desktop-1', 'desktop')
      const comp2 = conflictDetector.registerComponent('desktop-2', 'desktop')
      
      // Make comp2 more recent
      comp2.registeredAt = comp1.registeredAt + 1000
      
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts).toHaveLength(1)
      
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      expect(resolutions[0].description).toContain('Remove duplicate desktop')
      
      // Check that older component was removed
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      expect(status.activeComponents[0].id).toBe('desktop-2')
    })
    
    it('should resolve simultaneous render conflicts based on breakpoint', () => {
      global.window.innerWidth = 1200 // Desktop size
      
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts).toHaveLength(1)
      
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      // Mobile component should be removed
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(1)
      expect(status.activeComponents[0].type).toBe('desktop')
    })
    
    it('should clean up stale components', () => {
      const oldComponent = conflictDetector.registerComponent('old-nav', 'desktop')
      oldComponent.registeredAt = Date.now() - 35000
      
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('component_leak')
      
      const resolutions = conflictDetector.resolveConflicts()
      expect(resolutions).toHaveLength(1)
      
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(0)
    })
  })
  
  describe('Status and Monitoring', () => {
    it('should provide accurate status information', () => {
      conflictDetector.registerComponent('desktop-nav', 'desktop')
      conflictDetector.registerComponent('mobile-nav', 'mobile')
      
      const status = conflictDetector.getStatus()
      
      expect(status.hasConflicts).toBe(true)
      expect(status.conflictCount).toBe(1)
      expect(status.activeComponentCount).toBe(2)
      expect(status.monitoringEnabled).toBe(true)
      expect(status.conflicts).toHaveLength(1)
      expect(status.activeComponents).toHaveLength(2)
    })
    
    it('should track conflict history', () => {
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      conflictDetector.detectConflicts()
      
      expect(conflictDetector.conflictHistory.value.length).toBeGreaterThan(0)
      
      const historyEntry = conflictDetector.conflictHistory.value[0]
      expect(historyEntry.conflicts.length).toBeGreaterThan(0)
      expect(historyEntry.activeComponents).toHaveLength(2)
    })
    
    it('should enable/disable monitoring', () => {
      conflictDetector.setMonitoring(false)
      
      conflictDetector.registerComponent('desktop-1', 'desktop')
      conflictDetector.registerComponent('desktop-2', 'desktop')
      
      const conflicts = conflictDetector.detectConflicts()
      expect(conflicts || []).toHaveLength(0) // No conflicts detected when monitoring disabled
      
      conflictDetector.setMonitoring(true)
      const conflicts2 = conflictDetector.detectConflicts()
      expect(conflicts2.length).toBeGreaterThan(0) // Conflicts detected when monitoring enabled
    })
  })
  
  describe('Force Unregistration', () => {
    it('should force unregister components and hide DOM elements', () => {
      const componentId = 'test-component'
      
      // Mock DOM element
      const mockElement = {
        style: {},
        setAttribute: vi.fn()
      }
      
      global.document.querySelector = vi.fn(() => mockElement)
      
      conflictDetector.registerComponent(componentId, 'desktop')
      conflictDetector.forceUnregisterComponent(componentId)
      
      expect(mockElement.style.display).toBe('none')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-conflict-hidden', 'true')
      expect(global.window.dispatchEvent).toHaveBeenCalled()
      
      const status = conflictDetector.getStatus()
      expect(status.activeComponentCount).toBe(0)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle errors gracefully during conflict detection', () => {
      // Mock a component that causes an error
      const badComponent = {
        id: 'bad-component',
        type: null, // This should cause an error
        registeredAt: Date.now()
      }
      
      conflictDetector.activeComponents.value.set('bad-component', badComponent)
      
      // Should not throw an error
      expect(() => {
        conflictDetector.detectConflicts()
      }).not.toThrow()
    })
    
    it('should handle missing DOM elements during force unregistration', () => {
      global.document.querySelector = vi.fn(() => null)
      
      // Should not throw an error
      expect(() => {
        conflictDetector.forceUnregisterComponent('non-existent')
      }).not.toThrow()
    })
  })
  
  describe('Performance', () => {
    it('should handle large numbers of components efficiently', () => {
      const startTime = performance.now()
      
      // Register many components
      for (let i = 0; i < 100; i++) {
        conflictDetector.registerComponent(`component-${i}`, i % 2 === 0 ? 'desktop' : 'mobile')
      }
      
      // Detect conflicts
      const conflicts = conflictDetector.detectConflicts()
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (less than 500ms)
      expect(duration).toBeLessThan(500)
      
      // Should detect conflicts for multiple components of same type
      expect(conflicts.length).toBeGreaterThan(0)
    })
    
    it('should limit conflict history size', () => {
      // Generate many conflicts to test history limit
      for (let i = 0; i < 150; i++) {
        conflictDetector.registerComponent(`desktop-${i}-1`, 'desktop')
        conflictDetector.registerComponent(`desktop-${i}-2`, 'desktop')
        conflictDetector.detectConflicts()
        conflictDetector.reset()
      }
      
      // History should be limited to maxHistorySize (100)
      expect(conflictDetector.conflictHistory.value.length).toBeLessThanOrEqual(100)
    })
  })
})