# Loading States and Skeleton Screens

This directory contains a comprehensive loading states system with skeleton screens, progress indicators, and shimmer effects for the modern UI/UX design system.

## Components Overview

### 1. SkeletonLoader.vue
A versatile skeleton loading component that provides placeholder content while data is being fetched.

**Features:**
- Multiple skeleton types: text, card, list, form, rectangle, custom
- Configurable sizes: sm, md, lg
- Animated shimmer effects
- Responsive design
- Dark theme support
- Accessibility compliant

**Usage:**
```vue
<template>
  <!-- Text skeleton -->
  <SkeletonLoader type="text" :lines="3" animated />
  
  <!-- Card skeleton -->
  <SkeletonLoader 
    type="card" 
    :show-avatar="true" 
    :text-lines="2" 
    size="lg" 
  />
  
  <!-- List skeleton -->
  <SkeletonLoader 
    type="list" 
    :items="5" 
    :show-avatar="true" 
    :show-actions="true" 
  />
  
  <!-- Form skeleton -->
  <SkeletonLoader type="form" :fields="4" />
  
  <!-- Custom skeleton -->
  <SkeletonLoader type="custom">
    <div class="custom-skeleton-content">
      <!-- Your custom skeleton content -->
    </div>
  </SkeletonLoader>
</template>
```

**Props:**
- `type`: 'text' | 'card' | 'list' | 'form' | 'rectangle' | 'custom'
- `lines`: Number of text lines (for text type)
- `items`: Number of list items (for list type)
- `fields`: Number of form fields (for form type)
- `textLines`: Number of text lines in card (for card type)
- `showAvatar`: Show avatar in card/list skeletons
- `showActions`: Show action buttons in list skeleton
- `animated`: Enable shimmer animation
- `size`: 'sm' | 'md' | 'lg'
- `height`: Custom height for rectangle skeleton
- `width`: Custom width for rectangle skeleton
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full'

### 2. LoadingSpinner.vue
A modern loading spinner component with multiple variants and customization options.

**Features:**
- Multiple spinner variants: spin, pulse, bounce, dots, bars
- Configurable sizes: xs, sm, md, lg, xl, 2xl
- Color variants: primary, secondary, accent, neutral, white
- Speed control: slow, normal, fast
- Layout options: centered, overlay, with text
- Accessibility support

**Usage:**
```vue
<template>
  <!-- Basic spinner -->
  <LoadingSpinner />
  
  <!-- Spinner with text -->
  <LoadingSpinner 
    variant="dots" 
    size="lg" 
    color="primary" 
    :show-text="true" 
    text="Loading data..." 
  />
  
  <!-- Overlay spinner -->
  <LoadingSpinner 
    :overlay="true" 
    :show-text="true" 
    text="Processing..." 
  />
  
  <!-- Custom content -->
  <LoadingSpinner :show-text="true">
    <span>Custom loading message</span>
  </LoadingSpinner>
</template>
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `color`: 'primary' | 'secondary' | 'accent' | 'neutral' | 'white'
- `variant`: 'spin' | 'pulse' | 'bounce' | 'dots' | 'bars'
- `text`: Loading text to display
- `showText`: Show loading text
- `centered`: Center the spinner
- `overlay`: Show as full-screen overlay
- `speed`: 'slow' | 'normal' | 'fast'

### 3. ProgressBar.vue
A comprehensive progress bar component for file uploads and long-running operations.

**Features:**
- Progress tracking with percentage display
- Estimated time remaining
- Visual effects: striped, shimmer
- Indeterminate state support
- Color variants and sizes
- Accessibility compliant

**Usage:**
```vue
<template>
  <!-- Basic progress bar -->
  <ProgressBar :value="50" :max="100" />
  
  <!-- Progress bar with all features -->
  <ProgressBar
    :value="progress.current"
    :max="progress.total"
    :estimated-time="progress.estimatedTime"
    label="File Upload"
    color="success"
    size="lg"
    :show-label="true"
    :show-percentage="true"
    :show-info="true"
    :show-value="true"
    :show-time="true"
    :striped="true"
    :shimmer="true"
    rounded="lg"
  />
  
  <!-- Indeterminate progress -->
  <ProgressBar :indeterminate="true" label="Processing..." />
</template>
```

**Props:**
- `value`: Current progress value
- `max`: Maximum value
- `min`: Minimum value
- `label`: Progress bar label
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `showPercentage`: Show percentage
- `showLabel`: Show label
- `showInfo`: Show progress info
- `showValue`: Show current/max values
- `showTime`: Show estimated time
- `estimatedTime`: Estimated time remaining in seconds
- `striped`: Enable striped animation
- `shimmer`: Enable shimmer effect
- `indeterminate`: Indeterminate state
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full'
- `speed`: 'slow' | 'normal' | 'fast'

### 4. TableSkeleton.vue
A specialized skeleton component for data tables with realistic column layouts.

**Features:**
- Matches DataTable column structure
- Realistic column widths
- Shimmer animation effects
- Responsive design
- Dark theme support

**Usage:**
```vue
<template>
  <TableSkeleton 
    :columns="5" 
    :rows="10" 
    :animated="true" 
  />
</template>
```

**Props:**
- `columns`: Number of table columns
- `rows`: Number of skeleton rows
- `animated`: Enable shimmer animation

## Loading State Management

### useLoadingState Composable
A comprehensive composable for managing loading states across the application.

**Features:**
- Multiple concurrent loading operations
- Progress tracking
- Debounced loading
- Global loading state
- Cancellable operations
- Event callbacks

**Usage:**
```javascript
import { useLoadingState } from '@/composables/useLoadingState'

export default {
  setup() {
    const loading = useLoadingState()
    
    // Basic loading
    const fetchData = async () => {
      loading.startLoading('data-fetch', { message: 'Fetching data...' })
      try {
        const data = await api.getData()
        loading.stopLoading('data-fetch')
        return data
      } catch (error) {
        loading.stopLoading('data-fetch')
        throw error
      }
    }
    
    // With automatic loading management
    const fetchDataAuto = async () => {
      return await loading.withLoading('data-fetch', async () => {
        return await api.getData()
      }, { message: 'Fetching data...' })
    }
    
    // Progress tracking
    const uploadFile = async (file) => {
      const tracker = loading.createProgressTracker('file-upload', file.size, {
        message: 'Uploading file...'
      })
      
      // Simulate upload progress
      for (let i = 0; i <= file.size; i += 1000) {
        tracker.updateProgress(i, `Uploading... ${Math.round(i/file.size*100)}%`)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      tracker.completeProgress()
    }
    
    // Debounced loading for search
    const debouncedSearch = loading.debouncedLoading('search', 300)
    
    const search = (query) => {
      debouncedSearch.start({ message: 'Searching...' })
      // Perform search
      debouncedSearch.stop()
    }
    
    return {
      loading,
      fetchData,
      fetchDataAuto,
      uploadFile,
      search
    }
  }
}
```

**API:**
- `startLoading(key, options)`: Start loading operation
- `stopLoading(key, options)`: Stop loading operation
- `updateLoading(key, updates)`: Update loading state
- `setGlobalLoading(loading, message)`: Set global loading state
- `clearAllLoading()`: Clear all loading states
- `getLoadingState(key)`: Get loading state by key
- `cancelLoading(key)`: Cancel loading operation
- `withLoading(key, asyncFn, options)`: Wrap async function with loading
- `withGlobalLoading(asyncFn, message)`: Wrap with global loading
- `createProgressTracker(key, total, options)`: Create progress tracker
- `debouncedLoading(key, delay)`: Create debounced loading controller

## Shimmer Effects System

### Implementation
The shimmer effects system provides smooth, performant loading animations across all components.

**Key Features:**
- Hardware-accelerated animations
- Consistent timing and colors
- Dark theme support
- Reduced motion support
- Performance optimized

**CSS Implementation:**
```css
/* Base shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Shimmer gradient */
.skeleton-element {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Dark theme */
.theme-dark .skeleton-element {
  background: linear-gradient(
    90deg,
    rgb(55 65 81) 25%,
    rgb(75 85 99) 50%,
    rgb(55 65 81) 75%
  );
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-element {
    animation: none;
  }
}
```

### Performance Considerations
- Uses `transform` and `background-position` for GPU acceleration
- Avoids layout-triggering properties
- Optimized animation timing
- Hardware acceleration hints with `will-change`

### Accessibility
- Respects `prefers-reduced-motion` setting
- Provides semantic structure for screen readers
- Maintains proper contrast ratios
- Keyboard navigation support where applicable

## Integration Examples

### Data Table with Loading States
```vue
<template>
  <div class="data-table-container">
    <!-- Loading skeleton -->
    <TableSkeleton 
      v-if="loading.hasSpecificLoading.value('table-data')" 
      :columns="columns.length" 
      :rows="10" 
    />
    
    <!-- Actual data table -->
    <DataTable 
      v-else
      :data="tableData"
      :columns="columns"
      :loading="loading.hasSpecificLoading.value('table-data')"
    />
  </div>
</template>

<script setup>
import { useLoadingState } from '@/composables/useLoadingState'
import TableSkeleton from '@/Components/States/TableSkeleton.vue'
import DataTable from '@/Components/Data/DataTable.vue'

const loading = useLoadingState()

const fetchTableData = async () => {
  await loading.withLoading('table-data', async () => {
    tableData.value = await api.getTableData()
  }, { message: 'Loading table data...' })
}
</script>
```

### Form with Progress Tracking
```vue
<template>
  <form @submit="handleSubmit">
    <!-- Form fields -->
    <div v-if="!loading.hasSpecificLoading.value('form-submit')">
      <!-- Form content -->
    </div>
    
    <!-- Loading skeleton -->
    <SkeletonLoader 
      v-else
      type="form" 
      :fields="4" 
      animated 
    />
    
    <!-- Progress bar for file upload -->
    <ProgressBar
      v-if="uploadProgress"
      :value="uploadProgress.current"
      :max="uploadProgress.total"
      :estimated-time="uploadProgress.estimatedTime"
      label="Uploading files..."
      :show-percentage="true"
      :show-time="true"
      :shimmer="true"
    />
    
    <!-- Submit button -->
    <button 
      type="submit" 
      :disabled="loading.isLoading.value"
    >
      <LoadingSpinner 
        v-if="loading.hasSpecificLoading.value('form-submit')"
        size="sm" 
        color="white" 
      />
      <span v-else>Submit</span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useLoadingState } from '@/composables/useLoadingState'

const loading = useLoadingState()
const uploadProgress = ref(null)

const handleSubmit = async () => {
  // Handle file upload with progress
  if (files.value.length > 0) {
    const tracker = loading.createProgressTracker('file-upload', totalSize, {
      message: 'Uploading files...'
    })
    
    uploadProgress.value = tracker.getProgress()
    
    // Upload files with progress updates
    // ...
    
    tracker.completeProgress()
    uploadProgress.value = null
  }
  
  // Submit form
  await loading.withLoading('form-submit', async () => {
    await api.submitForm(formData.value)
  }, { message: 'Submitting form...' })
}
</script>
```

## Best Practices

### 1. Loading State Management
- Use specific loading keys for different operations
- Provide meaningful loading messages
- Handle errors gracefully with proper cleanup
- Use debounced loading for rapid state changes

### 2. Skeleton Screens
- Match skeleton structure to actual content
- Use appropriate skeleton types for different content
- Enable animations for better user experience
- Maintain consistent timing across components

### 3. Progress Indicators
- Show progress for operations longer than 2 seconds
- Provide estimated time for long operations
- Use indeterminate state when progress is unknown
- Include cancel functionality for long operations

### 4. Performance
- Use hardware-accelerated animations
- Respect user motion preferences
- Optimize for 60fps animations
- Minimize layout thrashing

### 5. Accessibility
- Provide semantic markup for screen readers
- Include proper ARIA labels
- Support keyboard navigation
- Maintain sufficient contrast ratios

## Testing

The loading states system includes comprehensive tests:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Loading state management system
- **Performance Tests**: Animation performance and memory usage
- **Accessibility Tests**: Screen reader compatibility and keyboard navigation

Run tests with:
```bash
npm test -- tests/js/components/States/
npm test -- tests/js/composables/useLoadingState.test.js
npm test -- tests/js/integration/LoadingStatesIntegration.test.js
```

## Browser Support

The loading states system supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Graceful degradation is provided for older browsers with reduced animation support.