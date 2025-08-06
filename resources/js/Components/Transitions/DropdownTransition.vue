<template>
  <Transition
    :name="transitionName"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="show"
      ref="dropdown"
      class="dropdown-container"
      :class="[positionClass, sizeClass]"
      :style="dropdownStyle"
    >
      <slot />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { prefersReducedMotion, ANIMATION_DURATION } from '@/utils/animations';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'bottom-left',
    validator: (value) => [
      'top-left', 'top-right', 'bottom-left', 'bottom-right',
      'left', 'right', 'top', 'bottom'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  offset: {
    type: Object,
    default: () => ({ x: 0, y: 4 })
  }
});

const emit = defineEmits(['opened', 'closed']);

const dropdown = ref(null);

const transitionName = computed(() => {
  if (prefersReducedMotion()) return 'no-transition';
  
  const positionMap = {
    'top-left': 'dropdown-top-left',
    'top-right': 'dropdown-top-right',
    'bottom-left': 'dropdown-bottom-left',
    'bottom-right': 'dropdown-bottom-right',
    'left': 'dropdown-left',
    'right': 'dropdown-right',
    'top': 'dropdown-top',
    'bottom': 'dropdown-bottom'
  };
  
  return positionMap[props.position] || 'dropdown-bottom-left';
});

const positionClass = computed(() => {
  const positionClasses = {
    'top-left': 'origin-bottom-left',
    'top-right': 'origin-bottom-right',
    'bottom-left': 'origin-top-left',
    'bottom-right': 'origin-top-right',
    'left': 'origin-right',
    'right': 'origin-left',
    'top': 'origin-bottom',
    'bottom': 'origin-top'
  };
  
  return positionClasses[props.position] || 'origin-top-left';
});

const sizeClass = computed(() => {
  const sizeClasses = {
    'sm': 'w-32',
    'md': 'w-48',
    'lg': 'w-64',
    'xl': 'w-80',
    'full': 'w-full',
    'auto': 'w-auto min-w-32'
  };
  
  return sizeClasses[props.size] || 'w-auto min-w-32';
});

const dropdownStyle = computed(() => {
  return {
    '--offset-x': `${props.offset.x}px`,
    '--offset-y': `${props.offset.y}px`
  };
});

// Transition event handlers
const onBeforeEnter = (el) => {
  el.style.height = '0';
  el.style.opacity = '0';
};

const onEnter = (el, done) => {
  nextTick(() => {
    el.style.height = 'auto';
    const height = el.offsetHeight;
    el.style.height = '0';
    
    requestAnimationFrame(() => {
      el.style.height = `${height}px`;
      el.style.opacity = '1';
      
      setTimeout(() => {
        el.style.height = 'auto';
        done();
      }, ANIMATION_DURATION.normal);
    });
  });
};

const onAfterEnter = () => {
  emit('opened');
};

const onBeforeLeave = (el) => {
  el.style.height = `${el.offsetHeight}px`;
};

const onLeave = (el, done) => {
  requestAnimationFrame(() => {
    el.style.height = '0';
    el.style.opacity = '0';
    
    setTimeout(done, ANIMATION_DURATION.normal);
  });
};

const onAfterLeave = () => {
  emit('closed');
};
</script>

<style scoped>
.dropdown-container {
  position: absolute;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 50;
}

/* Dropdown transitions */
.dropdown-bottom-left-enter-active,
.dropdown-bottom-left-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: top left;
}

.dropdown-bottom-left-enter-from,
.dropdown-bottom-left-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.dropdown-bottom-right-enter-active,
.dropdown-bottom-right-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: top right;
}

.dropdown-bottom-right-enter-from,
.dropdown-bottom-right-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.dropdown-top-left-enter-active,
.dropdown-top-left-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: bottom left;
}

.dropdown-top-left-enter-from,
.dropdown-top-left-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.dropdown-top-right-enter-active,
.dropdown-top-right-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: bottom right;
}

.dropdown-top-right-enter-from,
.dropdown-top-right-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.dropdown-left-enter-active,
.dropdown-left-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: right;
}

.dropdown-left-enter-from,
.dropdown-left-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(8px);
}

.dropdown-right-enter-active,
.dropdown-right-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
  transform-origin: left;
}

.dropdown-right-enter-from,
.dropdown-right-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(-8px);
}

/* No transition for reduced motion */
.no-transition-enter-active,
.no-transition-leave-active {
  transition: none !important;
}

.no-transition-enter-from,
.no-transition-leave-to {
  transform: none !important;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .dropdown-container {
    max-width: calc(100vw - 2rem);
  }
}
</style>