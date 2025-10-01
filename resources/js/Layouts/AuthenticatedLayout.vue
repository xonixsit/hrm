<script setup>
import { ref, computed, useSlots, onMounted } from 'vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import NavigationErrorDisplay from '@/Components/NavigationErrorDisplay.vue';
import NavigationController from '@/Components/Navigation/NavigationController.vue';
import NotificationContainer from '@/Components/Notifications/NotificationContainer.vue';
import FloatingAttendanceWidget from '@/Components/Navigation/FloatingAttendanceWidget.vue';
import SkipLinks from '@/Components/Accessibility/SkipLinks.vue';
import LiveRegion from '@/Components/Accessibility/LiveRegion.vue';
import { useAuth } from '@/composables/useAuth';
import { useResponsive } from '@/composables/useResponsive';
import { useTheme } from '@/composables/useTheme.js';
import { useLayoutSpacing } from '@/composables/useLayoutSpacing.js';
import { useReminder } from '@/composables/useReminder';
import { useWorkReportReminder } from '@/composables/useWorkReportReminder';

// Access slots in script setup
const slots = useSlots();

// Navigation state - managed by NavigationController
const currentNavigationType = ref('desktop');
const sidebarCollapsed = ref(false);

// Use authentication composable for safe access to user data
const { user, isAuthenticated, hasRole, getUserProperty, getAuthError } = useAuth();

// Use responsive composable for device detection
const { isMobile, isDesktop } = useResponsive();

// Use theme composable and initialize theme system
const { isDark, initializeTheme } = useTheme();

useReminder();
useWorkReportReminder();

// Initialize theme system on mount
onMounted(() => {
  initializeTheme();
});

// Use layout spacing composable for enhanced layout management
const {
  layoutType,
  mainContentClasses: layoutMainContentClasses,
  contentInnerClasses: layoutContentInnerClasses,
  cssCustomProperties,
  updateSidebarState,
  updateMobileDrawerState,
  updateLayoutType,
  isTransitioning: layoutTransitioning
} = useLayoutSpacing();

// Computed properties for user data with fallbacks
const userName = computed(() => getUserProperty('name', 'User'));
const userEmail = computed(() => getUserProperty('email', ''));

// Error handling for missing authentication data
const authError = computed(() => getAuthError());
const hasAuthError = computed(() => !!authError.value);

// Get current route name
const currentRoute = computed(() => {
  try {
    return route().current() || '';
  } catch (error) {
    console.warn('[LAYOUT] Route helper not available:', error);
    return window.location.pathname.replace('/', '') || 'dashboard';
  }
});

// Handle navigation events from NavigationController
const handleNavigationEvent = (navigationEvent) => {
  // Navigation routing is handled by the NavigationController component
  // This can be extended for additional navigation event handling if needed
};

// Handle navigation type changes (desktop/mobile switching)
const handleNavigationTypeChange = (event) => {
  currentNavigationType.value = event.to;
  
  // Update layout spacing composable
  updateLayoutType(event.to);
  
  // Log navigation type changes for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AuthenticatedLayout] Navigation type changed: ${event.from} → ${event.to}`);
  }
};

// Handle sidebar collapse changes from NavigationController
const handleSidebarCollapseChange = (collapsed) => {
  sidebarCollapsed.value = collapsed;
  
  // Update layout spacing composable
  updateSidebarState(collapsed);
};

// Handle navigation state changes
const handleNavigationStateChange = (state) => {
  // Handle any additional state changes from navigation components
  if (state.sidebarCollapsed !== undefined) {
    sidebarCollapsed.value = state.sidebarCollapsed;
  }
};

// Dynamic layout classes based on active navigation type
const layoutClasses = computed(() => ({
  // Base layout container classes
  'layout-container': true,
  'transition-colors': true,
  'duration-200': true,
  
  // Theme-based background
  'bg-neutral-50': !isDark.value,
  'bg-neutral-900': isDark.value,
  
  // Navigation type specific classes
  'desktop-layout': currentNavigationType.value === 'desktop',
  'mobile-layout': currentNavigationType.value === 'mobile',
}));

// Main content area classes for proper spacing with navigation
const mainContentClasses = computed(() => {
  // Get base classes from layout spacing composable
  const baseClasses = layoutMainContentClasses.value;
  
  // Add additional layout-specific classes
  const additionalClasses = {
    // Add header presence indicator if needed
    'has-header': hasHeader.value,
  };

  // Merge classes from composable with additional classes
  return {
    ...baseClasses,
    ...additionalClasses
  };
});

// Header classes for desktop top bar
const headerClasses = computed(() => ({
  'px-6': true,
  'py-4': true,
  'flex': true,
  'items-center': true,
  'justify-between': true,
  'shadow-sm': true,
  'transition-colors': true,
  'duration-200': true,
  'border-b': true,
  
  // Theme-aware styling
  'bg-white': !isDark.value,
  'border-neutral-200': !isDark.value,
  'bg-neutral-900': isDark.value,
  'border-neutral-700': isDark.value,
}));

// Mobile header classes
const mobileHeaderClasses = computed(() => ({
  'px-6': true,
  'py-4': true,
  'transition-colors': true,
  'duration-200': true,
  'border-b': true,
  
  // Theme-aware styling
  'bg-white': !isDark.value,
  'border-neutral-200': !isDark.value,
  'bg-neutral-900': isDark.value,
  'border-neutral-700': isDark.value,
}));

// Main content inner classes
const mainInnerClasses = computed(() => ({
  'flex-1': true,
  // 'overflow-y-auto': true,
  'transition-colors': true,
  'duration-200': true,
  
  // Theme-aware background
  'bg-neutral-50': !isDark.value,
  'bg-neutral-900': isDark.value,
}));



// Mobile drawer overlay state tracking
const isMobileDrawerOpen = ref(false);
const isTransitioning = ref(false);

// Header presence detection
const hasHeader = computed(() => !!slots.header);

// Handle mobile drawer state changes
const handleMobileDrawerToggle = (isOpen) => {
  isMobileDrawerOpen.value = isOpen;
  
  // Update layout spacing composable
  updateMobileDrawerState(isOpen);
  
  // Prevent body scroll when drawer is open
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Handle navigation transitions
const handleNavigationTransition = (isTransitionActive) => {
  isTransitioning.value = isTransitionActive;
};

// Content overlay classes for mobile drawer interaction
const contentOverlayClasses = computed(() => {
  // Get base classes from layout spacing composable
  const baseClasses = layoutContentInnerClasses.value;
  
  // Return the classes from the composable which already handles overlay effects
  return baseClasses;
});
</script>

<template>
    <div>
        <!-- Skip Links for Accessibility -->
        <SkipLinks />
        
        <!-- Live Regions for Screen Reader Announcements -->
        <LiveRegion />
        
        <!-- Navigation Error Display -->
        <NavigationErrorDisplay />
        
        <!-- Notification Container -->
        <NotificationContainer />
        
        <!-- Floating Attendance Widget -->
        <FloatingAttendanceWidget />
        
        <!-- Error handling for missing authentication data -->
        <div v-if="hasAuthError" class="p-4 bg-red-100 border border-red-400 text-red-700 z-50 relative">
            <p class="font-semibold">Authentication Error:</p>
            <p>{{ authError }}</p>
            <p class="text-sm mt-1">Please refresh the page or contact support if the issue persists.</p>
        </div>
        
        <!-- Unified Navigation Controller -->
        <NavigationController
            :current-route="currentRoute"
            :initially-collapsed="sidebarCollapsed"
            @navigate="handleNavigationEvent"
            @collapse-change="handleSidebarCollapseChange"
            @navigation-type-change="handleNavigationTypeChange"
            @navigation-transition="handleNavigationTransition"
            @state-change="handleNavigationStateChange"
            @mobile-drawer-toggle="handleMobileDrawerToggle"
        />

        <!-- Main Layout with Dynamic Classes -->
        <div :class="layoutClasses">
            
            <!-- Main Content Area with Enhanced Layout Spacing -->
            <div 
                :class="[
                    'main-content-area',
                    'desktop-layout',
                    'gpu-accelerated',
                    {
                        'sidebar-collapsed': sidebarCollapsed,
                        'sidebar-expanded': !sidebarCollapsed,
                        'transitioning': isTransitioning || layoutTransitioning,
                        'has-header': hasHeader
                    }
                ]"
                :style="{
                    marginLeft: currentNavigationType === 'desktop' ? (sidebarCollapsed ? '64px' : '256px') : '0',
                    transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                    ...cssCustomProperties
                }"
                data-layout-type="authenticated-content"
                :aria-hidden="isTransitioning ? 'true' : 'false'"
            >
                
                <!-- Desktop Top Bar -->
                <header 
                    v-if="currentNavigationType === 'desktop' && slots.header" 
                    :class="['content-header', headerClasses]"
                    role="banner"
                    aria-label="Page header"
                >
                    <div :class="[
                        'text-lg font-semibold transition-colors duration-200',
                        isDark ? 'text-neutral-100' : 'text-neutral-900'
                    ]">
                        <slot name="header" />
                    </div>
                    
                    <!-- Desktop User Menu -->
                    <nav aria-label="User account menu">
                        <Dropdown align="right" width="48">
                            <template #trigger>
                                <button 
                                    :class="[
                                        'flex items-center p-2 rounded-lg transition-colors duration-200',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                                        isDark 
                                            ? 'text-neutral-300 hover:bg-neutral-800' 
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    ]"
                                    :aria-label="`User menu for ${userName}`"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                        <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <span :class="[
                                        'ml-2 text-sm font-medium',
                                        isDark ? 'text-neutral-200' : 'text-neutral-700'
                                    ]">{{ userName }}</span>
                                </button>
                            </template>
                            <template #content>
                                <div :class="[
                                    'px-4 py-2 border-b',
                                    isDark 
                                        ? 'border-neutral-600 bg-neutral-800' 
                                        : 'border-neutral-200 bg-white'
                                ]">
                                    <p :class="[
                                        'text-sm font-medium',
                                        isDark ? 'text-neutral-100' : 'text-neutral-900'
                                    ]">{{ userName }}</p>
                                    <p :class="[
                                        'text-xs',
                                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                                    ]">{{ userEmail }}</p>
                                </div>
                                <DropdownLink :href="route('profile.edit')">
                                    Profile Settings
                                </DropdownLink>
                                <DropdownLink :href="route('logout')" method="post" as="button">
                                    Log Out
                                </DropdownLink>
                            </template>
                        </Dropdown>
                    </nav>
                </header>
                
                <!-- Mobile Page Header -->
                <header
                    v-if="currentNavigationType === 'mobile' && slots.header"
                    :class="['content-header', mobileHeaderClasses]"
                    role="banner"
                    aria-label="Page header"
                >
                    <div :class="[
                        'text-lg font-semibold',
                        isDark ? 'text-neutral-100' : 'text-neutral-900'
                    ]">
                        <slot name="header" />
                    </div>
                </header>
                
                <!-- Main Content Body with Enhanced Spacing -->
                <main 
                    id="main-content"
                    :class="['content-body', mainInnerClasses]"
                    role="main"
                    aria-label="Main content"
                    tabindex="-1"
                >
                    <div :class="contentOverlayClasses">
                        <slot />
                    </div>
                </main>
                
            </div>
        </div>
    </div>
</template>
