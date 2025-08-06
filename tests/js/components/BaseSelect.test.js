import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseSelect from '@/Components/Base/BaseSelect.vue';

describe('BaseSelect', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  const stringOptions = ['Apple', 'Banana', 'Cherry'];

  beforeEach(() => {
    // Mock document methods for click outside handling
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.classes()).toContain('base-select-wrapper');
    });

    it('renders with label', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          label: 'Select Option'
        }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Select Option');
    });

    it('shows placeholder when no value selected', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          placeholder: 'Choose an option...'
        }
      });
      
      expect(wrapper.find('button span').text()).toBe('Choose an option...');
    });

    it('shows required asterisk when required', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          label: 'Required Field',
          required: true
        }
      });
      
      expect(wrapper.find('label').text()).toContain('*');
    });
  });

  describe('Options Handling', () => {
    it('works with object options', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          modelValue: 'option1'
        }
      });
      
      expect(wrapper.find('button span').text()).toBe('Option 1');
    });

    it('works with string options', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: stringOptions,
          modelValue: 'Apple'
        }
      });
      
      expect(wrapper.find('button span').text()).toBe('Apple');
    });

    it('uses custom option label and value keys', () => {
      const customOptions = [
        { name: 'First', id: 1 },
        { name: 'Second', id: 2 }
      ];

      const wrapper = mount(BaseSelect, {
        props: { 
          options: customOptions,
          optionLabel: 'name',
          optionValue: 'id',
          modelValue: 1
        }
      });
      
      expect(wrapper.find('button span').text()).toBe('First');
    });
  });

  describe('Dropdown Behavior', () => {
    it('opens dropdown when button clicked', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
      expect(wrapper.emitted('open')).toHaveLength(1);
    });

    it('closes dropdown when option selected', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      // Open dropdown
      await wrapper.find('button').trigger('click');
      
      // Select option
      const options = wrapper.findAll('[role="option"]');
      await options[0].trigger('click');
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('shows chevron rotation when open', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      const chevron = wrapper.find('svg');
      expect(chevron.classes()).not.toContain('rotate-180');
      
      await wrapper.find('button').trigger('click');
      
      expect(chevron.classes()).toContain('rotate-180');
    });
  });

  describe('Selection', () => {
    it('emits update:modelValue when option selected', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('click');
      const options = wrapper.findAll('[role="option"]');
      await options[1].trigger('click');
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['option2']);
      expect(wrapper.emitted('change')).toHaveLength(1);
    });

    it('shows selected option with checkmark', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          modelValue: 'option1'
        }
      });
      
      await wrapper.find('button').trigger('click');
      
      const selectedOption = wrapper.find('[aria-selected="true"]');
      expect(selectedOption.exists()).toBe(true);
      expect(selectedOption.find('svg').exists()).toBe(true); // Checkmark
    });
  });

  describe('Multiple Selection', () => {
    it('handles multiple selection', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          multiple: true,
          modelValue: []
        }
      });
      
      await wrapper.find('button').trigger('click');
      const options = wrapper.findAll('[role="option"]');
      await options[0].trigger('click');
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([['option1']]);
    });

    it('shows multiple selection count', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          multiple: true,
          modelValue: ['option1', 'option2']
        }
      });
      
      expect(wrapper.find('button span').text()).toBe('2 items selected');
    });

    it('keeps dropdown open in multiple mode', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          multiple: true,
          modelValue: []
        }
      });
      
      await wrapper.find('button').trigger('click');
      const options = wrapper.findAll('[role="option"]');
      await options[0].trigger('click');
      
      // Dropdown should remain open
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          searchable: true
        }
      });
      
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    });

    it('filters options based on search query', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          searchable: true
        }
      });
      
      await wrapper.find('button').trigger('click');
      const searchInput = wrapper.find('input[type="text"]');
      await searchInput.setValue('Option 1');
      
      const visibleOptions = wrapper.findAll('[role="option"]');
      expect(visibleOptions).toHaveLength(1);
      expect(visibleOptions[0].text()).toContain('Option 1');
    });

    it('shows no results message when no matches', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          searchable: true,
          noResultsText: 'No matches found'
        }
      });
      
      await wrapper.find('button').trigger('click');
      const searchInput = wrapper.find('input[type="text"]');
      await searchInput.setValue('xyz');
      
      expect(wrapper.text()).toContain('No matches found');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('opens dropdown with Space key', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('keydown', { key: ' ' });
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('closes dropdown with Escape key', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('click');
      await wrapper.find('button').trigger('keydown', { key: 'Escape' });
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });

    it('navigates options with arrow keys', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('click');
      await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' });
      
      // Should highlight first option
      expect(wrapper.vm.highlightedIndex).toBe(0);
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          disabled: true
        }
      });
      
      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.classes()).toContain('cursor-not-allowed');
    });

    it('does not open when disabled', async () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          disabled: true
        }
      });
      
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });
  });

  describe('Validation', () => {
    it('shows error message', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          errorMessage: 'Please select an option'
        }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toBe('Please select an option');
    });

    it('shows help text when no error', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          helpText: 'Choose your preferred option'
        }
      });
      
      const helpElement = wrapper.find('.text-neutral-500');
      expect(helpElement.exists()).toBe(true);
      expect(helpElement.text()).toBe('Choose your preferred option');
    });

    it('applies error styling', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          errorMessage: 'Error'
        }
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('ring-error-300');
    });
  });

  describe('Icons', () => {
    const MockIcon = { template: '<div class="mock-icon"></div>' };

    it('renders left icon', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          iconLeft: MockIcon
        }
      });
      
      expect(wrapper.find('.mock-icon').exists()).toBe(true);
      expect(wrapper.find('button').classes()).toContain('pl-10');
    });

    it('renders option icons', async () => {
      const optionsWithIcons = [
        { label: 'Option 1', value: 'option1', icon: MockIcon }
      ];

      const wrapper = mount(BaseSelect, {
        props: { options: optionsWithIcons }
      });
      
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.find('.mock-icon').exists()).toBe(true);
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          size: 'sm'
        }
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('h-8');
      expect(button.classes()).toContain('text-sm');
    });

    it('applies large size classes', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          size: 'lg'
        }
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('h-12');
      expect(button.classes()).toContain('text-lg');
    });
  });

  describe('Public Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      expect(wrapper.vm.focus).toBeDefined();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes open and close methods', () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      expect(wrapper.vm.open).toBeDefined();
      expect(wrapper.vm.close).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID for select', () => {
      const wrapper1 = mount(BaseSelect, { 
        props: { options: mockOptions, label: 'Select 1' }
      });
      const wrapper2 = mount(BaseSelect, { 
        props: { options: mockOptions, label: 'Select 2' }
      });
      
      const id1 = wrapper1.find('button').attributes('id');
      const id2 = wrapper2.find('button').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('associates label with button', () => {
      const wrapper = mount(BaseSelect, {
        props: { 
          options: mockOptions,
          label: 'Test Select'
        }
      });
      
      const button = wrapper.find('button');
      const label = wrapper.find('label');
      
      expect(button.attributes('id')).toBe(label.attributes('for'));
    });

    it('has proper ARIA attributes', async () => {
      const wrapper = mount(BaseSelect, {
        props: { options: mockOptions }
      });
      
      await wrapper.find('button').trigger('click');
      
      const listbox = wrapper.find('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      
      expect(listbox.exists()).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      
      options.forEach(option => {
        expect(option.attributes('aria-selected')).toBeDefined();
      });
    });
  });
});