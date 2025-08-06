import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';

describe('FormField', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FormField, {
      props: {
        label: 'Test Field',
        name: 'test-field'
      },
      slots: {
        default: '<input type="text" />'
      }
    });
  });

  describe('Basic Functionality', () => {
    it('renders correctly with label', () => {
      expect(wrapper.find('label').text()).toBe('Test Field');
      expect(wrapper.find('label').attributes('for')).toMatch(/^field-test-field$/);
    });

    it('generates unique field ID when no name provided', () => {
      const wrapperWithoutName = mount(FormField, {
        props: {
          label: 'Test Field'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const fieldId = wrapperWithoutName.find('label').attributes('for');
      expect(fieldId).toMatch(/^field-/);
      expect(fieldId.length).toBeGreaterThan(6);
    });

    it('uses custom ID when provided', () => {
      const customWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          id: 'custom-field-id'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(customWrapper.find('label').attributes('for')).toBe('custom-field-id');
    });
  });

  describe('Required Field Handling', () => {
    it('shows required asterisk when required', () => {
      const requiredWrapper = mount(FormField, {
        props: {
          label: 'Required Field',
          required: true
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const asterisk = requiredWrapper.find('span[aria-label="required"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
      expect(asterisk.classes()).toContain('text-error-500');
    });

    it('shows optional text when optional', () => {
      const optionalWrapper = mount(FormField, {
        props: {
          label: 'Optional Field',
          optional: true
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const optionalText = optionalWrapper.find('span.text-neutral-400');
      expect(optionalText.exists()).toBe(true);
      expect(optionalText.text()).toBe('(optional)');
    });

    it('does not show optional text when field is required', () => {
      const requiredOptionalWrapper = mount(FormField, {
        props: {
          label: 'Field',
          required: true,
          optional: true
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const optionalText = requiredOptionalWrapper.find('span.text-neutral-400');
      expect(optionalText.exists()).toBe(false);
    });
  });

  describe('Help Text and Error Messages', () => {
    it('displays help text when provided', () => {
      const helpWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          helpText: 'This is helpful information'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const helpElement = helpWrapper.find('.field-help');
      expect(helpElement.exists()).toBe(true);
      expect(helpElement.text()).toContain('This is helpful information');
      expect(helpElement.attributes('id')).toMatch(/field-.*-help/);
    });

    it('displays error message when provided', () => {
      const errorWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          errorMessage: 'This field is required'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const errorElement = errorWrapper.find('.field-error');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('This field is required');
      expect(errorElement.attributes('role')).toBe('alert');
      expect(errorElement.attributes('aria-live')).toBe('polite');
    });

    it('handles array of error messages', () => {
      const multiErrorWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          errorMessage: ['First error', 'Second error']
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const errorElement = multiErrorWrapper.find('.field-error');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('First error');
    });

    it('prioritizes error message over help text', () => {
      const errorHelpWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          helpText: 'Help text',
          errorMessage: 'Error message'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(errorHelpWrapper.find('.field-error').exists()).toBe(true);
      expect(errorHelpWrapper.find('.field-help').exists()).toBe(false);
    });

    it('displays success message when provided', () => {
      const successWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          successMessage: 'Field is valid'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      const successElement = successWrapper.find('.field-success');
      expect(successElement.exists()).toBe(true);
      expect(successElement.text()).toContain('Field is valid');
      expect(successElement.attributes('role')).toBe('status');
    });
  });

  describe('Layout Variants', () => {
    it('applies vertical layout by default', () => {
      expect(wrapper.classes()).toContain('form-field--vertical');
    });

    it('applies horizontal layout when specified', () => {
      const horizontalWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          layout: 'horizontal'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(horizontalWrapper.classes()).toContain('form-field--horizontal');
    });

    it('applies inline layout when specified', () => {
      const inlineWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          layout: 'inline'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(inlineWrapper.classes()).toContain('form-field--inline');
    });
  });

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      expect(wrapper.classes()).toContain('form-field--md');
    });

    it('applies small size when specified', () => {
      const smallWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          size: 'sm'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(smallWrapper.classes()).toContain('form-field--sm');
    });

    it('applies large size when specified', () => {
      const largeWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          size: 'lg'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(largeWrapper.classes()).toContain('form-field--lg');
    });
  });

  describe('Accessibility', () => {
    it('provides correct aria-describedby to slot', () => {
      const accessibilityWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          helpText: 'Help text',
          name: 'test'
        },
        slots: {
          default: ({ ariaDescribedBy }) => `<input aria-describedby="${ariaDescribedBy}" />`
        }
      });

      const input = accessibilityWrapper.find('input');
      expect(input.attributes('aria-describedby')).toMatch(/field-test-help/);
    });

    it('includes error ID in aria-describedby when error exists', () => {
      const errorAccessibilityWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          errorMessage: 'Error message',
          name: 'test'
        },
        slots: {
          default: ({ ariaDescribedBy }) => `<input aria-describedby="${ariaDescribedBy}" />`
        }
      });

      const input = errorAccessibilityWrapper.find('input');
      expect(input.attributes('aria-describedby')).toMatch(/field-test-error/);
    });

    it('provides field context to child components', () => {
      const contextWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          required: true,
          errorMessage: 'Error',
          size: 'lg'
        },
        slots: {
          default: ({ fieldId, hasError, errorMessage }) => 
            `<div data-field-id="${fieldId}" data-has-error="${hasError}" data-error="${errorMessage}"></div>`
        }
      });

      const childDiv = contextWrapper.find('div[data-field-id]');
      expect(childDiv.attributes('data-has-error')).toBe('true');
      expect(childDiv.attributes('data-error')).toBe('Error');
    });
  });

  describe('State Classes', () => {
    it('applies error state class when error exists', () => {
      const errorStateWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          errorMessage: 'Error message'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(errorStateWrapper.classes()).toContain('form-field--error');
    });

    it('applies success state class when success message exists', () => {
      const successStateWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          successMessage: 'Success message'
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(successStateWrapper.classes()).toContain('form-field--success');
    });

    it('applies disabled state class when disabled', () => {
      const disabledStateWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          disabled: true
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(disabledStateWrapper.classes()).toContain('form-field--disabled');
    });

    it('applies required state class when required', () => {
      const requiredStateWrapper = mount(FormField, {
        props: {
          label: 'Test Field',
          required: true
        },
        slots: {
          default: '<input type="text" />'
        }
      });

      expect(requiredStateWrapper.classes()).toContain('form-field--required');
    });
  });

  describe('Integration with BaseInput', () => {
    it('works correctly with BaseInput component', () => {
      const inputWrapper = mount(FormField, {
        props: {
          label: 'Email Address',
          helpText: 'Enter your email',
          required: true
        },
        slots: {
          default: ({ fieldId, ariaDescribedBy }) => 
            mount(BaseInput, {
              props: {
                id: fieldId,
                type: 'email',
                placeholder: 'email@example.com'
              },
              attrs: {
                'aria-describedby': ariaDescribedBy
              }
            }).html()
        }
      });

      expect(inputWrapper.find('label').exists()).toBe(true);
      expect(inputWrapper.find('input[type="email"]').exists()).toBe(true);
      expect(inputWrapper.find('.field-help').exists()).toBe(true);
    });
  });
});