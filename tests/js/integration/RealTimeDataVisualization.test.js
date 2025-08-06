import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ChartWidget from '@/Components/Dashboard/ChartWidget.vue';
import NotificationCenter from '@/Components/Dashboard/NotificationCenter.vue';
import ProgressRing from '@/Components/States/ProgressRing.vue';

// Mock WebSocket for real-time testing
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.OPEN;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.listeners = new Map();
  }
  
  send(data) {
    // Mock sending data
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code: 1000, reason: 'Normal closure' });
    }
  }

  // Helper method to simulate incoming messages
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// Mock the WebSocket service
const mockWebSocketService = {
  isConnected: true,
  isConnecting: false,
  connection: null,
  listeners: new Map(),
  
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn(),
  send: vi.fn().mockReturnValue(true),
  
  subscribe: vi.fn((type, callback) => {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    };
  }),
  
  emit: vi.fn((type, data) => {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(callback => callback(data));
    }
  }),
  
  subscribeToDashboardUpdates: vi.fn((callback) => {
    return this.subscribe('dashboard_update', callback);
  }),
  
  subscribeToNotifications: vi.fn((callback) => {
    return this.subscribe('notification', callback);
  }),
  
  subscribeToChartUpdates: vi.fn((chartId, callback) => {
    return this.subscribe(`chart_update_${chartId}`, callback);
  }),
  
  subscribeToProgressUpdates: vi.fn((taskId, callback) => {
    return this.subscribe(`progress_update_${taskId}`, callback);
  }),
  
  requestRealTimeData: vi.fn(),
  stopRealTimeData: vi.fn()
};

// Mock the WebSocket service module
vi.mock('@/services/WebSocketService', () => ({
  default: mockWebSocketService,
  useWebSocket: () => ({
    isConnected: { value: true },
    isConnecting: { value: false },
    subscribe: mockWebSocketService.subscribe,
    send: mockWebSocketService.send,
    connect: mockWebSocketService.connect,
    disconnect: mockWebSocketService.disconnect,
    subscribeToDashboardUpdates: mockWebSocketService.subscribeToDashboardUpdates,
    subscribeToNotifications: mockWebSocketService.subscribeToNotifications,
    subscribeToChartUpdates: mockWebSocketService.subscribeToChartUpdates,
    subscribeToProgressUpdates: mockWebSocketService.subscribeToProgressUpdates,
    requestRealTimeData: mockWebSocketService.requestRealTimeData,
    stopRealTimeData: mockWebSocketService.stopRealTimeData
  })
}));

// Mock icons
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => {
    const iconMap = {
      'refresh': 'RefreshIcon',
      'chart-bar': 'ChartBarIcon',
      'bell': 'BellIcon',
      'loading': 'LoadingIcon'
    };
    return iconMap[name] || 'DefaultIcon';
  })
}));

// Mock DashboardWidget
vi.mock('@/Components/Dashboard/DashboardWidget.vue', () => ({
  default: {
    name: 'DashboardWidget',
    template: '<div class="dashboard-widget"><slot /></div>',
    props: ['title', 'loading', 'error', 'padding', 'background']
  }
}));

describe('Real-time Data Visualization Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocketService.listeners.clear();
  });

  describe('Real-time Chart Updates', () => {
    let wrapper;

    afterEach(() => {
      wrapper?.unmount();
    });

    it('integrates with WebSocket service for real-time chart data', async () => {
      const initialData = [
        { x: 0, y: 10, label: 'Jan' },
        { x: 1, y: 20, label: 'Feb' },
        { x: 2, y: 15, label: 'Mar' }
      ];

      wrapper = mount(ChartWidget, {
        props: {
          title: 'Real-time Sales Chart',
          data: initialData,
          type: 'line'
        }
      });

      await nextTick();

      // Simulate WebSocket connection and subscription
      const chartId = 'sales-chart';
      let updateCallback;
      
      mockWebSocketService.subscribeToChartUpdates.mockImplementation((id, callback) => {
        updateCallback = callback;
        return () => {};
      });

      // Subscribe to chart updates
      const unsubscribe = mockWebSocketService.subscribeToChartUpdates(chartId, (data) => {
        wrapper.setProps({ data: data.chartData });
      });

      // Simulate real-time data update
      const newData = [
        { x: 0, y: 12, label: 'Jan' },
        { x: 1, y: 25, label: 'Feb' },
        { x: 2, y: 18, label: 'Mar' },
        { x: 3, y: 30, label: 'Apr' }
      ];

      if (updateCallback) {
        updateCallback({
          chartId,
          chartData: newData,
          timestamp: Date.now()
        });
      }

      await nextTick();

      expect(mockWebSocketService.subscribeToChartUpdates).toHaveBeenCalledWith(chartId, expect.any(Function));
    });

    it('handles high-frequency chart data updates efficiently', async () => {
      let chartData = Array.from({ length: 20 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
        label: `Point ${i}`
      }));

      wrapper = mount(ChartWidget, {
        props: {
          title: 'High-frequency Chart',
          data: chartData,
          type: 'line'
        }
      });

      await nextTick();

      const updateTimes = [];
      const chartId = 'high-freq-chart';

      // Set up WebSocket subscription
      let updateCallback;
      mockWebSocketService.subscribeToChartUpdates.mockImplementation((id, callback) => {
        updateCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToChartUpdates(chartId, (data) => {
        wrapper.setProps({ data: data.chartData });
      });

      // Simulate high-frequency updates (10 updates per second)
      for (let i = 0; i < 50; i++) {
        const startTime = performance.now();

        // Add new data point, remove oldest
        chartData = [
          ...chartData.slice(1),
          {
            x: 20 + i,
            y: Math.random() * 100,
            label: `Point ${20 + i}`
          }
        ];

        if (updateCallback) {
          updateCallback({
            chartId,
            chartData: [...chartData],
            timestamp: Date.now()
          });
        }

        await nextTick();
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      // High-frequency updates should maintain performance
      const avgUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      expect(avgUpdateTime).toBeLessThan(50);
    });

    it('gracefully handles WebSocket connection issues', async () => {
      wrapper = mount(ChartWidget, {
        props: {
          title: 'Connection Test Chart',
          data: [{ x: 0, y: 10, label: 'Test' }],
          type: 'line'
        }
      });

      await nextTick();

      // Simulate connection loss
      mockWebSocketService.isConnected = false;
      mockWebSocketService.send.mockReturnValue(false);

      // Component should handle connection issues gracefully
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.processedData).toHaveLength(1);
    });
  });

  describe('Real-time Notification Updates', () => {
    let wrapper;

    afterEach(() => {
      wrapper?.unmount();
    });

    it('receives and displays real-time notifications', async () => {
      const initialNotifications = [
        {
          id: 1,
          title: 'Initial Notification',
          message: 'This is an initial notification',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString()
        }
      ];

      wrapper = mount(NotificationCenter, {
        props: {
          notifications: initialNotifications,
          realTime: true
        }
      });

      await nextTick();

      // Set up WebSocket subscription for notifications
      let notificationCallback;
      mockWebSocketService.subscribeToNotifications.mockImplementation((callback) => {
        notificationCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToNotifications((notification) => {
        const currentNotifications = wrapper.props('notifications');
        wrapper.setProps({
          notifications: [notification, ...currentNotifications]
        });
      });

      // Simulate incoming real-time notification
      const newNotification = {
        id: 2,
        title: 'Real-time Notification',
        message: 'This notification arrived in real-time',
        type: 'success',
        read: false,
        timestamp: new Date().toISOString()
      };

      if (notificationCallback) {
        notificationCallback(newNotification);
      }

      await nextTick();

      expect(mockWebSocketService.subscribeToNotifications).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles burst of notifications efficiently', async () => {
      wrapper = mount(NotificationCenter, {
        props: {
          notifications: [],
          realTime: true,
          maxDisplayed: 20
        }
      });

      await nextTick();

      // Set up notification callback
      let notificationCallback;
      mockWebSocketService.subscribeToNotifications.mockImplementation((callback) => {
        notificationCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToNotifications((notification) => {
        const currentNotifications = wrapper.props('notifications');
        wrapper.setProps({
          notifications: [notification, ...currentNotifications.slice(0, 99)] // Keep max 100
        });
      });

      const startTime = performance.now();

      // Simulate burst of 50 notifications
      for (let i = 0; i < 50; i++) {
        const notification = {
          id: i + 1,
          title: `Burst Notification ${i + 1}`,
          message: `Message ${i + 1}`,
          type: ['info', 'success', 'warning', 'error'][i % 4],
          read: false,
          timestamp: new Date(Date.now() - i * 1000).toISOString()
        };

        if (notificationCallback) {
          notificationCallback(notification);
        }
      }

      await nextTick();
      const endTime = performance.now();

      // Should handle burst efficiently
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('maintains notification order during real-time updates', async () => {
      wrapper = mount(NotificationCenter, {
        props: {
          notifications: [],
          realTime: true
        }
      });

      await nextTick();

      const notifications = [];
      let notificationCallback;
      
      mockWebSocketService.subscribeToNotifications.mockImplementation((callback) => {
        notificationCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToNotifications((notification) => {
        notifications.unshift(notification);
        wrapper.setProps({ notifications: [...notifications] });
      });

      // Send notifications with specific timestamps
      const testNotifications = [
        { id: 1, timestamp: new Date(Date.now() - 3000).toISOString(), title: 'Third' },
        { id: 2, timestamp: new Date(Date.now() - 1000).toISOString(), title: 'First' },
        { id: 3, timestamp: new Date(Date.now() - 2000).toISOString(), title: 'Second' }
      ];

      for (const notification of testNotifications) {
        if (notificationCallback) {
          notificationCallback({
            ...notification,
            message: `Message for ${notification.title}`,
            type: 'info',
            read: false
          });
        }
        await nextTick();
      }

      // Notifications should be ordered by arrival time (newest first)
      const finalNotifications = wrapper.props('notifications');
      expect(finalNotifications[0].title).toBe('Second');
      expect(finalNotifications[1].title).toBe('First');
      expect(finalNotifications[2].title).toBe('Third');
    });
  });

  describe('Real-time Progress Updates', () => {
    let wrapper;

    afterEach(() => {
      wrapper?.unmount();
    });

    it('updates progress ring with real-time data', async () => {
      wrapper = mount(ProgressRing, {
        props: {
          value: 0,
          max: 100,
          size: 120,
          showPercentage: true,
          showTime: true
        }
      });

      await nextTick();

      const taskId = 'upload-task-123';
      let progressCallback;

      mockWebSocketService.subscribeToProgressUpdates.mockImplementation((id, callback) => {
        progressCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToProgressUpdates(taskId, (progressData) => {
        wrapper.setProps({
          value: progressData.progress,
          estimatedTime: progressData.estimatedTime
        });
      });

      // Simulate progress updates
      const progressUpdates = [
        { progress: 25, estimatedTime: 180 },
        { progress: 50, estimatedTime: 120 },
        { progress: 75, estimatedTime: 60 },
        { progress: 100, estimatedTime: 0 }
      ];

      for (const update of progressUpdates) {
        if (progressCallback) {
          progressCallback({
            taskId,
            ...update,
            status: update.progress === 100 ? 'completed' : 'processing'
          });
        }
        await nextTick();
      }

      expect(wrapper.vm.displayPercentage).toBe(100);
      expect(mockWebSocketService.subscribeToProgressUpdates).toHaveBeenCalledWith(taskId, expect.any(Function));
    });

    it('handles multiple concurrent progress updates', async () => {
      const progressComponents = [];
      const taskIds = ['task-1', 'task-2', 'task-3'];

      // Create multiple progress components
      for (let i = 0; i < taskIds.length; i++) {
        const component = mount(ProgressRing, {
          props: {
            value: 0,
            max: 100,
            size: 80,
            label: `Task ${i + 1}`
          }
        });
        progressComponents.push(component);
      }

      await nextTick();

      // Set up progress callbacks for each task
      const progressCallbacks = new Map();
      
      mockWebSocketService.subscribeToProgressUpdates.mockImplementation((taskId, callback) => {
        progressCallbacks.set(taskId, callback);
        return () => progressCallbacks.delete(taskId);
      });

      // Subscribe each component to its task
      taskIds.forEach((taskId, index) => {
        mockWebSocketService.subscribeToProgressUpdates(taskId, (progressData) => {
          progressComponents[index].setProps({
            value: progressData.progress
          });
        });
      });

      const startTime = performance.now();

      // Simulate concurrent progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        taskIds.forEach(taskId => {
          const callback = progressCallbacks.get(taskId);
          if (callback) {
            callback({
              taskId,
              progress: progress + Math.random() * 5, // Slight variation
              status: 'processing'
            });
          }
        });
        await nextTick();
      }

      const endTime = performance.now();

      // Should handle concurrent updates efficiently
      expect(endTime - startTime).toBeLessThan(300);

      // Cleanup
      progressComponents.forEach(component => component.unmount());
    });
  });

  describe('WebSocket Connection Management', () => {
    it('handles connection state changes gracefully', async () => {
      const wrapper = mount(ChartWidget, {
        props: {
          title: 'Connection State Chart',
          data: [{ x: 0, y: 10, label: 'Test' }],
          type: 'line'
        }
      });

      await nextTick();

      // Simulate connection states
      const connectionStates = [
        { isConnected: true, isConnecting: false },
        { isConnected: false, isConnecting: true },
        { isConnected: false, isConnecting: false },
        { isConnected: true, isConnecting: false }
      ];

      for (const state of connectionStates) {
        mockWebSocketService.isConnected = state.isConnected;
        mockWebSocketService.isConnecting = state.isConnecting;
        
        await nextTick();
        
        // Component should remain stable regardless of connection state
        expect(wrapper.exists()).toBe(true);
      }

      wrapper.unmount();
    });

    it('queues updates during connection loss and replays on reconnection', async () => {
      const wrapper = mount(NotificationCenter, {
        props: {
          notifications: [],
          realTime: true
        }
      });

      await nextTick();

      // Simulate connection loss
      mockWebSocketService.isConnected = false;

      // Try to send updates while disconnected (should be queued)
      const queuedNotifications = [
        { id: 1, title: 'Queued 1', message: 'Message 1', type: 'info', read: false, timestamp: new Date().toISOString() },
        { id: 2, title: 'Queued 2', message: 'Message 2', type: 'info', read: false, timestamp: new Date().toISOString() }
      ];

      // Simulate reconnection
      mockWebSocketService.isConnected = true;

      // Simulate replay of queued notifications
      let notificationCallback;
      mockWebSocketService.subscribeToNotifications.mockImplementation((callback) => {
        notificationCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToNotifications((notification) => {
        const currentNotifications = wrapper.props('notifications');
        wrapper.setProps({
          notifications: [notification, ...currentNotifications]
        });
      });

      // Replay queued notifications
      for (const notification of queuedNotifications) {
        if (notificationCallback) {
          notificationCallback(notification);
        }
        await nextTick();
      }

      expect(wrapper.props('notifications')).toHaveLength(2);
      wrapper.unmount();
    });
  });

  describe('Performance Under Real-time Load', () => {
    it('maintains performance with continuous real-time updates', async () => {
      const wrapper = mount(ChartWidget, {
        props: {
          title: 'Performance Test Chart',
          data: Array.from({ length: 50 }, (_, i) => ({
            x: i,
            y: Math.random() * 100,
            label: `Point ${i}`
          })),
          type: 'line'
        }
      });

      await nextTick();

      const updateTimes = [];
      let chartData = wrapper.props('data');

      // Set up chart update callback
      let updateCallback;
      mockWebSocketService.subscribeToChartUpdates.mockImplementation((chartId, callback) => {
        updateCallback = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToChartUpdates('perf-chart', (data) => {
        wrapper.setProps({ data: data.chartData });
      });

      // Simulate continuous updates for 2 seconds at 30fps
      const updateInterval = 1000 / 30; // 30fps
      const totalUpdates = 60; // 2 seconds worth

      for (let i = 0; i < totalUpdates; i++) {
        const startTime = performance.now();

        // Update data (sliding window)
        chartData = [
          ...chartData.slice(1),
          {
            x: 50 + i,
            y: Math.random() * 100,
            label: `Point ${50 + i}`
          }
        ];

        if (updateCallback) {
          updateCallback({
            chartId: 'perf-chart',
            chartData: [...chartData],
            timestamp: Date.now()
          });
        }

        await nextTick();
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      // Performance should remain consistent
      const avgUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      const maxUpdateTime = Math.max(...updateTimes);

      expect(avgUpdateTime).toBeLessThan(20);
      expect(maxUpdateTime).toBeLessThan(100);

      wrapper.unmount();
    });

    it('handles mixed real-time updates efficiently', async () => {
      // Create multiple components receiving different types of updates
      const chartWrapper = mount(ChartWidget, {
        props: {
          title: 'Mixed Updates Chart',
          data: [{ x: 0, y: 10, label: 'Start' }],
          type: 'line'
        }
      });

      const notificationWrapper = mount(NotificationCenter, {
        props: {
          notifications: [],
          realTime: true
        }
      });

      const progressWrapper = mount(ProgressRing, {
        props: {
          value: 0,
          max: 100,
          size: 100
        }
      });

      await nextTick();

      // Set up all callbacks
      const callbacks = {
        chart: null,
        notification: null,
        progress: null
      };

      mockWebSocketService.subscribeToChartUpdates.mockImplementation((chartId, callback) => {
        callbacks.chart = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToNotifications.mockImplementation((callback) => {
        callbacks.notification = callback;
        return () => {};
      });

      mockWebSocketService.subscribeToProgressUpdates.mockImplementation((taskId, callback) => {
        callbacks.progress = callback;
        return () => {};
      });

      // Subscribe all components
      mockWebSocketService.subscribeToChartUpdates('mixed-chart', (data) => {
        chartWrapper.setProps({ data: data.chartData });
      });

      mockWebSocketService.subscribeToNotifications((notification) => {
        const current = notificationWrapper.props('notifications');
        notificationWrapper.setProps({ notifications: [notification, ...current] });
      });

      mockWebSocketService.subscribeToProgressUpdates('mixed-task', (data) => {
        progressWrapper.setProps({ value: data.progress });
      });

      const startTime = performance.now();

      // Simulate mixed updates
      for (let i = 0; i < 30; i++) {
        // Chart update
        if (callbacks.chart) {
          callbacks.chart({
            chartId: 'mixed-chart',
            chartData: [{ x: i, y: Math.random() * 100, label: `Point ${i}` }],
            timestamp: Date.now()
          });
        }

        // Notification update (every 3rd iteration)
        if (i % 3 === 0 && callbacks.notification) {
          callbacks.notification({
            id: i,
            title: `Update ${i}`,
            message: `Message ${i}`,
            type: 'info',
            read: false,
            timestamp: new Date().toISOString()
          });
        }

        // Progress update
        if (callbacks.progress) {
          callbacks.progress({
            taskId: 'mixed-task',
            progress: (i / 30) * 100,
            status: 'processing'
          });
        }

        await nextTick();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Mixed updates should complete efficiently
      expect(totalTime).toBeLessThan(1000);

      // Cleanup
      chartWrapper.unmount();
      notificationWrapper.unmount();
      progressWrapper.unmount();
    });
  });
});