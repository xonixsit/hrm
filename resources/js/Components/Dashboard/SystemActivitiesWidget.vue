<template>
  <div class="system-activities-widget">
    <div class="widget-header">
      <h3 class="widget-title">System Activities</h3>
      <button @click="$emit('refresh')" class="refresh-button">
        <ArrowPathIcon class="w-4 h-4" />
      </button>
    </div>
    
    <div class="activities-list">
      <div
        v-for="activity in activities.slice(0, 8)"
        :key="activity.id"
        class="activity-item"
      >
        <div :class="getActivityIconClasses(activity.type)" class="activity-icon">
          <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
        </div>
        <div class="activity-content">
          <p class="activity-title">{{ activity.title }}</p>
          <p class="activity-description">{{ activity.description }}</p>
          <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  BuildingOfficeIcon
} from '@heroicons/vue/24/outline';

defineProps({
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

defineEmits(['refresh']);

const getActivityIcon = (type) => {
  const iconMap = {
    create: UserPlusIcon,
    approve: CheckCircleIcon,
    reject: XCircleIcon,
    update: PencilIcon,
    department: BuildingOfficeIcon
  };
  return iconMap[type] || UserPlusIcon;
};

const getActivityIconClasses = (type) => {
  const classMap = {
    create: 'bg-green-100 text-green-600',
    approve: 'bg-teal-100 text-teal-600',
    reject: 'bg-red-100 text-red-600',
    update: 'bg-yellow-100 text-yellow-600',
    department: 'bg-purple-100 text-purple-600'
  };
  return `activity-icon-base ${classMap[type] || 'bg-gray-100 text-gray-600'}`;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};
</script>

<style scoped>
.system-activities-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-4;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.refresh-button {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50;
}

.activities-list {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.activity-item {
  @apply flex items-start space-x-3 p-3 bg-gray-50 rounded-lg;
}

.activity-icon-base {
  @apply flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.activity-title {
  @apply font-medium text-gray-900;
}

.activity-description {
  @apply text-sm text-gray-600;
}

.activity-time {
  @apply text-xs text-gray-500;
}
</style>