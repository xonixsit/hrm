<template>
  <div class="notification-center" :class="notificationCenterClasses">
    <!-- Notification Trigger -->
    <div class="notification-trigger">
      <button
        @click="toggleNotifications"
        class="notification-button"
        :class="{ 'notification-button--active': isOpen }"
        :aria-expanded="isOpen"
        aria-haspopup="true"
        :aria-label="`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`"
      >
        <component :is="bellIcon" class="w-6 h-6" />
        
        <!-- Unread Badge -->
        <span
          v-if="unreadCount > 0"
          class="notification-badge"
          :class="badgeClasses"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
        
        <!-- Pulse Animation for New Notifications -->
        <span
          v-if="hasNewNotifications"
          class="notification-pulse"
        />
      </button>
    </div>

    <!-- Notification Panel -->
    <Transition
      name="notification-panel"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="notification-panel"
        :class="panelClasses"
        @click.stop
      >
        <!-- Panel Header -->
        <div class="notification-header">
          <div class="header-content">
            <h3 class="header-title">Notifications</h3>
            <div class="header-actions">
              <!-- Mark All Read -->
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="header-action-button"
                title="Mark all as read"
              >
                <component :is="checkAllIcon" class="w-4 h-4" />
              </button>
              
              <!-- Settings -->
              <button
                @click="openSettings"
                class="header-action-button"
                title="Notification settings"
              >
                <component :is="settingsIcon" class="w-4 h-4" />
              </button>
              
              <!-- Close -->
              <button
                @click="closeNotifications"
                class="header-action-button"
                title="Close notifications"
              >
                <component :is="closeIcon" class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- Filter Tabs -->
          <div v-if="showFilters" class="notification-filters">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="setActiveFilter(filter.value)"
              class="filter-button"
              :class="{ 'filter-button--active': activeFilter === filter.value }"
            >
              {{ filter.label }}
              <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="notification-list" :class="{ 'notification-list--loading': loading }">
          <!-- Loading State -->
          <div v-if="loading" class="notification-loading">
            <div v-for="i in 3" :key="i" class="notification-skeleton">
              <div class="skeleton-avatar" />
              <div class="skeleton-content">
                <div class="skeleton-line skeleton-line--title" />
                <div class="skeleton-line skeleton-line--subtitle" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredNotifications.length === 0" class="notification-empty">
            <component :is="emptyIcon" class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">{{ emptyMessage }}</p>
          </div>

          <!-- Notifications -->
          <div v-else class="notification-items">
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              class="notification-item"
              :class="getNotificationClasses(notification)"
              @click="handleNotificationClick(notification)"
            >
              <!-- Notification Icon/Avatar -->
              <div class="notification-icon">
                <div v-if="notification.avatar" class="notification-avatar">
                  <img :src="notification.avatar" :alt="notification.sender" class="avatar-image" />
                </div>
                <div v-else class="notification-type-icon" :class="`notification-type-icon--${notification.type}`">
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
              </div>

              <!-- Notification Content -->
              <div class="notification-content">
                <div class="notification-main">
                  <h4 class="notification-title">{{ notification.title }}</h4>
                  <p class="notification-message">{{ notification.message }}</p>
                </div>
                
                <div class="notification-meta">
                  <time class="notification-time" :datetime="notification.timestamp">
                    {{ formatTime(notification.timestamp) }}
                  </time>
                  <span v-if="notification.category" class="notification-category">
                    {{ notification.category }}
                  </span>
                </div>
              </div>

              <!-- Notification Actions -->
              <div class="notification-actions">
                <!-- Unread Indicator -->
                <div
                  v-if="!notification.read"
                  class="unread-indicator"
                  title="Unread notification"
                />
                
                <!-- Action Buttons -->
                <div class="action-buttons">
                  <button
                    v-if="!notification.read"
                    @click.stop="markAsRead(notification.id)"
                    class="action-button"
                    title="Mark as read"
                  >
                    <component :is="checkIcon" class="w-4 h-4" />
                  </button>
                  
                  <button
                    @click.stop="removeNotification(notification.id)"
                    class="action-button action-button--danger"
                    title="Remove notification"
                  >
                    <component :is="trashIcon" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMore && !loading" class="notification-load-more">
            <button
              @click="loadMore"
              class="load-more-button"
              :disabled="loadingMore"
            >
              <component v-if="loadingMore" :is="loadingIcon" class="w-4 h-4 animate-spin" />
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>

        <!-- Panel Footer -->
        <div v-if="showFooter" class="notification-footer">
          <button
            @click="viewAllNotifications"
            class="view-all-button"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen && showBackdrop"
      class="notification-backdrop"
      @click="closeNotifications"
    />
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { getIcon } from '@/config/icons';

const props = defineProps({
  // Notification data
  notifications: {
    type: Array,
    default: () => []
  },
  
  // Display options
  maxDisplayed: {
    type: Number,
    default: 10
  },
  
  showFilters: {
    type: Boolean,
    default: true
  },
  
  showFooter: {
    type: Boolean,
    default: true
  },
  
  showBackdrop: {
    type: Boolean,
    default: true
  },
  
  // Panel positioning
  position: {
    type: String,
    default: 'bottom-right',
    validator: (value) => ['bottom-left', 'bottom-right', 'top-left', 'top-right'].includes(value)
  },
  
  // Panel size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Auto-refresh
  autoRefresh: {
    type: Boolean,
    default: true
  },
  
  refreshInterval: {
    type: Number,
    default: 30000 // 30 seconds
  },
  
  // Real-time updates
  realTime: {
    type: Boolean,
    default: false
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  // Empty state
  emptyMessage: {
    type: String,
    default: 'No notifications'
  }
});

const emit = defineEmits([
  'notification-click',
  'mark-as-read',
  'mark-all-as-read',
  'remove-notification',
  'load-more',
  'refresh',
  'settings',
  'view-all'
]);

// Local state
const isOpen = ref(false);
const activeFilter = ref('all');
const loadingMore = ref(false);
const displayLimit = ref(props.maxDisplayed);
const refreshTimer = ref(null);
const hasNewNotifications = ref(false);

// Icons
const bellIcon = computed(() => getIcon('bell'));
const checkIcon = computed(() => getIcon('check'));
const checkAllIcon = computed(() => getIcon('check-circle'));
const settingsIcon = computed(() => getIcon('cog'));
const closeIcon = computed(() => getIcon('x-mark'));
const trashIcon = computed(() => getIcon('trash'));
const loadingIcon = computed(() => getIcon('loading') || getIcon('refresh'));
const emptyIcon = computed(() => getIcon('bell-slash') || getIcon('bell'));

// Notification filters
const filters = computed(() => [
  { label: 'All', value: 'all', count: props.notifications.length },
  { label: 'Unread', value: 'unread', count: unreadCount.value },
  { label: 'Important', value: 'important', count: importantCount.value },
  { label: 'Mentions', value: 'mentions', count: mentionCount.value }
]);

// Computed properties
const notificationCenterClasses = computed(() => [
  'notification-center',
  `notification-center--${props.position}`,
  `notification-center--${props.size}`,
  {
    'notification-center--open': isOpen.value
  }
]);

const panelClasses = computed(() => [
  'notification-panel',
  `notification-panel--${props.position}`,
  `notification-panel--${props.size}`
]);

const badgeClasses = computed(() => [
  'notification-badge',
  {
    'notification-badge--pulse': hasNewNotifications.value
  }
]);

const unreadCount = computed(() => {
  if (!props.notifications || !Array.isArray(props.notifications)) return 0;
  return props.notifications.filter(n => n && !n.read).length;
});

const importantCount = computed(() => {
  if (!props.notifications || !Array.isArray(props.notifications)) return 0;
  return props.notifications.filter(n => n && (n.priority === 'high' || n.important)).length;
});

const mentionCount = computed(() => {
  if (!props.notifications || !Array.isArray(props.notifications)) return 0;
  return props.notifications.filter(n => n && (n.type === 'mention' || n.mentions?.includes('current_user'))).length;
});

const filteredNotifications = computed(() => {
  if (!props.notifications || !Array.isArray(props.notifications)) return [];
  
  let filtered = [...props.notifications].filter(n => n != null);
  
  switch (activeFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read);
      break;
    case 'important':
      filtered = filtered.filter(n => n.priority === 'high' || n.important);
      break;
    case 'mentions':
      filtered = filtered.filter(n => n.type === 'mention' || n.mentions?.includes('current_user'));
      break;
    default:
      // Show all
      break;
  }
  
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const displayedNotifications = computed(() => {
  return filteredNotifications.value.slice(0, displayLimit.value);
});

const hasMore = computed(() => {
  return filteredNotifications.value.length > displayLimit.value;
});

// Methods
const toggleNotifications = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasNewNotifications.value = false;
  }
};

const closeNotifications = () => {
  isOpen.value = false;
};

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  displayLimit.value = props.maxDisplayed; // Reset display limit when changing filters
};

const handleNotificationClick = (notification) => {
  emit('notification-click', notification);
  if (!notification.read) {
    markAsRead(notification.id);
  }
};

const markAsRead = (notificationId) => {
  emit('mark-as-read', notificationId);
};

const markAllAsRead = () => {
  emit('mark-all-as-read');
};

const removeNotification = (notificationId) => {
  emit('remove-notification', notificationId);
};

const loadMore = async () => {
  if (loadingMore.value) return;
  
  loadingMore.value = true;
  try {
    await emit('load-more');
    displayLimit.value += props.maxDisplayed;
  } finally {
    loadingMore.value = false;
  }
};

const openSettings = () => {
  emit('settings');
  closeNotifications();
};

const viewAllNotifications = () => {
  emit('view-all');
  closeNotifications();
};

const refreshNotifications = () => {
  emit('refresh');
};

const getNotificationClasses = (notification) => [
  {
    'notification-item--unread': !notification.read,
    'notification-item--important': notification.priority === 'high' || notification.important,
    'notification-item--clickable': notification.action || notification.link
  }
];

const getNotificationIcon = (type) => {
  const iconMap = {
    info: 'information-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'x-circle',
    mention: 'at-symbol',
    message: 'chat-bubble-left-right',
    system: 'cog',
    update: 'arrow-up-circle',
    reminder: 'clock',
    default: 'bell'
  };
  
  return getIcon(iconMap[type] || iconMap.default);
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

// Auto-refresh setup
const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer.value = setInterval(refreshNotifications, props.refreshInterval);
  }
};

const clearAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
};

// Click outside handler
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.notification-center')) {
    closeNotifications();
  }
};

// Watch for new notifications
watch(() => props.notifications.length, (newLength, oldLength) => {
  if (newLength > oldLength && !isOpen.value) {
    hasNewNotifications.value = true;
  }
});

// Lifecycle
onMounted(() => {
  setupAutoRefresh();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  clearAutoRefresh();
  document.removeEventListener('click', handleClickOutside);
});

// Watch for auto-refresh changes
watch(() => props.autoRefresh, (enabled) => {
  if (enabled) {
    setupAutoRefresh();
  } else {
    clearAutoRefresh();
  }
});

watch(() => props.refreshInterval, () => {
  clearAutoRefresh();
  setupAutoRefresh();
});
</script>

<style scoped>
.notification-center {
  @apply relative inline-block;
}

/* Notification Button */
.notification-button {
  @apply relative inline-flex items-center justify-center w-10 h-10 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.notification-button--active {
  @apply text-primary-600 bg-primary-50;
}

.notification-badge {
  @apply absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-error-500 rounded-full min-w-[18px] h-[18px];
}

.notification-badge--pulse {
  animation: notification-pulse 2s infinite;
}

.notification-pulse {
  @apply absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full opacity-75;
  animation: notification-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Notification Panel */
.notification-panel {
  @apply absolute z-50 w-96 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden;
}

.notification-panel--sm {
  @apply w-80;
}

.notification-panel--md {
  @apply w-96;
}

.notification-panel--lg {
  @apply w-[28rem];
}

.notification-panel--bottom-left {
  @apply top-full left-0 mt-2;
}

.notification-panel--bottom-right {
  @apply top-full right-0 mt-2;
}

.notification-panel--top-left {
  @apply bottom-full left-0 mb-2;
}

.notification-panel--top-right {
  @apply bottom-full right-0 mb-2;
}

/* Panel Header */
.notification-header {
  @apply bg-neutral-50 border-b border-neutral-200;
}

.header-content {
  @apply flex items-center justify-between px-4 py-3;
}

.header-title {
  @apply text-lg font-semibold text-neutral-900;
}

.header-actions {
  @apply flex items-center space-x-1;
}

.header-action-button {
  @apply inline-flex items-center justify-center w-8 h-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors;
}

/* Notification Filters */
.notification-filters {
  @apply flex border-t border-neutral-200;
}

.filter-button {
  @apply flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors;
}

.filter-button--active {
  @apply text-primary-600 bg-primary-50 border-b-2 border-primary-600;
}

.filter-count {
  @apply ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-neutral-500 bg-neutral-200 rounded-full;
}

.filter-button--active .filter-count {
  @apply text-primary-600 bg-primary-100;
}

/* Notification List */
.notification-list {
  @apply max-h-96 overflow-y-auto;
}

.notification-list--loading {
  @apply overflow-hidden;
}

.notification-loading {
  @apply p-4 space-y-3;
}

.notification-skeleton {
  @apply flex items-start space-x-3;
}

.skeleton-avatar {
  @apply w-10 h-10 bg-neutral-200 rounded-full animate-pulse;
}

.skeleton-content {
  @apply flex-1 space-y-2;
}

.skeleton-line {
  @apply bg-neutral-200 rounded animate-pulse;
}

.skeleton-line--title {
  @apply h-4 w-3/4;
}

.skeleton-line--subtitle {
  @apply h-3 w-1/2;
}

.notification-empty {
  @apply py-12 px-4;
}

.notification-items {
  @apply divide-y divide-neutral-200;
}

/* Notification Item */
.notification-item {
  @apply flex items-start space-x-3 p-4 hover:bg-neutral-50 transition-colors cursor-pointer;
}

.notification-item--unread {
  @apply bg-blue-50;
}

.notification-item--important {
  @apply border-l-4 border-warning-500;
}

.notification-item--clickable:hover {
  @apply bg-neutral-100;
}

.notification-icon {
  @apply flex-shrink-0;
}

.notification-avatar {
  @apply w-10 h-10 rounded-full overflow-hidden;
}

.avatar-image {
  @apply w-full h-full object-cover;
}

.notification-type-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
}

.notification-type-icon--info {
  @apply bg-info-100 text-info-600;
}

.notification-type-icon--success {
  @apply bg-success-100 text-success-600;
}

.notification-type-icon--warning {
  @apply bg-warning-100 text-warning-600;
}

.notification-type-icon--error {
  @apply bg-error-100 text-error-600;
}

.notification-type-icon--mention {
  @apply bg-primary-100 text-primary-600;
}

.notification-type-icon--message {
  @apply bg-secondary-100 text-secondary-600;
}

.notification-type-icon--system {
  @apply bg-neutral-100 text-neutral-600;
}

.notification-content {
  @apply flex-1 min-w-0;
}

.notification-main {
  @apply mb-1;
}

.notification-title {
  @apply text-sm font-semibold text-neutral-900 mb-1;
}

.notification-message {
  @apply text-sm text-neutral-600 line-clamp-2;
}

.notification-meta {
  @apply flex items-center space-x-2 text-xs text-neutral-500;
}

.notification-time {
  @apply font-medium;
}

.notification-category {
  @apply px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full;
}

.notification-actions {
  @apply flex-shrink-0 flex items-start space-x-2;
}

.unread-indicator {
  @apply w-2 h-2 bg-primary-500 rounded-full mt-2;
}

.action-buttons {
  @apply flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.notification-item:hover .action-buttons {
  @apply opacity-100;
}

.action-button {
  @apply inline-flex items-center justify-center w-6 h-6 text-neutral-400 hover:text-neutral-600 rounded transition-colors;
}

.action-button--danger:hover {
  @apply text-error-600;
}

/* Load More */
.notification-load-more {
  @apply p-4 border-t border-neutral-200;
}

.load-more-button {
  @apply w-full inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Panel Footer */
.notification-footer {
  @apply p-4 border-t border-neutral-200 bg-neutral-50;
}

.view-all-button {
  @apply w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2 rounded-md hover:bg-primary-50 transition-colors;
}

/* Backdrop */
.notification-backdrop {
  @apply fixed inset-0 z-40;
}

/* Dark Theme */
.theme-dark .notification-panel {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .notification-header {
  @apply bg-neutral-900 border-neutral-700;
}

.theme-dark .header-title {
  @apply text-neutral-100;
}

.theme-dark .header-action-button {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .filter-button {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .filter-button--active {
  @apply text-primary-400 bg-primary-900;
}

.theme-dark .notification-item {
  @apply hover:bg-neutral-700;
}

.theme-dark .notification-item--unread {
  @apply bg-blue-900;
}

.theme-dark .notification-title {
  @apply text-neutral-100;
}

.theme-dark .notification-message {
  @apply text-neutral-300;
}

.theme-dark .notification-meta {
  @apply text-neutral-400;
}

.theme-dark .notification-category {
  @apply bg-neutral-700 text-neutral-300;
}

.theme-dark .skeleton-avatar,
.theme-dark .skeleton-line {
  @apply bg-neutral-700;
}

.theme-dark .load-more-button {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .notification-footer {
  @apply bg-neutral-900 border-neutral-700;
}

.theme-dark .view-all-button {
  @apply text-primary-400 hover:text-primary-300 hover:bg-primary-900;
}

/* Animations */
@keyframes notification-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes notification-ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .notification-panel {
    @apply w-screen max-w-sm;
  }
  
  .notification-panel--bottom-left,
  .notification-panel--bottom-right {
    @apply left-1/2 transform -translate-x-1/2;
  }
  
  .notification-panel--top-left,
  .notification-panel--top-right {
    @apply left-1/2 transform -translate-x-1/2;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .notification-badge--pulse,
  .notification-pulse {
    animation: none;
  }
  
  .notification-item {
    @apply transition-none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .notification-panel {
    @apply border-2 border-neutral-900;
  }
  
  .notification-item--unread {
    @apply border-l-4 border-blue-600;
  }
}
</style>