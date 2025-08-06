# Design System Foundation

This directory contains the foundational components and configuration for the modern UI/UX design system.

## Overview

The design system provides:
- **Consistent Design Tokens**: Colors, typography, spacing, and component styles
- **Icon System**: Heroicons v2 and Lucide icons with semantic naming
- **CSS Custom Properties**: Design tokens available as CSS variables
- **Base Utility Classes**: Pre-built classes for common patterns
- **Component Utilities**: Helper functions for generating component classes

## Design Tokens

### Colors
- **Primary**: Indigo gradient (`#6366f1` to `#8b5cf6`)
- **Secondary**: Cyan to Sky gradient (`#06b6d4` to `#0ea5e9`)
- **Accent**: Amber (`#f59e0b`) for highlights and CTAs
- **Neutral**: Enhanced gray scale for backgrounds and text
- **Semantic**: Success, Warning, Error, Info colors

### Typography
- **Font Family**: Inter (primary), system fonts fallback
- **Scales**: Display, H1-H4, Body (lg, regular, sm), Caption
- **Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)

### Spacing
- **Base Unit**: 4px grid system
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px

### Border Radius
- **Small**: 6px
- **Medium**: 8px  
- **Large**: 12px
- **XL**: 16px
- **Full**: 9999px (pills and avatars)

## Icon System

### Usage
```vue
<template>
  <Icon name="home" size="md" color="primary" />
  <Icon name="users" size="lg" />
  <Icon name="check-circle" color="success" />
</template>
```

### Available Icons
- **Navigation**: home, menu, chevron-*, arrow-*
- **Users**: user, users, user-circle, user-plus
- **Business**: building, briefcase, folder, document
- **Time**: calendar, clock, calendar-check, calendar-x
- **Communication**: chat, bell, envelope, phone
- **Actions**: plus, minus, edit, delete, view, search
- **Status**: check, check-circle, x-circle, warning, info
- **Files**: document-download, document-upload, photo
- **Interface**: dots-*, adjustments, filter, grid, list

### Icon Sizes
- **xs**: 12px
- **sm**: 16px
- **md**: 20px (default)
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## CSS Utility Classes

### Buttons
```css
.btn-base .btn-md .btn-primary    /* Primary button */
.btn-base .btn-lg .btn-secondary  /* Secondary button */
.btn-base .btn-sm .btn-ghost      /* Ghost button */
```

### Form Inputs
```css
.input-base .input-md             /* Regular input */
.input-base .input-lg .input-error /* Error state */
.input-base .input-sm .input-success /* Success state */
```

### Cards
```css
.card-base .card-md               /* Medium card */
.card-base .card-lg .card-hover   /* Large card with hover */
```

### Typography
```css
.text-display    /* 48px display text */
.text-h1         /* 36px heading */
.text-h2         /* 30px heading */
.text-body       /* 16px body text */
.text-body-sm    /* 14px small text */
.text-caption    /* 12px caption */
```

### Layout
```css
.container-lg     /* Large container */
.container-md     /* Medium container */
.space-y-section  /* Section spacing */
.space-y-content  /* Content spacing */
```

## Component Utilities

### JavaScript Helpers
```javascript
import { getButtonClasses, getInputClasses } from '@/utils/designSystem.js';

// Generate button classes
const buttonClass = getButtonClasses('primary', 'md', { fullWidth: true });

// Generate input classes  
const inputClass = getInputClasses('lg', { error: true });
```

### Design Token Access
```javascript
import { getToken, getCSSVar } from '@/utils/designSystem.js';

// Get token value
const primaryColor = getToken('colors.primary.500');

// Get CSS custom property
const primaryVar = getCSSVar('color-primary-500');
```

## CSS Custom Properties

All design tokens are available as CSS custom properties:

```css
:root {
  --color-primary-500: #6366f1;
  --color-secondary-500: #06b6d4;
  --spacing-4: 16px;
  --radius-lg: 12px;
  /* ... and many more */
}
```

## Animation System

### Durations
- **Fast**: 150ms
- **Normal**: 200ms (default)
- **Slow**: 300ms
- **Slower**: 500ms

### Easing
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)` (default)
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)`
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)`

### Animation Classes
```css
.animate-fade-in     /* Fade in animation */
.animate-slide-up    /* Slide up animation */
.animate-scale-in    /* Scale in animation */
.loading-shimmer     /* Shimmer loading effect */
.loading-pulse       /* Pulse loading effect */
```

## Accessibility

### Focus States
All interactive elements include proper focus indicators:
```css
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Color Contrast
All color combinations meet WCAG 2.1 AA standards for accessibility.

### Screen Reader Support
Icons include proper ARIA labels when needed:
```vue
<Icon name="home" aria-label="Go to homepage" />
```

## Usage Examples

See `resources/js/Components/Examples/DesignSystemDemo.vue` for comprehensive usage examples of all design system components and utilities.

## Files Structure

```
resources/js/
├── config/
│   ├── designTokens.js     # Design token definitions
│   └── icons.js            # Icon system configuration
├── utils/
│   └── designSystem.js     # Utility functions
├── Components/
│   ├── Base/
│   │   ├── Icon.vue        # Base icon component
│   │   └── README.md       # This file
│   └── Examples/
│       └── DesignSystemDemo.vue # Usage examples
└── css/
    └── app.css             # CSS with design tokens and utilities
```

## Next Steps

This foundation enables the creation of:
1. Modern button component system (Task 2.1)
2. Enhanced form component library (Task 2.2)  
3. Icon system and components (Task 2.3)
4. Navigation system components (Task 3.x)
5. All other modern UI components

The design system is now ready for building the complete component library and implementing the modern UI/UX across the application.