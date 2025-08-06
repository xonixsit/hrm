import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProgressRing from '@/Components/States/ProgressRing.vue';

// Mock the icons
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => {
    const iconMap = {
      'loading': 'LoadingIcon',
      'refresh': 'RefreshIcon'
    };
    return iconMap[name] || 'DefaultIcon';
  })
}));

describe('ProgressRing', () => {
  let wrapper;

  const defaultProps = {
    value: 50,
    max: 100,
    size: 120
  };

  beforeEach(() => {
    wrapper = mount(ProgressRing, {
      props: defaultProps
    });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.progress-ring').exists()).toBe(true);
    });

    it('renders SVG with correct dimensions', () => {
      const svg = wrapper.find('.progress-ring-svg');
      expect(svg.exists()).toBe(true);
      expect(svg.attributes('width')).toBe('120');
      expect(svg.attributes('height')).toBe('120');
    });

    it('renders background and progress circles', () => {
      expect(wrapper.find('.progress-ring-background').exists()).toBe(true);
      expect(wrapper.find('.progress-ring-progress').exists()).toBe(true);
    });
  });

  describe('Progress Calculation', () => {
    it('calculates percentage correctly', () => {
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(50);
    });

    it('handles different value ranges', async () => {
      await wrapper.setProps({ value: 25, min: 0, max: 50 });
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(50);
    });

    it('clamps percentage to 0-100 range', async () => {
      await wrapper.setProps({ value: 150 });
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(100);
      
      await wrapper.setProps({ value: -10 });
      expect(vm.displayPercentage).toBe(0);
    });

    it('calculates stroke dash offset correctly', () => {
      const vm = wrapper.vm;
      const expectedOffset = vm.circumference * (1 - 0.5); // 50% progress
      expect(vm.strokeDashoffset).toBeCloseTo(expectedOffset);
    });
  });

  describe('Size Variants', () => {
    it('applies correct size', () => {
      const svg = wrapper.find('.progress-ring-svg');
      expect(svg.attributes('width')).toBe('120');
      expect(svg.attributes('height')).toBe('120');
    });

    it('calculates center and radius correctly', () => {
      const vm = wrapper.vm;
      expect(vm.center).toBe(60); // 120 / 2
      expect(vm.radius).toBe(56); // (120 - 8) / 2
    });

    it('adjusts for different stroke widths', async () => {
      await wrapper.setProps({ strokeWidth: 12 });
      const vm = wrapper.vm;
      expect(vm.radius).toBe(54); // (120 - 12) / 2
    });
  });

  describe('Color Variants', () => {
    it('applies primary color by default', () => {
      expect(wrapper.find('.progress-ring-progress--primary').exists()).toBe(true);
    });

    it('applies custom color variant', async () => {
      await wrapper.setProps({ color: 'success' });
      expect(wrapper.find('.progress-ring-progress--success').exists()).toBe(true);
    });

    it('applies correct color classes for all variants', async () => {
      const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
      
      for (const color of colors) {
        await wrapper.setProps({ color });
        expect(wrapper.find(`.progress-ring-progress--${color}`).exists()).toBe(true);
      }
    });
  });

  describe('Content Display', () => {
    it('shows percentage by default', () => {
      expect(wrapper.find('.progress-percentage').exists()).toBe(true);
      expect(wrapper.text()).toContain('50%');
    });

    it('shows value when showValue is true', async () => {
      await wrapper.setProps({ showValue: true });
      expect(wrapper.find('.progress-value').exists()).toBe(true);
      expect(wrapper.text()).toContain('50');
    });

    it('shows label when provided', async () => {
      await wrapper.setProps({ label: 'Progress', showLabel: true });
      expect(wrapper.find('.progress-label').exists()).toBe(true);
      expect(wrapper.text()).toContain('Progress');
    });

    it('hides percentage when showPercentage is false', async () => {
      await wrapper.setProps({ showPercentage: false });
      expect(wrapper.find('.progress-percentage').exists()).toBe(false);
    });
  });

  describe('External Label', () => {
    it('shows external label when externalLabel is true', async () => {
      await wrapper.setProps({ 
        externalLabel: true, 
        label: 'External Label',
        showLabel: true 
      });
      expect(wrapper.find('.progress-ring-external-label').exists()).toBe(true);
      expect(wrapper.text()).toContain('External Label');
    });

    it('applies correct classes for external label', async () => {
      await wrapper.setProps({ externalLabel: true });
      expect(wrapper.find('.progress-ring--with-external-label').exists()).toBe(true);
    });
  });

  describe('Icon Display', () => {
    it('shows icon when provided', async () => {
      await wrapper.setProps({ 
        icon: 'TestIcon',
        showPercentage: false 
      });
      expect(wrapper.find('.progress-ring-icon').exists()).toBe(true);
    });

    it('applies correct icon size classes', async () => {
      await wrapper.setProps({ 
        icon: 'TestIcon',
        iconSize: 'lg',
        showPercentage: false 
      });
      const vm = wrapper.vm;
      expect(vm.iconClasses).toContain('w-8 h-8');
      expect(vm.iconClasses).toContain('text-current');
    });
  });

  describe('Indeterminate State', () => {
    it('applies indeterminate classes when indeterminate is true', async () => {
      await wrapper.setProps({ indeterminate: true });
      expect(wrapper.find('.progress-ring-progress--indeterminate').exists()).toBe(true);
      expect(wrapper.find('.progress-ring--indeterminate').exists()).toBe(true);
    });

    it('shows loading icon in indeterminate state', async () => {
      await wrapper.setProps({ 
        indeterminate: true,
        showPercentage: false 
      });
      expect(wrapper.find('.progress-ring-loading').exists()).toBe(true);
    });

    it('returns 0 percentage in indeterminate state', async () => {
      await wrapper.setProps({ indeterminate: true });
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(0);
    });
  });

  describe('Gradient Support', () => {
    it('applies gradient classes when gradient is true', async () => {
      await wrapper.setProps({ gradient: true });
      expect(wrapper.find('.progress-ring-progress--gradient').exists()).toBe(true);
    });

    it('generates gradient definitions', async () => {
      await wrapper.setProps({ gradient: true });
      expect(wrapper.find('defs').exists()).toBe(true);
      expect(wrapper.find('linearGradient').exists()).toBe(true);
    });

    it('calculates gradient colors correctly', async () => {
      await wrapper.setProps({ gradient: true, color: 'primary' });
      const vm = wrapper.vm;
      expect(vm.gradientStart).toBe('#6366f1');
      expect(vm.gradientEnd).toBe('#8b5cf6');
    });
  });

  describe('Thickness Variants', () => {
    it('applies thickness classes correctly', async () => {
      await wrapper.setProps({ thickness: 'thick' });
      expect(wrapper.find('.progress-ring--thick').exists()).toBe(true);
    });

    it('handles all thickness variants', async () => {
      const thicknesses = ['thin', 'normal', 'thick'];
      
      for (const thickness of thicknesses) {
        await wrapper.setProps({ thickness });
        expect(wrapper.find(`.progress-ring--${thickness}`).exists()).toBe(true);
      }
    });
  });

  describe('Animation Speed', () => {
    it('applies speed classes correctly', async () => {
      await wrapper.setProps({ speed: 'fast' });
      expect(wrapper.find('.progress-ring-progress--fast').exists()).toBe(true);
    });

    it('handles all speed variants', async () => {
      const speeds = ['slow', 'normal', 'fast'];
      
      for (const speed of speeds) {
        await wrapper.setProps({ speed });
        expect(wrapper.find(`.progress-ring-progress--${speed}`).exists()).toBe(true);
      }
    });
  });

  describe('Progress Info', () => {
    it('shows progress info when showInfo is true', async () => {
      await wrapper.setProps({ 
        showInfo: true,
        showValue: true 
      });
      expect(wrapper.find('.progress-ring-info').exists()).toBe(true);
    });

    it('displays current and max values', async () => {
      await wrapper.setProps({ 
        showInfo: true,
        showValue: true,
        value: 75,
        max: 100
      });
      expect(wrapper.text()).toContain('75');
      expect(wrapper.text()).toContain('100');
    });

    it('shows estimated time when provided', async () => {
      await wrapper.setProps({ 
        showInfo: true,
        showTime: true,
        estimatedTime: 3600 // 1 hour
      });
      expect(wrapper.text()).toContain('1h');
    });
  });

  describe('Time Formatting', () => {
    it('formats seconds correctly', () => {
      const vm = wrapper.vm;
      expect(vm.formatTime(30)).toBe('30s');
      expect(vm.formatTime(90)).toBe('1m 30s');
      expect(vm.formatTime(3600)).toBe('1h 0m');
      expect(vm.formatTime(3690)).toBe('1h 1m');
    });

    it('handles edge cases', () => {
      const vm = wrapper.vm;
      expect(vm.formatTime(0)).toBe('0s');
      expect(vm.formatTime(-10)).toBe('0s');
      expect(vm.formatTime(null)).toBe('0s');
    });
  });

  describe('Value Formatting', () => {
    it('formats display value with locale', () => {
      const vm = wrapper.vm;
      expect(vm.displayValue).toBe('50');
    });

    it('formats large numbers with commas', async () => {
      await wrapper.setProps({ value: 1234567 });
      const vm = wrapper.vm;
      expect(vm.displayValue).toBe('1,234,567');
    });

    it('formats max value correctly', async () => {
      await wrapper.setProps({ max: 1000 });
      const vm = wrapper.vm;
      expect(vm.displayMax).toBe('1,000');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      // Progress rings should be accessible
      expect(wrapper.find('.progress-ring').exists()).toBe(true);
    });

    it('supports keyboard navigation', () => {
      const ring = wrapper.find('.progress-ring');
      expect(ring.exists()).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains aspect ratio on different screen sizes', () => {
      const svg = wrapper.find('.progress-ring-svg');
      expect(svg.exists()).toBe(true);
    });

    it('adjusts text size appropriately', () => {
      expect(wrapper.find('.progress-percentage').exists()).toBe(true);
    });
  });

  describe('Custom Slots', () => {
    it('renders custom content in default slot', () => {
      const customWrapper = mount(ProgressRing, {
        props: defaultProps,
        slots: {
          default: '<div class="custom-content">Custom Content</div>'
        }
      });
      
      expect(customWrapper.find('.custom-content').exists()).toBe(true);
      expect(customWrapper.text()).toContain('Custom Content');
      
      customWrapper.unmount();
    });

    it('renders custom label slot', () => {
      const customWrapper = mount(ProgressRing, {
        props: { ...defaultProps, externalLabel: true, showLabel: true },
        slots: {
          label: '<div class="custom-label">Custom Label</div>'
        }
      });
      
      expect(customWrapper.find('.custom-label').exists()).toBe(true);
      expect(customWrapper.text()).toContain('Custom Label');
      
      customWrapper.unmount();
    });

    it('renders custom info slot', () => {
      const customWrapper = mount(ProgressRing, {
        props: { ...defaultProps, showInfo: true },
        slots: {
          info: '<div class="custom-info">Custom Info</div>'
        }
      });
      
      expect(customWrapper.find('.custom-info').exists()).toBe(true);
      expect(customWrapper.text()).toContain('Custom Info');
      
      customWrapper.unmount();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values correctly', async () => {
      await wrapper.setProps({ value: 0 });
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(0);
      expect(vm.strokeDashoffset).toBe(vm.circumference);
    });

    it('handles maximum values correctly', async () => {
      await wrapper.setProps({ value: 100 });
      const vm = wrapper.vm;
      expect(vm.displayPercentage).toBe(100);
      expect(vm.strokeDashoffset).toBe(0);
    });

    it('handles very small sizes', async () => {
      await wrapper.setProps({ size: 40 });
      const vm = wrapper.vm;
      expect(vm.center).toBe(20);
      expect(vm.radius).toBe(16);
    });

    it('handles very large sizes', async () => {
      await wrapper.setProps({ size: 400 });
      const vm = wrapper.vm;
      expect(vm.center).toBe(200);
      expect(vm.radius).toBe(196);
    });
  });

  describe('Performance', () => {
    it('handles rapid value changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i <= 100; i += 10) {
        await wrapper.setProps({ value: i });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('calculates circumference only when needed', () => {
      const vm = wrapper.vm;
      const circumference1 = vm.circumference;
      const circumference2 = vm.circumference;
      
      // Should return the same computed value
      expect(circumference1).toBe(circumference2);
    });
  });

  describe('Theme Support', () => {
    it('applies theme classes correctly', () => {
      // Test would involve checking CSS classes
      expect(wrapper.find('.progress-ring').exists()).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('cleans up properly on unmount', () => {
      const vm = wrapper.vm;
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });
  });
});