import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useLayoutSpacing } from '@/composables/useLayoutSpacing.js';

// Mock the responsive composables
vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isDesktop: { value: true },
    windowWidth: { value: 1024 }
  })
}));

vi.mock('@/composables/useBreakpointManager', () => ({
  useBreakpointManager: () => ({
    navigationMode: { value: 'desktop' },
    isTransitioning: { value: false }
  })
}));

describe('useLayoutSpacing', () => {
  let layoutSpacing;

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock document.documentElement.style
    const mockStyle = {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(() => '0px'),
    };
    Object.defineProperty(document.documentElement, 'style', {
      value: mockStyle,
      writable: true,
    });

    // Mock getComputedStyle
    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: vi.fn(() => '0px')
    }));

    layoutSpacing = useLayoutSpacing();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  describe('Layout Type Detection', () => {
    it('should default to desktop layout', () => {
      expect(layoutSpacing.layoutType.value).toBe('desktop');
    });

    it('should update layout type when changed', async () => {
      layoutSpacing.updateLayoutType('mobile');
      await nextTick();
      
      expect(layoutSpacing.layoutType.value).toBe('mobile');
    });
  });

  describe('Desktop Layout Spacing', () => {
    beforeEach(() => {
      layoutSpacing.updateLayoutType('desktop');
    });

    it('should calculate correct spacing for expanded sidebar', () => {
      layoutSpacing.updateSidebarState(false); // expanded
      
      const spacing = layoutSpacing.currentSpacing.value;
      expect(spacing.marginLeft).toBe(256); // Default expanded width
      expect(spacing.paddingTop).toBe(0);
      expect(spacing.paddingBottom).toBe(0);
    });

    it('should calculate correct spacing for collapsed sidebar', () => {
      layoutSpacing.updateSidebarState(true); // collapsed
      
      const spacing = layoutSpacing.currentSpacing.value;
      expect(spacing.marginLeft).toBe(64); // Default collapsed width
    });

    it('should generate correct CSS properties for desktop', () => {
      const properties = layoutSpacing.cssCustomProperties.value;
      
      expect(properties['--sidebar-width']).toBeDefined();
      expect(properties['--content-margin-left']).toBeDefined();
      expect(properties['--layout-transition-duration']).toBe('300ms');
    });

    it('should apply correct main content classes for desktop', () => {
      const classes = layoutSpacing.mainContentClasses.value;
      
      expect(classes['main-content-area']).toBe(true);
      expect(classes['desktop-layout']).toBe(true);
      expect(classes['gpu-accelerated']).toBe(true);
    });

    it('should handle sidebar state transitions', async () => {
      // Start expanded
      layoutSpacing.updateSidebarState(false);
      expect(layoutSpacing.sidebarState.value.isCollapsed).toBe(false);
      
      // Collapse
      layoutSpacing.updateSidebarState(true);
      expect(layoutSpacing.sidebarState.value.isCollapsed).toBe(true);
      
      const classes = layoutSpacing.mainContentClasses.value;
      expect(classes['sidebar-collapsed']).toBe(true);
      expect(classes['sidebar-expanded']).toBe(false);
    });
  });

  describe('Mobile Layout Spacing', () => {
    beforeEach(() => {
      layoutSpacing.updateLayoutType('mobile');
    });

    it('should calculate correct spacing for mobile', () => {
      const spacing = layoutSpacing.currentSpacing.value;
      
      expect(spacing.marginLeft).toBe(0);
      expect(spacing.paddingTop).toBeGreaterThan(0); // Header height + safe area
      expect(spacing.paddingBottom).toBeGreaterThan(0); // Bottom nav + safe area
    });

    it('should generate correct CSS properties for mobile', () => {
      const properties = layoutSpacing.cssCustomProperties.value;
      
      expect(properties['--mobile-header-height']).toBeDefined();
      expect(properties['--mobile-bottom-nav-height']).toBeDefined();
      expect(properties['--content-padding-top']).toBeDefined();
      expect(properties['--content-padding-bottom']).toBeDefined();
    });

    it('should apply correct main content classes for mobile', () => {
      const classes = layoutSpacing.mainContentClasses.value;
      
      expect(classes['main-content-area']).toBe(true);
      expect(classes['mobile-layout']).toBe(true);
      expect(classes['desktop-layout']).toBe(false);
    });

    it('should handle mobile drawer state', () => {
      // Open drawer
      layoutSpacing.updateMobileDrawerState(true);
      expect(layoutSpacing.mobileState.value.isDrawerOpen).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
      
      const classes = layoutSpacing.mainContentClasses.value;
      expect(classes['drawer-open']).toBe(true);
      
      // Close drawer
      layoutSpacing.updateMobileDrawerState(false);
      expect(layoutSpacing.mobileState.value.isDrawerOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
      
      const updatedClasses = layoutSpacing.mainContentClasses.value;
      expect(updatedClasses['drawer-closed']).toBe(true);
    });

    it('should apply overlay effects when drawer is open', () => {
      layoutSpacing.updateMobileDrawerState(true);
      
      const contentClasses = layoutSpacing.contentInnerClasses.value;
      expect(contentClasses['opacity-50']).toBe(true);
      expect(contentClasses['pointer-events-none']).toBe(true);
      expect(contentClasses['scale-95']).toBe(true);
    });
  });

  describe('Layout Transitions', () => {
    it('should handle layout transitions', async () => {
      const transitionPromise = layoutSpacing.executeLayoutTransition('test-transition');
      
      expect(layoutSpacing.isTransitioning.value).toBe(true);
      
      await transitionPromise;
      
      expect(layoutSpacing.isTransitioning.value).toBe(false);
    });

    it('should apply transition classes during transitions', async () => {
      const transitionPromise = layoutSpacing.executeLayoutTransition('test-transition');
      
      const classes = layoutSpacing.mainContentClasses.value;
      expect(classes['transitioning']).toBe(true);
      
      await transitionPromise;
      
      const updatedClasses = layoutSpacing.mainContentClasses.value;
      expect(updatedClasses['transition-complete']).toBe(true);
    });

    it('should prevent multiple simultaneous transitions', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Start first transition
      const transition1 = layoutSpacing.executeLayoutTransition('transition-1');
      
      // Try to start second transition
      const transition2 = layoutSpacing.executeLayoutTransition('transition-2');
      
      await Promise.all([transition1, transition2]);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useLayoutSpacing] Transition already in progress, skipping'
      );
      
      consoleSpy.mockRestore();
    });

    it('should update CSS custom properties during transitions', async () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');
      
      await layoutSpacing.executeLayoutTransition('test-transition');
      
      expect(setPropertySpy).toHaveBeenCalled();
    });
  });

  describe('Content Area Measurements', () => {
    it('should calculate correct dimensions for desktop', () => {
      layoutSpacing.updateLayoutType('desktop');
      layoutSpacing.updateSidebarState(false); // expanded
      
      const dimensions = layoutSpacing.getContentAreaDimensions();
      
      expect(dimensions.width).toBe(1024 - 256); // viewport - sidebar
      expect(dimensions.height).toBe(768);
      expect(dimensions.availableWidth).toBeGreaterThanOrEqual(320);
      expect(dimensions.availableHeight).toBeGreaterThanOrEqual(200);
    });

    it('should calculate correct dimensions for mobile', () => {
      layoutSpacing.updateLayoutType('mobile');
      
      const dimensions = layoutSpacing.getContentAreaDimensions();
      
      expect(dimensions.width).toBe(1024); // Full viewport width
      expect(dimensions.height).toBeLessThan(768); // Reduced by header/footer
      expect(dimensions.availableWidth).toBe(1024);
    });

    it('should enforce minimum dimensions', () => {
      // Mock very small viewport
      Object.defineProperty(window, 'innerWidth', { value: 200 });
      Object.defineProperty(window, 'innerHeight', { value: 100 });
      
      const dimensions = layoutSpacing.getContentAreaDimensions();
      
      expect(dimensions.availableWidth).toBeGreaterThanOrEqual(320);
      expect(dimensions.availableHeight).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Responsive Adjustments', () => {
    it('should adjust sidebar width for large screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1440 });
      
      layoutSpacing.adjustForScreenSize();
      
      expect(layoutSpacing.sidebarState.value.width.expanded).toBe(280);
    });

    it('should adjust sidebar width for ultra-wide screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920 });
      
      layoutSpacing.adjustForScreenSize();
      
      expect(layoutSpacing.sidebarState.value.width.expanded).toBe(320);
    });

    it('should adjust mobile spacing for small screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      layoutSpacing.adjustForScreenSize();
      
      expect(layoutSpacing.mobileState.value.headerHeight).toBe(56);
      expect(layoutSpacing.mobileState.value.bottomNavHeight).toBe(72);
    });

    it('should adjust mobile spacing for medium screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 640 });
      
      layoutSpacing.adjustForScreenSize();
      
      expect(layoutSpacing.mobileState.value.headerHeight).toBe(68);
      expect(layoutSpacing.mobileState.value.bottomNavHeight).toBe(84);
    });
  });

  describe('Layout Conflict Detection', () => {
    beforeEach(() => {
      // Clean up any existing elements
      document.querySelectorAll('[data-navigation-type]').forEach(el => el.remove());
      document.querySelectorAll('.main-content-area').forEach(el => el.remove());
    });

    it('should detect no conflicts when only one navigation is visible', () => {
      const desktopNav = document.createElement('div');
      desktopNav.setAttribute('data-navigation-type', 'desktop');
      desktopNav.style.display = 'block';
      document.body.appendChild(desktopNav);
      
      const conflicts = layoutSpacing.detectLayoutConflicts();
      expect(conflicts).toHaveLength(0);
      
      document.body.removeChild(desktopNav);
    });

    it('should detect conflicts when both navigations are visible', () => {
      const desktopNav = document.createElement('div');
      desktopNav.setAttribute('data-navigation-type', 'desktop');
      desktopNav.style.display = 'block';
      document.body.appendChild(desktopNav);
      
      const mobileNav = document.createElement('div');
      mobileNav.setAttribute('data-navigation-type', 'mobile');
      mobileNav.style.display = 'block';
      document.body.appendChild(mobileNav);
      
      const conflicts = layoutSpacing.detectLayoutConflicts();
      expect(conflicts).toContain('Both desktop and mobile navigation are visible');
      
      document.body.removeChild(desktopNav);
      document.body.removeChild(mobileNav);
    });

    it('should detect content margin mismatches', () => {
      const mainContent = document.createElement('div');
      mainContent.className = 'main-content-area';
      mainContent.style.marginLeft = '100px'; // Wrong margin
      document.body.appendChild(mainContent);
      
      // Mock getComputedStyle to return the wrong margin
      global.getComputedStyle = vi.fn(() => ({
        marginLeft: '100px'
      }));
      
      layoutSpacing.updateLayoutType('desktop');
      layoutSpacing.updateSidebarState(false); // Should be 256px
      
      const conflicts = layoutSpacing.detectLayoutConflicts();
      expect(conflicts.some(conflict => 
        conflict.includes('Content margin mismatch')
      )).toBe(true);
      
      document.body.removeChild(mainContent);
    });
  });

  describe('Debug Utilities', () => {
    it('should provide debug information in development', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      layoutSpacing.debugLayoutSpacing();
      
      expect(consoleSpy).toHaveBeenCalledWith('📐 Layout Spacing Debug Info');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it('should not log debug info in production', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      layoutSpacing.debugLayoutSpacing();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle transition errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock an error during transition
      const originalSetProperty = document.documentElement.style.setProperty;
      document.documentElement.style.setProperty = vi.fn(() => {
        throw new Error('CSS property error');
      });
      
      await layoutSpacing.executeLayoutTransition('error-test');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[useLayoutSpacing] Layout transition error:',
        expect.any(Error)
      );
      
      // Should still complete the transition
      expect(layoutSpacing.isTransitioning.value).toBe(false);
      
      // Restore
      document.documentElement.style.setProperty = originalSetProperty;
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing DOM elements gracefully', () => {
      // Remove all navigation elements
      document.querySelectorAll('[data-navigation-type]').forEach(el => el.remove());
      document.querySelectorAll('.main-content-area').forEach(el => el.remove());
      
      // Should not throw errors
      expect(() => {
        layoutSpacing.detectLayoutConflicts();
      }).not.toThrow();
    });
  });
});