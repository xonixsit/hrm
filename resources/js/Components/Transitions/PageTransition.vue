<template>
  <Transition
    :name="transitionName"
    :mode="mode"
    :appear="appear"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </Transition>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { prefersReducedMotion } from '@/utils/animations';

const props = defineProps({
  name: {
    type: String,
    default: 'fade'
  },
  mode: {
    type: String,
    default: 'out-in'
  },
  appear: {
    type: Boolean,
    default: true
  },
  duration: {
    type: [Number, Object],
    default: 200
  }
});

const emit = defineEmits([
  'before-enter',
  'enter',
  'after-enter',
  'before-leave',
  'leave',
  'after-leave'
]);

const transitionName = computed(() => {
  return prefersReducedMotion() ? 'no-transition' : props.name;
});

// Transition event handlers
const onBeforeEnter = (el) => {
  emit('before-enter', el);
};

const onEnter = (el, done) => {
  emit('enter', el, done);
  if (prefersReducedMotion()) {
    done();
  }
};

const onAfterEnter = (el) => {
  emit('after-enter', el);
};

const onBeforeLeave = (el) => {
  emit('before-leave', el);
};

const onLeave = (el, done) => {
  emit('leave', el, done);
  if (prefersReducedMotion()) {
    done();
  }
};

const onAfterLeave = (el) => {
  emit('after-leave', el);
};

onMounted(() => {
  // Set CSS custom properties for transition duration
  if (typeof props.duration === 'number') {
    document.documentElement.style.setProperty('--transition-duration', `${props.duration}ms`);
  }
});
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* No transition for reduced motion */
.no-transition-enter-active,
.no-transition-leave-active {
  transition: none !important;
}
</style>