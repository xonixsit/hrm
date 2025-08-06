<template>
  <div
    ref="containerRef"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createParallaxEffect, prefersReducedMotion } from '@/utils/animations';

const props = defineProps({
  // Parallax speed (0 = no movement, 1 = normal scroll speed)
  speed: {
    type: Number,
    default: 0.5,
    validator: (value) => value >= 0 && value <= 1
  },
  
  // Direction of parallax effect
  direction: {
    type: String,
    default: 'up',
    validator: (value) => ['up', 'down', 'left', 'right'].includes(value)
  },
  
  // Enable/disable parallax
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  },
  
  // Container height
  height: {
    type: String,
    default: 'auto'
  }
});

const containerRef = ref(null);
const parallaxCleanup = ref(null);
const scrollY = ref(0);

const containerClass = computed(() => [
  'parallax-container',
  props.class,
  {
    'parallax-disabled': !props.enabled || prefersReducedMotion()
  }
]);

const containerStyle = computed(() => {
  const style = {
    height: props.height
  };
  
  if (!props.enabled || prefersReducedMotion()) {
    return style;
  }
  
  const transform = getTransform();
  if (transform) {
    style.transform = transform;
  }
  
  return style;
});

const getTransform = () => {
  if (!props.enabled || prefersReducedMotion()) return null;
  
  const offset = scrollY.value * props.speed;
  
  switch (props.direction) {
    case 'up':
      return `translateY(${-offset}px)`;
    case 'down':
      return `translateY(${offset}px)`;
    case 'left':
      return `translateX(${-offset}px)`;
    case 'right':
      return `translateX(${offset}px)`;
    default:
      return `translateY(${-offset}px)`;
  }
};

const updateParallax = () => {
  if (!containerRef.value || !props.enabled || prefersReducedMotion()) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Only update if element is in viewport
  if (rect.bottom >= 0 && rect.top <= windowHeight) {
    scrollY.value = window.pageYOffset;
  }
};

onMounted(() => {
  if (props.enabled && !prefersReducedMotion()) {
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    
    // Initial update
    updateParallax();
  }
});

onUnmounted(() => {
  if (parallaxCleanup.value) {
    parallaxCleanup.value();
  }
  
  window.removeEventListener('scroll', updateParallax);
  window.removeEventListener('resize', updateParallax);
});
</script>

<style scoped>
.parallax-container {
  will-change: transform;
}

.parallax-disabled {
  will-change: auto;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .parallax-container {
    transform: none !important;
    will-change: auto;
  }
}
</style>