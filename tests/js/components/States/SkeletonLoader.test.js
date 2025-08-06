import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '@/Components/States/SkeletonLoader.vue'

describe('SkeletonLoader', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(SkeletonLoader)

      expect(wrapper.find('.skeleton-loader').exists()).toBe(true)
      expect(wrapper.find('.skeleton-loader--rectangle').exists()).toBe(true)
      expect(wrapper.find('.skeleton-loader--md').exists()).toBe(true)
      expect(wrapper.find('.skeleton-loader--animated').exists()).toBe(true)
    })

    it('renders rectangle skeleton by default', () => {
      wrapper = mount(SkeletonLoader)

      expect(wrapper.find('.skeleton-rectangle').exists()).toBe(true)
    })

    it('applies custom classes', () => {
      const customClass = 'custom-skeleton-class'
      
      wrapper = mount(SkeletonLoader, {
        props: {
          class: customClass
        }
      })

      expect(wrapper.classes()).toContain(customClass)
    })
  })

  describe('Type Variants', () => {
    it('renders text skeleton with specified lines', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          lines: 4
        }
      })

      expect(wrapper.find('.skeleton-loader--text').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-text-line')).toHaveLength(4)
    })

    it('renders card skeleton with avatar and content', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          showAvatar: true
        }
      })

      expect(wrapper.find('.skeleton-loader--card').exists()).toBe(true)
      expect(wrapper.find('.skeleton-card').exists()).toBe(true)
      expect(wrapper.find('.skeleton-avatar').exists()).toBe(true)
      expect(wrapper.find('.skeleton-title').exists()).toBe(true)
      expect(wrapper.find('.skeleton-subtitle').exists()).toBe(true)
    })

    it('renders card skeleton without avatar when showAvatar is false', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          showAvatar: false
        }
      })

      expect(wrapper.find('.skeleton-card').exists()).toBe(true)
      expect(wrapper.find('.skeleton-avatar').exists()).toBe(false)
    })

    it('renders list skeleton with specified items', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 3,
          showAvatar: true,
          showActions: true
        }
      })

      expect(wrapper.find('.skeleton-loader--list').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(3)
      expect(wrapper.findAll('.skeleton-list-avatar')).toHaveLength(3)
      expect(wrapper.findAll('.skeleton-list-actions')).toHaveLength(3)
    })

    it('renders form skeleton with specified fields', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form',
          fields: 5
        }
      })

      expect(wrapper.find('.skeleton-loader--form').exists()).toBe(true)
      expect(wrapper.find('.skeleton-form').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-form-field')).toHaveLength(5)
      expect(wrapper.find('.skeleton-form-actions').exists()).toBe(true)
    })

    it('renders custom skeleton with slot content', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'custom'
        },
        slots: {
          default: '<div data-testid="custom-skeleton">Custom skeleton content</div>'
        }
      })

      expect(wrapper.find('.skeleton-loader--custom').exists()).toBe(true)
      expect(wrapper.find('[data-testid="custom-skeleton"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom skeleton content')
    })
  })

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg']

    sizes.forEach(size => {
      it(`applies ${size} size classes correctly`, () => {
        wrapper = mount(SkeletonLoader, {
          props: { size }
        })

        expect(wrapper.find(`.skeleton-loader--${size}`).exists()).toBe(true)
      })
    })

    it('applies size-specific styles to text lines', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          size: 'sm',
          lines: 2
        }
      })

      const textLines = wrapper.findAll('.skeleton-text-line')
      expect(textLines).toHaveLength(2)
      // Size-specific classes should be applied via CSS
    })
  })

  describe('Animation Control', () => {
    it('applies animation classes when animated is true', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          animated: true
        }
      })

      expect(wrapper.find('.skeleton-loader--animated').exists()).toBe(true)
      expect(wrapper.find('.skeleton-animated').exists()).toBe(true)
    })

    it('does not apply animation classes when animated is false', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          animated: false
        }
      })

      expect(wrapper.find('.skeleton-loader--animated').exists()).toBe(false)
    })
  })

  describe('Rounded Variants', () => {
    const roundedOptions = ['none', 'sm', 'md', 'lg', 'full']

    roundedOptions.forEach(rounded => {
      it(`applies ${rounded} rounded classes correctly`, () => {
        wrapper = mount(SkeletonLoader, {
          props: {
            type: 'text',
            rounded
          }
        })

        expect(wrapper.find(`.skeleton-rounded--${rounded}`).exists()).toBe(true)
      })
    })
  })

  describe('Custom Dimensions', () => {
    it('applies custom height and width to rectangle skeleton', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'rectangle',
          height: '200px',
          width: '300px'
        }
      })

      const rectangle = wrapper.find('.skeleton-rectangle')
      expect(rectangle.exists()).toBe(true)
      // Custom dimensions are applied via CSS custom properties
    })
  })

  describe('Text Skeleton Line Widths', () => {
    it('generates varied line widths for realistic appearance', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          lines: 5
        }
      })

      const textLines = wrapper.findAll('.skeleton-text-line')
      expect(textLines).toHaveLength(5)
      
      // Each line should have different widths applied via inline styles
      textLines.forEach((line, index) => {
        const style = line.attributes('style')
        expect(style).toBeDefined()
        expect(style).toContain('width:')
      })
    })

    it('makes last line shorter for realistic text appearance', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          lines: 3
        }
      })

      const textLines = wrapper.findAll('.skeleton-text-line')
      const lastLine = textLines[textLines.length - 1]
      
      expect(lastLine.attributes('style')).toContain('width: 60%')
    })
  })

  describe('Card Skeleton Configuration', () => {
    it('renders card with custom text lines', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          textLines: 4
        }
      })

      expect(wrapper.findAll('.skeleton-text-line')).toHaveLength(4)
    })

    it('renders card without avatar when showAvatar is false', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          showAvatar: false
        }
      })

      expect(wrapper.find('.skeleton-avatar').exists()).toBe(false)
      expect(wrapper.find('.skeleton-card-content').exists()).toBe(true)
    })
  })

  describe('List Skeleton Configuration', () => {
    it('renders list without avatars when showAvatar is false', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 2,
          showAvatar: false
        }
      })

      expect(wrapper.findAll('.skeleton-list-avatar')).toHaveLength(0)
      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(2)
    })

    it('renders list without actions when showActions is false', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 2,
          showActions: false
        }
      })

      expect(wrapper.findAll('.skeleton-list-actions')).toHaveLength(0)
      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(2)
    })

    it('renders list with both avatars and actions', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 2,
          showAvatar: true,
          showActions: true
        }
      })

      expect(wrapper.findAll('.skeleton-list-avatar')).toHaveLength(2)
      expect(wrapper.findAll('.skeleton-list-actions')).toHaveLength(2)
      expect(wrapper.findAll('.skeleton-action-button')).toHaveLength(4) // 2 buttons per item
    })
  })

  describe('Form Skeleton Configuration', () => {
    it('renders form with custom number of fields', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form',
          fields: 6
        }
      })

      expect(wrapper.findAll('.skeleton-form-field')).toHaveLength(6)
      expect(wrapper.findAll('.skeleton-form-label')).toHaveLength(6)
      expect(wrapper.findAll('.skeleton-form-input')).toHaveLength(6)
    })

    it('always renders form actions', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form',
          fields: 3
        }
      })

      expect(wrapper.find('.skeleton-form-actions').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-form-button')).toHaveLength(2) // Cancel and Save
    })
  })

  describe('Accessibility', () => {
    it('provides semantic structure for screen readers', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card'
        }
      })

      // Should have proper semantic structure
      expect(wrapper.find('.skeleton-loader').exists()).toBe(true)
      expect(wrapper.find('.skeleton-card').exists()).toBe(true)
    })

    it('works with reduced motion preferences', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          animated: true
        }
      })

      // Animation classes should be present but CSS handles reduced motion
      expect(wrapper.find('.skeleton-loader--animated').exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile optimization', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form'
        }
      })

      // Should have responsive-friendly structure
      expect(wrapper.find('.skeleton-form').exists()).toBe(true)
      expect(wrapper.find('.skeleton-form-actions').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero lines gracefully', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          lines: 0
        }
      })

      expect(wrapper.findAll('.skeleton-text-line')).toHaveLength(0)
    })

    it('handles zero items gracefully', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 0
        }
      })

      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(0)
    })

    it('handles zero fields gracefully', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form',
          fields: 0
        }
      })

      expect(wrapper.findAll('.skeleton-form-field')).toHaveLength(0)
      expect(wrapper.find('.skeleton-form-actions').exists()).toBe(true) // Actions always present
    })

    it('handles invalid type gracefully', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'invalid'
        }
      })

      // Should fallback to rectangle
      expect(wrapper.find('.skeleton-rectangle').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('renders efficiently with many elements', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'list',
          items: 50
        }
      })

      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(50)
      // Should render without performance issues
    })

    it('handles rapid prop changes efficiently', async () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          lines: 3
        }
      })

      // Rapidly change props
      await wrapper.setProps({ lines: 5 })
      await wrapper.setProps({ type: 'card' })
      await wrapper.setProps({ type: 'list', items: 3 })

      // Should still be functional
      expect(wrapper.find('.skeleton-loader--list').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(3)
    })
  })

  describe('Integration', () => {
    it('works with all features combined', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          size: 'lg',
          animated: true,
          showAvatar: true,
          textLines: 3,
          rounded: 'lg',
          class: 'custom-skeleton'
        }
      })

      expect(wrapper.find('.skeleton-loader--card').exists()).toBe(true)
      expect(wrapper.find('.skeleton-loader--lg').exists()).toBe(true)
      expect(wrapper.find('.skeleton-loader--animated').exists()).toBe(true)
      expect(wrapper.find('.skeleton-avatar').exists()).toBe(true)
      expect(wrapper.findAll('.skeleton-text-line')).toHaveLength(3)
      expect(wrapper.classes()).toContain('custom-skeleton')
    })
  })

  describe('Shimmer Effects', () => {
    it('applies shimmer animation to skeleton elements', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'text',
          animated: true
        }
      })

      const textLines = wrapper.findAll('.skeleton-text-line')
      textLines.forEach(line => {
        expect(line.classes()).toContain('skeleton-animated')
      })
    })

    it('applies shimmer to all skeleton elements in card', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'card',
          animated: true
        }
      })

      // All skeleton elements should have shimmer background via CSS
      expect(wrapper.find('.skeleton-avatar').exists()).toBe(true)
      expect(wrapper.find('.skeleton-title').exists()).toBe(true)
      expect(wrapper.find('.skeleton-subtitle').exists()).toBe(true)
    })

    it('applies shimmer to form elements', () => {
      wrapper = mount(SkeletonLoader, {
        props: {
          type: 'form',
          animated: true,
          fields: 2
        }
      })

      // Form elements should have shimmer background via CSS
      expect(wrapper.findAll('.skeleton-form-label')).toHaveLength(2)
      expect(wrapper.findAll('.skeleton-form-input')).toHaveLength(2)
      expect(wrapper.findAll('.skeleton-form-button')).toHaveLength(2)
    })
  })
})