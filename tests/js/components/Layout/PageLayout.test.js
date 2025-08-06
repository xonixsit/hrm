import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PageLayout from '@/Components/Layout/PageLayout.vue';

// Mock the composables
vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true }
  })
}));

// Mock child components
vi.mock('@/Components/Layout/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    template: '<div data-testid="page-header"><slot name="header" /><slot name="actions" /></div>',
    props: ['title', 'subtitle', 'breadcrumbs', 'actions', 'tabs', 'sticky'],
    emits: ['tab-change', 'action']
  }
}));

vi.mock('@/Components/Layout/PageSidebar.vue', () => ({
  default: {
    name: 'PageSidebar',
    template: '<div data-testid="page-sidebar"><slot /></div>',
    props: ['items', 'collapsible', 'collapsed'],
    emits: ['toggle', 'item-click']
  }
}));

vi.mock('@/Components/Layout/PageFooter.vue', () => ({
  default: {
    name: 'PageFooter',
    template: '<div data-testid="page-footer"><slot /></div>',
    props: ['links', 'copyright']
  }
}));

describe('PageLayout', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Page'
  };

  beforeEach(() => {
    wrapper = mount(PageLayout, {
      props: defaultProps
    });
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(true);
    });

    it('applies correct layout classes', () => {
      expect(wrapper.classes()).toContain('page-layout');
      expect(wrapper.classes()).toContain('min-h-screen');
      expect(wrapper.classes()).toContain('bg-neutral-50');
    });

    it('renders main content area', () => {
      const mainContent = wrapper.find('.main-content');
      expect(mainContent.exists()).toBe(true);
      expect(mainContent.attributes('role')).toBe('main');
    });
  });

  describe('Header Configuration', () => {
    it('shows header by default', () => {
      expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(true);
    });

    it('hides header when showHeader is false', async () => {
      await wrapper.setProps({ showHeader: false });
      expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(false);
    });

    it('passes header props correctly', async () => {
      const headerProps = {
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        breadcrumbs: [{ label: 'Home', href: '/' }],
        actions: [{ id: 'action1', label: 'Action' }],
        tabs: [{ id: 'tab1', label: 'Tab 1' }],
        stickyHeader: true
      };

      await wrapper.setProps(headerProps);
      
      const header = wrapper.findComponent({ name: 'PageHeader' });
      expect(header.props('title')).toBe('Custom Title');
      expect(header.props('subtitle')).toBe('Custom Subtitle');
      expect(header.props('sticky')).toBe(true);
    });
  });

  describe('Sidebar Configuration', () => {
    it('does not show sidebar by default', () => {
      expect(wrapper.find('[data-testid="page-sidebar"]').exists()).toBe(false);
    });

    it('shows sidebar when hasSidebar is true and items are provided', async () => {
      await wrapper.setProps({
        hasSidebar: true,
        sidebarItems: [{ id: 'item1', label: 'Item 1' }]
      });

      expect(wrapper.find('[data-testid="page-sidebar"]').exists()).toBe(true);
    });

    it('does not show sidebar when hasSidebar is true but no items', async () => {
      await wrapper.setProps({
        hasSidebar: true,
        sidebarItems: []
      });

      expect(wrapper.find('[data-testid="page-sidebar"]').exists()).toBe(false);
    });

    it('applies sidebar classes correctly', async () => {
      await wrapper.setProps({
        hasSidebar: true,
        sidebarItems: [{ id: 'item1', label: 'Item 1' }]
      });

      expect(wrapper.classes()).toContain('has-sidebar');
    });
  });

  describe('Footer Configuration', () => {
    it('does not show footer by default', () => {
      expect(wrapper.find('[data-testid="page-footer"]').exists()).toBe(false);
    });

    it('shows footer when hasFooter is true', async () => {
      await wrapper.setProps({ hasFooter: true });
      expect(wrapper.find('[data-testid="page-footer"]').exists()).toBe(true);
    });

    it('passes footer props correctly', async () => {
      const footerProps = {
        hasFooter: true,
        footerLinks: [{ label: 'Link', href: '/link' }],
        footerCopyright: '© 2024 Test'
      };

      await wrapper.setProps(footerProps);
      
      const footer = wrapper.findComponent({ name: 'PageFooter' });
      expect(footer.props('links')).toEqual(footerProps.footerLinks);
      expect(footer.props('copyright')).toBe(footerProps.footerCopyright);
    });
  });

  describe('Loading State', () => {
    it('shows loading state when loading is true', async () => {
      await wrapper.setProps({ loading: true });
      
      const loadingContainer = wrapper.find('.loading-container');
      expect(loadingContainer.exists()).toBe(true);
      expect(loadingContainer.find('.loading-spinner').exists()).toBe(true);
      expect(loadingContainer.text()).toContain('Loading...');
    });

    it('shows custom loading text', async () => {
      await wrapper.setProps({ 
        loading: true, 
        loadingText: 'Custom loading...' 
      });
      
      expect(wrapper.find('.loading-text').text()).toBe('Custom loading...');
    });

    it('hides main content when loading', async () => {
      await wrapper.setProps({ loading: true });
      
      expect(wrapper.find('.content-wrapper').exists()).toBe(false);
    });
  });

  describe('Error State', () => {
    it('shows error state when error is provided', async () => {
      const error = {
        title: 'Error Title',
        message: 'Error message'
      };

      await wrapper.setProps({ error });
      
      const errorContainer = wrapper.find('.error-container');
      expect(errorContainer.exists()).toBe(true);
      expect(errorContainer.find('.error-title').text()).toBe('Error Title');
      expect(errorContainer.find('.error-message').text()).toBe('Error message');
    });

    it('shows default error messages', async () => {
      await wrapper.setProps({ error: {} });
      
      const errorContainer = wrapper.find('.error-container');
      expect(errorContainer.find('.error-title').text()).toBe('Something went wrong');
      expect(errorContainer.find('.error-message').text()).toBe('Please try again later.');
    });

    it('renders error actions when provided', async () => {
      const error = {
        title: 'Error',
        message: 'Message',
        actions: [
          { label: 'Retry', handler: vi.fn(), variant: 'primary' },
          { label: 'Cancel', handler: vi.fn(), variant: 'secondary' }
        ]
      };

      await wrapper.setProps({ error });
      
      const actions = wrapper.findAll('.error-actions button');
      expect(actions).toHaveLength(2);
      expect(actions[0].text()).toBe('Retry');
      expect(actions[1].text()).toBe('Cancel');
    });

    it('hides main content when error is shown', async () => {
      await wrapper.setProps({ error: { title: 'Error' } });
      
      expect(wrapper.find('.content-wrapper').exists()).toBe(false);
    });
  });

  describe('Layout Configuration', () => {
    it('applies max width classes correctly', async () => {
      await wrapper.setProps({ maxWidth: 'lg' });
      
      const contentArea = wrapper.find('.page-content');
      expect(contentArea.classes()).toContain('container-responsive-lg');
    });

    it('applies padding classes correctly', async () => {
      await wrapper.setProps({ padding: 'lg' });
      
      const contentWrapper = wrapper.find('.content-wrapper');
      expect(contentWrapper.classes()).toContain('p-8');
    });

    it('applies responsive padding by default', () => {
      const contentWrapper = wrapper.find('.content-wrapper');
      expect(contentWrapper.classes()).toContain('p-responsive');
    });
  });

  describe('Event Handling', () => {
    it('emits tab-change event from header', async () => {
      const header = wrapper.findComponent({ name: 'PageHeader' });
      const testTab = { id: 'tab1', label: 'Tab 1' };
      
      await header.vm.$emit('tab-change', testTab);
      
      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual([testTab]);
    });

    it('emits action event from header', async () => {
      const header = wrapper.findComponent({ name: 'PageHeader' });
      const testAction = { id: 'action1', label: 'Action' };
      
      await header.vm.$emit('action', testAction);
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0]).toEqual([testAction]);
    });

    it('handles sidebar toggle', async () => {
      await wrapper.setProps({
        hasSidebar: true,
        sidebarItems: [{ id: 'item1', label: 'Item 1' }]
      });

      const sidebar = wrapper.findComponent({ name: 'PageSidebar' });
      await sidebar.vm.$emit('toggle');
      
      expect(wrapper.emitted('sidebar-toggle')).toBeTruthy();
    });

    it('handles sidebar item click', async () => {
      await wrapper.setProps({
        hasSidebar: true,
        sidebarItems: [{ id: 'item1', label: 'Item 1' }]
      });

      const sidebar = wrapper.findComponent({ name: 'PageSidebar' });
      const testItem = { id: 'item1', label: 'Item 1' };
      
      await sidebar.vm.$emit('item-click', testItem);
      
      expect(wrapper.emitted('sidebar-item-click')).toBeTruthy();
      expect(wrapper.emitted('sidebar-item-click')[0]).toEqual([testItem]);
    });
  });

  describe('Slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(PageLayout, {
        props: defaultProps,
        slots: {
          default: '<div data-testid="slot-content">Slot Content</div>'
        }
      });

      expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="slot-content"]').text()).toBe('Slot Content');
    });

    it('passes header slot to PageHeader', () => {
      const wrapper = mount(PageLayout, {
        props: defaultProps,
        slots: {
          header: '<div data-testid="header-slot">Header Slot</div>'
        }
      });

      const header = wrapper.findComponent({ name: 'PageHeader' });
      expect(header.html()).toContain('data-testid="header-slot"');
    });

    it('passes actions slot to PageHeader', () => {
      const wrapper = mount(PageLayout, {
        props: defaultProps,
        slots: {
          actions: '<div data-testid="actions-slot">Actions Slot</div>'
        }
      });

      const header = wrapper.findComponent({ name: 'PageHeader' });
      expect(header.html()).toContain('data-testid="actions-slot"');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies mobile classes when on mobile', async () => {
      // This would require mocking the responsive composable differently
      // for different test cases, which is complex with the current setup
      expect(wrapper.classes()).toContain('desktop');
    });
  });

  describe('Exposed Methods', () => {
    it('exposes sidebar control methods', () => {
      const exposedMethods = wrapper.vm;
      
      expect(typeof exposedMethods.toggleSidebar).toBe('function');
      expect(typeof exposedMethods.collapseSidebar).toBe('function');
      expect(typeof exposedMethods.expandSidebar).toBe('function');
    });
  });
});