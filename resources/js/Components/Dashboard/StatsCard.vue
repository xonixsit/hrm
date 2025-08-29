<template>
  <div :class="cardClasses" class="stats-card">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="w-20 h-8 bg-gray-200 rounded mb-2"></div>
        <div class="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Content State -->
    <div v-else class="stats-content">
      <!-- Header with Icon and Trend -->
      <div class="stats-header">
        <div :class="iconClasses" class="stats-icon">
          <component :is="getIconComponent(icon)" class="w-5 h-5" />
        </div>
        <div v-if="trend !== undefined" :class="trendClasses" class="trend-indicator">
          <component :is="trendIcon" class="w-3 h-3" />
          <span class="trend-value">{{ Math.abs(trend) }}%</span>
        </div>
      </div>

      <!-- Main Value -->
      <div class="stats-value">
        <span class="value-number">{{ formattedValue }}</span>
        <span v-if="suffix" class="value-suffix">{{ suffix }}</span>
      </div>

      <!-- Label -->
      <div class="stats-label">
        {{ label }}
      </div>

      <!-- Urgent Indicator -->
      <div v-if="urgent" class="urgent-indicator">
        <ExclamationTriangleIcon class="w-4 h-4 text-red-500" />
        <span class="urgent-text">Requires Attention</span>
      </div>
    </div>

    <!-- Click Overlay for Navigation -->
    <div v-if="clickable" class="click-overlay" @click="handleClick">
      <ArrowTopRightOnSquareIcon class="w-4 h-4" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  FolderOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'success', 'warning', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  trend: {
    type: Number,
    default: undefined
  },
  loading: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  route: {
    type: String,
    default: null
  },
  urgent: {
    type: Boolean,
    default: false
  },
  suffix: {
    type: String,
    default: null
  }
});

// Icon mapping
const getIconComponent = (iconName) => {
  const iconMap = {
    'users': UsersIcon,
    'building': BuildingOfficeIcon,
    'calendar': CalendarDaysIcon,
    'folder': FolderOpenIcon,
    'clock': ClockIcon,
    'check-circle': CheckCircleIcon,
    'chart-bar': ChartBarIcon
  };
  return iconMap[iconName] || UsersIcon;
};

// Computed styles
const cardClasses = computed(() => {
  const baseClasses = 'relative overflow-hidden transition-all duration-200';
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6'
  };
  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md',
    primary: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm hover:shadow-md',
    secondary: 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm hover:shadow-md',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md',
    info: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl shadow-sm hover:shadow-md'
  };
  
  let classes = `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`;
  
  if (props.clickable) {
    classes += ' cursor-pointer hover:scale-105';
  }
  
  if (props.urgent) {
    classes += ' ring-2 ring-red-200 ring-opacity-50';
  }
  
  return classes;
});

const iconClasses = computed(() => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-indigo-100 text-indigo-600'
  };
  
  return `inline-flex items-center justify-center w-10 h-10 rounded-lg ${variantClasses[props.variant]}`;
});

const trendClasses = computed(() => {
  const isPositive = props.trend > 0;
  return `inline-flex items-center space-x-1 text-xs font-medium ${
    isPositive ? 'text-green-600' : 'text-red-600'
  }`;
});

const trendIcon = computed(() => {
  return props.trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});

// Event handlers
const handleClick = () => {
  if (props.route) {
    router.visit(route(props.route));
  }
};
</script>

<style scoped>
.stats-card {
  min-height: 120px;
}

.stats-header {
  @apply flex items-center justify-between mb-4;
}

.stats-value {
  @apply flex items-baseline space-x-1 mb-2;
}

.value-number {
  @apply text-2xl font-bold text-gray-900;
}

.value-suffix {
  @apply text-sm font-medium text-gray-500;
}

.stats-label {
  @apply text-sm font-medium text-gray-600;
}

.urgent-indicator {
  @apply flex items-center space-x-1 mt-3 text-xs font-medium text-red-600;
}

.urgent-text {
  @apply text-red-600;
}

.click-overlay {
  @apply absolute top-3 right-3 opacity-0 transition-opacity duration-200;
  @apply flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm;
}

.stats-card:hover .click-overlay {
  @apply opacity-100;
}

.loading-state {
  @apply w-full h-full min-h-[120px] flex items-center justify-center;
}

/* Size variations */
.stats-card.large .value-number {
  @apply text-3xl;
}

.stats-card.small .value-number {
  @apply text-xl;
}

.stats-card.small .stats-header {
  @apply mb-3;
}

.stats-card.small .stats-icon {
  @apply w-8 h-8;
}
</style>