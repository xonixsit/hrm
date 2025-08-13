import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

// Mock Inertia router
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
    remember: vi.fn(),
    restore: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }
}))

// Mock services
vi.mock('@/services/WebSocketService.js', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    clockIn: vi.fn(),
    clockOut: vi.fn(),
    startBreak: vi.fn(),
    endBreak: vi.fn(),
    subscribeToAttendance: vi.fn(),
    requestStatsUpdate: vi.fn()
  }
}))

vi.mock('@/services/NotificationService.js', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    scheduleClockOutReminder: vi.fn(),
    scheduleBreakReminder: vi.fn(),
    scheduleOvertimeWarning: vi.fn(),
    clearReminder: vi.fn(),
    initializeDefaultReminders: vi.fn()
  }
}))

// Mock global fetch
global.fetch = vi.fn()

// Mock CSRF token
Object.defineProperty(document, 'querySelector', {
  value: vi.fn(() => ({ getAttribute: () => 'mock-csrf-token' })),
  writable: true
})

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn()
  },
  writable: true
})

// Mock Notification API
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn(() => Promise.resolve('granted'))
}

// Import after mocking
const { useAttendance } = await import('@/composables/useAttendance.js')

describe('useAttendance Real-time Functionality', () => {
  let mockWebSocketService
  let mockNotificationService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset fetch mock
    fetch.mockClear()
    
    // Import mocked services
    mockWebSocketService = require('@/services/WebSocketService.js').default
    mockNotificationService = require('@/services/NotificationService.js').default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Clock In Functionality', () => {
    it('should clock in successfully with location data', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          clock_in_time: '2025-08-11T09:00:00.000Z',
          attendance: { id: 1, status: 'clocked_in' }
        })
      })

      // Mock geolocation
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10
          }
        })
      })

      const { clockIn, clockedIn, clockInTime, loading } = useAttendance(1)

      expect(clockedIn.value).toBe(false)
      expect(loading.value).toBe(false)

      const result = await clockIn()

      expect(result).toBe(true)
      expect(clockedIn.value).toBe(true)
      expect(clockInTime.value).toBe('2025-08-11T09:00:00.000Z')
      expect(mockWebSocketService.clockIn).toHaveBeenCalled()
      expect(mockNotificationService.scheduleClockOutReminder).toHaveBeenCalledWith(8)
      expect(mockNotificationService.scheduleBreakReminder).toHaveBeenCalledWith(2)
      expect(mockNotificationService.scheduleOvertimeWarning).toHaveBeenCalledWith(8)
    })

    it('should handle clock in failure gracefully', async () => {
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      const { clockIn, clockedIn, error } = useAttendance(1)

      const result = await clockIn()

      expect(result).toBe(false)
      expect(clockedIn.value).toBe(false)
      expect(error.value).toBe('Failed to clock in')
    })

    it('should prevent multiple clock ins', async () => {
      const { clockIn, clockedIn, canClockIn } = useAttendance(1)
      
      // Simulate already clocked in state
      clockedIn.value = true

      expect(canClockIn.value).toBe(false)

      const result = await clockIn()
      expect(result).toBe(false)
    })
  })

  describe('Clock Out Functionality', () => {
    it('should clock out successfully and clear notifications', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          work_duration: '8h 30m',
          break_duration: '1h 0m'
        })
      })

      const { clockOut, clockedIn, clockInTime, onBreak } = useAttendance(1)
      
      // Set initial clocked in state
      clockedIn.value = true
      clockInTime.value = '2025-08-11T09:00:00.000Z'

      const result = await clockOut()

      expect(result).toBe(true)
      expect(clockedIn.value).toBe(false)
      expect(clockInTime.value).toBe(null)
      expect(onBreak.value).toBe(false)
      expect(mockNotificationService.clearReminder).toHaveBeenCalledWith('clock-out-reminder')
      expect(mockNotificationService.clearReminder).toHaveBeenCalledWith('break-reminder')
      expect(mockNotificationService.clearReminder).toHaveBeenCalledWith('overtime-warning')
    })

    it('should prevent clock out when not clocked in', async () => {
      const { clockOut, clockedIn, canClockOut } = useAttendance(1)
      
      expect(clockedIn.value).toBe(false)
      expect(canClockOut.value).toBe(false)

      const result = await clockOut()
      expect(result).toBe(false)
    })
  })

  describe('Break Functionality', () => {
    it('should start break successfully', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          attendance: { id: 1, on_break: true }
        })
      })

      const { startBreak, clockedIn, onBreak, breakStartTime } = useAttendance(1)
      
      // Set initial clocked in state
      clockedIn.value = true

      const result = await startBreak()

      expect(result).toBe(true)
      expect(onBreak.value).toBe(true)
      expect(breakStartTime.value).toBeTruthy()
      expect(mockWebSocketService.startBreak).toHaveBeenCalled()
    })

    it('should end break successfully', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          break_duration: '15m'
        })
      })

      const { endBreak, onBreak, breakStartTime } = useAttendance(1)
      
      // Set initial break state
      onBreak.value = true
      breakStartTime.value = '2025-08-11T10:00:00.000Z'

      const result = await endBreak()

      expect(result).toBe(true)
      expect(onBreak.value).toBe(false)
      expect(breakStartTime.value).toBe(null)
      expect(mockWebSocketService.endBreak).toHaveBeenCalled()
    })

    it('should prevent break when not clocked in', async () => {
      const { startBreak, clockedIn, canTakeBreak } = useAttendance(1)
      
      expect(clockedIn.value).toBe(false)
      expect(canTakeBreak.value).toBe(false)

      const result = await startBreak()
      expect(result).toBe(false)
    })
  })

  describe('Location Tracking', () => {
    it('should get current location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10
        }
      }

      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const { getCurrentLocation, locationVerified, currentLocation } = useAttendance(1)

      const location = await getCurrentLocation()

      expect(location).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: expect.any(String)
      })
      expect(locationVerified.value).toBe(true)
      expect(currentLocation.value).toEqual(location)
    })

    it('should handle location error gracefully', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ message: 'Location access denied' })
      })

      const { getCurrentLocation, locationVerified } = useAttendance(1)

      await expect(getCurrentLocation()).rejects.toThrow('Location error: Location access denied')
      expect(locationVerified.value).toBe(false)
    })
  })

  describe('Real-time Updates', () => {
    it('should handle attendance updates from WebSocket', async () => {
      const { clockedIn, onBreak, todaysSummary } = useAttendance(1)

      // Simulate WebSocket attendance update
      const updateData = {
        clocked_in: true,
        on_break: false,
        clock_in_time: '2025-08-11T09:00:00.000Z',
        todays_summary: {
          total_hours: '4h 30m',
          break_time: '30m',
          sessions: 2,
          clock_ins: 1
        }
      }

      // Get the handler that was registered
      const attendanceUpdateHandler = mockWebSocketService.on.mock.calls
        .find(call => call[0] === 'attendance_update')[1]

      attendanceUpdateHandler(updateData)

      await nextTick()

      expect(clockedIn.value).toBe(true)
      expect(onBreak.value).toBe(false)
      expect(todaysSummary.value).toEqual({
        totalHours: '4h 30m',
        breakTime: '30m',
        sessions: 2,
        clockIns: 1
      })
    })

    it('should handle stats updates from WebSocket', async () => {
      const { weeklyHours, monthlyHours, averageDaily } = useAttendance(1)

      // Simulate WebSocket stats update
      const statsData = {
        weekly_hours: '40h 15m',
        monthly_hours: '160h 30m',
        average_daily: '8h 5m'
      }

      // Get the handler that was registered
      const statsUpdateHandler = mockWebSocketService.on.mock.calls
        .find(call => call[0] === 'stats_update')[1]

      statsUpdateHandler(statsData)

      await nextTick()

      expect(weeklyHours.value).toBe('40h 15m')
      expect(monthlyHours.value).toBe('160h 30m')
      expect(averageDaily.value).toBe('8h 5m')
    })
  })

  describe('Work Duration Calculation', () => {
    it('should calculate work duration correctly', async () => {
      const { workDuration, clockedIn, clockInTime } = useAttendance(1)

      // Set clock in time to 2 hours ago
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      clockedIn.value = true
      clockInTime.value = twoHoursAgo.toISOString()

      await nextTick()

      // Should show approximately 2 hours (allowing for small timing differences)
      expect(workDuration.value).toMatch(/^2h \d+m \d+s$/)
    })

    it('should return zero duration when not clocked in', async () => {
      const { workDuration, clockedIn } = useAttendance(1)

      expect(clockedIn.value).toBe(false)
      expect(workDuration.value).toBe('0h 0m 0s')
    })
  })

  describe('Activity Tracking', () => {
    it('should add activities to recent activities list', async () => {
      const { recentActivities } = useAttendance(1)

      // Mock successful clock in
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          clock_in_time: '2025-08-11T09:00:00.000Z'
        })
      })

      const { clockIn } = useAttendance(1)
      await clockIn()

      expect(recentActivities.value).toHaveLength(1)
      expect(recentActivities.value[0]).toEqual({
        id: expect.any(Number),
        type: 'clock-in',
        action: 'Clocked in',
        time: expect.any(String)
      })
    })

    it('should limit recent activities to 10 items', async () => {
      const { recentActivities } = useAttendance(1)

      // Add 15 activities
      for (let i = 0; i < 15; i++) {
        recentActivities.value.unshift({
          id: i,
          type: 'test',
          action: `Activity ${i}`,
          time: new Date().toISOString()
        })
      }

      expect(recentActivities.value).toHaveLength(10)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const { clockIn, error, loading } = useAttendance(1)

      const result = await clockIn()

      expect(result).toBe(false)
      expect(error.value).toBe('Network error')
      expect(loading.value).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { clockIn, error } = useAttendance(1)

      const result = await clockIn()

      expect(result).toBe(false)
      expect(error.value).toBe('Failed to clock in')
    })
  })

  describe('Notification Integration', () => {
    it('should initialize default reminders on mount', async () => {
      useAttendance(1)

      await nextTick()

      expect(mockNotificationService.initializeDefaultReminders).toHaveBeenCalledWith({
        clockInTime: '09:00',
        workHours: 8,
        breakInterval: 2,
        enableClockInReminder: true,
        enableClockOutReminder: true,
        enableBreakReminder: true,
        enableOvertimeWarning: true
      })
    })

    it('should handle notification actions correctly', async () => {
      const { clockIn } = useAttendance(1)

      // Mock successful clock in
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          clock_in_time: '2025-08-11T09:00:00.000Z'
        })
      })

      // Get the notification handler
      const notificationHandler = mockNotificationService.on.mock.calls
        .find(call => call[0] === 'notification')[1]

      // Simulate clock-in reminder notification action
      notificationHandler({
        type: 'clock_in_reminder',
        action: 'clock-in'
      })

      // Should trigger clock in
      expect(fetch).toHaveBeenCalledWith('/api/attendance/clock-in', expect.any(Object))
    })
  })
})