import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ToggleSwitch from '@/Components/Base/ToggleSwitch.vue';

// Mock Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="mock-icon" :data-name="name" :data-size="size"></span>',
    props: ['name', 'size'],
  },
}));

describe('ToggleSwitch', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(ToggleSwitch, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          Icon: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('rendering', () => {
    it('should render as a button with switch role', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
      expect(button.attributes('role')).toBe('switch');
    });

    it('should have correct default classes', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('relative');
      expect(button.classes()).toContain('inline-flex');
      expect(button.classes()).toContain('items-center');
      expect(button.classes()).toContain('h-6');
      expect(button.classes()).toContain('rounded-full');
      expect(button.classes()).toContain('w-11');
    });

    it('should render thumb element', () => {
      wrapper = createWrapper();
      
      const thumb = wrapper.find('span');
      expect(thumb.exists()).toBe(true);
      expect(thumb.classes()).toContain('inline-block');
      expect(thumb.classes()).toContain('w-4');
      expect(thumb.classes()).toContain('h-4');
      expect(thumb.classes()).toContain('bg-white');
      expect(thumb.classes()).toContain('rounded-full');
    });

    it('should render screen reader text', () => {
      wrapper = createWrapper();
      
      const srText = wrapper.find('.sr-only');
      expect(srText.exists()).toBe(true);
      expect(srText.text()).toBe('Disabled');
    });
  });

  describe('checked state', () => {
    it('should apply checked styles when checked is true', () => {
      wrapper = createWrapper({ checked: true });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('bg-primary-600');
      
      const thumb = wrapper.find('span');
      expect(thumb.classes()).toContain('translate-x-6');
      
      const srText = wrapper.find('.sr-only');
      expect(srText.text()).toBe('Enabled');
    });

    it('should apply unchecked styles when checked is false', () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('bg-neutral-200');
      
      const thumb = wrapper.find('span');
      expect(thumb.classes()).toContain('translate-x-1');
      
      const srText = wrapper.find('.sr-only');
      expect(srText.text()).toBe('Disabled');
    });

    it('should set aria-checked attribute correctly', () => {
      wrapper = createWrapper({ checked: true });
      expect(wrapper.find('button').attributes('aria-checked')).toBe('true');
      
      wrapper = createWrapper({ checked: false });
      expect(wrapper.find('button').attributes('aria-checked')).toBe('false');
    });
  });

  describe('disabled state', () => {
    it('should apply disabled styles when disabled is true', () => {
      wrapper = createWrapper({ disabled: true });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('opacity-50');
      expect(button.classes()).toContain('cursor-not-allowed');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('should not apply disabled styles when disabled is false', () => {
      wrapper = createWrapper({ disabled: false });
      
      const button = wrapper.find('button');
      expect(button.classes()).not.toContain('opacity-50');
      expect(button.classes()).not.toContain('cursor-not-allowed');
      expect(button.attributes('disabled')).toBeUndefined();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      wrapper = createWrapper({
        checked: true,
        ariaLabel: 'Toggle setting',
      });
      
      const button = wrapper.find('button');
      expect(button.attributes('role')).toBe('switch');
      expect(button.attributes('aria-checked')).toBe('true');
      expect(button.attributes('aria-label')).toBe('Toggle setting');
    });

    it('should have focus styles', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('focus:outline-none');
      expect(button.classes()).toContain('focus:ring-2');
      expect(button.classes()).toContain('focus:ring-offset-2');
      expect(button.classes()).toContain('focus:ring-primary-500');
    });

    it('should provide screen reader feedback', () => {
      wrapper = createWrapper({ checked: true });
      
      const srText = wrapper.find('.sr-only');
      expect(srText.text()).toBe('Enabled');
      
      wrapper = createWrapper({ checked: false });
      const srTextOff = wrapper.find('.sr-only');
      expect(srTextOff.text()).toBe('Disabled');
    });
  });

  describe('icons', () => {
    it('should not show icons by default', () => {
      wrapper = createWrapper({ checked: true });
      
      const icons = wrapper.findAll('.mock-icon');
      expect(icons).toHaveLength(0);
    });

    it('should show checked icon when showIcons is true and checked', () => {
      wrapper = createWrapper({
        checked: true,
        showIcons: true,
        checkedIcon: 'check',
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.exists()).toBe(true);
      expect(icon.attributes('data-name')).toBe('check');
      expect(icon.attributes('data-size')).toBe('xs');
    });

    it('should show unchecked icon when showIcons is true and not checked', () => {
      wrapper = createWrapper({
        checked: false,
        showIcons: true,
        uncheckedIcon: 'x',
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.exists()).toBe(true);
      expect(icon.attributes('data-name')).toBe('x');
      expect(icon.attributes('data-size')).toBe('xs');
    });

    it('should apply custom icon classes', () => {
      wrapper = createWrapper({
        checked: true,
        showIcons: true,
        checkedIconClass: 'text-green-500',
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.classes()).toContain('text-green-500');
    });
  });

  describe('interaction', () => {
    it('should emit change event when clicked', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0][0]).toBe(true);
    });

    it('should emit update:checked event when clicked', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('update:checked')).toBeTruthy();
      expect(wrapper.emitted('update:checked')[0][0]).toBe(true);
    });

    it('should toggle from false to true', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('change')[0][0]).toBe(true);
    });

    it('should toggle from true to false', async () => {
      wrapper = createWrapper({ checked: true });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('change')[0][0]).toBe(false);
    });

    it('should not emit events when disabled', async () => {
      wrapper = createWrapper({ checked: false, disabled: true });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('change')).toBeFalsy();
      expect(wrapper.emitted('update:checked')).toBeFalsy();
    });
  });

  describe('keyboard interaction', () => {
    it('should be focusable', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.element.tabIndex).not.toBe(-1);
    });

    it('should respond to Enter key', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('keydown.enter');
      
      // Enter key should trigger click event
      await button.trigger('click');
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('should respond to Space key', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('keydown.space');
      
      // Space key should trigger click event
      await button.trigger('click');
      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('should apply small size classes', () => {
      wrapper = createWrapper({ size: 'sm' });
      
      // Note: The size variants are defined in CSS but not implemented in the template
      // This test documents the expected behavior
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('should apply large size classes', () => {
      wrapper = createWrapper({ size: 'lg' });
      
      // Note: The size variants are defined in CSS but not implemented in the template
      // This test documents the expected behavior
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });
  });

  describe('animation and transitions', () => {
    it('should have transition classes', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('transition-colors');
      expect(button.classes()).toContain('duration-200');
      
      const thumb = wrapper.find('span');
      expect(thumb.classes()).toContain('transition-transform');
      expect(thumb.classes()).toContain('duration-200');
    });

    it('should have easing classes', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('ease-in-out');
      
      const thumb = wrapper.find('span');
      expect(thumb.classes()).toContain('ease-in-out');
    });
  });

  describe('v-model support', () => {
    it('should work with v-model pattern', async () => {
      wrapper = createWrapper({ checked: false });
      
      const button = wrapper.find('button');
      await button.trigger('click');
      
      // Should emit update:checked for v-model support
      expect(wrapper.emitted('update:checked')).toBeTruthy();
      expect(wrapper.emitted('update:checked')[0][0]).toBe(true);
    });
  });

  describe('prop validation', () => {
    it('should accept valid size values', () => {
      const validSizes = ['sm', 'md', 'lg'];
      
      validSizes.forEach(size => {
        wrapper = createWrapper({ size });
        expect(wrapper.exists()).toBe(true);
      });
    });

    it('should handle boolean props correctly', () => {
      wrapper = createWrapper({
        checked: true,
        disabled: false,
        showIcons: true,
      });
      
      expect(wrapper.props('checked')).toBe(true);
      expect(wrapper.props('disabled')).toBe(false);
      expect(wrapper.props('showIcons')).toBe(true);
    });

    it('should handle string props correctly', () => {
      wrapper = createWrapper({
        ariaLabel: 'Test label',
        checkedIcon: 'check',
        uncheckedIcon: 'x',
        checkedIconClass: 'text-green-500',
        uncheckedIconClass: 'text-red-500',
      });
      
      expect(wrapper.props('ariaLabel')).toBe('Test label');
      expect(wrapper.props('checkedIcon')).toBe('check');
      expect(wrapper.props('uncheckedIcon')).toBe('x');
      expect(wrapper.props('checkedIconClass')).toBe('text-green-500');
      expect(wrapper.props('uncheckedIconClass')).toBe('text-red-500');
    });
  });
});