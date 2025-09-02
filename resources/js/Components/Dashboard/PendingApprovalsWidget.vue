<template>
  <div class="pending-approvals-widget">
    <div class="widget-header">
      <h3 class="widget-title">Pending Approvals</h3>
      <span class="approval-count">{{ Math.min(approvals.length, 5) }}</span>
      <span v-if="approvals.length > 5" class="text-xs text-gray-500 ml-1">of {{ approvals.length }}</span>
    </div>
    
    <div v-if="approvals.length === 0" class="empty-state">
      <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-3" />
      <p class="text-gray-600">No pending approvals</p>
    </div>
    
    <div v-else class="approvals-list">
      <div
        v-for="approval in approvals.slice(0, 5)"
        :key="approval.id"
        class="approval-item"
      >
        <div class="approval-content">
          <h4 class="approval-title">{{ approval.title }}</h4>
          <p class="approval-description">{{ approval.description }}</p>
          <span class="approval-requester">{{ approval.requester }}</span>
        </div>
        <div class="approval-actions">
          <button
            @click="$emit('approve', approval)"
            class="approve-button"
          >
            <CheckIcon class="w-4 h-4" />
          </button>
          <button
            @click="$emit('reject', approval)"
            class="reject-button"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <button
      v-if="approvals.length > 5"
      @click="$emit('view-all')"
      class="view-all-button"
    >
      View All {{ approvals.length }} Approvals
    </button>
  </div>
</template>

<script setup>
import { CheckCircleIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';

defineProps({
  approvals: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

defineEmits(['approve', 'reject', 'view-all']);
</script>

<style scoped>
.pending-approvals-widget {
  @apply bg-white rounded-xl border border-orange-200 p-6 space-y-4;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.approval-count {
  @apply inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 text-sm font-bold rounded-full;
}

.empty-state {
  @apply text-center py-8;
}

.approvals-list {
  @apply space-y-3;
}

.approval-item {
  @apply flex items-center justify-between p-4 bg-orange-50 rounded-lg;
}

.approval-content {
  @apply flex-1 min-w-0;
}

.approval-title {
  @apply font-medium text-gray-900;
}

.approval-description {
  @apply text-sm text-gray-600 truncate;
}

.approval-requester {
  @apply text-xs text-gray-500;
}

.approval-actions {
  @apply flex space-x-2;
}

.approve-button {
  @apply p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200;
}

.reject-button {
  @apply p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200;
}

.view-all-button {
  @apply w-full py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100;
}
</style>