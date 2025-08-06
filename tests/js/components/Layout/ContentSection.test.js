import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContentSection from '@/Components/Layout/ContentSection.vue';

describe('ContentSection', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Section'
  };

  beforeEach(() => {
    wrapper = mount(ContentSection, {
      props: defaultProps
    });
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('section').exists()).toBe(true);
      expect(wrapper.find('.section-title').text()).toBe('Test Section');
    });

    it('applies correct base classes', () => {
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section');
      expect(section.classes()).toContain('content-section--default');
      expect(section.classes()).toContain('content-section--md');
      expect(section.classes()).toContain('content-section--spacing-normal');
    });

    it('renders semantic HTML structure', () => {
      expect(wrapper.find('section').exists()).toBe(true);
      expect(wrapper.find('header.section-header').exists()).toBe(true);
      expect(wrapper.find('.section-content').exists()).toBe(true);
    });
  });

  describe('Title and Description', () => {
    it('displays title correctly', () => {
      expect(wrapper.find('.section-title').text()).toBe('Test Section');
    });

    it('displays description when provided', async () => {
      await wrapper.setProps({ description: 'Test description' });
      
      const description = wrapper.find('.section-description');
      expect(description.exists()).toBe(true);
      expect(description.text()).toBe('Test description');
    });

    it('does not render description when not provided', () => {
      expect(wrapper.find('.section-description').exists()).toBe(false);
    });

    it('applies correct heading level', async () => {
      await wrapper.setProps({ headingLevel: 3 });
      
      const title = wrapper.find('.section-title');
      expect(title.classes()).toContain('section-title--h3');
    });

    it('applies title classes correctly', async () => {
      await wrapper.setProps({ description: 'Test description' });
      
      const title = wrapper.find('.section-title');
      expect(title.classes()).toContain('section-title--with-description');
    });
  });

  describe('Variants', () => {
    it('applies default variant by default', () => {
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--default');
    });

    it('applies card variant when specified', async () => {
      await wrapper.setProps({ variant: 'card' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--card');
    });

    it('applies bordered variant when specified', async () => {
      await wrapper.setProps({ variant: 'bordered' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--bordered');
    });

    it('applies elevated variant when specified', async () => {
      await wrapper.setProps({ variant: 'elevated' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--elevated');
    });
  });

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--md');
    });

    it('applies small size when specified', async () => {
      await wrapper.setProps({ size: 'sm' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--sm');
    });

    it('applies large size when specified', async () => {
      await wrapper.setProps({ size: 'lg' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--lg');
    });

    it('applies extra large size when specified', async () => {
      await wrapper.setProps({ size: 'xl' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--xl');
    });
  });

  describe('Spacing Variants', () => {
    it('applies normal spacing by default', () => {
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--spacing-normal');
    });

    it('applies tight spacing when specified', async () => {
      await wrapper.setProps({ spacing: 'tight' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--spacing-tight');
    });

    it('applies loose spacing when specified', async () => {
      await wrapper.setProps({ spacing: 'loose' });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--spacing-loose');
    });
  });

  describe('Header Actions', () => {
    it('does not show header actions by default', () => {
      expect(wrapper.find('.header-actions').exists()).toBe(false);
    });

    it('shows header actions when provided', async () => {
      const actions = [
        { id: 'edit', label: 'Edit', variant: 'primary' },
        { id: 'delete', label: 'Delete', variant: 'danger' }
      ];

      await wrapper.setProps({ headerActions: actions });
      
      expect(wrapper.find('.header-actions').exists()).toBe(true);
      expect(wrapper.findAll('.header-action-button')).toHaveLength(2);
    });

    it('handles header action clicks', async () => {
      const mockHandler = vi.fn();
      const actions = [
        { id: 'test', label: 'Test', handler: mockHandler }
      ];

      await wrapper.setProps({ headerActions: actions });
      
      const actionButton = wrapper.find('.header-action-button');
      await actionButton.trigger('click');
      
      expect(wrapper.emitted('header-action')).toBeTruthy();
      expect(wrapper.emitted('header-action')[0][0]).toEqual(actions[0]);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('applies correct action button classes', async () => {
      const actions = [
        { id: 'primary', label: 'Primary', variant: 'primary' },
        { id: 'secondary', label: 'Secondary', variant: 'secondary' },
        { id: 'danger', label: 'Danger', variant: 'danger' }
      ];

      await wrapper.setProps({ headerActions: actions });
      
      const buttons = wrapper.findAll('.header-action-button');
      expect(buttons[0].classes()).toContain('bg-primary-600');
      expect(buttons[1].classes()).toContain('bg-white');
      expect(buttons[2].classes()).toContain('bg-error-600');
    });

    it('handles disabled actions', async () => {
      const actions = [
        { id: 'disabled', label: 'Disabled', disabled: true }
      ];

      await wrapper.setProps({ headerActions: actions });
      
      const button = wrapper.find('.header-action-button');
      expect(button.classes()).toContain('opacity-50');
      expect(button.classes()).toContain('cursor-not-allowed');
    });
  });

  describe('Layout Options', () => {
    it('applies full width when specified', async () => {
      await wrapper.setProps({ fullWidth: true });
      
      const section = wrapper.find('section');
      expect(section.classes()).toContain('content-section--full-width');
    });

    it('shows header when title is provided', () => {
      expect(wrapper.find('.section-header').exists()).toBe(true);
      expect(wrapper.vm.hasHeader).toBe(true);
    });

    it('shows header when description is provided', async () => {
      await wrapper.setProps({ title: '', description: 'Test description' });
      
      expect(wrapper.find('.section-header').exists()).toBe(true);
      expect(wrapper.vm.hasHeader).toBe(true);
    });

    it('shows header when actions are provided', async () => {
      await wrapper.setProps({ 
        title: '', 
        headerActions: [{ id: 'test', label: 'Test' }] 
      });
      
      expect(wrapper.find('.section-header').exists()).toBe(true);
      expect(wrapper.vm.hasHeader).toBe(true);
    });
  });

  describe('Slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(ContentSection, {
        props: defaultProps,
        slots: {
          default: '<div data-testid="slot-content">Slot Content</div>'
        }
      });

      expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="slot-content"]').text()).toBe('Slot Content');
    });

    it('renders custom header slot', () => {
      const wrapper = mount(ContentSection, {
        props: { title: '' }, // Remove default title
        slots: {
          header: '<div data-testid="custom-header">Custom Header</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-header"]').exists()).toBe(true);
    });

    it('renders footer slot when provided', () => {
      const wrapper = mount(ContentSection, {
        props: defaultProps,
        slots: {
          footer: '<div data-testid="footer-content">Footer Content</div>'
        }
      });

      expect(wrapper.find('.section-footer').exists()).toBe(true);
      expect(wrapper.find('[data-testid="footer-content"]').exists()).toBe(true);
    });

    it('renders header actions slot', () => {
      const wrapper = mount(ContentSection, {
        props: defaultProps,
        slots: {
          'header-actions': '<div data-testid="custom-actions">Custom Actions</div>'
        }
      });

      expect(wrapper.find('[data-testid="custom-actions"]').exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic section element', () => {
      expect(wrapper.find('section').exists()).toBe(true);
    });

    it('uses proper heading hierarchy', async () => {
      await wrapper.setProps({ headingLevel: 3 });
      
      const title = wrapper.find('.section-title');
      expect(title.classes()).toContain('section-title--h3');
    });

    it('has proper header structure', () => {
      expect(wrapper.find('header.section-header').exists()).toBe(true);
    });

    it('has proper content structure', () => {
      expect(wrapper.find('.section-content').exists()).toBe(true);
    });
  });

  describe('Custom Classes', () => {
    it('accepts custom classes', async () => {
      await wrapper.setProps({ class: 'custom-section' });
      
      expect(wrapper.classes()).toContain('custom-section');
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
      
      expect(wrapper.find('.section-title').exists()).toBe(false);
    });

    it('handles no content gracefully', () => {
      const wrapper = mount(ContentSection, {
        props: { title: 'Empty Section' }
      });
      
      expect(wrapper.find('.section-content').exists()).toBe(true);
    });

    it('handles invalid heading level gracefully', async () => {
      // Should not crash with invalid heading level
      await wrapper.setProps({ headingLevel: 10 });
      
      expect(wrapper.exists()).toBe(true);
    });
  });
});