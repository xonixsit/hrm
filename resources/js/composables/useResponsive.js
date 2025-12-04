import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  breakpoints, 
  getDeviceCategory, 
  isTouchDevice as checkTouchDevice,
  getTouchTargetSize,
  getResponsiveValue,
  debounce,
  getSafeAreaInsets,
  handleVirtualKeyboard
} from '@/utils/responsiveHelpers.js';

/**
 * Enhanced Responsive Design Composable
 * 
 * Provides comprehensive utilities for responsive design patterns,
 * breakpoint detection, touch optimization, and accessibility features
 */

// Reactive window dimensions
const windowWidth = ref(0);
const windowHeight = ref(0);

// Device orientation
const orientation = ref('portrait');

export function useResponsive() {
  // Update window dimensions
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
      orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
  };

  // Initialize dimensions immediately
  updateDimensions();

  // Breakpoint detection
  const isSmUp = computed(() => windowWidth.value >= breakpoints.sm);
  const isMdUp = computed(() => windowWidth.value >= breakpoints.md);
  const isLgUp = computed(() => windowWidth.value >= breakpoints.lg);
  const isXlUp = computed(() => windowWidth.value >= breakpoints.xl);
  const is2XlUp = computed(() => windowWidth.value >= breakpoints['2xl']);

  // Specific breakpoint ranges
  const isMobile = computed(() => windowWidth.value < breakpoints.sm);
  const isTablet = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.lg);
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg);

  // Current breakpoint
  const currentBreakpoint = computed(() => {
    if (windowWidth.value >= breakpoints['2xl']) return '2xl';
    if (windowWidth.value >= breakpoints.xl) return 'xl';
    if (windowWidth.value >= breakpoints.lg) return 'lg';
    if (windowWidth.value >= breakpoints.md) return 'md';
    if (windowWidth.value >= breakpoints.sm) return 'sm';
    return 'xs';
  });

  // Device type detection
  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile';
    if (isTablet.value) return 'tablet';
    return 'desktop';
  });

  // Enhanced touch device detection
  const isTouchDevice = computed(() => checkTouchDevice());

  // Screen density detection
  const pixelRatio = computed(() => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  });

  const isHighDensity = computed(() => pixelRatio.value > 1);

  // Safe area insets for devices with notches
  const safeAreaInsets = computed(() => getSafeAreaInsets());

  // Virtual keyboard detection
  const isKeyboardVisible = ref(false);
  let keyboardCleanup = null;
  let keyboardObserver = null;

  // Utility functions
  const isBreakpoint = (breakpoint) => {
    return windowWidth.value >= breakpoints[breakpoint];
  };

  const isBreakpointOnly = (breakpoint) => {
    const breakpointKeys = Object.keys(breakpoints);
    const currentIndex = breakpointKeys.indexOf(breakpoint);
    
    if (currentIndex === -1) return false;
    
    const minWidth = breakpoints[breakpoint];
    const nextBreakpoint = breakpointKeys[currentIndex + 1];
    const maxWidth = nextBreakpoint ? breakpoints[nextBreakpoint] - 1 : Infinity;
    
    return windowWidth.value >= minWidth && windowWidth.value <= maxWidth;
  };

  const isBreakpointDown = (breakpoint) => {
    return windowWidth.value < breakpoints[breakpoint];
  };

  // Responsive value selection
  const getResponsiveValue = (values) => {
    // Values should be an object with breakpoint keys
    // Example: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
    
    const sortedBreakpoints = Object.keys(breakpoints).sort((a, b) => breakpoints[b] - breakpoints[a]);
    
    // Find the largest breakpoint that matches
    for (const bp of sortedBreakpoints) {
      if (windowWidth.value >= breakpoints[bp] && values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    // Fallback to xs or first available value
    return values.xs || values[Object.keys(values)[0]];
  };

  // Grid columns calculation
  const getGridColumns = (config) => {
    // Config example: { xs: 1, sm: 2, md: 3, lg: 4 }
    return getResponsiveValue(config);
  };

  // Container max width
  const getContainerMaxWidth = () => {
    const containerWidths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
    
    return containerWidths[currentBreakpoint.value] || '100%';
  };

  // Responsive spacing
  const getResponsiveSpacing = (config) => {
    // Config example: { xs: '1rem', sm: '1.5rem', lg: '2rem' }
    return getResponsiveValue(config);
  };

  // Media query helpers
  const createMediaQuery = (breakpoint, direction = 'up') => {
    const width = breakpoints[breakpoint];
    if (!width) return '';
    
    switch (direction) {
      case 'up':
        return `(min-width: ${width}px)`;
      case 'down':
        return `(max-width: ${width - 1}px)`;
      case 'only':
        const nextBreakpoint = Object.keys(breakpoints).find(bp => breakpoints[bp] > width);
        const maxWidth = nextBreakpoint ? breakpoints[nextBreakpoint] - 1 : 9999;
        return `(min-width: ${width}px) and (max-width: ${maxWidth}px)`;
      default:
        return `(min-width: ${width}px)`;
    }
  };

  // Debounced resize handler
  let resizeTimeout;
  const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateDimensions, 100);
  };

  // Enhanced touch target sizing
  const getOptimalTouchSize = (size = 'comfortable') => {
    return getTouchTargetSize(size);
  };

  // Responsive value helper using the utility
  const getResponsiveValueFromConfig = (config) => {
    return getResponsiveValue(config, windowWidth.value);
  };

  // Lifecycle management
  onMounted(() => {
    updateDimensions();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', updateDimensions);
      
      // Initialize virtual keyboard detection
      keyboardCleanup = handleVirtualKeyboard();
      
      // Monitor keyboard visibility
      const handleKeyboardToggle = () => {
        isKeyboardVisible.value = document.body.classList.contains('keyboard-visible');
      };
      
      keyboardObserver = new MutationObserver(handleKeyboardToggle);
      keyboardObserver.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', updateDimensions);
    }
    clearTimeout(resizeTimeout);
    
    // Cleanup keyboard detection
    if (keyboardCleanup && typeof keyboardCleanup === 'function') {
      keyboardCleanup();
    }
    
    // Cleanup keyboard observer
    if (keyboardObserver) {
      keyboardObserver.disconnect();
    }
  });

  // Debug utilities
  const debugResponsive = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📱 Responsive Debug Info');
      //console.log('Window dimensions:', `${windowWidth.value}x${windowHeight.value}`);
      //console.log('Current breakpoint:', currentBreakpoint.value);
      //console.log('Device type:', deviceType.value);
      //console.log('Orientation:', orientation.value);
      //console.log('Touch device:', isTouchDevice.value);
      //console.log('Pixel ratio:', pixelRatio.value);
      //console.log('Breakpoint states:', {
      //  isMobile: isMobile.value,
      //  isTablet: isTablet.value,
      //  isDesktop: isDesktop.value,
      //  isSmUp: isSmUp.value,
      //  isMdUp: isMdUp.value,
      //  isLgUp: isLgUp.value
      //});
      console.groupEnd();
    }
  };

  return {
    // Dimensions
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),
    orientation: computed(() => orientation.value),
    
    // Breakpoint detection
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    is2XlUp,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isHighDensity,
    
    // Current state
    currentBreakpoint,
    deviceType,
    pixelRatio,
    
    // Enhanced features
    safeAreaInsets,
    isKeyboardVisible: computed(() => isKeyboardVisible.value),
    
    // Utility functions
    isBreakpoint,
    isBreakpointOnly,
    isBreakpointDown,
    getResponsiveValue,
    getGridColumns,
    getContainerMaxWidth,
    getResponsiveSpacing,
    createMediaQuery,
    getOptimalTouchSize,
    getResponsiveValueFromConfig,
    debugResponsive,
    
    // Constants
    breakpoints: computed(() => breakpoints)
  };
}

// Export breakpoints for external use
export { breakpoints };
export default useResponsive;