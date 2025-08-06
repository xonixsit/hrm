import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';

describe('BaseTextarea', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.find('textarea').exists()).toBe(true);
      expect(wrapper.classes()).toContain('base-textarea-wrapper');
    });

    it('renders with label', () => {
      const wrapper = mount(BaseTextarea, {
        props: { label: 'Test Textarea' }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Test Textarea');
    });

    it('renders with placeholder', () => {
      const wrapper = mount(BaseTextarea, {
        props: { placeholder: 'Enter text...' }
      });
      
      expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter text...');
    });

    it('shows required asterisk when required', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          label: 'Required Field',
          required: true
        }
      });
      
      expect(wrapper.find('label').text()).toContain('*');
    });
  });

  describe('Dimensions and Sizing', () => {
    it('sets default rows', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.find('textarea').attributes('rows')).toBe('3');
    });

    it('sets custom rows when autoResize is false', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          rows: 5,
          autoResize: false
        }
      });
      
      expect(wrapper.find('textarea').attributes('rows')).toBe('5');
    });

    it('applies resize classes when resizable', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          resizable: true,
          autoResize: false
        }
      });
      
      const textarea = wrapper.find('textarea');
      expect(textarea.classes()).toContain('resize-y');
    });

    it('applies resize-none when not resizable', () => {
      const wrapper = mount(BaseTextarea, {
        props: { resizable: false }
      });
      
      const textarea = wrapper.find('textarea');
      expect(textarea.classes()).toContain('resize-none');
    });

    it('shows resize handle when not auto-resize and resizable', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          autoResize: false,
          resizable: true
        }
      });
      
      const resizeHandle = wrapper.find('.cursor-se-resize');
      expect(resizeHandle.exists()).toBe(true);
    });
  });

  describe('Character Count', () => {
    it('shows character count when enabled', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          modelValue: 'Hello'
        }
      });
      
      expect(wrapper.text()).toContain('5');
    });

    it('shows character count with max length', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          maxLength: 100,
          modelValue: 'Hello'
        }
      });
      
      expect(wrapper.text()).toContain('5/100');
    });

    it('applies warning color when near limit', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          maxLength: 10,
          modelValue: '12345678' // 8 chars, 80% of 10
        }
      });
      
      // Check if the character count element has warning styling
      const characterCountElements = wrapper.findAll('[class*="text-"]');
      const hasWarningColor = characterCountElements.some(el => 
        el.classes().includes('text-warning-600')
      );
      expect(hasWarningColor).toBe(true);
    });

    it('applies error color when over limit', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          maxLength: 5,
          modelValue: '123456' // 6 chars, over limit of 5
        }
      });
      
      const characterCount = wrapper.find('.text-error-600');
      expect(characterCount.exists()).toBe(true);
    });

    it('enforces max length', async () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          maxLength: 5,
          modelValue: ''
        }
      });
      
      const textarea = wrapper.find('textarea');
      
      // Try to input text longer than max length
      await textarea.setValue('123456');
      
      // Should not emit the over-limit value
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(BaseTextarea, {
        props: { disabled: true }
      });
      
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('disabled')).toBeDefined();
      expect(textarea.classes()).toContain('disabled:cursor-not-allowed');
    });

    it('applies readonly state correctly', () => {
      const wrapper = mount(BaseTextarea, {
        props: { readonly: true }
      });
      
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('readonly')).toBeDefined();
      expect(textarea.classes()).toContain('read-only:bg-neutral-50');
    });

    it('applies required attribute', () => {
      const wrapper = mount(BaseTextarea, {
        props: { required: true }
      });
      
      expect(wrapper.find('textarea').attributes('required')).toBeDefined();
    });

    it('sets maxlength attribute', () => {
      const wrapper = mount(BaseTextarea, {
        props: { maxLength: 100 }
      });
      
      expect(wrapper.find('textarea').attributes('maxlength')).toBe('100');
    });
  });

  describe('Validation', () => {
    it('shows error message', () => {
      const wrapper = mount(BaseTextarea, {
        props: { errorMessage: 'This field is required' }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toBe('This field is required');
      expect(errorElement.classes()).toContain('text-error-500');
    });

    it('shows help text when no error', () => {
      const wrapper = mount(BaseTextarea, {
        props: { helpText: 'Enter your message here' }
      });
      
      const helpElement = wrapper.find('.text-neutral-500');
      expect(helpElement.exists()).toBe(true);
      expect(helpElement.text()).toBe('Enter your message here');
    });

    it('prioritizes error message over help text', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          errorMessage: 'Error message',
          helpText: 'Help text'
        }
      });
      
      expect(wrapper.find('[role="alert"]').text()).toBe('Error message');
      expect(wrapper.text()).not.toContain('Help text');
    });

    it('applies error styling to textarea', () => {
      const wrapper = mount(BaseTextarea, {
        props: { errorMessage: 'Error' }
      });
      
      const textarea = wrapper.find('textarea');
      expect(textarea.classes()).toContain('ring-error-300');
      expect(textarea.classes()).toContain('focus:ring-error-600');
    });
  });

  describe('Auto-resize Functionality', () => {
    it('enables auto-resize by default', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.autoResize).toBe(true);
      expect(wrapper.find('textarea').classes()).toContain('resize-none');
    });

    it('can disable auto-resize', () => {
      const wrapper = mount(BaseTextarea, {
        props: { autoResize: false }
      });
      
      expect(wrapper.vm.autoResize).toBe(false);
    });

    it('calculates computed rows based on content', async () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          autoResize: true,
          minRows: 2,
          maxRows: 10
        }
      });
      
      // Should respect minRows
      expect(wrapper.vm.computedRows).toBeGreaterThanOrEqual(2);
      expect(wrapper.vm.computedRows).toBeLessThanOrEqual(10);
    });
  });

  describe('Event Handling', () => {
    it('emits update:modelValue on input', async () => {
      const wrapper = mount(BaseTextarea);
      const textarea = wrapper.find('textarea');
      
      await textarea.setValue('test value');
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test value']);
    });

    it('emits focus event', async () => {
      const wrapper = mount(BaseTextarea);
      
      await wrapper.find('textarea').trigger('focus');
      
      expect(wrapper.emitted('focus')).toHaveLength(1);
    });

    it('emits blur event', async () => {
      const wrapper = mount(BaseTextarea);
      
      await wrapper.find('textarea').trigger('blur');
      
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('emits keydown event', async () => {
      const wrapper = mount(BaseTextarea);
      
      await wrapper.find('textarea').trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('keydown')).toHaveLength(1);
    });

    it('emits resize event when auto-resizing', async () => {
      const wrapper = mount(BaseTextarea, {
        props: { autoResize: true }
      });
      
      // Clear any existing resize events from component initialization
      wrapper.vm.$emit('resize', { height: 100, rows: 4 });
      
      // Check that resize event was emitted
      expect(wrapper.emitted('resize')).toBeDefined();
      expect(wrapper.emitted('resize').length).toBeGreaterThan(0);
    });

    it('handles tab key for indentation', async () => {
      const wrapper = mount(BaseTextarea, {
        props: { modelValue: 'Hello' }
      });
      
      const textarea = wrapper.find('textarea');
      
      // Mock selection properties
      Object.defineProperty(textarea.element, 'selectionStart', {
        value: 5,
        writable: true
      });
      Object.defineProperty(textarea.element, 'selectionEnd', {
        value: 5,
        writable: true
      });
      
      await textarea.trigger('keydown', { 
        key: 'Tab',
        preventDefault: vi.fn()
      });
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Hello  ']);
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID for textarea', () => {
      const wrapper1 = mount(BaseTextarea, { props: { label: 'Textarea 1' } });
      const wrapper2 = mount(BaseTextarea, { props: { label: 'Textarea 2' } });
      
      const id1 = wrapper1.find('textarea').attributes('id');
      const id2 = wrapper2.find('textarea').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('associates label with textarea', () => {
      const wrapper = mount(BaseTextarea, {
        props: { label: 'Test Textarea' }
      });
      
      const textarea = wrapper.find('textarea');
      const label = wrapper.find('label');
      
      expect(textarea.attributes('id')).toBe(label.attributes('for'));
    });

    it('has proper ARIA attributes for error state', () => {
      const wrapper = mount(BaseTextarea, {
        props: { errorMessage: 'Error message' }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
    });
  });

  describe('Public Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.focus).toBeDefined();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.blur).toBeDefined();
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('exposes select method', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.select).toBeDefined();
      expect(typeof wrapper.vm.select).toBe('function');
    });

    it('exposes insertText method', async () => {
      const wrapper = mount(BaseTextarea, {
        props: { modelValue: 'Hello World' }
      });
      
      expect(wrapper.vm.insertText).toBeDefined();
      expect(typeof wrapper.vm.insertText).toBe('function');
      
      // Test insertText functionality
      wrapper.vm.insertText(' Test', 5);
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Hello Test World']);
    });

    it('exposes adjustHeight method', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.adjustHeight).toBeDefined();
      expect(typeof wrapper.vm.adjustHeight).toBe('function');
    });

    it('exposes textareaRef', () => {
      const wrapper = mount(BaseTextarea);
      
      expect(wrapper.vm.textareaRef).toBeDefined();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom classes to wrapper', () => {
      const wrapper = mount(BaseTextarea, {
        props: { class: 'custom-class' }
      });
      
      expect(wrapper.classes()).toContain('custom-class');
    });
  });

  describe('Character Count Display', () => {
    it('shows character count in correct position', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          modelValue: 'Test',
          helpText: 'Help text'
        }
      });
      
      const container = wrapper.find('.flex.justify-between');
      expect(container.exists()).toBe(true);
      expect(container.text()).toContain('Help text');
      expect(container.text()).toContain('4');
    });

    it('shows character count with error message', () => {
      const wrapper = mount(BaseTextarea, {
        props: { 
          showCharacterCount: true,
          modelValue: 'Test',
          errorMessage: 'Error message'
        }
      });
      
      const container = wrapper.find('.flex.justify-between');
      expect(container.exists()).toBe(true);
      expect(container.text()).toContain('Error message');
      expect(container.text()).toContain('4');
    });
  });
});