/**
 * WebSocket Service for Real-time Data Updates
 * 
 * This service provides WebSocket connectivity for real-time updates
 * to dashboard components and notifications.
 */

class WebSocketService {
  constructor() {
    this.connection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 5000,   // 5 seconds
      reconnectMultiplier: 1.5,
      maxReconnectDelay: 30000  // 30 seconds
    };
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL
   * @param {Object} options - Connection options
   */
  connect(url, options = {}) {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        // Create WebSocket connection
        this.connection = new WebSocket(url);
        
        // Set up event handlers
        this.connection.onopen = (event) => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Emit connection event
          this.emit('connected', event);
          resolve();
        };

        this.connection.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.connection.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          
          // Stop heartbeat
          this.stopHeartbeat();
          
          // Emit disconnection event
          this.emit('disconnected', event);
          
          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(url, options);
          }
        };

        this.connection.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.emit('error', event);
          
          if (this.isConnecting) {
            reject(event);
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.connection) {
      this.stopHeartbeat();
      this.connection.close(1000, 'Client disconnect');
      this.connection = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  /**
   * Send message to WebSocket server
   * @param {string} type - Message type
   * @param {Object} data - Message data
   */
  send(type, data = {}) {
    if (!this.isConnected || !this.connection) {
      console.warn('WebSocket not connected. Cannot send message:', type);
      return false;
    }

    try {
      const message = JSON.stringify({
        type,
        data,
        timestamp: Date.now()
      });
      
      this.connection.send(message);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to specific message types
   * @param {string} type - Message type to listen for
   * @param {Function} callback - Callback function
   */
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type).add(callback);
    
    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
        if (typeListeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  /**
   * Unsubscribe from message type
   * @param {string} type - Message type
   * @param {Function} callback - Callback function to remove
   */
  unsubscribe(type, callback) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(callback);
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  /**
   * Subscribe to dashboard data updates
   * @param {Function} callback - Callback function
   */
  subscribeToDashboardUpdates(callback) {
    return this.subscribe('dashboard_update', callback);
  }

  /**
   * Subscribe to notification updates
   * @param {Function} callback - Callback function
   */
  subscribeToNotifications(callback) {
    return this.subscribe('notification', callback);
  }

  /**
   * Subscribe to chart data updates
   * @param {string} chartId - Chart identifier
   * @param {Function} callback - Callback function
   */
  subscribeToChartUpdates(chartId, callback) {
    return this.subscribe(`chart_update_${chartId}`, callback);
  }

  /**
   * Subscribe to progress updates
   * @param {string} taskId - Task identifier
   * @param {Function} callback - Callback function
   */
  subscribeToProgressUpdates(taskId, callback) {
    return this.subscribe(`progress_update_${taskId}`, callback);
  }

  /**
   * Request real-time data for specific component
   * @param {string} component - Component type
   * @param {Object} params - Request parameters
   */
  requestRealTimeData(component, params = {}) {
    return this.send('subscribe_to_updates', {
      component,
      params
    });
  }

  /**
   * Stop real-time data for specific component
   * @param {string} component - Component type
   */
  stopRealTimeData(component) {
    return this.send('unsubscribe_from_updates', {
      component
    });
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'pong') {
        this.handleHeartbeatResponse();
        return;
      }
      
      // Emit message to subscribers
      this.emit(message.type, message.data);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Emit event to subscribers
   * @param {string} type - Event type
   * @param {*} data - Event data
   */
  emit(type, data) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   * @param {string} url - WebSocket server URL
   * @param {Object} options - Connection options
   */
  scheduleReconnect(url, options) {
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(this.config.reconnectMultiplier, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );
    
    console.log(`Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        console.log(`Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(url, options).catch(error => {
          console.error('Reconnection attempt failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping');
        
        // Set timeout for heartbeat response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout - connection may be lost');
          this.connection?.close();
        }, this.config.heartbeatTimeout);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Handle heartbeat response
   */
  handleHeartbeatResponse() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * Check if WebSocket is supported
   */
  static isSupported() {
    return typeof WebSocket !== 'undefined';
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Auto-connect if WebSocket URL is available
if (typeof window !== 'undefined' && window.wsUrl) {
  webSocketService.connect(window.wsUrl).catch(error => {
    console.warn('Failed to auto-connect to WebSocket:', error);
  });
}

export default webSocketService;

/**
 * Vue composable for WebSocket functionality
 */
export function useWebSocket() {
  const { ref, onMounted, onUnmounted } = require('vue');
  
  const isConnected = ref(webSocketService.isConnected);
  const isConnecting = ref(webSocketService.isConnecting);
  const subscriptions = ref(new Set());

  // Update connection status
  const updateConnectionStatus = () => {
    isConnected.value = webSocketService.isConnected;
    isConnecting.value = webSocketService.isConnecting;
  };

  // Subscribe to connection events
  const connectionUnsubscribe = webSocketService.subscribe('connected', updateConnectionStatus);
  const disconnectionUnsubscribe = webSocketService.subscribe('disconnected', updateConnectionStatus);

  // Helper methods
  const subscribe = (type, callback) => {
    const unsubscribe = webSocketService.subscribe(type, callback);
    subscriptions.value.add(unsubscribe);
    return unsubscribe;
  };

  const send = (type, data) => {
    return webSocketService.send(type, data);
  };

  const connect = (url, options) => {
    return webSocketService.connect(url, options);
  };

  const disconnect = () => {
    webSocketService.disconnect();
  };

  // Cleanup on unmount
  onUnmounted(() => {
    // Unsubscribe from all subscriptions
    subscriptions.value.forEach(unsubscribe => unsubscribe());
    subscriptions.value.clear();
    
    // Unsubscribe from connection events
    connectionUnsubscribe();
    disconnectionUnsubscribe();
  });

  return {
    isConnected,
    isConnecting,
    subscribe,
    send,
    connect,
    disconnect,
    subscribeToDashboardUpdates: webSocketService.subscribeToDashboardUpdates.bind(webSocketService),
    subscribeToNotifications: webSocketService.subscribeToNotifications.bind(webSocketService),
    subscribeToChartUpdates: webSocketService.subscribeToChartUpdates.bind(webSocketService),
    subscribeToProgressUpdates: webSocketService.subscribeToProgressUpdates.bind(webSocketService),
    requestRealTimeData: webSocketService.requestRealTimeData.bind(webSocketService),
    stopRealTimeData: webSocketService.stopRealTimeData.bind(webSocketService)
  };
}