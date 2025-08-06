<template>
  <DashboardWidget
    :title="title"
    :loading="loading"
    class="quick-actions"
    padding="md"
  >
    <template #actions>
      <slot name="actions" />
    </template>

    <!-- Actions Grid -->
    <div class="actions-grid">
      <button
        v-for="action in displayedActions"
        :key="action.id || action.label"
        @click="handleAction(action)"
        :disabled="action.disabled || loading"
        :class="getActionClasses(action)"
        class="action-item"
      >
        <!-- Icon -->
        <div class="action-icon">
          <component 
            v-if="action.icon" 
            :is="action.icon" 
            :class="getIconClasses(action)"
          />
        </div>

        <!-- Content -->
        <div class="action-content">
          <h4 class="action-label">{{ action.label }}</h4>
          <p v-if="action.description" class="action-description">
            {{ action.description }}
          </p>
          <span v-if="action.badge" :class="getBadgeClasses(action.badge)">
            {{ action.badge.text }}
          </span>
        </div>

        <!-- Arrow Icon -->
        <div class="action-arrow">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Show More/Less Toggle -->
    <div v-if="actions.length > maxVisible" class="actions-footer">
      <button
        @click="toggleShowAll"
        class="toggle-button"
      >
        {{ showAll ? 'Show Less' : `Show ${actions.length - maxVisible} More` }}
        <svg 
          :class="['w-4 h-4 transition-transform', { 'rotate-180': showAll }]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed, ref } from 'vue';
import DashboardWidget from './DashboardWidget.vue';

const props = defineProps({
  // Actions data
  actions: {
    type: Array,
    default: () => []
  },
  
  title: {
    type: String,
    default: 'Quick Actions'
  },
  
  // Display options
  maxVisible: {
    type: Number,
    default: 6
  },
  
  layout: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['action']);

// Local state
const showAll = ref(false);

// Computed properties
const displayedActions = computed(() => {
  if (showAll.value || props.actions.length <= props.maxVisible) {
    return props.actions;
  }
  return props.actions.slice(0, props.maxVisible);
});

// Methods
const handleAction = (action) => {
  if (action.disabled) return;
  
  emit('action', action);
  
  // Handle built-in actions
  if (action.href) {
    if (action.external) {
      window.open(action.href, '_blank');
    } else {
      window.location.href = action.href;
    }
  }
  
  if (action.route) {
    // Assuming Inertia.js routing
    if (window.route) {
      window.location.href = window.route(action.route, action.params || {});
    }
  }
};

const toggleShowAll = () => {
  showAll.value = !showAll.value;
};

const getActionClasses = (action) => {
  const baseClasses = [
    'group relative flex items-center p-4 rounded-xl border transition-all duration-200',
    'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  ];
  
  if (action.disabled) {
    baseClasses.push('opacity-50 cursor-not-allowed');
  } else {
    baseClasses.push('cursor-pointer hover:border-primary-200 hover:bg-primary-50');
  }
  
  // Variant styles
  const variants = {
    primary: 'border-primary-200 bg-primary-50 text-primary-900',
    secondary: 'border-neutral-200 bg-white text-neutral-900',
    success: 'border-success-200 bg-success-50 text-success-900',
    warning: 'border-warning-200 bg-warning-50 text-warning-900',
    error: 'border-error-200 bg-error-50 text-error-900',
    default: 'border-neutral-200 bg-white text-neutral-900'
  };
  
  const variant = action.variant || 'default';
  baseClasses.push(variants[variant]);
  
  return baseClasses;
};

const getIconClasses = (action) => {
  const baseClasses = 'w-6 h-6';
  
  const variants = {
    primary: 'text-primary-600',
    secondary: 'text-neutral-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    default: 'text-neutral-600'
  };
  
  const variant = action.variant || 'default';
  return `${baseClasses} ${variants[variant]}`;
};

const getBadgeClasses = (badge) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-neutral-100 text-neutral-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800',
    default: 'bg-neutral-100 text-neutral-800'
  };
  
  const variant = badge.variant || 'default';
  return `${baseClasses} ${variants[variant]}`;
};
</script>

<style scoped>
.quick-actions {
  /* Base quick actions styling */
}

.actions-grid {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.action-item {
  @apply w-full text-left;
}

.action-icon {
  @apply flex-shrink-0 mr-4;
}

.action-content {
  @apply flex-1 min-w-0;
}

.action-label {
  @apply text-sm font-semibold mb-1;
}

.action-description {
  @apply text-xs text-current opacity-75 mb-2;
}

.action-arrow {
  @apply flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity;
}

.actions-footer {
  @apply mt-4 pt-4 border-t border-neutral-200 text-center;
}

.toggle-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* List layout variant */
.quick-actions.layout-list .actions-grid {
  @apply grid-cols-1;
}

.quick-actions.layout-list .action-item {
  @apply flex items-center;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .actions-grid {
    @apply grid-cols-1;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>