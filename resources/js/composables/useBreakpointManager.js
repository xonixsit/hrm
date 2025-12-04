import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { debounce, throttle } from '@/utils/responsiveHelpers.js';

/**
 * Enhanced Breakpoint Management System
 * 
 * Provides robust breakpoint detection with smooth transitions,
 * state preservation, and conflict prevention for navigation components
 */

// Navigation breakpoint configuration
const NAVIGATION_BREAKPOINT = 1024; // Exact breakpoint for desktop/mobile switch
const DEBOUNCE_DELAY = 150; // Debounce delay for resize events
const TRANSITION_DELAY = 200; // Delay for smooth transitions

// Reactive state
const windowWidth = ref(0);
const windowHeight = ref(0);
const isTransitioning = ref(false);
const previousBreakpointState = ref(null);
const stateHistory = ref([]);

// Device orientation tracking
const orientation = ref('portrait');
const isLandscape = computed(() => orientation.value === 'landscape');

export function useBreakpointManager() {
  // Core breakpoint detection
  const isDesktopBreakpoint = computed(() => windowWidth.value >= NAVIGATION_BREAKPOINT);
  const isMobileBreakpoint = computed(() => windowWidth.value < NAVIGATION_BREAKPOINT);
  
  // Navigation type determination
  const navigationMode = computed(() => {
    return isDesktopBreakpoint.value ? 'desktop' : 'mobile';
  });
  
  // Breakpoint change detection
  const hasBreakpointChanged = computed(() => {
    if (!previousBreakpointState.value) return false;
    return previousBreakpointState.value.mode !== navigationMode.value;
  });
  
  // State preservation object
  const preservedState = ref({
    currentRoute: null,
    userPreferences: {},
    navigationState: {},
    scrollPosition: 0,
    timestamp: null
  });
  
  // Update window dimensions
  const updateDimensions = () => {
    if (typeof window === 'undefined') return;
    
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newOrientation = newWidth > newHeight ? 'landscape' : 'portrait';
    
    // Store previous state before updating
    if (windowWidth.value !== 0) {
      previousBreakpointState.value = {
        width: windowWidth.value,
        height: windowHeight.value,
        mode: navigationMode.value,
        orientation: orientation.value,
        timestamp: Date.now()
      };
    }
    
    windowWidth.value = newWidth;
    windowHeight.value = newHeight;
    orientation.value = newOrientation;
    
    // Log dimension changes in development
    if (process.env.NODE_ENV === 'development') {
      //console.log(`[BreakpointManager] Dimensions updated: ${newWidth}x${newHeight} (${newOrientation})`);
    }
  };
  
  // Initialize dimensions immediately
  updateDimensions();
  
  // Debounced resize handler to prevent rapid switching
  const debouncedResize = debounce(() => {
    updateDimensions();
  }, DEBOUNCE_DELAY);
  
  // Throttled resize handler for immediate feedback
  const throttledResize = throttle(() => {
    // Update dimensions immediately for visual feedback
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
    }
  }, 16); // ~60fps
  
  // State preservation functions
  const preserveCurrentState = (additionalState = {}) => {
    const currentState = {
      currentRoute: window.location.pathname,
      scrollPosition: window.scrollY || 0,
      timestamp: Date.now(),
      breakpoint: windowWidth.value,
      navigationMode: navigationMode.value,
      ...additionalState
    };
    
    preservedState.value = currentState;
    
    // Add to history (keep last 5 states)
    stateHistory.value.unshift(currentState);
    if (stateHistory.value.length > 5) {
      stateHistory.value = stateHistory.value.slice(0, 5);
    }
    
    if (process.env.NODE_ENV === 'development') {
      //console.log('[BreakpointManager] State preserved:', currentState);
    }
    
    return currentState;
  };
  
  const restorePreservedState = () => {
    if (!preservedState.value.timestamp) return null;
    
    try {
      // Restore scroll position
      if (preservedState.value.scrollPosition) {
        window.scrollTo(0, preservedState.value.scrollPosition);
      }
      
      if (process.env.NODE_ENV === 'development') {
        //console.log('[BreakpointManager] State restored:', preservedState.value);
      }
      
      return preservedState.value;
    } catch (error) {
      console.error('[BreakpointManager] Error restoring state:', error);
      return null;
    }
  };
  
  // Smooth transition management
  const executeBreakpointTransition = async (fromMode, toMode) => {
    if (isTransitioning.value) {
      console.warn('[BreakpointManager] Transition already in progress, skipping');
      return;
    }
    
    isTransitioning.value = true;
    
    try {
      // Preserve current state before transition
      const preservedData = preserveCurrentState({
        fromMode,
        toMode,
        transitionReason: 'breakpoint_change'
      });
      
      // Log transition start
      if (process.env.NODE_ENV === 'development') {
        //console.log(`[BreakpointManager] Starting transition: ${fromMode} → ${toMode}`);
      }
      
      // Wait for next tick to ensure DOM updates
      await nextTick();
      
      // Add transition delay for smooth visual effect
      await new Promise(resolve => setTimeout(resolve, TRANSITION_DELAY));
      
      // Restore preserved state
      restorePreservedState();
      
      if (process.env.NODE_ENV === 'development') {
        //console.log(`[BreakpointManager] Transition completed: ${fromMode} → ${toMode}`);
      }
      
      return preservedData;
    } catch (error) {
      console.error('[BreakpointManager] Transition error:', error);
      throw error;
    } finally {
      isTransitioning.value = false;
    }
  };
  
  // Edge case handlers
  const handleDeviceRotation = () => {
    if (process.env.NODE_ENV === 'development') {
      //console.log('[BreakpointManager] Device rotation detected');
    }
    
    // Preserve state during rotation
    preserveCurrentState({ reason: 'device_rotation' });
    
    // Update dimensions after rotation completes
    setTimeout(() => {
      updateDimensions();
      restorePreservedState();
    }, 100);
  };
  
  const handleBrowserZoom = () => {
    if (process.env.NODE_ENV === 'development') {
      //console.log('[BreakpointManager] Browser zoom detected');
    }
    
    // Handle zoom-induced breakpoint changes
    preserveCurrentState({ reason: 'browser_zoom' });
    updateDimensions();
  };
  
  // Conflict detection and prevention
  const detectBreakpointConflicts = () => {
    if (typeof window === 'undefined') return false;
    
    const actualWidth = window.innerWidth;
    const reportedWidth = windowWidth.value;
    const widthDifference = Math.abs(actualWidth - reportedWidth);
    
    // If there's a significant difference, we have a conflict
    if (widthDifference > 10) {
      console.warn('[BreakpointManager] Breakpoint conflict detected:', {
        actual: actualWidth,
        reported: reportedWidth,
        difference: widthDifference
      });
      
      // Force update to resolve conflict
      updateDimensions();
      return true;
    }
    
    return false;
  };
  
  // Utility functions
  const isExactBreakpoint = (width = windowWidth.value) => {
    return Math.abs(width - NAVIGATION_BREAKPOINT) < 5;
  };
  
  const getBreakpointDistance = (width = windowWidth.value) => {
    return width - NAVIGATION_BREAKPOINT;
  };
  
  const getBreakpointInfo = () => {
    return {
      currentWidth: windowWidth.value,
      currentHeight: windowHeight.value,
      navigationBreakpoint: NAVIGATION_BREAKPOINT,
      navigationMode: navigationMode.value,
      isTransitioning: isTransitioning.value,
      orientation: orientation.value,
      isExactBreakpoint: isExactBreakpoint(),
      breakpointDistance: getBreakpointDistance(),
      hasChanged: hasBreakpointChanged.value,
      previousState: previousBreakpointState.value
    };
  };
  
  // Debug utilities
  const debugBreakpointManager = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📏 BreakpointManager Debug Info');
      //console.log('Breakpoint info:', getBreakpointInfo());
      //console.log('Preserved state:', preservedState.value);
      //console.log('State history:', stateHistory.value);
      //console.log('Conflict check:', detectBreakpointConflicts());
      console.groupEnd();
    }
  };
  
  // Watch for breakpoint changes and handle transitions
  watch(navigationMode, async (newMode, oldMode) => {
    if (oldMode && newMode !== oldMode) {
      try {
        await executeBreakpointTransition(oldMode, newMode);
      } catch (error) {
        console.error('[BreakpointManager] Failed to execute transition:', error);
      }
    }
  }, { immediate: false });
  
  // Lifecycle management
  onMounted(() => {
    // Initialize dimensions
    updateDimensions();
    
    if (typeof window !== 'undefined') {
      // Add event listeners
      window.addEventListener('resize', debouncedResize);
      window.addEventListener('resize', throttledResize);
      window.addEventListener('orientationchange', handleDeviceRotation);
      
      // Monitor for zoom changes
      let lastZoom = window.devicePixelRatio;
      const zoomCheckInterval = setInterval(() => {
        if (window.devicePixelRatio !== lastZoom) {
          lastZoom = window.devicePixelRatio;
          handleBrowserZoom();
        }
      }, 500);
      
      // Conflict detection in development
      let conflictCheckInterval;
      if (process.env.NODE_ENV === 'development') {
        conflictCheckInterval = setInterval(detectBreakpointConflicts, 2000);
      }
      
      // Cleanup on unmount
      onUnmounted(() => {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('resize', throttledResize);
        window.removeEventListener('orientationchange', handleDeviceRotation);
        clearInterval(zoomCheckInterval);
        if (conflictCheckInterval) {
          clearInterval(conflictCheckInterval);
        }
      });
    }
    
    // Log initialization
    if (process.env.NODE_ENV === 'development') {
      //console.log('[BreakpointManager] Initialized with mode:', navigationMode.value);
    }
  });
  
  return {
    // Core breakpoint state
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),
    navigationMode,
    isDesktopBreakpoint,
    isMobileBreakpoint,
    
    // Transition state
    isTransitioning: computed(() => isTransitioning.value),
    hasBreakpointChanged,
    
    // Device state
    orientation: computed(() => orientation.value),
    isLandscape,
    
    // State management
    preservedState: computed(() => preservedState.value),
    stateHistory: computed(() => stateHistory.value),
    preserveCurrentState,
    restorePreservedState,
    
    // Utility functions
    isExactBreakpoint,
    getBreakpointDistance,
    getBreakpointInfo,
    detectBreakpointConflicts,
    
    // Debug utilities
    debugBreakpointManager,
    
    // Constants
    NAVIGATION_BREAKPOINT,
    DEBOUNCE_DELAY,
    TRANSITION_DELAY
  };
}

export default useBreakpointManager;