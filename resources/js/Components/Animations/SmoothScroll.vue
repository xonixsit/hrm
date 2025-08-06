<template>
  <component
    :is="tag"
    :href="href"
    :to="to"
    :class="linkClass"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { smoothScrollTo, ANIMATION_DURATION, ANIMATION_EASING } from '@/utils/animations';

const props = defineProps({
  // Target element selector or element reference
  target: {
    type: [String, Object],
    required: true
  },
  
  // Scroll offset from target
  offset: {
    type: Number,
    default: 0
  },
  
  // Animation duration
  duration: {
    type: Number,
    default: ANIMATION_DURATION.slow
  },
  
  // Easing function
  easing: {
    type: String,
    default: ANIMATION_EASING.easeInOut
  },
  
  // Component tag
  tag: {
    type: String,
    default: 'button'
  },
  
  // Link attributes
  href: {
    type: String,
    default: null
  },
  
  to: {
    type: [String, Object],
    default: null
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['scroll-start', 'scroll-end', 'scroll-error']);

const linkClass = computed(() => [
  'smooth-scroll-link',
  props.class
]);

const handleClick = async (event) => {
  event.preventDefault();
  
  try {
    let targetElement;
    
    // Get target element
    if (typeof props.target === 'string') {
      targetElement = document.querySelector(props.target);
    } else {
      targetElement = props.target;
    }
    
    if (!targetElement) {
      throw new Error(`Target element not found: ${props.target}`);
    }
    
    emit('scroll-start', targetElement);
    
    await smoothScrollTo(targetElement, {
      duration: props.duration,
      easing: props.easing,
      offset: props.offset
    });
    
    emit('scroll-end', targetElement);
    
    // Update URL hash if target has an ID
    if (targetElement.id && props.tag === 'a') {
      history.replaceState(null, null, `#${targetElement.id}`);
    }
    
  } catch (error) {
    console.error('Smooth scroll error:', error);
    emit('scroll-error', error);
  }
};
</script>

<style scoped>
.smooth-scroll-link {
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.smooth-scroll-link:hover {
  opacity: 0.8;
}

.smooth-scroll-link:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
</style>