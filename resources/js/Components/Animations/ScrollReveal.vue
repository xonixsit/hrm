<template>
  <div
    ref="elementRef"
    :class="elementClass"
    :style="elementStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { prefersReducedMotion, ANIMATION_DURATION } from '@/utils/animations';

const props = defineProps({
  // Animation type
  animation: {
    type: String,
    default: 'fade-up',
    validator: (value) => [
      'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
      'slide-up', 'slide-down', 'slide-left', 'slide-right',
      'scale', 'scale-up', 'scale-down', 'rotate'
    ].includes(value)
  },
  
  // Animation duration
  duration: {
    type: Number,
    default: ANIMATION_DURATION.normal
  },
  
  // Animation delay
  delay: {
    type: Number,
    default: 0
  },
  
  // Intersection threshold
  threshold: {
    type: Number,
    default: 0.1,
    validator: (value) => value >= 0 && value <= 1
  },
  
  // Root margin for intersection observer
  rootMargin: {
    type: String,
    default: '0px 0px -50px 0px'
  },
  
  // Trigger animation only once
  once: {
    type: Boolean,
    default: true
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['reveal', 'hide']);

const elementRef = ref(null);
const isVisible = ref(false);
const hasAnimated = ref(false);
const observer = ref(null);

const elementClass = computed(() => [
  'scroll-reveal',
  `scroll-reveal-${props.animation}`,
  props.class,
  {
    'scroll-reveal-visible': isVisible.value,
    'scroll-reveal-hidden': !isVisible.value,
    'scroll-reveal-no-motion': prefersReducedMotion()
  }
]);

const elementStyle = computed(() => {
  if (prefersReducedMotion()) {
    return {};
  }
  
  return {
    '--animation-duration': `${props.duration}ms`,
    '--animation-delay': `${props.delay}ms`,
    transitionDuration: `${props.duration}ms`,
    transitionDelay: `${props.delay}ms`
  };
});

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!hasAnimated.value || !props.once) {
        isVisible.value = true;
        hasAnimated.value = true;
        emit('reveal', entry.target);
        
        if (props.once && observer.value) {
          observer.value.unobserve(entry.target);
        }
      }
    } else if (!props.once) {
      isVisible.value = false;
      emit('hide', entry.target);
    }
  });
};

onMounted(() => {
  if (!prefersReducedMotion() && elementRef.value) {
    observer.value = new IntersectionObserver(handleIntersection, {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    });
    
    observer.value.observe(elementRef.value);
  } else {
    // If reduced motion is preferred, show immediately
    isVisible.value = true;
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<style scoped>
/* Base scroll reveal styles */
.scroll-reveal {
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-reveal-no-motion {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}

/* Hidden state styles */
.scroll-reveal-hidden.scroll-reveal-fade {
  opacity: 0;
}

.scroll-reveal-hidden.scroll-reveal-fade-up {
  opacity: 0;
  transform: translateY(30px);
}

.scroll-reveal-hidden.scroll-reveal-fade-down {
  opacity: 0;
  transform: translateY(-30px);
}

.scroll-reveal-hidden.scroll-reveal-fade-left {
  opacity: 0;
  transform: translateX(30px);
}

.scroll-reveal-hidden.scroll-reveal-fade-right {
  opacity: 0;
  transform: translateX(-30px);
}

.scroll-reveal-hidden.scroll-reveal-slide-up {
  transform: translateY(50px);
}

.scroll-reveal-hidden.scroll-reveal-slide-down {
  transform: translateY(-50px);
}

.scroll-reveal-hidden.scroll-reveal-slide-left {
  transform: translateX(50px);
}

.scroll-reveal-hidden.scroll-reveal-slide-right {
  transform: translateX(-50px);
}

.scroll-reveal-hidden.scroll-reveal-scale {
  opacity: 0;
  transform: scale(0.8);
}

.scroll-reveal-hidden.scroll-reveal-scale-up {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
}

.scroll-reveal-hidden.scroll-reveal-scale-down {
  opacity: 0;
  transform: scale(0.8) translateY(-30px);
}

.scroll-reveal-hidden.scroll-reveal-rotate {
  opacity: 0;
  transform: rotate(-10deg) scale(0.8);
}

/* Visible state styles */
.scroll-reveal-visible {
  opacity: 1;
  transform: translateX(0) translateY(0) scale(1) rotate(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>