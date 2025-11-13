<template>
  <div class="team-members-widget">
    <div class="widget-header">
      <h3 class="widget-title">Team Members</h3>
      <span class="member-count">{{ members.length }}</span>
    </div>
    
    <div class="members-list">
      <div
        v-for="member in members"
        :key="member.id"
        class="member-item"
      >
        <div class="member-avatar">
          {{ member.name.charAt(0).toUpperCase() }}
        </div>
        <div class="member-info">
          <h4 class="member-name">{{ member.name }}</h4>
          <p class="member-position">{{ member.position }}</p>
        </div>
        <div class="member-actions">
          <button
            @click="$emit('view-member', member)"
            class="action-button view-button"
          >
            <EyeIcon class="w-4 h-4" />
          </button>
          <button
            @click="$emit('send-message', member)"
            class="action-button message-button"
          >
            <ChatBubbleLeftIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, ChatBubbleLeftIcon } from '@heroicons/vue/24/outline';

defineProps({
  members: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

defineEmits(['view-member', 'send-message']);
</script>

<style scoped>
.team-members-widget {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-4;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.member-count {
  @apply inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-800 text-sm font-bold rounded-full;
}

.members-list {
  @apply space-y-3 max-h-80 overflow-y-auto;
}

.member-item {
  @apply flex items-center space-x-3 p-3 bg-gray-50 rounded-lg;
}

.member-avatar {
  @apply w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-medium;
}

.member-info {
  @apply flex-1 min-w-0;
}

.member-name {
  @apply font-medium text-gray-900;
}

.member-position {
  @apply text-sm text-gray-600;
}

.member-actions {
  @apply flex space-x-2;
}

.action-button {
  @apply p-2 rounded-lg transition-colors;
}

.view-button {
  @apply bg-teal-100 text-teal-600 hover:bg-teal-200;
}

.message-button {
  @apply bg-green-100 text-green-600 hover:bg-green-200;
}
</style>