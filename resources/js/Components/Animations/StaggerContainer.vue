<template>
  <div
    ref="containerRef"
    :class="containerClass"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { prefersReducedMotion, ANIMATION_DURATION } from '@/utils/animations';

const props = defineProps({
  // Stagger delay between items (ms)
  delay: {
    type: Number,
    default: 100
  },
  
  // Animation type for children
  animation: {
    type: String,
    default: 'fade-up',
    validator: (value) => [
      'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
      'slide-up', 'slide-down', 'scale'
    ].includes(value)
  },
  
  // Animation duration for each item
  duration: {
    type: Number,
    default: ANIMATION_DURATION.normal
  },
  
  // Trigger animation automatically on mount
  autoPlay: {
    type: Boolean,
    default: true
  },
  
  // Intersection observer options
  threshold: {
    type: Number,
    default: 0.1
  },
  
  // Child selector for stagger items
  childSelector: {
    type: String,
    default: '> *'
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['animation-start', 'animation-complete', 'item-animated']);

const containerRef = ref(null);
const isAnimating = ref(false);
const hasAnimated = ref(false);
const observer = ref(null);

const containerClass = computed(() => [
  'stagger-container',
  `stagger-${props.animation}`,
  props.class,
  {
    'stagger-no-motion': prefersReducedMotion()
  }
]);

const animateChildren = async () => {
  if (!containerRef.value || isAnimating.value || prefersReducedMotion()) {
    return;
  }
  
  const children = containerRef.value.querySelectorAll(props.childSelector);
  if (children.length === 0) return;
  
  isAnimating.value = true;
  emit('animation-start');
  
  // Initially hide all children
  children.forEach((child, index) => {
    child.style.transitionDuration = `${props.duration}ms`;
    child.style.transitionTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)';
    child.classList.add('stagger-item-hidden');
  });
  
  // Animate children with stagger delay
  for (let i = 0; i < children.length; i++) {
    setTimeout(() => {
      children[i].classList.remove('stagger-item-hidden');
      children[i].classList.add('stagger-item-visible');
      emit('item-animated', children[i], i);
      
      // Check if this is the last item
      if (i === children.length - 1) {
        setTimeout(() => {
          isAnimating.value = false;
          emit('animation-complete');
        }, props.duration);
      }
    }, i * props.delay);
  }
};

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !hasAnimated.value) {
      hasAnimated.value = true;
      nextTick(() => {
        animateChildren();
      });
      
      if (observer.value) {
        observer.value.unobserve(entry.target);
      }
    }
  });
};

// Public method to trigger animation manually
const animate = () => {
  hasAnimated.value = false;
  nextTick(() => {
    animateChildren();
  });
};

onMounted(() => {
  if (prefersReducedMotion()) {
    // Show all items immediately if reduced motion is preferred
    nextTick(() => {
      const children = containerRef.value?.querySelectorAll(props.childSelector);
      children?.forEach((child) => {
        child.classList.add('stagger-item-visible');
      });
    });
    return;
  }
  
  if (props.autoPlay) {
    observer.value = new IntersectionObserver(handleIntersection, {
      threshold: props.threshold,
      rootMargin: '0px 0px -50px 0px'
    });
    
    if (containerRef.value) {
      observer.value.observe(containerRef.value);
    }
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

// Expose animate method
defineExpose({
  animate
});
</script>

<style scoped>
.stagger-container {
  position: relative;
}

.stagger-no-motion .stagger-item-hidden {
  opacity: 1 !important;
  transform: none !important;
}

/* Base stagger item styles */
:deep(.stagger-item-hidden) {
  transition-property: opacity, transform;
}

:deep(.stagger-item-visible) {
  opacity: 1;
  transform: translateX(0) translateY(0) scale(1);
}

/* Fade animation */
.stagger-fade :deep(.stagger-item-hidden) {
  opacity: 0;
}

/* Fade up animation */
.stagger-fade-up :deep(.stagger-item-hidden) {
  opacity: 0;
  transform: translateY(20px);
}

/* Fade down animation */
.stagger-fade-down :deep(.stagger-item-hidden) {
  opacity: 0;
  transform: translateY(-20px);
}

/* Fade left animation */
.stagger-fade-left :deep(.stagger-item-hidden) {
  opacity: 0;
  transform: translateX(20px);
}

/* Fade right animation */
.stagger-fade-right :deep(.stagger-item-hidden) {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide up animation */
.stagger-slide-up :deep(.stagger-item-hidden) {
  transform: translateY(30px);
}

/* Slide down animation */
.stagger-slide-down :deep(.stagger-item-hidden) {
  transform: translateY(-30px);
}

/* Scale animation */
.stagger-scale :deep(.stagger-item-hidden) {
  opacity: 0;
  transform: scale(0.8);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :deep(.stagger-item-hidden),
  :deep(.stagger-item-visible) {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>