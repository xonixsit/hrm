<template>
  <div class="team-performance-widget">
    <div class="widget-header">
      <h3 class="widget-title">Team Performance</h3>
    </div>
    
    <div class="performance-content">
      <div class="performance-score">
        <div class="score-circle">
          <span class="score-value">85%</span>
        </div>
        <p class="score-label">Overall Performance</p>
      </div>
      
      <div class="performance-metrics">
        <div class="metric-item">
          <span class="metric-label">Productivity</span>
          <div class="metric-bar">
            <div class="metric-fill" style="width: 88%"></div>
          </div>
          <span class="metric-value">88%</span>
        </div>
        
        <div class="metric-item">
          <span class="metric-label">Quality</span>
          <div class="metric-bar">
            <div class="metric-fill" style="width: 92%"></div>
          </div>
          <span class="metric-value">92%</span>
        </div>
        
        <div class="metric-item">
          <span class="metric-label">Collaboration</span>
          <div class="metric-bar">
            <div class="metric-fill" style="width: 78%"></div>
          </div>
          <span class="metric-value">78%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  performance: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
});
</script>

<style scoped>
.team-performance-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-6;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.performance-content {
  @apply space-y-6;
}

.performance-score {
  @apply text-center;
}

.score-circle {
  @apply w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2;
}

.score-value {
  @apply text-xl font-bold text-white;
}

.score-label {
  @apply text-sm text-gray-600;
}

.performance-metrics {
  @apply space-y-4;
}

.metric-item {
  @apply flex items-center space-x-3;
}

.metric-label {
  @apply text-sm font-medium text-gray-700 w-20 flex-shrink-0;
}

.metric-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.metric-fill {
  @apply h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300;
}

.metric-value {
  @apply text-sm font-medium text-gray-900 w-10 text-right;
}
</style>