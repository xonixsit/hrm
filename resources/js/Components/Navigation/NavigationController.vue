<template>
  <NavigationErrorBoundary
    :current-route="currentRoute"
    :navigation-type="'controller'"
    :component-id="controllerId"
    :max-retries="3"
    :on-error="handleNavigationError"
    :on-recover="handleNavigationRecover"
    @error="handleBoundaryError"
    @recover="handleBoundaryRecover"
    @fallback-activated="handleFallbackActivated"
    @conflict-detected="handleConflictDetected"
  >
    <div 
      class="navigation-controller"
      :class="{
        'is-transitioning': transitionState.isTransitioning || breakpointTransitioning,
        'desktop-mode': deviceType === 'desktop',
        'mobile-mode': deviceType === 'mobile',
        'has-conflicts': hasActiveConflicts,
        'fallback-active': fallbackActive
      }"
      :data-navigation-mode="deviceType"
      :data-navigation-id="controllerId"
      :data-conflict-status="hasActiveConflicts ? 'conflict' : 'clean'"
    >
      <!-- Show fallback navigation if primary navigation fails -->
      <NavigationFallback
        v-if="fallbackActive"
        :fallback-reason="fallbackReason"
        :error-details="fallbackErrorDetails"
        :current-route="currentRoute"
        :failed-navigation-type="deviceType"
        :show-error-indicator="true"
        :show-debug-info="isDevelopment"
        :on-retry="handleFallbackRetry"
        @navigate="handleFallbackNavigation"
        @retry="handleFallbackRetryEvent"
        @reload="handleFallbackReload"
        @fallback-action="handleFallbackAction"
      />
      
      <!-- Primary navigation with conflict prevention -->
      <Transition
        v-else
        name="navigation-transition"
        mode="out-in"
        :duration="{ enter: 200, leave: 150 }"
        @before-enter="handleTransitionStart"
        @after-enter="handleTransitionEnd"
        @before-leave="handleTransitionStart"
        @after-leave="handleTransitionEnd"
      >
        <component 
          :key="deviceType"
          :is="currentNavigationComponent"
          v-bind="navigationProps"
          :data-navigation-type="deviceType"
          :data-navigation-id="componentId"
          :data-conflict-protected="true"
          @navigate="handleNavigate"
          @collapse-change="handleCollapseChange"
          @state-change="handleStateChange"
          @mobile-drawer-toggle="handleMobileDrawerToggle"
        />
      </Transition>
      
      <!-- Conflict indicator (development only) -->
      <div 
        v-if="isDevelopment && hasActiveConflicts" 
        class="conflict-indicator"
        @click="showConflictDetails"
      >
        <Icon name="exclamation-triangle" size="sm" class="text-warning-500" />
        <span class="conflict-count">{{ activeConflicts.length }}</span>
      </div>
    </div>
  </NavigationErrorBoundary>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useResponsive } from '@/composables/useResponsive.js';
import { useBreakpointManager } from '@/composables/useBreakpointManager.js';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';

// Import navigation components
import SidebarNavigation from './SidebarNavigation.vue';
import MobileNavigation from './MobileNavigation.vue';
import NavigationErrorBoundary from './NavigationErrorBoundary.vue';
import NavigationFallback from './NavigationFallback.vue';
import Icon from '@/Components/Base/Icon.vue';

// Import conflict prevention services
import { conflictDetector } from '@/services/NavigationConflictDetector.js';
import { navigationMonitor } from '@/services/NavigationMonitor.js';
import { navigationDebugger } from '@/utils/navigationDebugger.js';

const props = defineProps({
  /**
   * Current route name for active state detection
   */
  currentRoute: {
    type: String,
    required: true,
  },
  
  /**
   * Initial collapsed state for desktop sidebar
   */
  initiallyCollapsed: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Force a specific navigation type (for testing/debugging)
   */
  forceNavigationType: {
    type: String,
    validator: (value) => ['desktop', 'mobile', null].includes(value),
    default: null,
  },
});

const emit = defineEmits([
  'navigate',
  'collapse-change', 
  'state-change',
  'navigation-type-change',
  'navigation-transition',
  'mobile-drawer-toggle'
]);

// Composables
const { isMobile, isTablet, isDesktop, debugResponsive } = useResponsive();
const { 
  windowWidth, 
  navigationMode, 
  isTransitioning: breakpointTransitioning,
  preserveCurrentState,
  restorePreservedState,
  getBreakpointInfo,
  debugBreakpointManager,
  NAVIGATION_BREAKPOINT
} = useBreakpointManager();
const { user, roles: userRoles, isAuthenticated } = useAuth();
const { isDark } = useTheme();

// Navigation state
const currentNavigationType = ref('desktop');
const navigationError = ref(null);
const transitionState = ref({
  isTransitioning: false,
  fromType: null,
  toType: null,
  preservedData: null
});

// Conflict prevention state
const controllerId = ref(`controller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
const componentId = ref(`nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
const activeConflicts = ref([]);
const fallbackActive = ref(false);
const fallbackReason = ref('');
const fallbackErrorDetails = ref({});
const isDevelopment = process.env.NODE_ENV === 'development';

// Device detection with enhanced breakpoint management
const deviceType = computed(() => {
  // Allow forced navigation type for testing
  if (props.forceNavigationType) {
    return props.forceNavigationType;
  }
  
  // Use the enhanced breakpoint manager
  return navigationMode.value;
});

// Navigation component selection
const currentNavigationComponent = computed(() => {
  try {
    const component = deviceType.value === 'desktop' ? SidebarNavigation : MobileNavigation;
    
    // Log navigation type changes for debugging
    if (process.env.NODE_ENV === 'development' && currentNavigationType.value !== deviceType.value) {
      //console.log(`[NavigationController] Switching from ${currentNavigationType.value} to ${deviceType.value} navigation`);
    }
    
    currentNavigationType.value = deviceType.value;
    return component;
  } catch (error) {
    console.error('[NavigationController] Error selecting navigation component:', error);
    navigationError.value = error;
    
    // Fallback to desktop navigation
    return SidebarNavigation;
  }
});

// Shared navigation props
const navigationProps = computed(() => {
  const baseProps = {
    currentRoute: props.currentRoute,
    userRoles: userRoles.value || [],
    isAuthenticated: isAuthenticated.value,
  };
  
  // Add desktop-specific props
  if (deviceType.value === 'desktop') {
    return {
      ...baseProps,
      initiallyCollapsed: props.initiallyCollapsed,
    };
  }
  
  // Add mobile-specific props
  return {
    ...baseProps,
    // Mobile-specific props can be added here
  };
});

// Navigation type tracking
const isDesktopNavigation = computed(() => deviceType.value === 'desktop');
const isMobileNavigation = computed(() => deviceType.value === 'mobile');

// Conflict prevention computed properties
const hasActiveConflicts = computed(() => false); // Temporarily disabled to fix navigation

// Event handlers
const handleNavigate = (navigationEvent) => {
  try {
    emit('navigate', {
      ...navigationEvent,
      navigationType: currentNavigationType.value,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[NavigationController] Navigation error:', error);
    navigationError.value = error;
  }
};

const handleCollapseChange = (collapsed) => {
  try {
    emit('collapse-change', collapsed);
  } catch (error) {
    console.error('[NavigationController] Collapse change error:', error);
  }
};

const handleStateChange = (state) => {
  try {
    emit('state-change', {
      ...state,
      navigationType: currentNavigationType.value,
      deviceType: deviceType.value
    });
  } catch (error) {
    console.error('[NavigationController] State change error:', error);
  }
};

const handleMobileDrawerToggle = (isOpen) => {
  try {
    emit('mobile-drawer-toggle', isOpen);
  } catch (error) {
    console.error('[NavigationController] Mobile drawer toggle error:', error);
  }
};

// Enhanced navigation type change detection with state preservation
watch(deviceType, async (newType, oldType) => {
  if (newType !== oldType) {
    transitionState.value.isTransitioning = true;
    transitionState.value.fromType = oldType;
    transitionState.value.toType = newType;
    
    try {
      // Emit transition start event
      emit('navigation-transition', true);
      
      // Preserve current state before transition
      const preservedData = preserveCurrentState({
        navigationState: {
          currentRoute: props.currentRoute,
          userPreferences: {},
          timestamp: Date.now()
        }
      });
      
      transitionState.value.preservedData = preservedData;
      
      // Emit navigation type change event with enhanced data
      emit('navigation-type-change', {
        from: oldType,
        to: newType,
        breakpoint: windowWidth.value,
        breakpointInfo: getBreakpointInfo(),
        preservedData,
        timestamp: Date.now(),
        isTransitioning: true
      });
      
      // Wait for next tick to ensure component switching is complete
      await nextTick();
      
      // Add a small delay for smooth visual transition
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Restore preserved state after transition
      restorePreservedState();
      
      // Log the change for debugging
      if (process.env.NODE_ENV === 'development') {
        //console.log(`[NavigationController] Navigation type changed: ${oldType} → ${newType} (width: ${windowWidth.value}px)`);
        //console.log('Breakpoint info:', getBreakpointInfo());
      }
    } catch (error) {
      console.error('[NavigationController] Error during navigation type change:', error);
      navigationError.value = error;
    } finally {
      // Emit transition end event
      emit('navigation-transition', false);
      
      transitionState.value.isTransitioning = false;
      transitionState.value.fromType = null;
      transitionState.value.toType = null;
    }
  }
}, { immediate: false });

// Error recovery
const clearError = () => {
  navigationError.value = null;
};

// Enhanced debug utilities
const debugNavigationController = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🧭 NavigationController Debug Info');
    //console.log('Current route:', props.currentRoute);
    //console.log('Window width:', windowWidth.value);
    //console.log('Device type:', deviceType.value);
    //console.log('Navigation type:', currentNavigationType.value);
    //console.log('Component:', currentNavigationComponent.value?.name || 'Unknown');
    //console.log('Is transitioning:', transitionState.value.isTransitioning || breakpointTransitioning.value);
    //console.log('Transition state:', transitionState.value);
    //console.log('User roles:', userRoles.value);
    //console.log('Navigation error:', navigationError.value);
    //console.log('Props:', navigationProps.value);
    //console.log('Breakpoint info:', getBreakpointInfo());
    debugResponsive();
    debugBreakpointManager();
    console.groupEnd();
  }
};

// Conflict detection and prevention
const detectNavigationConflicts = () => {
  if (process.env.NODE_ENV === 'development') {
    // Check for multiple navigation components in DOM
    const desktopNavs = document.querySelectorAll('[data-navigation-type="desktop"]');
    const mobileNavs = document.querySelectorAll('[data-navigation-type="mobile"]');
    
    if (desktopNavs.length > 1 || mobileNavs.length > 1) {
      console.warn('[NavigationController] Multiple navigation components detected!', {
        desktop: desktopNavs.length,
        mobile: mobileNavs.length
      });
    }
    
    if (desktopNavs.length > 0 && mobileNavs.length > 0) {
      console.warn('[NavigationController] Both desktop and mobile navigation are visible simultaneously!');
    }
  }
};

// Conflict prevention methods
const handleNavigationError = async (error) => {
  navigationMonitor.logNavigationError(error, {
    componentId: controllerId.value,
    navigationType: deviceType.value,
    currentRoute: props.currentRoute
  });
  
  // Activate fallback if error is critical
  if (error.severity === 'critical' || error.type === 'component_loading') {
    activateFallback('Navigation component error', error);
  }
};

const handleNavigationRecover = async () => {
  // Attempt to recover from navigation error
  try {
    // Reset component IDs to force re-registration
    componentId.value = `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear any active conflicts
    activeConflicts.value = [];
    
    // Deactivate fallback
    deactivateFallback();
    
    navigationMonitor.logEvent('navigation_recovery_success', {
      controllerId: controllerId.value,
      deviceType: deviceType.value
    });
    
    return true;
  } catch (error) {
    console.error('[NavigationController] Recovery failed:', error);
    return false;
  }
};

const handleBoundaryError = (errorReport) => {
  navigationMonitor.logNavigationError(new Error(errorReport.message), {
    errorReport,
    source: 'error_boundary'
  });
};

const handleBoundaryRecover = (recoveryEvent) => {
  navigationMonitor.logEvent('boundary_recovery', recoveryEvent);
};

const handleFallbackActivated = (activationEvent) => {
  activateFallback(activationEvent.reason, activationEvent.errorReport);
};

const handleConflictDetected = (conflictEvent) => {
  activeConflicts.value = conflictEvent.conflicts;
  
  navigationMonitor.logConflict(conflictEvent.conflicts, false);
  
  // Try to resolve conflicts automatically
  const resolutions = conflictDetector.resolveConflicts();
  if (resolutions.length > 0) {
    navigationMonitor.logConflict(conflictEvent.conflicts, true);
  }
};

const activateFallback = (reason, errorDetails = {}) => {
  fallbackActive.value = true;
  fallbackReason.value = reason;
  fallbackErrorDetails.value = errorDetails;
  
  navigationMonitor.logFallback(true, reason, errorDetails);
  
  if (isDevelopment) {
    console.warn('[NavigationController] Fallback activated:', reason);
  }
};

const deactivateFallback = () => {
  fallbackActive.value = false;
  fallbackReason.value = '';
  fallbackErrorDetails.value = {};
  
  navigationMonitor.logFallback(false, 'recovery_successful');
  
  if (isDevelopment) {
    //console.log('[NavigationController] Fallback deactivated');
  }
};

// Fallback event handlers
const handleFallbackNavigation = (navigationEvent) => {
  navigationMonitor.logUserAction('fallback_navigation', navigationEvent.item.name, navigationEvent);
  handleNavigate(navigationEvent);
};

const handleFallbackRetry = async () => {
  return await handleNavigationRecover();
};

const handleFallbackRetryEvent = (retryEvent) => {
  navigationMonitor.logRetryAttempt(retryEvent.attempt, retryEvent.maxRetries, {
    source: 'fallback',
    failedNavigationType: retryEvent.failedNavigationType
  });
  
  handleFallbackRetry();
};

const handleFallbackReload = () => {
  navigationMonitor.logUserAction('fallback_reload', 'page');
  window.location.reload();
};

const handleFallbackAction = (actionEvent) => {
  navigationMonitor.logUserAction('fallback_action', actionEvent.action, actionEvent);
};

// Transition event handlers
const handleTransitionStart = () => {
  navigationMonitor.startPerformanceMark(`navigation_transition_${deviceType.value}`);
};

const handleTransitionEnd = () => {
  navigationMonitor.endPerformanceMark(`navigation_transition_${deviceType.value}`, {
    navigationType: deviceType.value,
    controllerId: controllerId.value
  });
};

// Conflict debugging (development only)
const showConflictDetails = () => {
  if (isDevelopment) {
    navigationDebugger.debug('conflict', true);
  }
};

// Lifecycle
onMounted(() => {
  // Register controller with conflict detector
  conflictDetector.registerComponent(controllerId.value, 'controller', {
    currentRoute: props.currentRoute,
    deviceType: deviceType.value,
    timestamp: Date.now()
  });
  
  // Register navigation component
  conflictDetector.registerComponent(componentId.value, deviceType.value, {
    currentRoute: props.currentRoute,
    controllerId: controllerId.value,
    timestamp: Date.now()
  });
  
  // Log navigation load
  navigationMonitor.logNavigationLoad('controller', controllerId.value);
  
  // Initial navigation type setup
  currentNavigationType.value = deviceType.value;
  
  // Emit initial state
  emit('navigation-type-change', {
    from: null,
    to: deviceType.value,
    breakpoint: windowWidth.value,
    timestamp: Date.now()
  });
  
  // Set up conflict monitoring
  const conflictCheckInterval = setInterval(() => {
    const conflicts = conflictDetector.detectConflicts();
    if (conflicts.length !== activeConflicts.value.length) {
      activeConflicts.value = conflicts;
    }
  }, 2000);
  
  // Set up conflict detection in development
  if (process.env.NODE_ENV === 'development') {
    // Additional development-only conflict checking
    const devConflictCheckInterval = setInterval(detectNavigationConflicts, 5000);
    

  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    //console.log('Unregistering NavigationController:', { controllerId: controllerId.value, componentId: componentId.value });
    clearInterval(conflictCheckInterval);
    clearInterval(devConflictCheckInterval); // Moved here for proper cleanup
    conflictDetector.unregisterComponent(controllerId.value);
    conflictDetector.unregisterComponent(componentId.value);
    navigationMonitor.logEvent('component_unregistered', { controllerId: controllerId.value, componentId: componentId.value });
  });
  
  // Log initialization
  if (process.env.NODE_ENV === 'development') {
    //console.log('[NavigationController] Initialized with navigation type:', deviceType.value);
    //console.log('[NavigationController] Controller ID:', controllerId.value);
    //console.log('[NavigationController] Component ID:', componentId.value);
  }
});

// Expose debug utilities for external access
defineExpose({
  debugNavigationController,
  clearError,
  currentNavigationType: computed(() => currentNavigationType.value),
  deviceType,
  isTransitioning: computed(() => transitionState.value.isTransitioning || breakpointTransitioning.value),
  navigationError: computed(() => navigationError.value),
  transitionState: computed(() => transitionState.value),
  breakpointInfo: getBreakpointInfo
});
</script>

<style scoped>
/* Navigation controller container */
.navigation-controller {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Transition states */
.navigation-controller.is-transitioning {
  pointer-events: none;
}

.navigation-controller.desktop-mode {
  /* Desktop-specific styles can be added here */
}

.navigation-controller.mobile-mode {
  /* Mobile-specific styles can be added here */
}

/* Enhanced navigation transitions */
.navigation-transition-enter-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 50ms;
}

.navigation-transition-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.navigation-transition-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.navigation-transition-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Prevent layout shifts during transitions */
.navigation-transition-enter-active,
.navigation-transition-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* Ensure proper z-index during transitions */
.navigation-transition-enter-active {
  z-index: 2;
}

.navigation-transition-leave-active {
  z-index: 1;
}

/* Smooth transitions for different breakpoints */
@media (max-width: 1023px) {
  .navigation-transition-enter-from {
    transform: translateY(-10px);
  }
  
  .navigation-transition-leave-to {
    transform: translateY(10px);
  }
}

/* Conflict prevention styles */
.navigation-controller.has-conflicts {
  @apply border-l-4 border-warning-500;
}

.navigation-controller.fallback-active {
  @apply border-l-4 border-error-500;
}

.conflict-indicator {
  @apply absolute top-2 right-2 z-50;
  @apply flex items-center space-x-1;
  @apply bg-warning-100 border border-warning-300 rounded-md px-2 py-1;
  @apply cursor-pointer hover:bg-warning-200;
  @apply transition-colors duration-150;
}

.conflict-count {
  @apply text-xs font-medium text-warning-700;
}

/* Dark theme support for conflict indicators */
.theme-dark .conflict-indicator {
  @apply bg-warning-900 border-warning-700;
}

.theme-dark .conflict-count {
  @apply text-warning-300;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .navigation-controller,
  .navigation-transition-enter-active,
  .navigation-transition-leave-active {
    transition: none;
  }
  
  .navigation-transition-enter-from,
  .navigation-transition-leave-to {
    transform: none;
  }
}
</style>