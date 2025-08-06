import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/Components/States/EmptyState.vue'

// Mock the Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'size', 'color', 'class'],
    template: '<div class="mock-icon" :data-name="name" :data-size="size" :data-color="color"></div>'
  }
}))

describe('EmptyState', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(EmptyState)

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-title').text()).toBe('No data available')
      expect(wrapper.find('.empty-icon').exists()).toBe(true)
    })

    it('renders custom title and description', () => {
      const title = 'Custom Title'
      const description = 'Custom description text'

      wrapper = mount(EmptyState, {
        props: { title, description }
      })

      expect(wrapper.find('.empty-title').text()).toBe(title)
      expect(wrapper.find('.empty-description').text()).toBe(description)
    })

    it('renders help text when provided', () => {
      const helpText = 'This is helpful information'

      wrapper = mount(EmptyState, {
        props: { helpText }
      })

      expect(wrapper.find('.empty-help').exists()).toBe(true)
      expect(wrapper.find('.help-text').text()).toBe(helpText)
    })

    it('renders custom content in default slot', () => {
      wrapper = mount(EmptyState, {
        slots: {
          default: '<div data-testid="custom-content">Custom Content</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-content"]').exists()).toBe(true)
      expect(wrapper.find('.empty-custom-content').exists()).toBe(true)
    })
  })

  describe('Empty Types', () => {
    it('displays correct defaults for no-data type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'no-data' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('No data available')
      expect(wrapper.find('.empty-description').text()).toBe('There is no data to display at the moment.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('document-text')
      expect(icon.attributes('data-color')).toBe('neutral')
    })

    it('displays correct defaults for no-results type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'no-results' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('No results found')
      expect(wrapper.find('.empty-description').text()).toBe('Try adjusting your search or filter criteria.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('magnifying-glass')
    })

    it('displays correct defaults for no-permissions type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'no-permissions' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('Access restricted')
      expect(wrapper.find('.empty-description').text()).toBe('You don\'t have permission to view this content.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('shield-exclamation')
      expect(icon.attributes('data-color')).toBe('warning')
    })

    it('displays correct defaults for error type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'error' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('Something went wrong')
      expect(wrapper.find('.empty-description').text()).toBe('An error occurred while loading the content.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('exclamation-triangle')
      expect(icon.attributes('data-color')).toBe('error')
    })

    it('displays correct defaults for loading type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'loading' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('Loading...')
      expect(wrapper.find('.empty-description').text()).toBe('Please wait while we load your content.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('loading')
      expect(icon.attributes('data-color')).toBe('primary')
    })

    it('displays correct defaults for maintenance type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'maintenance' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('Under maintenance')
      expect(wrapper.find('.empty-description').text()).toBe('This feature is temporarily unavailable.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('wrench-screwdriver')
      expect(icon.attributes('data-color')).toBe('info')
    })

    it('displays correct defaults for search type', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'search' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('No search results')
      expect(wrapper.find('.empty-description').text()).toBe('Try different keywords or check your spelling.')
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('magnifying-glass')
    })
  })

  describe('Variants', () => {
    it('applies default variant classes', () => {
      wrapper = mount(EmptyState)

      expect(wrapper.find('.empty-state--default').exists()).toBe(true)
    })

    it('applies minimal variant classes', () => {
      wrapper = mount(EmptyState, {
        props: { variant: 'minimal' }
      })

      expect(wrapper.find('.empty-state--minimal').exists()).toBe(true)
    })

    it('applies illustration variant classes', () => {
      wrapper = mount(EmptyState, {
        props: { variant: 'illustration' }
      })

      expect(wrapper.find('.empty-state--illustration').exists()).toBe(true)
    })

    it('shows illustration for illustration variant', () => {
      const illustration = '/path/to/illustration.svg'

      wrapper = mount(EmptyState, {
        props: { 
          variant: 'illustration',
          illustration 
        }
      })

      expect(wrapper.find('.empty-illustration').exists()).toBe(true)
      expect(wrapper.find('.empty-illustration-image').attributes('src')).toBe(illustration)
    })

    it('renders custom illustration slot', () => {
      wrapper = mount(EmptyState, {
        props: { variant: 'illustration' },
        slots: {
          illustration: '<div data-testid="custom-illustration">Custom Illustration</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-illustration"]').exists()).toBe(true)
    })
  })

  describe('Sizes', () => {
    it('applies small size classes', () => {
      wrapper = mount(EmptyState, {
        props: { size: 'sm' }
      })

      expect(wrapper.find('.empty-state--sm').exists()).toBe(true)
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-size')).toBe('lg')
    })

    it('applies medium size classes (default)', () => {
      wrapper = mount(EmptyState, {
        props: { size: 'md' }
      })

      expect(wrapper.find('.empty-state--md').exists()).toBe(true)
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-size')).toBe('xl')
    })

    it('applies large size classes', () => {
      wrapper = mount(EmptyState, {
        props: { size: 'lg' }
      })

      expect(wrapper.find('.empty-state--lg').exists()).toBe(true)
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-size')).toBe('2xl')
    })

    it('applies extra large size classes', () => {
      wrapper = mount(EmptyState, {
        props: { size: 'xl' }
      })

      expect(wrapper.find('.empty-state--xl').exists()).toBe(true)
      
      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-size')).toBe('2xl')
    })
  })

  describe('Icons', () => {
    it('renders custom icon', () => {
      wrapper = mount(EmptyState, {
        props: { icon: 'custom-icon' }
      })

      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('custom-icon')
    })

    it('renders custom icon slot', () => {
      wrapper = mount(EmptyState, {
        slots: {
          icon: '<div data-testid="custom-icon">Custom Icon</div>'
        }
      })

      expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
    })

    it('renders default icon when none specified', () => {
      wrapper = mount(EmptyState)

      const icon = wrapper.find('.mock-icon')
      expect(icon.attributes('data-name')).toBe('document-text')
    })
  })

  describe('Actions', () => {
    it('renders action buttons', () => {
      const actions = [
        {
          id: 'action1',
          label: 'Action 1',
          icon: 'plus',
          variant: 'primary',
          handler: vi.fn()
        },
        {
          id: 'action2',
          label: 'Action 2',
          variant: 'secondary',
          handler: vi.fn()
        }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      expect(wrapper.find('.empty-actions').exists()).toBe(true)
      
      const buttons = wrapper.findAll('.empty-action-button')
      expect(buttons).toHaveLength(2)
      
      expect(buttons[0].text()).toContain('Action 1')
      expect(buttons[1].text()).toContain('Action 2')
    })

    it('handles action clicks', async () => {
      const handler = vi.fn()
      const actions = [
        {
          id: 'test-action',
          label: 'Test Action',
          handler
        }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const button = wrapper.find('.empty-action-button')
      await button.trigger('click')

      expect(handler).toHaveBeenCalled()
      expect(wrapper.emitted('action')).toBeTruthy()
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0])
    })

    it('disables action buttons when specified', () => {
      const actions = [
        {
          id: 'disabled-action',
          label: 'Disabled Action',
          disabled: true,
          handler: vi.fn()
        }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const button = wrapper.find('.empty-action-button')
      expect(button.classes()).toContain('opacity-50')
      expect(button.classes()).toContain('cursor-not-allowed')
    })

    it('does not handle clicks on disabled actions', async () => {
      const handler = vi.fn()
      const actions = [
        {
          id: 'disabled-action',
          label: 'Disabled Action',
          disabled: true,
          handler
        }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const button = wrapper.find('.empty-action-button')
      await button.trigger('click')

      expect(handler).not.toHaveBeenCalled()
      expect(wrapper.emitted('action')).toBeFalsy()
    })

    it('applies correct variant classes to action buttons', () => {
      const actions = [
        { id: '1', label: 'Primary', variant: 'primary' },
        { id: '2', label: 'Secondary', variant: 'secondary' },
        { id: '3', label: 'Ghost', variant: 'ghost' },
        { id: '4', label: 'Danger', variant: 'danger' }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const buttons = wrapper.findAll('.empty-action-button')
      
      expect(buttons[0].classes()).toContain('bg-primary-600')
      expect(buttons[1].classes()).toContain('bg-white')
      expect(buttons[2].classes()).toContain('text-primary-600')
      expect(buttons[3].classes()).toContain('bg-error-600')
    })

    it('applies correct size classes to action buttons', () => {
      const actions = [
        { id: '1', label: 'Small', size: 'sm' },
        { id: '2', label: 'Medium', size: 'md' },
        { id: '3', label: 'Large', size: 'lg' }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const buttons = wrapper.findAll('.empty-action-button')
      
      expect(buttons[0].classes()).toContain('px-3')
      expect(buttons[0].classes()).toContain('py-2')
      expect(buttons[0].classes()).toContain('text-sm')
      
      expect(buttons[1].classes()).toContain('px-4')
      expect(buttons[1].classes()).toContain('text-base')
      
      expect(buttons[2].classes()).toContain('px-6')
      expect(buttons[2].classes()).toContain('py-3')
      expect(buttons[2].classes()).toContain('text-lg')
    })

    it('renders custom actions slot', () => {
      wrapper = mount(EmptyState, {
        slots: {
          actions: '<button data-testid="custom-action">Custom Action</button>'
        }
      })

      expect(wrapper.find('[data-testid="custom-action"]').exists()).toBe(true)
      expect(wrapper.find('.empty-actions').exists()).toBe(true)
    })

    it('does not render actions section when no actions provided', () => {
      wrapper = mount(EmptyState)

      expect(wrapper.find('.empty-actions').exists()).toBe(false)
    })
  })

  describe('Layout and Styling', () => {
    it('applies centered layout by default', () => {
      wrapper = mount(EmptyState)

      expect(wrapper.find('.empty-state--centered').exists()).toBe(true)
    })

    it('can disable centered layout', () => {
      wrapper = mount(EmptyState, {
        props: { centered: false }
      })

      expect(wrapper.find('.empty-state--centered').exists()).toBe(false)
    })

    it('applies custom CSS classes', () => {
      const customClass = 'custom-empty-state'

      wrapper = mount(EmptyState, {
        props: { class: customClass }
      })

      expect(wrapper.find(`.${customClass}`).exists()).toBe(true)
    })

    it('applies empty type specific classes', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'error' }
      })

      expect(wrapper.find('.empty-state--error').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      wrapper = mount(EmptyState, {
        props: { title: 'Test Title' }
      })

      const title = wrapper.find('.empty-title')
      expect(title.element.tagName).toBe('H3')
    })

    it('has proper button types', () => {
      const actions = [
        { id: 'action1', label: 'Action 1' }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const button = wrapper.find('.empty-action-button')
      expect(button.attributes('type')).toBe('button')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      wrapper = mount(EmptyState)

      // Check for responsive classes in the component
      expect(wrapper.html()).toContain('sm:')
      expect(wrapper.html()).toContain('lg:')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      wrapper = mount(EmptyState, {
        props: { title: '' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('No data available')
    })

    it('handles empty description gracefully', () => {
      wrapper = mount(EmptyState, {
        props: { description: '' }
      })

      expect(wrapper.find('.empty-description').exists()).toBe(false)
    })

    it('handles actions without handlers', async () => {
      const actions = [
        { id: 'action1', label: 'Action 1' }
      ]

      wrapper = mount(EmptyState, {
        props: { actions }
      })

      const button = wrapper.find('.empty-action-button')
      
      // Should not throw error
      await button.trigger('click')
      
      expect(wrapper.emitted('action')).toBeTruthy()
    })

    it('handles invalid variant gracefully', () => {
      // Vue should handle prop validation, but test fallback
      wrapper = mount(EmptyState, {
        props: { variant: 'invalid' }
      })

      // Should still render without errors
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('handles invalid size gracefully', () => {
      wrapper = mount(EmptyState, {
        props: { size: 'invalid' }
      })

      // Should still render without errors
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('handles invalid empty type gracefully', () => {
      wrapper = mount(EmptyState, {
        props: { emptyType: 'invalid' }
      })

      // Should fall back to default
      expect(wrapper.find('.empty-title').text()).toBe('No data available')
    })
  })
})