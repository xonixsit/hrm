import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterChip from '@/Components/Search/FilterChip.vue';

// Mock Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name'],
    template: '<span :data-icon="name"></span>'
  }
}));

describe('FilterChip', () => {
  let wrapper;

  const defaultProps = {
    value: 'test-value'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(FilterChip, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Icon: true
        }
      }
    });
  };

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.filter-chip').exists()).toBe(true);
      expect(wrapper.text()).toContain('test-value');
    });

    it('displays label when provided', () => {
      wrapper = createWrapper({ label: 'Category' });
      
      expect(wrapper.text()).toContain('Category:');
      expect(wrapper.text()).toContain('test-value');
    });

    it('shows icon when provided', () => {
      wrapper = createWrapper({ icon: 'filter' });
      
      expect(wrapper.find('[data-icon="filter"]').exists()).toBe(true);
    });

    it('shows remove button by default', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.filter-remove-btn').exists()).toBe(true);
      expect(wrapper.find('[data-icon="x"]').exists()).toBe(true);
    });

    it('hides remove button when removable is false', () => {
      wrapper = createWrapper({ removable: false });
      
      expect(wrapper.find('.filter-remove-btn').exists()).toBe(false);
    });

    it('hides remove button when disabled', () => {
      wrapper = createWrapper({ disabled: true });
      
      expect(wrapper.find('.filter-remove-btn').exists()).toBe(false);
    });
  });

  describe('Value Display', () => {
    it('displays string values correctly', () => {
      wrapper = createWrapper({ value: 'Simple String' });
      
      expect(wrapper.text()).toContain('Simple String');
    });

    it('displays number values correctly', () => {
      wrapper = createWrapper({ value: 42 });
      
      expect(wrapper.text()).toContain('42');
    });

    it('displays single array item correctly', () => {
      wrapper = createWrapper({ value: ['Single Item'] });
      
      expect(wrapper.text()).toContain('Single Item');
    });

    it('displays multiple array items count', () => {
      wrapper = createWrapper({ value: ['Item 1', 'Item 2', 'Item 3'] });
      
      expect(wrapper.text()).toContain('3 items');
    });

    it('displays empty array as "None"', () => {
      wrapper = createWrapper({ value: [] });
      
      expect(wrapper.text()).toContain('None');
    });

    it('displays object with label property', () => {
      wrapper = createWrapper({ value: { label: 'Object Label', id: 1 } });
      
      expect(wrapper.text()).toContain('Object Label');
    });

    it('displays object with name property', () => {
      wrapper = createWrapper({ value: { name: 'Object Name', id: 1 } });
      
      expect(wrapper.text()).toContain('Object Name');
    });

    it('displays JSON string for complex objects', () => {
      wrapper = createWrapper({ value: { complex: 'object', without: 'label' } });
      
      expect(wrapper.text()).toContain('{"complex":"object","without":"label"}');
    });
  });

  describe('Variants', () => {
    it('applies default variant classes', () => {
      wrapper = createWrapper({ variant: 'default' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('bg-neutral-100');
      expect(chip.classes()).toContain('border-neutral-200');
      expect(chip.classes()).toContain('text-neutral-700');
    });

    it('applies primary variant classes', () => {
      wrapper = createWrapper({ variant: 'primary' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('bg-primary-100');
      expect(chip.classes()).toContain('border-primary-200');
      expect(chip.classes()).toContain('text-primary-700');
    });

    it('applies error variant classes', () => {
      wrapper = createWrapper({ variant: 'error' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('bg-error-100');
      expect(chip.classes()).toContain('border-error-200');
      expect(chip.classes()).toContain('text-error-700');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      wrapper = createWrapper({ size: 'sm' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('px-3');
      expect(chip.classes()).toContain('py-1');
      expect(chip.classes()).toContain('text-sm');
    });

    it('applies extra small size classes', () => {
      wrapper = createWrapper({ size: 'xs' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('px-2');
      expect(chip.classes()).toContain('py-1');
      expect(chip.classes()).toContain('text-xs');
    });

    it('applies medium size classes', () => {
      wrapper = createWrapper({ size: 'md' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('px-4');
      expect(chip.classes()).toContain('py-2');
      expect(chip.classes()).toContain('text-base');
    });
  });

  describe('Events', () => {
    it('emits remove event when remove button is clicked', async () => {
      wrapper = createWrapper({ label: 'Category', value: 'test-value' });
      
      const removeButton = wrapper.find('.filter-remove-btn');
      await removeButton.trigger('click');
      
      expect(wrapper.emitted('remove')).toBeTruthy();
      expect(wrapper.emitted('remove')[0][0]).toEqual({
        label: 'Category',
        value: 'test-value'
      });
    });

    it('does not emit remove event when disabled', async () => {
      wrapper = createWrapper({ disabled: true, removable: true });
      
      // Remove button should not exist when disabled
      expect(wrapper.find('.filter-remove-btn').exists()).toBe(false);
    });
  });

  describe('Disabled State', () => {
    it('applies disabled classes when disabled', () => {
      wrapper = createWrapper({ disabled: true });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('opacity-50');
    });

    it('prevents interaction when disabled', () => {
      wrapper = createWrapper({ disabled: true });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for remove button', () => {
      wrapper = createWrapper({ label: 'Category' });
      
      const removeButton = wrapper.find('.filter-remove-btn');
      expect(removeButton.attributes('aria-label')).toBe('Remove Category');
    });

    it('has default aria-label when no label provided', () => {
      wrapper = createWrapper();
      
      const removeButton = wrapper.find('.filter-remove-btn');
      expect(removeButton.attributes('aria-label')).toBe('Remove filter');
    });
  });

  describe('Custom Classes', () => {
    it('applies custom classes', () => {
      wrapper = createWrapper({ class: 'custom-class' });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('custom-class');
    });

    it('applies custom classes as array', () => {
      wrapper = createWrapper({ class: ['custom-1', 'custom-2'] });
      
      const chip = wrapper.find('.filter-chip');
      expect(chip.classes()).toContain('custom-1');
      expect(chip.classes()).toContain('custom-2');
    });
  });

  describe('Props Validation', () => {
    it('validates variant prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      wrapper = createWrapper({ variant: 'invalid' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('validates size prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      wrapper = createWrapper({ size: 'invalid' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('requires value prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      wrapper = mount(FilterChip, {
        global: {
          stubs: {
            Icon: true
          }
        }
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles null value', () => {
      wrapper = createWrapper({ value: null });
      
      expect(wrapper.text()).toContain('null');
    });

    it('handles undefined value', () => {
      wrapper = createWrapper({ value: undefined });
      
      expect(wrapper.text()).toContain('undefined');
    });

    it('handles boolean values', () => {
      wrapper = createWrapper({ value: true });
      
      expect(wrapper.text()).toContain('true');
    });

    it('handles zero value', () => {
      wrapper = createWrapper({ value: 0 });
      
      expect(wrapper.text()).toContain('0');
    });

    it('handles empty string value', () => {
      wrapper = createWrapper({ value: '' });
      
      expect(wrapper.text()).toContain('');
    });
  });
});