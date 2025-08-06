<template>
  <footer :class="footerClasses">
    <div class="footer-content">
      <!-- Custom Footer Content -->
      <div v-if="$slots.default" class="custom-footer">
        <slot />
      </div>
      
      <!-- Default Footer Content -->
      <div v-else class="default-footer">
        <!-- Footer Links -->
        <nav v-if="links?.length" class="footer-nav">
          <ul class="footer-links">
            <li
              v-for="link in links"
              :key="link.href || link.label"
              class="footer-link-item"
            >
              <a
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="footer-link"
                @click="handleLinkClick(link)"
              >
                {{ link.label }}
                <svg
                  v-if="link.external"
                  class="external-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
        
        <!-- Copyright -->
        <div v-if="copyright" class="footer-copyright">
          <p class="copyright-text">{{ copyright }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Footer links
  links: {
    type: Array,
    default: () => []
  },
  
  // Copyright text
  copyright: {
    type: String,
    default: ''
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  
  // Background
  background: {
    type: String,
    default: 'neutral',
    validator: (value) => ['white', 'neutral', 'dark'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['link-click']);

// Computed properties
const footerClasses = computed(() => [
  'page-footer',
  `footer--${props.variant}`,
  `footer--${props.background}`,
  props.class
]);

// Methods
const handleLinkClick = (link) => {
  emit('link-click', link);
  
  // Handle custom click handler
  if (link.onClick) {
    link.onClick(link);
  }
};
</script>

<style scoped>
.page-footer {
  @apply border-t border-neutral-200 mt-auto;
}

.footer--default {
  @apply py-6;
}

.footer--minimal {
  @apply py-3;
}

.footer--bordered {
  @apply border-2 border-neutral-200 rounded-lg m-4 p-4;
}

.footer--white {
  @apply bg-white;
}

.footer--neutral {
  @apply bg-neutral-50;
}

.footer--dark {
  @apply bg-neutral-900 text-neutral-200;
}

.footer-content {
  @apply container-responsive;
}

.default-footer {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between;
  @apply space-y-4 sm:space-y-0;
}

/* Footer Navigation */
.footer-nav {
  @apply flex-shrink-0;
}

.footer-links {
  @apply flex flex-wrap items-center space-x-6;
}

.footer-link-item {
  @apply flex-shrink-0;
}

.footer-link {
  @apply inline-flex items-center text-sm text-neutral-600;
  @apply hover:text-neutral-900 transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply rounded-sm;
}

.external-icon {
  @apply w-3 h-3 ml-1;
}

/* Copyright */
.footer-copyright {
  @apply flex-shrink-0;
}

.copyright-text {
  @apply text-sm text-neutral-500;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .footer-links {
    @apply space-x-4;
  }
  
  .footer-link {
    @apply text-xs;
  }
  
  .copyright-text {
    @apply text-xs;
  }
}

/* Dark Theme Adjustments */
.theme-dark .page-footer {
  @apply border-neutral-700;
}

.theme-dark .footer--white {
  @apply bg-neutral-800;
}

.theme-dark .footer--neutral {
  @apply bg-neutral-900;
}

.theme-dark .footer-link {
  @apply text-neutral-400 hover:text-neutral-200;
}

.theme-dark .copyright-text {
  @apply text-neutral-500;
}

.footer--dark .footer-link {
  @apply text-neutral-400 hover:text-neutral-200;
}

.footer--dark .copyright-text {
  @apply text-neutral-400;
}
</style>