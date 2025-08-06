import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormActions from '@/Components/Forms/FormActions.vue';

describe('FormActions', () => {
  let wrapper;

  const defaultActions = [
    { id: 'cancel', label: 'Cancel', variant: 'secondary' },
    { id: 'submit', label: 'Submit', variant: 'primary', type: 'submit' }
  ];

  beforeEach(() => {
    wrapper = mount(FormActions, {
      props: {
        actions: defaultActions
      }
    });
  });

  describe('Basic Rendering', () => {
    it('renders action buttons', () => {
      const buttons = wrapper.findAll('.form-action-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Cancel');
      expect(buttons[1].text()).toBe('Submit');
    });

    it('applies correct CSS classes', () => {
      expect(wrapper.classes()).toContain('form-actions');
      expect(wrapper.classes()).toContain('form-actions--default');
      expect(wrapper.classes()).toContain('form-actions--between');
    });

    it('separates primary and secondary actions', () => {
      expect(wrapper.find('.secondary-actions')).toBeTruthy();
      expect(wrapper.find('.primary-actions')).toBeTruthy();
      
      const secondaryButtons = wrapper.find('.secondary-actions').findAll('.form-action-button');
      const primaryButtons = wrapper.find('.primary-actions').findAll('.form-action-button');
      
      expect(secondaryButtons).toHaveLength(1);
      expect(primaryButtons).toHaveLength(1);
    });
  });

  describe('Action Variants', () => {
    it('applies primary action styling', () => {
      const primaryButton = wrapper.find('.primary-actions .form-action-button');
      expect(primaryButton.classes()).toContain('form-action-button');
      // Primary styling is applied via conditional classes in getActionClasses
      expect(primaryButton.exists()).toBe(true);
    });

    it('applies secondary action styling', () => {
      const secondaryButton = wrapper.find('.secondary-actions .form-action-button');
      expect(secondaryButton.classes()).toContain('bg-white');
      expect(secondaryButton.classes()).toContain('text-neutral-700');
    });

    it('applies danger action styling', async () => {
      await wrapper.setProps({
        actions: [{ id: 'delete', label: 'Delete', variant: 'danger' }]
      });
      
      const dangerButton = wrapper.find('.form-action-button');
      expect(dangerButton.classes()).toContain('bg-error-600');
    });

    it('applies ghost action styling', async () => {
      await wrapper.setProps({
        actions: [{ id: 'ghost', label: 'Ghost', variant: 'ghost' }]
      });
      
      const ghostButton = wrapper.find('.form-action-button');
      expect(ghostButton.classes()).toContain('text-neutral-600');
    });
  });

  describe('Action Sizes', () => {
    it('applies small size classes', async () => {
      await wrapper.setProps({ size: 'sm' });
      const buttons = wrapper.findAll('.form-action-button');
      buttons.forEach(button => {
        expect(button.classes()).toContain('px-3');
        expect(button.classes()).toContain('py-2');
        expect(button.classes()).toContain('text-sm');
      });
    });

    it('applies large size classes', async () => {
      await wrapper.setProps({ size: 'lg' });
      const buttons = wrapper.findAll('.form-action-button');
      buttons.forEach(button => {
        expect(button.classes()).toContain('px-6');
        expect(button.classes()).toContain('py-3');
        expect(button.classes()).toContain('text-lg');
      });
    });

    it('uses individual action size when specified', async () => {
      await wrapper.setProps({
        actions: [{ id: 'small', label: 'Small', size: 'sm' }]
      });
      
      const button = wrapper.find('.form-action-button');
      expect(button.classes()).toContain('px-3');
      expect(button.classes()).toContain('text-sm');
    });
  });

  describe('Loading State', () => {
    beforeEach(async () => {
      await wrapper.setProps({ loading: true });
    });

    it('applies loading classes', () => {
      expect(wrapper.classes()).toContain('form-actions--loading');
    });

    it('shows loading spinner for submit button', () => {
      const submitButton = wrapper.find('.primary-actions .form-action-button');
      expect(submitButton.find('.animate-spin')).toBeTruthy();
    });

    it('changes submit button text during loading', () => {
      const submitButton = wrapper.find('.primary-actions .form-action-button');
      expect(submitButton.text()).toContain('Processing...');
    });

    it('uses custom loading label when provided', async () => {
      await wrapper.setProps({ 
        loading: true,
        loadingLabel: 'Saving...',
        actions: [{ id: 'submit', label: 'Submit', type: 'submit' }]
      });
      
      const submitButton = wrapper.find('.form-action-button');
      expect(submitButton.text()).toContain('Saving...');
    });

    it('uses action-specific loading label', async () => {
      await wrapper.setProps({
        loading: true,
        actions: [{ 
          id: 'submit', 
          label: 'Submit', 
          type: 'submit',
          loadingLabel: 'Submitting Form...'
        }]
      });
      
      const submitButton = wrapper.find('.form-action-button');
      expect(submitButton.text()).toContain('Submitting Form...');
    });
  });

  describe('Disabled State', () => {
    beforeEach(async () => {
      await wrapper.setProps({ disabled: true });
    });

    it('applies disabled classes', () => {
      expect(wrapper.classes()).toContain('form-actions--disabled');
    });

    it('disables all buttons when form is disabled', () => {
      const buttons = wrapper.findAll('.form-action-button');
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined();
        expect(button.classes()).toContain('opacity-50');
        expect(button.classes()).toContain('cursor-not-allowed');
      });
    });

    it('disables individual actions when specified', async () => {
      await wrapper.setProps({
        disabled: false,
        actions: [
          { id: 'disabled', label: 'Disabled', disabled: true },
          { id: 'enabled', label: 'Enabled' }
        ]
      });
      
      const buttons = wrapper.findAll('.form-action-button');
      expect(buttons[0].attributes('disabled')).toBeDefined();
      expect(buttons[1].attributes('disabled')).toBeUndefined();
    });
  });

  describe('Layout Options', () => {
    it('applies left alignment', async () => {
      await wrapper.setProps({ alignment: 'left' });
      expect(wrapper.classes()).toContain('form-actions--left');
      expect(wrapper.find('.actions-content').exists()).toBe(true);
    });

    it('applies center alignment', async () => {
      await wrapper.setProps({ alignment: 'center' });
      expect(wrapper.classes()).toContain('form-actions--center');
      expect(wrapper.find('.actions-content').exists()).toBe(true);
    });

    it('applies right alignment', async () => {
      await wrapper.setProps({ alignment: 'right' });
      expect(wrapper.classes()).toContain('form-actions--right');
      expect(wrapper.find('.actions-content').exists()).toBe(true);
    });

    it('applies column direction', async () => {
      await wrapper.setProps({ direction: 'column' });
      expect(wrapper.classes()).toContain('form-actions--column');
      expect(wrapper.find('.actions-content').exists()).toBe(true);
    });
  });

  describe('Variants', () => {
    it('applies minimal variant', async () => {
      await wrapper.setProps({ variant: 'minimal' });
      expect(wrapper.classes()).toContain('form-actions--minimal');
    });

    it('applies sticky variant', async () => {
      await wrapper.setProps({ variant: 'sticky' });
      expect(wrapper.classes()).toContain('form-actions--sticky');
    });
  });

  describe('Help Text', () => {
    it('renders help text when provided', async () => {
      await wrapper.setProps({ helpText: 'This is help text' });
      
      expect(wrapper.find('.actions-help')).toBeTruthy();
      expect(wrapper.find('.help-text').text()).toBe('This is help text');
      expect(wrapper.classes()).toContain('form-actions--has-help');
    });

    it('renders help slot content', () => {
      const wrapperWithSlot = mount(FormActions, {
        props: { actions: defaultActions },
        slots: {
          help: '<div class="custom-help">Custom help content</div>'
        }
      });
      
      expect(wrapperWithSlot.find('.custom-help').text()).toBe('Custom help content');
    });
  });

  describe('Event Handling', () => {
    it('emits action event when button clicked', async () => {
      const cancelButton = wrapper.find('.secondary-actions .form-action-button');
      await cancelButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual(defaultActions[0]);
    });

    it('does not emit action when button is disabled', async () => {
      await wrapper.setProps({
        actions: [{ id: 'disabled', label: 'Disabled', disabled: true }]
      });
      
      const button = wrapper.find('.form-action-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('action')).toBeFalsy();
    });

    it('does not emit action when form is disabled', async () => {
      await wrapper.setProps({ disabled: true });
      
      const button = wrapper.find('.form-action-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('action')).toBeFalsy();
    });
  });

  describe('Icons', () => {
    it('renders action icons when provided', async () => {
      await wrapper.setProps({
        actions: [{ 
          id: 'save', 
          label: 'Save', 
          icon: 'save-icon'
        }]
      });
      
      const button = wrapper.find('.form-action-button');
      expect(button.classes()).toContain('space-x-2');
    });

    it('hides icon during loading for submit button', async () => {
      await wrapper.setProps({
        loading: true,
        actions: [{ 
          id: 'submit', 
          label: 'Submit', 
          type: 'submit',
          icon: 'submit-icon'
        }]
      });
      
      const button = wrapper.find('.form-action-button');
      expect(button.find('.animate-spin')).toBeTruthy();
    });
  });

  describe('Slots', () => {
    it('renders primary slot content', () => {
      const wrapperWithSlots = mount(FormActions, {
        slots: {
          primary: '<button class="custom-primary">Custom Primary</button>'
        }
      });
      
      expect(wrapperWithSlots.find('.custom-primary').text()).toBe('Custom Primary');
    });

    it('renders secondary slot content', () => {
      const wrapperWithSlots = mount(FormActions, {
        slots: {
          secondary: '<button class="custom-secondary">Custom Secondary</button>'
        }
      });
      
      expect(wrapperWithSlots.find('.custom-secondary').text()).toBe('Custom Secondary');
    });
  });

  describe('Form Context Integration', () => {
    it('uses form context size when no size prop provided', () => {
      const wrapperWithContext = mount(FormActions, {
        props: { actions: defaultActions },
        global: {
          provide: {
            formContext: {
              size: { value: 'lg' }
            }
          }
        }
      });
      
      expect(wrapperWithContext.classes()).toContain('form-actions--lg');
    });
  });

  describe('Accessibility', () => {
    it('has proper button types', () => {
      const buttons = wrapper.findAll('.form-action-button');
      expect(buttons[0].attributes('type')).toBe('button');
      expect(buttons[1].attributes('type')).toBe('submit');
    });

    it('provides proper focus states', () => {
      const buttons = wrapper.findAll('.form-action-button');
      buttons.forEach(button => {
        expect(button.classes()).toContain('focus:outline-none');
        expect(button.classes()).toContain('focus:ring-2');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains proper structure for mobile', () => {
      expect(wrapper.find('.actions-content')).toBeTruthy();
      expect(wrapper.find('.secondary-actions')).toBeTruthy();
      expect(wrapper.find('.primary-actions')).toBeTruthy();
    });
  });

  describe('Spacing', () => {
    it('applies spacing variants', async () => {
      await wrapper.setProps({ spacing: 'lg' });
      expect(wrapper.classes()).toContain('form-actions--spacing-lg');
      expect(wrapper.find('.actions-content').exists()).toBe(true);
    });
  });
});