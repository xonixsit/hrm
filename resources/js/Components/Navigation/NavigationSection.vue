<template>
  <div v-if="hasAccessibleItems" class="navigation-section">
    <!-- Section header (if has label and is not collapsed) -->
    <div
      v-if="section.label && !isCollapsed"
      class="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
    >
      {{ section.label }}
    </div>
    
    <!-- Section items -->
    <div class="space-y-1">
      <NavigationItem
        v-for="item in accessibleItems"
        :key="item.id"
        :item="item"
        :current-route="currentRoute"
        :user-roles="userRoles"
        :is-collapsed="isCollapsed"
        @navigate="handleNavigate"
      />
    </div>
    
    <!-- Section divider (if not last section) -->
    <div
      v-if="!isLast && !isCollapsed"
      class="my-4 border-t border-neutral-200"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import NavigationItem from './NavigationItem.vue';

const props = defineProps({
  /**
   * Navigation section object
   */
  section: {
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
   * Whether the sidebar is collapsed
   */
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  
  /**
   * Whether this is the last section (affects divider display)
   */
  isLast: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate']);

// Computed properties
const accessibleItems = computed(() => {
  // Handle null or undefined userRoles
  if (!Array.isArray(props.userRoles) || props.userRoles.length === 0) {
    return [];
  }
  
  // If section has children, return filtered children
  if (props.section.children && props.section.children.length > 0) {
    return props.section.children.filter(child => {
      // Handle missing roles array
      if (!child.roles || !Array.isArray(child.roles)) {
        return true; // Allow access if no roles specified
      }
      return child.roles.some(role => props.userRoles.includes(role));
    });
  }
  
  // If section is a direct navigation item, return it as an array
  if (props.section.route) {
    // Handle missing roles array
    if (!props.section.roles || !Array.isArray(props.section.roles)) {
      return [props.section]; // Allow access if no roles specified
    }
    return props.section.roles.some(role => props.userRoles.includes(role)) 
      ? [props.section] 
      : [];
  }
  
  return [];
});

const hasAccessibleItems = computed(() => {
  return accessibleItems.value.length > 0;
});

// Methods
const handleNavigate = (navigationEvent) => {
  emit('navigate', navigationEvent);
};
</script>

<style scoped>
.navigation-section {
  /* Additional section-specific styles can be added here */
}
</style>