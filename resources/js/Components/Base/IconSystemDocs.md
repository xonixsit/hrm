# Icon System Documentation

## Overview

The icon system provides a centralized, semantic approach to using icons throughout the application. It combines Heroicons v2 and Lucide icons with a consistent API and fallback mechanisms.

## Features

- **Semantic naming**: Use meaningful names like `home`, `user`, `settings` instead of remembering specific icon component names
- **Consistent sizing**: Standardized size variants from `xs` to `2xl`
- **Color variants**: Built-in color system integration
- **State management**: Loading, disabled, and clickable states
- **Accessibility**: Proper ARIA attributes and screen reader support
- **Fallback handling**: Graceful degradation when icons are missing
- **Type safety**: Full TypeScript support with prop validation

## Basic Usage

### Simple Icon

```vue
<template>
  <Icon name="home" />
  <Icon name="user" size="lg" />
  <Icon name="settings" color="primary" />
</template>

<script setup>
import Icon from '@/Components/Base/Icon.vue';
</script>
```

### With States

```vue
<template>
  <!-- Loading state -->
  <Icon name="refresh" loading />
  
  <!-- Disabled state -->
  <Icon name="edit" disabled />
  
  <!-- Clickable state -->
  <Icon name="close" clickable @click="handleClose" />
</template>
```

## Size Variants

| Size | Class | Dimensions | Use Case |
|------|-------|------------|----------|
| `xs` | `icon-xs` | 12×12px | Small inline icons, badges |
| `sm` | `icon-sm` | 16×16px | Form inputs, buttons |
| `md` | `icon-md` | 20×20px | Navigation, default size |
| `lg` | `icon-lg` | 24×24px | Headers, prominent actions |
| `xl` | `icon-xl` | 32×32px | Large buttons, features |
| `2xl` | `icon-2xl` | 48×48px | Hero sections, empty states |

```vue
<template>
  <Icon name="star" size="xs" />   <!-- 12px -->
  <Icon name="star" size="sm" />   <!-- 16px -->
  <Icon name="star" size="md" />   <!-- 20px (default) -->
  <Icon name="star" size="lg" />   <!-- 24px -->
  <Icon name="star" size="xl" />   <!-- 32px -->
  <Icon name="star" size="2xl" />  <!-- 48px -->
</template>
```

## Color Variants

| Color | Class | Use Case |
|-------|-------|----------|
| `current` | `text-current` | Inherit parent color (default) |
| `primary` | `text-primary-500` | Primary actions, branding |
| `secondary` | `text-secondary-500` | Secondary actions |
| `accent` | `text-accent-500` | Highlights, CTAs |
| `neutral` | `text-neutral-500` | Subtle, secondary content |
| `success` | `text-success-500` | Success states |
| `warning` | `text-warning-500` | Warning states |
| `error` | `text-error-500` | Error states |
| `info` | `text-info-500` | Information states |
| `white` | `text-white` | Dark backgrounds |

```vue
<template>
  <Icon name="check" color="success" />
  <Icon name="warning" color="warning" />
  <Icon name="info" color="info" />
  <Icon name="trash" color="error" />
</template>
```

## Icon Categories

### Navigation Icons
```vue
<Icon name="home" />          <!-- Dashboard/Home -->
<Icon name="menu" />          <!-- Hamburger menu -->
<Icon name="close" />         <!-- Close/X -->
<Icon name="chevron-down" />  <!-- Dropdown indicator -->
<Icon name="arrow-left" />    <!-- Back navigation -->
```

### User Management
```vue
<Icon name="user" />          <!-- Single user -->
<Icon name="users" />         <!-- Multiple users -->
<Icon name="user-circle" />   <!-- User profile -->
<Icon name="user-plus" />     <!-- Add user -->
```

### Business Entities
```vue
<Icon name="building" />      <!-- Company/Department -->
<Icon name="briefcase" />     <!-- Business/Work -->
<Icon name="folder" />        <!-- Projects/Files -->
<Icon name="document" />      <!-- Documents/Reports -->
```

### Time Management
```vue
<Icon name="calendar" />      <!-- Calendar/Dates -->
<Icon name="calendar-check" /><!-- Attendance -->
<Icon name="calendar-x" />    <!-- Leave/Absence -->
<Icon name="clock" />         <!-- Time/Duration -->
```

### Actions
```vue
<Icon name="plus" />          <!-- Add/Create -->
<Icon name="edit" />          <!-- Edit/Modify -->
<Icon name="trash" />         <!-- Delete/Remove -->
<Icon name="search" />        <!-- Search/Find -->
<Icon name="settings" />      <!-- Settings/Config -->
```

### Status Indicators
```vue
<Icon name="check-circle" />  <!-- Success -->
<Icon name="x-circle" />      <!-- Error -->
<Icon name="warning" />       <!-- Warning -->
<Icon name="info" />          <!-- Information -->
```

## Helper Functions

### getIcon(iconName)
Get an icon component by semantic name:

```javascript
import { getIcon } from '@/config/icons.js';

const homeIcon = getIcon('home');
const userIcon = getIcon('user');
```

### getNavigationIcon(routeName)
Get navigation-specific icons:

```javascript
import { getNavigationIcon } from '@/config/icons.js';

const dashboardIcon = getNavigationIcon('dashboard'); // Returns home icon
const settingsIcon = getNavigationIcon('settings');   // Returns cog icon
```

### getStatusIcon(status)
Get status-specific icons:

```javascript
import { getStatusIcon } from '@/config/icons.js';

const successIcon = getStatusIcon('success');   // Returns check-circle-solid
const errorIcon = getStatusIcon('error');       // Returns x-circle-solid
```

### getActionIcon(action)
Get action-specific icons:

```javascript
import { getActionIcon } from '@/config/icons.js';

const createIcon = getActionIcon('create');     // Returns plus icon
const editIcon = getActionIcon('edit');         // Returns pencil icon
```

## Advanced Usage

### Custom Classes
```vue
<template>
  <Icon 
    name="star" 
    class="hover:text-yellow-500 transition-colors" 
  />
</template>
```

### Accessibility
```vue
<template>
  <!-- Decorative icon (hidden from screen readers) -->
  <Icon name="star" />
  
  <!-- Meaningful icon (announced by screen readers) -->
  <Icon name="close" aria-label="Close dialog" />
</template>
```

### Dynamic Icons
```vue
<template>
  <Icon :name="statusIcon" :color="statusColor" />
</template>

<script setup>
import { computed } from 'vue';
import { getStatusIcon } from '@/config/icons.js';

const props = defineProps(['status']);

const statusIcon = computed(() => {
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'warning',
    info: 'info'
  };
  return iconMap[props.status] || 'info';
});

const statusColor = computed(() => {
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  return colorMap[props.status] || 'neutral';
});
</script>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `String` | **required** | Semantic name of the icon |
| `size` | `String` | `'md'` | Size variant: `xs`, `sm`, `md`, `lg`, `xl`, `2xl` |
| `color` | `String` | `'current'` | Color variant |
| `loading` | `Boolean` | `false` | Show spinning animation |
| `disabled` | `Boolean` | `false` | Apply disabled styling |
| `clickable` | `Boolean` | `false` | Add pointer cursor |
| `class` | `String|Array|Object` | `''` | Custom CSS classes |
| `ariaLabel` | `String` | `''` | Accessibility label |

## Best Practices

### 1. Use Semantic Names
```vue
<!-- Good -->
<Icon name="home" />
<Icon name="user" />
<Icon name="settings" />

<!-- Avoid -->
<HomeIcon />
<UserIcon />
<CogIcon />
```

### 2. Consistent Sizing
```vue
<!-- Good: Use size prop -->
<Icon name="edit" size="sm" />

<!-- Avoid: Custom sizing -->
<Icon name="edit" class="w-4 h-4" />
```

### 3. Proper Accessibility
```vue
<!-- Good: Meaningful icons have labels -->
<button>
  <Icon name="close" aria-label="Close dialog" />
</button>

<!-- Good: Decorative icons are hidden -->
<div>
  <Icon name="star" /> <!-- Automatically aria-hidden -->
  Featured Item
</div>
```

### 4. State Management
```vue
<!-- Good: Use built-in states -->
<Icon name="refresh" :loading="isLoading" />
<Icon name="edit" :disabled="!canEdit" />

<!-- Avoid: Manual state styling -->
<Icon name="refresh" :class="{ 'animate-spin': isLoading }" />
```

## Adding New Icons

### 1. Import the Icon Component
```javascript
// In resources/js/config/icons.js
import { NewIcon } from '@heroicons/vue/24/outline';
// or
import { NewIcon } from 'lucide-vue-next';
```

### 2. Add to Icon Map
```javascript
export const iconMap = {
  // ... existing icons
  'new-icon': NewIcon,
};
```

### 3. Add to Semantic Categories (if applicable)
```javascript
export const navigationIcons = {
  // ... existing mappings
  'new-route': 'new-icon',
};
```

### 4. Update Tests
Add the new icon to the relevant test cases to ensure it's properly mapped and accessible.

## Troubleshooting

### Icon Not Displaying
1. Check if the icon name exists in the `iconMap`
2. Verify the icon component is properly imported
3. Check browser console for warnings

### Icon Size Issues
1. Ensure you're using the `size` prop instead of custom classes
2. Verify the icon size classes are defined in CSS
3. Check for conflicting CSS that might override icon dimensions

### Accessibility Issues
1. Add `aria-label` for meaningful icons
2. Ensure decorative icons don't have labels (they'll be automatically hidden)
3. Test with screen readers to verify proper announcements

## Migration Guide

### From Direct Icon Imports
```vue
<!-- Before -->
<script setup>
import { HomeIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <HomeIcon class="w-5 h-5 text-teal-500" />
</template>

<!-- After -->
<script setup>
import Icon from '@/Components/Base/Icon.vue';
</script>

<template>
  <Icon name="home" size="md" color="primary" />
</template>
```

### From Custom Icon Components
```vue
<!-- Before -->
<CustomIcon type="user" variant="large" theme="primary" />

<!-- After -->
<Icon name="user" size="lg" color="primary" />
```