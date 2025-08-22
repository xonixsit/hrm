<template>
  <!-- Only render on mobile screens (<1024px) -->
  <div v-if="isMobile" class="mobile-navigation">
    <!-- Mobile Top Bar -->
    <div class="mobile-top-bar fixed top-0 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 z-50 shadow-sm">
      <div class="flex items-center justify-between">
        <!-- Hamburger Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="hamburger-button flex items-center justify-center p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 touch-manipulation"
          style="min-height: 44px; min-width: 44px;"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <Icon 
            :name="isMobileMenuOpen ? 'x' : 'menu'" 
            size="md" 
            class="transition-transform duration-200"
          />
        </button>
        
        <!-- Mobile Logo -->
        <Link :href="route('dashboard')" class="flex items-center touch-manipulation">
          <ApplicationLogo class="h-8 w-8" />
          <span class="ml-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">HR Management</span>
        </Link>
        
        <!-- Mobile User Menu -->
        <Dropdown align="right" width="48">
          <template #trigger>
            <button 
              class="flex items-center justify-center p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 touch-manipulation"
              style="min-height: 44px; min-width: 44px;"
              aria-label="User menu"
            >
              <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Icon name="user" size="sm" class="text-primary-600 dark:text-primary-400" />
              </div>
            </button>
          </template>
          <template #content>
            <div class="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ userName }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ userEmail }}</p>
            </div>
            <DropdownLink :href="route('profile.edit')">
              Profile Settings
            </DropdownLink>
            <DropdownLink :href="route('logout')" method="post" as="button">
              Log Out
            </DropdownLink>
          </template>
        </Dropdown>
      </div>
    </div>
    
    <!-- Mobile Navigation Drawer -->
    <Transition
      name="mobile-drawer"
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="transform -translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform -translate-x-full"
    >
      <div
        v-if="isMobileMenuOpen"
        class="mobile-drawer fixed inset-y-0 left-0 z-40 w-80 max-w-sm bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 shadow-xl overflow-y-auto"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        role="navigation"
        aria-label="Mobile navigation menu"
      >
        <!-- Drawer Header -->
        <div class="drawer-header p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center space-x-3">
            <div class="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <Icon name="user" size="md" class="text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ userName }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ userRole }}</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="drawer-navigation p-4">
          <div class="space-y-2">
            <MobileNavigationSection
              v-for="section in filteredNavigation"
              :key="section.id"
              :section="section"
              :current-route="currentRoute"
              :user-roles="userRoles"
              @navigate="handleNavigate"
            />
          </div>
        </nav>
        
        <!-- Drawer Footer -->
        <div class="drawer-footer border-t border-neutral-200 dark:border-neutral-700 p-4 mt-auto">
          <div class="space-y-2">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 touch-manipulation"
              style="min-height: 44px;"
              aria-label="Toggle theme"
            >
              <Icon
                :name="isDarkMode ? 'sun' : 'moon'"
                size="md"
                class="flex-shrink-0 text-neutral-400 dark:text-neutral-500"
              />
              <span class="ml-3">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
            
            <!-- Settings -->
            <Link
              :href="route('profile.edit')"
              class="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 touch-manipulation"
              style="min-height: 44px;"
              @click="closeMobileMenu"
            >
              <Icon name="cog" size="md" class="flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
              <span class="ml-3">Settings</span>
            </Link>
            
            <!-- Logout -->
            <form @submit.prevent="handleLogout" class="w-full">
              <button
                type="submit"
                class="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 touch-manipulation"
                style="min-height: 44px;"
                aria-label="Logout"
              >
                <Icon name="arrow-left" size="md" class="flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                <span class="ml-3">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Mobile Backdrop -->
    <Transition
      name="mobile-backdrop"
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-300 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="mobile-backdrop fixed inset-0 z-30 bg-black bg-opacity-50"
        @click="closeMobileMenu"
        @touchstart="closeMobileMenu"
      ></div>
    </Transition>
    
    <!-- Bottom Navigation for Mobile -->
    <div class="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-4 py-2 safe-area-pb">
      <div class="flex items-center justify-around">
        <Link
          v-for="item in bottomNavItems"
          :key="item.id"
          :href="getRouteUrl(item.route)"
          class="bottom-nav-item flex flex-col items-center px-2 py-2 rounded-lg transition-colors duration-200 touch-manipulation"
          :class="{
            'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20': isActiveRoute(item.route),
            'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800': !isActiveRoute(item.route)
          }"
          style="min-height: 44px; min-width: 44px;"
          @click="handleBottomNavClick(item, $event)"
          :aria-label="`Navigate to ${item.label}`"
        >
          <Icon :name="item.icon" size="md" class="mb-1" />
          <span class="text-xs font-medium">{{ item.label }}</span>
        </Link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import Icon from '@/Components/Base/Icon.vue';
import MobileNavigationSection from './MobileNavigationSection.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';

import { useResponsive } from '@/composables/useResponsive.js';
import { getFilteredNavigation } from '@/config/navigation.js';

const props = defineProps({
  currentRoute: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['navigate', 'mobile-drawer-toggle']);

// Composables
const { user, roles: userRoles, getUserProperty } = useAuth();
const { isDarkMode, toggleTheme } = useTheme();
const { isMobile } = useResponsive();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Touch gesture handling
const touchStartX = ref(0);
const touchCurrentX = ref(0);
const isDragging = ref(false);

// Computed properties
const userName = computed(() => getUserProperty('name', 'User'));
const userEmail = computed(() => getUserProperty('email', ''));
const userRole = computed(() => {
  const roles = userRoles.value;
  if (roles.includes('Admin')) return 'Administrator';
  if (roles.includes('Manager')) return 'Manager';
  if (roles.includes('Employee')) return 'Employee';
  return 'User';
});

const filteredNavigation = computed(() => {
  return getFilteredNavigation(userRoles.value);
});

// Bottom navigation items (primary actions)
const bottomNavItems = computed(() => [
  {
    id: 'dashboard',
    label: 'Home',
    icon: 'home',
    route: 'dashboard',
    roles: ['Admin', 'Manager', 'Employee']
  },
  {
    id: 'attendance',
    label: 'Time',
    icon: 'clock',
    route: 'attendances.index',
    roles: ['Admin', 'Manager', 'Employee']
  },
  {
    id: 'leaves',
    label: 'Leaves',
    icon: 'calendar',
    route: 'leaves.index',
    roles: ['Admin', 'Manager', 'Employee']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'folder',
    route: 'projects.index',
    roles: ['Admin', 'Manager', 'Employee']
  },
  {
    id: 'notifications',
    label: 'Alerts',
    icon: 'bell',
    route: 'notifications.index',
    roles: ['Admin', 'Manager', 'Employee']
  }
].filter(item => item.roles.some(role => userRoles.value.includes(role))));

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
  // Emit drawer toggle event to parent components
  emit('mobile-drawer-toggle', isMobileMenuOpen.value);
  
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
  
  // Emit drawer toggle event to parent components
  emit('mobile-drawer-toggle', false);
};

const isActiveRoute = (routeName) => {
  return props.currentRoute.startsWith(routeName.split('.')[0]);
};

const handleNavigate = (navigationEvent) => {
  closeMobileMenu();
  emit('navigate', navigationEvent);
  
  if (navigationEvent.route) {
    try {
      // Validate route exists before navigation
      const routeUrl = route(navigationEvent.route);
      if (!routeUrl) {
        throw new Error(`Route '${navigationEvent.route}' not found`);
      }
      
      // Perform navigation with error handling
      router.visit(routeUrl, {
        onError: (errors) => {
          console.error('Navigation error:', errors);
          // Dispatch custom event for error handling
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('navigation-error', {
              detail: {
                error: new Error('Navigation failed with errors'),
                route: navigationEvent.route,
                context: 'mobile-navigation',
                errors
              }
            }));
          }
        },
        onException: (exception) => {
          console.error('Navigation exception:', exception);
          // Dispatch custom event for error handling
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('navigation-error', {
              detail: {
                error: exception,
                route: navigationEvent.route,
                context: 'mobile-navigation'
              }
            }));
          }
        }
      });
    } catch (error) {
      console.warn(`Navigation failed for route: ${navigationEvent.route}`, error);
      
      // Dispatch custom event for error handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation-error', {
          detail: {
            error,
            route: navigationEvent.route,
            context: 'mobile-navigation'
          }
        }));
      }
    }
  }
};

const getRouteUrl = (routeName) => {
  try {
    return route(routeName);
  } catch (error) {
    console.warn(`Route '${routeName}' not found, falling back to dashboard`);
    return route('dashboard');
  }
};

const handleBottomNavClick = (item, event) => {
  try {
    // Validate route exists
    const routeUrl = route(item.route);
    if (!routeUrl) {
      event.preventDefault();
      console.warn(`Route '${item.route}' not found`);
      return;
    }
  } catch (error) {
    event.preventDefault();
    console.warn(`Navigation failed for route: ${item.route}`, error);
    
    // Dispatch custom event for error handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigation-error', {
        detail: {
          error,
          route: item.route,
          context: 'mobile-bottom-navigation'
        }
      }));
    }
  }
};

const handleLogout = () => {
  closeMobileMenu();
  router.post(route('logout'));
};

// Touch gesture handling for swipe to close
const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX;
  isDragging.value = true;
};

const handleTouchMove = (event) => {
  if (!isDragging.value) return;
  
  touchCurrentX.value = event.touches[0].clientX;
  const deltaX = touchCurrentX.value - touchStartX.value;
  
  // Only allow swipe to close (left swipe)
  if (deltaX < -50) {
    event.preventDefault();
  }
};

const handleTouchEnd = (event) => {
  if (!isDragging.value) return;
  
  const deltaX = touchCurrentX.value - touchStartX.value;
  
  // Close menu if swiped left more than 100px
  if (deltaX < -100) {
    closeMobileMenu();
  }
  
  isDragging.value = false;
  touchStartX.value = 0;
  touchCurrentX.value = 0;
};

// Handle escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  // Register component with conflict detector
  this.$conflictDetector.registerComponent('mobile', 'mobile-navigation-component');
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
  // Unregister component from conflict detector
  this.$conflictDetector.unregisterComponent('mobile');
});
</script>

<style scoped>
/* Mobile-only component - only renders when screen width < 1024px */

/* Mobile Drawer Styles */
.mobile-drawer {
  max-width: 320px;
  /* Ensure drawer is accessible and scrollable */
  overscroll-behavior: contain;
}

/* Mobile Top Bar Styles */
.mobile-top-bar {
  /* Ensure top bar stays above content */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Bottom Navigation Styles */
.mobile-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  /* Ensure bottom nav stays above content */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.bottom-nav-item {
  min-width: 60px;
  text-align: center;
  /* Ensure touch targets are large enough */
  min-height: 44px;
}

/* Touch-friendly sizing - critical for mobile usability */
.touch-manipulation {
  touch-action: manipulation;
  /* Prevent double-tap zoom on touch devices */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Safe area support for devices with notches */
.safe-area-pb {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

/* Smooth transitions for mobile interactions */
.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-backdrop-enter-active,
.mobile-backdrop-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hamburger button animation */
.hamburger-button {
  transition: all 0.2s ease;
}

.hamburger-button:active {
  transform: scale(0.95);
}

/* Mobile-specific responsive adjustments */
@media (max-width: 320px) {
  .mobile-drawer {
    width: 100vw;
    max-width: 100vw;
  }
  
  .bottom-nav-item {
    min-width: 50px;
    padding: 0.25rem;
  }
  
  .bottom-nav-item span {
    font-size: 0.625rem;
    line-height: 1;
  }
  
  .mobile-top-bar {
    padding: 0.5rem 1rem;
  }
}

/* Landscape mobile adjustments for better usability */
@media (max-height: 500px) and (orientation: landscape) {
  .mobile-bottom-nav {
    display: none;
  }
  
  .mobile-drawer {
    width: 280px;
    max-width: 280px;
  }
  
  .mobile-top-bar {
    padding: 0.5rem 1rem;
  }
}

/* High DPI display adjustments */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .mobile-drawer {
    border-width: 0.5px;
  }
  
  .mobile-top-bar,
  .mobile-bottom-nav {
    border-width: 0.5px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .mobile-drawer-enter-active,
  .mobile-drawer-leave-active,
  .mobile-backdrop-enter-active,
  .mobile-backdrop-leave-active,
  .hamburger-button {
    transition: none;
  }
}

/* Dark mode specific adjustments */
@media (prefers-color-scheme: dark) {
  .mobile-top-bar,
  .mobile-bottom-nav {
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
  }
}

/* Focus visible for keyboard navigation */
.hamburger-button:focus-visible,
.bottom-nav-item:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}
</style>