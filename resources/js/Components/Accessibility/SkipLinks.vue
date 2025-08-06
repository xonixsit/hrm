/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility
 */
<template>
  <div class="skip-links" aria-label="Skip navigation links">
    <a
      v-for="link in skipLinks"
      :key="link.href"
      :href="link.href"
      class="skip-link sr-only-focusable"
      @click="handleSkipLinkClick($event, link.href)"
    >
      {{ link.label }}
    </a>
  </div>
</template>

<script setup>
import { useSkipLinks } from '@/composables/useAccessibility.js';

const { skipLinks, handleSkipLinkClick } = useSkipLinks();
</script>

<style scoped>
.skip-links {
  position: relative;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-600);
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: top 0.3s ease-out;
  border: 2px solid transparent;
}

.skip-link:focus {
  top: 6px;
  outline: none;
  border-color: var(--color-accent-400);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.skip-link:hover:focus {
  background: var(--color-primary-700);
  transform: translateY(-1px);
}

/* High contrast mode support */
.high-contrast .skip-link {
  background: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

.high-contrast .skip-link:focus {
  background: #ffffff;
  color: #000000;
  border-color: #000000;
}
</style>