import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '@/Components/Base/BaseButton.vue';

describe('BaseButton', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseButton);
      
      expect(wrapper.element.tagName).toBe('BUTTON');
      expect(wrapper.attributes('type')).toBe('button');
      expect(wrapper.classes()).toContain('btn-base');
    });

    it('renders with label prop', () => {
      const wrapper = mount(BaseButton, {
        props: { label: 'Test Button' }
      });
      
      expect(wrapper.text()).toBe('Test Button');
    });

    it('renders with slot content', () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Slot Content' }
      });
      
      expect(wrapper.text()).toBe('Slot Content');
    });

    it('prioritizes slot content over label prop', () => {
      const wrapper = mount(BaseButton, {
        props: { label: 'Label Text' },
        slots: { default: 'Slot Content' }
      });
      
      expect(wrapper.text()).toBe('Slot Content');
    });
  });

  describe('Variants', () => {
    it('applies primary variant classes by default', () => {
      const wrapper = mount(BaseButton);
      
      expect(wrapper.classes()).toContain('bg-gradient-to-r');
      expect(wrapper.classes()).toContain('from-primary-500');
      expect(wrapper.classes()).toContain('to-primary-600');
      expect(wrapper.classes()).toContain('text-white');
    });

    it('applies secondary variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'secondary' }
      });
      
      expect(wrapper.classes()).toContain('border');
      expect(wrapper.classes()).toContain('border-neutral-300');
      expect(wrapper.classes()).toContain('bg-white');
      expect(wrapper.classes()).toContain('text-neutral-700');
    });

    it('applies ghost variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'ghost' }
      });
      
      expect(wrapper.classes()).toContain('text-neutral-600');
      expect(wrapper.classes()).toContain('bg-transparent');
    });

    it('applies icon variant classes', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'icon' }
      });
      
      expect(wrapper.classes()).toContain('text-neutral-600');
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('rounded-full');
    });
  });

  describe('Sizes', () => {
    it('applies medium size classes by default', () => {
      const wrapper = mount(BaseButton);
      
      expect(wrapper.classes()).toContain('px-4');
      expect(wrapper.classes()).toContain('py-2');
      expect(wrapper.classes()).toContain('text-base');
      expect(wrapper.classes()).toContain('h-10');
    });

    it('applies small size classes', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'sm' }
      });
      
      expect(wrapper.classes()).toContain('px-3');
      expect(wrapper.classes()).toContain('py-1.5');
      expect(wrapper.classes()).toContain('text-sm');
      expect(wrapper.classes()).toContain('h-8');
    });

    it('applies large size classes', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'lg' }
      });
      
      expect(wrapper.classes()).toContain('px-6');
      expect(wrapper.classes()).toContain('py-3');
      expect(wrapper.classes()).toContain('text-lg');
      expect(wrapper.classes()).toContain('h-12');
    });

    it('applies extra large size classes', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'xl' }
      });
      
      expect(wrapper.classes()).toContain('px-8');
      expect(wrapper.classes()).toContain('py-4');
      expect(wrapper.classes()).toContain('text-xl');
      expect(wrapper.classes()).toContain('h-14');
    });

    it('applies icon-specific size classes for icon variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'icon', size: 'sm' }
      });
      
      expect(wrapper.classes()).toContain('p-1.5');
      expect(wrapper.classes()).not.toContain('px-3');
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      });
      
      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('opacity-50');
      expect(wrapper.classes()).toContain('cursor-not-allowed');
    });

    it('shows loading spinner when loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true, label: 'Submit' }
      });
      
      const spinner = wrapper.find('svg');
      expect(spinner.exists()).toBe(true);
      expect(spinner.classes()).toContain('animate-spin');
      expect(wrapper.classes()).toContain('opacity-75');
      expect(wrapper.classes()).toContain('cursor-wait');
    });

    it('disables button when loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      });
      
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('hides icons when loading', () => {
      const MockIcon = { template: '<div class="mock-icon"></div>' };
      const wrapper = mount(BaseButton, {
        props: { 
          loading: true, 
          iconLeft: MockIcon,
          iconRight: MockIcon
        }
      });
      
      expect(wrapper.findAll('.mock-icon')).toHaveLength(0);
    });
  });

  describe('Icons', () => {
    const MockIcon = { template: '<div class="mock-icon"></div>' };

    it('renders left icon', () => {
      const wrapper = mount(BaseButton, {
        props: { iconLeft: MockIcon, label: 'Button' }
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.exists()).toBe(true);
    });

    it('renders right icon', () => {
      const wrapper = mount(BaseButton, {
        props: { iconRight: MockIcon, label: 'Button' }
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.exists()).toBe(true);
    });

    it('applies correct icon size classes', () => {
      const MockIconWithClass = { 
        template: '<div class="mock-icon"></div>',
        props: ['class']
      };
      
      const wrapper = mount(BaseButton, {
        props: { iconLeft: MockIconWithClass, size: 'lg' }
      });
      
      // Check that the icon component receives the correct classes
      const iconComponent = wrapper.findComponent(MockIconWithClass);
      expect(iconComponent.exists()).toBe(true);
      
      // The icon should receive size classes through the :class binding
      const iconClasses = iconComponent.props('class');
      expect(iconClasses).toContain('w-6');
      expect(iconClasses).toContain('h-6');
      expect(iconClasses).toContain('flex-shrink-0');
    });
  });

  describe('HTML Attributes', () => {
    it('sets button type attribute', () => {
      const wrapper = mount(BaseButton, {
        props: { type: 'submit' }
      });
      
      expect(wrapper.attributes('type')).toBe('submit');
    });

    it('renders as anchor tag with href', () => {
      const wrapper = mount(BaseButton, {
        props: { href: 'https://example.com' }
      });
      
      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('href')).toBe('https://example.com');
    });

    it('renders as router-link with to prop', () => {
      const RouterLinkStub = {
        name: 'router-link',
        template: '<a><slot /></a>',
        props: ['to']
      };
      
      const wrapper = mount(BaseButton, {
        props: { to: '/dashboard' },
        global: {
          stubs: {
            'router-link': RouterLinkStub
          }
        }
      });
      
      expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(true);
    });
  });

  describe('Styling Options', () => {
    it('applies full width class', () => {
      const wrapper = mount(BaseButton, {
        props: { fullWidth: true }
      });
      
      expect(wrapper.classes()).toContain('w-full');
    });

    it('applies custom classes', () => {
      const wrapper = mount(BaseButton, {
        props: { class: 'custom-class another-class' }
      });
      
      expect(wrapper.classes()).toContain('custom-class');
      expect(wrapper.classes()).toContain('another-class');
    });

    it('applies rounded classes', () => {
      const wrapper = mount(BaseButton, {
        props: { rounded: 'lg' }
      });
      
      expect(wrapper.classes()).toContain('rounded-lg');
    });

    it('always applies rounded-full for icon variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'icon', rounded: 'sm' }
      });
      
      expect(wrapper.classes()).toContain('rounded-full');
      expect(wrapper.classes()).not.toContain('rounded-sm');
    });
  });

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mount(BaseButton);
      
      await wrapper.trigger('click');
      
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click event when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      });
      
      await wrapper.trigger('click');
      
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click event when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      });
      
      await wrapper.trigger('click');
      
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('prevents default when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      });
      
      const mockEvent = { preventDefault: vi.fn() };
      await wrapper.vm.handleClick(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('prevents default when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true }
      });
      
      const mockEvent = { preventDefault: vi.fn() };
      await wrapper.vm.handleClick(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus ring classes', () => {
      const wrapper = mount(BaseButton);
      
      expect(wrapper.classes()).toContain('focus:outline-none');
      expect(wrapper.classes()).toContain('focus:ring-2');
      expect(wrapper.classes()).toContain('focus:ring-offset-2');
    });

    it('applies proper disabled attributes and classes', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true }
      });
      
      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('disabled:opacity-50');
      expect(wrapper.classes()).toContain('disabled:cursor-not-allowed');
      expect(wrapper.classes()).toContain('disabled:pointer-events-none');
    });

    it('maintains semantic button element by default', () => {
      const wrapper = mount(BaseButton);
      
      expect(wrapper.element.tagName).toBe('BUTTON');
      expect(wrapper.attributes('type')).toBe('button');
    });
  });

  describe('Prop Validation', () => {
    it('validates variant prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mount(BaseButton, {
        props: { variant: 'invalid' }
      });
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('validates size prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mount(BaseButton, {
        props: { size: 'invalid' }
      });
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('validates type prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mount(BaseButton, {
        props: { type: 'invalid' }
      });
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('validates rounded prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mount(BaseButton, {
        props: { rounded: 'invalid' }
      });
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });
});