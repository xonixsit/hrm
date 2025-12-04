<template>
  <div 
    class="navigation-fallback"
    :class="fallbackClasses"
    data-navigation-type="fallback"
    role="navigation"
    aria-label="Fallback Navigation"
  >
    <!-- Fallback Header -->
    <div class="fallback-header">
      <div class="fallback-logo">
        <Icon name="building-office" size="lg" class="text-primary-600" />
        <span class="fallback-title">HR Management</span>
      </div>
      
      <div v-if="showErrorIndicator" class="fallback-error-indicator">
        <Icon name="exclamation-triangle" size="sm" class="text-warning-500" />
        <span class="sr-only">Navigation Error</span>
      </div>
    </div>
    
    <!-- Fallback Navigation Menu -->
    <nav class="fallback-menu" role="menu">
      <ul class="fallback-menu-list">
        <li 
          v-for="item in fallbackMenuItems" 
          :key="item.name"
          class="fallback-menu-item"
        >
          <a
            :href="item.href"
            :class="[
              'fallback-menu-link',
              { 'fallback-menu-link--active': isActiveRoute(item.route) }
            ]"
            role="menuitem"
            @click="handleNavigation(item, $event)"
          >
            <Icon 
              v-if="item.icon" 
              :name="item.icon" 
              size="sm" 
              class="fallback-menu-icon" 
            />
            <span class="fallback-menu-text">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
    
    <!-- Fallback Actions -->
    <div class="fallback-actions">
      <button
        @click="handleRetryNavigation"
        :disabled="isRetrying"
        class="fallback-action fallback-action--primary"
        type="button"
      >
        <Icon 
          v-if="isRetrying" 
          name="loading" 
          size="sm" 
          class="animate-spin mr-2" 
        />
        <Icon 
          v-else 
          name="arrow-path" 
          size="sm" 
          class="mr-2" 
        />
        {{ isRetrying ? 'Retrying...' : 'Retry Navigation' }}
      </button>
      
      <button
        @click="handleReloadPage"
        class="fallback-action fallback-action--secondary"
        type="button"
      >
        <Icon name="arrow-path" size="sm" class="mr-2" />
        Reload Page
      </button>
    </div>
    
    <!-- Debug Info (Development Only) -->
    <div 
      v-if="showDebugInfo && isDevelopment" 
      class="fallback-debug"
    >
      <button
        @click="toggleDebugDetails"
        class="debug-toggle"
        type="button"
      >
        <Icon name="bug-ant" size="sm" class="mr-1" />
        {{ showDebugDetails ? 'Hide' : 'Show' }} Debug Info
      </button>
      
      <div v-if="showDebugDetails" class="debug-details">
        <div class="debug-section">
          <h4 class="debug-heading">Fallback Reason</h4>
          <p class="debug-text">{{ fallbackReason }}</p>
        </div>
        
        <div class="debug-section">
          <h4 class="debug-heading">Error Details</h4>
          <pre class="debug-code">{{ JSON.stringify(errorDetails, null, 2) }}</pre>
        </div>
        
        <div class="debug-section">
          <h4 class="debug-heading">Navigation State</h4>
          <pre class="debug-code">{{ JSON.stringify(navigationState, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { router } from '@inertiajs/vue3'
import Icon from '@/Components/Base/Icon.vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  /**
   * Reason for fallback activation
   */
  fallbackReason: {
    type: String,
    default: 'Navigation component failed to load'
  },
  
  /**
   * Error details that triggered the fallback
   */
  errorDetails: {
    type: Object,
    default: () => ({})
  },
  
  /**
   * Current route name
   */
  currentRoute: {
    type: String,
    default: ''
  },
  
  /**
   * Navigation type that failed
   */
  failedNavigationType: {
    type: String,
    validator: (value) => ['desktop', 'mobile', 'unknown'].includes(value),
    default: 'unknown'
  },
  
  /**
   * Whether to show error indicator
   */
  showErrorIndicator: {
    type: Boolean,
    default: true
  },
  
  /**
   * Whether to show debug information
   */
  showDebugInfo: {
    type: Boolean,
    default: true
  },
  
  /**
   * Custom retry handler
   */
  onRetry: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'navigate',
  'retry',
  'reload',
  'fallback-action'
])

// Composables
const { user, roles, hasRole } = useAuth()

// Reactive state
const isRetrying = ref(false)
const showDebugDetails = ref(false)
const retryCount = ref(0)
const maxRetries = 3

// Constants
const isDevelopment = process.env.NODE_ENV === 'development'

// Computed properties
const fallbackClasses = computed(() => ({
  'navigation-fallback--desktop': props.failedNavigationType === 'desktop',
  'navigation-fallback--mobile': props.failedNavigationType === 'mobile',
  'navigation-fallback--with-error': props.showErrorIndicator,
  'navigation-fallback--debug': showDebugDetails.value && isDevelopment
}))

const navigationState = computed(() => ({
  currentRoute: props.currentRoute,
  failedNavigationType: props.failedNavigationType,
  fallbackReason: props.fallbackReason,
  retryCount: retryCount.value,
  timestamp: Date.now(),
  windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
}))

// Fallback menu items (essential navigation only)
const fallbackMenuItems = computed(() => {
  const baseItems = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      href: '/dashboard',
      route: 'dashboard',
      roles: []
    },
    {
      name: 'employees',
      label: 'Employees',
      icon: 'users',
      href: '/employees',
      route: 'employees.index',
      roles: ['admin', 'manager']
    },
    {
      name: 'projects',
      label: 'Projects',
      icon: 'briefcase',
      href: '/projects',
      route: 'projects.index',
      roles: []
    },
    {
      name: 'leaves',
      label: 'Leaves',
      icon: 'calendar-days',
      href: '/leaves',
      route: 'leaves.index',
      roles: []
    },
    {
      name: 'feedbacks',
      label: 'Feedbacks',
      icon: 'chat-bubble-left-right',
      href: '/feedbacks',
      route: 'feedbacks.index',
      roles: []
    }
  ]
  
  // Filter items based on user roles
  return baseItems.filter(item => {
    if (item.roles.length === 0) return true
    return item.roles.some(role => hasRole(role))
  })
})

// Methods
const isActiveRoute = (routeName) => {
  if (!routeName || !props.currentRoute) return false
  return props.currentRoute.startsWith(routeName)
}

const handleNavigation = (item, event) => {
  try {
    // Prevent default link behavior
    event.preventDefault()
    
    // Emit navigation event
    emit('navigate', {
      item,
      route: item.route,
      href: item.href,
      source: 'fallback'
    })
    
    // Use Inertia router for navigation
    router.visit(item.href)
    
    // Log navigation attempt
    if (isDevelopment) {
      //console.log('[NAVIGATION FALLBACK] Navigation attempt:', item)
    }
    
  } catch (error) {
    console.error('[NAVIGATION FALLBACK] Navigation failed:', error)
    
    // Fallback to direct navigation
    window.location.href = item.href
  }
}

const handleRetryNavigation = async () => {
  if (isRetrying.value || retryCount.value >= maxRetries) {
    return
  }
  
  isRetrying.value = true
  retryCount.value++
  
  try {
    emit('retry', {
      attempt: retryCount.value,
      maxRetries,
      failedNavigationType: props.failedNavigationType
    })
    
    // Custom retry handler
    if (props.onRetry) {
      await props.onRetry()
    } else {
      // Default retry: wait and reload
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    }
    
    if (isDevelopment) {
      //console.log(`[NAVIGATION FALLBACK] Retry attempt ${retryCount.value}/${maxRetries}`)
    }
    
  } catch (error) {
    console.error('[NAVIGATION FALLBACK] Retry failed:', error)
    
    // If max retries reached, show message
    if (retryCount.value >= maxRetries) {
      alert('Maximum retry attempts reached. Please reload the page manually.')
    }
  } finally {
    isRetrying.value = false
  }
}

const handleReloadPage = () => {
  emit('reload')
  window.location.reload()
}

const toggleDebugDetails = () => {
  showDebugDetails.value = !showDebugDetails.value
}

// Lifecycle
onMounted(() => {
  // Log fallback activation
  if (isDevelopment) {
    console.warn('[NAVIGATION FALLBACK] Fallback navigation activated:', {
      reason: props.fallbackReason,
      failedType: props.failedNavigationType,
      errorDetails: props.errorDetails
    })
  }
  
  // Emit fallback action event
  emit('fallback-action', {
    action: 'activated',
    reason: props.fallbackReason,
    failedType: props.failedNavigationType,
    timestamp: Date.now()
  })
  
  // Report fallback usage for monitoring
  if (typeof window !== 'undefined' && window.reportError) {
    window.reportError({
      type: 'navigation_fallback_activated',
      reason: props.fallbackReason,
      failedNavigationType: props.failedNavigationType,
      errorDetails: props.errorDetails,
      timestamp: Date.now()
    })
  }
})

onUnmounted(() => {
  // Emit fallback deactivation event
  emit('fallback-action', {
    action: 'deactivated',
    retryCount: retryCount.value,
    timestamp: Date.now()
  })
})
</script>

<style scoped>
.navigation-fallback {
  @apply bg-white border-r border-neutral-200 shadow-sm;
  @apply flex flex-col h-full min-h-screen;
  @apply w-64 fixed left-0 top-0 z-40;
}

.navigation-fallback--mobile {
  @apply w-full h-auto min-h-0 relative;
  @apply border-r-0 border-b border-neutral-200;
}

.navigation-fallback--with-error {
  @apply border-warning-200 bg-warning-50;
}

.fallback-header {
  @apply flex items-center justify-between p-4 border-b border-neutral-200;
}

.navigation-fallback--with-error .fallback-header {
  @apply border-warning-200;
}

.fallback-logo {
  @apply flex items-center space-x-2;
}

.fallback-title {
  @apply text-lg font-semibold text-neutral-900;
}

.fallback-error-indicator {
  @apply flex items-center;
}

.fallback-menu {
  @apply flex-1 py-4;
}

.fallback-menu-list {
  @apply space-y-1 px-2;
}

.fallback-menu-item {
  @apply list-none;
}

.fallback-menu-link {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-md;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply transition-colors duration-150;
  @apply no-underline;
}

.fallback-menu-link--active {
  @apply bg-primary-100 text-primary-900;
}

.fallback-menu-icon {
  @apply mr-3 flex-shrink-0;
}

.fallback-menu-text {
  @apply truncate;
}

.fallback-actions {
  @apply p-4 border-t border-neutral-200 space-y-2;
}

.navigation-fallback--with-error .fallback-actions {
  @apply border-warning-200;
}

.fallback-action {
  @apply w-full inline-flex items-center justify-center px-3 py-2;
  @apply text-sm font-medium rounded-md transition-colors duration-150;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.fallback-action--primary {
  @apply text-white bg-primary-600 hover:bg-primary-700;
  @apply focus:ring-primary-500;
}

.fallback-action--secondary {
  @apply text-neutral-700 bg-white border border-neutral-300;
  @apply hover:bg-neutral-50 focus:ring-primary-500;
}

.fallback-debug {
  @apply border-t border-neutral-200 p-4 bg-neutral-50;
}

.debug-toggle {
  @apply text-sm text-neutral-600 hover:text-neutral-800;
  @apply flex items-center focus:outline-none;
}

.debug-details {
  @apply mt-3 space-y-3;
}

.debug-section {
  @apply bg-white rounded border border-neutral-200 p-3;
}

.debug-heading {
  @apply text-xs font-medium text-neutral-700 mb-2;
}

.debug-text {
  @apply text-xs text-neutral-600;
}

.debug-code {
  @apply text-xs text-neutral-600 font-mono whitespace-pre-wrap;
  @apply bg-neutral-100 rounded p-2 overflow-auto max-h-32;
}

/* Mobile-specific styles */
.navigation-fallback--mobile .fallback-header {
  @apply flex-row justify-between;
}

.navigation-fallback--mobile .fallback-menu {
  @apply py-2;
}

.navigation-fallback--mobile .fallback-menu-list {
  @apply flex flex-row space-y-0 space-x-1 px-4 overflow-x-auto;
}

.navigation-fallback--mobile .fallback-menu-link {
  @apply whitespace-nowrap px-4 py-2;
}

.navigation-fallback--mobile .fallback-actions {
  @apply flex flex-row space-y-0 space-x-2;
}

.navigation-fallback--mobile .fallback-action {
  @apply flex-1;
}

/* Dark theme support */
.theme-dark .navigation-fallback {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .navigation-fallback--with-error {
  @apply bg-warning-900 border-warning-700;
}

.theme-dark .fallback-header {
  @apply border-neutral-700;
}

.theme-dark .fallback-title {
  @apply text-neutral-100;
}

.theme-dark .fallback-menu-link {
  @apply text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700;
}

.theme-dark .fallback-menu-link--active {
  @apply bg-primary-900 text-primary-100;
}

.theme-dark .fallback-actions {
  @apply border-neutral-700;
}

.theme-dark .fallback-action--secondary {
  @apply text-neutral-300 bg-neutral-700 border-neutral-600;
  @apply hover:bg-neutral-600;
}

.theme-dark .fallback-debug {
  @apply bg-neutral-900 border-neutral-700;
}

.theme-dark .debug-section {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .debug-heading {
  @apply text-neutral-300;
}

.theme-dark .debug-text,
.theme-dark .debug-code {
  @apply text-neutral-400;
}

.theme-dark .debug-code {
  @apply bg-neutral-900;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .navigation-fallback:not(.navigation-fallback--mobile) {
    @apply w-full;
  }
  
  .fallback-menu-list {
    @apply px-1;
  }
  
  .fallback-menu-link {
    @apply px-2 py-1.5 text-xs;
  }
  
  .fallback-actions {
    @apply p-2;
  }
  
  .fallback-action {
    @apply px-2 py-1.5 text-xs;
  }
}

/* Animation */
.navigation-fallback {
  @apply animate-fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Accessibility improvements */
.fallback-menu-link:focus {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

.fallback-action:focus {
  @apply ring-2 ring-offset-2;
}

/* Print styles */
@media print {
  .navigation-fallback {
    @apply hidden;
  }
}
</style>