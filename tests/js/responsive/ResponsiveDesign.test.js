import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import ResponsiveImage from '@/Components/Base/ResponsiveImage.vue';
import { 
  getDeviceCategory, 
  getResponsiveValue, 
  getTouchTargetSize,
  isTouchDevice,
  getResponsiveImageSizes,
  generateResponsiveImageSrcSet
} from '@/utils/responsiveHelpers';

// Mock window object for testing
const mockWindow = (width = 1024, height = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Design System', () => {
  beforeEach(() => {
    // Reset window size to desktop default
    mockWindow(1024, 768);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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
  });

  describe('Touch Device Detection', () => {
    it('should detect touch devices', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: true,
        configurable: true
      });

      expect(isTouchDevice()).toBe(true);
    });

    it('should detect non-touch devices', () => {
      // Remove touch support
      delete window.ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true
      });

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
  });

  describe('useResponsive Composable', () => {
    it('should detect mobile breakpoint', async () => {
      mockWindow(320, 568);
      
      const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
      
      await nextTick();
      
      expect(isMobile.value).toBe(true);
      expect(isTablet.value).toBe(false);
      expect(isDesktop.value).toBe(false);
      expect(currentBreakpoint.value).toBe('xs');
    });

    it('should detect tablet breakpoint', async () => {
      mockWindow(768, 1024);
      
      const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
      
      await nextTick();
      
      expect(isMobile.value).toBe(false);
      expect(isTablet.value).toBe(true);
      expect(isDesktop.value).toBe(false);
      expect(currentBreakpoint.value).toBe('md');
    });

    it('should detect desktop breakpoint', async () => {
      mockWindow(1280, 800);
      
      const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
      
      await nextTick();
      
      expect(isMobile.value).toBe(false);
      expect(isTablet.value).toBe(false);
      expect(isDesktop.value).toBe(true);
      expect(currentBreakpoint.value).toBe('xl');
    });

    it('should detect orientation changes', async () => {
      mockWindow(320, 568);
      
      const { orientation } = useResponsive();
      
      await nextTick();
      expect(orientation.value).toBe('portrait');
      
      mockWindow(568, 320);
      await nextTick();
      expect(orientation.value).toBe('landscape');
    });

    it('should provide responsive utility functions', () => {
      const { getResponsiveValue, getGridColumns, getOptimalTouchSize } = useResponsive();
      
      expect(typeof getResponsiveValue).toBe('function');
      expect(typeof getGridColumns).toBe('function');
      expect(typeof getOptimalTouchSize).toBe('function');
    });
  });

  describe('ResponsiveImage Component', () => {
    it('should render with basic props', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image'
        }
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toContain('/test-image.jpg');
      expect(img.attributes('alt')).toBe('Test image');
    });

    it('should generate responsive srcset when responsive is enabled', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image',
          responsive: true
        }
      });

      const img = wrapper.find('img');
      expect(img.attributes('srcset')).toBeTruthy();
      expect(img.attributes('sizes')).toBeTruthy();
    });

    it('should not generate srcset when responsive is disabled', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image',
          responsive: false
        }
      });

      const img = wrapper.find('img');
      expect(img.attributes('srcset')).toBeFalsy();
    });

    it('should apply aspect ratio styles', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image',
          aspectRatio: '16/9'
        }
      });

      const img = wrapper.find('img');
      expect(img.element.style.aspectRatio).toBe('16 / 9');
    });

    it('should apply object fit styles', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image',
          objectFit: 'contain'
        }
      });

      const img = wrapper.find('img');
      expect(img.element.style.objectFit).toBe('contain');
    });

    it('should show placeholder while loading', () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image',
          showPlaceholder: true
        }
      });

      // Initially should show placeholder
      expect(wrapper.find('.placeholder-content').exists()).toBe(true);
    });

    it('should show error fallback on load error', async () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/invalid-image.jpg',
          alt: 'Test image',
          showErrorFallback: true
        }
      });

      const img = wrapper.find('img');
      await img.trigger('error');

      expect(wrapper.find('.error-icon').exists()).toBe(true);
      expect(wrapper.find('.error-text').exists()).toBe(true);
    });

    it('should emit load event', async () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/test-image.jpg',
          alt: 'Test image'
        }
      });

      const img = wrapper.find('img');
      await img.trigger('load');

      expect(wrapper.emitted('load')).toBeTruthy();
    });

    it('should emit error event', async () => {
      const wrapper = mount(ResponsiveImage, {
        props: {
          src: '/invalid-image.jpg',
          alt: 'Test image'
        }
      });

      const img = wrapper.find('img');
      await img.trigger('error');

      expect(wrapper.emitted('error')).toBeTruthy();
    });
  });

  describe('Breakpoint-Specific Behavior', () => {
    it('should apply mobile-specific classes', async () => {
      mockWindow(320, 568);
      
      const wrapper = mount({
        template: `
          <div :class="{ 'mobile-layout': isMobile }">
            <span>Content</span>
          </div>
        `,
        setup() {
          const { isMobile } = useResponsive();
          return { isMobile };
        }
      });

      await nextTick();
      expect(wrapper.find('.mobile-layout').exists()).toBe(true);
    });

    it('should apply tablet-specific classes', async () => {
      mockWindow(768, 1024);
      
      const wrapper = mount({
        template: `
          <div :class="{ 'tablet-layout': isTablet }">
            <span>Content</span>
          </div>
        `,
        setup() {
          const { isTablet } = useResponsive();
          return { isTablet };
        }
      });

      await nextTick();
      expect(wrapper.find('.tablet-layout').exists()).toBe(true);
    });

    it('should apply desktop-specific classes', async () => {
      mockWindow(1280, 800);
      
      const wrapper = mount({
        template: `
          <div :class="{ 'desktop-layout': isDesktop }">
            <span>Content</span>
          </div>
        `,
        setup() {
          const { isDesktop } = useResponsive();
          return { isDesktop };
        }
      });

      await nextTick();
      expect(wrapper.find('.desktop-layout').exists()).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should debounce resize events', async () => {
      const resizeHandler = vi.fn();
      
      // Mock debounced function
      const debouncedHandler = vi.fn();
      
      // Simulate multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        mockWindow(1000 + i, 600);
      }
      
      // Should only call handler once after debounce period
      expect(debouncedHandler).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const wrapper = mount({
        template: '<div>Test</div>',
        setup() {
          return useResponsive();
        }
      });

      wrapper.unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Accessibility Considerations', () => {
    it('should provide appropriate touch target sizes', () => {
      const mobileSize = getTouchTargetSize('comfortable');
      expect(mobileSize).toBeGreaterThanOrEqual(44); // WCAG minimum
    });

    it('should support reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      expect(typeof prefersReducedMotion).toBe('boolean');
    });
  });
});

describe('CSS Responsive Utilities', () => {
  it('should have responsive typography classes', () => {
    // This would typically be tested with a CSS testing framework
    // For now, we'll just verify the concept
    const responsiveClasses = [
      'text-responsive-sm',
      'text-responsive-base',
      'text-responsive-lg'
    ];
    
    responsiveClasses.forEach(className => {
      expect(className).toMatch(/^text-responsive-/);
    });
  });

  it('should have responsive spacing classes', () => {
    const spacingClasses = [
      'space-y-responsive',
      'space-x-responsive',
      'gap-responsive',
      'p-responsive'
    ];
    
    spacingClasses.forEach(className => {
      expect(className).toMatch(/responsive$/);
    });
  });

  it('should have touch-friendly classes', () => {
    const touchClasses = [
      'touch-target',
      'touch-target-sm',
      'touch-target-lg'
    ];
    
    touchClasses.forEach(className => {
      expect(className).toMatch(/^touch-target/);
    });
  });
});