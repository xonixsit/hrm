<template>
  <DashboardWidget
    :title="title"
    :loading="loading"
    class="competency-dashboard-widget"
  >
    <template #actions>
      <button
        @click="viewDetails"
        class="text-sm text-primary-600 hover:text-primary-700"
      >
        View Details
      </button>
    </template>

    <div class="competency-metrics">
      <!-- Key Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-icon">
            <CheckCircleIcon class="w-5 h-5 text-success-600" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.completedAssessments || 0 }}</div>
            <div class="metric-label">Completed</div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <ClockIcon class="w-5 h-5 text-warning-600" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.pendingAssessments || 0 }}</div>
            <div class="metric-label">Pending</div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <CalendarIcon class="w-5 h-5 text-primary-600" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.activeCycles || 0 }}</div>
            <div class="metric-label">Active Cycles</div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <StarIcon class="w-5 h-5 text-info-600" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.averageRating || '-' }}</div>
            <div class="metric-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity" v-if="recentActivity && recentActivity.length > 0">
        <h4 class="activity-title">Recent Activity</h4>
        <div class="activity-list">
          <div
            v-for="activity in recentActivity.slice(0, 3)"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <component 
                :is="getActivityIcon(activity.type)" 
                class="w-4 h-4"
                :class="getActivityIconColor(activity.type)"
              />
            </div>
            <div class="activity-content">
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="empty-state">
        <AcademicCapIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p class="text-neutral-500 text-center">No recent competency activity</p>
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed } from 'vue';
import DashboardWidget from './DashboardWidget.vue';
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  AcademicCapIcon,
  UserIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  title: {
    type: String,
    default: 'Competency Overview'
  },
  metrics: {
    type: Object,
    default: () => ({
      completedAssessments: 0,
      pendingAssessments: 0,
      activeCycles: 0,
      averageRating: null
    })
  },
  recentActivity: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view-details']);

const viewDetails = () => {
  emit('view-details');
};

const getActivityIcon = (type) => {
  const iconMap = {
    'assessment-completed': CheckCircleIcon,
    'assessment-submitted': DocumentCheckIcon,
    'assessment-pending': ClockIcon,
    'cycle-started': CalendarIcon,
    'employee-assessed': UserIcon,
    'default': AcademicCapIcon
  };
  return iconMap[type] || iconMap.default;
};

const getActivityIconColor = (type) => {
  const colorMap = {
    'assessment-completed': 'text-success-600',
    'assessment-submitted': 'text-primary-600',
    'assessment-pending': 'text-warning-600',
    'cycle-started': 'text-info-600',
    'employee-assessed': 'text-purple-600',
    'default': 'text-neutral-600'
  };
  return colorMap[type] || colorMap.default;
};

const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const target = new Date(timestamp);
  const diffInMinutes = Math.floor((now - target) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
</script>

<style scoped>
.competency-dashboard-widget {
  @apply h-full;
}

.competency-metrics {
  @apply space-y-6;
}

.metrics-grid {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.metric-item {
  @apply flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg;
}

.metric-icon {
  @apply flex-shrink-0;
}

.metric-content {
  @apply flex-1 min-w-0;
}

.metric-value {
  @apply text-lg font-bold text-neutral-900;
}

.metric-label {
  @apply text-xs text-neutral-600 font-medium uppercase tracking-wide;
}

.recent-activity {
  @apply space-y-3;
}

.activity-title {
  @apply text-sm font-semibold text-neutral-900 border-b border-neutral-200 pb-2;
}

.activity-list {
  @apply space-y-3;
}

.activity-item {
  @apply flex items-start space-x-3;
}

.activity-icon {
  @apply flex-shrink-0 mt-0.5;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.activity-description {
  @apply text-sm text-neutral-900;
}

.activity-time {
  @apply text-xs text-neutral-500;
}

.empty-state {
  @apply py-8 text-center;
}
</style>