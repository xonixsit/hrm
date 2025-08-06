import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getDeviceCategory, 
  getResponsiveValue, 
  getTouchTargetSize,
  isTouchDevice,
  getResponsiveImageSizes,
  generateResponsiveImageSrcSet,
  createMediaQuery,
  getResponsiveGridColumns,
  getResponsiveContainerPadding,
  getResponsiveFontSize,
  getResponsiveSpacing
} from '@/utils/responsiveHelpers';

describe('Responsive Design Core Utilities', () => {
  describe('Device Category Detection', () => {
    it('should detect mobile devices correctly', () => {
      expect(getDeviceCategory(320)).toBe('mobile');
      expect(getDeviceCategory(640)).toBe('mobile');
      expect(getDeviceCategory(767)).toBe('mobile');
    });

    it('should detect tablet devices correctly', () => {
      expect(getDeviceCategory(768)).toBe('tablet');
      expect(getDeviceCategory(900)).toBe('tablet');
      expect(getDeviceCategory(1023)).toBe('tablet');
    });

    it('should detect desktop devices correctly', () => {
      expect(getDeviceCategory(1024)).toBe('desktop');
      expect(getDeviceCategory(1280)).toBe('desktop');
      expect(getDeviceCategory(1920)).toBe('desktop');
    });
  });

  describe('Responsive Values', () => {
    it('should return correct values for different devices', () => {
      const config = {
        mobile: 1,
        tablet: 2,
        desktop: 3
      };

      expect(getResponsiveValue(config, 320)).toBe(1);
      expect(getResponsiveValue(config, 768)).toBe(2);
      expect(getResponsiveValue(config, 1024)).toBe(3);
    });

    it('should fallback to desktop value when device value is missing', () => {
      const config = {
        desktop: 3
      };

      expect(getResponsiveValue(config, 320)).toBe(3);
      expect(getResponsiveValue(config, 768)).toBe(3);
    });

    it('should fallback to default value when no device values match', () => {
      const config = {
        default: 'fallback'
      };

      expect(getResponsiveValue(config, 320)).toBe('fallback');
    });
  });

  describe('Touch Target Sizing', () => {
    it('should return minimum touch target size', () => {
      expect(getTouchTargetSize('minimum')).toBe(44);
    });

    it('should return comfortable touch target size', () => {
      expect(getTouchTargetSize('comfortable')).toBe(48);
    });

    it('should return large touch target size', () => {
      expect(getTouchTargetSize('large')).toBe(56);
    });

    it('should default to comfortable size', () => {
      expect(getTouchTargetSize()).toBe(48);
    });

    it('should increase touch targets on mobile devices', () => {
      // Mock mobile device
      vi.stubGlobal('window', { innerWidth: 375 });
      
      const size = getTouchTargetSize('minimum');
      expect(size).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Touch Device Detection', () => {
    beforeEach(() => {
      // Reset global mocks
      vi.unstubAllGlobals();
    });

    it('should detect touch devices with ontouchstart', () => {
      vi.stubGlobal('window', { ontouchstart: true });
      vi.stubGlobal('navigator', { maxTouchPoints: 0, msMaxTouchPoints: 0 });

      expect(isTouchDevice()).toBe(true);
    });

    it('should detect touch devices with maxTouchPoints', () => {
      vi.stubGlobal('window', {});
      vi.stubGlobal('navigator', { maxTouchPoints: 5, msMaxTouchPoints: 0 });

      expect(isTouchDevice()).toBe(true);
    });

    it('should detect touch devices with msMaxTouchPoints', () => {
      vi.stubGlobal('window', {});
      vi.stubGlobal('navigator', { maxTouchPoints: 0, msMaxTouchPoints: 5 });

      expect(isTouchDevice()).toBe(true);
    });

    it('should detect non-touch devices', () => {
      vi.stubGlobal('window', {});
      vi.stubGlobal('navigator', { maxTouchPoints: 0, msMaxTouchPoints: 0 });

      expect(isTouchDevice()).toBe(false);
    });
  });

  describe('Responsive Images', () => {
    it('should generate correct image sizes', () => {
      const config = {
        mobile: '100vw',
        tablet: '50vw',
        desktop: '33vw'
      };

      const sizes = getResponsiveImageSizes(config);
      expect(sizes).toContain('(max-width: 639px) 100vw');
      expect(sizes).toContain('(max-width: 1023px) 50vw');
      expect(sizes).toContain('33vw');
    });

    it('should generate responsive srcset', () => {
      const srcset = generateResponsiveImageSrcSet('/image.jpg', [320, 640, 1024]);
      expect(srcset).toBe('/image.jpg?w=320 320w, /image.jpg?w=640 640w, /image.jpg?w=1024 1024w');
    });

    it('should use default sizes when no config provided', () => {
      const sizes = getResponsiveImageSizes();
      expect(sizes).toContain('100vw');
      expect(sizes).toContain('50vw');
      expect(sizes).toContain('33vw');
    });
  });

  describe('Media Query Generation', () => {
    it('should create min-width media queries', () => {
      expect(createMediaQuery('md', 'up')).toBe('(min-width: 768px)');
      expect(createMediaQuery('lg')).toBe('(min-width: 1024px)');
    });

    it('should create max-width media queries', () => {
      expect(createMediaQuery('md', 'down')).toBe('(max-width: 767px)');
    });

    it('should create range media queries', () => {
      const query = createMediaQuery('md', 'only');
      expect(query).toContain('min-width: 768px');
      expect(query).toContain('max-width:');
    });

    it('should return empty string for invalid breakpoint', () => {
      expect(createMediaQuery('invalid')).toBe('');
    });
  });

  describe('Responsive Grid Columns', () => {
    it('should return correct columns for mobile', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      const columns = getResponsiveGridColumns();
      expect(columns).toBe(1);
    });

    it('should return correct columns for tablet', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      
      const columns = getResponsiveGridColumns();
      expect(columns).toBe(2);
    });

    it('should return correct columns for desktop', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });
      
      const columns = getResponsiveGridColumns();
      expect(columns).toBe(3);
    });

    it('should accept custom configuration', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      const columns = getResponsiveGridColumns({
        mobile: 2,
        tablet: 3,
        desktop: 4
      });
      expect(columns).toBe(2);
    });
  });

  describe('Responsive Container Padding', () => {
    it('should return mobile padding', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      const padding = getResponsiveContainerPadding();
      expect(padding).toBe('16px');
    });

    it('should return tablet padding', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      
      const padding = getResponsiveContainerPadding();
      expect(padding).toBe('24px');
    });

    it('should return desktop padding', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });
      
      const padding = getResponsiveContainerPadding();
      expect(padding).toBe('32px');
    });
  });

  describe('Responsive Typography', () => {
    it('should return mobile font sizes', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      expect(getResponsiveFontSize('xs')).toBe('11px');
      expect(getResponsiveFontSize('base')).toBe('14px');
      expect(getResponsiveFontSize('xl')).toBe('18px');
    });

    it('should return tablet font sizes', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      
      expect(getResponsiveFontSize('xs')).toBe('12px');
      expect(getResponsiveFontSize('base')).toBe('16px');
      expect(getResponsiveFontSize('xl')).toBe('20px');
    });

    it('should return desktop font sizes', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });
      
      expect(getResponsiveFontSize('xs')).toBe('12px');
      expect(getResponsiveFontSize('base')).toBe('16px');
      expect(getResponsiveFontSize('xl')).toBe('20px');
    });

    it('should fallback to desktop for invalid size', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      expect(getResponsiveFontSize('invalid')).toBeUndefined();
    });
  });

  describe('Responsive Spacing', () => {
    it('should return mobile spacing', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      
      expect(getResponsiveSpacing('xs')).toBe('2px');
      expect(getResponsiveSpacing('base')).toBe('8px');
      expect(getResponsiveSpacing('lg')).toBe('16px');
    });

    it('should return tablet spacing', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      
      expect(getResponsiveSpacing('xs')).toBe('4px');
      expect(getResponsiveSpacing('base')).toBe('12px');
      expect(getResponsiveSpacing('lg')).toBe('20px');
    });

    it('should return desktop spacing', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });
      
      expect(getResponsiveSpacing('xs')).toBe('4px');
      expect(getResponsiveSpacing('base')).toBe('16px');
      expect(getResponsiveSpacing('lg')).toBe('24px');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined window object', () => {
      vi.stubGlobal('window', undefined);
      
      expect(() => getDeviceCategory()).not.toThrow();
      expect(() => isTouchDevice()).not.toThrow();
    });

    it('should handle missing configuration properties', () => {
      const config = {};
      
      expect(getResponsiveValue(config, 375)).toBeUndefined();
    });

    it('should handle invalid breakpoint names', () => {
      expect(createMediaQuery('')).toBe('');
      expect(createMediaQuery(null)).toBe('');
    });

    it('should handle empty image sizes array', () => {
      const srcset = generateResponsiveImageSrcSet('/image.jpg', []);
      expect(srcset).toBe('');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large numbers of breakpoints efficiently', () => {
      const start = performance.now();
      
      // Test with many breakpoint checks
      for (let i = 0; i < 1000; i++) {
        getDeviceCategory(320 + i);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should handle large responsive configurations', () => {
      const largeConfig = {};
      for (let i = 0; i < 100; i++) {
        largeConfig[`breakpoint${i}`] = `value${i}`;
      }
      
      const start = performance.now();
      getResponsiveValue(largeConfig, 768);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should ensure minimum touch target sizes meet WCAG guidelines', () => {
      const minSize = getTouchTargetSize('minimum');
      expect(minSize).toBeGreaterThanOrEqual(44); // WCAG 2.1 AA requirement
    });

    it('should provide comfortable touch targets for better accessibility', () => {
      const comfortableSize = getTouchTargetSize('comfortable');
      expect(comfortableSize).toBeGreaterThanOrEqual(48); // Recommended size
    });

    it('should support large touch targets for users with motor disabilities', () => {
      const largeSize = getTouchTargetSize('large');
      expect(largeSize).toBeGreaterThanOrEqual(56); // Enhanced accessibility
    });
  });
});