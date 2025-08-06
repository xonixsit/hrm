<template>
  <div class="mobile-navigation-section">
    <!-- Section Header (if has children) -->
    <div v-if="section.children && section.children.length > 0" class="section-header">
      <button
        @click="toggleSection"
        class="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200 touch-manipulation"
        style="min-height: 44px;"
        :aria-expanded="isExpanded"
        :aria-label="`Toggle ${section.label} section`"
      >
        <div class="flex items-center">
          <Icon
            :name="section.icon"
            size="md"
            class="flex-shrink-0 text-neutral-400 dark:text-neutral-500 mr-3"
          />
          <span>{{ section.label }}</span>
        </div>
        <Icon
          name="chevron-down"
          size="sm"
          class="text-neutral-400 dark:text-neutral-500 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
        />
      </button>
    </div>
    
    <!-- Direct Navigation Item (if no children) -->
    <MobileNavigationItem
      v-if="!section.children || section.children.length === 0"
      :item="section"
      :current-route="currentRoute"
      :user-roles="userRoles"
      @navigate="handleNavigate"
    />
    
    <!-- Section Children -->
    <Transition
      name="section-expand"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="section.children && section.children.length > 0 && isExpanded"
        class="section-children overflow-hidden"
      >
        <div class="ml-6 mt-2 space-y-1">
          <MobileNavigationItem
            v-for="child in filteredChildren"
            :key="child.id"
            :item="child"
            :current-route="currentRoute"
            :user-roles="userRoles"
            :is-child="true"
            @navigate="handleNavigate"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Icon from '@/Components/Base/Icon.vue';
import MobileNavigationItem from './MobileNavigationItem.vue';

const props = defineProps({
  section: {
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
});

const emit = defineEmits(['navigate']);

// Local state
const isExpanded = ref(false);

// Computed properties
const filteredChildren = computed(() => {
  if (!props.section.children) return [];
  
  return props.section.children.filter(child => {
    if (!child.roles || child.roles.length === 0) return true;
    return child.roles.some(role => props.userRoles.includes(role));
  });
});

const hasActiveChild = computed(() => {
  return filteredChildren.value.some(child => {
    if (child.route) {
      return props.currentRoute.startsWith(child.route.split('.')[0]);
    }
    return false;
  });
});

// Methods
const toggleSection = () => {
  isExpanded.value = !isExpanded.value;
  
  // Store expansion state
  const storageKey = `mobile-nav-section-${props.section.id}`;
  localStorage.setItem(storageKey, isExpanded.value.toString());
};

const handleNavigate = (navigationEvent) => {
  emit('navigate', navigationEvent);
};

// Initialize expansion state
onMounted(() => {
  // Auto-expand if has active child
  if (hasActiveChild.value) {
    isExpanded.value = true;
  } else {
    // Load saved expansion state
    const storageKey = `mobile-nav-section-${props.section.id}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      isExpanded.value = savedState === 'true';
    }
  }
});
</script>

<style scoped>
/* Section expansion animation */
.section-expand-enter-active,
.section-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.section-expand-enter-from,
.section-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.section-expand-enter-to,
.section-expand-leave-from {
  max-height: 384px; /* max-h-96 */
  opacity: 1;
  transform: translateY(0);
}

/* Touch-friendly sizing */
.touch-manipulation {
  touch-action: manipulation;
}

/* Chevron rotation */
.rotate-180 {
  transform: rotate(180deg);
}
</style>