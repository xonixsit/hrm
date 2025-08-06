import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContentCard from '@/Components/Layout/ContentCard.vue';

describe('ContentCard', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Card'
  };

  beforeEach(() => {
    wrapper = mount(ContentCard, {
      props: defaultProps
    });
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.content-card').exists()).toBe(true);
      expect(wrapper.find('.card-title').text()).toBe('Test Card');
    });

    it('applies correct base classes', () => {
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card');
      expect(card.classes()).toContain('content-card--default');
      expect(card.classes()).toContain('content-card--md');
    });

    it('renders semantic HTML structure', () => {
      expect(wrapper.find('.content-card').exists()).toBe(true);
      expect(wrapper.find('header.card-header').exists()).toBe(true);
      expect(wrapper.find('.card-content').exists()).toBe(true);
    });
  });

  describe('Title and Subtitle', () => {
    it('displays title correctly', () => {
      expect(wrapper.find('.card-title').text()).toBe('Test Card');
    });

    it('displays subtitle when provided', async () => {
      await wrapper.setProps({ subtitle: 'Test subtitle' });
      
      const subtitle = wrapper.find('.card-subtitle');
      expect(subtitle.exists()).toBe(true);
      expect(subtitle.text()).toBe('Test subtitle');
    });

    it('does not render subtitle when not provided', () => {
      expect(wrapper.find('.card-subtitle').exists()).toBe(false);
    });

    it('applies correct title classes based on size', async () => {
      await wrapper.setProps({ size: 'lg' });
      
      const title = wrapper.find('.card-title');
      expect(title.exists()).toBe(true);
    });
  });

  describe('Variants', () => {
    it('applies default variant by default', () => {
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--default');
    });

    it('applies outlined variant when specified', async () => {
      await wrapper.setProps({ variant: 'outlined' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--outlined');
    });

    it('applies elevated variant when specified', async () => {
      await wrapper.setProps({ variant: 'elevated' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--elevated');
    });

    it('applies flat variant when specified', async () => {
      await wrapper.setProps({ variant: 'flat' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--flat');
    });
  });

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--md');
    });

    it('applies extra small size when specified', async () => {
      await wrapper.setProps({ size: 'xs' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--xs');
    });

    it('applies small size when specified', async () => {
      await wrapper.setProps({ size: 'sm' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--sm');
    });

    it('applies large size when specified', async () => {
      await wrapper.setProps({ size: 'lg' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--lg');
    });

    it('applies extra large size when specified', async () => {
      await wrapper.setProps({ size: 'xl' });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--xl');
    });
  });

  describe('Actions', () => {
    it('does not show actions by default', () => {
      expect(wrapper.find('.card-actions').exists()).toBe(false);
    });

    it('shows actions when provided', async () => {
      const actions = [
        { id: 'edit', label: 'Edit', variant: 'primary' },
        { id: 'delete', label: 'Delete', variant: 'danger' }
      ];

      await wrapper.setProps({ actions });
      
      expect(wrapper.find('.card-actions').exists()).toBe(true);
      expect(wrapper.findAll('.card-action-button')).toHaveLength(2);
    });

    it('handles action clicks', async () => {
      const mockHandler = vi.fn();
      const actions = [
        { id: 'test', label: 'Test', handler: mockHandler }
      ];

      await wrapper.setProps({ actions });
      
      const actionButton = wrapper.find('.card-action-button');
      await actionButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0]);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('applies correct action button classes', async () => {
      const actions = [
        { id: 'primary', label: 'Primary', variant: 'primary' },
        { id: 'secondary', label: 'Secondary', variant: 'secondary' },
        { id: 'danger', label: 'Danger', variant: 'danger' }
      ];

      await wrapper.setProps({ actions });
      
      const buttons = wrapper.findAll('.card-action-button');
      expect(buttons[0].classes()).toContain('bg-primary-600');
      expect(buttons[1].classes()).toContain('bg-white');
      expect(buttons[2].classes()).toContain('bg-error-600');
    });

    it('handles disabled actions', async () => {
      const actions = [
        { id: 'disabled', label: 'Disabled', disabled: true }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.card-action-button');
      expect(button.classes()).toContain('opacity-50');
      expect(button.classes()).toContain('cursor-not-allowed');
    });

    it('handles icon-only actions', async () => {
      const actions = [
        { id: 'icon', icon: 'EditIcon', iconOnly: true, variant: 'ghost' }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.card-action-button');
      expect(button.find('.action-icon').exists()).toBe(true);
      expect(button.find('.action-label').exists()).toBe(false);
    });
  });

  describe('Clickable Cards', () => {
    it('applies clickable classes when clickable is true', async () => {
      await wrapper.setProps({ clickable: true });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--clickable');
    });

    it('emits click event when card is clicked', async () => {
      await wrapper.setProps({ clickable: true });
      
      const card = wrapper.find('.content-card');
      await card.trigger('click');
      
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('does not emit click when disabled', async () => {
      await wrapper.setProps({ clickable: true, disabled: true });
      
      const card = wrapper.find('.content-card');
      await card.trigger('click');
      
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when clicking on actions', async () => {
      const actions = [{ id: 'test', label: 'Test' }];
      await wrapper.setProps({ clickable: true, actions });
      
      const actionButton = wrapper.find('.card-action-button');
      await actionButton.trigger('click');
      
      expect(wrapper.emitted('click')).toBeFalsy();
      expect(wrapper.emitted('action')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled classes when disabled', async () => {
      await wrapper.setProps({ disabled: true });
      
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--disabled');
    });

    it('disables actions when card is disabled', async () => {
      const actions = [{ id: 'test', label: 'Test' }];
      await wrapper.setProps({ disabled: true, actions });
      
      const button = wrapper.find('.card-action-button');
      expect(button.classes()).toContain('opacity-50');
      expect(button.classes()).toContain('cursor-not-allowed');
    });
  });

  describe('Slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          default: '<div data-testid="slot-content">Card Content</div>'
        }
      });

      expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="slot-content"]').text()).toBe('Card Content');
    });

    it('renders custom header slot', () => {
      const wrapper = mount(ContentCard, {
        props: { title: '' }, // Remove default title
        slots: {
          header: '<div data-testid="custom-header">Custom Header</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-header"]').exists()).toBe(true);
    });

    it('renders media slot when provided', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          media: '<div data-testid="media-content">Media Content</div>'
        }
      });

      expect(wrapper.find('.card-media').exists()).toBe(true);
      expect(wrapper.find('[data-testid="media-content"]').exists()).toBe(true);
    });

    it('renders footer slot when provided', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          footer: '<div data-testid="footer-content">Footer Content</div>'
        }
      });

      expect(wrapper.find('.card-footer').exists()).toBe(true);
      expect(wrapper.find('[data-testid="footer-content"]').exists()).toBe(true);
    });

    it('renders actions slot', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          actions: '<div data-testid="custom-actions">Custom Actions</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-actions"]').exists()).toBe(true);
    });
  });

  describe('Layout States', () => {
    it('applies has-header class when header exists', () => {
      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--has-header');
    });

    it('applies has-media class when media slot exists', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          media: '<img src="test.jpg" alt="test" />'
        }
      });

      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--has-media');
    });

    it('applies has-footer class when footer slot exists', () => {
      const wrapper = mount(ContentCard, {
        props: defaultProps,
        slots: {
          footer: '<div>Footer</div>'
        }
      });

      const card = wrapper.find('.content-card');
      expect(card.classes()).toContain('content-card--has-footer');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus handling for clickable cards', async () => {
      await wrapper.setProps({ clickable: true });
      
      const card = wrapper.find('.content-card');
      expect(card.attributes('tabindex')).toBeDefined();
    });

    it('has proper ARIA attributes for actions', async () => {
      const actions = [
        { id: 'test', label: 'Test Action', tooltip: 'Test tooltip' }
      ];

      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.card-action-button');
      expect(button.attributes('title')).toBe('Test tooltip');
    });
  });

  describe('Custom Classes', () => {
    it('accepts custom classes', async () => {
      await wrapper.setProps({ class: 'custom-card' });
      
      expect(wrapper.classes()).toContain('custom-card');
    });

    it('accepts array of custom classes', async () => {
      await wrapper.setProps({ class: ['custom-1', 'custom-2'] });
      
      expect(wrapper.classes()).toContain('custom-1');
      expect(wrapper.classes()).toContain('custom-2');
    });

    it('accepts object of custom classes', async () => {
      await wrapper.setProps({ 
        class: { 
          'custom-active': true, 
          'custom-inactive': false 
        } 
      });
      
      expect(wrapper.classes()).toContain('custom-active');
      expect(wrapper.classes()).not.toContain('custom-inactive');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', async () => {
      await wrapper.setProps({ title: '' });
      
      expect(wrapper.find('.card-title').exists()).toBe(false);
    });

    it('handles no content gracefully', () => {
      const wrapper = mount(ContentCard, {
        props: { title: 'Empty Card' }
      });
      
      expect(wrapper.find('.card-content').exists()).toBe(true);
    });

    it('handles empty actions array', async () => {
      await wrapper.setProps({ actions: [] });
      
      expect(wrapper.find('.card-actions').exists()).toBe(false);
    });

    it('handles action without handler gracefully', async () => {
      const actions = [{ id: 'test', label: 'Test' }];
      await wrapper.setProps({ actions });
      
      const button = wrapper.find('.card-action-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
    });
  });
});