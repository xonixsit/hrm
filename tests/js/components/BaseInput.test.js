import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from '@/Components/Base/BaseInput.vue';

describe('BaseInput', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseInput);
      
      expect(wrapper.find('input').exists()).toBe(true);
      expect(wrapper.find('input').attributes('type')).toBe('text');
      expect(wrapper.classes()).toContain('base-input-wrapper');
    });

    it('renders with label', () => {
      const wrapper = mount(BaseInput, {
        props: { label: 'Test Label' }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Test Label');
    });

    it('renders with placeholder', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          placeholder: 'Enter text...',
          floatingLabel: false // Disable floating label to show placeholder
        }
      });
      
      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text...');
    });

    it('shows required asterisk when required', () => {
      const wrapper = mount(BaseInput, {
        props: { label: 'Required Field', required: true }
      });
      
      expect(wrapper.find('label').text()).toContain('*');
    });
  });

  describe('Input Types', () => {
    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'];
    
    inputTypes.forEach(type => {
      it(`renders ${type} input type`, () => {
        const wrapper = mount(BaseInput, {
          props: { type }
        });
        
        expect(wrapper.find('input').attributes('type')).toBe(type);
      });
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      const wrapper = mount(BaseInput, {
        props: { size: 'sm' }
      });
      
      const input = wrapper.find('input');
      expect(input.classes()).toContain('h-8');
      expect(input.classes()).toContain('text-sm');
    });

    it('applies medium size classes by default', () => {
      const wrapper = mount(BaseInput);
      
      const input = wrapper.find('input');
      expect(input.classes()).toContain('h-10');
      expect(input.classes()).toContain('text-base');
    });

    it('applies large size classes', () => {
      const wrapper = mount(BaseInput, {
        props: { size: 'lg' }
      });
      
      const input = wrapper.find('input');
      expect(input.classes()).toContain('h-12');
      expect(input.classes()).toContain('text-lg');
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(BaseInput, {
        props: { disabled: true }
      });
      
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.classes()).toContain('disabled:cursor-not-allowed');
    });

    it('applies readonly state correctly', () => {
      const wrapper = mount(BaseInput, {
        props: { readonly: true }
      });
      
      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBeDefined();
      expect(input.classes()).toContain('read-only:bg-neutral-50');
    });

    it('applies required attribute', () => {
      const wrapper = mount(BaseInput, {
        props: { required: true }
      });
      
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('shows error message', () => {
      const wrapper = mount(BaseInput, {
        props: { errorMessage: 'This field is required' }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toBe('This field is required');
      expect(errorElement.classes()).toContain('text-error-500');
    });

    it('shows help text when no error', () => {
      const wrapper = mount(BaseInput, {
        props: { helpText: 'Enter your email address' }
      });
      
      const helpElement = wrapper.find('.text-neutral-500');
      expect(helpElement.exists()).toBe(true);
      expect(helpElement.text()).toBe('Enter your email address');
    });

    it('prioritizes error message over help text', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          errorMessage: 'Error message',
          helpText: 'Help text'
        }
      });
      
      expect(wrapper.find('[role="alert"]').text()).toBe('Error message');
      expect(wrapper.text()).not.toContain('Help text');
    });

    it('applies error styling to input', () => {
      const wrapper = mount(BaseInput, {
        props: { errorMessage: 'Error' }
      });
      
      const input = wrapper.find('input');
      expect(input.classes()).toContain('ring-error-300');
      expect(input.classes()).toContain('focus:ring-error-600');
    });
  });

  describe('Icons', () => {
    const MockIcon = { template: '<div class="mock-icon"></div>' };

    it('renders left icon', () => {
      const wrapper = mount(BaseInput, {
        props: { iconLeft: MockIcon }
      });
      
      expect(wrapper.find('.mock-icon').exists()).toBe(true);
      expect(wrapper.find('input').classes()).toContain('pl-10');
    });

    it('renders right icon', () => {
      const wrapper = mount(BaseInput, {
        props: { iconRight: MockIcon }
      });
      
      expect(wrapper.find('.mock-icon').exists()).toBe(true);
      expect(wrapper.find('input').classes()).toContain('pr-10');
    });

    it('applies correct icon size classes', () => {
      const wrapper = mount(BaseInput, {
        props: { iconLeft: MockIcon, size: 'lg' }
      });
      
      const iconComponent = wrapper.findComponent(MockIcon);
      expect(iconComponent.classes()).toContain('w-6');
      expect(iconComponent.classes()).toContain('h-6');
    });
  });

  describe('Clearable Feature', () => {
    it('shows clear button when clearable and has value', async () => {
      const wrapper = mount(BaseInput, {
        props: { 
          clearable: true,
          modelValue: 'test value'
        }
      });
      
      const clearButton = wrapper.find('button');
      expect(clearButton.exists()).toBe(true);
    });

    it('does not show clear button when no value', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          clearable: true,
          modelValue: ''
        }
      });
      
      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('clears value when clear button clicked', async () => {
      const wrapper = mount(BaseInput, {
        props: { 
          clearable: true,
          modelValue: 'test value'
        }
      });
      
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
      expect(wrapper.emitted('clear')).toHaveLength(1);
    });

    it('does not show clear button when disabled', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          clearable: true,
          modelValue: 'test value',
          disabled: true
        }
      });
      
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  describe('Floating Labels', () => {
    it('applies floating label by default', () => {
      const wrapper = mount(BaseInput, {
        props: { label: 'Floating Label' }
      });
      
      const label = wrapper.find('label');
      expect(label.classes()).toContain('absolute');
    });

    it('can disable floating labels', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          label: 'Static Label',
          floatingLabel: false
        }
      });
      
      const label = wrapper.find('label');
      expect(label.classes()).not.toContain('absolute');
      expect(label.classes()).toContain('mb-1');
    });

    it('floats label when input has value', async () => {
      const wrapper = mount(BaseInput, {
        props: { 
          label: 'Floating Label',
          modelValue: 'test'
        }
      });
      
      const label = wrapper.find('label');
      expect(label.classes()).toContain('-translate-y-6');
    });

    it('adjusts placeholder for floating labels', () => {
      const wrapper = mount(BaseInput, {
        props: { 
          label: 'Label',
          placeholder: 'Placeholder',
          floatingLabel: true
        }
      });
      
      // When not focused and no value, placeholder should be empty for floating labels
      expect(wrapper.find('input').attributes('placeholder')).toBe('');
    });
  });

  describe('Event Handling', () => {
    it('emits update:modelValue on input', async () => {
      const wrapper = mount(BaseInput);
      const input = wrapper.find('input');
      
      await input.setValue('test value');
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test value']);
    });

    it('emits focus event', async () => {
      const wrapper = mount(BaseInput);
      
      await wrapper.find('input').trigger('focus');
      
      expect(wrapper.emitted('focus')).toHaveLength(1);
    });

    it('emits blur event', async () => {
      const wrapper = mount(BaseInput);
      
      await wrapper.find('input').trigger('blur');
      
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('emits keydown event', async () => {
      const wrapper = mount(BaseInput);
      
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('keydown')).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID for input', () => {
      const wrapper1 = mount(BaseInput, { props: { label: 'Label 1' } });
      const wrapper2 = mount(BaseInput, { props: { label: 'Label 2' } });
      
      const id1 = wrapper1.find('input').attributes('id');
      const id2 = wrapper2.find('input').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('associates label with input', () => {
      const wrapper = mount(BaseInput, {
        props: { label: 'Test Label' }
      });
      
      const input = wrapper.find('input');
      const label = wrapper.find('label');
      
      expect(input.attributes('id')).toBe(label.attributes('for'));
    });

    it('has proper ARIA attributes for error state', () => {
      const wrapper = mount(BaseInput, {
        props: { errorMessage: 'Error message' }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
    });
  });

  describe('Public Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BaseInput);
      
      expect(wrapper.vm.focus).toBeDefined();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(BaseInput);
      
      expect(wrapper.vm.blur).toBeDefined();
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('exposes select method', () => {
      const wrapper = mount(BaseInput);
      
      expect(wrapper.vm.select).toBeDefined();
      expect(typeof wrapper.vm.select).toBe('function');
    });

    it('exposes inputRef', () => {
      const wrapper = mount(BaseInput);
      
      expect(wrapper.vm.inputRef).toBeDefined();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom classes to wrapper', () => {
      const wrapper = mount(BaseInput, {
        props: { class: 'custom-class' }
      });
      
      expect(wrapper.classes()).toContain('custom-class');
    });
  });
});