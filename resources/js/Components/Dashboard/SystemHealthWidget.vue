<template>
  <div class="system-health-widget">
    <!-- Widget Header -->
    <div class="widget-header">
      <div class="header-content">
        <div class="header-icon">
          <ServerIcon class="w-5 h-5 text-green-600" />
        </div>
        <div class="header-text">
          <h3 class="widget-title">System Health</h3>
          <p class="widget-subtitle">Real-time system monitoring</p>
        </div>
      </div>
      <button
        @click="$emit('refresh')"
        :disabled="loading"
        class="refresh-button"
      >
        <ArrowPathIcon :class="['w-4 h-4', { 'animate-spin': loading }]" />
      </button>
    </div>

    <!-- Health Metrics -->
    <div class="health-metrics">
      <!-- Database Health -->
      <div class="metric-item">
        <div class="metric-header">
          <div class="metric-icon">
            <CircleStackIcon class="w-4 h-4" />
          </div>
          <span class="metric-label">Database</span>
          <div :class="getStatusClasses(health.database?.status)" class="status-indicator">
            <div class="status-dot"></div>
            <span class="status-text">{{ health.database?.status || 'Unknown' }}</span>
          </div>
        </div>
        <div class="metric-details">
          <span class="detail-label">Response Time:</span>
          <span class="detail-value">{{ health.database?.responseTime || 0 }}ms</span>
        </div>
      </div>

      <!-- Cache Health -->
      <div class="metric-item">
        <div class="metric-header">
          <div class="metric-icon">
            <BoltIcon class="w-4 h-4" />
          </div>
          <span class="metric-label">Cache</span>
          <div :class="getStatusClasses(health.cache?.status)" class="status-indicator">
            <div class="status-dot"></div>
            <span class="status-text">{{ health.cache?.status || 'Unknown' }}</span>
          </div>
        </div>
        <div class="metric-details">
          <span class="detail-label">Hit Rate:</span>
          <span class="detail-value">{{ health.cache?.hitRate || 0 }}%</span>
        </div>
      </div>

      <!-- Queue Health -->
      <div class="metric-item">
        <div class="metric-header">
          <div class="metric-icon">
            <QueueListIcon class="w-4 h-4" />
          </div>
          <span class="metric-label">Queue</span>
          <div :class="getStatusClasses(health.queue?.status)" class="status-indicator">
            <div class="status-dot"></div>
            <span class="status-text">{{ health.queue?.status || 'Unknown' }}</span>
          </div>
        </div>
        <div class="metric-details">
          <span class="detail-label">Pending Jobs:</span>
          <span class="detail-value">{{ health.queue?.pending || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Overall Status -->
    <div class="overall-status">
      <div :class="getOverallStatusClasses()" class="status-card">
        <div class="status-content">
          <component :is="getOverallStatusIcon()" class="w-6 h-6" />
          <div class="status-info">
            <span class="status-title">{{ getOverallStatusText() }}</span>
            <span class="status-description">{{ getOverallStatusDescription() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Last Updated -->
    <div class="last-updated">
      <ClockIcon class="w-3 h-3 text-gray-400" />
      <span class="updated-text">Last updated: {{ formatTime(new Date()) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  ServerIcon,
  ArrowPathIcon,
  CircleStackIcon,
  BoltIcon,
  QueueListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  health: {
    type: Object,
    default: () => ({
      database: { status: 'healthy', responseTime: 25 },
      cache: { status: 'healthy', hitRate: 92 },
      queue: { status: 'healthy', pending: 3 }
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['refresh']);

// Status helpers
const getStatusClasses = (status) => {
  const statusClasses = {
    healthy: 'status-healthy',
    warning: 'status-warning',
    error: 'status-error',
    unknown: 'status-unknown'
  };
  return statusClasses[status] || statusClasses.unknown;
};

const getOverallStatusClasses = () => {
  const allHealthy = Object.values(props.health).every(service => service.status === 'healthy');
  const hasError = Object.values(props.health).some(service => service.status === 'error');
  const hasWarning = Object.values(props.health).some(service => service.status === 'warning');

  if (hasError) return 'overall-status-error';
  if (hasWarning) return 'overall-status-warning';
  if (allHealthy) return 'overall-status-healthy';
  return 'overall-status-unknown';
};

const getOverallStatusIcon = () => {
  const allHealthy = Object.values(props.health).every(service => service.status === 'healthy');
  const hasError = Object.values(props.health).some(service => service.status === 'error');
  const hasWarning = Object.values(props.health).some(service => service.status === 'warning');

  if (hasError) return XCircleIcon;
  if (hasWarning) return ExclamationTriangleIcon;
  if (allHealthy) return CheckCircleIcon;
  return ExclamationTriangleIcon;
};

const getOverallStatusText = () => {
  const allHealthy = Object.values(props.health).every(service => service.status === 'healthy');
  const hasError = Object.values(props.health).some(service => service.status === 'error');
  const hasWarning = Object.values(props.health).some(service => service.status === 'warning');

  if (hasError) return 'System Issues Detected';
  if (hasWarning) return 'System Warnings';
  if (allHealthy) return 'All Systems Operational';
  return 'System Status Unknown';
};

const getOverallStatusDescription = () => {
  const allHealthy = Object.values(props.health).every(service => service.status === 'healthy');
  const hasError = Object.values(props.health).some(service => service.status === 'error');
  const hasWarning = Object.values(props.health).some(service => service.status === 'warning');

  if (hasError) return 'Immediate attention required';
  if (hasWarning) return 'Monitor system performance';
  if (allHealthy) return 'System running smoothly';
  return 'Unable to determine status';
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
</script>

<style scoped>
.system-health-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-6;
}

/* Widget Header */
.widget-header {
  @apply flex items-center justify-between;
}

.header-content {
  @apply flex items-center space-x-3;
}

.header-icon {
  @apply flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg;
}

.header-text {
  @apply flex-1;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.widget-subtitle {
  @apply text-sm text-gray-500;
}

.refresh-button {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors;
}

/* Health Metrics */
.health-metrics {
  @apply space-y-4;
}

.metric-item {
  @apply p-4 bg-gray-50 rounded-lg space-y-2;
}

.metric-header {
  @apply flex items-center justify-between;
}

.metric-icon {
  @apply flex items-center justify-center w-8 h-8 bg-white rounded-lg text-gray-600;
}

.metric-label {
  @apply flex-1 ml-3 font-medium text-gray-900;
}

/* Status Indicators */
.status-indicator {
  @apply flex items-center space-x-2;
}

.status-dot {
  @apply w-2 h-2 rounded-full;
}

.status-text {
  @apply text-xs font-medium capitalize;
}

.status-healthy {
  @apply text-green-700;
}

.status-healthy .status-dot {
  @apply bg-green-500;
}

.status-warning {
  @apply text-yellow-700;
}

.status-warning .status-dot {
  @apply bg-yellow-500;
}

.status-error {
  @apply text-red-700;
}

.status-error .status-dot {
  @apply bg-red-500;
}

.status-unknown {
  @apply text-gray-700;
}

.status-unknown .status-dot {
  @apply bg-gray-500;
}

/* Metric Details */
.metric-details {
  @apply flex items-center justify-between text-sm;
}

.detail-label {
  @apply text-gray-600;
}

.detail-value {
  @apply font-medium text-gray-900;
}

/* Overall Status */
.overall-status {
  @apply pt-4 border-t border-gray-200;
}

.status-card {
  @apply p-4 rounded-lg;
}

.status-content {
  @apply flex items-center space-x-3;
}

.status-info {
  @apply flex-1;
}

.status-title {
  @apply block font-medium;
}

.status-description {
  @apply block text-sm opacity-75;
}

.overall-status-healthy {
  @apply bg-green-50 text-green-800;
}

.overall-status-warning {
  @apply bg-yellow-50 text-yellow-800;
}

.overall-status-error {
  @apply bg-red-50 text-red-800;
}

.overall-status-unknown {
  @apply bg-gray-50 text-gray-800;
}

/* Last Updated */
.last-updated {
  @apply flex items-center space-x-1 text-xs text-gray-500 pt-4 border-t border-gray-100;
}

.updated-text {
  @apply text-gray-500;
}
</style>