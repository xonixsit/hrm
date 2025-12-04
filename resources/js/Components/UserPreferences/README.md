# User Preferences System

This document describes the user preferences management system implemented for the modern UI/UX revamp.

## Overview

The user preferences system allows users to customize their interface experience with persistent settings that sync across browser sessions. It includes accessibility features, layout preferences, and theme customization.

## Components

### 1. useUserPreferences Composable (`@/composables/useUserPreferences.js`)

The core composable that manages all user preferences with the following features:

#### Features:
- **Persistent Storage**: Automatically saves preferences to localStorage
- **Validation**: Validates all preference values before setting
- **Event System**: Dispatches events when preferences change
- **DOM Integration**: Automatically applies preferences to the DOM
- **Import/Export**: Allows users to backup and restore their preferences
- **Default Management**: Easy reset to default values

#### Available Preferences:
- **Theme**: Light, dark, or system theme
- **Layout**: Sidebar collapse state, width, default view mode
- **Accessibility**: Font size, weight, line height, density, motion reduction, high contrast
- **Color Vision**: Support for protanopia, deuteranopia, tritanopia, and monochrome
- **Notifications**: Sound and desktop notification preferences
- **Advanced**: Auto-save, confirmation dialogs, keyboard shortcuts

#### Usage:
```javascript
import { useUserPreferences } from '@/composables/useUserPreferences';

const {
  preferences,
  setPreference,
  setPreferences,
  resetPreferences,
  exportPreferences,
  importPreferences
} = useUserPreferences();

// Set a single preference
setPreference('fontSize', 'large');

// Set multiple preferences
setPreferences({
  fontSize: 'large',
  density: 'compact',
  theme: 'dark'
});
```

### 2. UserPreferences Component (`@/Components/UserPreferences.vue`)

A comprehensive modal interface for managing all user preferences.

#### Features:
- **Tabbed Interface**: Organized into logical sections
- **Live Preview**: Changes apply immediately
- **Validation**: Prevents invalid settings
- **Import/Export**: Built-in backup/restore functionality
- **Keyboard Navigation**: Full keyboard accessibility
- **Responsive Design**: Works on all screen sizes

#### Sections:
1. **Theme & Appearance**: Color theme and system theme preferences
2. **Layout & Navigation**: Sidebar settings, default views, pagination
3. **Accessibility**: Font settings, motion reduction, high contrast, color vision support
4. **Notifications**: Sound and desktop notification settings
5. **Advanced**: Auto-save, confirmations, keyboard shortcuts, backup/restore

### 3. UserPreferencesTrigger Component (`@/Components/UserPreferencesTrigger.vue`)

A simple trigger button that opens the preferences modal.

#### Features:
- **Customizable**: Icon, label, and styling can be customized
- **Accessible**: Proper ARIA attributes and keyboard support
- **Event Handling**: Emits events for integration with parent components

#### Usage:
```vue
<UserPreferencesTrigger
  :show-label="true"
  trigger-icon="cog"
  trigger-label="Preferences"
  @preferences-saved="handlePreferencesSave"
/>
```

### 4. ToggleSwitch Component (`@/Components/Base/ToggleSwitch.vue`)

A modern toggle switch component used throughout the preferences interface.

#### Features:
- **Accessible**: Full ARIA support and keyboard navigation
- **Customizable**: Icons, sizes, and styling options
- **v-model Support**: Works with Vue's v-model directive
- **Visual States**: Proper visual feedback for all states

## CSS Integration

### Accessibility Styles (`resources/css/app.css`)

The CSS includes comprehensive accessibility support:

#### CSS Custom Properties:
```css
:root {
  --base-font-size: 16px;
  --base-font-weight: 400;
  --base-line-height: 1.5;
  --density-scale: 1;
}
```

#### Accessibility Classes:
- `.high-contrast`: Enhanced contrast for better visibility
- `.reduce-motion`: Disables animations for motion-sensitive users
- `.protanopia`, `.deuteranopia`, `.tritanopia`: Color vision support
- `.monochrome`: Grayscale mode
- Font size classes: `.font-size-small`, `.font-size-large`, etc.
- Density classes: `.density-compact`, `.density-comfortable`

## Integration

### Sidebar Navigation Integration

The preferences system is integrated into the sidebar navigation:

```vue
<!-- In SidebarNavigation.vue -->
<UserPreferencesTrigger
  :show-label="!isCollapsed"
  trigger-icon="cog"
  trigger-label="Preferences"
/>
```

### Theme System Integration

The preferences system integrates with the existing theme system:

```javascript
// Automatically applies theme changes
setPreference('theme', 'dark'); // Calls useTheme().setTheme('dark')
setPreference('useSystemTheme', true); // Calls useTheme().useSystemTheme()
```

## Persistence and Synchronization

### Local Storage
All preferences are automatically saved to localStorage with the key `user-preferences`.

### Data Structure:
```json
{
  "theme": "system",
  "useSystemTheme": true,
  "sidebarCollapsed": false,
  "fontSize": "normal",
  "density": "normal",
  "reducedMotion": false,
  "highContrast": false,
  "colorScheme": "default",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Future Synchronization
The system is designed to support server-side synchronization in the future with the `syncPreferences()` method.

## Accessibility Features

### WCAG 2.1 AA Compliance
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic markup

### Visual Accessibility
- Font size adjustment (small to extra-large)
- Font weight options (light to bold)
- Line height adjustment (tight to loose)
- Interface density options (compact to comfortable)
- High contrast mode
- Motion reduction for vestibular disorders

### Color Vision Accessibility
- Protanopia support (red-blind)
- Deuteranopia support (green-blind)
- Tritanopia support (blue-blind)
- Monochrome mode

## Testing

### Test Coverage
- Unit tests for the composable functionality
- Component tests for UI components
- Integration tests for system-wide functionality
- Accessibility tests for WCAG compliance

### Test Files:
- `tests/js/composables/useUserPreferences.test.js`
- `tests/js/components/UserPreferences.test.js`
- `tests/js/components/UserPreferencesTrigger.test.js`
- `tests/js/components/Base/ToggleSwitch.test.js`
- `tests/js/integration/UserPreferencesIntegration.test.js`

## Usage Examples

### Basic Usage
```javascript
// Get current preferences
const { preferences } = useUserPreferences();
//console.log(preferences.value.fontSize); // 'normal'

// Change font size
setPreference('fontSize', 'large');

// Enable high contrast
setPreference('highContrast', true);

// Reset all preferences
resetPreferences();
```

### Component Integration
```vue
<template>
  <div>
    <!-- Trigger button -->
    <UserPreferencesTrigger />
    
    <!-- Or use the modal directly -->
    <UserPreferences
      :is-open="showPreferences"
      @close="showPreferences = false"
      @save="handleSave"
    />
  </div>
</template>
```

### CSS Integration
```css
/* Automatically applied based on preferences */
.my-component {
  font-size: var(--base-font-size);
  font-weight: var(--base-font-weight);
  line-height: var(--base-line-height);
  transform: scale(var(--density-scale));
}
```

## Browser Support

- Modern browsers with ES6+ support
- localStorage support required
- CSS custom properties support required
- Supports all major browsers (Chrome, Firefox, Safari, Edge)

## Performance

- Lightweight: ~15KB gzipped for all components
- Efficient: Only applies DOM changes when preferences change
- Cached: Preferences loaded once and cached in memory
- Optimized: Minimal re-renders with Vue's reactivity system

## Future Enhancements

1. **Server Synchronization**: Sync preferences across devices
2. **Team Preferences**: Shared preferences for organizations
3. **Advanced Themes**: Custom color schemes and themes
4. **Keyboard Shortcuts**: Customizable keyboard shortcuts
5. **Plugin System**: Allow third-party preference extensions