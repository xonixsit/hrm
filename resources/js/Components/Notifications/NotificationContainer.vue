<template>
  <div class="notification-container">
    <!-- Toast Notifications by Position -->
    <div
      v-for="position in positions"
      :key="position"
      :class="getPositionClasses(position)"
    >
      <TransitionGroup
        :name="getTransitionName(position)"
        tag="div"
        class="space-y-2"
      >
        <ToastNotification
          v-for="notification in getNotificationsByPosition(position)"
          :key="notification.id"
          v-bind="notification"
          @close="handleNotificationClose(notification.id)"
          @action="handleNotificationAction(notification.id)"
        />
      </TransitionGroup>
    </div>

    <!-- Modal Notifications -->
    <template v-for="notification in modalNotifications" :key="notification.id">
      <component
        :is="notification.component || 'NotificationModal'"
        v-bind="notification.props"
        @close="handleNotificationClose(notification.id)"
        @confirm="handleNotificationAction(notification.id, 'confirm')"
        @cancel="handleNotificationAction(notification.id, 'cancel')"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import ToastNotification from './ToastNotification.vue'
import NotificationModal from './NotificationModal.vue'
import notificationQueue from '@/services/NotificationQueue'

// Available positions for toast notifications
const positions = [
  'top-left',
  'top-center', 
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

// Computed properties for notifications
const toastNotifications = computed(() => 
  notificationQueue.notifications.filter(n => !n.component)
)

const modalNotifications = computed(() => 
  notificationQueue.notifications.filter(n => n.component)
)

// Position-based classes for toast containers
const getPositionClasses = (position) => {
  const baseClasses = 'fixed z-50 pointer-events-none'
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }
  
  return `${baseClasses} ${positionClasses[position] || positionClasses['top-right']}`
}

// Get notifications for specific position
const getNotificationsByPosition = (position) => {
  return notificationQueue.getByPosition(position)
}

// Transition names based on position
const getTransitionName = (position) => {
  if (position.includes('left')) return 'slide-left'
  if (position.includes('right')) return 'slide-right'
  if (position.includes('center')) return 'slide-center'
  return 'slide-right'
}

// Event handlers
const handleNotificationClose = (id) => {
  notificationQueue.remove(id)
}

const handleNotificationAction = (id, action = 'action') => {
  const notification = notificationQueue.getById(id)
  if (notification?.onAction) {
    notification.onAction(action)
  }
}

// Global notification methods for window access
const setupGlobalMethods = () => {
  // Make notification methods globally available
  window.notify = {
    success: (message, options) => notificationQueue.success(message, options),
    error: (message, options) => notificationQueue.error(message, options),
    warning: (message, options) => notificationQueue.warning(message, options),
    info: (message, options) => notificationQueue.info(message, options),
    loading: (message, options) => notificationQueue.loading(message, options),
    confirm: (options) => notificationQueue.confirm(options),
    alert: (message, options) => notificationQueue.alert(message, options),
    clear: () => notificationQueue.clear(),
    remove: (id) => notificationQueue.remove(id)
  }
}

const cleanupGlobalMethods = () => {
  if (window.notify) {
    delete window.notify
  }
}

// Lifecycle
onMounted(() => {
  setupGlobalMethods()
})

onUnmounted(() => {
  cleanupGlobalMethods()
})

// Expose notification queue for component access
defineExpose({
  notificationQueue,
  notify: window.notify
})
</script>

<style scoped>
/* Transition animations */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-center-enter-active,
.slide-center-leave-active {
  transition: all 0.3s ease;
}

.slide-center-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-center-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Container styles */
.notification-container {
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .notification-container [class*="top-"],
  .notification-container [class*="bottom-"] {
    @apply left-4 right-4;
  }
  
  .notification-container [class*="center"] {
    @apply transform-none;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-center-enter-active,
  .slide-center-leave-active {
    transition: none;
  }
}
</style>