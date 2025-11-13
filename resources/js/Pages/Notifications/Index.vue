<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Notifications</h1>
    <div v-for="notification in notifications.data" :key="notification.id" class="mb-4 p-4 border rounded">
      <p>{{ notification.message }}</p>
      <p class="text-sm text-gray-500">{{ notification.created_at }}</p>
      <button v-if="!notification.read_at" @click="markAsRead(notification)" class="text-teal-500">Mark as Read</button>
    </div>
    <div v-if="notifications.last_page > 1">
      <Pagination 
        :links="notifications.links"
        :current-page="notifications.current_page"
        :last-page="notifications.last_page"
        :total="notifications.total"
        :per-page="notifications.per_page"
        :from="notifications.from"
        :to="notifications.to"
      />
    </div>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import Pagination from '@/Components/Pagination.vue';

defineProps({
  notifications: Object,
});

function markAsRead(notification) {
  router.post(`/notifications/${notification.id}/read`);
}
</script>