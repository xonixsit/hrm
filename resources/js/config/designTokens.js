/**
 * Design Tokens Configuration
 * 
 * This file contains all design tokens for the modern UI/UX revamp.
 * These tokens ensure consistency across the entire application.
 */

export const designTokens = {
  // Color System
  colors: {
    // Primary Colors - Modern gradient-based scheme
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#6366f1', // Main primary color
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b'
    },
    
    // Secondary Colors - Cyan to Sky gradient
    secondary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4', // Main secondary color
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344'
    },
    
    // Accent Colors - Amber for highlights and CTAs
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main accent color
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    
    // Neutral Colors - Enhanced gray scale
    neutral: {
      50: '#fafafa',  // Main background
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#6b7280', // Secondary text
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#111827', // Primary text
      950: '#0a0a0a'
    },
    
    // Semantic Colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main success color
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning color
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error color
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main info color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    }
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
    },
    
    fontSize: {
      xs: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      sm: ['14px', { lineHeight: '20px', fontWeight: '400' }],
      base: ['16px', { lineHeight: '24px', fontWeight: '400' }],
      lg: ['18px', { lineHeight: '28px', fontWeight: '400' }],
      xl: ['20px', { lineHeight: '28px', fontWeight: '500' }],
      '2xl': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      '3xl': ['30px', { lineHeight: '36px', fontWeight: '600' }],
      '4xl': ['36px', { lineHeight: '40px', fontWeight: '700' }],
      '5xl': ['48px', { lineHeight: '56px', fontWeight: '700' }]
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em'
    }
  },
  
  // Spacing System (based on 4px grid)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px'
  },
  
  // Border Radius System
  borderRadius: {
    none: '0px',
    sm: '6px',
    base: '8px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px'
  },
  
  // Shadow System
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  
  // Animation System
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
        xl: '56px'
      },
      padding: {
        sm: '8px 12px',
        md: '12px 16px',
        lg: '16px 24px',
        xl: '20px 32px'
      }
    },
    
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px'
      },
      padding: {
        sm: '8px 12px',
        md: '12px 16px',
        lg: '16px 20px'
      }
    },
    
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px'
      }
    }
  },
  
  // Icon System
  icons: {
    size: {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    }
  },
  
  // Z-index System
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Export individual token categories for easier imports
export const colors = designTokens.colors;
export const typography = designTokens.typography;
export const spacing = designTokens.spacing;
export const borderRadius = designTokens.borderRadius;
export const boxShadow = designTokens.boxShadow;
export const animation = designTokens.animation;
export const components = designTokens.components;
export const icons = designTokens.icons;
export const zIndex = designTokens.zIndex;

export default designTokens;