import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastNotification from '@/Components/Notifications/ToastNotification.vue'

// Mock the icon config
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => `Icon${name}`)
}))

describe('ToastNotification', () => {
  let wrapper

  const defaultProps = {
    message: 'Test notification message',
    type: 'info',
    position: 'top-right'
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render notification message', () => {
      wrapper = mount(ToastNotification, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Test notification message')
    })

    it('should render with title when provided', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          title: 'Test Title'
        }
      })

      expect(wrapper.find('.toast-title').text()).toBe('Test Title')
      expect(wrapper.text()).toContain('Test notification message')
    })

    it('should render with correct type classes', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          type: 'success'
        }
      })

      expect(wrapper.classes()).toContain('toast-notification--success')
    })

    it('should render with correct position classes', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          position: 'bottom-left'
        }
      })

      expect(wrapper.classes()).toContain('toast-notification--bottom-left')
    })

    it('should render with correct size classes', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          size: 'lg'
        }
      })

      expect(wrapper.classes()).toContain('toast-notification--lg')
    })
  })

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      wrapper = mount(ToastNotification, {
        props: defaultProps
      })

      expect(wrapper.find('.toast-icon').exists()).toBe(true)
    })

    it('should hide icon when showIcon is false', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          showIcon: false
        }
      })

      expect(wrapper.find('.toast-icon').exists()).toBe(false)
    })

    it('should use custom icon when provided', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          icon: 'custom-icon'
        }
      })

      expect(wrapper.find('.toast-icon').exists()).toBe(true)
    })

    it('should show loading animation for loading type', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          type: 'loading'
        }
      })

      const icon = wrapper.find('.toast-icon svg')
      expect(icon.classes()).toContain('animate-spin')
    })
  })

  describe('Progress Bar', () => {
    it('should show progress bar by default when duration > 0', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 5000
        }
      })

      expect(wrapper.find('.toast-progress').exists()).toBe(true)
    })

    it('should hide progress bar when showProgress is false', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 5000,
          showProgress: false
        }
      })

      expect(wrapper.find('.toast-progress').exists()).toBe(false)
    })

    it('should not show progress bar when duration is 0', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 0
        }
      })

      expect(wrapper.find('.toast-progress').exists()).toBe(false)
    })

    it('should have correct progress bar type class', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          type: 'success',
          duration: 5000
        }
      })

      const progressBar = wrapper.find('.toast-progress')
      expect(progressBar.classes()).toContain('toast-progress--success')
    })
  })

  describe('Actions', () => {
    it('should show close button when closable is true', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          closable: true
        }
      })

      expect(wrapper.find('.toast-close-button').exists()).toBe(true)
    })

    it('should hide close button when closable is false', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          closable: false
        }
      })

      expect(wrapper.find('.toast-close-button').exists()).toBe(false)
    })

    it('should show action button when actionText is provided', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          actionText: 'Retry'
        }
      })

      const actionButton = wrapper.find('.toast-action-button')
      expect(actionButton.exists()).toBe(true)
      expect(actionButton.text()).toBe('Retry')
    })

    it('should emit close event when close button is clicked', async () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          closable: true
        }
      })

      await wrapper.find('.toast-close-button').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit action event when action button is clicked', async () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          actionText: 'Retry'
        }
      })

      await wrapper.find('.toast-action-button').trigger('click')
      expect(wrapper.emitted('action')).toBeTruthy()
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after duration when not persistent', () => {
      const closeSpy = vi.fn()
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 1000,
          persistent: false
        }
      })

      wrapper.vm.$on('close', closeSpy)

      vi.advanceTimersByTime(1000)

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should not auto-dismiss when persistent is true', () => {
      const closeSpy = vi.fn()
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 1000,
          persistent: true
        }
      })

      wrapper.vm.$on('close', closeSpy)

      vi.advanceTimersByTime(1000)

      expect(closeSpy).not.toHaveBeenCalled()
    })

    it('should not auto-dismiss when duration is 0', () => {
      const closeSpy = vi.fn()
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 0
        }
      })

      wrapper.vm.$on('close', closeSpy)

      vi.advanceTimersByTime(5000)

      expect(closeSpy).not.toHaveBeenCalled()
    })
  })

  describe('Timer Pause/Resume', () => {
    it('should pause timer on mouse enter', async () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 2000
        }
      })

      await wrapper.trigger('mouseenter')

      // Advance time but notification should not close due to pause
      vi.advanceTimersByTime(2000)
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should resume timer on mouse leave', async () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 1000
        }
      })

      // Pause timer
      await wrapper.trigger('mouseenter')
      vi.advanceTimersByTime(500)

      // Resume timer
      await wrapper.trigger('mouseleave')
      vi.advanceTimersByTime(1000)

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          priority: 'high'
        }
      })

      const notification = wrapper.find('[role="alert"]')
      expect(notification.exists()).toBe(true)
      expect(notification.attributes('aria-live')).toBe('assertive')
    })

    it('should have polite aria-live for normal priority', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          priority: 'normal'
        }
      })

      const notification = wrapper.find('[role="alert"]')
      expect(notification.attributes('aria-live')).toBe('polite')
    })

    it('should have proper close button label', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          closable: true,
          closeLabel: 'Close notification'
        }
      })

      const closeButton = wrapper.find('.toast-close-button')
      expect(closeButton.attributes('aria-label')).toBe('Close notification')
    })
  })

  describe('Sound Notification', () => {
    it('should attempt to play sound when sound is enabled', () => {
      const mockPlay = vi.fn().mockResolvedValue()
      const mockAudio = {
        play: mockPlay,
        volume: 0
      }

      global.Audio = vi.fn(() => mockAudio)

      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          sound: true
        }
      })

      expect(global.Audio).toHaveBeenCalled()
    })

    it('should not play sound when sound is disabled', () => {
      global.Audio = vi.fn()

      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          sound: false
        }
      })

      expect(global.Audio).not.toHaveBeenCalled()
    })
  })

  describe('Slot Content', () => {
    it('should render slot content instead of message prop', () => {
      wrapper = mount(ToastNotification, {
        props: defaultProps,
        slots: {
          default: '<strong>Custom content</strong>'
        }
      })

      expect(wrapper.html()).toContain('<strong>Custom content</strong>')
    })
  })

  describe('Z-Index', () => {
    it('should apply custom z-index', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          zIndex: 2000
        }
      })

      expect(wrapper.element.style.zIndex).toBe('2000')
    })
  })

  describe('Component Lifecycle', () => {
    it('should show notification on mount', () => {
      wrapper = mount(ToastNotification, {
        props: defaultProps
      })

      expect(wrapper.vm.visible).toBe(true)
    })

    it('should clean up timers on unmount', () => {
      wrapper = mount(ToastNotification, {
        props: {
          ...defaultProps,
          duration: 5000
        }
      })

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame')

      wrapper.unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    })
  })
})