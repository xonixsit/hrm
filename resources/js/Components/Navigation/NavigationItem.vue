<template>
  <div class="navigation-item">
    <!-- Main navigation item -->
    <component
      :is="linkComponent"
      :href="computedHref"
      :class="[
        'navigation-item-link',
        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        {
          'bg-primary-50 text-primary-700 border-r-2 border-primary-500': isActive,
          'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900': !isActive,
          'cursor-not-allowed opacity-50': !hasPermission,
          'pl-6': isChild,
          'pl-3': !isChild
        }
      ]"
      @click="handleClick"
    >
      <!-- Icon -->
      <Icon
        v-if="item.icon"
        :name="item.icon"
        :size="iconSize"
        :class="[
          'flex-shrink-0 mr-3 transition-colors duration-200',
          {
            'text-primary-500': isActive,
            'text-neutral-400 group-hover:text-neutral-500': !isActive
          }
        ]"
      />
      
      <!-- Label -->
      <span class="flex-1 truncate">{{ item.label }}</span>
      
      <!-- Chevron for expandable items -->
      <Icon
        v-if="hasChildren && !isChild"
        name="chevron-right"
        size="sm"
        :class="[
          'flex-shrink-0 ml-2 transition-transform duration-200',
          {
            'rotate-90': isExpanded,
            'text-primary-500': isActive,
            'text-neutral-400 group-hover:text-neutral-500': !isActive
          }
        ]"
      />
      
      <!-- Badge for notifications or counts -->
      <span
        v-if="item.badge"
        :class="[
          'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
          badgeClasses
        ]"
      >
        {{ item.badge }}
      </span>
    </component>
    
    <!-- Children items (collapsible) -->
    <Transition
      name="navigation-children"
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="hasChildren && isExpanded && !isChild"
        class="mt-1 space-y-1 overflow-hidden"
      >
        <NavigationItem
          v-for="child in accessibleChildren"
          :key="child.id"
          :item="child"
          :current-route="currentRoute"
          :user-roles="userRoles"
          :is-child="true"
          @navigate="$emit('navigate', $event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import Icon from '@/Components/Base/Icon.vue';
// Remove unused import since we're not using usePermissions in this component
// import { usePermissions } from '@/composables/usePermissions.js';
import { isNavigationItemActive } from '@/config/navigation.js';

const props = defineProps({
  /**
   * Navigation item object
   */
  item: {
    type: Object,
    required: true,
  },
  
  /**
   * Current route name for active state detection
   */
  currentRoute: {
    type: String,
    required: true,
  },
  
  /**
   * User roles for permission checking
   */
  userRoles: {
    type: Array,
    default: () => [],
  },
  
  /**
   * Whether this is a child item (affects styling)
   */
  isChild: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Whether the parent section is collapsed
   */
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate']);

// Composables - removed usePermissions since we're handling permissions directly

// Local state for expansion
const isExpanded = ref(false);

// Computed properties
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

const accessibleChildren = computed(() => {
  if (!hasChildren.value) return [];
  
  return props.item.children.filter(child => {
    // Handle missing roles array
    if (!child.roles || !Array.isArray(child.roles)) {
      return true; // Allow access if no roles specified
    }
    return child.roles.some(role => props.userRoles.includes(role));
  });
});

const hasPermission = computed(() => {
  // Handle missing or empty roles array - allow access if no roles specified
  if (!props.item.roles || !Array.isArray(props.item.roles) || props.item.roles.length === 0) {
    return true;
  }
  
  // Handle missing or empty userRoles array
  if (!Array.isArray(props.userRoles) || props.userRoles.length === 0) {
    return false;
  }
  
  return props.item.roles.some(role => props.userRoles.includes(role));
});

const isActive = computed(() => {
  return isNavigationItemActive(props.item, props.currentRoute);
});

const linkComponent = computed(() => {
  // Use Link component for routes, div for non-clickable items
  return (props.item.route && hasPermission.value) ? Link : 'div';
});

const computedHref = computed(() => {
  if (!props.item.route || !hasPermission.value) return undefined;
  
  // Handle route generation - check if Laravel route() helper is available
  try {
    // Check if route function is available globally
    if (typeof window !== 'undefined' && window.route) {
      return window.route(props.item.route);
    } else {
      // Fallback to direct path conversion
      return `/${props.item.route.replace('.', '/')}`;
    }
  } catch (error) {
    console.warn(`Route "${props.item.route}" not found:`, error);
    // Fallback to direct path conversion
    return `/${props.item.route.replace('.', '/')}`;
  }
});

const iconSize = computed(() => {
  return props.isChild ? 'sm' : 'md';
});

const badgeClasses = computed(() => {
  if (!props.item.badge) return '';
  
  const type = props.item.badgeType || 'neutral';
  const classMap = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    neutral: 'bg-neutral-100 text-neutral-700',
  };
  
  return classMap[type] || classMap.neutral;
});

// Methods
const handleClick = (event) => {
  if (!hasPermission.value) {
    event.preventDefault();
    return;
  }
  
  // If item has children and no direct route, toggle expansion
  if (hasChildren.value && !props.item.route) {
    event.preventDefault();
    isExpanded.value = !isExpanded.value;
    return;
  }
  
  // If item has both children and route, expand children but allow navigation
  if (hasChildren.value && props.item.route) {
    isExpanded.value = true;
  }
  
  // Emit navigation event for parent components
  emit('navigate', {
    item: props.item,
    route: props.item.route,
    event
  });
};

// Auto-expand if child is active
if (hasChildren.value && accessibleChildren.value.some(child => 
  isNavigationItemActive(child, props.currentRoute)
)) {
  isExpanded.value = true;
}
</script>

<style scoped>
.navigation-item-link {
  position: relative;
}

.navigation-item-link:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: -2px;
}

/* Smooth transitions for children */
.navigation-children-enter-active,
.navigation-children-leave-active {
  overflow: hidden;
}

.navigation-children-enter-from,
.navigation-children-leave-to {
  max-height: 0;
  opacity: 0;
}

.navigation-children-enter-to,
.navigation-children-leave-from {
  max-height: 24rem; /* max-h-96 */
  opacity: 1;
}
</style>