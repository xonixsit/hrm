/**
 * Design System Utilities
 * 
 * This file provides utility functions for working with the design system,
 * including class name generation, token access, and component styling helpers.
 */

import { designTokens } from '@/config/designTokens.js';

/**
 * Generate button classes based on variant and size
 * @param {string} variant - Button variant (primary, secondary, ghost)
 * @param {string} size - Button size (sm, md, lg, xl)
 * @param {object} options - Additional options
 * @returns {string} - Combined class string
 */
export function getButtonClasses(variant = 'primary', size = 'md', options = {}) {
  const baseClasses = 'btn-base';
  const sizeClass = `btn-${size}`;
  const variantClass = `btn-${variant}`;
  
  const additionalClasses = [];
  
  if (options.loading) {
    additionalClasses.push('opacity-75', 'cursor-wait');
  }
  
  if (options.fullWidth) {
    additionalClasses.push('w-full');
  }
  
  if (options.iconOnly) {
    additionalClasses.push('p-0', 'aspect-square');
  }
  
  return [baseClasses, sizeClass, variantClass, ...additionalClasses].join(' ');
}

/**
 * Generate input classes based on size and state
 * @param {string} size - Input size (sm, md, lg)
 * @param {object} options - Additional options
 * @returns {string} - Combined class string
 */
export function getInputClasses(size = 'md', options = {}) {
  const baseClasses = 'input-base';
  const sizeClass = `input-${size}`;
  
  const additionalClasses = [];
  
  if (options.error) {
    additionalClasses.push('input-error');
  } else if (options.success) {
    additionalClasses.push('input-success');
  }
  
  if (options.fullWidth) {
    additionalClasses.push('w-full');
  }
  
  return [baseClasses, sizeClass, ...additionalClasses].join(' ');
}

/**
 * Generate card classes based on size and options
 * @param {string} size - Card size (sm, md, lg)
 * @param {object} options - Additional options
 * @returns {string} - Combined class string
 */
export function getCardClasses(size = 'md', options = {}) {
  const baseClasses = 'card-base';
  const sizeClass = `card-${size}`;
  
  const additionalClasses = [];
  
  if (options.hover) {
    additionalClasses.push('card-hover');
  }
  
  if (options.interactive) {
    additionalClasses.push('cursor-pointer', 'transition-all', 'duration-normal');
  }
  
  return [baseClasses, sizeClass, ...additionalClasses].join(' ');
}

/**
 * Generate spacing classes for consistent layout
 * @param {string} direction - Spacing direction (x, y, t, r, b, l, all)
 * @param {string|number} size - Spacing size from design tokens
 * @returns {string} - Spacing class
 */
export function getSpacingClass(direction, size) {
  const directionMap = {
    x: 'px',
    y: 'py',
    t: 'pt',
    r: 'pr',
    b: 'pb',
    l: 'pl',
    all: 'p'
  };
  
  const prefix = directionMap[direction] || 'p';
  return `${prefix}-${size}`;
}

/**
 * Generate margin classes for consistent layout
 * @param {string} direction - Margin direction (x, y, t, r, b, l, all)
 * @param {string|number} size - Margin size from design tokens
 * @returns {string} - Margin class
 */
export function getMarginClass(direction, size) {
  const directionMap = {
    x: 'mx',
    y: 'my',
    t: 'mt',
    r: 'mr',
    b: 'mb',
    l: 'ml',
    all: 'm'
  };
  
  const prefix = directionMap[direction] || 'm';
  return `${prefix}-${size}`;
}

/**
 * Generate text classes based on typography scale
 * @param {string} scale - Typography scale (display, h1, h2, h3, h4, body-lg, body, body-sm, caption)
 * @param {object} options - Additional options
 * @returns {string} - Combined text classes
 */
export function getTextClasses(scale = 'body', options = {}) {
  const scaleClass = `text-${scale}`;
  const additionalClasses = [];
  
  if (options.color) {
    additionalClasses.push(`text-${options.color}`);
  }
  
  if (options.weight) {
    additionalClasses.push(`font-${options.weight}`);
  }
  
  if (options.align) {
    additionalClasses.push(`text-${options.align}`);
  }
  
  return [scaleClass, ...additionalClasses].join(' ');
}

/**
 * Generate responsive container classes
 * @param {string} size - Container size (fluid, sm, md, lg, xl)
 * @returns {string} - Container class
 */
export function getContainerClass(size = 'lg') {
  return `container-${size}`;
}

/**
 * Generate animation classes
 * @param {string} animation - Animation type (fade-in, slide-up, scale-in)
 * @param {object} options - Animation options
 * @returns {string} - Animation classes
 */
export function getAnimationClasses(animation, options = {}) {
  const baseClass = `animate-${animation}`;
  const additionalClasses = [];
  
  if (options.delay) {
    additionalClasses.push(`delay-${options.delay}`);
  }
  
  if (options.duration) {
    additionalClasses.push(`duration-${options.duration}`);
  }
  
  return [baseClass, ...additionalClasses].join(' ');
}

/**
 * Generate status-based classes (colors, backgrounds, borders)
 * @param {string} status - Status type (success, warning, error, info)
 * @param {string} type - Class type (text, bg, border)
 * @returns {string} - Status class
 */
export function getStatusClass(status, type = 'text') {
  const statusMap = {
    success: 'success-500',
    warning: 'warning-500',
    error: 'error-500',
    info: 'info-500'
  };
  
  const color = statusMap[status];
  if (!color) return '';
  
  const typeMap = {
    text: 'text',
    bg: 'bg',
    border: 'border'
  };
  
  const prefix = typeMap[type] || 'text';
  return `${prefix}-${color}`;
}

/**
 * Generate focus ring classes for accessibility
 * @param {string} color - Focus ring color (primary, secondary, etc.)
 * @returns {string} - Focus ring classes
 */
export function getFocusRingClasses(color = 'primary') {
  return `focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`;
}

/**
 * Generate hover state classes
 * @param {string} type - Hover type (bg, text, border, shadow)
 * @param {string} value - Hover value
 * @returns {string} - Hover classes
 */
export function getHoverClasses(type, value) {
  return `hover:${type}-${value}`;
}

/**
 * Combine multiple class arrays/strings into a single string
 * @param {...(string|Array)} classes - Classes to combine
 * @returns {string} - Combined class string
 */
export function combineClasses(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get design token value by path
 * @param {string} path - Dot notation path to token (e.g., 'colors.primary.500')
 * @returns {any} - Token value
 */
export function getToken(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], designTokens);
}

/**
 * Generate CSS custom property name from token path
 * @param {string} path - Token path
 * @returns {string} - CSS custom property name
 */
export function getCSSVar(path) {
  return `var(--${path.replace(/\./g, '-')})`;
}

/**
 * Responsive utility for generating classes across breakpoints
 * @param {object} breakpoints - Object with breakpoint keys and class values
 * @returns {string} - Responsive classes
 */
export function responsive(breakpoints) {
  const classes = [];
  
  Object.entries(breakpoints).forEach(([breakpoint, className]) => {
    if (breakpoint === 'base') {
      classes.push(className);
    } else {
      classes.push(`${breakpoint}:${className}`);
    }
  });
  
  return classes.join(' ');
}

export default {
  getButtonClasses,
  getInputClasses,
  getCardClasses,
  getSpacingClass,
  getMarginClass,
  getTextClasses,
  getContainerClass,
  getAnimationClasses,
  getStatusClass,
  getFocusRingClasses,
  getHoverClasses,
  combineClasses,
  getToken,
  getCSSVar,
  responsive,
};