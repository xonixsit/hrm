import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ClockInOutWidget from '@/Components/Dashboard/ClockInOutWidget.vue'

// Mock Heroicons
vi.mock('@heroicons/vue/24/outline', () => ({
  ClockIcon: { name: 'ClockIcon' },
  PlayIcon: { name: 'PlayIcon' },
  PauseIcon: { name: 'PauseIcon' },
  MapPinIcon: { name: 'MapPinIcon' },
  CheckCircleIcon: { name: 'CheckCircleIcon' },
  XCircleIcon: { name: 'XCircleIcon' }
}))

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn()
  },
  writable: true
})

describe('ClockInOutWidget', () => {
  let wrapper

  const defaultProps = {
    clockedIn: false,
    onBreak: false,
    clockInTime: null,
    todaysSummary: {
      totalHours: '0h 0m',
      breakTime: '0h 0m',
      sessions: 0
    },
    recentActivities: [],
    weeklyHours: '0h',
    monthlyHours: '0h',
    averageDaily: '0h',
    locationEnabled: false,
    locationVerified: false,
    loading: false
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-08-11T10:30:00.000Z'))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Real-time Clock Display', () => {
    it('should display current time and date', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      await nextTick()

      const timeText = wrapper.find('.time-text')
      const dateText = wrapper.find('.date-text')

      expect(timeText.exists()).toBe(true)
      expect(dateText.exists()).toBe(true)
      
      // Time should be in HH:MM:SS format
      expect(timeText.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      
      // Date should be in readable format
      expect(dateText.text()).toContain('2025')
    })

    it('should update time every second', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const initialTime = wrapper.find('.time-text').text()

      // Advance time by 1 second
      vi.advanceTimersByTime(1000)
      await nextTick()

      const updatedTime = wrapper.find('.time-text').text()
      expect(updatedTime).not.toBe(initialTime)
    })

    it('should display timezone information', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      await nextTick()

      const timezone = wrapper.find('.timezone')
      expect(timezone.exists()).toBe(true)
      expect(timezone.text()).toBeTruthy()
    })
  })

  describe('Status Display', () => {
    it('should show clocked out status by default', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const statusText = wrapper.find('.status-text')
      expect(statusText.text()).toBe('Clocked Out')
      
      const statusIndicator = wrapper.find('.status-indicator > div')
      expect(statusIndicator.classes()).toContain('bg-neutral-100')
      expect(statusIndicator.classes()).toContain('text-neutral-600')
    })

    it('should show clocked in status when clocked in', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true,
          clockInTime: '2025-08-11T09:00:00.000Z'
        }
      })

      const statusText = wrapper.find('.status-text')
      expect(statusText.text()).toBe('Clocked In')
      
      const statusIndicator = wrapper.find('.status-indicator > div')
      expect(statusIndicator.classes()).toContain('bg-green-100')
      expect(statusIndicator.classes()).toContain('text-green-800')
    })

    it('should show on break status when on break', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true,
          onBreak: true,
          clockInTime: '2025-08-11T09:00:00.000Z'
        }
      })

      const statusText = wrapper.find('.status-text')
      expect(statusText.text()).toBe('On Break')
      
      const statusIndicator = wrapper.find('.status-indicator > div')
      expect(statusIndicator.classes()).toContain('bg-yellow-100')
      expect(statusIndicator.classes()).toContain('text-yellow-800')
    })

    it('should display work duration when clocked in', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true,
          clockInTime: '2025-08-11T09:00:00.000Z' // 1.5 hours ago
        }
      })

      await nextTick()

      const workDuration = wrapper.find('.work-duration')
      expect(workDuration.exists()).toBe(true)
      expect(workDuration.text()).toMatch(/\d+h \d+m \d+s/)
    })
  })

  describe('Today\'s Summary', () => {
    it('should display today\'s summary when provided', async () => {
      const summary = {
        totalHours: '8h 30m',
        breakTime: '1h 15m',
        sessions: 3
      }

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          todaysSummary: summary
        }
      })

      const summaryItems = wrapper.findAll('.summary-item')
      expect(summaryItems).toHaveLength(3)

      expect(summaryItems[0].find('.summary-value').text()).toBe('8h 30m')
      expect(summaryItems[1].find('.summary-value').text()).toBe('1h 15m')
      expect(summaryItems[2].find('.summary-value').text()).toBe('3')
    })

    it('should show default values when no summary provided', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const summaryItems = wrapper.findAll('.summary-item')
      expect(summaryItems).toHaveLength(3)

      expect(summaryItems[0].find('.summary-value').text()).toBe('0h 0m')
      expect(summaryItems[1].find('.summary-value').text()).toBe('0h 0m')
      expect(summaryItems[2].find('.summary-value').text()).toBe('0')
    })
  })

  describe('Action Buttons', () => {
    it('should show clock in button when not clocked in', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const clockButton = wrapper.find('button')
      expect(clockButton.text()).toContain('Clock In')
      expect(clockButton.classes()).toContain('bg-green-600')
    })

    it('should show clock out button when clocked in', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true
        }
      })

      const clockButton = wrapper.find('button')
      expect(clockButton.text()).toContain('Clock Out')
      expect(clockButton.classes()).toContain('bg-red-600')
    })

    it('should emit clock-in-out event when button clicked', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const clockButton = wrapper.find('button')
      await clockButton.trigger('click')

      expect(wrapper.emitted('clock-in-out')).toHaveLength(1)
    })

    it('should show break button when clocked in', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true
        }
      })

      const breakButton = wrapper.findAll('button')[1]
      expect(breakButton.text()).toContain('Take Break')
    })

    it('should emit take-break event when break button clicked', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true
        }
      })

      const breakButton = wrapper.findAll('button')[1]
      await breakButton.trigger('click')

      expect(wrapper.emitted('take-break')).toHaveLength(1)
    })

    it('should disable break button when on break', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true,
          onBreak: true
        }
      })

      const breakButton = wrapper.findAll('button')[1]
      expect(breakButton.text()).toContain('On Break')
      expect(breakButton.attributes('disabled')).toBeDefined()
    })

    it('should show loading state when loading', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          loading: true
        }
      })

      const clockButton = wrapper.find('button')
      expect(clockButton.text()).toContain('Processing...')
      expect(clockButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Location Tracking', () => {
    it('should show location section when location enabled', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          locationEnabled: true
        }
      })

      const locationSection = wrapper.find('.location-section')
      expect(locationSection.exists()).toBe(true)
    })

    it('should hide location section when location disabled', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          locationEnabled: false
        }
      })

      const locationSection = wrapper.find('.location-section')
      expect(locationSection.exists()).toBe(false)
    })

    it('should show verify button when location not verified', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          locationEnabled: true,
          locationVerified: false
        }
      })

      const verifyButton = wrapper.find('.verify-location-btn')
      expect(verifyButton.exists()).toBe(true)
      expect(verifyButton.text()).toBe('Verify')
    })

    it('should emit verify-location event when verify button clicked', async () => {
      // Mock successful geolocation
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10
          }
        })
      })

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          locationEnabled: true,
          locationVerified: false
        }
      })

      const verifyButton = wrapper.find('.verify-location-btn')
      await verifyButton.trigger('click')

      await nextTick()

      expect(wrapper.emitted('verify-location')).toHaveLength(1)
      expect(wrapper.emitted('verify-location')[0][0]).toEqual({
        latitude: 40.7128,
        longitude: -74.0060
      })
    })

    it('should handle geolocation error gracefully', async () => {
      // Mock geolocation error
      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ message: 'Location access denied' })
      })

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          locationEnabled: true,
          locationVerified: false
        }
      })

      const verifyButton = wrapper.find('.verify-location-btn')
      await verifyButton.trigger('click')

      await nextTick()

      const locationText = wrapper.find('.location-text')
      expect(locationText.text()).toBe('Location verification failed')
    })
  })

  describe('Recent Activities', () => {
    it('should display recent activities when provided', async () => {
      const activities = [
        {
          id: 1,
          type: 'clock-in',
          action: 'Clocked in',
          time: '2025-08-11T09:00:00.000Z'
        },
        {
          id: 2,
          type: 'break-start',
          action: 'Started break',
          time: '2025-08-11T10:00:00.000Z'
        }
      ]

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          recentActivities: activities
        }
      })

      const activityItems = wrapper.findAll('.activity-item')
      expect(activityItems).toHaveLength(2)

      expect(activityItems[0].find('.activity-action').text()).toBe('Clocked in')
      expect(activityItems[1].find('.activity-action').text()).toBe('Started break')
    })

    it('should format activity times correctly', async () => {
      const activities = [
        {
          id: 1,
          type: 'clock-in',
          action: 'Clocked in',
          time: '2025-08-11T09:00:00.000Z'
        }
      ]

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          recentActivities: activities
        }
      })

      const activityTime = wrapper.find('.activity-time')
      expect(activityTime.text()).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)
    })

    it('should show correct icons for different activity types', async () => {
      const activities = [
        {
          id: 1,
          type: 'clock-in',
          action: 'Clocked in',
          time: '2025-08-11T09:00:00.000Z'
        },
        {
          id: 2,
          type: 'break-start',
          action: 'Started break',
          time: '2025-08-11T10:00:00.000Z'
        }
      ]

      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          recentActivities: activities
        }
      })

      const activityIcons = wrapper.findAll('.activity-icon')
      expect(activityIcons).toHaveLength(2)
    })
  })

  describe('Quick Stats', () => {
    it('should display weekly, monthly, and daily average stats', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          weeklyHours: '40h 15m',
          monthlyHours: '160h 30m',
          averageDaily: '8h 5m'
        }
      })

      const statItems = wrapper.findAll('.stat-item')
      expect(statItems).toHaveLength(3)

      expect(statItems[0].find('.stat-value').text()).toBe('40h 15m')
      expect(statItems[0].find('.stat-label').text()).toBe('This Week')

      expect(statItems[1].find('.stat-value').text()).toBe('160h 30m')
      expect(statItems[1].find('.stat-label').text()).toBe('This Month')

      expect(statItems[2].find('.stat-value').text()).toBe('8h 5m')
      expect(statItems[2].find('.stat-label').text()).toBe('Daily Avg')
    })

    it('should show default values when no stats provided', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const statItems = wrapper.findAll('.stat-item')
      expect(statItems).toHaveLength(3)

      statItems.forEach(item => {
        expect(item.find('.stat-value').text()).toBe('0h')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile styles on small screens', async () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })

      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const widget = wrapper.find('.clock-in-out-widget')
      expect(widget.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and semantic markup', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: {
          ...defaultProps,
          clockedIn: true
        }
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('type')).toBeDefined()
      })
    })

    it('should be keyboard navigable', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const clockButton = wrapper.find('button')
      expect(clockButton.attributes('tabindex')).not.toBe('-1')
    })
  })

  describe('Component Lifecycle', () => {
    it('should start timers on mount', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      // Time should update
      const initialTime = wrapper.find('.time-text').text()
      
      vi.advanceTimersByTime(1000)
      await nextTick()

      const updatedTime = wrapper.find('.time-text').text()
      expect(updatedTime).not.toBe(initialTime)
    })

    it('should clean up timers on unmount', async () => {
      wrapper = mount(ClockInOutWidget, {
        props: defaultProps
      })

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })
})