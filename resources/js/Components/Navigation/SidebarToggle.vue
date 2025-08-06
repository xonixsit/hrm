<template>
  <button
    @click="toggleSidebar"
    class="sidebar-toggle-button flex items-center justify-center p-3 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-transparent hover:border-neutral-200"
    :class="{ 
      'active': isOpen,
      'bg-neutral-100 border-neutral-200': isOpen
    }"
    style="min-height: 44px; min-width: 44px;"
    :aria-expanded="isOpen"
    :aria-label="isOpen ? 'Close sidebar' : 'Open sidebar'"
    :title="isOpen ? 'Close sidebar' : 'Open sidebar'"
  >
    <div class="hamburger-icon">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const toggleSidebar = () => {
  emit('toggle');
};
</script>

<style scoped>
/* Hamburger Menu Animation */
.sidebar-toggle-button {
  position: relative;
}

.hamburger-icon {
  width: 22px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background-color: currentColor;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle-button.active .hamburger-line:nth-child(1) {
  transform: translateY(7.5px) rotate(45deg);
}

.sidebar-toggle-button.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.sidebar-toggle-button.active .hamburger-line:nth-child(3) {
  transform: translateY(-7.5px) rotate(-45deg);
}

/* Hover effects */
.sidebar-toggle-button:hover .hamburger-line {
  background-color: currentColor;
}

/* Focus states for accessibility */
.sidebar-toggle-button:focus {
  outline: none;
}

/* Dark theme support */
.theme-dark .sidebar-toggle-button {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .sidebar-toggle-button:focus {
  @apply ring-primary-400;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .hamburger-line {
    height: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hamburger-line {
    transition: none;
  }
}
</style>