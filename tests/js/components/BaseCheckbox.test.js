import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseCheckbox from '@/Components/Base/BaseCheckbox.vue';

describe('BaseCheckbox', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseCheckbox);
      
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
      expect(wrapper.classes()).toContain('base-checkbox-wrapper');
    });

    it('renders with label', () => {
      const wrapper = mount(BaseCheckbox, {
        props: { label: 'Test Checkbox' }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Test Checkbox');
    });
  });

  describe('Checkbox States', () => {
    it('handles boolean model value', () => {
      const wrapper = mount(BaseCheckbox, {
        props: { modelValue: true }
      });
      
      expect(wrapper.vm.isChecked).toBe(true);
    });

    it('handles array model value', () => {
      const wrapper = mount(BaseCheckbox, {
        props: { 
          modelValue: ['option1', 'option2'],
          value: 'option1'
        }
      });
      
      expect(wrapper.vm.isChecked).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('emits update:modelValue for boolean model', async () => {
      const wrapper = mount(BaseCheckbox, {
        props: { modelValue: false }
      });
      
      await wrapper.find('input').setChecked(true);
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true]);
    });

    it('emits update:modelValue for array model', async () => {
      const wrapper = mount(BaseCheckbox, {
        props: { 
          modelValue: [],
          value: 'option1'
        }
      });
      
      await wrapper.find('input').setChecked(true);
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([['option1']]);
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID for checkbox', () => {
      const wrapper1 = mount(BaseCheckbox, { props: { label: 'Checkbox 1' } });
      const wrapper2 = mount(BaseCheckbox, { props: { label: 'Checkbox 2' } });
      
      const id1 = wrapper1.find('input').attributes('id');
      const id2 = wrapper2.find('input').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });
});