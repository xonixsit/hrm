import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLoadingState, globalLoadingState } from '@/composables/useLoadingState.js'

describe('useLoadingState', () => {
  let loadingState

  beforeEach(() => {
    loadingState = useLoadingState()
    // Clear global state
    globalLoadingState.clearAllLoading()
  })

  afterEach(() => {
    loadingState.clearAllLoading()
    globalLoadingState.clearAllLoading()
  })

  describe('Basic Loading State Management', () => {
    it('starts and stops loading correctly', () => {
      expect(loadingState.isLoading.value).toBe(false)

      loadingState.startLoading('test')
      expect(loadingState.isLoading.value).toBe(true)
      expect(loadingState.hasSpecificLoading.value('test')).toBe(true)

      loadingState.stopLoading('test')
      expect(loadingState.isLoading.value).toBe(false)
      expect(loadingState.hasSpecificLoading.value('test')).toBe(false)
    })

    it('handles multiple concurrent loading states', () => {
      loadingState.startLoading('operation1')
      loadingState.startLoading('operation2')
      loadingState.startLoading('operation3')

      expect(loadingState.isLoading.value).toBe(true)
      expect(loadingState.loadingCount.value).toBe(3)
      expect(loadingState.loadingKeys.value).toEqual(['operation1', 'operation2', 'operation3'])

      loadingState.stopLoading('operation2')
      expect(loadingState.loadingCount.value).toBe(2)
      expect(loadingState.hasSpecificLoading.value('operation2')).toBe(false)
      expect(loadingState.hasSpecificLoading.value('operation1')).toBe(true)
      expect(loadingState.hasSpecificLoading.value('operation3')).toBe(true)
    })

    it('returns loading state information', () => {
      const options = {
        message: 'Loading data...',
        progress: { current: 0, total: 100 }
      }

      const state = loadingState.startLoading('test', options)
      
      expect(state.key).toBe('test')
      expect(state.message).toBe('Loading data...')
      expect(state.progress).toEqual({ current: 0, total: 100 })
      expect(state.startTime).toBeTypeOf('number')
    })

    it('updates loading state correctly', () => {
      loadingState.startLoading('test', { message: 'Initial message' })
      
      const updatedState = loadingState.updateLoading('test', { 
        message: 'Updated message',
        progress: { current: 50, total: 100 }
      })

      expect(updatedState.message).toBe('Updated message')
      expect(updatedState.progress).toEqual({ current: 50, total: 100 })
    })

    it('gets loading state by key', () => {
      const options = { message: 'Test loading' }
      loadingState.startLoading('test', options)

      const state = loadingState.getLoadingState('test')
      expect(state.key).toBe('test')
      expect(state.message).toBe('Test loading')

      const nonExistentState = loadingState.getLoadingState('nonexistent')
      expect(nonExistentState).toBeNull()
    })
  })

  describe('Global Loading State', () => {
    it('manages global loading state', () => {
      expect(loadingState.globalLoading.value).toBe(false)

      loadingState.setGlobalLoading(true, 'Global loading...')
      expect(loadingState.globalLoading.value).toBe(true)
      expect(loadingState.isLoading.value).toBe(true)

      loadingState.setGlobalLoading(false)
      expect(loadingState.globalLoading.value).toBe(false)
    })

    it('global loading affects overall loading state', () => {
      loadingState.setGlobalLoading(true)
      expect(loadingState.isLoading.value).toBe(true)

      // Even with specific loading stopped, global loading keeps it active
      loadingState.startLoading('specific')
      loadingState.stopLoading('specific')
      expect(loadingState.isLoading.value).toBe(true)

      loadingState.setGlobalLoading(false)
      expect(loadingState.isLoading.value).toBe(false)
    })
  })

  describe('Utility Methods', () => {
    it('withLoading wraps async operations', async () => {
      const asyncOperation = vi.fn().mockResolvedValue('success')

      expect(loadingState.isLoading.value).toBe(false)

      const result = await loadingState.withLoading('test', asyncOperation)

      expect(result).toBe('success')
      expect(asyncOperation).toHaveBeenCalled()
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('withLoading handles errors correctly', async () => {
      const asyncOperation = vi.fn().mockRejectedValue(new Error('Test error'))

      await expect(
        loadingState.withLoading('test', asyncOperation)
      ).rejects.toThrow('Test error')

      expect(loadingState.isLoading.value).toBe(false)
    })

    it('withGlobalLoading manages global state', async () => {
      const asyncOperation = vi.fn().mockResolvedValue('success')

      const result = await loadingState.withGlobalLoading(asyncOperation, 'Processing...')

      expect(result).toBe('success')
      expect(loadingState.globalLoading.value).toBe(false)
    })

    it('clearAllLoading removes all loading states', () => {
      loadingState.startLoading('test1')
      loadingState.startLoading('test2')
      loadingState.setGlobalLoading(true)

      expect(loadingState.loadingCount.value).toBe(3) // test1, test2, global
      expect(loadingState.globalLoading.value).toBe(true)

      loadingState.clearAllLoading()

      expect(loadingState.loadingCount.value).toBe(0)
      expect(loadingState.globalLoading.value).toBe(false)
      expect(loadingState.isLoading.value).toBe(false)
    })
  })

  describe('Progress Tracking', () => {
    it('creates and manages progress tracker', () => {
      const tracker = loadingState.createProgressTracker('upload', 100, {
        message: 'Uploading files...'
      })

      expect(loadingState.hasSpecificLoading.value('upload')).toBe(true)

      const progress = tracker.updateProgress(25, 'Uploading file 1...')
      expect(progress.current).toBe(25)
      expect(progress.percentage).toBe(25)
      expect(progress.estimatedTime).toBeTypeOf('number')

      tracker.updateProgress(50)
      expect(tracker.getProgress().current).toBe(50)
      expect(tracker.getProgress().percentage).toBe(50)

      tracker.completeProgress()
      expect(tracker.getProgress().current).toBe(100)
      expect(tracker.getProgress().percentage).toBe(100)
      expect(loadingState.hasSpecificLoading.value('upload')).toBe(false)
    })

    it('calculates estimated time correctly', () => {
      const tracker = loadingState.createProgressTracker('test', 100)
      
      // Mock time progression
      const originalNow = Date.now
      let mockTime = 1000
      Date.now = vi.fn(() => mockTime)

      tracker.updateProgress(25)
      mockTime += 1000 // 1 second later
      Date.now = vi.fn(() => mockTime)
      
      tracker.updateProgress(50)
      const progress = tracker.getProgress()
      
      expect(progress.estimatedTime).toBeTypeOf('number')
      expect(progress.estimatedTime).toBeGreaterThan(0)

      // Restore original Date.now
      Date.now = originalNow
    })

    it('prevents progress from exceeding total', () => {
      const tracker = loadingState.createProgressTracker('test', 100)
      
      tracker.updateProgress(150) // Exceeds total
      expect(tracker.getProgress().current).toBe(100)
      expect(tracker.getProgress().percentage).toBe(100)
    })
  })

  describe('Debounced Loading', () => {
    it('creates debounced loading controller', async () => {
      vi.useFakeTimers()
      
      const debounced = loadingState.debouncedLoading('test', 300)
      
      debounced.start({ message: 'Debounced loading' })
      expect(loadingState.hasSpecificLoading.value('test')).toBe(false)
      
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(loadingState.hasSpecificLoading.value('test')).toBe(true)
      
      debounced.stop()
      expect(loadingState.hasSpecificLoading.value('test')).toBe(false)
      
      vi.useRealTimers()
    })

    it('cancels debounced loading when stopped early', async () => {
      vi.useFakeTimers()
      
      const debounced = loadingState.debouncedLoading('test', 300)
      
      debounced.start()
      vi.advanceTimersByTime(100)
      debounced.stop() // Stop before delay completes
      
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(loadingState.hasSpecificLoading.value('test')).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('Cancellation', () => {
    it('cancels loading when cancelable', () => {
      const onCancel = vi.fn()
      
      loadingState.startLoading('test', {
        cancelable: true,
        onCancel
      })

      const cancelled = loadingState.cancelLoading('test')
      expect(cancelled).toBe(true)
      expect(onCancel).toHaveBeenCalled()
      expect(loadingState.hasSpecificLoading.value('test')).toBe(false)
    })

    it('does not cancel non-cancelable loading', () => {
      loadingState.startLoading('test', { cancelable: false })

      const cancelled = loadingState.cancelLoading('test')
      expect(cancelled).toBe(false)
      expect(loadingState.hasSpecificLoading.value('test')).toBe(true)
    })

    it('handles cancellation of non-existent loading', () => {
      const cancelled = loadingState.cancelLoading('nonexistent')
      expect(cancelled).toBe(false)
    })
  })

  describe('Event Callbacks', () => {
    it('calls onStart callback when loading starts', () => {
      const onStart = vi.fn()
      
      loadingState.startLoading('test', { onStart })
      
      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          startTime: expect.any(Number)
        })
      )
    })

    it('calls onComplete callback when loading stops', () => {
      const onComplete = vi.fn()
      
      loadingState.startLoading('test')
      loadingState.stopLoading('test', { onComplete })
      
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          duration: expect.any(Number)
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('handles stopping non-existent loading gracefully', () => {
      const result = loadingState.stopLoading('nonexistent')
      expect(result).toBeNull()
      expect(loadingState.isLoading.value).toBe(false)
    })

    it('handles updating non-existent loading gracefully', () => {
      const result = loadingState.updateLoading('nonexistent', { message: 'test' })
      expect(result).toBeNull()
    })

    it('handles duplicate loading keys', () => {
      loadingState.startLoading('test', { message: 'First' })
      loadingState.startLoading('test', { message: 'Second' })

      const state = loadingState.getLoadingState('test')
      expect(state.message).toBe('Second') // Should overwrite
      expect(loadingState.loadingCount.value).toBe(1) // Should not duplicate
    })
  })

  describe('Global Loading State Instance', () => {
    it('provides global instance', () => {
      expect(globalLoadingState).toBeDefined()
      expect(typeof globalLoadingState.startLoading).toBe('function')
      expect(typeof globalLoadingState.stopLoading).toBe('function')
    })

    it('global instance works independently', () => {
      globalLoadingState.startLoading('global-test')
      expect(globalLoadingState.hasSpecificLoading.value('global-test')).toBe(true)
      expect(loadingState.hasSpecificLoading.value('global-test')).toBe(false)

      globalLoadingState.stopLoading('global-test')
      expect(globalLoadingState.hasSpecificLoading.value('global-test')).toBe(false)
    })
  })

  describe('Performance', () => {
    it('handles many concurrent loading states efficiently', () => {
      const startTime = performance.now()
      
      // Create many loading states
      for (let i = 0; i < 1000; i++) {
        loadingState.startLoading(`test-${i}`)
      }
      
      expect(loadingState.loadingCount.value).toBe(1000)
      
      // Stop all loading states
      for (let i = 0; i < 1000; i++) {
        loadingState.stopLoading(`test-${i}`)
      }
      
      expect(loadingState.loadingCount.value).toBe(0)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
    })

    it('reactive updates are efficient', async () => {
      const startTime = performance.now()
      
      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        loadingState.startLoading(`test-${i}`)
        await nextTick()
        loadingState.stopLoading(`test-${i}`)
        await nextTick()
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should be reasonably fast
      expect(loadingState.loadingCount.value).toBe(0)
    })
  })
})