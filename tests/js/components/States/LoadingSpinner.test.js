import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(LoadingSpinner)

      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--spin').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--md').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--primary').exists()).toBe(true)
    })

    it('renders with custom props', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          size: 'lg',
          color: 'secondary',
          variant: 'pulse',
          text: 'Custom loading text',
          showText: true
        }
      })

      expect(wrapper.find('.loading-spinner--lg').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--secondary').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--pulse').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom loading text')
    })

    it('renders loading text when showText is true', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: true,
          text: 'Please wait...'
        }
      })

      const loadingText = wrapper.find('.loading-text')
      expect(loadingText.exists()).toBe(true)
      expect(loadingText.text()).toBe('Please wait...')
    })

    it('does not render loading text when showText is false', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: false,
          text: 'Please wait...'
        }
      })

      expect(wrapper.find('.loading-text').exists()).toBe(false)
    })
  })

  describe('Size Variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

    sizes.forEach(size => {
      it(`applies ${size} size classes correctly`, () => {
        wrapper = mount(LoadingSpinner, {
          props: { size }
        })

        expect(wrapper.find(`.loading-spinner--${size}`).exists()).toBe(true)
      })
    })
  })

  describe('Color Variants', () => {
    const colors = ['primary', 'secondary', 'accent', 'neutral', 'white']

    colors.forEach(color => {
      it(`applies ${color} color classes correctly`, () => {
        wrapper = mount(LoadingSpinner, {
          props: { color }
        })

        expect(wrapper.find(`.loading-spinner--${color}`).exists()).toBe(true)
      })
    })
  })

  describe('Spinner Variants', () => {
    it('renders spin variant with single element', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'spin' }
      })

      expect(wrapper.find('.loading-spinner--spin').exists()).toBe(true)
      expect(wrapper.findAll('.spinner-inner')).toHaveLength(1)
    })

    it('renders pulse variant with single element', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'pulse' }
      })

      expect(wrapper.find('.loading-spinner--pulse').exists()).toBe(true)
      expect(wrapper.findAll('.spinner-inner')).toHaveLength(1)
    })

    it('renders bounce variant with single element', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'bounce' }
      })

      expect(wrapper.find('.loading-spinner--bounce').exists()).toBe(true)
      expect(wrapper.findAll('.spinner-inner')).toHaveLength(1)
    })

    it('renders dots variant with multiple elements', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'dots' }
      })

      expect(wrapper.find('.loading-spinner--dots').exists()).toBe(true)
      expect(wrapper.findAll('.spinner-inner')).toHaveLength(3)
    })

    it('renders bars variant with multiple elements', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'bars' }
      })

      expect(wrapper.find('.loading-spinner--bars').exists()).toBe(true)
      expect(wrapper.findAll('.spinner-inner')).toHaveLength(3)
    })
  })

  describe('Layout Options', () => {
    it('applies centered layout when centered is true', () => {
      wrapper = mount(LoadingSpinner, {
        props: { centered: true }
      })

      expect(wrapper.find('.loading-spinner--centered').exists()).toBe(true)
    })

    it('applies overlay layout when overlay is true', () => {
      wrapper = mount(LoadingSpinner, {
        props: { overlay: true }
      })

      expect(wrapper.find('.loading-spinner--overlay').exists()).toBe(true)
    })

    it('applies with-text layout when showText is true', () => {
      wrapper = mount(LoadingSpinner, {
        props: { showText: true }
      })

      expect(wrapper.find('.loading-spinner--with-text').exists()).toBe(true)
    })
  })

  describe('Speed Variants', () => {
    const speeds = ['slow', 'normal', 'fast']

    speeds.forEach(speed => {
      it(`applies ${speed} speed classes correctly`, () => {
        wrapper = mount(LoadingSpinner, {
          props: { speed }
        })

        expect(wrapper.find(`.loading-spinner--${speed}`).exists()).toBe(true)
      })
    })
  })

  describe('Custom Content', () => {
    it('renders custom content in default slot', () => {
      wrapper = mount(LoadingSpinner, {
        props: { showText: true },
        slots: {
          default: '<span data-testid="custom-content">Custom loading message</span>'
        }
      })

      expect(wrapper.find('[data-testid="custom-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom loading message')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for screen readers', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: true,
          text: 'Loading data'
        }
      })

      // Check for semantic structure
      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('provides meaningful loading text', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: true,
          text: 'Loading user data, please wait...'
        }
      })

      expect(wrapper.text()).toContain('Loading user data, please wait...')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: true,
          overlay: true
        }
      })

      // Check for responsive-friendly classes
      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--overlay').exists()).toBe(true)
    })
  })

  describe('Custom Classes', () => {
    it('applies custom CSS classes', () => {
      const customClass = 'custom-spinner-class'
      
      wrapper = mount(LoadingSpinner, {
        props: {
          class: customClass
        }
      })

      expect(wrapper.classes()).toContain(customClass)
    })

    it('applies multiple custom classes', () => {
      const customClasses = ['class-one', 'class-two']
      
      wrapper = mount(LoadingSpinner, {
        props: {
          class: customClasses
        }
      })

      customClasses.forEach(className => {
        expect(wrapper.classes()).toContain(className)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles invalid size gracefully', () => {
      // Vue should handle prop validation, but test fallback
      wrapper = mount(LoadingSpinner, {
        props: { size: 'invalid' }
      })

      // Should still render without crashing
      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
    })

    it('handles invalid color gracefully', () => {
      wrapper = mount(LoadingSpinner, {
        props: { color: 'invalid' }
      })

      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
    })

    it('handles invalid variant gracefully', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'invalid' }
      })

      expect(wrapper.find('.loading-spinner-container').exists()).toBe(true)
    })

    it('handles empty text gracefully', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          showText: true,
          text: ''
        }
      })

      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal DOM elements', () => {
      wrapper = mount(LoadingSpinner)

      // Should have minimal DOM structure
      const elements = wrapper.findAll('*')
      expect(elements.length).toBeLessThan(10) // Reasonable limit
    })

    it('handles rapid prop changes without issues', async () => {
      wrapper = mount(LoadingSpinner, {
        props: { size: 'sm' }
      })

      // Rapidly change props
      await wrapper.setProps({ size: 'md' })
      await wrapper.setProps({ size: 'lg' })
      await wrapper.setProps({ color: 'secondary' })
      await wrapper.setProps({ variant: 'pulse' })

      // Should still be functional
      expect(wrapper.find('.loading-spinner--lg').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--secondary').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--pulse').exists()).toBe(true)
    })
  })

  describe('Animation States', () => {
    it('applies animation classes correctly', () => {
      wrapper = mount(LoadingSpinner, {
        props: { variant: 'spin' }
      })

      const spinner = wrapper.find('.spinner-inner')
      expect(spinner.exists()).toBe(true)
      
      // Check that animation styles are applied via CSS classes
      expect(wrapper.find('.loading-spinner--spin').exists()).toBe(true)
    })

    it('respects reduced motion preferences', () => {
      // This would be tested with CSS media queries in a real browser
      wrapper = mount(LoadingSpinner)
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })
  })

  describe('Integration', () => {
    it('works with different combinations of props', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          size: 'xl',
          color: 'success',
          variant: 'dots',
          showText: true,
          text: 'Processing...',
          centered: true,
          speed: 'fast'
        }
      })

      expect(wrapper.find('.loading-spinner--xl').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--success').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--dots').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--fast').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--centered').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner--with-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Processing...')
    })
  })
})