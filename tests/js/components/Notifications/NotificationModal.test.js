import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationModal from '@/Components/Notifications/NotificationModal.vue'

// Mock the icon config
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => `Icon${name}`)
}))

describe('NotificationModal', () => {
  let wrapper

  const defaultProps = {
    visible: true,
    title: 'Test Modal',
    description: 'Test modal description',
    type: 'info'
  }

  beforeEach(() => {
    // Mock document methods
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()
    document.activeElement = { focus: vi.fn() }
    document.querySelector = vi.fn()
    document.querySelectorAll = vi.fn(() => [])
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render modal when visible is true', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(wrapper.find('.notification-modal').exists()).toBe(true)
      expect(wrapper.find('.modal-title').text()).toBe('Test Modal')
      expect(wrapper.find('.modal-description').text()).toBe('Test modal description')
    })

    it('should not render modal when visible is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          visible: false
        }
      })

      expect(wrapper.find('.notification-modal').exists()).toBe(false)
    })

    it('should render with correct type classes', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          type: 'success'
        }
      })

      expect(wrapper.find('.notification-modal--success').exists()).toBe(true)
    })

    it('should render with correct size classes', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          size: 'lg'
        }
      })

      expect(wrapper.find('.notification-modal--lg').exists()).toBe(true)
    })
  })

  describe('Header Section', () => {
    it('should show header by default', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-header').exists()).toBe(true)
    })

    it('should hide header when showHeader is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          showHeader: false
        }
      })

      expect(wrapper.find('.modal-header').exists()).toBe(false)
    })

    it('should show icon by default', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-icon').exists()).toBe(true)
    })

    it('should hide icon when showIcon is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          showIcon: false
        }
      })

      expect(wrapper.find('.modal-icon').exists()).toBe(false)
    })

    it('should show close button when closable is true', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closable: true,
          showCloseButton: true
        }
      })

      expect(wrapper.find('.modal-close-button').exists()).toBe(true)
    })

    it('should hide close button when showCloseButton is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closable: true,
          showCloseButton: false
        }
      })

      expect(wrapper.find('.modal-close-button').exists()).toBe(false)
    })
  })

  describe('Content Section', () => {
    it('should render slot content', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps,
        slots: {
          default: '<p>Custom content</p>'
        }
      })

      expect(wrapper.find('.modal-content').exists()).toBe(true)
      expect(wrapper.html()).toContain('<p>Custom content</p>')
    })

    it('should not render content section when no slot provided', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-content').exists()).toBe(false)
    })
  })

  describe('Actions Section', () => {
    it('should show actions by default', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-actions').exists()).toBe(true)
    })

    it('should hide actions when showActions is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          showActions: false
        }
      })

      expect(wrapper.find('.modal-actions').exists()).toBe(false)
    })

    it('should show cancel button by default', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      const cancelButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Cancel'
      )
      expect(cancelButton.length).toBeGreaterThan(0)
    })

    it('should hide cancel button when showCancel is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          showCancel: false
        }
      })

      const cancelButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Cancel'
      )
      expect(cancelButton.length).toBe(0)
    })

    it('should show confirm button by default', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      const confirmButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Confirm'
      )
      expect(confirmButton.length).toBeGreaterThan(0)
    })

    it('should hide confirm button when showConfirm is false', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          showConfirm: false
        }
      })

      const confirmButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Confirm'
      )
      expect(confirmButton.length).toBe(0)
    })

    it('should use custom button text', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          cancelText: 'No',
          confirmText: 'Yes'
        }
      })

      expect(wrapper.text()).toContain('No')
      expect(wrapper.text()).toContain('Yes')
    })
  })

  describe('Events', () => {
    it('should emit close event when close button is clicked', async () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closable: true,
          showCloseButton: true
        }
      })

      await wrapper.find('.modal-close-button').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit confirm event when confirm button is clicked', async () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      const confirmButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Confirm'
      )[0]
      await confirmButton.trigger('click')
      
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('should emit cancel event when cancel button is clicked', async () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      const cancelButton = wrapper.find('button').filter(btn => 
        btn.text() === 'Cancel'
      )[0]
      await cancelButton.trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should emit close event when overlay is clicked and closeOnOverlay is true', async () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closeOnOverlay: true
        }
      })

      await wrapper.find('.notification-modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close event when overlay is clicked and closeOnOverlay is false', async () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closeOnOverlay: false
        }
      })

      await wrapper.find('.notification-modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          loading: true
        }
      })

      expect(wrapper.find('.notification-modal--loading').exists()).toBe(true)
    })

    it('should disable buttons when loading is true', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          loading: true
        }
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Persistent Modal', () => {
    it('should not close when persistent is true', async () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          persistent: true,
          closable: true
        }
      })

      await wrapper.find('.modal-close-button').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should not close on overlay click when persistent is true', async () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          persistent: true,
          closeOnOverlay: true
        }
      })

      await wrapper.find('.notification-modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      const modal = wrapper.find('[role="dialog"]')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('aria-modal')).toBe('true')
      expect(modal.attributes('aria-labelledby')).toBeDefined()
      expect(modal.attributes('aria-describedby')).toBeDefined()
    })

    it('should have proper close button label', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          closable: true,
          showCloseButton: true,
          closeLabel: 'Close dialog'
        }
      })

      const closeButton = wrapper.find('.modal-close-button')
      expect(closeButton.attributes('aria-label')).toBe('Close dialog')
    })
  })

  describe('Custom Icon', () => {
    it('should use custom icon when provided', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          icon: 'custom-icon'
        }
      })

      expect(wrapper.find('.modal-icon').exists()).toBe(true)
    })
  })

  describe('Z-Index', () => {
    it('should apply custom z-index', () => {
      wrapper = mount(NotificationModal, {
        props: {
          ...defaultProps,
          zIndex: 2000
        }
      })

      const overlay = wrapper.find('.notification-modal-overlay')
      expect(overlay.element.style.zIndex).toBe('2000')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should set up keyboard event listeners on mount', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should clean up keyboard event listeners on unmount', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      wrapper.unmount()

      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Focus Management', () => {
    it('should attempt to set initial focus when visible', async () => {
      const mockElement = { focus: vi.fn() }
      document.querySelector = vi.fn(() => mockElement)
      document.querySelectorAll = vi.fn(() => [mockElement])

      wrapper = mount(NotificationModal, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      // Focus management is complex and depends on DOM, so we just verify the setup
      expect(document.querySelector).toHaveBeenCalled()
    })
  })

  describe('Custom Actions Slot', () => {
    it('should render custom actions slot', () => {
      wrapper = mount(NotificationModal, {
        props: defaultProps,
        slots: {
          actions: '<button class="custom-action">Custom Action</button>'
        }
      })

      expect(wrapper.find('.custom-action').exists()).toBe(true)
      expect(wrapper.find('.custom-action').text()).toBe('Custom Action')
    })
  })
})