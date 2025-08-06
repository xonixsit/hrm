/**
 * Responsive Design Utilities
 * 
 * Comprehensive utilities for responsive design optimization
 * across all breakpoints with touch-friendly interactions
 */

// Enhanced breakpoint system with more granular control
export const breakpoints = {
  xs: 320,   // Extra small devices (small phones)
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X Extra large devices (larger desktops)
  '3xl': 1920  // Ultra wide screens
};

// Device categories with enhanced detection
export const deviceCategories = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
};

// Touch target sizes following accessibility guidelines
export const touchTargets = {
  minimum: 44,    // WCAG minimum
  comfortable: 48, // Recommended comfortable size
  large: 56       // Large touch targets for accessibility
};

// Typography scaling system
export const typographyScale = {
  mobile: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px'
  },
  tablet: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },
  desktop: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  }
};

// Spacing scale for different devices
export const spacingScale = {
  mobile: {
    xs: '2px',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },
  tablet: {
    xs: '4px',
    sm: '8px',
    base: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px'
  },
  desktop: {
    xs: '4px',
    sm: '8px',
    base: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px'
  }
};

/**
 * Get current device category based on window width
 */
export function getDeviceCategory(width) {
  // Default to desktop if no width provided and window is unavailable
  if (width === undefined) {
    width = (typeof window !== 'undefined' && window.innerWidth) || 1024;
  }
  
  if (width < deviceCategories.tablet.min) return 'mobile';
  if (width < deviceCategories.desktop.min) return 'tablet';
  return 'desktop';
}

/**
 * Get responsive value based on current device
 */
export function getResponsiveValue(values, width) {
  if (width === undefined) {
    width = (typeof window !== 'undefined' && window.innerWidth) || 1024;
  }
  
  const device = getDeviceCategory(width);
  
  // Return device-specific value or fallback to desktop
  return values[device] || values.desktop || values.default;
}

/**
 * Generate responsive CSS classes
 */
export function generateResponsiveClasses(baseClass, values) {
  const classes = [];
  
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'default') {
      classes.push(`${baseClass}-${value}`);
    } else {
      classes.push(`${breakpoint}:${baseClass}-${value}`);
    }
  });
  
  return classes.join(' ');
}

/**
 * Check if device supports touch
 */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get optimal touch target size based on device
 */
export function getTouchTargetSize(size = 'comfortable') {
  const device = getDeviceCategory();
  const baseSize = touchTargets[size] || touchTargets.comfortable;
  
  // Increase touch targets on mobile devices
  if (device === 'mobile') {
    return Math.max(baseSize, touchTargets.minimum);
  }
  
  return baseSize;
}

/**
 * Generate responsive grid columns
 */
export function getResponsiveGridColumns(config) {
  const device = getDeviceCategory();
  
  const defaultConfig = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  return finalConfig[device];
}

/**
 * Get responsive container padding
 */
export function getResponsiveContainerPadding() {
  const device = getDeviceCategory();
  
  const padding = {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px'
  };
  
  return padding[device];
}

/**
 * Calculate responsive font size
 */
export function getResponsiveFontSize(size = 'base') {
  const device = getDeviceCategory();
  return typographyScale[device][size] || typographyScale.desktop[size];
}

/**
 * Calculate responsive spacing
 */
export function getResponsiveSpacing(size = 'base') {
  const device = getDeviceCategory();
  return spacingScale[device][size] || spacingScale.desktop[size];
}

/**
 * Generate media query string
 */
export function createMediaQuery(breakpoint, direction = 'up') {
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
}

/**
 * Debounce function for resize events
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get optimal image sizes for responsive images
 */
export function getResponsiveImageSizes(config = {}) {
  const defaultSizes = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  };
  
  const sizes = { ...defaultSizes, ...config };
  
  return [
    `(max-width: ${breakpoints.sm - 1}px) ${sizes.mobile}`,
    `(max-width: ${breakpoints.lg - 1}px) ${sizes.tablet}`,
    sizes.desktop
  ].join(', ');
}

/**
 * Generate responsive image srcset
 */
export function generateResponsiveImageSrcSet(basePath, sizes = [320, 640, 768, 1024, 1280, 1920]) {
  return sizes
    .map(size => `${basePath}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0
  };
}

/**
 * Optimize layout for keyboard visibility on mobile
 */
export function handleVirtualKeyboard() {
  if (!isTouchDevice()) return;
  
  let initialViewportHeight = window.innerHeight;
  
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;
    
    // If height decreased significantly, keyboard is likely visible
    if (heightDifference > 150) {
      document.body.classList.add('keyboard-visible');
    } else {
      document.body.classList.remove('keyboard-visible');
    }
  };
  
  window.addEventListener('resize', debounce(handleResize, 100));
  
  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    document.body.classList.remove('keyboard-visible');
  };
}

/**
 * Responsive table column priority system
 */
export function getColumnPriority(columnKey, deviceType) {
  const priorities = {
    // High priority - always visible
    name: 'high',
    title: 'high',
    status: 'high',
    
    // Medium priority - hidden on mobile
    email: 'medium',
    department: 'medium',
    phone: 'medium',
    
    // Low priority - hidden on mobile and tablet
    created_at: 'low',
    updated_at: 'low',
    description: 'low',
    notes: 'low'
  };
  
  return priorities[columnKey] || 'medium';
}

/**
 * Generate responsive table classes
 */
export function getResponsiveTableClasses(deviceType) {
  return {
    'table-mobile': deviceType === 'mobile',
    'table-tablet': deviceType === 'tablet',
    'table-desktop': deviceType === 'desktop',
    'table-touch': isTouchDevice()
  };
}

export default {
  breakpoints,
  deviceCategories,
  touchTargets,
  typographyScale,
  spacingScale,
  getDeviceCategory,
  getResponsiveValue,
  generateResponsiveClasses,
  isTouchDevice,
  getTouchTargetSize,
  getResponsiveGridColumns,
  getResponsiveContainerPadding,
  getResponsiveFontSize,
  getResponsiveSpacing,
  createMediaQuery,
  debounce,
  throttle,
  getResponsiveImageSizes,
  generateResponsiveImageSrcSet,
  isInViewport,
  getSafeAreaInsets,
  handleVirtualKeyboard,
  getColumnPriority,
  getResponsiveTableClasses
};