/**
 * Accessibility utilities for enhanced user experience
 * Provides comprehensive accessibility features including ARIA management,
 * keyboard navigation, screen reader support, and focus management
 */

// ARIA Live Region Manager
class AriaLiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.init();
  }

  init() {
    // Create default live regions if they don't exist
    this.createLiveRegion('polite', 'aria-live-polite');
    this.createLiveRegion('assertive', 'aria-live-assertive');
    this.createLiveRegion('status', 'aria-live-status');
  }

  createLiveRegion(type, id) {
    if (typeof document === 'undefined' || document.getElementById(id)) return;

    try {
      const region = document.createElement('div');
      region.id = id;
      region.setAttribute('aria-live', type === 'status' ? 'polite' : type);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;

      if (document.body) {
        document.body.appendChild(region);
      }
      this.regions.set(type, region);
    } catch (error) {
      console.warn('Could not create live region:', error);
    }
  }

  announce(message, type = 'polite') {
    const region = this.regions.get(type);
    if (!region) return;

    // Clear previous message
    region.textContent = '';
    
    // Add new message with slight delay to ensure screen readers pick it up
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
}

// Global instance
export const ariaLiveManager = new AriaLiveRegionManager();

/**
 * Focus Management Utilities
 */
export class FocusManager {
  constructor() {
    this.focusStack = [];
    this.trapStack = [];
  }

  // Store current focus and set new focus
  storeFocus(newFocusElement = null) {
    const currentFocus = document.activeElement;
    this.focusStack.push(currentFocus);
    
    if (newFocusElement) {
      this.setFocus(newFocusElement);
    }
  }

  // Restore previously stored focus
  restoreFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && previousFocus !== document.body) {
      this.setFocus(previousFocus);
    }
  }

  // Set focus with error handling
  setFocus(element, options = {}) {
    if (!element) return false;

    try {
      // Ensure element is focusable
      if (!this.isFocusable(element)) {
        element.setAttribute('tabindex', '-1');
      }

      element.focus(options);
      return true;
    } catch (error) {
      console.warn('Focus setting failed:', error);
      return false;
    }
  }

  // Check if element is focusable
  isFocusable(element) {
    if (!element || element.disabled) return false;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableSelectors.some(selector => element.matches(selector)) ||
           element.getAttribute('tabindex') === '0';
  }

  // Get all focusable elements within a container
  getFocusableElements(container = document) {
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.disabled &&
               getComputedStyle(element).visibility !== 'hidden';
      });
  }

  // Focus trap for modals and dialogs
  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return null;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    this.setFocus(firstElement);

    // Return cleanup function
    const cleanup = () => {
      container.removeEventListener('keydown', handleKeyDown);
    };

    this.trapStack.push(cleanup);
    return cleanup;
  }

  // Remove focus trap
  removeFocusTrap() {
    const cleanup = this.trapStack.pop();
    if (cleanup) cleanup();
  }
}

// Global focus manager instance
export const focusManager = new FocusManager();

/**
 * Keyboard Navigation Utilities
 */
export const KeyboardNavigation = {
  // Arrow key navigation for lists and grids
  handleArrowNavigation(event, elements, currentIndex, options = {}) {
    const {
      orientation = 'vertical', // 'vertical', 'horizontal', 'grid'
      wrap = true,
      columns = 1
    } = options;

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid' 
            ? Math.min(currentIndex + columns, elements.length - 1)
            : currentIndex + 1;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid'
            ? Math.max(currentIndex - columns, 0)
            : currentIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex - 1;
        }
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = elements.length - 1;
        break;
      default:
        return false;
    }

    // Handle wrapping
    if (wrap) {
      if (newIndex < 0) newIndex = elements.length - 1;
      if (newIndex >= elements.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, elements.length - 1));
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      focusManager.setFocus(elements[newIndex]);
      return newIndex;
    }

    return currentIndex;
  },

  // Type-ahead search for lists
  handleTypeAhead(event, elements, getText) {
    if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) {
      return -1;
    }

    const searchChar = event.key.toLowerCase();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    // Search from current position forward
    for (let i = currentIndex + 1; i < elements.length; i++) {
      const text = getText(elements[i]).toLowerCase();
      if (text.startsWith(searchChar)) {
        focusManager.setFocus(elements[i]);
        return i;
      }
    }

    // Search from beginning to current position
    for (let i = 0; i <= currentIndex; i++) {
      const text = getText(elements[i]).toLowerCase();
      if (text.startsWith(searchChar)) {
        focusManager.setFocus(elements[i]);
        return i;
      }
    }

    return -1;
  }
};

/**
 * Screen Reader Utilities
 */
export const ScreenReader = {
  // Announce messages to screen readers
  announce(message, priority = 'polite') {
    ariaLiveManager.announce(message, priority);
  },

  // Announce page changes
  announcePageChange(pageName, additionalInfo = '') {
    const message = `Navigated to ${pageName}${additionalInfo ? '. ' + additionalInfo : ''}`;
    this.announce(message, 'polite');
  },

  // Announce form errors
  announceFormErrors(errors) {
    if (Array.isArray(errors) && errors.length > 0) {
      const message = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`;
      this.announce(message, 'assertive');
    }
  },

  // Announce loading states
  announceLoading(isLoading, context = '') {
    const message = isLoading 
      ? `Loading${context ? ' ' + context : ''}...`
      : `Loading complete${context ? ' for ' + context : ''}`;
    this.announce(message, 'polite');
  }
};

/**
 * High Contrast and Color Utilities
 */
export const ColorAccessibility = {
  // Check if high contrast mode is enabled
  isHighContrastMode() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check color scheme preference
  getColorSchemePreference() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'no-preference';
  },

  // Apply high contrast styles
  applyHighContrastMode(enable = true) {
    const root = document.documentElement;
    if (enable) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  },

  // Calculate color contrast ratio
  getContrastRatio(color1, color2) {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
};

/**
 * ARIA Utilities
 */
export const AriaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId(prefix = 'aria') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Set ARIA attributes safely
  setAriaAttribute(element, attribute, value) {
    if (!element) return;
    
    if (value === null || value === undefined) {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, String(value));
    }
  },

  // Manage ARIA expanded state
  setExpanded(element, expanded) {
    this.setAriaAttribute(element, 'aria-expanded', expanded);
  },

  // Manage ARIA selected state
  setSelected(element, selected) {
    this.setAriaAttribute(element, 'aria-selected', selected);
  },

  // Manage ARIA pressed state
  setPressed(element, pressed) {
    this.setAriaAttribute(element, 'aria-pressed', pressed);
  },

  // Manage ARIA checked state
  setChecked(element, checked) {
    this.setAriaAttribute(element, 'aria-checked', checked);
  },

  // Set ARIA describedby relationship
  setDescribedBy(element, ids) {
    if (Array.isArray(ids)) {
      ids = ids.filter(Boolean).join(' ');
    }
    this.setAriaAttribute(element, 'aria-describedby', ids || null);
  },

  // Set ARIA labelledby relationship
  setLabelledBy(element, ids) {
    if (Array.isArray(ids)) {
      ids = ids.filter(Boolean).join(' ');
    }
    this.setAriaAttribute(element, 'aria-labelledby', ids || null);
  }
};

/**
 * Accessibility Testing Utilities
 */
export const AccessibilityTesting = {
  // Check for common accessibility issues
  async runBasicChecks(container = document) {
    const issues = [];

    // Check for images without alt text
    const images = container.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }

    // Check for buttons without accessible names
    const buttons = container.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        issues.push('Button without accessible name found');
      }
    });

    // Check for form inputs without labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (!id || !container.querySelector(`label[for="${id}"]`)) {
        issues.push(`Input without label: ${input.type || 'text'}`);
      }
    });

    // Check for insufficient color contrast (basic check)
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      const styles = getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== backgroundColor) {
        const contrast = ColorAccessibility.getContrastRatio(color, backgroundColor);
        if (contrast < 4.5) {
          issues.push(`Low contrast ratio detected: ${contrast.toFixed(2)}`);
        }
      }
    });

    return issues;
  },

  // Log accessibility issues to console
  logAccessibilityIssues(issues) {
    if (issues.length === 0) {
      //console.log('✅ No basic accessibility issues found');
    } else {
      console.warn('⚠️ Accessibility issues found:');
      issues.forEach(issue => console.warn(`  - ${issue}`));
    }
  }
};

/**
 * Initialize accessibility features
 */
export function initializeAccessibility() {
  // Set up global keyboard event handlers
  document.addEventListener('keydown', (event) => {
    // Skip links functionality
    if (event.key === 'Tab' && !event.shiftKey && event.target === document.body) {
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.focus();
      }
    }
  });

  // Apply user preferences
  const highContrast = ColorAccessibility.isHighContrastMode();
  if (highContrast) {
    ColorAccessibility.applyHighContrastMode(true);
  }

  // Set up media query listeners
  try {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (contrastQuery.addEventListener) {
      contrastQuery.addEventListener('change', (e) => {
        ColorAccessibility.applyHighContrastMode(e.matches);
      });
    } else if (contrastQuery.addListener) {
      contrastQuery.addListener((e) => {
        ColorAccessibility.applyHighContrastMode(e.matches);
      });
    }
  } catch (error) {
    console.warn('Could not set up media query listeners:', error);
  }

  // Initialize ARIA live regions
  ariaLiveManager.init();

  //console.log('🔧 Accessibility features initialized');
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccessibility);
  } else {
    initializeAccessibility();
  }
}