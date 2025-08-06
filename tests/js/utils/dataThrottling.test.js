import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  throttle,
  debounce,
  rafThrottle,
  reduceDataPoints,
  SlidingWindow,
  DataAggregator,
  PerformanceMonitor,
  AdaptiveQualityManager,
  createThrottledUpdater
} from '@/utils/dataThrottling';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

describe('Data Throttling Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('throttle', () => {
    it('limits function execution rate', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times rapidly
      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');

      // Should only execute once immediately
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');

      // Advance time and call again
      vi.advanceTimersByTime(100);
      throttledFn('call4');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('call4');
    });

    it('preserves function context', () => {
      const context = { value: 'test' };
      const mockFn = vi.fn(function() {
        return this.value;
      });
      const throttledFn = throttle(mockFn, 100);

      throttledFn.call(context);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Should not execute immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Should execute after delay
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('resets delay on subsequent calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('call1');
      vi.advanceTimersByTime(50);
      debouncedFn('call2');
      vi.advanceTimersByTime(50);

      // Should not have executed yet
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call2');
    });
  });

  describe('rafThrottle', () => {
    it('throttles using requestAnimationFrame', () => {
      const mockFn = vi.fn();
      const rafThrottledFn = rafThrottle(mockFn);

      rafThrottledFn('call1');
      rafThrottledFn('call2');
      rafThrottledFn('call3');

      // Should not execute immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Should execute on next animation frame
      vi.advanceTimersByTime(16);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });
  });

  describe('reduceDataPoints', () => {
    it('reduces large datasets while preserving shape', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 50) * 100,
        label: `Point ${i}`
      }));

      const reduced = reduceDataPoints(largeData, 100);

      expect(reduced.length).toBeLessThanOrEqual(100);
      expect(reduced[0]).toEqual(largeData[0]); // First point preserved
      expect(reduced[reduced.length - 1]).toEqual(largeData[largeData.length - 1]); // Last point preserved
    });

    it('returns original data if already small enough', () => {
      const smallData = [
        { x: 0, y: 10 },
        { x: 1, y: 20 },
        { x: 2, y: 15 }
      ];

      const result = reduceDataPoints(smallData, 100);
      expect(result).toEqual(smallData);
    });

    it('handles empty or null data', () => {
      expect(reduceDataPoints([], 100)).toEqual([]);
      expect(reduceDataPoints(null, 100)).toBeNull();
      expect(reduceDataPoints(undefined, 100)).toBeUndefined();
    });

    it('uses custom keys for x and y values', () => {
      const data = [
        { time: 0, value: 10 },
        { time: 1, value: 20 },
        { time: 2, value: 15 }
      ];

      const result = reduceDataPoints(data, 2, 'time', 'value');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(data[0]);
      expect(result[1]).toEqual(data[2]);
    });
  });

  describe('SlidingWindow', () => {
    let window;

    beforeEach(() => {
      window = new SlidingWindow(5);
    });

    it('maintains maximum size', () => {
      for (let i = 0; i < 10; i++) {
        window.add(i);
      }

      expect(window.size()).toBe(5);
      expect(window.getData()).toEqual([5, 6, 7, 8, 9]);
    });

    it('adds single data points', () => {
      window.add(1);
      window.add(2);
      window.add(3);

      expect(window.getData()).toEqual([1, 2, 3]);
      expect(window.size()).toBe(3);
    });

    it('adds arrays of data points', () => {
      window.add([1, 2, 3]);
      window.add([4, 5]);

      expect(window.getData()).toEqual([1, 2, 3, 4, 5]);
      expect(window.size()).toBe(5);
    });

    it('detects when window is full', () => {
      expect(window.isFull()).toBe(false);

      for (let i = 0; i < 5; i++) {
        window.add(i);
      }

      expect(window.isFull()).toBe(true);
    });

    it('clears all data', () => {
      window.add([1, 2, 3, 4, 5]);
      expect(window.size()).toBe(5);

      window.clear();
      expect(window.size()).toBe(0);
      expect(window.getData()).toEqual([]);
    });
  });

  describe('DataAggregator', () => {
    let aggregator;

    beforeEach(() => {
      aggregator = new DataAggregator(100);
    });

    afterEach(() => {
      aggregator.clear();
    });

    it('aggregates data over time interval', () => {
      const callback = vi.fn();
      aggregator.subscribe(callback);

      aggregator.add('data1');
      aggregator.add('data2');
      aggregator.add('data3');

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(['data1', 'data2', 'data3']);
    });

    it('supports multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      aggregator.subscribe(callback1);
      aggregator.subscribe(callback2);

      aggregator.add('test');
      vi.advanceTimersByTime(100);

      expect(callback1).toHaveBeenCalledWith(['test']);
      expect(callback2).toHaveBeenCalledWith(['test']);
    });

    it('allows unsubscribing', () => {
      const callback = vi.fn();
      const unsubscribe = aggregator.subscribe(callback);

      unsubscribe();
      aggregator.add('test');
      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
    });

    it('handles callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = vi.fn();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      aggregator.subscribe(errorCallback);
      aggregator.subscribe(normalCallback);

      aggregator.add('test');
      vi.advanceTimersByTime(100);

      expect(consoleSpy).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('flushes data immediately when requested', () => {
      const callback = vi.fn();
      aggregator.subscribe(callback);

      aggregator.add('data1');
      aggregator.add('data2');

      aggregator.flush();
      expect(callback).toHaveBeenCalledWith(['data1', 'data2']);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor(10);
    });

    it('tracks timing samples', () => {
      const endTiming = monitor.startTiming();
      
      // Simulate some work
      vi.advanceTimersByTime(50);
      
      const duration = endTiming();
      expect(duration).toBeGreaterThan(0);

      const stats = monitor.getStats();
      expect(stats.count).toBe(1);
      expect(stats.average).toBeGreaterThan(0);
    });

    it('maintains sample size limit', () => {
      // Add more samples than the limit
      for (let i = 0; i < 20; i++) {
        monitor.addSample(10 + i);
      }

      const stats = monitor.getStats();
      expect(stats.count).toBe(10);
    });

    it('calculates correct statistics', () => {
      const samples = [10, 20, 30, 40, 50];
      samples.forEach(sample => monitor.addSample(sample));

      const stats = monitor.getStats();
      expect(stats.average).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.count).toBe(5);
      expect(stats.fps).toBeCloseTo(33.33, 0);
    });

    it('checks performance acceptability', () => {
      monitor.addSample(10); // Good performance
      expect(monitor.isPerformanceAcceptable(16.67)).toBe(true);

      monitor.addSample(50); // Poor performance
      expect(monitor.isPerformanceAcceptable(16.67)).toBe(false);
    });

    it('resets performance data', () => {
      monitor.addSample(10);
      monitor.addSample(20);

      expect(monitor.getStats().count).toBe(2);

      monitor.reset();
      expect(monitor.getStats().count).toBe(0);
    });

    it('handles empty samples', () => {
      const stats = monitor.getStats();
      expect(stats.average).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.count).toBe(0);
      expect(stats.fps).toBe(0);
    });
  });

  describe('AdaptiveQualityManager', () => {
    let qualityManager;

    beforeEach(() => {
      qualityManager = new AdaptiveQualityManager({
        targetFPS: 60,
        minFPS: 30,
        maxDataPoints: 1000,
        minDataPoints: 100
      });
    });

    it('starts with high quality', () => {
      expect(qualityManager.getQuality()).toBe('high');
    });

    it('reduces quality when performance is poor', () => {
      // Simulate poor performance (33ms per frame = 30fps)
      for (let i = 0; i < 50; i++) {
        qualityManager.updatePerformance(33);
      }

      expect(qualityManager.getQuality()).toBe('medium');
    });

    it('increases quality when performance improves', () => {
      // First reduce quality
      for (let i = 0; i < 50; i++) {
        qualityManager.updatePerformance(50); // Very poor performance
      }
      expect(qualityManager.getQuality()).toBe('low');

      // Reset cooldown and improve performance
      qualityManager.adjustmentCooldown = 0;
      for (let i = 0; i < 50; i++) {
        qualityManager.updatePerformance(10); // Good performance
      }

      expect(qualityManager.getQuality()).toBe('medium');
    });

    it('provides quality-based rendering options', () => {
      const highOptions = qualityManager.getRenderingOptions();
      expect(highOptions.showGrid).toBe(true);
      expect(highOptions.showPoints).toBe(true);

      // Force to low quality
      qualityManager.currentQuality = 'low';
      const lowOptions = qualityManager.getRenderingOptions();
      expect(lowOptions.showGrid).toBe(false);
      expect(lowOptions.showPoints).toBe(false);
    });

    it('recommends data points based on quality', () => {
      const highDataPoints = qualityManager.getRecommendedDataPoints();
      expect(highDataPoints).toBe(1000);

      qualityManager.currentQuality = 'medium';
      const mediumDataPoints = qualityManager.getRecommendedDataPoints();
      expect(mediumDataPoints).toBe(550);

      qualityManager.currentQuality = 'low';
      const lowDataPoints = qualityManager.getRecommendedDataPoints();
      expect(lowDataPoints).toBe(100);
    });

    it('respects adjustment cooldown', () => {
      const initialQuality = qualityManager.getQuality();
      
      // Poor performance, but should not adjust immediately due to cooldown
      qualityManager.updatePerformance(50);
      expect(qualityManager.getQuality()).toBe(initialQuality);

      // After cooldown period
      for (let i = 0; i < 30; i++) {
        qualityManager.updatePerformance(50);
      }
      expect(qualityManager.getQuality()).toBe('medium');
    });

    it('resets to high quality', () => {
      qualityManager.currentQuality = 'low';
      qualityManager.reset();

      expect(qualityManager.getQuality()).toBe('high');
    });
  });

  describe('createThrottledUpdater', () => {
    it('creates RAF throttled updater by default', () => {
      const mockFn = vi.fn();
      const throttledUpdater = createThrottledUpdater(mockFn);

      throttledUpdater('test1');
      throttledUpdater('test2');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(16);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');
    });

    it('creates time-based throttled updater when RAF disabled', () => {
      const mockFn = vi.fn();
      const throttledUpdater = createThrottledUpdater(mockFn, {
        useRAF: false,
        throttleMs: 100
      });

      throttledUpdater('test1');
      throttledUpdater('test2');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');

      vi.advanceTimersByTime(100);
      throttledUpdater('test3');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('test3');
    });

    it('creates aggregating updater when enabled', () => {
      const mockFn = vi.fn();
      const throttledUpdater = createThrottledUpdater(mockFn, {
        aggregateUpdates: true,
        throttleMs: 100
      });

      throttledUpdater('test1');
      throttledUpdater('test2');
      throttledUpdater('test3');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2', 'test3']);
    });
  });

  describe('Integration Tests', () => {
    it('combines multiple utilities for optimal performance', () => {
      const slidingWindow = new SlidingWindow(100);
      const performanceMonitor = new PerformanceMonitor();
      const qualityManager = new AdaptiveQualityManager();

      // Simulate data processing pipeline
      const processData = (newData) => {
        const endTiming = performanceMonitor.startTiming();
        
        slidingWindow.add(newData);
        const currentData = slidingWindow.getData();
        
        const recommendedPoints = qualityManager.getRecommendedDataPoints();
        const optimizedData = reduceDataPoints(currentData, recommendedPoints);
        
        const duration = endTiming();
        qualityManager.updatePerformance(duration);
        
        return optimizedData;
      };

      // Process data and verify optimization
      for (let i = 0; i < 200; i++) {
        const newPoint = { x: i, y: Math.random() * 100 };
        const result = processData(newPoint);
        
        expect(result.length).toBeLessThanOrEqual(qualityManager.getRecommendedDataPoints());
      }

      const stats = performanceMonitor.getStats();
      expect(stats.count).toBeGreaterThan(0);
    });

    it('handles real-time data stream efficiently', () => {
      const dataAggregator = new DataAggregator(50);
      const slidingWindow = new SlidingWindow(500);
      const results = [];

      dataAggregator.subscribe((aggregatedData) => {
        aggregatedData.forEach(data => slidingWindow.add(data));
        results.push(slidingWindow.getData().length);
      });

      // Simulate high-frequency data stream
      for (let i = 0; i < 1000; i++) {
        dataAggregator.add({ x: i, y: Math.random() * 100 });
      }

      // Flush remaining data
      dataAggregator.flush();

      expect(results.length).toBeGreaterThan(0);
      expect(slidingWindow.size()).toBeLessThanOrEqual(500);
    });
  });
});