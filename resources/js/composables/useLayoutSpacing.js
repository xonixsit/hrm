import { ref, computed, watch, nextTick } from 'vue';
import { useResponsive } from './useResponsive.js';
import { useBreakpointManager } from './useBreakpointManager.js';

/**
 * Layout Spacing Management Composable
 * 
 * Provides centralized management of layout spacing, content area margins,
 * and smooth transitions between desktop and mobile navigation modes.
 */

// Layout state
const currentLayoutType = ref('desktop');
const sidebarState = ref({
  isCollapsed: false,
  width: {
    expanded: 256,
    collapsed: 64
  }
});

const mobileState = ref({
  isDrawerOpen: false,
  headerHeight: 64,
  bottomNavHeight: 80
});

const transitionState = ref({
  isTransitioning: false,
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

export function useLayoutSpacing() {
  // Composables
  const { isMobile, isDesktop, windowWidth } = useResponsive();
  const { navigationMode, isTransitioning: breakpointTransitioning } = useBreakpointManager();

  // Layout type detection
  const layoutType = computed(() => {
    return currentLayoutType.value;
  });

  // Desktop layout spacing calculations
  const desktopSpacing = computed(() => {
    const baseSpacing = {
      marginLeft: sidebarState.value.isCollapsed 
        ? sidebarState.value.width.collapsed 
        : sidebarState.value.width.expanded,
      marginRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: '100vh'
    };

    return {
      ...baseSpacing,
      marginLeftPx: `${baseSpacing.marginLeft}px`,
      transition: `margin-left ${transitionState.value.duration}ms ${transitionState.value.easing}`
    };
  });

  // Mobile layout spacing calculations
  const mobileSpacing = computed(() => {
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-top').replace('px', '')) || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-bottom').replace('px', '')) || 0;

    const baseSpacing = {
      marginLeft: 0,
      marginRight: 0,
      paddingTop: mobileState.value.headerHeight + safeAreaTop,
      paddingBottom: mobileState.value.bottomNavHeight + safeAreaBottom,
      minHeight: `calc(100vh - ${mobileState.value.headerHeight + mobileState.value.bottomNavHeight}px)`
    };

    return {
      ...baseSpacing,
      paddingTopPx: `${baseSpacing.paddingTop}px`,
      paddingBottomPx: `${baseSpacing.paddingBottom}px`,
      transition: `all ${transitionState.value.duration}ms ${transitionState.value.easing}`
    };
  });

  // Current spacing based on layout type
  const currentSpacing = computed(() => {
    return layoutType.value === 'desktop' ? desktopSpacing.value : mobileSpacing.value;
  });

  // Main content area classes
  const mainContentClasses = computed(() => {
    const baseClasses = {
      'main-content-area': true,
      'gpu-accelerated': true
    };

    // Layout type classes
    baseClasses[`${layoutType.value}-layout`] = true;

    // Desktop-specific classes
    if (layoutType.value === 'desktop') {
      baseClasses['sidebar-collapsed'] = sidebarState.value.isCollapsed;
      baseClasses['sidebar-expanded'] = !sidebarState.value.isCollapsed;
    }

    // Mobile-specific classes
    if (layoutType.value === 'mobile') {
      baseClasses['drawer-open'] = mobileState.value.isDrawerOpen;
      baseClasses['drawer-closed'] = !mobileState.value.isDrawerOpen;
    }

    // Transition state classes
    if (transitionState.value.isTransitioning || breakpointTransitioning.value) {
      baseClasses['transitioning'] = true;
    } else {
      baseClasses['transition-complete'] = true;
    }

    return baseClasses;
  });

  // Content inner classes for overlay effects
  const contentInnerClasses = computed(() => {
    const classes = {
      'content-inner': true,
      'transition-all': true,
      'duration-300': true,
      'ease-out': true
    };

    // Mobile drawer overlay effects
    if (layoutType.value === 'mobile' && mobileState.value.isDrawerOpen) {
      classes['opacity-50'] = true;
      classes['pointer-events-none'] = true;
      classes['scale-95'] = true;
    }

    return classes;
  });

  // CSS custom properties for dynamic spacing
  const cssCustomProperties = computed(() => {
    const properties = {};

    if (layoutType.value === 'desktop') {
      properties['--sidebar-width'] = `${currentSpacing.value.marginLeft}px`;
      properties['--content-margin-left'] = currentSpacing.value.marginLeftPx;
    } else {
      properties['--mobile-header-height'] = `${mobileState.value.headerHeight}px`;
      properties['--mobile-bottom-nav-height'] = `${mobileState.value.bottomNavHeight}px`;
      properties['--content-padding-top'] = currentSpacing.value.paddingTopPx;
      properties['--content-padding-bottom'] = currentSpacing.value.paddingBottomPx;
    }

    properties['--layout-transition-duration'] = `${transitionState.value.duration}ms`;
    properties['--layout-transition-easing'] = transitionState.value.easing;

    return properties;
  });

  // Methods for updating layout state
  const updateSidebarState = (collapsed) => {
    if (sidebarState.value.isCollapsed !== collapsed) {
      sidebarState.value.isCollapsed = collapsed;
      
      // Trigger transition
      executeLayoutTransition('sidebar-toggle');
    }
  };

  const updateMobileDrawerState = (isOpen) => {
    if (mobileState.value.isDrawerOpen !== isOpen) {
      mobileState.value.isDrawerOpen = isOpen;
      
      // Prevent body scroll when drawer is open
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  };

  const updateLayoutType = (newType) => {
    if (currentLayoutType.value !== newType) {
      const oldType = currentLayoutType.value;
      currentLayoutType.value = newType;
      
      // Execute layout transition
      executeLayoutTransition('layout-type-change', { from: oldType, to: newType });
    }
  };

  // Layout transition management
  const executeLayoutTransition = async (reason, metadata = {}) => {
    if (transitionState.value.isTransitioning) {
      console.warn('[useLayoutSpacing] Transition already in progress, skipping');
      return;
    }

    transitionState.value.isTransitioning = true;

    try {
      // Log transition start
      if (process.env.NODE_ENV === 'development') {
        //console.log(`[useLayoutSpacing] Starting layout transition: ${reason}`, metadata);
      }

      // Wait for next tick to ensure DOM updates
      await nextTick();

      // Apply CSS custom properties
      const rootElement = document.documentElement;
      Object.entries(cssCustomProperties.value).forEach(([property, value]) => {
        rootElement.style.setProperty(property, value);
      });

      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, transitionState.value.duration));

      if (process.env.NODE_ENV === 'development') {
        //console.log(`[useLayoutSpacing] Layout transition completed: ${reason}`);
      }
    } catch (error) {
      console.error('[useLayoutSpacing] Layout transition error:', error);
    } finally {
      transitionState.value.isTransitioning = false;
    }
  };

  // Responsive layout adjustments
  const adjustForScreenSize = () => {
    const width = windowWidth.value;
    
    // Adjust sidebar width for large screens
    if (width >= 1440) {
      sidebarState.value.width.expanded = 280;
    } else if (width >= 1920) {
      sidebarState.value.width.expanded = 320;
    } else {
      sidebarState.value.width.expanded = 256;
    }

    // Adjust mobile spacing for small screens
    if (width <= 375) {
      mobileState.value.headerHeight = 56;
      mobileState.value.bottomNavHeight = 72;
    } else if (width <= 640) {
      mobileState.value.headerHeight = 64;
      mobileState.value.bottomNavHeight = 80;
    } else {
      mobileState.value.headerHeight = 68;
      mobileState.value.bottomNavHeight = 84;
    }
  };

  // Content area measurements
  const getContentAreaDimensions = () => {
    const spacing = currentSpacing.value;
    const viewportWidth = windowWidth.value;
    const viewportHeight = window.innerHeight;

    let contentWidth, contentHeight;

    if (layoutType.value === 'desktop') {
      contentWidth = viewportWidth - spacing.marginLeft;
      contentHeight = viewportHeight;
    } else {
      contentWidth = viewportWidth;
      contentHeight = viewportHeight - spacing.paddingTop - spacing.paddingBottom;
    }

    return {
      width: contentWidth,
      height: contentHeight,
      availableWidth: Math.max(contentWidth, 320), // Minimum width
      availableHeight: Math.max(contentHeight, 200) // Minimum height
    };
  };

  // Layout conflict detection
  const detectLayoutConflicts = () => {
    const conflicts = [];

    // Check for overlapping navigation elements
    const desktopNav = document.querySelector('[data-navigation-type="desktop"]');
    const mobileNav = document.querySelector('[data-navigation-type="mobile"]');

    if (desktopNav && mobileNav) {
      const desktopVisible = window.getComputedStyle(desktopNav).display !== 'none';
      const mobileVisible = window.getComputedStyle(mobileNav).display !== 'none';

      if (desktopVisible && mobileVisible) {
        conflicts.push('Both desktop and mobile navigation are visible');
      }
    }

    // Check for incorrect spacing
    const mainContent = document.querySelector('.main-content-area');
    if (mainContent) {
      const computedStyle = window.getComputedStyle(mainContent);
      const marginLeft = parseInt(computedStyle.marginLeft);
      const expectedMargin = currentSpacing.value.marginLeft;

      if (Math.abs(marginLeft - expectedMargin) > 5) {
        conflicts.push(`Content margin mismatch: expected ${expectedMargin}px, got ${marginLeft}px`);
      }
    }

    return conflicts;
  };

  // Watch for layout type changes
  watch(layoutType, (newType, oldType) => {
    if (newType !== oldType) {
      updateLayoutType(newType);
    }
  }, { immediate: true });

  // Watch for window size changes
  watch(windowWidth, () => {
    adjustForScreenSize();
  }, { immediate: true });

  // Debug utilities
  const debugLayoutSpacing = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📐 Layout Spacing Debug Info');
      //console.log('Current layout type:', layoutType.value);
      //console.log('Current spacing:', currentSpacing.value);
      //console.log('Sidebar state:', sidebarState.value);
      //console.log('Mobile state:', mobileState.value);
      //console.log('Transition state:', transitionState.value);
      //console.log('Content dimensions:', getContentAreaDimensions());
      //console.log('CSS custom properties:', cssCustomProperties.value);
      //console.log('Layout conflicts:', detectLayoutConflicts());
      console.groupEnd();
    }
  };

  return {
    // State
    layoutType: computed(() => layoutType.value),
    currentSpacing,
    sidebarState: computed(() => sidebarState.value),
    mobileState: computed(() => mobileState.value),
    isTransitioning: computed(() => transitionState.value.isTransitioning),

    // Classes
    mainContentClasses,
    contentInnerClasses,

    // CSS Properties
    cssCustomProperties,

    // Methods
    updateSidebarState,
    updateMobileDrawerState,
    updateLayoutType,
    executeLayoutTransition,
    getContentAreaDimensions,
    detectLayoutConflicts,
    debugLayoutSpacing,

    // Utilities
    adjustForScreenSize
  };
}

export default useLayoutSpacing;