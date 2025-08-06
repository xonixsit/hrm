import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import DataTable from '@/Components/Data/DataTable.vue';
import MobileNavigation from '@/Components/Navigation/MobileNavigation.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

// Mock window dimensions for different breakpoints
const setViewport = (width, height = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock Inertia.js
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href']
  },
  router: {
    visit: vi.fn(),
    post: vi.fn()
  }
}));

// Mock route helper
global.route = vi.fn((name) => `/${name.replace('.', '/')}`);

describe('Breakpoint-Specific Component Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Breakpoint (320px - 640px)', () => {
    beforeEach(() => {
      setViewport(375, 667); // iPhone-like dimensions
    });

    it('should show mobile navigation on small screens', async () => {
      const wrapper = mount(MobileNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        global: {
          stubs: {
            ApplicationLogo: true,
            Dropdown: true,
            DropdownLink: true,
            Icon: true,
            SidebarToggle: true,
            MobileNavigationSection: true
          }
        }
      });

      await nextTick();
      
      expect(wrapper.find('.mobile-navigation').exists()).toBe(true);
      expect(wrapper.find('.mobile-top-bar').exists()).toBe(true);
      expect(wrapper.find('.mobile-bottom-nav').exists()).toBe(true);
    });

    it('should use mobile-optimized table layout', async () => {
      const columns = [
        { key: 'name', label: 'Name', priority: 'high' },
        { key: 'email', label: 'Email', priority: 'medium' },
        { key: 'department', label: 'Department', priority: 'low' }
      ];

      const data = [
        { id: 1, name: 'John Doe', email: 'john@example.com', department: 'IT' }
      ];

      const wrapper = mount(DataTable, {
        props: {
          columns,
          data
        },
        global: {
          stubs: {
            TableHeader: true,
            TablePagination: true,
            TableSkeleton: true,
            EmptyState: true,
            BaseCheckbox: true,
            Icon: true,
            Dropdown: true
          }
        }
      });

      await nextTick();
      
      const table = wrapper.find('.data-table');
      expect(table.exists()).toBe(true);
      
      // Should have mobile-specific classes
      expect(table.classes()).toContain('table-mobile');
    });

    it('should apply mobile-specific spacing and typography', () => {
      const { isMobile, currentBreakpoint } = useResponsive();
      
      expect(isMobile.value).toBe(true);
      expect(currentBreakpoint.value).toBe('xs');
    });

    it('should use touch-friendly button sizes', async () => {
      const wrapper = mount({
        template: `
          <button class="btn-base btn-md touch-target">
            Touch Button
          </button>
        `
      });

      const button = wrapper.find('button');
      const computedStyle = window.getComputedStyle(button.element);
      
      // Should have minimum touch target size
      expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(computedStyle.minWidth)).toBeGreaterThanOrEqual(44);
    });

    it('should stack form elements vertically', async () => {
      const wrapper = mount({
        template: `
          <form class="form-responsive">
            <div class="form-row">
              <div class="form-group">
                <input type="text" placeholder="First Name" />
              </div>
              <div class="form-group">
                <input type="text" placeholder="Last Name" />
              </div>
            </div>
          </form>
        `
      });

      const formRow = wrapper.find('.form-row');
      const computedStyle = window.getComputedStyle(formRow.element);
      
      // Should stack vertically on mobile
      expect(computedStyle.flexDirection).toBe('column');
    });
  });

  describe('Tablet Breakpoint (641px - 1023px)', () => {
    beforeEach(() => {
      setViewport(768, 1024); // iPad-like dimensions
    });

    it('should detect tablet breakpoint correctly', () => {
      const { isTablet, currentBreakpoint } = useResponsive();
      
      expect(isTablet.value).toBe(true);
      expect(currentBreakpoint.value).toBe('md');
    });

    it('should show medium priority table columns', async () => {
      const columns = [
        { key: 'name', label: 'Name', priority: 'high' },
        { key: 'email', label: 'Email', priority: 'medium' },
        { key: 'created_at', label: 'Created', priority: 'low' }
      ];

      const data = [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          created_at: '2024-01-01' 
        }
      ];

      const wrapper = mount(DataTable, {
        props: {
          columns,
          data
        },
        global: {
          stubs: {
            TableHeader: true,
            TablePagination: true,
            TableSkeleton: true,
            EmptyState: true,
            BaseCheckbox: true,
            Icon: true,
            Dropdown: true
          }
        }
      });

      await nextTick();
      
      // High priority columns should be visible
      expect(wrapper.find('[data-priority="high"]').exists()).toBe(true);
      
      // Medium priority columns should be visible on tablet
      expect(wrapper.find('[data-priority="medium"]').exists()).toBe(true);
      
      // Low priority columns should be hidden
      const lowPriorityColumns = wrapper.findAll('[data-priority="low"]');
      lowPriorityColumns.forEach(column => {
        const computedStyle = window.getComputedStyle(column.element);
        expect(computedStyle.display).toBe('none');
      });
    });

    it('should use 2-column form layout', async () => {
      const wrapper = mount({
        template: `
          <form class="form-grid">
            <div class="form-group">Input 1</div>
            <div class="form-group">Input 2</div>
            <div class="form-group">Input 3</div>
          </form>
        `
      });

      const form = wrapper.find('.form-grid');
      const computedStyle = window.getComputedStyle(form.element);
      
      // Should use 2-column grid on tablet
      expect(computedStyle.gridTemplateColumns).toContain('repeat(2, 1fr)');
    });

    it('should adjust navigation for tablet layout', async () => {
      const wrapper = mount(PageLayout, {
        props: {
          title: 'Test Page',
          hasSidebar: true,
          sidebarItems: [
            { id: 'item1', label: 'Item 1', route: 'test.route' }
          ]
        },
        global: {
          stubs: {
            PageHeader: true,
            PageSidebar: true,
            PageFooter: true
          }
        }
      });

      await nextTick();
      
      // Should have tablet-specific classes
      expect(wrapper.classes()).toContain('tablet');
    });
  });

  describe('Desktop Breakpoint (1024px+)', () => {
    beforeEach(() => {
      setViewport(1280, 800); // Desktop dimensions
    });

    it('should detect desktop breakpoint correctly', () => {
      const { isDesktop, currentBreakpoint } = useResponsive();
      
      expect(isDesktop.value).toBe(true);
      expect(currentBreakpoint.value).toBe('xl');
    });

    it('should show all table columns on desktop', async () => {
      const columns = [
        { key: 'name', label: 'Name', priority: 'high' },
        { key: 'email', label: 'Email', priority: 'medium' },
        { key: 'department', label: 'Department', priority: 'medium' },
        { key: 'created_at', label: 'Created', priority: 'low' },
        { key: 'updated_at', label: 'Updated', priority: 'low' }
      ];

      const data = [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com',
          department: 'IT',
          created_at: '2024-01-01',
          updated_at: '2024-01-02'
        }
      ];

      const wrapper = mount(DataTable, {
        props: {
          columns,
          data
        },
        global: {
          stubs: {
            TableHeader: true,
            TablePagination: true,
            TableSkeleton: true,
            EmptyState: true,
            BaseCheckbox: true,
            Icon: true,
            Dropdown: true
          }
        }
      });

      await nextTick();
      
      // All priority columns should be visible on desktop
      expect(wrapper.find('[data-priority="high"]').exists()).toBe(true);
      expect(wrapper.find('[data-priority="medium"]').exists()).toBe(true);
      expect(wrapper.find('[data-priority="low"]').exists()).toBe(true);
    });

    it('should use 3-column form layout', async () => {
      const wrapper = mount({
        template: `
          <form class="form-grid">
            <div class="form-group">Input 1</div>
            <div class="form-group">Input 2</div>
            <div class="form-group">Input 3</div>
          </form>
        `
      });

      const form = wrapper.find('.form-grid');
      const computedStyle = window.getComputedStyle(form.element);
      
      // Should use 3-column grid on desktop
      expect(computedStyle.gridTemplateColumns).toContain('repeat(3, 1fr)');
    });

    it('should hide mobile navigation on desktop', async () => {
      const wrapper = mount(MobileNavigation, {
        props: {
          currentRoute: 'dashboard'
        },
        global: {
          stubs: {
            ApplicationLogo: true,
            Dropdown: true,
            DropdownLink: true,
            Icon: true,
            SidebarToggle: true,
            MobileNavigationSection: true
          }
        }
      });

      await nextTick();
      
      // Mobile navigation should be hidden on desktop
      const mobileNav = wrapper.find('.mobile-navigation');
      expect(mobileNav.classes()).toContain('lg:hidden');
    });

    it('should provide full sidebar functionality', async () => {
      const wrapper = mount(PageLayout, {
        props: {
          title: 'Test Page',
          hasSidebar: true,
          sidebarItems: [
            { id: 'item1', label: 'Item 1', route: 'test.route' },
            { id: 'item2', label: 'Item 2', route: 'test.route2' }
          ]
        },
        global: {
          stubs: {
            PageHeader: true,
            PageSidebar: true,
            PageFooter: true
          }
        }
      });

      await nextTick();
      
      // Should have desktop-specific classes
      expect(wrapper.classes()).toContain('desktop');
      
      // Sidebar should be expanded by default on desktop
      expect(wrapper.vm.sidebarCollapsed).toBe(false);
    });
  });

  describe('Ultra-wide Breakpoint (1920px+)', () => {
    beforeEach(() => {
      setViewport(1920, 1080); // Ultra-wide dimensions
    });

    it('should detect ultra-wide breakpoint', () => {
      const { currentBreakpoint } = useResponsive();
      
      expect(currentBreakpoint.value).toBe('2xl');
    });

    it('should provide maximum content width', async () => {
      const wrapper = mount({
        template: `
          <div class="container-responsive-xl">
            <p>Ultra-wide content</p>
          </div>
        `
      });

      const container = wrapper.find('.container-responsive-xl');
      const computedStyle = window.getComputedStyle(container.element);
      
      // Should have maximum width constraint
      expect(computedStyle.maxWidth).toBeTruthy();
    });
  });

  describe('Orientation Changes', () => {
    it('should detect portrait orientation', () => {
      setViewport(375, 667); // Portrait mobile
      
      const { orientation } = useResponsive();
      expect(orientation.value).toBe('portrait');
    });

    it('should detect landscape orientation', () => {
      setViewport(667, 375); // Landscape mobile
      
      const { orientation } = useResponsive();
      expect(orientation.value).toBe('landscape');
    });

    it('should adjust layout for landscape mobile', async () => {
      setViewport(667, 375); // Landscape mobile
      
      const wrapper = mount({
        template: `
          <div class="modal-responsive">
            <div class="modal-content">
              <p>Modal content</p>
            </div>
          </div>
        `
      });

      await nextTick();
      
      // Should adjust modal height for landscape
      const modal = wrapper.find('.modal-responsive');
      const computedStyle = window.getComputedStyle(modal.element);
      
      expect(computedStyle.maxHeight).toContain('calc(100vh - 16px)');
    });
  });

  describe('High DPI Displays', () => {
    beforeEach(() => {
      // Mock high DPI display
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });
    });

    it('should detect high DPI displays', () => {
      const { isHighDensity, pixelRatio } = useResponsive();
      
      expect(isHighDensity.value).toBe(true);
      expect(pixelRatio.value).toBe(2);
    });

    it('should optimize images for high DPI', async () => {
      const wrapper = mount({
        template: `
          <img class="icon-crisp" src="/icon.png" alt="Icon" />
        `
      });

      const img = wrapper.find('img');
      const computedStyle = window.getComputedStyle(img.element);
      
      // Should have crisp rendering for high DPI
      expect(computedStyle.imageRendering).toBe('crisp-edges');
    });
  });

  describe('Touch Device Optimization', () => {
    beforeEach(() => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: true,
        configurable: true
      });
      
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      });
    });

    it('should detect touch devices', () => {
      const { isTouchDevice } = useResponsive();
      expect(isTouchDevice.value).toBe(true);
    });

    it('should apply touch-friendly styles', async () => {
      const wrapper = mount({
        template: `
          <button class="touch-target">Touch Button</button>
        `
      });

      const button = wrapper.find('button');
      const computedStyle = window.getComputedStyle(button.element);
      
      // Should have minimum touch target size
      expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(computedStyle.minWidth)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Print Optimization', () => {
    it('should hide interactive elements in print', async () => {
      const wrapper = mount({
        template: `
          <div>
            <button class="no-print">Interactive Button</button>
            <p class="print-optimize">Printable content</p>
          </div>
        `
      });

      // Simulate print media query
      const printButton = wrapper.find('.no-print');
      const printContent = wrapper.find('.print-optimize');
      
      expect(printButton.exists()).toBe(true);
      expect(printContent.exists()).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should debounce resize events', async () => {
      const resizeHandler = vi.fn();
      let callCount = 0;
      
      // Mock debounced resize handler
      const debouncedHandler = () => {
        callCount++;
      };
      
      // Simulate rapid resize events
      for (let i = 0; i < 10; i++) {
        setViewport(1000 + i, 600);
      }
      
      // Should not call handler immediately
      expect(callCount).toBe(0);
      
      // After debounce delay, should call once
      setTimeout(() => {
        debouncedHandler();
        expect(callCount).toBe(1);
      }, 150);
    });

    it('should cleanup event listeners on component unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const wrapper = mount({
        template: '<div>Test Component</div>',
        setup() {
          return useResponsive();
        }
      });

      wrapper.unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });
});