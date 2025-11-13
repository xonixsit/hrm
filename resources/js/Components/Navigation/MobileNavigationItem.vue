<template>
  <div class="mobile-navigation-item">
    <Link
      v-if="item.route"
      :href="route(item.route)"
      class="nav-link flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation"
      :class="[
        isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-l-4 border-primary-500 dark:border-primary-400' 
          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
        isChild ? 'text-sm' : 'text-base'
      ]"
      style="min-height: 44px;"
      @click="handleClick"
      :aria-label="`Navigate to ${item.label}`"
    >
      <Icon
        :name="item.icon"
        :size="isChild ? 'sm' : 'md'"
        class="flex-shrink-0 mr-3"
        :class="isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'"
      />
      <span class="flex-1">{{ item.label }}</span>
      
      <!-- Badge for notifications or counts -->
      <span
        v-if="item.badge"
        class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
        :class="getBadgeClasses(item.badge.type)"
      >
        {{ item.badge.count }}
      </span>
      
      <!-- External link indicator -->
      <Icon
        v-if="item.external"
        name="external-link"
        size="sm"
        class="ml-2 text-neutral-400 dark:text-neutral-500"
      />
    </Link>
    
    <!-- Non-link item (for sections without direct routes) -->
    <div
      v-else
      class="nav-item flex items-center px-3 py-3 text-sm font-medium text-neutral-500 dark:text-neutral-400"
      :class="isChild ? 'text-sm' : 'text-base'"
      style="min-height: 44px;"
    >
      <Icon
        :name="item.icon"
        :size="isChild ? 'sm' : 'md'"
        class="flex-shrink-0 text-neutral-400 dark:text-neutral-500 mr-3"
      />
      <span class="flex-1">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  currentRoute: {
    type: String,
    required: true,
  },
  userRoles: {
    type: Array,
    default: () => [],
  },
  isChild: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate']);

// Computed properties
const isActive = computed(() => {
  if (!props.item.route) return false;
  
  // Handle exact route matching
  if (props.item.exact) {
    return props.currentRoute === props.item.route;
  }
  
  // Handle route prefix matching
  const routePrefix = props.item.route.split('.')[0];
  return props.currentRoute.startsWith(routePrefix);
});

const hasPermission = computed(() => {
  if (!props.item.roles || props.item.roles.length === 0) return true;
  return props.item.roles.some(role => props.userRoles.includes(role));
});

// Methods
const getBadgeClasses = (type) => {
  const baseClasses = 'inline-flex items-center justify-center';
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'warning':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'error':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'info':
      return `${baseClasses} bg-teal-100 text-teal-800`;
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`;
  }
};

const handleClick = (event) => {
  // Emit navigation event
  emit('navigate', {
    item: props.item,
    route: props.item.route,
    event
  });
  
  // Add haptic feedback on supported devices
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};
</script>

<style scoped>
/* Touch-friendly sizing */
.touch-manipulation {
  touch-action: manipulation;
}

/* Active state styling */
.nav-link.bg-primary-50 {
  position: relative;
}

.nav-link.bg-primary-50::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: theme('colors.primary.500');
  border-radius: 0 2px 2px 0;
}

/* Hover effects */
.nav-link:hover {
  transform: translateX(2px);
}

.nav-link:active {
  transform: translateX(1px);
  transition-duration: 0.1s;
}

/* Focus styles for accessibility */
.nav-link:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Badge animations */
.badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive adjustments */
@media (max-width: 320px) {
  .nav-link {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .nav-link span {
    font-size: 0.875rem;
  }
}
</style>