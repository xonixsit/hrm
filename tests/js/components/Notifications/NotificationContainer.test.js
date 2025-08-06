import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationContainer from '@/Components/Notifications/NotificationContainer.vue'
import notificationQueue from '@/services/NotificationQueue'

// Mock the notification components
vi.mock('@/Components/Notifications/ToastNotification.vue', () => ({
  default: {
    name: 'ToastNotification',
    template: '<div class="mock-toast">{{ message }}</div>',
    props: ['message', 'type', 'position'],
    emits: ['close', 'action']
  }
}))

vi.mock('@/Components/Notifications/NotificationModal.vue', () => ({
  default: {
    name: 'NotificationModal',
    template: '<div class="mock-modal">{{ title }}</div>',
    props: ['title', 'visible'],
    emits: ['close', 'confirm', 'cancel']
  }
}))

describe('NotificationContainer', () => {
  let wrapper

  beforeEach(() => {
    // Clear all notifications before each test
    notificationQueue.clear()
    
    // Mock window object
    global.window = {
      notify: undefined
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render notification container', () => {
      wrapper = mount(NotificationContainer)
      
      expect(wrapper.find('.notification-container').exists()).toBe(true)
    })

    it('should render toast notifications', async () => {
      wrapper = mount(NotificationContainer)
      
      // Add a toast notification
      notificationQueue.add({
        message: 'Test toast',
        type: 'info',
        position: 'top-right'
      })

      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.mock-toast').exists()).toBe(true)
      expect(wrapper.find('.mock-toast').text()).toBe('Test toast')
    })

    it('should render modal notifications', async () => {
      wrapper = mount(NotificationContainer)
      
      // Add a modal notification
      notificationQueue.add({
        type: 'confirm',
        component: 'NotificationModal',
        props: {
          title: 'Test Modal',
          visible: true
        }
      })

      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.mock-modal').exists()).toBe(true)
      expect(wrapper.find('.mock-modal').text()).toBe('Test Modal')
    })
  })

  describe('Position Management', () => {
    it('should render notifications in correct position containers', async () => {
      wrapper = mount(NotificationContainer)
      
      // Add notifications to different positions
      notificationQueue.add({
        message: 'Top Left',
        position: 'top-left'
      })
      
      notificationQueue.add({
        message: 'Bottom Right',
        position: 'bottom-right'
      })

      await wrapper.vm.$nextTick()
      
      const containers = wrapper.findAll('[class*="top-4"], [class*="bottom-4"]')
      expect(containers.length).toBeGreaterThan(0)
    })

    it('should apply correct position classes', () => {
      wrapper = mount(NotificationContainer)
      
      const positions = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
      ]

      positions.forEach(position => {
        const classes = wrapper.vm.getPositionClasses(position)
        expect(classes).toContain('fixed')
        expect(classes).toContain('z-50')
      })
    })
  })

  describe('Transition Names', () => {
    it('should return correct transition names for positions', () => {
      wrapper = mount(NotificationContainer)
      
      expect(wrapper.vm.getTransitionName('top-left')).toBe('slide-left')
      expect(wrapper.vm.getTransitionName('bottom-left')).toBe('slide-left')
      expect(wrapper.vm.getTransitionName('top-right')).toBe('slide-right')
      expect(wrapper.vm.getTransitionName('bottom-right')).toBe('slide-right')
      expect(wrapper.vm.getTransitionName('top-center')).toBe('slide-center')
      expect(wrapper.vm.getTransitionName('bottom-center')).toBe('slide-center')
    })
  })

  describe('Event Handling', () => {
    it('should handle notification close events', async () => {
      wrapper = mount(NotificationContainer)
      
      const id = notificationQueue.add({
        message: 'Test notification',
        type: 'info'
      })

      expect(notificationQueue.exists(id)).toBe(true)
      
      wrapper.vm.handleNotificationClose(id)
      
      expect(notificationQueue.exists(id)).toBe(false)
    })

    it('should handle notification action events', async () => {
      wrapper = mount(NotificationContainer)
      
      const onAction = vi.fn()
      const id = notificationQueue.add({
        message: 'Test notification',
        type: 'info',
        onAction
      })

      wrapper.vm.handleNotificationAction(id, 'test-action')
      
      expect(onAction).toHaveBeenCalledWith('test-action')
    })

    it('should handle notification action events with default action', async () => {
      wrapper = mount(NotificationContainer)
      
      const onAction = vi.fn()
      const id = notificationQueue.add({
        message: 'Test notification',
        type: 'info',
        onAction
      })

      wrapper.vm.handleNotificationAction(id)
      
      expect(onAction).toHaveBeenCalledWith('action')
    })
  })

  describe('Global Methods Setup', () => {
    it('should set up global notify methods on mount', () => {
      wrapper = mount(NotificationContainer)
      
      expect(window.notify).toBeDefined()
      expect(typeof window.notify.success).toBe('function')
      expect(typeof window.notify.error).toBe('function')
      expect(typeof window.notify.warning).toBe('function')
      expect(typeof window.notify.info).toBe('function')
      expect(typeof window.notify.loading).toBe('function')
      expect(typeof window.notify.confirm).toBe('function')
      expect(typeof window.notify.alert).toBe('function')
      expect(typeof window.notify.clear).toBe('function')
      expect(typeof window.notify.remove).toBe('function')
    })

    it('should clean up global methods on unmount', () => {
      wrapper = mount(NotificationContainer)
      
      expect(window.notify).toBeDefined()
      
      wrapper.unmount()
      
      expect(window.notify).toBeUndefined()
    })

    it('should call notification queue methods through global methods', () => {
      wrapper = mount(NotificationContainer)
      
      const successSpy = vi.spyOn(notificationQueue, 'success')
      const errorSpy = vi.spyOn(notificationQueue, 'error')
      
      window.notify.success('Success message')
      window.notify.error('Error message')
      
      expect(successSpy).toHaveBeenCalledWith('Success message', undefined)
      expect(errorSpy).toHaveBeenCalledWith('Error message', undefined)
    })
  })

  describe('Notification Filtering', () => {
    it('should separate toast and modal notifications', async () => {
      wrapper = mount(NotificationContainer)
      
      // Add toast notification
      notificationQueue.add({
        message: 'Toast notification',
        type: 'info'
      })
      
      // Add modal notification
      notificationQueue.add({
        type: 'confirm',
        component: 'NotificationModal',
        props: { title: 'Modal notification' }
      })

      await wrapper.vm.$nextTick()
      
      const toastNotifications = wrapper.vm.toastNotifications
      const modalNotifications = wrapper.vm.modalNotifications
      
      expect(toastNotifications.length).toBe(1)
      expect(modalNotifications.length).toBe(1)
      expect(toastNotifications[0].message).toBe('Toast notification')
      expect(modalNotifications[0].props.title).toBe('Modal notification')
    })
  })

  describe('Position-based Notification Retrieval', () => {
    it('should get notifications by position', async () => {
      wrapper = mount(NotificationContainer)
      
      notificationQueue.add({
        message: 'Top right notification',
        position: 'top-right'
      })
      
      notificationQueue.add({
        message: 'Bottom left notification',
        position: 'bottom-left'
      })

      const topRightNotifications = wrapper.vm.getNotificationsByPosition('top-right')
      const bottomLeftNotifications = wrapper.vm.getNotificationsByPosition('bottom-left')
      
      expect(topRightNotifications.length).toBe(1)
      expect(bottomLeftNotifications.length).toBe(1)
      expect(topRightNotifications[0].message).toBe('Top right notification')
      expect(bottomLeftNotifications[0].message).toBe('Bottom left notification')
    })
  })

  describe('Component Exposure', () => {
    it('should expose notification queue and notify methods', () => {
      wrapper = mount(NotificationContainer)
      
      const exposed = wrapper.vm
      expect(exposed.notificationQueue).toBe(notificationQueue)
      expect(exposed.notify).toBe(window.notify)
    })
  })

  describe('Multiple Notifications', () => {
    it('should handle multiple notifications in same position', async () => {
      wrapper = mount(NotificationContainer)
      
      // Add multiple notifications to same position
      notificationQueue.add({
        message: 'First notification',
        position: 'top-right'
      })
      
      notificationQueue.add({
        message: 'Second notification',
        position: 'top-right'
      })
      
      notificationQueue.add({
        message: 'Third notification',
        position: 'top-right'
      })

      await wrapper.vm.$nextTick()
      
      const topRightNotifications = wrapper.vm.getNotificationsByPosition('top-right')
      expect(topRightNotifications.length).toBe(3)
    })
  })

  describe('Component Default Handling', () => {
    it('should use NotificationModal as default component for modal notifications', async () => {
      wrapper = mount(NotificationContainer)
      
      notificationQueue.add({
        type: 'confirm',
        component: null, // No component specified
        props: { title: 'Test Modal' }
      })

      await wrapper.vm.$nextTick()
      
      // The component should default to NotificationModal
      const modalNotifications = wrapper.vm.modalNotifications
      expect(modalNotifications.length).toBe(1)
    })
  })
})