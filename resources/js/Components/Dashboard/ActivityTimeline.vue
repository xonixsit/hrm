<template>
  <DashboardWidget
    :title="title"
    :loading="loading"
    class="activity-timeline"
    padding="md"
  >
    <template #actions>
      <slot name="actions" />
    </template>

    <!-- Timeline Container -->
    <div class="timeline-container">
      <div v-if="activities.length === 0" class="timeline-empty">
        <div class="empty-state">
          <component v-if="emptyIcon" :is="emptyIcon" class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p class="text-neutral-500 text-center">{{ emptyMessage }}</p>
        </div>
      </div>

      <div v-else class="timeline-list">
        <div
          v-for="(activity, index) in displayedActivities"
          :key="activity.id || index"
          class="timeline-item"
          :class="{ 'timeline-item--last': index === displayedActivities.length - 1 }"
        >
          <!-- Timeline Line -->
          <div class="timeline-line">
            <div :class="getTimelineDotClasses(activity)" />
          </div>

          <!-- Activity Content -->
          <div class="timeline-content">
            <!-- Activity Header -->
            <div class="activity-header">
              <div class="activity-main">
                <h4 class="activity-title">{{ activity.title }}</h4>
                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>
              </div>
              <div class="activity-meta">
                <time class="activity-time" :datetime="activity.timestamp">
                  {{ formatTime(activity.timestamp) }}
                </time>
                <span v-if="activity.type" :class="getActivityTypeClasses(activity.type)">
                  {{ activity.type }}
                </span>
              </div>
            </div>

            <!-- Activity Details -->
            <div v-if="activity.details" class="activity-details">
              <div v-for="(detail, key) in activity.details" :key="key" class="detail-item">
                <span class="detail-label">{{ key }}:</span>
                <span class="detail-value">{{ detail }}</span>
              </div>
            </div>

            <!-- Activity Actions -->
            <div v-if="activity.actions" class="activity-actions">
              <button
                v-for="action in activity.actions"
                :key="action.label"
                @click="handleAction(action, activity)"
                class="action-button"
                :class="getActionClasses(action.type)"
              >
                <component v-if="action.icon" :is="action.icon" class="w-4 h-4" />
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading" class="timeline-footer">
        <button
          @click="loadMore"
          class="load-more-button"
          :disabled="loadingMore"
        >
          <component v-if="loadingMore" is="LoadingIcon" class="w-4 h-4 animate-spin" />
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed, ref } from 'vue';
import DashboardWidget from './DashboardWidget.vue';

const props = defineProps({
  // Timeline data
  activities: {
    type: Array,
    default: () => []
  },
  
  title: {
    type: String,
    default: 'Recent Activity'
  },
  
  // Display options
  maxItems: {
    type: Number,
    default: 10
  },
  
  showLoadMore: {
    type: Boolean,
    default: true
  },
  
  // Empty state
  emptyMessage: {
    type: String,
    default: 'No recent activity'
  },
  
  emptyIcon: {
    type: [String, Object],
    default: null
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  // Time formatting
  timeFormat: {
    type: String,
    default: 'relative',
    validator: (value) => ['relative', 'absolute', 'both'].includes(value)
  }
});

const emit = defineEmits(['load-more', 'action']);

// Local state
const loadingMore = ref(false);
const displayLimit = ref(props.maxItems);

// Computed properties
const displayedActivities = computed(() => {
  return props.activities.slice(0, displayLimit.value);
});

const hasMore = computed(() => {
  return props.showLoadMore && props.activities.length > displayLimit.value;
});

// Methods
const loadMore = async () => {
  if (loadingMore.value) return;
  
  loadingMore.value = true;
  try {
    await emit('load-more');
    displayLimit.value += props.maxItems;
  } finally {
    loadingMore.value = false;
  }
};

const handleAction = (action, activity) => {
  emit('action', { action, activity });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (props.timeFormat === 'absolute') {
    return date.toLocaleString();
  }
  
  if (props.timeFormat === 'relative' || diffInMinutes < 60) {
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  // Both format
  const relative = formatTime(timestamp);
  const absolute = date.toLocaleString();
  return `${relative} (${absolute})`;
};

const getTimelineDotClasses = (activity) => {
  const baseClasses = 'timeline-dot w-3 h-3 rounded-full border-2 border-white shadow-sm';
  
  const typeColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    default: 'bg-neutral-400'
  };
  
  const colorClass = typeColors[activity.status] || typeColors.default;
  return `${baseClasses} ${colorClass}`;
};

const getActivityTypeClasses = (type) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const typeStyles = {
    create: 'bg-success-100 text-success-800',
    update: 'bg-info-100 text-info-800',
    delete: 'bg-error-100 text-error-800',
    approve: 'bg-success-100 text-success-800',
    reject: 'bg-error-100 text-error-800',
    pending: 'bg-warning-100 text-warning-800',
    default: 'bg-neutral-100 text-neutral-800'
  };
  
  return `${baseClasses} ${typeStyles[type] || typeStyles.default}`;
};

const getActionClasses = (type) => {
  const baseClasses = 'inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md transition-colors';
  
  const typeStyles = {
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    success: 'bg-success-100 text-success-700 hover:bg-success-200',
    warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
    error: 'bg-error-100 text-error-700 hover:bg-error-200',
    default: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
  };
  
  return `${baseClasses} ${typeStyles[type] || typeStyles.default}`;
};
</script>

<style scoped>
.activity-timeline {
  /* Base timeline styling */
}

.timeline-container {
  @apply space-y-0;
}

.timeline-empty {
  @apply py-8;
}

.empty-state {
  @apply text-center;
}

.timeline-list {
  @apply space-y-0;
}

.timeline-item {
  @apply relative flex space-x-4 pb-6;
}

.timeline-item--last {
  @apply pb-0;
}

.timeline-line {
  @apply flex flex-col items-center;
}

.timeline-line::after {
  content: '';
  @apply w-px bg-neutral-200 flex-1 mt-2;
}

.timeline-item--last .timeline-line::after {
  @apply hidden;
}

.timeline-dot {
  @apply relative z-10;
}

.timeline-content {
  @apply flex-1 min-w-0;
}

.activity-header {
  @apply flex items-start justify-between mb-2;
}

.activity-main {
  @apply flex-1 min-w-0 mr-4;
}

.activity-title {
  @apply text-sm font-semibold text-neutral-900 mb-1;
}

.activity-description {
  @apply text-sm text-neutral-600;
}

.activity-meta {
  @apply flex flex-col items-end space-y-1;
}

.activity-time {
  @apply text-xs text-neutral-500;
}

.activity-details {
  @apply bg-neutral-50 rounded-lg p-3 mb-3 space-y-1;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-label {
  @apply font-medium text-neutral-600;
}

.detail-value {
  @apply text-neutral-900;
}

.activity-actions {
  @apply flex flex-wrap gap-2;
}

.action-button {
  @apply inline-flex items-center space-x-1;
}

.timeline-footer {
  @apply pt-4 border-t border-neutral-200 text-center;
}

.load-more-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>