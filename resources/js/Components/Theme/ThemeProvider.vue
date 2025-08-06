<template>
  <div class="theme-provider" :class="themeClasses">
    <slot />
    
    <!-- Theme transition overlay for smooth switching -->
    <Transition name="theme-transition">
      <div 
        v-if="isTransitioning" 
        class="theme-transition-overlay"
        :style="transitionStyles"
      />
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps({
  // Enable smooth theme transitions
  enableTransitions: {
    type: Boolean,
    default: true
  },
  
  // Transition duration in milliseconds
  transitionDuration: {
    type: Number,
    default: 200
  },
  
  // Auto-initialize theme on mount
  autoInitialize: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['theme-changed', 'theme-initialized']);

// Theme composable
const {
  activeTheme,
  themeConfig,
  isDark,
  isLight,
  initializeTheme,
  debugThemeState
} = useTheme();

// Local state
const isTransitioning = ref(false);
const cleanupThemeListener = ref(null);

// Computed properties
const themeClasses = computed(() => [
  `theme-${activeTheme.value}`,
  {
    'theme-transitioning': isTransitioning.value,
    'theme-dark': isDark.value,
    'theme-light': isLight.value
  }
]);

const transitionStyles = computed(() => ({
  '--transition-duration': `${props.transitionDuration}ms`
}));

// Theme change handler with transitions
const handleThemeChange = async (newTheme, oldTheme) => {
  if (!props.enableTransitions) {
    emit('theme-changed', { theme: newTheme, previousTheme: oldTheme });
    return;
  }

  // Start transition
  isTransitioning.value = true;
  
  try {
    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, props.transitionDuration));
    
    emit('theme-changed', { theme: newTheme, previousTheme: oldTheme });
  } finally {
    // End transition
    isTransitioning.value = false;
  }
};

// Watch for theme changes
watch(activeTheme, (newTheme, oldTheme) => {
  if (oldTheme && newTheme !== oldTheme) {
    handleThemeChange(newTheme, oldTheme);
  }
}, { immediate: false });

// Lifecycle hooks
onMounted(async () => {
  if (props.autoInitialize) {
    try {
      cleanupThemeListener.value = initializeTheme();
      emit('theme-initialized', { theme: activeTheme.value });
      
      if (process.env.NODE_ENV === 'development') {
        debugThemeState();
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
    }
  }
});

onUnmounted(() => {
  if (cleanupThemeListener.value) {
    cleanupThemeListener.value();
  }
});

// Expose theme utilities to parent components
defineExpose({
  activeTheme,
  themeConfig,
  isDark,
  isLight,
  debugThemeState
});
</script>

<style scoped>
.theme-provider {
  position: relative;
  min-height: 100vh;
  transition: background-color var(--duration-normal) var(--easing-ease-in-out);
}

.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-neutral-50);
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
}

/* Theme transition animations */
.theme-transition-enter-active,
.theme-transition-leave-active {
  transition: opacity var(--transition-duration, 200ms) ease-in-out;
}

.theme-transition-enter-from {
  opacity: 0;
}

.theme-transition-enter-to {
  opacity: 0.3;
}

.theme-transition-leave-from {
  opacity: 0.3;
}

.theme-transition-leave-to {
  opacity: 0;
}

/* Theme-specific styles */
.theme-light {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.theme-dark {
  background-color: var(--color-neutral-950);
  color: var(--color-neutral-50);
}

/* Smooth transitions for theme changes */
.theme-provider * {
  transition: 
    background-color var(--duration-normal) var(--easing-ease-in-out),
    border-color var(--duration-normal) var(--easing-ease-in-out),
    color var(--duration-normal) var(--easing-ease-in-out);
}

/* Disable transitions during theme switching to prevent flicker */
.theme-transitioning * {
  transition: none !important;
}
</style>