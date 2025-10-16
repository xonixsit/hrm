<template>
  <!-- Unified Stats Card with Consistent Design Language -->
  <div :class="[
    'group relative transition-all duration-300 cursor-pointer',
    // Consistent base styling
    isDark 
      ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
      : 'bg-white/80 backdrop-blur-sm border border-gray-200/60',
    
    // Unified shadow system
    'shadow-lg hover:shadow-xl',
    isDark ? 'shadow-gray-900/20 hover:shadow-gray-900/30' : 'shadow-gray-900/10 hover:shadow-gray-900/15',
    
    // Consistent border radius
    'rounded-2xl',
    
    // Hover effects
    'hover:scale-[1.02] hover:border-opacity-80',
    isDark 
      ? 'hover:bg-gray-700/60 hover:border-gray-600/60' 
      : 'hover:bg-white/90 hover:border-gray-300/60',
    
    // Padding
    'p-6'
  ]"
  @click="handleClick"
  :role="clickable ? 'button' : undefined"
  :tabindex="clickable ? '0' : undefined"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  <!-- Header Section -->
  <div class="flex items-center justify-between mb-4">
    <!-- Icon -->
    <div :class="[
      'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
      // Variant-based styling
      variant === 'primary' && (isDark 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'),
      variant === 'success' && (isDark 
        ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
        : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'),
      variant === 'warning' && (isDark 
        ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' 
        : 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'),
      variant === 'info' && (isDark 
        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
        : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'),
      variant === 'neutral' && (isDark 
        ? 'bg-gray-700/50 text-gray-300 border border-gray-600/50' 
        : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25')
    ]">
      <component :is="icon" class="w-6 h-6" />
    </div>
    
    <!-- Value Section -->
    <div class="text-right">
      <div :class="[
        'text-2xl font-bold transition-colors duration-200',
        isDark ? 'text-white' : 'text-gray-900'
      ]">
        {{ loading ? '...' : formattedValue }}
      </div>
      <div :class="[
        'text-xs font-medium transition-colors duration-200',
        isDark ? 'text-gray-400' : 'text-gray-500'
      ]">
        {{ label }}
      </div>
    </div>
  </div>

  <!-- Bottom Section -->
  <div class="flex items-center justify-between">
    <!-- Description -->
    <span :class="[
      'text-sm font-medium transition-colors duration-200',
      isDark ? 'text-gray-300' : 'text-gray-600'
    ]">
      {{ description }}
    </span>
    
    <!-- Trend Indicator -->
    <div v-if="trend !== null && !loading" class="flex items-center space-x-1">
      <!-- Trend Icon -->
      <svg 
        v-if="trend > 0" 
        class="w-4 h-4 text-green-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <svg 
        v-else-if="trend < 0" 
        class="w-4 h-4 text-red-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
      <svg 
        v-else 
        class="w-4 h-4 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
      
      <!-- Trend Value -->
      <span :class="[
        'text-sm font-medium',
        trend > 0 && 'text-green-600',
        trend < 0 && 'text-red-600',
        trend === 0 && 'text-gray-500'
      ]">
        {{ trend > 0 ? '+' : '' }}{{ trend }}{{ trendSuffix }}
      </span>
    </div>
    
    <!-- Status Badge -->
    <div v-else-if="status && !loading" :class="[
      'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
      status === 'excellent' && (isDark 
        ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
        : 'bg-green-50 text-green-700 border border-green-200'),
      status === 'good' && (isDark 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
        : 'bg-blue-50 text-blue-700 border border-blue-200'),
      status === 'warning' && (isDark 
        ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' 
        : 'bg-orange-50 text-orange-700 border border-orange-200'),
      status === 'critical' && (isDark 
        ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
        : 'bg-red-50 text-red-700 border border-red-200')
    ]">
      <div :class="[
        'w-1.5 h-1.5 rounded-full',
        status === 'excellent' && 'bg-green-400',
        status === 'good' && 'bg-blue-400',
        status === 'warning' && 'bg-orange-400',
        status === 'critical' && 'bg-red-400'
      ]"></div>
      <span>{{ statusText || status }}</span>
    </div>
  </div>

  <!-- Loading Overlay -->
  <div v-if="loading" :class="[
    'absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-200',
    isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
  ]">
    <div class="flex items-center space-x-3">
      <div :class="[
        'animate-spin rounded-full w-5 h-5 border-2 border-t-transparent',
        isDark ? 'border-gray-400' : 'border-gray-600'
      ]"></div>
      <span :class="[
        'text-sm font-medium',
        isDark ? 'text-gray-300' : 'text-gray-600'
      ]">
        Loading...
      </span>
    </div>
  </div>

  <!-- Urgent Indicator -->
  <div v-if="urgent && !loading" class="absolute -top-2 -right-2">
    <div class="relative">
      <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      <div class="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    required: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'info', 'neutral'].includes(value)
  },
  trend: {
    type: Number,
    default: null
  },
  trendSuffix: {
    type: String,
    default: '%'
  },
  status: {
    type: String,
    default: null,
    validator: (value) => ['excellent', 'good', 'warning', 'critical'].includes(value)
  },
  statusText: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  },
  route: {
    type: String,
    default: null
  },
  urgent: {
    type: Boolean,
    default: false
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const { isDark } = useTheme()

const formattedValue = computed(() => {
  if (props.loading) return '...'
  
  let value = props.value
  
  // Format numbers with commas
  if (typeof value === 'number') {
    value = value.toLocaleString()
  }
  
  return `${props.prefix}${value}${props.suffix}`
})

const handleClick = () => {
  if (!props.clickable || props.loading) return
  
  if (props.route) {
    router.visit(route(props.route))
  }
  
  emit('click')
}
</script>