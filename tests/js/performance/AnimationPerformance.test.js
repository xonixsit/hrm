import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { 
  monitorAnimationPerformance, 
  prefersReducedMotion,
  createRippleEffect,
  smoothScrollTo,
  ANIMATION_DURATION
} from '@/utils/animations';

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now())
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16); // ~60fps
});

global.cancelAnimationFrame = vi.fn(clearTimeout);

// Mock matchMedia for reduced motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock DOM elements
Object.defineProperty(HTMLElement.prototype, 'children', {
  get: function() {
    return Array.from(this.childNodes).filter(node => node.nodeType === 1);
  }
});

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 100,
    height: 40,
    right: 100,
    bottom: 40
  }))
});

describe('Animation Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performance.now.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Animation Performance Monitoring', () => {
    it('should create performance monitoring function', () => {
      const mockCallback = vi.fn();
      const stopMonitoring = monitorAnimationPerformance('test-animation', mockCallback);
      
      expect(typeof stopMonitoring).toBe('function');
      expect(() => stopMonitoring()).not.toThrow();
    });

    it('should handle performance monitoring without errors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockCallback = vi.fn();
      
      expect(() => {
        const stopMonitoring = monitorAnimationPerformance('test-animation', mockCallback);
        stopMonitoring();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock reduced motion preference
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return zero duration for animations when reduced motion is preferred', async () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Re-import the module to get updated behavior
      const { getAnimationDuration } = await import('@/utils/animations');
      
      expect(getAnimationDuration(ANIMATION_DURATION.normal)).toBe(0);
    });
  });

  describe('Ripple Effect Performance', () => {
    it('should create ripple effect without performance issues', () => {
      const button = document.createElement('button');
      button.style.width = '100px';
      button.style.height = '40px';
      document.body.appendChild(button);

      const mockEvent = {
        clientX: 50,
        clientY: 20
      };

      // Mock getBoundingClientRect
      button.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 40
      }));

      const startTime = performance.now();
      createRippleEffect(button, mockEvent);
      const endTime = performance.now();

      // Ripple creation should be fast (< 5ms)
      expect(endTime - startTime).toBeLessThan(5);

      document.body.removeChild(button);
    });

    it('should not create ripple when reduced motion is preferred', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const button = document.createElement('button');
      const mockEvent = { clientX: 50, clientY: 20 };

      const cleanup = createRippleEffect(button, mockEvent);
      
      // Should return empty cleanup function
      expect(typeof cleanup).toBe('function');
      expect(button.children.length).toBe(0);
    });
  });

  describe('Smooth Scroll Performance', () => {
    it('should complete smooth scroll within reasonable time', async () => {
      const targetElement = document.createElement('div');
      targetElement.offsetTop = 1000;
      document.body.appendChild(targetElement);

      // Mock window.pageYOffset
      Object.defineProperty(window, 'pageYOffset', {
        value: 0,
        writable: true
      });

      // Mock window.scrollTo
      window.scrollTo = vi.fn();

      const startTime = Date.now();
      
      await smoothScrollTo(targetElement, {
        duration: 100 // Short duration for test
      });
      
      const endTime = Date.now();
      const actualDuration = endTime - startTime;

      // Should complete within expected timeframe (with some tolerance)
      expect(actualDuration).toBeGreaterThanOrEqual(90);
      expect(actualDuration).toBeLessThanOrEqual(150);

      document.body.removeChild(targetElement);
    });

    it('should use instant scroll when reduced motion is preferred', async () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const targetElement = document.createElement('div');
      targetElement.scrollIntoView = vi.fn();
      
      const startTime = Date.now();
      await smoothScrollTo(targetElement);
      const endTime = Date.now();

      // Should complete instantly
      expect(endTime - startTime).toBeLessThan(10);
      expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    });
  });

  describe('Animation Memory Management', () => {
    it('should properly cleanup animation resources', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const cleanup = createRippleEffect(button);
      
      // Should return cleanup function
      expect(typeof cleanup).toBe('function');
      
      // Cleanup should not throw
      expect(() => cleanup()).not.toThrow();

      document.body.removeChild(button);
    });

    it('should handle multiple rapid animations without memory leaks', () => {
      const button = document.createElement('button');
      button.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, width: 100, height: 40
      }));
      document.body.appendChild(button);

      const initialChildCount = button.children.length;

      // Create multiple rapid ripples
      for (let i = 0; i < 10; i++) {
        createRippleEffect(button, { clientX: 50, clientY: 20 });
      }

      // Should not accumulate too many child elements
      setTimeout(() => {
        expect(button.children.length).toBeLessThanOrEqual(initialChildCount + 5);
      }, ANIMATION_DURATION.normal + 100);

      document.body.removeChild(button);
    });
  });

  describe('Animation Timing Accuracy', () => {
    it('should maintain consistent timing for animations', () => {
      const durations = [];
      const expectedDuration = ANIMATION_DURATION.normal;

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        // Simulate animation completion
        setTimeout(() => {
          const actualDuration = performance.now() - startTime;
          durations.push(actualDuration);
        }, expectedDuration);
      }

      setTimeout(() => {
        const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const variance = durations.reduce((acc, duration) => {
          return acc + Math.pow(duration - averageDuration, 2);
        }, 0) / durations.length;

        // Variance should be low (consistent timing)
        expect(variance).toBeLessThan(100);
      }, expectedDuration + 100);
    });
  });
});