<template>
  <div class="quick-actions-widget">
    <div class="widget-header">
      <h3 class="widget-title">Quick Actions</h3>
    </div>
    
    <div class="actions-grid">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="action.handler"
        :class="getActionClasses(action.variant)"
        class="action-button"
      >
        <component :is="getActionIcon(action.icon)" class="w-5 h-5" />
        <span class="action-label">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  UserPlusIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline';

defineProps({
  actions: { type: Array, default: () => [] }
});

defineEmits(['action']);

const getActionIcon = (iconName) => {
  const iconMap = {
    'user-plus': UserPlusIcon,
    'chart-bar': ChartBarIcon,
    'building-office': BuildingOfficeIcon,
    'cloud-arrow-up': CloudArrowUpIcon
  };
  return iconMap[iconName] || UserPlusIcon;
};

const getActionClasses = (variant) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
  };
  return variantClasses[variant] || variantClasses.secondary;
};
</script>

<style scoped>
.quick-actions-widget {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-gray-200 p-6 space-y-4;
}

.widget-header {
  @apply flex items-center justify-between;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.actions-grid {
  @apply grid grid-cols-2 gap-3;
}

.action-button {
  @apply flex flex-col items-center space-y-2 p-4 rounded-lg font-medium text-sm transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

.action-label {
  @apply text-center;
}
</style>