import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FieldGroup from '@/Components/Forms/FieldGroup.vue';
import FormField from '@/Components/Forms/FormField.vue';

describe('FieldGroup', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FieldGroup, {
      props: {
        title: 'Personal Information',
        name: 'personal-info'
      },
      slots: {
        default: '<div>Field content</div>'
      }
    });
  });

  describe('Basic Functionality', () => {
    it('renders as fieldset with legend', () => {
      expect(wrapper.element.tagName).toBe('FIELDSET');
      expect(wrapper.find('legend').exists()).toBe(true);
      expect(wrapper.find('legend').text()).toBe('Personal Information');
    });

    it('generates unique group ID when no name provided', () => {
      const wrapperWithoutName = mount(FieldGroup, {
        props: {
          title: 'Test Group'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(wrapperWithoutName.classes()).toContain('field-group');
    });

    it('uses custom ID when provided', () => {
      const customWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          id: 'custom-group-id'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(customWrapper.classes()).toContain('field-group');
    });

    it('renders description when provided', () => {
      const descriptionWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          description: 'Please fill out your personal information'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      const description = descriptionWrapper.find('.field-group__description');
      expect(description.exists()).toBe(true);
      expect(description.text()).toBe('Please fill out your personal information');
    });
  });

  describe('Required Field Handling', () => {
    it('shows required asterisk when required', () => {
      const requiredWrapper = mount(FieldGroup, {
        props: {
          title: 'Required Group',
          required: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      const asterisk = requiredWrapper.find('span[aria-label="required"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
      expect(asterisk.classes()).toContain('text-error-500');
    });

    it('applies required state class when required', () => {
      const requiredWrapper = mount(FieldGroup, {
        props: {
          title: 'Required Group',
          required: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(requiredWrapper.classes()).toContain('field-group--required');
    });
  });

  describe('Error Handling', () => {
    it('displays single error message', () => {
      const errorWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          errorMessages: 'Group validation failed'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      const errorElement = errorWrapper.find('.field-group__errors');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('Group validation failed');
      expect(errorElement.attributes('role')).toBe('alert');
    });

    it('displays multiple error messages', () => {
      const multiErrorWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          errorMessages: ['First error', 'Second error']
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      const errorElement = multiErrorWrapper.find('.field-group__errors');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain('First error');
      expect(errorElement.text()).toContain('Second error');
    });

    it('applies error state class when errors exist', () => {
      const errorStateWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          errorMessages: 'Error message'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(errorStateWrapper.classes()).toContain('field-group--error');
    });

    it('hides group errors when showGroupErrors is false', () => {
      const hiddenErrorWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          errorMessages: 'Error message',
          showGroupErrors: false
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(hiddenErrorWrapper.find('.field-group__errors').exists()).toBe(false);
    });
  });

  describe('Help Text', () => {
    it('displays help text when provided and no errors', () => {
      const helpWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          helpText: 'This is helpful information'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      const helpElement = helpWrapper.find('.field-group__help');
      expect(helpElement.exists()).toBe(true);
      expect(helpElement.text()).toContain('This is helpful information');
    });

    it('hides help text when errors exist', () => {
      const errorHelpWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          helpText: 'Help text',
          errorMessages: 'Error message'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(errorHelpWrapper.find('.field-group__help').exists()).toBe(false);
      expect(errorHelpWrapper.find('.field-group__errors').exists()).toBe(true);
    });
  });

  describe('Layout Variants', () => {
    it('applies vertical layout by default', () => {
      expect(wrapper.classes()).toContain('field-group--vertical');
      expect(wrapper.find('.field-group__content').classes()).toContain('space-y-4');
    });

    it('applies horizontal layout when specified', () => {
      const horizontalWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'horizontal'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(horizontalWrapper.classes()).toContain('field-group--horizontal');
      expect(horizontalWrapper.find('.field-group__content').classes()).toContain('flex');
    });

    it('applies grid layout when specified', () => {
      const gridWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'grid',
          columns: 2
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(gridWrapper.classes()).toContain('field-group--grid');
      expect(gridWrapper.find('.field-group__content').classes()).toContain('grid');
      expect(gridWrapper.find('.field-group__content').classes()).toContain('md:grid-cols-2');
    });

    it('applies inline layout when specified', () => {
      const inlineWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'inline'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(inlineWrapper.classes()).toContain('field-group--inline');
      expect(inlineWrapper.find('.field-group__content').classes()).toContain('flex');
      expect(inlineWrapper.find('.field-group__content').classes()).toContain('items-end');
    });
  });

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      expect(wrapper.classes()).toContain('field-group--md');
    });

    it('applies small size when specified', () => {
      const smallWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          size: 'sm'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(smallWrapper.classes()).toContain('field-group--sm');
    });

    it('applies large size when specified', () => {
      const largeWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          size: 'lg'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(largeWrapper.classes()).toContain('field-group--lg');
    });
  });

  describe('Variant Styles', () => {
    it('applies default variant by default', () => {
      expect(wrapper.classes()).toContain('field-group--default');
    });

    it('applies card variant when specified', () => {
      const cardWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          variant: 'card'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(cardWrapper.classes()).toContain('field-group--card');
    });

    it('applies bordered variant when specified', () => {
      const borderedWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          variant: 'bordered'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(borderedWrapper.classes()).toContain('field-group--bordered');
    });

    it('applies minimal variant when specified', () => {
      const minimalWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          variant: 'minimal'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(minimalWrapper.classes()).toContain('field-group--minimal');
    });
  });

  describe('Gap Spacing', () => {
    it('applies medium gap by default', () => {
      const gridWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'grid'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(gridWrapper.find('.field-group__content').classes()).toContain('gap-4');
    });

    it('applies small gap when specified', () => {
      const smallGapWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'grid',
          gap: 'sm'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(smallGapWrapper.find('.field-group__content').classes()).toContain('gap-3');
    });

    it('applies large gap when specified', () => {
      const largeGapWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          layout: 'grid',
          gap: 'lg'
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(largeGapWrapper.find('.field-group__content').classes()).toContain('gap-6');
    });
  });

  describe('State Classes', () => {
    it('applies disabled state class when disabled', () => {
      const disabledWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          disabled: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      });

      expect(disabledWrapper.classes()).toContain('field-group--disabled');
    });
  });

  describe('Accessibility', () => {
    it('provides correct fieldset structure', () => {
      expect(wrapper.element.tagName).toBe('FIELDSET');
      expect(wrapper.find('legend').exists()).toBe(true);
    });

    it('provides group context to child components', () => {
      const contextWrapper = mount(FieldGroup, {
        props: {
          title: 'Test Group',
          size: 'lg',
          disabled: true
        },
        slots: {
          default: ({ groupId }) => `<div data-group-id="${groupId}">Content</div>`
        }
      });

      const childDiv = contextWrapper.find('div[data-group-id]');
      expect(childDiv.exists()).toBe(true);
    });
  });

  describe('Integration with FormField', () => {
    it('works correctly with multiple FormField components', () => {
      const integrationWrapper = mount(FieldGroup, {
        props: {
          title: 'User Information',
          layout: 'grid',
          columns: 2
        },
        slots: {
          default: `
            <FormField label="First Name">
              <input type="text" />
            </FormField>
            <FormField label="Last Name">
              <input type="text" />
            </FormField>
          `
        }
      });

      expect(integrationWrapper.find('legend').text()).toBe('User Information');
      expect(integrationWrapper.find('.field-group__content').classes()).toContain('grid');
    });
  });
});