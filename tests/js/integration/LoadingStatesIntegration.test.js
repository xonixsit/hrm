import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useLoadingState } from '@/composables/useLoadingState.js'

describe('Loading States Integration', () => {
  let loadingState

  beforeEach(() => {
    loadingState = useLoadingState()
  })

  afterEach(() => {
    loadingState.clearAllLoading()
  })

  describe('Loading State Management System', () => {
    it('manages multiple loading operations concurrently', () => {
      // Start multiple loading operations
      loadingState.startLoading('data-fetch', { message: 'Fetching data...' })
      loadingState.startLoading('file-upload', { 
        message: 'Uploading file...',
        progress: { current: 0, total: 100 }
      })
      loadingState.startLoading('form-submit', { message: 'Submitting form...' })

      expect(loadingState.isLoading.value).toBe(true)
      expect(loadingState.loadingCount.value).toBe(3)
      expect(loadingState.hasSpecificLoading.value('data-fetch')).toBe(true)
      expect(loadingState.hasSpecificLoading.value('file-upload')).toBe(true)
      expect(loadingState.hasSpecificLoading.value('form-submit')).toBe(true)

      // Stop one operation
      loadingState.stopLoading('data-fetch')
      expect(loadingState.loadingCount.value).toBe(2)
      expect(loadingState.isLoading.value).toBe(true)

      // Stop all remaining operations
      loadingState.stopLoading('file-upload')
      loadingState.stopLoading('form-submit')
      expect(loadingState.loadingCount.value).toBe(0)
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('handles progress tracking for file uploads', () => {
      const tracker = loadingState.createProgressTracker('file-upload', 1000, {
        message: 'Uploading large file...'
      })

      expect(loadingState.hasSpecificLoading.value('file-upload')).toBe(true)

      // Simulate upload progress
      tracker.updateProgress(250, 'Uploading... 25%')
      let progress = tracker.getProgress()
      expect(progress.current).toBe(250)
      expect(progress.percentage).toBe(25)

      tracker.updateProgress(500, 'Uploading... 50%')
      progress = tracker.getProgress()
      expect(progress.current).toBe(500)
      expect(progress.percentage).toBe(50)

      tracker.updateProgress(750, 'Uploading... 75%')
      progress = tracker.getProgress()
      expect(progress.current).toBe(750)
      expect(progress.percentage).toBe(75)

      tracker.completeProgress()
      progress = tracker.getProgress()
      expect(progress.current).toBe(1000)
      expect(progress.percentage).toBe(100)
      expect(loadingState.hasSpecificLoading.value('file-upload')).toBe(false)
    })

    it('supports debounced loading for rapid state changes', async () => {
      vi.useFakeTimers()
      
      const debounced = loadingState.debouncedLoading('search', 300)
      
      // Rapid start/stop calls (simulating user typing)
      debounced.start({ message: 'Searching...' })
      debounced.stop()
      debounced.start({ message: 'Searching...' })
      debounced.stop()
      debounced.start({ message: 'Searching...' })
      
      // Should not be loading yet due to debounce
      expect(loadingState.hasSpecificLoading.value('search')).toBe(false)
      
      // Advance time to trigger debounced loading
      vi.advanceTimersByTime(300)
      expect(loadingState.hasSpecificLoading.value('search')).toBe(true)
      
      debounced.stop()
      expect(loadingState.hasSpecificLoading.value('search')).toBe(false)
      
      vi.useRealTimers()
    })

    it('handles async operations with automatic loading management', async () => {
      const mockAsyncOperation = vi.fn().mockResolvedValue('success')
      
      expect(loadingState.isLoading.value).toBe(false)
      
      const result = await loadingState.withLoading('async-op', mockAsyncOperation, {
        message: 'Processing...'
      })
      
      expect(result).toBe('success')
      expect(mockAsyncOperation).toHaveBeenCalled()
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('handles async operation errors gracefully', async () => {
      const mockAsyncOperation = vi.fn().mockRejectedValue(new Error('Operation failed'))
      
      await expect(
        loadingState.withLoading('async-op', mockAsyncOperation)
      ).rejects.toThrow('Operation failed')
      
      // Loading should be stopped even after error
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('supports cancellable loading operations', () => {
      const onCancel = vi.fn()
      
      loadingState.startLoading('cancellable-op', {
        message: 'Long running operation...',
        cancelable: true,
        onCancel
      })
      
      expect(loadingState.hasSpecificLoading.value('cancellable-op')).toBe(true)
      
      const cancelled = loadingState.cancelLoading('cancellable-op')
      expect(cancelled).toBe(true)
      expect(onCancel).toHaveBeenCalled()
      expect(loadingState.hasSpecificLoading.value('cancellable-op')).toBe(false)
    })

    it('manages global loading state independently', () => {
      // Start specific loading
      loadingState.startLoading('specific-op')
      expect(loadingState.isLoading.value).toBe(true)
      
      // Start global loading
      loadingState.setGlobalLoading(true, 'Global operation...')
      expect(loadingState.globalLoading.value).toBe(true)
      expect(loadingState.isLoading.value).toBe(true)
      
      // Stop specific loading - should still be loading due to global
      loadingState.stopLoading('specific-op')
      expect(loadingState.isLoading.value).toBe(true)
      
      // Stop global loading
      loadingState.setGlobalLoading(false)
      expect(loadingState.globalLoading.value).toBe(false)
      expect(loadingState.isLoading.value).toBe(false)
    })
  })

  describe('Loading State Transitions', () => {
    it('provides smooth transitions between loading states', () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()
      
      // Start loading with callbacks
      loadingState.startLoading('transition-test', {
        message: 'Starting operation...',
        onStart
      })
      
      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'transition-test',
          message: 'Starting operation...',
          startTime: expect.any(Number)
        })
      )
      
      // Update loading state
      loadingState.updateLoading('transition-test', {
        message: 'Operation in progress...',
        progress: { current: 50, total: 100 }
      })
      
      const state = loadingState.getLoadingState('transition-test')
      expect(state.message).toBe('Operation in progress...')
      expect(state.progress).toEqual({ current: 50, total: 100 })
      
      // Complete loading
      loadingState.stopLoading('transition-test', { onComplete })
      
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'transition-test',
          duration: expect.any(Number)
        })
      )
    })

    it('handles rapid state changes without memory leaks', () => {
      const initialMemory = loadingState.loadingCount.value
      
      // Simulate rapid loading operations
      for (let i = 0; i < 100; i++) {
        loadingState.startLoading(`rapid-${i}`)
        loadingState.stopLoading(`rapid-${i}`)
      }
      
      expect(loadingState.loadingCount.value).toBe(initialMemory)
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('maintains loading state consistency during concurrent operations', () => {
      const operations = ['op1', 'op2', 'op3', 'op4', 'op5']
      
      // Start all operations
      operations.forEach(op => {
        loadingState.startLoading(op, { message: `Operation ${op}` })
      })
      
      expect(loadingState.loadingCount.value).toBe(5)
      expect(loadingState.isLoading.value).toBe(true)
      
      // Stop operations in different order
      loadingState.stopLoading('op3')
      loadingState.stopLoading('op1')
      loadingState.stopLoading('op5')
      
      expect(loadingState.loadingCount.value).toBe(2)
      expect(loadingState.isLoading.value).toBe(true)
      expect(loadingState.hasSpecificLoading.value('op2')).toBe(true)
      expect(loadingState.hasSpecificLoading.value('op4')).toBe(true)
      
      // Stop remaining operations
      loadingState.stopLoading('op2')
      loadingState.stopLoading('op4')
      
      expect(loadingState.loadingCount.value).toBe(0)
      expect(loadingState.isLoading.value).toBe(false)
    })
  })

  describe('User Feedback Integration', () => {
    it('provides comprehensive loading information for UI components', () => {
      loadingState.startLoading('ui-feedback', {
        message: 'Loading user data...',
        progress: { current: 0, total: 100 },
        estimatedTime: 30
      })
      
      const state = loadingState.getLoadingState('ui-feedback')
      
      expect(state).toEqual(
        expect.objectContaining({
          key: 'ui-feedback',
          message: 'Loading user data...',
          progress: { current: 0, total: 100 },
          estimatedTime: 30,
          startTime: expect.any(Number)
        })
      )
      
      // Update progress for UI feedback
      loadingState.updateLoading('ui-feedback', {
        progress: { current: 75, total: 100 },
        estimatedTime: 7.5
      })
      
      const updatedState = loadingState.getLoadingState('ui-feedback')
      expect(updatedState.progress.current).toBe(75)
      expect(updatedState.estimatedTime).toBe(7.5)
    })

    it('supports different loading patterns for various UI scenarios', () => {
      // Data table loading
      loadingState.startLoading('table-data', {
        message: 'Loading table data...',
        type: 'table'
      })
      
      // Form submission loading
      loadingState.startLoading('form-submit', {
        message: 'Submitting form...',
        type: 'form'
      })
      
      // File upload with progress
      const uploadTracker = loadingState.createProgressTracker('file-upload', 1000, {
        message: 'Uploading file...',
        type: 'upload'
      })
      
      expect(loadingState.loadingCount.value).toBe(3)
      
      // Each loading state should maintain its specific context
      expect(loadingState.getLoadingState('table-data').type).toBe('table')
      expect(loadingState.getLoadingState('form-submit').type).toBe('form')
      expect(loadingState.getLoadingState('file-upload').type).toBe('upload')
      
      // Clean up
      loadingState.stopLoading('table-data')
      loadingState.stopLoading('form-submit')
      uploadTracker.completeProgress()
      
      expect(loadingState.loadingCount.value).toBe(0)
    })
  })

  describe('Performance and Memory Management', () => {
    it('efficiently manages large numbers of loading states', () => {
      const startTime = performance.now()
      
      // Create many loading states
      for (let i = 0; i < 1000; i++) {
        loadingState.startLoading(`perf-test-${i}`, {
          message: `Operation ${i}`
        })
      }
      
      expect(loadingState.loadingCount.value).toBe(1000)
      
      // Stop all loading states
      for (let i = 0; i < 1000; i++) {
        loadingState.stopLoading(`perf-test-${i}`)
      }
      
      expect(loadingState.loadingCount.value).toBe(0)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
    })

    it('prevents memory leaks with proper cleanup', () => {
      // Create and destroy many loading states
      for (let i = 0; i < 50; i++) {
        loadingState.startLoading(`cleanup-test-${i}`)
        loadingState.updateLoading(`cleanup-test-${i}`, { 
          progress: { current: i, total: 50 }
        })
        loadingState.stopLoading(`cleanup-test-${i}`)
      }
      
      // All states should be cleaned up
      expect(loadingState.loadingCount.value).toBe(0)
      expect(loadingState.loadingKeys.value).toHaveLength(0)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles invalid loading operations gracefully', () => {
      // Try to stop non-existent loading
      const result = loadingState.stopLoading('non-existent')
      expect(result).toBeNull()
      
      // Try to update non-existent loading
      const updateResult = loadingState.updateLoading('non-existent', { message: 'test' })
      expect(updateResult).toBeNull()
      
      // Try to cancel non-existent loading
      const cancelResult = loadingState.cancelLoading('non-existent')
      expect(cancelResult).toBe(false)
      
      // System should remain stable
      expect(loadingState.isLoading.value).toBe(false)
      expect(loadingState.loadingCount.value).toBe(0)
    })

    it('handles duplicate loading keys correctly', () => {
      loadingState.startLoading('duplicate', { message: 'First' })
      expect(loadingState.getLoadingState('duplicate').message).toBe('First')
      
      // Starting with same key should overwrite
      loadingState.startLoading('duplicate', { message: 'Second' })
      expect(loadingState.getLoadingState('duplicate').message).toBe('Second')
      expect(loadingState.loadingCount.value).toBe(1) // Should not duplicate
      
      loadingState.stopLoading('duplicate')
      expect(loadingState.loadingCount.value).toBe(0)
    })

    it('maintains system stability during error conditions', () => {
      // Start some loading operations
      loadingState.startLoading('stable-1')
      loadingState.startLoading('stable-2')
      
      // Simulate error conditions
      try {
        throw new Error('Simulated error')
      } catch (error) {
        // Loading states should remain intact
        expect(loadingState.loadingCount.value).toBe(2)
        expect(loadingState.isLoading.value).toBe(true)
      }
      
      // System should still function normally
      loadingState.stopLoading('stable-1')
      expect(loadingState.loadingCount.value).toBe(1)
      
      loadingState.clearAllLoading()
      expect(loadingState.loadingCount.value).toBe(0)
    })
  })
})