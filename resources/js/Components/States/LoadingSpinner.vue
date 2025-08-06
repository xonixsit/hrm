<template>
  <div :class="spinnerContainerClasses">
    <div :class="spinnerClasses">
      <div v-if="variant === 'spin'" class="spinner-inner"></div>
      <template v-else-if="variant === 'dots'">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </template>
      <template v-else-if="variant === 'bars'">
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
      </template>
      <div v-else class="spinner-inner"></div>
    </div>
    <div v-if="showText" class="loading-text">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent', 'neutral', 'white'].includes(value)
  },
  variant: {
    type: String,
    default: 'spin',
    validator: (value) => ['spin', 'pulse', 'bounce', 'dots', 'bars'].includes(value)
  },
  text: {
    type: String,
    default: 'Loading...'
  },
  showText: {
    type: Boolean,
    default: false
  },
  centered: {
    type: Boolean,
    default: false
  },
  overlay: {
    type: Boolean,
    default: false
  },
  speed: {
    type: String,
    default: 'normal',
    validator: (value) => ['slow', 'normal', 'fast'].includes(value)
  },
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const spinnerContainerClasses = computed(() => [
  'loading-spinner-container',
  {
    'loading-spinner--centered': props.centered,
    'loading-spinner--overlay': props.overlay,
    'loading-spinner--with-text': props.showText
  },
  props.class
])

const spinnerClasses = computed(() => [
  'loading-spinner',
  `loading-spinner--${props.variant}`,
  `loading-spinner--${props.size}`,
  `loading-spinner--${props.color}`,
  `loading-spinner--${props.speed}`
])
</script>

<style scoped>
.loading-spinner-container {
  @apply inline-flex items-center;
}

.loading-spinner--centered {
  @apply justify-center w-full;
}

.loading-spinner--overlay {
  @apply fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50;
}

.loading-spinner--with-text {
  @apply flex-col space-y-3;
}

.loading-spinner {
  @apply relative inline-block;
}

.loading-spinner--xs { @apply w-3 h-3; }
.loading-spinner--sm { @apply w-4 h-4; }
.loading-spinner--md { @apply w-6 h-6; }
.loading-spinner--lg { @apply w-8 h-8; }
.loading-spinner--xl { @apply w-12 h-12; }
.loading-spinner--2xl { @apply w-16 h-16; }

.spinner-inner {
  @apply w-full h-full border-2 border-transparent rounded-full;
  border-top-color: currentColor;
  border-right-color: currentColor;
  animation: spin var(--spinner-duration, 1s) linear infinite;
}

.loading-spinner--dots {
  @apply flex space-x-1;
}

.spinner-dot {
  @apply w-2 h-2 rounded-full;
  background-color: currentColor;
  animation: dots var(--spinner-duration, 1s) ease-in-out infinite;
}

.spinner-dot:nth-child(1) { animation-delay: -0.32s; }
.spinner-dot:nth-child(2) { animation-delay: -0.16s; }

.loading-spinner--bars {
  @apply flex space-x-1 items-end;
}

.spinner-bar {
  @apply w-1 rounded-sm;
  height: 16px;
  background-color: currentColor;
  animation: bars var(--spinner-duration, 1s) ease-in-out infinite;
}

.spinner-bar:nth-child(1) { animation-delay: -0.4s; }
.spinner-bar:nth-child(2) { animation-delay: -0.2s; }

.loading-spinner--primary { @apply text-primary-600; }
.loading-spinner--secondary { @apply text-secondary-600; }
.loading-spinner--accent { @apply text-accent-600; }
.loading-spinner--neutral { @apply text-neutral-600; }
.loading-spinner--white { @apply text-white; }

.loading-spinner--slow { --spinner-duration: 2s; }
.loading-spinner--normal { --spinner-duration: 1s; }
.loading-spinner--fast { --spinner-duration: 0.5s; }

.loading-text {
  @apply text-sm text-neutral-600 font-medium;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dots {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes bars {
  0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.5; }
  20% { transform: scaleY(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-inner, .spinner-dot, .spinner-bar {
    animation: none;
  }
}
</style>