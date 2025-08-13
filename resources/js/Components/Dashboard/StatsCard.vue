<template>
  <DashboardWidget
    :class="['stats-card', cardClass, { 'cursor-pointer hover:shadow-lg transition-shadow': clickable }]"
    :interactive="interactive"
    :loading="loading"
    padding="md"
    background="white"
    @click="handleClick"
  >
    <div class="stats-content">
      <!-- Icon -->
      <div v-if="icon" class="stats-icon">
        <div :class="iconContainerClasses">
          <component :is="icon" :class="iconClasses" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="stats-main">
        <!-- Value -->
        <div class="stats-value">
          <span :class="valueClasses">{{ formattedValue }}</span>
          <span v-if="unit" class="stats-unit">{{ unit }}</span>
        </div>

        <!-- Label -->
        <div class="stats-label">
          {{ label }}
        </div>

        <!-- Trend -->
        <div v-if="trend !== null" class="trend-inline">
          <component 
            :is="trendIcon" 
            :class="[
              'trend-icon',
              trend >= 0 ? 'text-success-600' : 'text-error-600'
            ]" 
          />
          <span 
            :class="[
              'trend-percentage',
              trend >= 0 ? 'text-success-600' : 'text-error-600'
            ]"
          >{{ Math.abs(trend) }}%</span>
          <span class="trend-label">{{ trendLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div v-if="$slots.default" class="stats-extra">
      <slot />
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import DashboardWidget from './DashboardWidget.vue';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  // Stats data
  value: {
    type: [Number, String],
    required: true
  },
  
  label: {
    type: String,
    required: true
  },
  
  unit: {
    type: String,
    default: ''
  },
  
  // Icon
  icon: {
    type: [String, Object],
    default: null
  },
  
  iconColor: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  
  // Trend data
  trend: {
    type: Number,
    default: null
  },
  
  trendLabel: {
    type: String,
    default: 'vs last month'
  },
  
  // Formatting
  format: {
    type: String,
    default: 'number',
    validator: (value) => ['number', 'currency', 'percentage'].includes(value)
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  interactive: {
    type: Boolean,
    default: false
  },
  
  // Styling
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'featured'].includes(value)
  },

  // Navigation
  route: {
    type: String,
    default: null
  },

  clickable: {
    type: Boolean,
    default: false
  }
});

// Format the value based on the format prop
const formattedValue = computed(() => {
  if (props.loading) return '---';
  
  const value = typeof props.value === 'string' ? parseFloat(props.value) : props.value;
  
  if (isNaN(value)) return props.value;
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    
    case 'percentage':
      return `${value}%`;
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
});

// Icon container classes
const iconContainerClasses = computed(() => {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-info-100 text-info-600'
  };
  
  return [
    'flex items-center justify-center',
    'w-12 h-12 rounded-lg',
    colorMap[props.iconColor]
  ];
});

// Icon classes
const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };
  return sizes[props.size];
});

// Value classes
const valueClasses = computed(() => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };
  
  return [
    'font-bold text-neutral-900',
    sizes[props.size]
  ];
});

// Trend icon based on positive/negative trend
const trendIcon = computed(() => {
  if (props.trend === null) return null;
  return props.trend >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
});



// Card classes based on variant
const cardClass = computed(() => {
  const variants = {
    default: '',
    compact: 'stats-card--compact',
    featured: 'stats-card--featured ring-2 ring-primary-500 ring-opacity-20'
  };
  return variants[props.variant];
});

// Click handler
const handleClick = () => {
  if (!props.clickable || props.loading) return;
  
  if (props.route) {
    router.visit(route(props.route));
  }
};
</script>

<style scoped>
.stats-card {
  /* Base stats card styling */
}

.stats-content {
  @apply flex items-start space-x-4;
}

.stats-icon {
  @apply flex-shrink-0;
}

.stats-main {
  @apply flex-1 min-w-0;
}

.stats-value {
  @apply flex items-baseline space-x-2 mb-1;
}

.stats-unit {
  @apply text-lg font-medium text-neutral-500;
}

.stats-label {
  @apply text-sm font-medium text-neutral-600 mb-2;
}

.trend-inline {
  @apply inline-flex items-center;
}

.trend-icon {
  @apply w-4 h-4 mr-1;
}

.trend-percentage {
  @apply text-sm font-medium mr-1;
}

.trend-label {
  @apply text-sm text-neutral-500;
}



.stats-extra {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

/* Compact variant */
.stats-card--compact .stats-content {
  @apply space-x-3;
}

.stats-card--compact .stats-value {
  @apply text-2xl;
}

/* Featured variant */
.stats-card--featured {
  @apply bg-gradient-to-br from-white to-primary-50;
}

/* Loading state */
.stats-card .stats-value {
  @apply transition-all duration-200;
}

.stats-card.loading .stats-value {
  @apply animate-pulse;
}
</style>