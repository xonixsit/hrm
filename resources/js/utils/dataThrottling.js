/**
 * Data Throttling Utilities for Real-time Visualization Components
 * 
 * These utilities help manage high-frequency data updates to maintain
 * smooth performance in data visualization components.
 */

/**
 * Throttle function that limits the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function that delays function execution until after delay
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Request Animation Frame throttling for smooth animations
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF throttled function
 */
export function rafThrottle(func) {
  let rafId = null;
  return function(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}

/**
 * Data point reducer for large datasets
 * Reduces the number of data points while preserving the overall shape
 * @param {Array} data - Array of data points
 * @param {number} maxPoints - Maximum number of points to keep
 * @param {string} xKey - Key for x-axis values (default: 'x')
 * @param {string} yKey - Key for y-axis values (default: 'y')
 * @returns {Array} Reduced dataset
 */
export function reduceDataPoints(data, maxPoints, xKey = 'x', yKey = 'y') {
  if (!data || data.length <= maxPoints) {
    return data;
  }

  const step = Math.ceil(data.length / maxPoints);
  const reduced = [];

  // Always include first point
  if (data.length > 0) {
    reduced.push(data[0]);
  }

  // Sample points at regular intervals
  for (let i = step; i < data.length - step; i += step) {
    reduced.push(data[i]);
  }

  // Always include last point
  if (data.length > 1) {
    reduced.push(data[data.length - 1]);
  }

  return reduced;
}

/**
 * Sliding window data manager for real-time updates
 */
export class SlidingWindow {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.data = [];
  }

  /**
   * Add new data point(s) to the window
   * @param {*} newData - New data point or array of points
   */
  add(newData) {
    if (Array.isArray(newData)) {
      this.data.push(...newData);
    } else {
      this.data.push(newData);
    }

    // Remove excess data points from the beginning
    if (this.data.length > this.maxSize) {
      this.data = this.data.slice(this.data.length - this.maxSize);
    }
  }

  /**
   * Get current data in the window
   * @returns {Array} Current data
   */
  getData() {
    return [...this.data];
  }

  /**
   * Clear all data in the window
   */
  clear() {
    this.data = [];
  }

  /**
   * Get the size of current data
   * @returns {number} Current data size
   */
  size() {
    return this.data.length;
  }

  /**
   * Check if window is full
   * @returns {boolean} True if window is at max capacity
   */
  isFull() {
    return this.data.length >= this.maxSize;
  }
}

/**
 * Data aggregator for reducing update frequency
 */
export class DataAggregator {
  constructor(aggregationInterval = 100) {
    this.interval = aggregationInterval;
    this.pendingData = [];
    this.timeoutId = null;
    this.callbacks = new Set();
  }

  /**
   * Add callback for aggregated data
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Add data to be aggregated
   * @param {*} data - Data to aggregate
   */
  add(data) {
    this.pendingData.push(data);
    
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.interval);
    }
  }

  /**
   * Flush pending data to callbacks
   */
  flush() {
    if (this.pendingData.length > 0) {
      const aggregatedData = [...this.pendingData];
      this.pendingData = [];
      
      this.callbacks.forEach(callback => {
        try {
          callback(aggregatedData);
        } catch (error) {
          console.error('Error in data aggregator callback:', error);
        }
      });
    }
    
    this.timeoutId = null;
  }

  /**
   * Clear pending data and stop aggregation
   */
  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingData = [];
  }
}

/**
 * Performance monitor for tracking update performance
 */
export class PerformanceMonitor {
  constructor(sampleSize = 100) {
    this.sampleSize = sampleSize;
    this.samples = [];
    this.totalTime = 0;
  }

  /**
   * Start timing an operation
   * @returns {Function} End timing function
   */
  startTiming() {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.addSample(duration);
      return duration;
    };
  }

  /**
   * Add a timing sample
   * @param {number} duration - Duration in milliseconds
   */
  addSample(duration) {
    this.samples.push(duration);
    this.totalTime += duration;

    // Keep only recent samples
    if (this.samples.length > this.sampleSize) {
      const removed = this.samples.shift();
      this.totalTime -= removed;
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    if (this.samples.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        fps: 0
      };
    }

    const average = this.totalTime / this.samples.length;
    const min = Math.min(...this.samples);
    const max = Math.max(...this.samples);
    const fps = average > 0 ? 1000 / average : 0;

    return {
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      count: this.samples.length,
      fps: Math.round(fps)
    };
  }

  /**
   * Check if performance is within acceptable range
   * @param {number} maxAverage - Maximum acceptable average time
   * @returns {boolean} True if performance is acceptable
   */
  isPerformanceAcceptable(maxAverage = 16.67) { // 60fps = 16.67ms
    const stats = this.getStats();
    return stats.average <= maxAverage;
  }

  /**
   * Reset all performance data
   */
  reset() {
    this.samples = [];
    this.totalTime = 0;
  }
}

/**
 * Adaptive quality manager that adjusts rendering quality based on performance
 */
export class AdaptiveQualityManager {
  constructor(options = {}) {
    this.options = {
      targetFPS: 60,
      minFPS: 30,
      maxDataPoints: 1000,
      minDataPoints: 50,
      qualityLevels: ['high', 'medium', 'low'],
      ...options
    };
    
    this.currentQuality = 'high';
    this.performanceMonitor = new PerformanceMonitor();
    this.adjustmentCooldown = 30; // Start with cooldown to prevent immediate adjustments
  }

  /**
   * Update performance and potentially adjust quality
   * @param {number} frameTime - Time taken for last frame
   */
  updatePerformance(frameTime) {
    this.performanceMonitor.addSample(frameTime);
    
    // Only adjust quality if not in cooldown
    if (this.adjustmentCooldown <= 0) {
      this.adjustQuality();
      this.adjustmentCooldown = 30; // Wait 30 frames before next adjustment
    } else {
      this.adjustmentCooldown--;
    }
  }

  /**
   * Adjust quality based on current performance
   */
  adjustQuality() {
    const stats = this.performanceMonitor.getStats();
    const targetFrameTime = 1000 / this.options.targetFPS;
    const minFrameTime = 1000 / this.options.minFPS;

    if (stats.average > minFrameTime && this.currentQuality !== 'low') {
      // Performance is poor, reduce quality
      const currentIndex = this.options.qualityLevels.indexOf(this.currentQuality);
      if (currentIndex < this.options.qualityLevels.length - 1) {
        this.currentQuality = this.options.qualityLevels[currentIndex + 1];
      }
    } else if (stats.average < targetFrameTime && this.currentQuality !== 'high') {
      // Performance is good, increase quality
      const currentIndex = this.options.qualityLevels.indexOf(this.currentQuality);
      if (currentIndex > 0) {
        this.currentQuality = this.options.qualityLevels[currentIndex - 1];
      }
    }
  }

  /**
   * Get current quality level
   * @returns {string} Current quality level
   */
  getQuality() {
    return this.currentQuality;
  }

  /**
   * Get recommended data point count based on current quality
   * @returns {number} Recommended data point count
   */
  getRecommendedDataPoints() {
    const qualityIndex = this.options.qualityLevels.indexOf(this.currentQuality);
    const qualityRatio = 1 - (qualityIndex / (this.options.qualityLevels.length - 1));
    
    return Math.round(
      this.options.minDataPoints + 
      (this.options.maxDataPoints - this.options.minDataPoints) * qualityRatio
    );
  }

  /**
   * Get quality-based rendering options
   * @returns {Object} Rendering options
   */
  getRenderingOptions() {
    switch (this.currentQuality) {
      case 'high':
        return {
          showGrid: true,
          showPoints: true,
          showArea: true,
          showLabels: true,
          animationDuration: 300
        };
      case 'medium':
        return {
          showGrid: true,
          showPoints: false,
          showArea: false,
          showLabels: true,
          animationDuration: 150
        };
      case 'low':
        return {
          showGrid: false,
          showPoints: false,
          showArea: false,
          showLabels: false,
          animationDuration: 0
        };
      default:
        return this.getRenderingOptions();
    }
  }

  /**
   * Reset quality to high and clear performance data
   */
  reset() {
    this.currentQuality = 'high';
    this.performanceMonitor.reset();
    this.adjustmentCooldown = 0;
  }
}

/**
 * Utility function to create a throttled update handler for components
 * @param {Function} updateFunction - Function to call with updates
 * @param {Object} options - Throttling options
 * @returns {Function} Throttled update handler
 */
export function createThrottledUpdater(updateFunction, options = {}) {
  const {
    throttleMs = 16, // ~60fps
    useRAF = true,
    aggregateUpdates = false,
    maxBatchSize = 10
  } = options;

  if (aggregateUpdates) {
    const aggregator = new DataAggregator(throttleMs);
    aggregator.subscribe(updateFunction);
    return (data) => aggregator.add(data);
  }

  if (useRAF) {
    return rafThrottle(updateFunction);
  }

  return throttle(updateFunction, throttleMs);
}

export default {
  throttle,
  debounce,
  rafThrottle,
  reduceDataPoints,
  SlidingWindow,
  DataAggregator,
  PerformanceMonitor,
  AdaptiveQualityManager,
  createThrottledUpdater
};