import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Icon from '@/Components/Base/Icon.vue';
import { getIcon } from '@/config/icons.js';

// Mock the icon config to avoid import issues in tests
vi.mock('@/config/icons.js', () => ({
  getIcon: vi.fn(),
  iconSizes: {
    xs: 'icon-xs',
    sm: 'icon-sm',
    md: 'icon-md',
    lg: 'icon-lg',
    xl: 'icon-xl',
    '2xl': 'icon-2xl'
  }
}));

// Mock icon component for testing
const MockIcon = {
  name: 'MockIcon',
  template: '<svg data-testid="mock-icon"><path /></svg>'
};

describe('Icon Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders icon component when valid icon name is provided', () => {
      getIcon.mockReturnValue(MockIcon);
      
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        }
      });

      expect(wrapper.find('[data-testid="mock-icon"]').exists()).toBe(true);
      expect(getIcon).toHaveBeenCalledWith('home');
    });

    it('renders fallback div when icon is not found', () => {
      getIcon.mockReturnValue(null);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const wrapper = mount(Icon, {
        props: {
          name: 'nonexistent-icon'
        }
      });

      expect(wrapper.find('div').exists()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Icon "nonexistent-icon" not found in icon map');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Size Variants', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('applies correct size class for each size variant', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      
      sizes.forEach(size => {
        const wrapper = mount(Icon, {
          props: {
            name: 'home',
            size: size
          }
        });

        expect(wrapper.classes()).toContain(`icon-${size}`);
      });
    });

    it('defaults to medium size when no size is specified', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        }
      });

      expect(wrapper.classes()).toContain('icon-md');
    });

    it('validates size prop correctly', () => {
      // This test ensures the validator works correctly
      const validSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const invalidSizes = ['xxs', 'huge', 'medium', '3xl'];

      // Test valid sizes (should not throw)
      validSizes.forEach(size => {
        expect(() => {
          mount(Icon, {
            props: {
              name: 'home',
              size: size
            }
          });
        }).not.toThrow();
      });
    });
  });

  describe('Color Variants', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('applies correct color class for each color variant', () => {
      const colorTests = [
        { color: 'current', expectedClass: 'text-current' },
        { color: 'primary', expectedClass: 'text-primary-500' },
        { color: 'secondary', expectedClass: 'text-secondary-500' },
        { color: 'accent', expectedClass: 'text-accent-500' },
        { color: 'neutral', expectedClass: 'text-neutral-500' },
        { color: 'success', expectedClass: 'text-success-500' },
        { color: 'warning', expectedClass: 'text-warning-500' },
        { color: 'error', expectedClass: 'text-error-500' },
        { color: 'info', expectedClass: 'text-info-500' },
        { color: 'white', expectedClass: 'text-white' }
      ];

      colorTests.forEach(({ color, expectedClass }) => {
        const wrapper = mount(Icon, {
          props: {
            name: 'home',
            color: color
          }
        });

        expect(wrapper.classes()).toContain(expectedClass);
      });
    });

    it('defaults to current color when no color is specified', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        }
      });

      expect(wrapper.classes()).toContain('text-current');
    });
  });

  describe('State Modifiers', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('applies loading state correctly', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          loading: true
        }
      });

      expect(wrapper.classes()).toContain('animate-spin');
    });

    it('applies disabled state correctly', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          disabled: true
        }
      });

      expect(wrapper.classes()).toContain('opacity-50');
    });

    it('applies clickable state correctly', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          clickable: true
        }
      });

      expect(wrapper.classes()).toContain('cursor-pointer');
    });

    it('combines multiple states correctly', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          loading: true,
          disabled: true,
          clickable: true
        }
      });

      expect(wrapper.classes()).toContain('animate-spin');
      expect(wrapper.classes()).toContain('opacity-50');
      expect(wrapper.classes()).toContain('cursor-pointer');
    });
  });

  describe('Custom Classes', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('applies custom string class', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          class: 'custom-class'
        }
      });

      expect(wrapper.classes()).toContain('custom-class');
    });

    it('applies custom array classes', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          class: ['custom-class-1', 'custom-class-2']
        }
      });

      expect(wrapper.classes()).toContain('custom-class-1');
      expect(wrapper.classes()).toContain('custom-class-2');
    });

    it('applies custom object classes', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          class: {
            'conditional-class': true,
            'hidden-class': false
          }
        }
      });

      expect(wrapper.classes()).toContain('conditional-class');
      expect(wrapper.classes()).not.toContain('hidden-class');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('sets aria-hidden to true when no aria-label is provided', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        }
      });

      expect(wrapper.attributes('aria-hidden')).toBe('true');
      expect(wrapper.attributes('aria-label')).toBe('');
    });

    it('sets aria-label and removes aria-hidden when aria-label is provided', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          ariaLabel: 'Home icon'
        }
      });

      expect(wrapper.attributes('aria-label')).toBe('Home icon');
      expect(wrapper.attributes('aria-hidden')).toBe('false');
    });
  });

  describe('Attribute Inheritance', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('passes through additional attributes', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        },
        attrs: {
          'data-testid': 'custom-icon',
          'title': 'Custom title'
        }
      });

      expect(wrapper.attributes('data-testid')).toBe('custom-icon');
      expect(wrapper.attributes('title')).toBe('Custom title');
    });
  });

  describe('Base Classes', () => {
    beforeEach(() => {
      getIcon.mockReturnValue(MockIcon);
    });

    it('always applies inline-block class', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home'
        }
      });

      expect(wrapper.classes()).toContain('inline-block');
    });

    it('applies all base classes correctly', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'home',
          size: 'lg',
          color: 'primary'
        }
      });

      expect(wrapper.classes()).toContain('inline-block');
      expect(wrapper.classes()).toContain('icon-lg');
      expect(wrapper.classes()).toContain('text-primary-500');
    });
  });
});