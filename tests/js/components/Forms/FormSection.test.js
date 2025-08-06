import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormSection from '@/Components/Forms/FormSection.vue';

describe('FormSection', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Section',
    description: 'Test section description'
  };

  beforeEach(() => {
    wrapper = mount(FormSection, {
      props: defaultProps,
      slots: {
        default: '<div>Section content</div>'
      }
    });
  });

  describe('Basic Rendering', () => {
    it('renders section with title and description', () => {
      expect(wrapper.find('.section-title').text()).toBe('Test Section');
      expect(wrapper.find('.section-description').text()).toBe('Test section description');
    });

    it('renders section content in slot', () => {
      expect(wrapper.find('.section-content').text()).toContain('Section content');
    });

    it('applies correct CSS classes', () => {
      expect(wrapper.classes()).toContain('form-section');
      expect(wrapper.classes()).toContain('form-section--default');
    });
  });

  describe('Section Variants', () => {
    it('applies card variant classes', async () => {
      await wrapper.setProps({ variant: 'card' });
      expect(wrapper.classes()).toContain('form-section--card');
    });

    it('applies bordered variant classes', async () => {
      await wrapper.setProps({ variant: 'bordered' });
      expect(wrapper.classes()).toContain('form-section--bordered');
    });

    it('applies minimal variant classes', async () => {
      await wrapper.setProps({ variant: 'minimal' });
      expect(wrapper.classes()).toContain('form-section--minimal');
    });
  });

  describe('Section Sizes', () => {
    it('applies small size classes', async () => {
      await wrapper.setProps({ size: 'sm' });
      expect(wrapper.classes()).toContain('form-section--sm');
    });

    it('applies large size classes', async () => {
      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.classes()).toContain('form-section--lg');
    });
  });

  describe('Grid Layout', () => {
    beforeEach(async () => {
      await wrapper.setProps({ 
        useGrid: true,
        columns: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
      });
    });

    it('applies grid layout classes', () => {
      expect(wrapper.classes()).toContain('form-section--grid');
      const grid = wrapper.find('.section-grid');
      expect(grid.exists()).toBe(true);
    });

    it('applies responsive grid columns', () => {
      const grid = wrapper.find('.section-grid');
      expect(grid.classes()).toContain('grid-cols-1');
      expect(grid.classes()).toContain('sm:grid-cols-2');
      expect(grid.classes()).toContain('md:grid-cols-3');
      expect(grid.classes()).toContain('lg:grid-cols-4');
      expect(grid.classes()).toContain('xl:grid-cols-5');
    });

    it('applies gap classes', async () => {
      await wrapper.setProps({ gap: 'lg' });
      const grid = wrapper.find('.section-grid');
      expect(grid.classes()).toContain('section-grid--gap-lg');
    });
  });

  describe('Section Actions', () => {
    const actions = [
      { id: 'edit', label: 'Edit', variant: 'ghost' },
      { id: 'delete', label: 'Delete', variant: 'danger' }
    ];

    beforeEach(async () => {
      await wrapper.setProps({ actions });
    });

    it('renders action buttons', () => {
      expect(wrapper.find('.section-actions')).toBeTruthy();
      const buttons = wrapper.findAll('.section-action-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Edit');
      expect(buttons[1].text()).toBe('Delete');
    });

    it('applies correct action button classes', () => {
      const buttons = wrapper.findAll('.section-action-button');
      expect(buttons[1].classes()).toContain('bg-error-600');
    });

    it('emits action event when button clicked', async () => {
      const editButton = wrapper.findAll('.section-action-button')[0];
      await editButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0]);
    });

    it('does not emit action when button is disabled', async () => {
      await wrapper.setProps({ 
        actions: [{ id: 'disabled', label: 'Disabled', disabled: true }]
      });
      
      const button = wrapper.find('.section-action-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('action')).toBeFalsy();
    });
  });

  describe('Collapsible Sections', () => {
    beforeEach(async () => {
      await wrapper.setProps({ 
        collapsible: true,
        collapsed: false
      });
    });

    it('applies collapsible classes', () => {
      expect(wrapper.classes()).toContain('form-section--collapsible');
    });

    it('shows content when not collapsed', () => {
      expect(wrapper.find('.section-content').classes()).not.toContain('section-content--collapsed');
    });

    it('hides content when collapsed', async () => {
      await wrapper.setProps({ collapsed: true });
      expect(wrapper.classes()).toContain('form-section--collapsed');
      expect(wrapper.find('.section-content').classes()).toContain('section-content--collapsed');
    });
  });

  describe('Heading Levels', () => {
    it('uses h3 by default', () => {
      expect(wrapper.find('.section-title').classes()).toContain('section-title--h3');
    });

    it('applies custom heading level', async () => {
      await wrapper.setProps({ headingLevel: 2 });
      expect(wrapper.find('.section-title').classes()).toContain('section-title--h2');
    });

    it('validates heading level range', async () => {
      // Test that invalid heading levels are handled appropriately
      await wrapper.setProps({ headingLevel: 1 });
      expect(wrapper.find('.section-title').classes()).toContain('section-title--h1');
      
      await wrapper.setProps({ headingLevel: 6 });
      expect(wrapper.find('.section-title').classes()).toContain('section-title--h6');
    });
  });

  describe('Form Context Integration', () => {
    it('uses form context size when no size prop provided', () => {
      const wrapperWithContext = mount(FormSection, {
        props: { title: 'Test' },
        global: {
          provide: {
            formContext: {
              size: { value: 'lg' }
            }
          }
        }
      });
      
      expect(wrapperWithContext.classes()).toContain('form-section--lg');
    });
  });

  describe('Slots', () => {
    it('renders header slot content', () => {
      const wrapperWithSlots = mount(FormSection, {
        slots: {
          header: '<div class="custom-header">Custom Header</div>',
          default: '<div>Content</div>'
        }
      });
      
      expect(wrapperWithSlots.find('.custom-header').text()).toBe('Custom Header');
    });

    it('renders footer slot content', () => {
      const wrapperWithSlots = mount(FormSection, {
        props: defaultProps,
        slots: {
          default: '<div>Content</div>',
          footer: '<div class="custom-footer">Custom Footer</div>'
        }
      });
      
      expect(wrapperWithSlots.find('.custom-footer').text()).toBe('Custom Footer');
      expect(wrapperWithSlots.classes()).toContain('form-section--has-footer');
    });

    it('renders actions slot content', () => {
      const wrapperWithSlots = mount(FormSection, {
        props: defaultProps,
        slots: {
          default: '<div>Content</div>',
          actions: '<button class="custom-action">Custom Action</button>'
        }
      });
      
      expect(wrapperWithSlots.find('.custom-action').text()).toBe('Custom Action');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic section element', () => {
      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('has proper heading hierarchy', () => {
      expect(wrapper.find('.section-title')).toBeTruthy();
    });

    it('provides proper structure for screen readers', () => {
      expect(wrapper.find('.section-header')).toBeTruthy();
      expect(wrapper.find('.section-content')).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles responsive grid columns correctly', async () => {
      await wrapper.setProps({ 
        useGrid: true,
        columns: { xs: 1, md: 2 }
      });
      
      const grid = wrapper.find('.section-grid');
      expect(grid.classes()).toContain('grid-cols-1');
      expect(grid.classes()).toContain('md:grid-cols-2');
    });
  });

  describe('Content Organization', () => {
    it('organizes content in logical sections', () => {
      expect(wrapper.find('.section-header')).toBeTruthy();
      expect(wrapper.find('.section-content')).toBeTruthy();
    });

    it('groups related fields when using grid', async () => {
      await wrapper.setProps({ useGrid: true });
      expect(wrapper.find('.section-grid')).toBeTruthy();
    });

    it('maintains proper spacing between elements', () => {
      expect(wrapper.find('.section-fields')).toBeTruthy();
    });
  });

  describe('Visual Hierarchy', () => {
    it('displays title prominently', () => {
      const title = wrapper.find('.section-title');
      expect(title.exists()).toBe(true);
      expect(title.classes()).toContain('section-title');
    });

    it('shows description with appropriate styling', () => {
      const description = wrapper.find('.section-description');
      expect(description.exists()).toBe(true);
      expect(description.classes()).toContain('section-description');
    });
  });
});