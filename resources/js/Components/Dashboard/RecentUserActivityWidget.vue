<template>
  <div class="recent-user-activity-widget">
    <div class="widget-header">
      <h3 class="widget-title">Recent User Activity</h3>
    </div>
    
    <div class="activity-list">
      <div
        v-for="activity in activities.slice(0, 10)"
        :key="activity.id"
        class="activity-item"
      >
        <div class="user-avatar">
          {{ activity.user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="activity-content">
          <span class="user-name">{{ activity.user.name }}</span>
          <span class="activity-action">{{ activity.action }}</span>
          <div class="activity-time">{{ formatTimeAgo(activity.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activities: { type: Array, default: () => [] }
});

const formatTimeAgo = (date) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now - activityDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};
</script>

<style scoped>
.recent-user-activity-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-4;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.activity-list {
  @apply space-y-3 max-h-80 overflow-y-auto;
}

.activity-item {
  @apply flex items-center space-x-3;
}

.user-avatar {
  @apply w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.user-name {
  @apply font-medium text-gray-900;
}

.activity-action {
  @apply text-gray-600 ml-1;
}

.activity-time {
  @apply text-xs text-gray-500;
}
</style>