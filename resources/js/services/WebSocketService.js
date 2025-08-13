/**
 * WebSocket Service for Real-time Updates
 * Handles real-time communication for attendance tracking and notifications
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
    this.isConnected = false
    this.heartbeatInterval = null
    this.heartbeatTimeout = null
  }

  /**
   * Connect to WebSocket server
   */
  connect(url = null) {
    try {
      // Use provided URL or construct from current location
      const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      
      console.log('WebSocket: Attempting to connect to', wsUrl)
    } catch (error) {
      console.error('WebSocket: Connection failed', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen(event) {
    console.log('WebSocket: Connected successfully')
    this.isConnected = true
    this.reconnectAttempts = 0
    
    // Start heartbeat
    this.startHeartbeat()
    
    // Emit connection event
    this.emit('connected', { timestamp: new Date() })
    
    // Send authentication if user token is available
    const token = this.getAuthToken()
    if (token) {
      this.send('auth', { token })
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)
      
      // Handle heartbeat response
      if (data.type === 'pong') {
        this.handlePong()
        return
      }
      
      // Handle authentication response
      if (data.type === 'auth_success') {
        console.log('WebSocket: Authentication successful')
        this.emit('authenticated', data)
        return
      }
      
      // Handle attendance updates
      if (data.type === 'attendance_update') {
        this.emit('attendance_update', data.payload)
        return
      }
      
      // Handle notifications
      if (data.type === 'notification') {
        this.emit('notification', data.payload)
        return
      }
      
      // Handle real-time stats updates
      if (data.type === 'stats_update') {
        this.emit('stats_update', data.payload)
        return
      }
      
      // Emit generic message event
      this.emit('message', data)
      
    } catch (error) {
      console.error('WebSocket: Failed to parse message', error)
    }
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    console.log('WebSocket: Connection closed', event.code, event.reason)
    this.isConnected = false
    this.stopHeartbeat()
    
    this.emit('disconnected', { 
      code: event.code, 
      reason: event.reason,
      timestamp: new Date()
    })
    
    // Attempt to reconnect if not a clean close
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('WebSocket: Error occurred', error)
    this.emit('error', error)
  }

  /**
   * Send message through WebSocket
   */
  send(type, payload = {}) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket: Cannot send message, not connected')
      return false
    }
    
    try {
      const message = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      })
      
      this.ws.send(message)
      return true
    } catch (error) {
      console.error('WebSocket: Failed to send message', error)
      return false
    }
  }

  /**
   * Subscribe to clock in/out updates
   */
  subscribeToAttendance(userId) {
    this.send('subscribe_attendance', { user_id: userId })
  }

  /**
   * Send clock in event
   */
  clockIn(data = {}) {
    this.send('clock_in', {
      timestamp: new Date().toISOString(),
      location: data.location || null,
      ...data
    })
  }

  /**
   * Send clock out event
   */
  clockOut(data = {}) {
    this.send('clock_out', {
      timestamp: new Date().toISOString(),
      location: data.location || null,
      ...data
    })
  }

  /**
   * Send break start event
   */
  startBreak(data = {}) {
    this.send('break_start', {
      timestamp: new Date().toISOString(),
      ...data
    })
  }

  /**
   * Send break end event
   */
  endBreak(data = {}) {
    this.send('break_end', {
      timestamp: new Date().toISOString(),
      ...data
    })
  }

  /**
   * Request real-time stats update
   */
  requestStatsUpdate() {
    this.send('request_stats')
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping')
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('WebSocket: Heartbeat timeout, closing connection')
          this.ws.close()
        }, 5000)
      }
    }, 30000) // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * Handle pong response
   */
  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached')
      this.emit('max_reconnect_attempts')
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`WebSocket: Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect()
      }
    }, delay)
  }

  /**
   * Get authentication token from localStorage or cookie
   */
  getAuthToken() {
    // Try to get token from various sources
    return localStorage.getItem('auth_token') || 
           sessionStorage.getItem('auth_token') ||
           this.getCookie('auth_token')
  }

  /**
   * Get cookie value by name
   */
  getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`WebSocket: Error in event listener for ${event}`, error)
      }
    })
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat()
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.isConnected = false
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService()

// Auto-connect when service is imported (optional)
// webSocketService.connect()

export default webSocketService