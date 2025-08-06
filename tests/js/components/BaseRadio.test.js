import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseRadio from '@/Components/Base/BaseRadio.vue';

describe('BaseRadio', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('base-radio-wrapper');
    });

    it('renders with label', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Test Radio'
        }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Test Radio');
    });

    it('renders with description', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Radio',
          description: 'This is a description'
        }
      });
      
      expect(wrapper.text()).toContain('This is a description');
    });

    it('shows required asterisk when required', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Required Field',
          required: true
        }
      });
      
      expect(wrapper.find('label').text()).toContain('*');
    });

    it('renders slot content', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        },
        slots: { default: 'Slot Content' }
      });
      
      expect(wrapper.text()).toContain('Slot Content');
    });
  });

  describe('Radio States', () => {
    it('shows as checked when modelValue matches value', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          modelValue: 'option1'
        }
      });
      
      expect(wrapper.vm.isChecked).toBe(true);
      expect(wrapper.find('div[class*="rounded-full"]:not([class*="absolute"])').exists()).toBe(true); // Radio dot visible
    });

    it('shows as unchecked when modelValue does not match value', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          modelValue: 'option2'
        }
      });
      
      expect(wrapper.vm.isChecked).toBe(false);
      expect(wrapper.find('div[class*="rounded-full"]:not([class*="absolute"])').exists()).toBe(false);
    });

    it('handles different value types', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 123,
          modelValue: 123
        }
      });
      
      expect(wrapper.vm.isChecked).toBe(true);
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          size: 'sm'
        }
      });
      
      const customRadio = wrapper.find('div[class*="w-4"]');
      expect(customRadio.exists()).toBe(true);
    });

    it('applies medium size classes by default', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      const customRadio = wrapper.find('div[class*="w-5"]');
      expect(customRadio.exists()).toBe(true);
    });

    it('applies large size classes', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          size: 'lg'
        }
      });
      
      const customRadio = wrapper.find('div[class*="w-6"]');
      expect(customRadio.exists()).toBe(true);
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          disabled: true
        }
      });
      
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      
      const customRadio = wrapper.find('div[class*="absolute"]');
      expect(customRadio.classes()).toContain('cursor-not-allowed');
    });

    it('applies required attribute', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          required: true
        }
      });
      
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });

    it('sets correct name attribute', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'radio-group',
          value: 'option1'
        }
      });
      
      expect(wrapper.find('input').attributes('name')).toBe('radio-group');
    });

    it('sets correct value attribute', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      expect(wrapper.find('input').attributes('value')).toBe('option1');
    });
  });

  describe('Validation', () => {
    it('shows error message', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          errorMessage: 'This field is required'
        }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toBe('This field is required');
      expect(errorElement.classes()).toContain('text-error-500');
    });

    it('applies error styling to radio', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          errorMessage: 'Error'
        }
      });
      
      const customRadio = wrapper.find('div[class*="absolute"]');
      expect(customRadio.classes()).toContain('border-error-300');
    });

    it('applies error styling to label', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Test',
          errorMessage: 'Error'
        }
      });
      
      const label = wrapper.find('label');
      expect(label.classes()).toContain('text-error-700');
    });
  });

  describe('Event Handling', () => {
    it('emits update:modelValue when selected', async () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          modelValue: null
        }
      });
      
      await wrapper.find('input').setChecked(true);
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['option1']);
      expect(wrapper.emitted('change')).toHaveLength(1);
    });

    it('emits focus event', async () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      await wrapper.find('input').trigger('focus');
      
      expect(wrapper.emitted('focus')).toHaveLength(1);
    });

    it('emits blur event', async () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      await wrapper.find('input').trigger('blur');
      
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          disabled: true
        }
      });
      
      // Try to trigger change event
      const input = wrapper.find('input');
      await input.trigger('change');
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID for radio', () => {
      const wrapper1 = mount(BaseRadio, { 
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Radio 1'
        }
      });
      const wrapper2 = mount(BaseRadio, { 
        props: { 
          name: 'test-radio',
          value: 'option2',
          label: 'Radio 2'
        }
      });
      
      const id1 = wrapper1.find('input').attributes('id');
      const id2 = wrapper2.find('input').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('associates label with radio', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          label: 'Test Radio'
        }
      });
      
      const input = wrapper.find('input');
      const label = wrapper.find('label');
      
      expect(input.attributes('id')).toBe(label.attributes('for'));
    });

    it('has proper ARIA attributes for error state', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          errorMessage: 'Error message'
        }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
    });
  });

  describe('Public Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      expect(wrapper.vm.focus).toBeDefined();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      expect(wrapper.vm.blur).toBeDefined();
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('exposes inputRef', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1'
        }
      });
      
      expect(wrapper.vm.inputRef).toBeDefined();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom classes to wrapper', () => {
      const wrapper = mount(BaseRadio, {
        props: { 
          name: 'test-radio',
          value: 'option1',
          class: 'custom-class'
        }
      });
      
      expect(wrapper.classes()).toContain('custom-class');
    });
  });

  describe('Radio Group Behavior', () => {
    it('maintains same name for radio group', () => {
      const wrapper1 = mount(BaseRadio, {
        props: { 
          name: 'radio-group',
          value: 'option1'
        }
      });
      
      const wrapper2 = mount(BaseRadio, {
        props: { 
          name: 'radio-group',
          value: 'option2'
        }
      });
      
      expect(wrapper1.find('input').attributes('name')).toBe('radio-group');
      expect(wrapper2.find('input').attributes('name')).toBe('radio-group');
    });
  });
});