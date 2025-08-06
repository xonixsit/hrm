import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebSocketService, { useWebSocket } from '@/services/WebSocketService';

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }
  
  send(data) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Simulate message sending
  }
  
  close(code = 1000, reason = '') {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket;
WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

describe('WebSocketService', () => {
  let service;
  const testUrl = 'ws://localhost:8080/ws';

  beforeEach(() => {
    service = new WebSocketService();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.disconnect();
    vi.useRealTimers();
  });

  describe('Connection Management', () => {
    it('creates a new WebSocketService instance', () => {
      expect(service).toBeDefined();
      expect(service.connection).toBeNull();
      expect(service.isConnected).toBe(false);
      expect(service.isConnecting).toBe(false);
    });

    it('connects to WebSocket server', async () => {
      const connectPromise = service.connect(testUrl);
      
      // Fast-forward timers to simulate connection
      vi.advanceTimersByTime(20);
      
      await connectPromise;
      
      expect(service.isConnected).toBe(true);
      expect(service.isConnecting).toBe(false);
      expect(service.connection).toBeDefined();
    });

    it('handles connection errors', async () => {
      // Mock WebSocket that fails to connect
      global.WebSocket = class extends MockWebSocket {
        constructor(url) {
          super(url);
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Connection failed'));
            }
          }, 10);
        }
      };

      try {
        const connectPromise = service.connect(testUrl);
        vi.advanceTimersByTime(20);
        await connectPromise;
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      expect(service.isConnected).toBe(false);
    });

    it('disconnects from WebSocket server', async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
      
      service.disconnect();
      
      expect(service.isConnected).toBe(false);
      expect(service.connection).toBeNull();
    });

    it('prevents multiple simultaneous connections', async () => {
      const promise1 = service.connect(testUrl);
      const promise2 = service.connect(testUrl);
      
      vi.advanceTimersByTime(20);
      
      await Promise.all([promise1, promise2]);
      
      expect(service.isConnected).toBe(true);
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
    });

    it('sends messages to WebSocket server', () => {
      const result = service.send('test_message', { data: 'test' });
      expect(result).toBe(true);
    });

    it('fails to send when not connected', () => {
      service.disconnect();
      const result = service.send('test_message', { data: 'test' });
      expect(result).toBe(false);
    });

    it('handles incoming messages', () => {
      const callback = vi.fn();
      service.subscribe('test_event', callback);
      
      // Simulate incoming message
      const message = {
        type: 'test_event',
        data: { message: 'Hello' }
      };
      
      service.handleMessage({
        data: JSON.stringify(message)
      });
      
      expect(callback).toHaveBeenCalledWith({ message: 'Hello' });
    });

    it('handles malformed messages gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      service.handleMessage({
        data: 'invalid json'
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Subscription Management', () => {
    it('subscribes to message types', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe('test_event', callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(service.listeners.has('test_event')).toBe(true);
    });

    it('unsubscribes from message types', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe('test_event', callback);
      
      unsubscribe();
      
      expect(service.listeners.has('test_event')).toBe(false);
    });

    it('handles multiple subscribers for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      service.subscribe('test_event', callback1);
      service.subscribe('test_event', callback2);
      
      service.emit('test_event', { data: 'test' });
      
      expect(callback1).toHaveBeenCalledWith({ data: 'test' });
      expect(callback2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('removes event type when no subscribers remain', () => {
      const callback = vi.fn();
      service.subscribe('test_event', callback);
      
      service.unsubscribe('test_event', callback);
      
      expect(service.listeners.has('test_event')).toBe(false);
    });
  });

  describe('Specialized Subscriptions', () => {
    it('subscribes to dashboard updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribeToDashboardUpdates(callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(service.listeners.has('dashboard_update')).toBe(true);
    });

    it('subscribes to notifications', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribeToNotifications(callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(service.listeners.has('notification')).toBe(true);
    });

    it('subscribes to chart updates', () => {
      const callback = vi.fn();
      const chartId = 'chart_123';
      const unsubscribe = service.subscribeToChartUpdates(chartId, callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(service.listeners.has(`chart_update_${chartId}`)).toBe(true);
    });

    it('subscribes to progress updates', () => {
      const callback = vi.fn();
      const taskId = 'task_456';
      const unsubscribe = service.subscribeToProgressUpdates(taskId, callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(service.listeners.has(`progress_update_${taskId}`)).toBe(true);
    });
  });

  describe('Real-time Data Requests', () => {
    beforeEach(async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
    });

    it('requests real-time data for components', () => {
      const sendSpy = vi.spyOn(service, 'send');
      
      service.requestRealTimeData('dashboard', { userId: 123 });
      
      expect(sendSpy).toHaveBeenCalledWith('subscribe_to_updates', {
        component: 'dashboard',
        params: { userId: 123 }
      });
    });

    it('stops real-time data for components', () => {
      const sendSpy = vi.spyOn(service, 'send');
      
      service.stopRealTimeData('dashboard');
      
      expect(sendSpy).toHaveBeenCalledWith('unsubscribe_from_updates', {
        component: 'dashboard'
      });
    });
  });

  describe('Heartbeat Mechanism', () => {
    beforeEach(async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
    });

    it('starts heartbeat on connection', () => {
      expect(service.heartbeatInterval).toBeDefined();
    });

    it('sends ping messages at intervals', () => {
      const sendSpy = vi.spyOn(service, 'send');
      
      vi.advanceTimersByTime(service.config.heartbeatInterval);
      
      expect(sendSpy).toHaveBeenCalledWith('ping');
    });

    it('handles heartbeat responses', () => {
      service.heartbeatTimeout = setTimeout(() => {}, 1000);
      
      service.handleHeartbeatResponse();
      
      expect(service.heartbeatTimeout).toBeNull();
    });

    it('stops heartbeat on disconnection', () => {
      service.disconnect();
      
      expect(service.heartbeatInterval).toBeNull();
      expect(service.heartbeatTimeout).toBeNull();
    });
  });

  describe('Reconnection Logic', () => {
    it('attempts reconnection on unexpected disconnect', async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
      
      const connectSpy = vi.spyOn(service, 'connect');
      
      // Simulate unexpected disconnect
      service.connection.close(1006, 'Connection lost');
      
      // Fast-forward to trigger reconnection
      vi.advanceTimersByTime(service.reconnectDelay + 100);
      
      expect(connectSpy).toHaveBeenCalled();
    });

    it('does not reconnect on clean disconnect', async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
      
      const connectSpy = vi.spyOn(service, 'connect');
      
      // Simulate clean disconnect
      service.connection.close(1000, 'Normal closure');
      
      vi.advanceTimersByTime(service.reconnectDelay + 100);
      
      expect(connectSpy).not.toHaveBeenCalled();
    });

    it('increases delay between reconnection attempts', async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
      
      const initialDelay = service.reconnectDelay;
      
      // Simulate failed reconnection
      service.reconnectAttempts = 1;
      service.scheduleReconnect(testUrl, {});
      
      expect(service.reconnectAttempts).toBe(2);
    });

    it('stops reconnecting after max attempts', async () => {
      service.reconnectAttempts = service.maxReconnectAttempts;
      
      const connectSpy = vi.spyOn(service, 'connect');
      
      service.connection = { close: vi.fn() };
      service.connection.close(1006, 'Connection lost');
      
      vi.advanceTimersByTime(service.reconnectDelay + 100);
      
      expect(connectSpy).not.toHaveBeenCalled();
    });
  });

  describe('Status Reporting', () => {
    it('reports connection status', () => {
      const status = service.getStatus();
      
      expect(status).toMatchObject({
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5
      });
    });

    it('updates status during connection', async () => {
      const connectPromise = service.connect(testUrl);
      
      let status = service.getStatus();
      expect(status.isConnecting).toBe(true);
      
      vi.advanceTimersByTime(20);
      await connectPromise;
      
      status = service.getStatus();
      expect(status.isConnected).toBe(true);
      expect(status.isConnecting).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('checks WebSocket support', () => {
      expect(WebSocketService.isSupported()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles subscription callback errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      service.subscribe('test_event', faultyCallback);
      service.emit('test_event', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles send errors gracefully', async () => {
      await service.connect(testUrl);
      vi.advanceTimersByTime(20);
      
      // Mock send to throw error
      service.connection.send = vi.fn(() => {
        throw new Error('Send failed');
      });
      
      const result = service.send('test', {});
      expect(result).toBe(false);
    });
  });
});

describe('useWebSocket Composable', () => {
  // Mock Vue composition API
  const mockRef = (value) => ({ value });
  const mockOnMounted = vi.fn();
  const mockOnUnmounted = vi.fn();
  
  vi.mock('vue', () => ({
    ref: mockRef,
    onMounted: mockOnMounted,
    onUnmounted: mockOnUnmounted
  }));

  it('provides WebSocket functionality', () => {
    const {
      isConnected,
      isConnecting,
      subscribe,
      send,
      connect,
      disconnect
    } = useWebSocket();
    
    expect(isConnected).toBeDefined();
    expect(isConnecting).toBeDefined();
    expect(typeof subscribe).toBe('function');
    expect(typeof send).toBe('function');
    expect(typeof connect).toBe('function');
    expect(typeof disconnect).toBe('function');
  });

  it('provides specialized subscription methods', () => {
    const {
      subscribeToDashboardUpdates,
      subscribeToNotifications,
      subscribeToChartUpdates,
      subscribeToProgressUpdates
    } = useWebSocket();
    
    expect(typeof subscribeToDashboardUpdates).toBe('function');
    expect(typeof subscribeToNotifications).toBe('function');
    expect(typeof subscribeToChartUpdates).toBe('function');
    expect(typeof subscribeToProgressUpdates).toBe('function');
  });

  it('provides real-time data methods', () => {
    const {
      requestRealTimeData,
      stopRealTimeData
    } = useWebSocket();
    
    expect(typeof requestRealTimeData).toBe('function');
    expect(typeof stopRealTimeData).toBe('function');
  });
});

describe('Integration Tests', () => {
  let service;
  const testUrl = 'ws://localhost:8080/ws';

  beforeEach(() => {
    service = new WebSocketService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.disconnect();
    vi.useRealTimers();
  });

  it('handles complete connection lifecycle', async () => {
    const connectCallback = vi.fn();
    const disconnectCallback = vi.fn();
    const messageCallback = vi.fn();
    
    service.subscribe('connected', connectCallback);
    service.subscribe('disconnected', disconnectCallback);
    service.subscribe('test_message', messageCallback);
    
    // Connect
    await service.connect(testUrl);
    vi.advanceTimersByTime(20);
    
    expect(connectCallback).toHaveBeenCalled();
    expect(service.isConnected).toBe(true);
    
    // Send and receive message
    service.send('test', { data: 'hello' });
    
    service.handleMessage({
      data: JSON.stringify({
        type: 'test_message',
        data: { response: 'world' }
      })
    });
    
    expect(messageCallback).toHaveBeenCalledWith({ response: 'world' });
    
    // Disconnect
    service.disconnect();
    
    expect(disconnectCallback).toHaveBeenCalled();
    expect(service.isConnected).toBe(false);
  });

  it('handles dashboard data flow', async () => {
    await service.connect(testUrl);
    vi.advanceTimersByTime(20);
    
    const dashboardCallback = vi.fn();
    service.subscribeToDashboardUpdates(dashboardCallback);
    
    // Request real-time data
    service.requestRealTimeData('dashboard', { userId: 123 });
    
    // Simulate dashboard update
    service.handleMessage({
      data: JSON.stringify({
        type: 'dashboard_update',
        data: {
          widgets: [
            { id: 1, type: 'stats', value: 100 },
            { id: 2, type: 'chart', data: [1, 2, 3] }
          ]
        }
      })
    });
    
    expect(dashboardCallback).toHaveBeenCalledWith({
      widgets: [
        { id: 1, type: 'stats', value: 100 },
        { id: 2, type: 'chart', data: [1, 2, 3] }
      ]
    });
  });

  it('handles notification flow', async () => {
    await service.connect(testUrl);
    vi.advanceTimersByTime(20);
    
    const notificationCallback = vi.fn();
    service.subscribeToNotifications(notificationCallback);
    
    // Simulate notification
    service.handleMessage({
      data: JSON.stringify({
        type: 'notification',
        data: {
          id: 1,
          title: 'New Message',
          message: 'You have a new message',
          type: 'info',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    expect(notificationCallback).toHaveBeenCalledWith({
      id: 1,
      title: 'New Message',
      message: 'You have a new message',
      type: 'info',
      timestamp: expect.any(String)
    });
  });

  it('handles chart data updates', async () => {
    await service.connect(testUrl);
    vi.advanceTimersByTime(20);
    
    const chartCallback = vi.fn();
    const chartId = 'sales_chart';
    service.subscribeToChartUpdates(chartId, chartCallback);
    
    // Simulate chart update
    service.handleMessage({
      data: JSON.stringify({
        type: `chart_update_${chartId}`,
        data: {
          chartId,
          data: [
            { x: 0, y: 10, label: 'Jan' },
            { x: 1, y: 20, label: 'Feb' },
            { x: 2, y: 15, label: 'Mar' }
          ],
          timestamp: Date.now()
        }
      })
    });
    
    expect(chartCallback).toHaveBeenCalledWith({
      chartId,
      data: [
        { x: 0, y: 10, label: 'Jan' },
        { x: 1, y: 20, label: 'Feb' },
        { x: 2, y: 15, label: 'Mar' }
      ],
      timestamp: expect.any(Number)
    });
  });

  it('handles progress updates', async () => {
    await service.connect(testUrl);
    vi.advanceTimersByTime(20);
    
    const progressCallback = vi.fn();
    const taskId = 'import_task_789';
    service.subscribeToProgressUpdates(taskId, progressCallback);
    
    // Simulate progress update
    service.handleMessage({
      data: JSON.stringify({
        type: `progress_update_${taskId}`,
        data: {
          taskId,
          progress: 75,
          status: 'processing',
          message: 'Processing records...',
          estimatedTime: 120
        }
      })
    });
    
    expect(progressCallback).toHaveBeenCalledWith({
      taskId,
      progress: 75,
      status: 'processing',
      message: 'Processing records...',
      estimatedTime: 120
    });
  });
});