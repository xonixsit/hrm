# Animation System Documentation

This document provides comprehensive documentation for the modern animation system implemented as part of the UI/UX revamp.

## Overview

The animation system provides a complete set of modern UI animations and micro-interactions optimized for performance and accessibility. All animations respect user preferences for reduced motion and are designed to run at 60fps.

## Core Features

### 1. Performance Optimized
- Hardware acceleration using CSS transforms
- 60fps target with performance monitoring
- Efficient memory management and cleanup
- Intersection Observer API for scroll animations

### 2. Accessibility First
- Respects `prefers-reduced-motion` setting
- Keyboard navigation support
- Screen reader compatibility
- Focus management for interactive elements

### 3. Modern Interactions
- Ripple effects on button clicks
- Smooth page transitions
- Modal and dropdown animations
- Scroll-triggered animations
- Parallax effects
- Stagger animations for lists

## Components

### PageTransition
Provides smooth transitions between page content.

```vue
<PageTransition name="fade" mode="out-in">
  <div key="content">Page content</div>
</PageTransition>
```

**Props:**
- `name`: Transition type ('fade', 'slide-left', 'slide-right', 'slide-up', 'scale')
- `mode`: Transition mode ('out-in', 'in-out')
- `appear`: Enable appear animation on mount
- `duration`: Animation duration in milliseconds

### ModalTransition
Animated modal with backdrop blur and smooth scaling.

```vue
<ModalTransition :show="isVisible" @close="handleClose">
  <div class="modal-content">
    Modal content here
  </div>
</ModalTransition>
```

**Props:**
- `show`: Boolean to control visibility
- `closeOnOverlay`: Allow closing by clicking overlay
- `contentClass`: Additional classes for modal content

**Events:**
- `close`: Emitted when modal should close
- `opened`: Emitted when modal is fully opened
- `closed`: Emitted when modal is fully closed

### DropdownTransition
Smooth dropdown animations with multiple positioning options.

```vue
<DropdownTransition 
  :show="isOpen" 
  position="bottom-left"
  size="md"
>
  <div class="dropdown-menu">
    Dropdown content
  </div>
</DropdownTransition>
```

**Props:**
- `show`: Boolean to control visibility
- `position`: Dropdown position ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right', 'top', 'bottom')
- `size`: Dropdown size ('sm', 'md', 'lg', 'xl', 'full', 'auto')
- `offset`: Position offset object `{ x: 0, y: 4 }`

### ScrollReveal
Animate elements when they scroll into view.

```vue
<ScrollReveal animation="fade-up" :delay="200">
  <div class="content">
    Content that animates on scroll
  </div>
</ScrollReveal>
```

**Props:**
- `animation`: Animation type ('fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale', 'scale-up', 'scale-down', 'rotate')
- `duration`: Animation duration in milliseconds
- `delay`: Animation delay in milliseconds
- `threshold`: Intersection threshold (0-1)
- `rootMargin`: Root margin for intersection observer
- `once`: Trigger animation only once

### StaggerContainer
Animate child elements with staggered timing.

```vue
<StaggerContainer 
  animation="fade-up" 
  :delay="100"
  ref="staggerRef"
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerContainer>
```

**Props:**
- `delay`: Stagger delay between items in milliseconds
- `animation`: Animation type for children
- `duration`: Animation duration for each item
- `autoPlay`: Trigger animation automatically on mount
- `threshold`: Intersection threshold
- `childSelector`: CSS selector for child items

**Methods:**
- `animate()`: Manually trigger stagger animation

### ParallaxContainer
Create parallax scroll effects.

```vue
<ParallaxContainer :speed="0.5" direction="up">
  <div class="parallax-content">
    Content with parallax effect
  </div>
</ParallaxContainer>
```

**Props:**
- `speed`: Parallax speed (0-1, where 0 = no movement, 1 = normal scroll speed)
- `direction`: Parallax direction ('up', 'down', 'left', 'right')
- `enabled`: Enable/disable parallax effect
- `height`: Container height

### SmoothScroll
Smooth scrolling to target elements.

```vue
<SmoothScroll 
  target="#section-1" 
  :duration="500"
  :offset="100"
>
  Scroll to Section 1
</SmoothScroll>
```

**Props:**
- `target`: Target element selector or element reference
- `offset`: Scroll offset from target
- `duration`: Animation duration
- `easing`: Easing function
- `tag`: Component tag ('button', 'a')

**Events:**
- `scroll-start`: Emitted when scroll starts
- `scroll-end`: Emitted when scroll completes
- `scroll-error`: Emitted on scroll error

## Utility Functions

### Animation Utilities (`@/utils/animations`)

```javascript
import { 
  smoothScrollTo, 
  createRippleEffect, 
  prefersReducedMotion,
  monitorAnimationPerformance 
} from '@/utils/animations';
```

**Functions:**
- `smoothScrollTo(element, options)`: Smooth scroll to element
- `createRippleEffect(button, event)`: Add ripple effect to button
- `prefersReducedMotion()`: Check if user prefers reduced motion
- `getAnimationDuration(duration)`: Get duration respecting user preferences
- `createParallaxEffect(element, speed)`: Create parallax effect
- `createScrollAnimation(elements, animationClass)`: Animate elements on scroll
- `staggerAnimation(elements, animation, delay)`: Stagger animate elements
- `monitorAnimationPerformance(name, callback)`: Monitor animation FPS

## CSS Classes

### Animation Utilities
```css
/* Fade animations */
.animate-fade-in
.animate-slide-up
.animate-scale-in
.animate-bounce-in
.animate-slide-in-right
.animate-slide-in-left
.animate-zoom-in
.animate-float

/* Hover effects */
.hover-lift
.hover-scale
.hover-glow

/* Loading states */
.loading-shimmer
.loading-pulse
```

### Button Enhancements
The BaseButton component now includes:
- Ripple effects on click
- Scale feedback on press
- Smooth hover transitions
- Loading state animations

## Performance Considerations

### Optimization Techniques
1. **Hardware Acceleration**: Uses CSS transforms for smooth animations
2. **Intersection Observer**: Efficient scroll-based animations
3. **RequestAnimationFrame**: Smooth 60fps animations
4. **Memory Management**: Proper cleanup of event listeners and observers
5. **Reduced Motion**: Respects accessibility preferences

### Performance Monitoring
```javascript
import { monitorAnimationPerformance } from '@/utils/animations';

const stopMonitoring = monitorAnimationPerformance('my-animation', (fps) => {
  //console.log(`Animation FPS: ${fps}`);
  if (fps < 30) {
    console.warn('Animation performance below 30 FPS');
  }
});

// Stop monitoring when done
stopMonitoring();
```

## Accessibility Features

### Reduced Motion Support
All animations automatically disable when user has `prefers-reduced-motion: reduce` set:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up {
    animation: none !important;
    transition: none !important;
  }
}
```

### Keyboard Navigation
- Focus management for modals and dropdowns
- Escape key support for dismissible components
- Tab order preservation during animations

### Screen Reader Support
- Proper ARIA labels and announcements
- Semantic markup preservation
- Animation state communication

## Browser Support

### Modern Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Fallbacks
- Graceful degradation for older browsers
- CSS feature detection
- Progressive enhancement approach

## Usage Examples

### Basic Page Transition
```vue
<template>
  <PageTransition name="fade">
    <div v-if="showContent" key="content">
      <h1>Page Title</h1>
      <p>Page content...</p>
    </div>
  </PageTransition>
</template>
```

### Interactive Modal
```vue
<template>
  <div>
    <BaseButton @click="showModal = true">
      Open Modal
    </BaseButton>
    
    <ModalTransition :show="showModal" @close="showModal = false">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content...</p>
        <BaseButton @click="showModal = false">Close</BaseButton>
      </div>
    </ModalTransition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const showModal = ref(false);
</script>
```

### Scroll-Triggered Content
```vue
<template>
  <div class="content-sections">
    <ScrollReveal 
      v-for="(section, index) in sections" 
      :key="index"
      animation="fade-up"
      :delay="index * 100"
    >
      <div class="section">
        <h2>{{ section.title }}</h2>
        <p>{{ section.content }}</p>
      </div>
    </ScrollReveal>
  </div>
</template>
```

### Staggered List Animation
```vue
<template>
  <StaggerContainer animation="fade-up" :delay="100">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="list-item"
    >
      {{ item.name }}
    </div>
  </StaggerContainer>
</template>
```

## Testing

### Performance Tests
Located in `tests/js/performance/AnimationPerformance.test.js`:
- FPS monitoring
- Memory leak detection
- Reduced motion compliance
- Animation timing accuracy

### Integration Tests
Located in `tests/js/integration/AnimationIntegration.test.js`:
- Component rendering
- Event handling
- Accessibility features
- Cross-component compatibility

## Demo Page

Visit `/animation-demo` to see all animations in action with interactive examples and performance metrics.

## Best Practices

### Do's
- Always respect `prefers-reduced-motion`
- Use hardware-accelerated properties (transform, opacity)
- Implement proper cleanup for event listeners
- Test animations on lower-end devices
- Provide meaningful feedback for user actions

### Don'ts
- Don't animate layout properties (width, height, top, left)
- Don't create infinite loops without user control
- Don't ignore accessibility requirements
- Don't block user interactions during animations
- Don't use animations for critical functionality

## Troubleshooting

### Common Issues

**Animation not working:**
- Check if `prefers-reduced-motion` is enabled
- Verify component is properly imported
- Ensure CSS classes are loaded

**Performance issues:**
- Monitor FPS using performance utilities
- Check for memory leaks in cleanup functions
- Reduce animation complexity or duration

**Accessibility concerns:**
- Test with screen readers
- Verify keyboard navigation
- Check color contrast during animations

### Debug Mode
Enable animation debugging by setting:
```javascript
window.DEBUG_ANIMATIONS = true;
```

This will log animation events and performance metrics to the console.