import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '@/Components/States/ProgressBar.vue'

describe('ProgressBar', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(ProgressBar)

      expect(wrapper.find('.progress-container').exists()).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
      expect(wrapper.find('.progress-fill').exists()).toBe(true)
    })

    it('renders with custom value and max', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 50,
          max: 100
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.exists()).toBe(true)
      expect(progressFill.attributes('style')).toContain('width: 50%')
    })

    it('calculates percentage correctly', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 25,
          max: 50,
          showPercentage: true
        }
      })

      expect(wrapper.text()).toContain('50%')
    })

    it('handles min value correctly', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 30,
          min: 20,
          max: 80,
          showPercentage: true
        }
      })

      // (30-20)/(80-20) = 10/60 = 16.67% ≈ 17%
      expect(wrapper.text()).toContain('17%')
    })
  })

  describe('Progress Display', () => {
    it('shows label when showLabel is true', () => {
      wrapper = mount(ProgressBar, {
        props: {
          label: 'Upload Progress',
          showLabel: true
        }
      })

      expect(wrapper.find('.progress-label').exists()).toBe(true)
      expect(wrapper.text()).toContain('Upload Progress')
    })

    it('shows percentage when showPercentage is true', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 75,
          max: 100,
          showPercentage: true
        }
      })

      expect(wrapper.find('.progress-percentage').exists()).toBe(true)
      expect(wrapper.text()).toContain('75%')
    })

    it('shows progress info when showInfo is true', () => {
      wrapper = mount(ProgressBar, {
        props: {
          showInfo: true
        }
      })

      expect(wrapper.find('.progress-info').exists()).toBe(true)
    })

    it('shows current/max values when showValue is true', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 1500,
          max: 3000,
          showInfo: true,
          showValue: true
        }
      })

      expect(wrapper.text()).toContain('1,500 / 3,000')
    })

    it('shows estimated time when provided', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: 120,
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('2m 0s remaining')
    })
  })

  describe('Size Variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl']

    sizes.forEach(size => {
      it(`applies ${size} size classes correctly`, () => {
        wrapper = mount(ProgressBar, {
          props: { size }
        })

        expect(wrapper.find(`.progress-container--${size}`).exists()).toBe(true)
        expect(wrapper.find(`.progress-bar--${size}`).exists()).toBe(true)
      })
    })
  })

  describe('Color Variants', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info']

    colors.forEach(color => {
      it(`applies ${color} color classes correctly`, () => {
        wrapper = mount(ProgressBar, {
          props: { color }
        })

        expect(wrapper.find(`.progress-fill--${color}`).exists()).toBe(true)
      })
    })
  })

  describe('Visual Effects', () => {
    it('shows striped effect when striped is true', () => {
      wrapper = mount(ProgressBar, {
        props: { striped: true }
      })

      expect(wrapper.find('.progress-fill--striped').exists()).toBe(true)
      expect(wrapper.find('.progress-stripes').exists()).toBe(true)
    })

    it('shows shimmer effect when shimmer is true', () => {
      wrapper = mount(ProgressBar, {
        props: { shimmer: true }
      })

      expect(wrapper.find('.progress-fill--shimmer').exists()).toBe(true)
      expect(wrapper.find('.progress-shimmer').exists()).toBe(true)
    })

    it('handles indeterminate state', () => {
      wrapper = mount(ProgressBar, {
        props: { indeterminate: true }
      })

      expect(wrapper.find('.progress-bar--indeterminate').exists()).toBe(true)
      expect(wrapper.find('.progress-fill--indeterminate').exists()).toBe(true)
    })
  })

  describe('Rounded Variants', () => {
    const roundedOptions = ['none', 'sm', 'md', 'lg', 'full']

    roundedOptions.forEach(rounded => {
      it(`applies ${rounded} rounded classes correctly`, () => {
        wrapper = mount(ProgressBar, {
          props: { rounded }
        })

        expect(wrapper.find(`.progress-bar--${rounded}`).exists()).toBe(true)
      })
    })
  })

  describe('Speed Variants', () => {
    const speeds = ['slow', 'normal', 'fast']

    speeds.forEach(speed => {
      it(`applies ${speed} speed classes correctly`, () => {
        wrapper = mount(ProgressBar, {
          props: { speed }
        })

        expect(wrapper.find(`.progress-fill--${speed}`).exists()).toBe(true)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 60,
          max: 100,
          label: 'File Upload'
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('role')).toBe('progressbar')
      expect(progressFill.attributes('aria-valuenow')).toBe('60')
      expect(progressFill.attributes('aria-valuemin')).toBe('0')
      expect(progressFill.attributes('aria-valuemax')).toBe('100')
      expect(progressFill.attributes('aria-label')).toBe('File Upload')
    })

    it('provides default aria-label when no label is provided', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 30,
          max: 100
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('aria-label')).toBe('Progress: 30%')
    })

    it('handles indeterminate aria-label', () => {
      wrapper = mount(ProgressBar, {
        props: {
          indeterminate: true
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('aria-label')).toBe('Loading in progress')
    })
  })

  describe('Time Formatting', () => {
    it('formats seconds correctly', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: 45,
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('45s remaining')
    })

    it('formats minutes and seconds correctly', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: 125, // 2m 5s
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('2m 5s remaining')
    })

    it('formats hours and minutes correctly', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: 3665, // 1h 1m
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('1h 1m remaining')
    })

    it('handles zero time', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: 0,
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('0s remaining')
    })
  })

  describe('Custom Slots', () => {
    it('renders custom label slot', () => {
      wrapper = mount(ProgressBar, {
        props: { showLabel: true },
        slots: {
          label: '<div data-testid="custom-label">Custom Label Content</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-label"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Label Content')
    })

    it('renders custom info slot', () => {
      wrapper = mount(ProgressBar, {
        props: { showInfo: true },
        slots: {
          info: '<div data-testid="custom-info">Custom Info Content</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-info"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Info Content')
    })
  })

  describe('Edge Cases', () => {
    it('handles value greater than max', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 150,
          max: 100,
          showPercentage: true
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 100%')
      expect(wrapper.text()).toContain('100%')
    })

    it('handles negative value', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: -10,
          max: 100,
          showPercentage: true
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 0%')
      expect(wrapper.text()).toContain('0%')
    })

    it('handles value less than min', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 5,
          min: 10,
          max: 100,
          showPercentage: true
        }
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 0%')
      expect(wrapper.text()).toContain('0%')
    })

    it('handles invalid time values', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: -5,
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).toContain('0s remaining')
    })

    it('handles null estimated time', () => {
      wrapper = mount(ProgressBar, {
        props: {
          estimatedTime: null,
          showInfo: true,
          showTime: true
        }
      })

      expect(wrapper.text()).not.toContain('remaining')
    })
  })

  describe('Custom Classes', () => {
    it('applies custom CSS classes', () => {
      const customClass = 'custom-progress-class'
      
      wrapper = mount(ProgressBar, {
        props: {
          class: customClass
        }
      })

      expect(wrapper.classes()).toContain(customClass)
    })
  })

  describe('Responsive Behavior', () => {
    it('renders with responsive-friendly structure', () => {
      wrapper = mount(ProgressBar, {
        props: {
          showLabel: true,
          showInfo: true,
          showPercentage: true,
          showValue: true,
          label: 'Progress'
        }
      })

      // Check for responsive structure
      expect(wrapper.find('.progress-container').exists()).toBe(true)
      expect(wrapper.find('.progress-label').exists()).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
      expect(wrapper.find('.progress-info').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('handles rapid value updates efficiently', async () => {
      wrapper = mount(ProgressBar, {
        props: { value: 0, max: 100 }
      })

      // Simulate rapid updates
      for (let i = 0; i <= 100; i += 10) {
        await wrapper.setProps({ value: i })
      }

      // Should still be functional
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 100%')
    })
  })

  describe('Integration', () => {
    it('works with all features enabled', () => {
      wrapper = mount(ProgressBar, {
        props: {
          value: 65,
          max: 100,
          label: 'File Upload',
          color: 'success',
          size: 'lg',
          showLabel: true,
          showPercentage: true,
          showInfo: true,
          showValue: true,
          showTime: true,
          estimatedTime: 30,
          striped: true,
          shimmer: true,
          rounded: 'lg',
          speed: 'fast'
        }
      })

      // Check all features are working
      expect(wrapper.find('.progress-container--lg').exists()).toBe(true)
      expect(wrapper.find('.progress-fill--success').exists()).toBe(true)
      expect(wrapper.find('.progress-fill--striped').exists()).toBe(true)
      expect(wrapper.find('.progress-fill--shimmer').exists()).toBe(true)
      expect(wrapper.find('.progress-bar--lg').exists()).toBe(true)
      expect(wrapper.text()).toContain('File Upload')
      expect(wrapper.text()).toContain('65%')
      expect(wrapper.text()).toContain('65 / 100')
      expect(wrapper.text()).toContain('30s remaining')
    })
  })
})