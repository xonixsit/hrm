import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PageHeader from '@/Components/Layout/PageHeader.vue';

// Mock the composables
vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true }
  })
}));

// Mock child components
vi.mock('@/Components/Layout/BreadcrumbNavigation.vue', () => ({
  default: {
    name: 'BreadcrumbNavigation',
    template: '<nav data-testid="breadcrumb-nav"><slot /></nav>',
    props: ['items', 'maxItems', 'showHomeIcon'],
    emits: ['click']
  }
}));

vi.mock('@/Components/Layout/TabNavigation.vue', () => ({
  default: {
    name: 'TabNavigation',
    template: '<div data-testid="tab-nav"><slot /></div>',
    props: ['items', 'activeTab', 'variant', 'size'],
    emits: ['tab-change', 'tab-close']
  }
}));

describe('PageHeader', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Page Title'
  };

  beforeEach(() => {
    wrapper = mount(PageHeader, {
      props: defaultProps
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('header').exists()).toBe(true);
      expect(wrapper.find('.page-title').text()).toBe('Test Page Title');
    });

    it('applies correct header classes', () => {
      const header = wrapper.find('header');
      expect(header.classes()).toContain('page-header');
    });

    it('renders semantic HTML structure', () => {
      const header = wrapper.find('header');
      expect(header.element.tagName).toBe('HEADER');
      
      const title = wrapper.find('.page-title');
      expect(title.element.tagName).toBe('H1');
    });
  });

  describe('Title and Subtitle', () => {
    it('displays title correctly', () => {
      expect(wrapper.find('.page-title').text()).toBe('Test Page Title');
    });

    it('displays subtitle when provided', async () => {
      await wrapper.setProps({ subtitle: 'Test Subtitle' });
      
      const subtitle = wrapper.find('.page-subtitle');
      expect(subtitle.exists()).toBe(true);
      expect(subtitle.text()).toBe('Test Subtitle');
    });

    it('does not render subtitle when not provided', () => {
      expect(wrapper.find('.page-subtitle').exists()).toBe(false);
    });

    it('applies correct title styling classes', () => {
      const title = wrapper.find('.page-title');
      expect(title.classes()).toContain('text-2xl');
      expect(title.classes()).toContain('font-bold');
      expect(title.classes()).toContain('text-neutral-900');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('does not show breadcrumbs by default', () => {
      expect(wrapper.find('[data-testid="breadcrumb-nav"]').exists()).toBe(false);
    });

    it('shows breadcrumbs when provided', async () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Users', href: '/users' },
        { label: 'Profile', current: true }
      ];

      await wrapper.setProps({ breadcrumbs });
      
      expect(wrapper.find('[data-testid="breadcrumb-nav"]').exists()).toBe(true);
      
      const breadcrumbComponent = wrapper.findComponent({ name: 'BreadcrumbNavigation' });
      expect(breadcrumbComponent.props('items')).toEqual(breadcrumbs);
    });

    it('does not show breadcrumbs for empty array', async () => {
      await wrapper.setProps({ breadcrumbs: [] });
      expect(wrapper.find('[data-testid="breadcrumb-nav"]').exists()).toBe(false);
    });
  });

  describe('Action Buttons', () => {
    it('does not show actions by default', () => {
      expect(wrapper.find('.header-actions').exists()).toBe(false);
    });

    it('shows actions when provided', async () => {
      const actions = [
        { id: 'edit', label: 'Edit', variant: 'primary' },
        { id: 'delete', label: 'Delete', variant: 'danger' }
      ];

      await wrapper.setProps({ actions });
      
      expect(wrapper.find('.header-actions').exists()).toBe(true);
      expect(wrapper.findAll('.action-button')).toHaveLength(2);
    });

    it('handles action clicks', async () => {
      const mockHandler = vi.fn();
      const actions = [
        { id: 'test', label: 'Test', handler: mockHandler }
      ];

      await wrapper.setProps({ actions });
      
      const actionButton = wrapper.find('.action-button');
      await actionButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0]);
    });

    it('applies correct action button classes', async () => {
      const actions = [
        { id: 'primary', label: 'Primary', variant: 'primary' },
        { id: 'secondary', label: 'Secondary', variant: 'secondary' },
        { id: 'danger', label: 'Danger', variant: 'danger' }
      ];

      await wrapper.setProps({ actions });
      
      const buttons = wrapper.findAll('.action-button');
      expect(buttons[0].classes()).toContain('bg-primary-600');
      expect(buttons[1].classes()).toContain('bg-white');
      expect(buttons[2].classes()).toContain('bg-error-600');
    });

    it('handles disabled actions', async () => {
      const actions = [
        { id: 'disabled', label: 'Disabled', disabled: true }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.action-button');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.classes()).toContain('opacity-50');
      expect(button.classes()).toContain('cursor-not-allowed');
    });

    it('shows overflow menu for many actions', async () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i + 1}`
      }));

      await wrapper.setProps({ actions, maxVisibleActions: 2 });
      
      expect(wrapper.findAll('.action-button')).toHaveLength(2);
      expect(wrapper.find('.overflow-menu').exists()).toBe(true);
    });
  });

  describe('Tab Navigation', () => {
    it('does not show tabs by default', () => {
      expect(wrapper.find('[data-testid="tab-nav"]').exists()).toBe(false);
    });

    it('shows tabs when provided', async () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];

      await wrapper.setProps({ tabs });
      
      expect(wrapper.find('[data-testid="tab-nav"]').exists()).toBe(true);
      
      const tabComponent = wrapper.findComponent({ name: 'TabNavigation' });
      expect(tabComponent.props('items')).toEqual(tabs);
    });

    it('passes active tab correctly', async () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];

      await wrapper.setProps({ tabs, activeTab: 'tab2' });
      
      const tabComponent = wrapper.findComponent({ name: 'TabNavigation' });
      expect(tabComponent.props('activeTab')).toBe('tab2');
    });

    it('emits tab-change event', async () => {
      const tabs = [{ id: 'tab1', label: 'Tab 1' }];
      await wrapper.setProps({ tabs });
      
      const tabComponent = wrapper.findComponent({ name: 'TabNavigation' });
      const testTab = { id: 'tab1', label: 'Tab 1' };
      
      await tabComponent.vm.$emit('tab-change', testTab);
      
      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual([testTab]);
    });
  });

  describe('Sticky Header', () => {
    it('applies sticky classes when sticky is true', async () => {
      await wrapper.setProps({ sticky: true });
      
      const header = wrapper.find('header');
      expect(header.classes()).toContain('sticky');
      expect(header.classes()).toContain('top-0');
      expect(header.classes()).toContain('z-sticky');
      expect(header.classes()).toContain('shadow-sm');
    });

    it('does not apply sticky classes by default', () => {
      const header = wrapper.find('header');
      expect(header.classes()).not.toContain('sticky');
    });
  });

  describe('Background Variants', () => {
    it('applies white background by default', () => {
      const header = wrapper.find('header');
      expect(header.classes()).toContain('bg-white');
    });

    it('applies neutral background when specified', async () => {
      await wrapper.setProps({ background: 'neutral' });
      
      const header = wrapper.find('header');
      expect(header.classes()).toContain('bg-neutral-50');
    });

    it('applies transparent background when specified', async () => {
      await wrapper.setProps({ background: 'transparent' });
      
      const header = wrapper.find('header');
      expect(header.classes()).toContain('bg-transparent');
    });
  });

  describe('Border Configuration', () => {
    it('shows border by default', () => {
      const header = wrapper.find('header');
      expect(header.classes()).toContain('border-b');
      expect(header.classes()).toContain('border-neutral-200');
    });

    it('hides border when border is false', async () => {
      await wrapper.setProps({ border: false });
      
      const header = wrapper.find('header');
      expect(header.classes()).not.toContain('border-b');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive padding classes', () => {
      const header = wrapper.find('header');
      expect(header.classes()).toContain('px-responsive');
    });

    it('handles mobile layout adjustments', async () => {
      // Mock mobile responsive state
      vi.mocked(vi.importActual('@/composables/useResponsive')).useResponsive = () => ({
        isMobile: { value: true },
        isTablet: { value: false },
        isDesktop: { value: false }
      });

      const actions = Array.from({ length: 3 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i + 1}`
      }));

      await wrapper.setProps({ actions });
      
      // On mobile, should show fewer visible actions
      expect(wrapper.vm.visibleActions).toHaveLength(1);
    });
  });

  describe('Custom Slots', () => {
    it('renders custom header slot', () => {
      const wrapper = mount(PageHeader, {
        props: defaultProps,
        slots: {
          header: '<div data-testid="custom-header">Custom Header</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-header"]').exists()).toBe(true);
      expect(wrapper.find('.default-header').exists()).toBe(false);
    });

    it('renders custom actions slot', () => {
      const wrapper = mount(PageHeader, {
        props: defaultProps,
        slots: {
          actions: '<div data-testid="custom-actions">Custom Actions</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-actions"]').exists()).toBe(true);
    });

    it('falls back to default header when no custom slot', () => {
      expect(wrapper.find('.default-header').exists()).toBe(true);
      expect(wrapper.find('.custom-header').exists()).toBe(false);
    });
  });

  describe('Overflow Menu', () => {
    beforeEach(async () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i + 1}`
      }));

      await wrapper.setProps({ actions, maxVisibleActions: 2 });
    });

    it('shows overflow button when there are overflow actions', () => {
      expect(wrapper.find('.overflow-button').exists()).toBe(true);
    });

    it('toggles overflow menu on button click', async () => {
      const overflowButton = wrapper.find('.overflow-button');
      
      expect(wrapper.find('.overflow-dropdown').exists()).toBe(false);
      
      await overflowButton.trigger('click');
      expect(wrapper.find('.overflow-dropdown').exists()).toBe(true);
      
      await overflowButton.trigger('click');
      expect(wrapper.find('.overflow-dropdown').exists()).toBe(false);
    });

    it('shows correct number of overflow actions', () => {
      // Should show 3 overflow actions (5 total - 2 visible)
      expect(wrapper.vm.overflowActions).toHaveLength(3);
    });

    it('handles overflow action clicks', async () => {
      const overflowButton = wrapper.find('.overflow-button');
      await overflowButton.trigger('click');
      
      const overflowActions = wrapper.findAll('.overflow-action');
      await overflowActions[0].trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.vm.showOverflowMenu).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for overflow menu', async () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i + 1}`
      }));

      await wrapper.setProps({ actions, maxVisibleActions: 2 });
      
      const overflowButton = wrapper.find('.overflow-button');
      expect(overflowButton.attributes('aria-expanded')).toBe('false');
      expect(overflowButton.attributes('aria-haspopup')).toBe('true');
      
      await overflowButton.trigger('click');
      expect(overflowButton.attributes('aria-expanded')).toBe('true');
    });

    it('has proper heading hierarchy', () => {
      const title = wrapper.find('.page-title');
      expect(title.element.tagName).toBe('H1');
    });

    it('has proper semantic structure', () => {
      expect(wrapper.find('header').exists()).toBe(true);
      expect(wrapper.find('.header-main').exists()).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('handles action events correctly', async () => {
      const mockHandler = vi.fn();
      const actions = [
        { id: 'test', label: 'Test', handler: mockHandler }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.action-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(mockHandler).toHaveBeenCalled();
    });

    it('prevents disabled action clicks', async () => {
      const mockHandler = vi.fn();
      const actions = [
        { id: 'test', label: 'Test', handler: mockHandler, disabled: true }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.action-button');
      await button.trigger('click');
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('closes overflow menu on outside click', async () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `action${i}`,
        label: `Action ${i + 1}`
      }));

      await wrapper.setProps({ actions, maxVisibleActions: 2 });
      
      // Open overflow menu
      await wrapper.find('.overflow-button').trigger('click');
      expect(wrapper.vm.showOverflowMenu).toBe(true);
      
      // Simulate outside click
      const outsideClickEvent = new Event('click');
      document.dispatchEvent(outsideClickEvent);
      
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showOverflowMenu).toBe(false);
    });
  });
});