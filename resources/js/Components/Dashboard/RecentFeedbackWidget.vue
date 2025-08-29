<template>
  <div class="recent-feedback-widget">
    <div class="widget-header">
      <h3 class="widget-title">Recent Feedback</h3>
    </div>
    
    <div v-if="feedback.length === 0" class="feedback-placeholder">
      <ChatBubbleLeftEllipsisIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-600 text-center">No recent feedback</p>
    </div>
    
    <div v-else class="feedback-list">
      <div
        v-for="item in feedback.slice(0, 3)"
        :key="item.id"
        class="feedback-item"
      >
        <div class="feedback-content">
          <p class="feedback-text">{{ item.content }}</p>
          <div class="feedback-meta">
            <span class="feedback-reviewer">{{ item.reviewer }}</span>
            <span class="feedback-date">{{ formatDate(item.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline';

defineProps({
  feedback: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.recent-feedback-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.widget-header {
  @apply flex items-center justify-between mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.feedback-placeholder {
  @apply py-8;
}

.feedback-list {
  @apply space-y-4;
}

.feedback-item {
  @apply p-4 bg-blue-50 rounded-lg;
}

.feedback-text {
  @apply text-gray-900 mb-2;
}

.feedback-meta {
  @apply flex justify-between text-sm text-gray-600;
}
</style>