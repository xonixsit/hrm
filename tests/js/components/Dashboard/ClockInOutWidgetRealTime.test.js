import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ClockInOutWidget from '@/Components/Dashboard/ClockInOutWidget.vue'

// Mock the composables and services
vi.mock('@/composables/useAttendanceRealTime.js', () => ({
  useAttendanceRealTime: vi.fn(() => ({
    // Base attendance state
    clockedIn: { value: false },
    onBreak: { value: false },
    clockInTime: { value: null },
    loading: { value: false },
    error: { value: null },
    
    // Real-time state
    isConnected: { value: true },
    connectionStatus: { value: 'connected' },
    lastUpdate: { value: null },
    realTimeEnabled: { value: true },
    notificationsEnabled: { value: true },
    
    // Analytics
    dailyGoal: { value: 8 },
    breakGoal: { value: 1 },
    productivityScore: { value: 85 },
    workProgress: { value: { percentage: 60, hoursWorked: 4.8, hoursRemaining: 3.2 } },
    breakProgress: { value: { percentage: 30, hoursUsed: 0.3, hoursRemaining: 0.7 } },
    workEfficiency: { value: 92 },
    estimatedEndTime: { value: '5:30 PM' },
    overtimeStatus: { value: { status: 'normal', message: 'Within normal hours' } },
    
    // Summary data
    todaysSummary: { value: { totalHours: '4h 48m', breakTime: '18m', sessions: 2 } },
    recentActivities: { value: [] },
    weeklyHours: { value: '32h 15m' },
    monthlyHours: { value: '128h 30m' },
    averageDaily: { value: '8h 5m' },
    workDuration: { value: '4h 48m 23s' },
    
    // Location
    locationEnabled: { value: true },
    locationVerified: { value: true },
    currentLocation: { value: null },
    
    // Methods
    clockIn: vi.fn(),
    clockOut: vi.fn(),
    startBreak: vi.fn(),
    endBreak: vi.fn(),
    getCurrentLocation: vi.fn(),
    refreshRealTimeData: vi.fn(),
    setDailyGoal: vi.fn(),
    setBreakGoal: vi.fn(),
    toggleRealTime: vi.fn(),
    toggleNotifications: vi.fn(),
    updateAnalytics: vi.fn()
  }))
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { id: 1, name: 'Test User' } }
  }))
}))

// Mock Heroicons
vi.mock('@heroicons/vue/24/outline', () => ({
  ClockIcon: 'ClockIcon',
  PlayIcon: 'PlayIcon',
  PauseIcon: 'PauseIcon',
  MapPinIcon: 'MapPinIcon',
  CheckCircleIcon: 'CheckCircleIcon',
  XCircleIcon: 'XCircleIcon',
  ChartBarIcon: 'ChartBarIcon',
  BellIcon: 'BellIcon',
  CogIcon: 'CogIcon',
  WifiIcon: 'WifiIcon',
  ExclamationTriangleIcon: 'ExclamationTriangleIcon',
  TrophyIcon: 'TrophyIcon'
}))

describe('ClockInOutWidget Real-time Features', () => {
  let wrapper
  let mockAttendance

  beforeEach(() => {
    // Get the mocked attendance composable
    const { useAttendanceRealTime } = require('@/composables/useAttendanceRealTime.js')
    mockAttendance = useAttendanceRealTime()
    
    wrapper = mount(ClockInOutWidget, {
      props: {
        showAnalytics: true,
        showNotifications: true,
        dailyGoal: 8,
        breakGoal: 1,
        locationEnabled: true
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Real-time Connection Status', () => {
    it('should display connection status when analytics are enabled', () => {
      expect(wrapper.find('.connection-status').exists()).toBe(true)
      expect(wrapper.find('.connection-indicator').exists()).toBe(true)
      expect(wrapper.text()).toContain('Connected')
    })

    it('should show appropriate connection status classes', () => {
      const wifiIcon = wrapper.find('.connection-indicator').find('svg')
      expect(wifiIcon.classes()).toContain('text-green-500')
    })

    it('should hide connection status when analytics are disabled', async () => {
      await wrapper.setProps({ showAnalytics: false })
      expect(wrapper.find('.connection-status').exists()).toBe(false)
    })
  })

  describe('Work Progress Display', () => {
    it('should show work progress when clocked in and analytics enabled', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      expect(wrapper.find('.work-progress').exists()).toBe(true)
      expect(wrapper.text()).toContain('Daily Progress')
      expect(wrapper.text()).toContain('60%')
    })

    it('should display correct progress bar width', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 60%')
    })

    it('should show hours worked and remaining', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      expect(wrapper.text()).toContain('4.8h worked')
      expect(wrapper.text()).toContain('3.2h remaining')
    })

    it('should hide work progress when not clocked in', () => {
      mockAttendance.clockedIn.value = false
      expect(wrapper.find('.work-progress').exists()).toBe(false)
    })
  })

  describe('Productivity Score', () => {
    it('should display productivity score when analytics enabled', () => {
      expect(wrapper.find('.productivity-section').exists()).toBe(true)
      expect(wrapper.text()).toContain('Productivity Score')
      expect(wrapper.text()).toContain('85/100')
    })

    it('should show estimated end time', () => {
      expect(wrapper.text()).toContain('Estimated end time:')
      expect(wrapper.text()).toContain('5:30 PM')
    })

    it('should show efficiency percentage in summary', () => {
      expect(wrapper.text()).toContain('Efficiency:')
      expect(wrapper.text()).toContain('92%')
    })

    it('should hide productivity section when analytics disabled', async () => {
      await wrapper.setProps({ showAnalytics: false })
      expect(wrapper.find('.productivity-section').exists()).toBe(false)
    })
  })

  describe('Enhanced Clock Actions', () => {
    it('should call attendance.clockIn when clock in button is clicked', async () => {
      const clockButton = wrapper.find('button')
      await clockButton.trigger('click')
      
      expect(mockAttendance.clockIn).toHaveBeenCalled()
    })

    it('should call attendance.clockOut when clocked in and button clicked', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      const clockButton = wrapper.find('button')
      await clockButton.trigger('click')
      
      expect(mockAttendance.clockOut).toHaveBeenCalled()
    })

    it('should show break button when clocked in', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(1)
      expect(wrapper.text()).toContain('Take Break')
    })

    it('should call startBreak when break button clicked', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      const breakButton = wrapper.findAll('button')[1]
      await breakButton.trigger('click')
      
      expect(mockAttendance.startBreak).toHaveBeenCalled()
    })
  })

  describe('Settings Panel', () => {
    it('should show settings toggle button', () => {
      expect(wrapper.find('.settings-toggle').exists()).toBe(true)
    })

    it('should open settings panel when toggle clicked', async () => {
      const settingsToggle = wrapper.find('.settings-toggle')
      await settingsToggle.trigger('click')
      
      expect(wrapper.find('.settings-panel').exists()).toBe(true)
      expect(wrapper.text()).toContain('Widget Settings')
    })

    it('should close settings panel when close button clicked', async () => {
      // Open settings first
      await wrapper.find('.settings-toggle').trigger('click')
      expect(wrapper.find('.settings-panel').exists()).toBe(true)
      
      // Close settings
      await wrapper.find('.close-settings').trigger('click')
      expect(wrapper.find('.settings-panel').exists()).toBe(false)
    })

    it('should update daily goal when input changed', async () => {
      await wrapper.find('.settings-toggle').trigger('click')
      
      const dailyGoalInput = wrapper.find('input[type="number"]')
      await dailyGoalInput.setValue('10')
      await dailyGoalInput.trigger('input')
      
      expect(mockAttendance.setDailyGoal).toHaveBeenCalledWith(10)
    })

    it('should toggle real-time updates when checkbox changed', async () => {
      await wrapper.find('.settings-toggle').trigger('click')
      
      const realtimeCheckbox = wrapper.find('input[type="checkbox"]')
      await realtimeCheckbox.setChecked(false)
      
      expect(mockAttendance.toggleRealTime).toHaveBeenCalledWith(false)
    })
  })

  describe('Status Display', () => {
    it('should show correct status when clocked in', async () => {
      mockAttendance.clockedIn.value = true
      mockAttendance.onBreak.value = false
      await nextTick()
      
      expect(wrapper.text()).toContain('Clocked In')
      expect(wrapper.find('.status-indicator div').classes()).toContain('bg-green-100')
    })

    it('should show correct status when on break', async () => {
      mockAttendance.clockedIn.value = true
      mockAttendance.onBreak.value = true
      await nextTick()
      
      expect(wrapper.text()).toContain('On Break')
      expect(wrapper.find('.status-indicator div').classes()).toContain('bg-yellow-100')
    })

    it('should show work duration when clocked in', async () => {
      mockAttendance.clockedIn.value = true
      mockAttendance.workDuration.value = '4h 48m 23s'
      await nextTick()
      
      expect(wrapper.text()).toContain('4h 48m 23s')
    })
  })

  describe('Real-time Data Display', () => {
    it('should display real-time summary data', () => {
      expect(wrapper.text()).toContain('4h 48m') // Total hours
      expect(wrapper.text()).toContain('18m') // Break time
      expect(wrapper.text()).toContain('92%') // Efficiency
    })

    it('should display weekly and monthly stats', () => {
      expect(wrapper.text()).toContain('32h 15m') // Weekly hours
      expect(wrapper.text()).toContain('128h 30m') // Monthly hours
      expect(wrapper.text()).toContain('8h 5m') // Daily average
    })

    it('should show last update time when available', async () => {
      mockAttendance.lastUpdate.value = new Date().toISOString()
      await nextTick()
      
      expect(wrapper.text()).toContain('Last update:')
    })
  })

  describe('Notification Features', () => {
    it('should show notification toggle when notifications enabled', () => {
      expect(wrapper.find('.notifications-toggle').exists()).toBe(true)
    })

    it('should hide notification toggle when notifications disabled', async () => {
      await wrapper.setProps({ showNotifications: false })
      expect(wrapper.find('.notifications-toggle').exists()).toBe(false)
    })

    it('should emit settings-change when notification settings updated', async () => {
      await wrapper.find('.settings-toggle').trigger('click')
      
      const notificationCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      await notificationCheckbox.setChecked(false)
      
      expect(mockAttendance.toggleNotifications).toHaveBeenCalledWith(false)
      expect(wrapper.emitted('settings-change')).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      expect(wrapper.find('.clock-in-out-widget').classes()).toContain('relative')
    })

    it('should position widget actions correctly', () => {
      const widgetActions = wrapper.find('.widget-actions')
      expect(widgetActions.classes()).toContain('absolute')
      expect(widgetActions.classes()).toContain('top-4')
      expect(widgetActions.classes()).toContain('right-4')
    })
  })

  describe('Error Handling', () => {
    it('should handle clock in errors gracefully', async () => {
      mockAttendance.clockIn.mockRejectedValue(new Error('Network error'))
      
      const clockButton = wrapper.find('button')
      await clockButton.trigger('click')
      
      // Should not throw and should still call the method
      expect(mockAttendance.clockIn).toHaveBeenCalled()
    })

    it('should handle break action errors gracefully', async () => {
      mockAttendance.clockedIn.value = true
      mockAttendance.startBreak.mockRejectedValue(new Error('Break error'))
      await nextTick()
      
      const breakButton = wrapper.findAll('button')[1]
      await breakButton.trigger('click')
      
      expect(mockAttendance.startBreak).toHaveBeenCalled()
    })
  })

  describe('Event Emissions', () => {
    it('should emit clock-in-out event', async () => {
      const clockButton = wrapper.find('button')
      await clockButton.trigger('click')
      
      expect(wrapper.emitted('clock-in-out')).toBeTruthy()
    })

    it('should emit take-break event', async () => {
      mockAttendance.clockedIn.value = true
      await nextTick()
      
      const breakButton = wrapper.findAll('button')[1]
      await breakButton.trigger('click')
      
      expect(wrapper.emitted('take-break')).toBeTruthy()
    })

    it('should emit settings-change event when daily goal updated', async () => {
      await wrapper.find('.settings-toggle').trigger('click')
      
      const dailyGoalInput = wrapper.find('input[type="number"]')
      await dailyGoalInput.setValue('10')
      await dailyGoalInput.trigger('input')
      
      expect(wrapper.emitted('settings-change')).toBeTruthy()
      expect(wrapper.emitted('settings-change')[0][0]).toEqual({ dailyGoal: 10 })
    })
  })
})