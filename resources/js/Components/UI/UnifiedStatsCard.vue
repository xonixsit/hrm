<!-- Unified Stats Card with Consistent Design Language -->
<template>
  <div :class="[
      'group relative transition-all duration-300',
      clickable && 'cursor-pointer',
      // Background and border
      isDark
        ? 'bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm'
        : 'bg-white border border-gray-100 shadow-sm backdrop-blur-sm',
      // Shadow
      'hover:shadow-md hover:-translate-y-0.5',
      // Border radius and padding
      'rounded-2xl p-5 sm:p-6',
    ]" @click="handleClick" :role="clickable ? 'button' : undefined" :tabindex="clickable ? '0' : undefined"
    @keydown.enter="handleClick" @keydown.space.prevent="handleClick">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <!-- Icon -->
      <div :class="[
          'flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 shadow-sm',
          variant === 'primary' && (isDark ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-500 text-white shadow-teal-100'),
          variant === 'success' && (isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-500 text-white shadow-green-100'),
          variant === 'warning' && (isDark ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-500 text-white shadow-orange-100'),
          variant === 'info' && (isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-500 text-white shadow-purple-100'),
          variant === 'neutral' && (isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-500 text-white shadow-gray-100'),
        ]">
        <component :is="icon" class="w-6 h-6" />
      </div>

      <!-- Status or Trend -->
      <div v-if="trend !== null && !loading" class="flex items-center space-x-1">
        <svg v-if="trend > 0" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg v-else-if="trend < 0" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <span :class="[
            'text-sm font-medium',
            trend > 0 && 'text-green-600',
            trend < 0 && 'text-red-600',
            trend === 0 && 'text-gray-500',
          ]">
          {{ trend > 0 ? '+' : '' }}{{ trend }}{{ trendSuffix }}
        </span>
      </div>

      <div v-else-if="status && !loading" :class="[
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          status === 'excellent' && (isDark
            ? 'bg-green-600/20 text-green-400'
            : 'bg-green-50 text-green-700 border border-green-100'),
          status === 'good' && (isDark
            ? 'bg-teal-600/20 text-teal-400'
            : 'bg-teal-50 text-teal-700 border border-teal-100'),
          status === 'warning' && (isDark
            ? 'bg-orange-600/20 text-orange-400'
            : 'bg-orange-50 text-orange-700 border border-orange-100'),
          status === 'critical' && (isDark
            ? 'bg-red-600/20 text-red-400'
            : 'bg-red-50 text-red-700 border border-red-100'),
        ]">
        <span :class="[
            'w-1.5 h-1.5 rounded-full',
            status === 'excellent' && 'bg-green-500',
            status === 'good' && 'bg-teal-500',
            status === 'warning' && 'bg-orange-500',
            status === 'critical' && 'bg-red-500',
          ]"></span>
        <span>{{ statusText || status }}</span>
      </div>
    </div>

    <!-- Main Value -->
    <div class="space-y-1 mb-3">
      <div :class="[
          'text-3xl font-semibold tracking-tight transition-colors duration-200',
          isDark ? 'text-white' : 'text-gray-900',
          variant === 'success' && !isDark && 'text-green-600',
          variant === 'warning' && !isDark && 'text-orange-600',
        ]">
        {{ loading ? '...' : formattedValue }}
      </div>
      <div :class="[
          'text-sm font-medium transition-colors duration-200',
          isDark ? 'text-gray-400' : 'text-gray-600',
        ]">
        {{ label }}
      </div>
    </div>

    <!-- Description -->
    <div v-if="description" :class="[
        'text-sm leading-relaxed transition-colors duration-200',
        isDark ? 'text-gray-500' : 'text-gray-500',
      ]">
      {{ description }}
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" :class="[
        'absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm',
        isDark ? 'bg-gray-800/80' : 'bg-white/80',
      ]">
      <div class="flex items-center gap-2">
        <div :class="[
            'animate-spin rounded-full w-5 h-5 border-2 border-t-transparent',
            isDark ? 'border-gray-400' : 'border-gray-600',
          ]"></div>
        <span :class="[
            'text-sm font-medium',
            isDark ? 'text-gray-300' : 'text-gray-600',
          ]">
          Loading...
        </span>
      </div>
    </div>

    <!-- Urgent Indicator -->
    <div v-if="urgent && !loading" class="absolute z-20 -top-2 -right-2">
      <div class="relative">
        <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <div class="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
      </div>
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