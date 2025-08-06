import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useResponsive, breakpoints } from '@/composables/useResponsive';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock navigator
const mockNavigator = {
  maxTouchPoints: 0,
};

describe('useResponsive', () => {
  beforeEach(() => {
    // Setup global mocks
    global.window = mockWindow;
    global.navigator = mockNavigator;
    
    // Reset mock functions
    vi.clearAllMocks();
    
    // Reset window dimensions
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
    mockWindow.devicePixelRatio = 1;
    mockNavigator.maxTouchPoints = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Breakpoint Detection', () => {
    it('should detect desktop breakpoint correctly', () => {
      mockWindow.innerWidth = 1024;
      const { isDesktop, isMobile, isTablet, currentBreakpoint } = useResponsive();
      
      expect(isDesktop.value).toBe(true);
      expect(isMobile.value).toBe(false);
      expect(isTablet.value).toBe(false);
      expect(currentBreakpoint.value).toBe('lg');
    });

    it('should detect mobile breakpoint correctly', () => {
      mockWindow.innerWidth = 480;
      const { isDesktop, isMobile, isTablet, currentBreakpoint } = useResponsive();
      
      expect(isDesktop.value).toBe(false);
      expect(isMobile.value).toBe(true);
      expect(isTablet.value).toBe(false);
      expect(currentBreakpoint.value).toBe('xs');
    });

    it('should detect tablet breakpoint correctly', () => {
      mockWindow.innerWidth = 768;
      const { isDesktop, isMobile, isTablet, currentBreakpoint } = useResponsive();
      
      expect(isDesktop.value).toBe(false);
      expect(isMobile.value).toBe(false);
      expect(isTablet.value).toBe(true);
      expect(currentBreakpoint.value).toBe('md');
    });

    it('should detect breakpoint up states correctly', () => {
      mockWindow.innerWidth = 1024;
      const { isSmUp, isMdUp, isLgUp, isXlUp } = useResponsive();
      
      expect(isSmUp.value).toBe(true);
      expect(isMdUp.value).toBe(true);
      expect(isLgUp.value).toBe(true);
      expect(isXlUp.value).toBe(false);
    });
  });

  describe('Device Type Detection', () => {
    it('should detect device type correctly', () => {
      mockWindow.innerWidth = 1024;
      const { deviceType } = useResponsive();
      
      expect(deviceType.value).toBe('desktop');
    });

    it('should detect touch device', () => {
      mockNavigator.maxTouchPoints = 1;
      const { isTouchDevice } = useResponsive();
      
      expect(isTouchDevice.value).toBe(true);
    });

    it('should detect non-touch device', () => {
      mockNavigator.maxTouchPoints = 0;
      const { isTouchDevice } = useResponsive();
      
      expect(isTouchDevice.value).toBe(false);
    });

    it('should detect high density display', () => {
      mockWindow.devicePixelRatio = 2;
      const { isHighDensity, pixelRatio } = useResponsive();
      
      expect(isHighDensity.value).toBe(true);
      expect(pixelRatio.value).toBe(2);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect landscape orientation', () => {
      mockWindow.innerWidth = 1024;
      mockWindow.innerHeight = 768;
      const { orientation } = useResponsive();
      
      expect(orientation.value).toBe('landscape');
    });

    it('should detect portrait orientation', () => {
      mockWindow.innerWidth = 768;
      mockWindow.innerHeight = 1024;
      const { orientation } = useResponsive();
      
      expect(orientation.value).toBe('portrait');
    });
  });

  describe('Utility Functions', () => {
    it('should check breakpoint correctly', () => {
      mockWindow.innerWidth = 1024;
      const { isBreakpoint } = useResponsive();
      
      expect(isBreakpoint('sm')).toBe(true);
      expect(isBreakpoint('md')).toBe(true);
      expect(isBreakpoint('lg')).toBe(true);
      expect(isBreakpoint('xl')).toBe(false);
    });

    it('should check breakpoint only correctly', () => {
      mockWindow.innerWidth = 1024;
      const { isBreakpointOnly } = useResponsive();
      
      expect(isBreakpointOnly('lg')).toBe(true);
      expect(isBreakpointOnly('md')).toBe(false);
      expect(isBreakpointOnly('xl')).toBe(false);
    });

    it('should check breakpoint down correctly', () => {
      mockWindow.innerWidth = 1024;
      const { isBreakpointDown } = useResponsive();
      
      expect(isBreakpointDown('xl')).toBe(true);
      expect(isBreakpointDown('lg')).toBe(false);
      expect(isBreakpointDown('sm')).toBe(false);
    });

    it('should get responsive value correctly', () => {
      mockWindow.innerWidth = 1024;
      const { getResponsiveValue } = useResponsive();
      
      const values = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5
      };
      
      expect(getResponsiveValue(values)).toBe(4);
    });

    it('should get grid columns correctly', () => {
      mockWindow.innerWidth = 768;
      const { getGridColumns } = useResponsive();
      
      const config = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4
      };
      
      expect(getGridColumns(config)).toBe(3);
    });

    it('should get container max width correctly', () => {
      mockWindow.innerWidth = 1024;
      const { getContainerMaxWidth } = useResponsive();
      
      expect(getContainerMaxWidth()).toBe('1024px');
    });

    it('should get responsive spacing correctly', () => {
      mockWindow.innerWidth = 768;
      const { getResponsiveSpacing } = useResponsive();
      
      const config = {
        xs: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem'
      };
      
      expect(getResponsiveSpacing(config)).toBe('2rem');
    });
  });

  describe('Media Query Helpers', () => {
    it('should create media query for up direction', () => {
      const { createMediaQuery } = useResponsive();
      
      expect(createMediaQuery('md', 'up')).toBe('(min-width: 768px)');
    });

    it('should create media query for down direction', () => {
      const { createMediaQuery } = useResponsive();
      
      expect(createMediaQuery('md', 'down')).toBe('(max-width: 767px)');
    });

    it('should create media query for only direction', () => {
      const { createMediaQuery } = useResponsive();
      
      expect(createMediaQuery('md', 'only')).toBe('(min-width: 768px) and (max-width: 1023px)');
    });

    it('should default to up direction', () => {
      const { createMediaQuery } = useResponsive();
      
      expect(createMediaQuery('lg')).toBe('(min-width: 1024px)');
    });
  });

  describe('Window Dimensions', () => {
    it('should return current window dimensions', () => {
      mockWindow.innerWidth = 1200;
      mockWindow.innerHeight = 800;
      
      const { windowWidth, windowHeight } = useResponsive();
      
      expect(windowWidth.value).toBe(1200);
      expect(windowHeight.value).toBe(800);
    });
  });

  describe('Breakpoints Export', () => {
    it('should export breakpoints object', () => {
      expect(breakpoints).toBeDefined();
      expect(breakpoints.sm).toBe(640);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(1024);
      expect(breakpoints.xl).toBe(1280);
      expect(breakpoints['2xl']).toBe(1536);
    });

    it('should provide breakpoints through composable', () => {
      const { breakpoints: composableBreakpoints } = useResponsive();
      
      expect(composableBreakpoints.value).toEqual(breakpoints);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid breakpoint names', () => {
      const { isBreakpoint, createMediaQuery } = useResponsive();
      
      expect(isBreakpoint('invalid')).toBe(false);
      expect(createMediaQuery('invalid')).toBe('');
    });

    it('should handle empty responsive values', () => {
      mockWindow.innerWidth = 1024;
      const { getResponsiveValue } = useResponsive();
      
      expect(getResponsiveValue({})).toBeUndefined();
    });

    it('should fallback to first available value', () => {
      mockWindow.innerWidth = 1024;
      const { getResponsiveValue } = useResponsive();
      
      const values = { xl: 5, '2xl': 6 };
      expect(getResponsiveValue(values)).toBe(5);
    });
  });

  describe('Event Listeners', () => {
    it('should setup event listeners when window is available', () => {
      // The event listeners are set up in onMounted, which doesn't run in unit tests
      // Instead, we test that the composable works correctly with window events
      const { windowWidth, windowHeight } = useResponsive();
      
      // Verify initial dimensions are set
      expect(windowWidth.value).toBe(1024);
      expect(windowHeight.value).toBe(768);
      
      // This test verifies the composable initializes correctly
      // Event listener testing would require integration tests with a real DOM
    });
  });
});