import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from '@/Components/Base/BaseInput.vue';
import FormField from '@/Components/Forms/FormField.vue';

describe('BaseInput Enhanced Integration', () => {
  describe('Standalone Usage', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(BaseInput, {
        props: {
          label: 'Email Address',
          modelValue: '',
          type: 'email'
        }
      });
    });

    it('renders correctly when used standalone', () => {
      expect(wrapper.find('label').text()).toBe('Email Address');
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    });

    it('shows help text when provided', () => {
      const helpWrapper = mount(BaseInput, {
        props: {
          label: 'Email',
          helpText: 'Enter your email address'
        }
      });

      expect(helpWrapper.find('.text-neutral-500').text()).toBe('Enter your email address');
    });

    it('shows error message when provided', () => {
      const errorWrapper = mount(BaseInput, {
        props: {
          label: 'Email',
          errorMessage: 'Email is required'
        }
      });

      expect(errorWrapper.find('.text-error-500').text()).toBe('Email is required');
    });
  });

  describe('FormField Integration', () => {
    it('integrates correctly with FormField wrapper', () => {
      const integratedWrapper = mount(FormField, {
        props: {
          label: 'Email Address',
          helpText: 'Enter your email',
          errorMessage: 'Email is required',
          required: true,
          size: 'lg'
        },
        slots: {
          default: ({ fieldId, ariaDescribedBy }) => 
            mount(BaseInput, {
              props: {
                type: 'email',
                placeholder: 'email@example.com'
              },
              attrs: {
                id: fieldId,
                'aria-describedby': ariaDescribedBy
              }
            }).html()
        }
      });

      // Check that FormField provides the structure
      expect(integratedWrapper.find('label').text()).toContain('Email Address');
      expect(integratedWrapper.find('span[aria-label="required"]').exists()).toBe(true);
      expect(integratedWrapper.find('.field-error').text()).toContain('Email is required');
      
      // Check that BaseInput receives the correct props
      expect(integratedWrapper.find('input[type="email"]').exists()).toBe(true);
      expect(integratedWrapper.find('input').attributes('placeholder')).toBe('email@example.com');
    });

    it('uses field context when wrapped in FormField', () => {
      // Create a custom component that uses BaseInput with field context
      const TestComponent = {
        template: `
          <FormField 
            :label="label" 
            :error-message="errorMessage" 
            :help-text="helpText"
            :required="required"
            :disabled="disabled"
            :size="size"
          >
            <BaseInput 
              v-model="value" 
              :type="type" 
              :placeholder="placeholder"
            />
          </FormField>
        `,
        components: { FormField, BaseInput },
        props: {
          label: String,
          errorMessage: String,
          helpText: String,
          required: Boolean,
          disabled: Boolean,
          size: String,
          type: String,
          placeholder: String,
          value: String
        }
      };

      const contextWrapper = mount(TestComponent, {
        props: {
          label: 'Test Field',
          errorMessage: 'Field error',
          helpText: 'Field help',
          required: true,
          disabled: false,
          size: 'lg',
          type: 'text',
          placeholder: 'Enter text',
          value: ''
        }
      });

      // BaseInput should not show its own help/error text when wrapped
      const baseInputWrapper = contextWrapper.findComponent(BaseInput);
      expect(baseInputWrapper.find('.text-neutral-500').exists()).toBe(false); // No help text in BaseInput
      expect(baseInputWrapper.find('.text-error-500').exists()).toBe(false); // No error text in BaseInput
      
      // FormField should show the help/error text
      expect(contextWrapper.find('.field-error').exists()).toBe(true);
      expect(contextWrapper.find('.field-error').text()).toContain('Field error');
    });

    it('inherits size from field context', () => {
      const TestComponent = {
        template: `
          <FormField size="lg">
            <BaseInput v-model="value" />
          </FormField>
        `,
        components: { FormField, BaseInput },
        data() {
          return { value: '' };
        }
      };

      const sizeWrapper = mount(TestComponent);
      const input = sizeWrapper.find('input');
      
      // Should have large size classes
      expect(input.classes()).toContain('h-12'); // Large height
      expect(input.classes()).toContain('px-4'); // Large padding
    });

    it('inherits required state from field context', () => {
      const TestComponent = {
        template: `
          <FormField required>
            <BaseInput v-model="value" />
          </FormField>
        `,
        components: { FormField, BaseInput },
        data() {
          return { value: '' };
        }
      };

      const requiredWrapper = mount(TestComponent);
      const input = requiredWrapper.find('input');
      
      expect(input.attributes('required')).toBeDefined();
    });

    it('inherits disabled state from field context', () => {
      const TestComponent = {
        template: `
          <FormField disabled>
            <BaseInput v-model="value" />
          </FormField>
        `,
        components: { FormField, BaseInput },
        data() {
          return { value: '' };
        }
      };

      const disabledWrapper = mount(TestComponent);
      const input = disabledWrapper.find('input');
      
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.classes()).toContain('bg-neutral-50'); // Disabled styling
    });

    it('inherits error state from field context', () => {
      const TestComponent = {
        template: `
          <FormField error-message="Field is invalid">
            <BaseInput v-model="value" />
          </FormField>
        `,
        components: { FormField, BaseInput },
        data() {
          return { value: '' };
        }
      };

      const errorWrapper = mount(TestComponent);
      const input = errorWrapper.find('input');
      
      expect(input.classes()).toContain('ring-error-300'); // Error styling
      expect(input.classes()).toContain('bg-error-50'); // Error background
    });

    it('uses correct aria-describedby from field context', () => {
      const TestComponent = {
        template: `
          <FormField 
            name="test-field"
            help-text="Help text"
            error-message="Error message"
          >
            <BaseInput v-model="value" />
          </FormField>
        `,
        components: { FormField, BaseInput },
        data() {
          return { value: '' };
        }
      };

      const ariaWrapper = mount(TestComponent);
      const input = ariaWrapper.find('input');
      
      // Should reference the error element since error takes precedence
      expect(input.attributes('aria-describedby')).toMatch(/field-test-field-error/);
    });
  });

  describe('Accessibility Enhancements', () => {
    it('maintains accessibility when used with FormField', () => {
      const accessibilityWrapper = mount(FormField, {
        props: {
          label: 'Password',
          helpText: 'Must be at least 8 characters',
          required: true,
          name: 'password'
        },
        slots: {
          default: ({ fieldId, ariaDescribedBy }) => 
            mount(BaseInput, {
              props: {
                type: 'password'
              },
              attrs: {
                id: fieldId,
                'aria-describedby': ariaDescribedBy
              }
            }).html()
        }
      });

      const label = accessibilityWrapper.find('label');
      const input = accessibilityWrapper.find('input');
      const helpText = accessibilityWrapper.find('.field-help');

      // Label should be associated with input
      expect(label.attributes('for')).toBe(input.attributes('id'));
      
      // Input should be described by help text
      expect(input.attributes('aria-describedby')).toBe(helpText.attributes('id'));
      
      // Required indicator should be present
      expect(label.find('span[aria-label="required"]').exists()).toBe(true);
    });

    it('announces errors properly with screen readers', () => {
      const errorWrapper = mount(FormField, {
        props: {
          label: 'Email',
          errorMessage: 'Invalid email format',
          name: 'email'
        },
        slots: {
          default: ({ fieldId, ariaDescribedBy }) => 
            mount(BaseInput, {
              props: {
                type: 'email'
              },
              attrs: {
                id: fieldId,
                'aria-describedby': ariaDescribedBy
              }
            }).html()
        }
      });

      const errorElement = errorWrapper.find('.field-error');
      const input = errorWrapper.find('input');

      expect(errorElement.attributes('role')).toBe('alert');
      expect(errorElement.attributes('aria-live')).toBe('polite');
      expect(input.attributes('aria-describedby')).toBe(errorElement.attributes('id'));
    });
  });

  describe('Floating Label Integration', () => {
    it('works with floating labels in FormField context', () => {
      const floatingWrapper = mount(FormField, {
        props: {
          variant: 'floating'
        },
        slots: {
          default: ({ fieldId }) => 
            mount(BaseInput, {
              props: {
                floatingLabel: true,
                placeholder: 'Enter your name'
              },
              attrs: {
                id: fieldId
              }
            }).html()
        }
      });

      expect(floatingWrapper.classes()).toContain('form-field--floating');
    });
  });
});